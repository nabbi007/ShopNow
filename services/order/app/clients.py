"""HTTP clients for the services order-service orchestrates at checkout."""
import httpx
from fastapi import HTTPException

from app.config import settings


async def get_cart(session_id: str) -> dict:
    async with httpx.AsyncClient(base_url=settings.CART_URL, timeout=5.0) as client:
        try:
            resp = await client.get(f"/api/cart/{session_id}")
            resp.raise_for_status()
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=502, detail=f"cart-service error: {exc}")
        return resp.json()


async def clear_cart(session_id: str) -> None:
    async with httpx.AsyncClient(base_url=settings.CART_URL, timeout=5.0) as client:
        try:
            await client.delete(f"/api/cart/{session_id}")
        except httpx.HTTPError:
            pass  # best-effort; the order already succeeded


async def decrement_stock(product_id: int, quantity: int) -> dict:
    """Reserve stock in the catalog. Returns the (authoritative) product."""
    async with httpx.AsyncClient(base_url=settings.CATALOG_URL, timeout=5.0) as client:
        try:
            resp = await client.post(
                f"/api/products/{product_id}/decrement", json={"quantity": quantity}
            )
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=502, detail=f"catalog-service error: {exc}")
        if resp.status_code == 404:
            raise HTTPException(status_code=404, detail=f"Product {product_id} not found")
        if resp.status_code == 409:
            raise HTTPException(status_code=409, detail=resp.json().get("detail", "Insufficient stock"))
        resp.raise_for_status()
        return resp.json()
