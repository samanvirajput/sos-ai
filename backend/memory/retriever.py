"""
pgvector-backed memory retrieval.
Uses cosine ANN search: embedding <=> query_embedding.
"""
from typing import Any, Dict, List

import asyncpg


def _vec(embedding: List[float]) -> str:
    """Format a Python float list as a pgvector literal string."""
    return "[" + ",".join(str(x) for x in embedding) + "]"


async def retrieve_memories(
    conn: asyncpg.Connection,
    user_id: str,
    query_embedding: List[float],
    top_k: int = 5,
    min_similarity: float = 0.0,
) -> List[Dict[str, Any]]:
    """
    Return up to top_k messages from this user's history whose embeddings
    are most similar to query_embedding (cosine similarity via pgvector).
    """
    vec_str = _vec(query_embedding)
    rows = await conn.fetch(
        """
        SELECT
            id,
            content,
            role,
            sentiment,
            created_at,
            1 - (embedding <=> $1::vector) AS similarity
        FROM messages
        WHERE user_id = $2
          AND embedding IS NOT NULL
        ORDER BY embedding <=> $1::vector
        LIMIT $3
        """,
        vec_str,
        user_id,
        top_k,
    )
    results = []
    for row in rows:
        sim = float(row["similarity"]) if row["similarity"] is not None else 0.0
        if sim >= min_similarity:
            results.append(
                {
                    "id": str(row["id"]),
                    "content": row["content"],
                    "role": row["role"],
                    "sentiment": dict(row["sentiment"] or {}),
                    "created_at": row["created_at"].isoformat(),
                    "similarity": round(sim, 4),
                }
            )
    return results


async def retrieve_resources(
    conn: asyncpg.Connection,
    query_embedding: List[float],
    top_k: int = 3,
    category: str | None = None,
) -> List[Dict[str, Any]]:
    """Retrieve crisis/support resources by semantic similarity."""
    vec_str = _vec(query_embedding)
    if category:
        rows = await conn.fetch(
            """
            SELECT id, title, content, category,
                   1 - (embedding <=> $1::vector) AS similarity
            FROM resources
            WHERE category = $3 AND embedding IS NOT NULL
            ORDER BY embedding <=> $1::vector
            LIMIT $2
            """,
            vec_str, top_k, category,
        )
    else:
        rows = await conn.fetch(
            """
            SELECT id, title, content, category,
                   1 - (embedding <=> $1::vector) AS similarity
            FROM resources
            WHERE embedding IS NOT NULL
            ORDER BY embedding <=> $1::vector
            LIMIT $2
            """,
            vec_str, top_k,
        )
    return [
        {
            "id": str(r["id"]),
            "title": r["title"],
            "content": r["content"],
            "category": r["category"],
            "similarity": round(float(r["similarity"] or 0), 4),
        }
        for r in rows
    ]
