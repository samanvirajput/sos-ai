# SOS AI

> RAG-powered mental wellness companion — pgvector semantic memory, emotion detection, crisis safety, and Gemini/Ollama LLM inference.

## Quick Start (Docker -- recommended)

Prerequisites: Docker + Docker Compose installed.

```bash
# 1. Clone the repo
git clone https://github.com/samanvirajput/sos-ai
cd sos-ai

# 2. Add your Gemini API key
cp .env.docker .env
# edit .env and set GEMINI_API_KEY

# 3. Start everything
docker compose up --build
```

App is live at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

To stop:
```bash
docker compose down        # stop containers
docker compose down -v     # stop + delete database volume
```

Note: First build downloads ML models (~400MB). Subsequent builds use the cached model_cache volume.

## Quick Start

### 1. PostgreSQL + pgvector
```bash
docker run -d --name sos-pg \
  -e POSTGRES_USER=sos -e POSTGRES_PASSWORD=sos -e POSTGRES_DB=sos_ai \
  -p 5432:5432 pgvector/pgvector:pg16
```

### 2. Backend
```bash
cd backend
cp .env.example .env          # fill in DATABASE_URL + GEMINI_API_KEY
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn api.main:app --reload --port 8000
# Schema + crisis resources applied automatically on first startup
```

### 3. Frontend
```bash
cd frontend && npm install && npm run dev
# → http://localhost:5173
```

## Architecture

```
Frontend (React + Vite + Zustand)
        │  JWT / SSE
        ▼
  FastAPI  ──►  Safety detector (offline regex, 3 tiers)
        │  ──►  Sentiment (distilroberta / keyword fallback)
        │  ──►  Embeddings (all-mpnet-base-v2, 768-dim)
        │              │
        │         pgvector ANN
        │         (messages + resources)
        │
        ├──►  Gemini 1.5 Flash  (primary)
        └──►  Ollama             (offline fallback)
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✓ | asyncpg-compatible PostgreSQL DSN |
| `JWT_SECRET` | ✓ | Random secret for JWT signing |
| `GEMINI_API_KEY` | — | Gemini 1.5 Flash — falls back to Ollama if absent |
| `OLLAMA_BASE_URL` | — | Default: `http://localhost:11434` |
| `OLLAMA_MODEL` | — | Default: `llama3` |
| `EMBEDDING_MODEL` | — | Default: `all-mpnet-base-v2` (768-dim) |
| `ALLOWED_ORIGINS` | — | CORS origins, comma-separated |

## Project Structure

```
backend/
  api/          FastAPI app, routes: /auth /chat /memory /health
  chat/         engine.py (full pipeline) · prompt_builder.py
  memory/       retriever.py (pgvector ANN) · store.py (embed+insert)
  embeddings/   pipeline.py — singleton SentenceTransformer
  sentiment/    detector.py — emotion classification, offline
  safety/       detector.py — crisis pattern matching, offline
  rag/          context_assembler.py
  db/           schema.sql · connection.py · init.py

frontend/
  src/
    components/ Chat/ · Auth/ · Memory/ · Layout/ · Botanical/
    pages/      Home · AuthPage · ChatPage
    hooks/      useChat · useAuth · useMemory
    services/   api.ts (axios+JWT) · chatService · authService
    store/      authStore (Zustand)
    types/      shared TypeScript interfaces
```

## Stack

`Python 3.11` `FastAPI` `asyncpg` `PostgreSQL` `pgvector`  
`sentence-transformers` `HuggingFace Transformers` `Gemini 1.5 Flash`  
`React 18` `TypeScript` `Vite` `Zustand` `Axios`
