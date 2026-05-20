# SOS AI

> RAG-powered crisis support system with semantic resource matching, multi-tenant PostgreSQL, and row-level security.

## Overview
A production-safe crisis support backend using pgvector for semantic similarity search over mental health resources. Built with multi-tenancy, JWT auth, and row-level security from the ground up.

## Technical Details
- **Schema**: 5-table PostgreSQL (users, sessions, messages, resources, logs)
- **RAG pipeline**: input → embed (768-dim) → cosine ANN via pgvector → context window → LLM → response
- **Security**: Row-level security (RLS) + JWT auth — multi-tenant safe
- **Resource matching**: Crisis resources retrieved via semantic similarity, not keyword lookup

## Stack
`Python` `PostgreSQL` `pgvector` `FastAPI` `sentence-transformers` `JWT`
