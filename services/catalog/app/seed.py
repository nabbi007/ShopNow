"""Seed the catalog DB with sample products: python -m app.seed"""
import asyncio

from sqlalchemy import select

from app.database import AsyncSessionLocal, engine, Base
from app.models import Product

SAMPLE_PRODUCTS = [
    {"name": "Wireless Noise-Cancelling Headphones", "description": "Premium over-ear headphones with 30h battery life.", "price": 149.99, "stock": 50, "category": "Electronics", "image_url": "/headphones.jpeg"},
    {"name": "Mechanical Keyboard", "description": "TKL layout, Cherry MX Brown switches.", "price": 89.99, "stock": 30, "category": "Electronics", "image_url": "/keyboard.jpeg"},
    {"name": "Running Shoes", "description": "Lightweight and breathable, perfect for long runs.", "price": 74.99, "stock": 100, "category": "Footwear", "image_url": "/shoes.jpeg"},
    {"name": "Stainless Steel Water Bottle", "description": "Keeps drinks cold for 24 h, hot for 12 h.", "price": 24.99, "stock": 200, "category": "Sports", "image_url": "/flask.jpeg"},
    {"name": "Yoga Mat", "description": "Non-slip, eco-friendly, 6mm thick.", "price": 34.99, "stock": 80, "category": "Sports", "image_url": "/yogamat.jpeg"},
    {"name": "Desk Lamp", "description": "LED, adjustable brightness, USB charging port.", "price": 39.99, "stock": 60, "category": "Home", "image_url": "/lamp.jpeg"},
]


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        existing = await session.execute(select(Product.id).limit(1))
        if existing.first() is not None:
            print("Products already present; skipping.")
            return
        for data in SAMPLE_PRODUCTS:
            session.add(Product(**data))
        await session.commit()
        print(f"Seeded {len(SAMPLE_PRODUCTS)} products.")


if __name__ == "__main__":
    asyncio.run(seed())
