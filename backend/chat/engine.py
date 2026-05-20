"""
Full conversation pipeline.
Orchestrates: safety → embed → sentiment → memory → context → LLM → store.
"""
import json
import os
from typing import Any, AsyncGenerator, Dict, List, Optional

import asyncpg
import httpx

from backend.embeddings.pipeline import embed_text
from backend.memory.retriever import retrieve_memories, retrieve_resources
from backend.memory.store import get_or_create_conversation, store_message
from backend.rag.context_assembler import assemble_context
from backend.safety.detector import CRISIS_RESPONSE, assess_safety
from backend.sentiment.detector import detect_emotion
from backend.chat.prompt_builder import build_prompt


# ── LLM client ───────────────────────────────────────────────────────────────

class LLMClient:
    """Unified interface for Gemini and Ollama."""

    def __init__(self) -> None:
        self.gemini_key = os.environ.get("GEMINI_API_KEY", "")
        self.ollama_url = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
        self.ollama_model = os.environ.get("OLLAMA_MODEL", "llama3")
        self._gemini_model = None

    def _get_gemini(self):
        if self._gemini_model is None:
            import google.generativeai as genai  # type: ignore
            genai.configure(api_key=self.gemini_key)
            self._gemini_model = genai.GenerativeModel("gemini-1.5-flash")
        return self._gemini_model

    def _use_gemini(self) -> bool:
        return bool(self.gemini_key and self.gemini_key != "your-gemini-key-here")

    async def generate(self, prompt: str) -> str:
        if self._use_gemini():
            model = self._get_gemini()
            # google-generativeai is synchronous — run in thread pool
            import asyncio
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None, lambda: model.generate_content(prompt)
            )
            return response.text
        else:
            return await self._ollama_generate(prompt)

    async def stream(self, prompt: str) -> AsyncGenerator[str, None]:
        if self._use_gemini():
            async for chunk in self._gemini_stream(prompt):
                yield chunk
        else:
            async for chunk in self._ollama_stream(prompt):
                yield chunk

    async def _gemini_stream(self, prompt: str) -> AsyncGenerator[str, None]:
        import asyncio
        model = self._get_gemini()
        loop = asyncio.get_event_loop()

        def _sync_stream():
            return list(model.generate_content(prompt, stream=True))

        chunks = await loop.run_in_executor(None, _sync_stream)
        for chunk in chunks:
            if hasattr(chunk, "text") and chunk.text:
                yield chunk.text

    async def _ollama_generate(self, prompt: str) -> str:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                f"{self.ollama_url}/api/generate",
                json={"model": self.ollama_model, "prompt": prompt, "stream": False},
            )
            resp.raise_for_status()
            return resp.json()["response"]

    async def _ollama_stream(self, prompt: str) -> AsyncGenerator[str, None]:
        async with httpx.AsyncClient(timeout=60.0) as client:
            async with client.stream(
                "POST",
                f"{self.ollama_url}/api/generate",
                json={"model": self.ollama_model, "prompt": prompt, "stream": True},
            ) as resp:
                async for line in resp.aiter_lines():
                    if line:
                        try:
                            data = json.loads(line)
                            if "response" in data and data["response"]:
                                yield data["response"]
                        except json.JSONDecodeError:
                            continue


_llm = LLMClient()


# ── Pipeline ──────────────────────────────────────────────────────────────────

