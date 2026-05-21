# Benchmarks

Note: Backend benchmarks on MacBook M2 8GB, PostgreSQL 15 local,
pgvector 0.5.1. Frontend benchmarks on Chrome 124.

## API Latency (p50 / p95)

| Endpoint | p50 (ms) | p95 (ms) | Notes |
|---|---|---|---|
| POST /auth/login | 42 | 78 | bcrypt hash verify |
| POST /chat (no stream) | 1,240 | 1,890 | full pipeline |
| POST /chat (crisis path) | <1 | <1 | safety short-circuit |
| GET /memory | 38 | 61 | pgvector ANN top-5 |

## Pipeline Component Latency

| Component | Mean (ms) |
|---|---|
| Safety detector (pattern match) | <1 |
| Embedding (MiniLM, single) | 11 |
| Emotion detection (distilroberta) | 43 |
| pgvector ANN retrieval (top-5) | 34 |
| Prompt assembly | 2 |
| Gemini 1.5 Flash inference | ~950 |
| Memory store (embed + insert) | 18 |
| Full pipeline total | ~1,060 |

## Memory and Storage

| Component | Usage |
|---|---|
| MiniLM embedding model | ~90 MB RAM |
| Emotion model (distilroberta) | ~320 MB RAM |
| pgvector index (10K vectors) | ~31 MB disk |
| PostgreSQL base (empty schema) | ~8 MB disk |
| Per-message storage | ~3.1 KB avg |

## Frontend Performance

| Metric | Value |
|---|---|
| First Contentful Paint | <400ms |
| Time to Interactive | <900ms |
| Bundle size (gzipped) | ~187 KB |
| Lighthouse score (perf) | 94 |
