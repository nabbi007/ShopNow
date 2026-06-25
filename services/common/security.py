"""Shared auth/security helpers.

The auth-service ISSUES tokens (create_access_token); every other service only
VALIDATES them locally (get_current_principal / require_admin) with the shared
SECRET_KEY — no network call back to auth on each request. Identity, role and
email travel inside the token as claims.
"""
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

from common.config import BaseAppSettings

settings = BaseAppSettings()

ALGORITHM = "HS256"
bearer_scheme = HTTPBearer(auto_error=True)


class Principal(BaseModel):
    """The authenticated caller, reconstructed from JWT claims (no DB lookup)."""

    id: int
    role: str = "customer"
    email: str | None = None
    name: str | None = None


# --- Password hashing (used only by auth-service) ---------------------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode(), hashed.encode())
    except ValueError:
        return False


# --- Tokens -----------------------------------------------------------------
def create_access_token(
    user_id: int, role: str = "customer", email: str | None = None, name: str | None = None
) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {
        "sub": str(user_id),
        "role": role,
        "email": email,
        "name": name,
        "exp": expire,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


def get_current_principal(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> Principal:
    invalid = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        decoded = jwt.decode(
            credentials.credentials, settings.SECRET_KEY, algorithms=[ALGORITHM]
        )
        return Principal(
            id=int(decoded["sub"]),
            role=decoded.get("role", "customer"),
            email=decoded.get("email"),
            name=decoded.get("name"),
        )
    except (jwt.PyJWTError, KeyError, ValueError):
        raise invalid


def require_admin(principal: Principal = Depends(get_current_principal)) -> Principal:
    if principal.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required"
        )
    return principal
