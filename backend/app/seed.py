"""Run once to populate sample data: python -m app.seed

Seeds the product catalog plus a default admin user. Override the admin
credentials with SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD env vars.
"""
import asyncio
import os

from sqlalchemy import select

from app.database import AsyncSessionLocal, engine, Base
from app.models.product import Product
from app.models.user import User
from app.auth import hash_password

ADMIN_EMAIL = os.getenv("SEED_ADMIN_EMAIL", "admin@shopnow.local")
ADMIN_PASSWORD = os.getenv("SEED_ADMIN_PASSWORD", "Admin123!")
ADMIN_NAME = os.getenv("SEED_ADMIN_NAME", "ShopNow Admin")

SAMPLE_PRODUCTS = [
    {
        "name": "Wireless Noise-Cancelling Headphones",
        "description": "Premium over-ear headphones with 30h battery life.",
        "price": 149.99,
        "stock": 50,
        "category": "Electronics",
        "image_url": "/headphones.jpeg",
    },
    {
        "name": "Mechanical Keyboard",
        "description": "TKL layout, Cherry MX Brown switches.",
        "price": 89.99,
        "stock": 30,
        "category": "Electronics",
        "image_url": "/keyboard.jpeg",
    },
    {
        "name": "Running Shoes",
        "description": "Lightweight and breathable, perfect for long runs.",
        "price": 74.99,
        "stock": 100,
        "category": "Footwear",
        "image_url": "/shoes.jpeg",
    },
    {
        "name": "Stainless Steel Water Bottle",
        "description": "Keeps drinks cold for 24 h, hot for 12 h.",
        "price": 24.99,
        "stock": 200,
        "category": "Sports",
        "image_url": "/flask.jpeg",
    },
    {
        "name": "Yoga Mat",
        "description": "Non-slip, eco-friendly, 6mm thick.",
        "price": 34.99,
        "stock": 80,
        "category": "Sports",
        "image_url": "/yogamat.jpeg",
    },
    {
        "name": "Desk Lamp",
        "description": "LED, adjustable brightness, USB charging port.",
        "price": 39.99,
        "stock": 60,
        "category": "Home",
        "image_url": "/lamp.jpeg",
    },
]


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # Products: only seed when the catalog is empty so re-runs are safe.
        existing = await session.execute(select(Product.id).limit(1))
        if existing.first() is None:
            for data in SAMPLE_PRODUCTS:
                session.add(Product(**data))
            print(f"Seeded {len(SAMPLE_PRODUCTS)} products.")
        else:
            print("Products already present; skipping product seed.")

        # Admin user: create once if it doesn't already exist.
        admin = await session.execute(select(User).where(User.email == ADMIN_EMAIL))
        if admin.scalar_one_or_none() is None:
            session.add(
                User(
                    name=ADMIN_NAME,
                    email=ADMIN_EMAIL,
                    hashed_password=hash_password(ADMIN_PASSWORD),
                    role="admin",
                )
            )
            print(f"Seeded admin user: {ADMIN_EMAIL}")
        else:
            print(f"Admin user {ADMIN_EMAIL} already exists; skipping.")

        await session.commit()


if __name__ == "__main__":
    asyncio.run(seed())
