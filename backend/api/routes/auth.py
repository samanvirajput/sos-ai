from fastapi import APIRouter, Depends, HTTPException, status
import asyncpg

from backend.api.middleware.auth_middleware import (
    create_access_token,
    hash_password,
    verify_password,
)
from backend.db.connection import get_db
from backend.models.schemas import LoginRequest, RegisterRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, conn: asyncpg.Connection = Depends(get_db)):
    existing = await conn.fetchrow(
        "SELECT id FROM users WHERE email = $1", payload.email
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    hashed = hash_password(payload.password)
    row = await conn.fetchrow(
        "INSERT INTO users (email, hashed_password, name) VALUES ($1, $2, $3) RETURNING id, name",
        payload.email, hashed, payload.name,
    )
    user_id = str(row["id"])
    token = create_access_token(user_id)
    return TokenResponse(access_token=token, user_id=user_id, name=row["name"])


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, conn: asyncpg.Connection = Depends(get_db)):
    row = await conn.fetchrow(
        "SELECT id, hashed_password, name FROM users WHERE email = $1", payload.email
    )
    if not row or not verify_password(payload.password, row["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    user_id = str(row["id"])
    token = create_access_token(user_id)
    return TokenResponse(access_token=token, user_id=user_id, name=row["name"])
