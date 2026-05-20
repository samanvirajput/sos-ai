"""
Offline emotion detection.
Primary: j-hartmann/emotion-english-distilroberta-base via transformers pipeline.
Fallback: keyword heuristics if model is unavailable.
"""
import re
from typing import Dict, Optional

_pipeline = None
_pipeline_loaded = False


def _get_pipeline():
    global _pipeline, _pipeline_loaded
    if not _pipeline_loaded:
        try:
            from transformers import pipeline as hf_pipeline
            _pipeline = hf_pipeline(
                "text-classification",
                model="j-hartmann/emotion-english-distilroberta-base",
                return_all_scores=True,
                device=-1,          # CPU only
                truncation=True,
                max_length=512,
            )
        except Exception:
            _pipeline = None
        _pipeline_loaded = True
    return _pipeline


# Keyword fallback maps — ordered by specificity
_KEYWORD_MAP: Dict[str, list] = {
    "anger":    [r"\b(angry|furious|rage|hate|pissed|infuriated|mad at)\b"],
    "fear":     [r"\b(scared|afraid|terrified|anxious|anxiety|panic|worried|dread)\b"],
    "sadness":  [r"\b(sad|depressed|hopeless|crying|grief|lonely|heartbroken|miserable)\b"],
    "joy":      [r"\b(happy|excited|grateful|love|wonderful|great|amazing|joyful)\b"],
    "disgust":  [r"\b(disgusting|gross|revolting|sick of|nauseated|repulsed)\b"],
    "surprise": [r"\b(surprised|shocked|amazed|unexpected|stunned|wow)\b"],
}


def _keyword_detect(text: str) -> Dict:
    text_lower = text.lower()
    scores = {}
    for emotion, patterns in _KEYWORD_MAP.items():
        count = sum(len(re.findall(p, text_lower)) for p in patterns)
        scores[emotion] = min(count * 0.3, 0.9)

    if not any(scores.values()):
        return {"emotion": "neutral", "confidence": 0.8, "intensity": 0.3, "all_scores": {}}

    best = max(scores, key=scores.get)
    return {
        "emotion": best,
        "confidence": scores[best],
        "intensity": scores[best],
        "all_scores": scores,
    }


def detect_emotion(text: str) -> Dict:
    """
    Returns:
        {
            "emotion": str,         # dominant emotion
            "confidence": float,    # 0-1
            "intensity": float,     # 0-1
            "all_scores": dict,     # emotion → score
        }
    """
    pipe = _get_pipeline()
    if pipe is None:
        return _keyword_detect(text)

    try:
        results = pipe(text[:512])[0]  # list of {label, score}
        best = max(results, key=lambda x: x["score"])
        all_scores = {r["label"]: round(r["score"], 4) for r in results}
        # Derive intensity from how dominant the top emotion is
        intensity = round(best["score"] * 1.1, 3)
        intensity = min(intensity, 1.0)
        return {
            "emotion": best["label"],
            "confidence": round(best["score"], 4),
            "intensity": intensity,
            "all_scores": all_scores,
        }
    except Exception:
        return _keyword_detect(text)
