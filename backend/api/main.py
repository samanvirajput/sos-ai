import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routes import auth, chat, health, memory
from backend.db.connection import close_pool
from backend.db.init import init_db
from backend.memory.store import update_resource_embeddings
from backend.db.connection import get_pool


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    pool = await get_pool()
    async with pool.acquire() as conn:
        await update_resource_embeddings(conn)
    yield
    # Shutdown
    await close_pool()


app = FastAPI(
    title="SOS AI",
    description="RAG-powered mental wellness companion API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,   prefix="/api")
app.include_router(chat.router,   prefix="/api")
app.include_router(memory.router, prefix="/api")
app.include_router(health.router, prefix="/api")


@app.get("/")
def root():
    return {"service": "SOS AI", "version": "0.1.0", "status": "running"}
