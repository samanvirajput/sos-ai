import os
from typing import AsyncGenerator, Optional

import asyncpg

_pool: Optional[asyncpg.Pool] = None


async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(
            dsn=os.environ["DATABASE_URL"],
            min_size=2,
            max_size=10,
            command_timeout=30,
        )
    return _pool


async def close_pool() -> None:
    global _pool
    if _pool:
        await _pool.close()
        _pool = None


async def get_db() -> AsyncGenerator[asyncpg.Connection, None]:
    """FastAPI dependency — yields a raw connection from the pool."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        yield conn


async def get_user_db(
    user_id: str,
) -> AsyncGenerator[asyncpg.Connection, None]:
    """Yields a connection with RLS user context set."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        # SET LOCAL so it's scoped to the current transaction
        await conn.execute(
            "SELECT set_config('app.current_user_id', $1, true)", user_id
        )
        yield conn