async def process_message(
    user_id: str,
    message: str,
    conversation_id: Optional[str],
    conn: asyncpg.Connection,
) -> Dict[str, Any]:
    """
    Full pipeline:
    1. Safety check
    2. Embed message
    3. Detect emotion
    4. Retrieve memories + resources
    5. Assemble context
    6. Call LLM
    7. Store user + assistant messages
    8. Return response payload
    """
    # 1. Safety check (fastest path — no DB or model needed)
    safety = assess_safety(message)
    if safety["level"] == "crisis":
        conv_id = await get_or_create_conversation(conn, user_id, conversation_id)
        emotion = {"emotion": "fear", "confidence": 0.9, "intensity": 0.9, "all_scores": {}}
        await _store_pair(conn, conv_id, user_id, message, CRISIS_RESPONSE, emotion)
        return {
            "response": CRISIS_RESPONSE,
            "conversation_id": conv_id,
            "emotion": emotion,
            "safety_level": "crisis",
            "memories_used": 0,
        }

    # 2. Embed
    query_embedding = embed_text(message)

    # 3. Emotion detection
    emotion = detect_emotion(message)

    # 4. Retrieve memories + resources
    memories = await retrieve_memories(conn, user_id, query_embedding, top_k=5)

    resources: List[Dict] = []
    if safety["level"] == "warning":
        resources = await retrieve_resources(conn, query_embedding, top_k=2)

    # 5. Get/create conversation + recent history
    conv_id = await get_or_create_conversation(conn, user_id, conversation_id)
    history = await _get_recent_history(conn, conv_id, limit=8)

    # 6. Assemble context
    context = assemble_context(memories, resources, emotion, history, safety["level"])

    # 7. Build prompt + call LLM
    prompt = build_prompt(
        message=message,
        emotion=emotion,
        memories=context["memories"],
        conversation_history=context["conversation_history"],
        safety_level=safety["level"],
    )
    response_text = await _llm.generate(prompt)

    # 8. Store both turns
    await _store_pair(conn, conv_id, user_id, message, response_text, emotion)

    return {
        "response": response_text,
        "conversation_id": conv_id,
        "emotion": emotion,
        "safety_level": safety["level"],
        "memories_used": len(context["memories"]),
    }


async def stream_message(
    user_id: str,
    message: str,
    conversation_id: Optional[str],
    conn: asyncpg.Connection,
) -> AsyncGenerator[str, None]:
    """
    SSE streaming variant.
    Yields JSON-encoded SSE events: {"type": "token"|"done"|"meta", ...}
    """
    safety = assess_safety(message)
    if safety["level"] == "crisis":
        conv_id = await get_or_create_conversation(conn, user_id, conversation_id)
        emotion = {"emotion": "fear", "confidence": 0.9, "intensity": 0.9, "all_scores": {}}
        await _store_pair(conn, conv_id, user_id, message, CRISIS_RESPONSE, emotion)
        yield json.dumps({"type": "token", "text": CRISIS_RESPONSE})
        yield json.dumps({"type": "done", "conversation_id": conv_id, "safety_level": "crisis"})
        return

    query_embedding = embed_text(message)
    emotion = detect_emotion(message)
    memories = await retrieve_memories(conn, user_id, query_embedding, top_k=5)
    resources: List[Dict] = []
    if safety["level"] == "warning":
        resources = await retrieve_resources(conn, query_embedding, top_k=2)

    conv_id = await get_or_create_conversation(conn, user_id, conversation_id)
    history = await _get_recent_history(conn, conv_id, limit=8)
    context = assemble_context(memories, resources, emotion, history, safety["level"])
    prompt = build_prompt(
        message=message,
        emotion=emotion,
        memories=context["memories"],
        conversation_history=context["conversation_history"],
        safety_level=safety["level"],
    )

    full_response = []
    async for chunk in _llm.stream(prompt):
        full_response.append(chunk)
        yield json.dumps({"type": "token", "text": chunk})

    complete = "".join(full_response)
    await _store_pair(conn, conv_id, user_id, message, complete, emotion)
    yield json.dumps({
        "type": "done",
        "conversation_id": conv_id,
        "emotion": emotion,
        "safety_level": safety["level"],
    })


# ── Helpers ───────────────────────────────────────────────────────────────────

async def _get_recent_history(
    conn: asyncpg.Connection, conversation_id: str, limit: int = 8
) -> List[Dict[str, str]]:
    rows = await conn.fetch(
        """
        SELECT role, content FROM messages
        WHERE conversation_id = $1
        ORDER BY created_at DESC
        LIMIT $2
        """,
        conversation_id, limit,
    )
    return [{"role": r["role"], "content": r["content"]} for r in reversed(rows)]


async def _store_pair(
    conn: asyncpg.Connection,
    conversation_id: str,
    user_id: str,
    user_message: str,
    assistant_response: str,
    emotion: Dict,
) -> None:
    await store_message(conn, conversation_id, user_id, "user", user_message, emotion)
    await store_message(conn, conversation_id, user_id, "assistant", assistant_response)
