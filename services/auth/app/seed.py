"""Seed a default admin user into the auth DB: python -m app.seed"""
import asyncio
import os

from sqlalchemy import select

from app.database import AsyncSessionLocal, engine, Base
from app.models import User
from common.security import hash_password

# Note: a real TLD (not .local) — email-validator rejects reserved domains,
# which would otherwise block admin login.
ADMIN_EMAIL = os.getenv("SEED_ADMIN_EMAIL", "admin@shopnow.com")
ADMIN_PASSWORD = os.getenv("SEED_ADMIN_PASSWORD", "Admin123!")
ADMIN_NAME = os.getenv("SEED_ADMIN_NAME", "ShopNow Admin")


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        existing = await session.execute(select(User).where(User.email == ADMIN_EMAIL))
        if existing.scalar_one_or_none() is None:
            session.add(
                User(
                    name=ADMIN_NAME,
                    email=ADMIN_EMAIL,
                    hashed_password=hash_password(ADMIN_PASSWORD),
                    role="admin",
                )
            )
            await session.commit()
            print(f"Seeded admin user: {ADMIN_EMAIL}")
        else:
            print(f"Admin user {ADMIN_EMAIL} already exists; skipping.")


if __name__ == "__main__":
    asyncio.run(seed())
