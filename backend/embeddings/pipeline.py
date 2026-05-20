"""
Embedding pipeline — singleton SentenceTransformer loaded once at startup.
Default model: all-mpnet-base-v2 (768-dim).
Override via EMBEDDING_MODEL env var.
"""
import os
from typing import List, Optional

_model = None
_model_name: Optional[str] = None


def _get_model():
    global _model, _model_name
    if _model is None:
        from sentence_transformers import SentenceTransformer
        name = os.environ.get("EMBEDDING_MODEL", "all-mpnet-base-v2")
        _model = SentenceTransformer(name)
        _model_name = name
    return _model


def embed_text(text: str) -> List[float]:
    """Embed a single string. Returns a list of floats."""
    model = _get_model()
    vector = model.encode(text, normalize_embeddings=True)
    return vector.tolist()


def embed_batch(texts: List[str]) -> List[List[float]]:
    """Embed a list of strings. Returns list of float lists."""
    model = _get_model()
    vectors = model.encode(texts, normalize_embeddings=True, batch_size=32)
    return [v.tolist() for v in vectors]


def embedding_dim() -> int:
    """Return the dimension of the loaded model's output."""
    model = _get_model()
    return model.get_sentence_embedding_dimension()
