import httpx
from redis.asyncio import Redis, from_url

from app.config import settings

_redis: Redis | None = None


async def get_redis() -> Redis:
    global _redis
    if _redis is None:
        _redis = from_url(settings.REDIS_URL, decode_responses=True)
    return _redis


async def fetch_product(product_id: int) -> dict | None:
    """Look a product up from the catalog-service. None if it doesn't exist."""
    async with httpx.AsyncClient(base_url=settings.CATALOG_URL, timeout=5.0) as client:
        resp = await client.get(f"/api/products/{product_id}")
        if resp.status_code == 404:
            return None
        resp.raise_for_status()
        return resp.json()
