# Architecture

## System Overview

SOS AI is a full-stack emotional support platform built around a
safety-first RAG pipeline. Every message passes through crisis
detection before anything else runs.

```
User Message
      |
      v
[ Safety Detector ]          <- offline pattern matching, 3 tiers
  safe/warning/crisis           crisis -> hardcoded safe response immediately
      |
      | (safe/warning)
      v
[ Embedding Pipeline ]       <- all-MiniLM-L6-v2, 768-dim, ~11ms
      |
      v
[ Emotion Detector ]         <- j-hartmann/emotion-english-distilroberta-base
  (offline)                     joy/sadness/anger/fear/disgust/surprise/neutral
      |
      v
[ Memory Retriever ]         <- pgvector cosine ANN, top-5 semantic memories
  (pgvector)                    user-scoped, RLS enforced
      |
      v
[ Prompt Builder ]           <- system + emotion + memories + history + message
      |
      v
[ LLM Layer ]                <- Gemini 1.5 Flash (primary)
                                Ollama/local fallback (offline)
      |
      v
[ Memory Store ]             <- embed + store both turns in messages table
  (pgvector)                    with sentiment JSONB + vector(768)
      |
      v
   Response
```

## Database Schema

```sql
-- 5-table PostgreSQL schema with pgvector

users          -> id, email, hashed_password, name, preferences JSONB
conversations  -> id, user_id FK, started_at, ended_at, metadata JSONB
messages       -> id, conversation_id FK, role, content,
                  embedding vector(768), sentiment JSONB, created_at
resources      -> id, title, content, embedding vector(768), category
logs           -> id, user_id FK, event_type, metadata JSONB, created_at

-- Indexes
CREATE INDEX ON messages USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX ON resources USING ivfflat (embedding vector_cosine_ops);

-- Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_isolation ON users
  USING (id = current_setting('app.current_user_id')::UUID);
```

## Frontend Architecture

```
src/
├── components/
│   ├── Chat/
│   │   ├── ChatWindow.tsx      # journal-entry style message thread
│   │   ├── MessageBubble.tsx   # emotion-tagged, serif font, no bubbles
│   │   ├── InputBar.tsx        # auto-resize, Caveat placeholder
│   │   └── TypingIndicator.tsx # "thinking..." fade animation
│   ├── Auth/                   # login/register, bottom-border inputs
│   ├── Memory/                 # memory panel sidebar
│   └── Layout/                 # sidebar + header
├── hooks/
│   ├── useChat.ts              # SSE streaming handler
│   ├── useAuth.ts              # JWT token management
│   └── useMemory.ts            # memory fetch + delete
└── services/
    ├── api.ts                  # axios + JWT interceptor
    ├── chatService.ts
    └── authService.ts
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /auth/register | No | Create account, return JWT |
| POST | /auth/login | No | Verify credentials, return JWT |
| POST | /chat | Yes | Full pipeline: safety -> embed -> emotion -> RAG -> LLM |
| POST | /chat/stream | Yes | Same pipeline, SSE token streaming |
| GET | /memory | Yes | Retrieve top memories for query |
| DELETE | /memory/{id} | Yes | User-controlled memory deletion |
| GET | /health | No | Service status |
