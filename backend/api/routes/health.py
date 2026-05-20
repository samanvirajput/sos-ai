import os

from fastapi import APIRouter, Depends
import asyncpg

from backend.db.connection import get_db
from backend.models.schemas import HealthResponse

router = APIRouter(prefix="/health", tags=["health"])


@router.get("", response_model=HealthResponse)
async def health(conn: asyncpg.Connection = Depends(get_db)):
    try:
        await conn.fetchval("SELECT 1")
        db_status = "ok"
    except Exception:
        db_status = "error"

    return HealthResponse(
        status="ok",
        version="0.1.0",
        db=db_status,
        embedding_model=os.environ.get("EMBEDDING_MODEL", "all-mpnet-base-v2"),
    )
