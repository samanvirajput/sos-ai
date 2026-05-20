"""
Assembles the full prompt sent to the LLM.
"""
from typing import Any, Dict, List

from backend.rag.context_assembler import (
    format_history_for_prompt,
    format_memories_for_prompt,
)

SYSTEM_PROMPT = """\
You are SOS AI — a warm, thoughtful mental wellness companion. You are NOT a therapist, \
psychologist, or medical professional, and you never claim to be one. Your role is to \
listen deeply, validate feelings without judgment, and offer gentle, compassionate support.

Core principles:
- Always validate the user's feelings before offering any perspective or suggestion.
- Never minimize, dismiss, or rationalize away someone's pain.
- Speak in a calm, warm, human voice. No clinical jargon.
- Do not give medical advice or diagnose.
- If the conversation touches on self-harm or crisis, always provide the 988 Lifeline number.
- Remember: you are a companion, not a fixer. Sometimes presence is enough.
- Keep responses conversational — typically 2-4 paragraphs unless the user needs more.
"""


def build_prompt(
    message: str,
    emotion: Dict[str, Any],
    memories: List[Dict[str, Any]],
    conversation_history: List[Dict[str, str]],
    safety_level: str,
) -> str:
    emotion_name = emotion.get("emotion", "neutral")
    emotion_conf = emotion.get("confidence", 0.0)
    intensity = emotion.get("intensity", 0.0)

    emotion_context = (
        f"Emotional state detected: {emotion_name} "
        f"(confidence {emotion_conf:.0%}, intensity {intensity:.0%}). "
        "Attune your response to this — meet them where they are emotionally."
    )

    memory_block = format_memories_for_prompt(memories)
    history_block = format_history_for_prompt(conversation_history)

    warning_note = ""
    if safety_level == "warning":
        warning_note = (
            "\n[Context: The user is showing signs of significant distress. "
            "Respond with extra care and warmth. Gently inquire about their wellbeing. "
            "Mention that professional support is always available.]\n"
        )

    prompt_parts = [
        SYSTEM_PROMPT,
        "",
        f"--- Emotional Context ---\n{emotion_context}",
        "",
        f"--- Relevant Memories from Past Conversations ---\n{memory_block}",
    ]

    if history_block:
        prompt_parts += ["", f"--- Recent Conversation ---\n{history_block}"]

    if warning_note:
        prompt_parts.append(warning_note)

    prompt_parts += [
        "",
        f"--- Current Message ---",
        f"User: {message}",
        "",
        "SOS AI:",
    ]

    return "\n".join(prompt_parts)
