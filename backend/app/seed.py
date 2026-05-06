"""Run once to populate sample products: python -m app.seed"""
import asyncio
from app.database import AsyncSessionLocal, engine, Base
from app.models.product import Product

SAMPLE_PRODUCTS = [
    {
        "name": "Wireless Noise-Cancelling Headphones",
        "description": "Premium over-ear headphones with 30h battery life.",
        "price": 149.99,
        "stock": 50,
        "category": "Electronics",
        "image_url": "https://placehold.co/400x400?text=Headphones",
    },
    {
        "name": "Mechanical Keyboard",
        "description": "TKL layout, Cherry MX Brown switches.",
        "price": 89.99,
        "stock": 30,
        "category": "Electronics",
        "image_url": "https://placehold.co/400x400?text=Keyboard",
    },
    {
        "name": "Running Shoes",
        "description": "Lightweight and breathable, perfect for long runs.",
        "price": 74.99,
        "stock": 100,
        "category": "Footwear",
        "image_url": "https://placehold.co/400x400?text=Shoes",
    },
    {
        "name": "Stainless Steel Water Bottle",
        "description": "Keeps drinks cold for 24 h, hot for 12 h.",
        "price": 24.99,
        "stock": 200,
        "category": "Sports",
        "image_url": "https://placehold.co/400x400?text=Bottle",
    },
    {
        "name": "Yoga Mat",
        "description": "Non-slip, eco-friendly, 6mm thick.",
        "price": 34.99,
        "stock": 80,
        "category": "Sports",
        "image_url": "https://placehold.co/400x400?text=Yoga+Mat",
    },
    {
        "name": "Desk Lamp",
        "description": "LED, adjustable brightness, USB charging port.",
        "price": 39.99,
        "stock": 60,
        "category": "Home",
        "image_url": "https://placehold.co/400x400?text=Lamp",
    },
]


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        for data in SAMPLE_PRODUCTS:
            session.add(Product(**data))
        await session.commit()
    print(f"Seeded {len(SAMPLE_PRODUCTS)} products.")


if __name__ == "__main__":
    asyncio.run(seed())
