from fastapi import APIRouter, Depends, HTTPException, Query, status
import asyncpg

from backend.api.middleware.auth_middleware import get_current_user_id
from backend.db.connection import get_db
from backend.embeddings.pipeline import embed_text
from backend.memory.retriever import retrieve_memories
from backend.models.schemas import MemoryItem, MemoryListResponse

router = APIRouter(prefix="/memory", tags=["memory"])


@router.get("", response_model=MemoryListResponse)
async def get_memories(
    query: str = Query(..., min_length=1, description="Semantic search query"),
    top_k: int = Query(default=10, ge=1, le=50),
    user_id: str = Depends(get_current_user_id),
    conn: asyncpg.Connection = Depends(get_db),
):
    query_embedding = embed_text(query)
    memories = await retrieve_memories(conn, user_id, query_embedding, top_k=top_k)
    return MemoryListResponse(
        memories=[MemoryItem(**m) for m in memories],
        total=len(memories),
    )


@router.delete("/{memory_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_memory(
    memory_id: str,
    user_id: str = Depends(get_current_user_id),
    conn: asyncpg.Connection = Depends(get_db),
):
    result = await conn.execute(
        "DELETE FROM messages WHERE id = $1 AND user_id = $2",
        memory_id, user_id,
    )
    if result == "DELETE 0":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Memory not found or does not belong to you",
        )
