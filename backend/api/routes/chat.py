import json
from typing import Optional

import asyncpg
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from backend.api.middleware.auth_middleware import get_current_user_id
from backend.chat.engine import process_message, stream_message
from backend.db.connection import get_db
from backend.models.schemas import ChatRequest, ChatResponse, EmotionResult

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
async def chat(
    payload: ChatRequest,
    user_id: str = Depends(get_current_user_id),
    conn: asyncpg.Connection = Depends(get_db),
):
    result = await process_message(
        user_id=user_id,
        message=payload.message,
        conversation_id=payload.conversation_id,
        conn=conn,
    )
    return ChatResponse(
        response=result["response"],
        conversation_id=result["conversation_id"],
        emotion=EmotionResult(**result["emotion"]),
        safety_level=result["safety_level"],
        memories_used=result["memories_used"],
    )


@router.post("/stream")
async def chat_stream(
    payload: ChatRequest,
    user_id: str = Depends(get_current_user_id),
    conn: asyncpg.Connection = Depends(get_db),
):
    """Server-Sent Events streaming endpoint."""
    async def event_generator():
        async for chunk in stream_message(
            user_id=user_id,
            message=payload.message,
            conversation_id=payload.conversation_id,
            conn=conn,
        ):
            yield f"data: {chunk}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/conversations")
async def list_conversations(
    user_id: str = Depends(get_current_user_id),
    conn: asyncpg.Connection = Depends(get_db),
):
    rows = await conn.fetch(
        """
        SELECT
            c.id,
            c.started_at,
            COUNT(m.id) AS message_count,
            (
                SELECT content FROM messages
                WHERE conversation_id = c.id AND role = 'user'
                ORDER BY created_at DESC LIMIT 1
            ) AS last_message_preview
        FROM conversations c
        LEFT JOIN messages m ON m.conversation_id = c.id
        WHERE c.user_id = $1
        GROUP BY c.id
        ORDER BY c.started_at DESC
        LIMIT 50
        """,
        user_id,
    )
    return {
        "conversations": [
            {
                "id": str(r["id"]),
                "started_at": r["started_at"].isoformat(),
                "message_count": r["message_count"],
                "last_message_preview": (r["last_message_preview"] or "")[:80],
            }
            for r in rows
        ]
    }


@router.get("/conversations/{conversation_id}/messages")
async def get_messages(
    conversation_id: str,
    user_id: str = Depends(get_current_user_id),
    conn: asyncpg.Connection = Depends(get_db),
):
    rows = await conn.fetch(
        """
        SELECT m.id, m.role, m.content, m.sentiment, m.created_at
        FROM messages m
        JOIN conversations c ON c.id = m.conversation_id
        WHERE m.conversation_id = $1 AND c.user_id = $2
        ORDER BY m.created_at ASC
        """,
        conversation_id, user_id,
    )
    return {
        "messages": [
            {
                "id": str(r["id"]),
                "role": r["role"],
                "content": r["content"],
                "sentiment": dict(r["sentiment"] or {}),
                "created_at": r["created_at"].isoformat(),
            }
            for r in rows
        ]
    }
