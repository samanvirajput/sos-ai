"""Pydantic schemas for request/response validation."""
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, field_validator


# ── Auth ──────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    name: Optional[str] = None


# ── Chat ──────────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

    @field_validator("message")
    @classmethod
    def message_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Message cannot be empty")
        if len(v) > 4000:
            raise ValueError("Message too long (max 4000 characters)")
        return v


class EmotionResult(BaseModel):
    emotion: str
    confidence: float
    intensity: float
    all_scores: Dict[str, float] = {}


class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    emotion: EmotionResult
    safety_level: str
    memories_used: int


# ── Memory ────────────────────────────────────────────────────────────────────

class MemoryItem(BaseModel):
    id: str
    content: str
    role: str
    sentiment: Dict[str, Any] = {}
    created_at: str
    similarity: float


class MemoryListResponse(BaseModel):
    memories: List[MemoryItem]
    total: int


# ── Conversation ──────────────────────────────────────────────────────────────

class ConversationSummary(BaseModel):
    id: str
    started_at: str
    message_count: int
    last_message_preview: Optional[str] = None


class ConversationListResponse(BaseModel):
    conversations: List[ConversationSummary]


# ── Health ────────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str
    version: str
    db: str
    embedding_model: str
