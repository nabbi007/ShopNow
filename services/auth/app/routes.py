import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.limiter import limiter
from app.models import User
from app.schemas import UserCreate, LoginRequest, Token, UserResponse
from common.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_principal,
    Principal,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])
logger = logging.getLogger("shopnow.auth")


def _token_for(user: User) -> Token:
    access = create_access_token(
        user.id, role=user.role, email=user.email, name=user.name
    )
    return Token(access_token=access, user=user)


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(
    request: Request, payload: UserCreate, db: AsyncSession = Depends(get_db)
):
    existing = await db.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none():
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
    return _token_for(user)


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
    return _token_for(user)


@router.get("/me", response_model=UserResponse)
async def me(
    principal: Principal = Depends(get_current_principal),
    db: AsyncSession = Depends(get_db),
):
    user = await db.get(User, principal.id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
