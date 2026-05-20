"""
Assembles retrieval context from memories, resources, sentiment, and history
into a structured dict for the prompt builder.
"""
from typing import Any, Dict, List, Optional


def assemble_context(
    memories: List[Dict[str, Any]],
    resources: List[Dict[str, Any]],
    emotion: Dict[str, Any],
    conversation_history: List[Dict[str, str]],
    safety_level: str,
) -> Dict[str, Any]:
    """
    Returns a context dict consumed by prompt_builder.build_prompt().

    memories: retrieved similar past messages
    resources: retrieved support/crisis resources
    emotion: output of sentiment.detector.detect_emotion()
    conversation_history: list of {role, content} dicts (recent turns)
    safety_level: "safe" | "warning" | "crisis"
    """
    # Deduplicate memories by content prefix (avoid near-identical passages)
    seen: set = set()
    deduped_memories = []
    for m in memories:
        key = m["content"][:60]
        if key not in seen:
            seen.add(key)
            deduped_memories.append(m)

    # Keep only high-similarity memories
    strong_memories = [m for m in deduped_memories if m.get("similarity", 0) > 0.40]

    return {
        "memories": strong_memories,
        "resources": resources,
        "emotion": emotion,
        "conversation_history": conversation_history[-8:],  # last 8 turns
        "safety_level": safety_level,
        "has_memories": len(strong_memories) > 0,
        "has_resources": len(resources) > 0,
    }


def format_memories_for_prompt(memories: List[Dict[str, Any]]) -> str:
    if not memories:
        return "No relevant memories from past conversations."
    lines = []
    for i, m in enumerate(memories, 1):
        role_label = "You said" if m["role"] == "user" else "I replied"
        lines.append(f"  {i}. {role_label}: \"{m['content'][:200]}\"")
    return "\n".join(lines)


def format_history_for_prompt(history: List[Dict[str, str]]) -> str:
    lines = []
    for turn in history:
        prefix = "User" if turn["role"] == "user" else "SOS AI"
        lines.append(f"{prefix}: {turn['content']}")
    return "\n".join(lines) if lines else ""
