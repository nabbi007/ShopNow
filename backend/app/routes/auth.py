import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.rate_limit import limiter
from app.schemas.auth import UserCreate, LoginRequest, Token, UserResponse
from app.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)

router = APIRouter(prefix="/auth", tags=["auth"])

logger = logging.getLogger("shopnow.auth")


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(
    request: Request, payload: UserCreate, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.email == payload.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    logger.info("New user registered: user_id=%s", user.id)
    return Token(access_token=create_access_token(user.id), user=user)


@router.post("/login", response_model=Token)
@limiter.limit("10/minute")
async def login(
    request: Request, payload: LoginRequest, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(payload.password, user.hashed_password):
        logger.warning("Failed login attempt for email=%s", payload.email)
        raise HTTPException(status_code=401, detail="Invalid email or password")

    logger.info("User logged in: user_id=%s", user.id)
    return Token(access_token=create_access_token(user.id), user=user)


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    return current_user
