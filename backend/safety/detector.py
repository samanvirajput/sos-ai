"""
Fully offline crisis detection using tiered pattern matching.
No API calls — fast, deterministic, privacy-preserving.

Tiers:
  safe    — no distress signals
  warning — significant emotional distress
  crisis  — active self-harm or suicidal ideation
"""
import re
from typing import Dict, List

# ── Crisis patterns (tier 3) — highest priority ──────────────────────────────
_CRISIS = [
    r"\b(want|going|plan|trying|decided)\s+to\s+(kill|end|take)\s+(my|myself|my\s+life)\b",
    r"\b(kill|end|take)\s+(myself|my\s+life)\b",
    r"\bsuicid(e|al|ally|e\s+attempt)\b",
    r"\bwant\s+to\s+die\b",
    r"\bdon'?t\s+want\s+to\s+(live|exist|be\s+alive|be\s+here)\b",
    r"\bno\s+(point|reason|will)\s+to\s+(live|go\s+on|keep\s+going)\b",
    r"\b(self.?harm|self.?hurt|self.?injur)\b",
    r"\b(cut|cutting)\s+(myself|my\s+(arms?|wrists?|legs?))\b",
    r"\b(overdos(e|ing)|od'?ing)\b",
    r"\bend\s+it\s+(all|now|tonight|today)\b",
    r"\bcan'?t\s+(go|keep)\s+on\b",
    r"\bnot\s+worth\s+(living|being\s+alive)\b",
    r"\b(goodbye|farewell)\s+(cruel|to\s+this)\s+world\b",
    r"\bfinal\s+(note|letter|goodbye)\b",
    r"\bhave\s+(a\s+)?(gun|pills|rope|knife)\s+(ready|nearby|with\s+me)\b",
]

# ── Warning patterns (tier 2) — significant distress ─────────────────────────
_WARNING = [
    r"\b(feel(ing)?|so|extremely)\s+(hopeless|worthless|meaningless|empty|numb|trapped)\b",
    r"\bnothing\s+(matters|is\s+worth\s+it|will\s+ever\s+change)\b",
    r"\bnobody\s+(cares?|loves?\s+me|would\s+notice)\b",
    r"\bfall(ing)?\s+apart\b",
    r"\bbreak(ing)?\s+down\b",
    r"\bcan'?t\s+(cope|deal|handle|take\s+it)\s+(anymore|any\s+more|any\s+longer)?\b",
    r"\bgiving\s+up\b",
    r"\bso\s+tired\s+of\s+(life|everything|fighting|trying)\b",
    r"\bdon'?t\s+(care|see\s+the\s+point)\s+anymore\b",
    r"\b(always|constantly)\s+(crying|hurting|suffering)\b",
    r"\bno\s+(hope|future|way\s+out)\b",
    r"\b(deeply|severely|horribly)\s+depressed\b",
    r"\bcan'?t\s+get\s+out\s+of\s+bed\b",
    r"\bwhat'?s\s+the\s+point\b",
]

_CRISIS_COMPILED  = [re.compile(p, re.IGNORECASE) for p in _CRISIS]
_WARNING_COMPILED = [re.compile(p, re.IGNORECASE) for p in _WARNING]

CRISIS_RESOURCES = (
    "If you're in crisis right now, please reach out:\n"
    "• **988 Suicide & Crisis Lifeline** — call or text 988 (US, 24/7)\n"
    "• **Crisis Text Line** — text HOME to 741741\n"
    "• **International Association for Suicide Prevention** — https://www.iasp.info/resources/Crisis_Centres/\n\n"
    "You don't have to face this alone. Help is available right now."
)


def assess_safety(text: str) -> Dict:
    """
    Returns:
        {
            "flagged": bool,
            "level": "safe" | "warning" | "crisis",
            "matched_patterns": list[str],
            "crisis_resources": str | None,
        }
    """
    matched: List[str] = []

    for pattern in _CRISIS_COMPILED:
        m = pattern.search(text)
        if m:
            matched.append(m.group(0).strip())

    if matched:
        return {
            "flagged": True,
            "level": "crisis",
            "matched_patterns": matched,
            "crisis_resources": CRISIS_RESOURCES,
        }

    for pattern in _WARNING_COMPILED:
        m = pattern.search(text)
        if m:
            matched.append(m.group(0).strip())

    if matched:
        return {
            "flagged": True,
            "level": "warning",
            "matched_patterns": matched,
            "crisis_resources": None,
        }

    return {
        "flagged": False,
        "level": "safe",
        "matched_patterns": [],
        "crisis_resources": None,
    }


CRISIS_RESPONSE = (
    "I want you to know I hear you, and I'm genuinely concerned about your safety right now. "
    "What you're feeling is real, and you deserve support from someone trained to help.\n\n"
    + CRISIS_RESOURCES
    + "\n\nI'm here with you. Are you somewhere safe right now?"
)
