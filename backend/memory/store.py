"""
Embed and persist messages + resources to the database.
"""
import json
from typing import Any, Dict, List, Optional

import asyncpg

from backend.embeddings.pipeline import embed_text


def _vec(embedding: List[float]) -> str:
    return "[" + ",".join(str(x) for x in embedding) + "]"


async def store_message(
    conn: asyncpg.Connection,
    conversation_id: str,
    user_id: str,
    role: str,
    content: str,
    sentiment: Optional[Dict[str, Any]] = None,
) -> str:
    """Embed content and insert a message row. Returns the new message UUID."""
    embedding = embed_text(content)
    vec_str = _vec(embedding)
    sentiment_json = json.dumps(sentiment or {})

    row = await conn.fetchrow(
        """
        INSERT INTO messages (conversation_id, user_id, role, content, embedding, sentiment)
        VALUES ($1, $2, $3, $4, $5::vector, $6::jsonb)
        RETURNING id
        """,
        conversation_id,
        user_id,
        role,
        content,
        vec_str,
        sentiment_json,
    )
    return str(row["id"])


async def store_resource(
    conn: asyncpg.Connection,
    title: str,
    content: str,
    category: str,
) -> str:
    """Embed and insert a crisis/support resource."""
    embedding = embed_text(f"{title}: {content}")
    vec_str = _vec(embedding)

    row = await conn.fetchrow(
        """
        INSERT INTO resources (title, content, embedding, category)
        VALUES ($1, $2, $3::vector, $4)
        RETURNING id
        """,
        title, content, vec_str, category,
    )
    return str(row["id"])


async def update_resource_embeddings(conn: asyncpg.Connection) -> int:
    """Back-fill embeddings for any resources missing them."""
    rows = await conn.fetch(
        "SELECT id, title, content FROM resources WHERE embedding IS NULL"
    )
    count = 0
    for row in rows:
        text = f"{row['title']}: {row['content']}"
        embedding = embed_text(text)
        vec_str = _vec(embedding)
        await conn.execute(
            "UPDATE resources SET embedding = $1::vector WHERE id = $2",
            vec_str, row["id"],
        )
        count += 1
    return count


async def get_or_create_conversation(
    conn: asyncpg.Connection,
    user_id: str,
    conversation_id: Optional[str] = None,
) -> str:
    """Return existing conversation ID or create a new one."""
    if conversation_id:
        row = await conn.fetchrow(
            "SELECT id FROM conversations WHERE id = $1 AND user_id = $2",
            conversation_id, user_id,
        )
        if row:
            return str(row["id"])

    row = await conn.fetchrow(
        "INSERT INTO conversations (user_id) VALUES ($1) RETURNING id",
        user_id,
    )
    return str(row["id"])
