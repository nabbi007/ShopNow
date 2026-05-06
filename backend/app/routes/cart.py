import json
import uuid
from fastapi import APIRouter, Depends, HTTPException
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.product import Product
from app.schemas.cart import CartResponse, AddToCartRequest, UpdateCartRequest, CartItem
from app.dependencies import get_redis

router = APIRouter(prefix="/cart", tags=["cart"])

CART_TTL = 60 * 60 * 24 * 7  # 7 days


def _cart_key(session_id: str) -> str:
    return f"cart:{session_id}"


async def _load_cart(redis: Redis, session_id: str) -> dict:
    raw = await redis.get(_cart_key(session_id))
    return json.loads(raw) if raw else {}


async def _save_cart(redis: Redis, session_id: str, cart: dict) -> None:
    await redis.setex(_cart_key(session_id), CART_TTL, json.dumps(cart))


def _build_response(session_id: str, cart: dict) -> CartResponse:
    items = [CartItem(**v) for v in cart.values()]
    total = sum(i.price * i.quantity for i in items)
    return CartResponse(session_id=session_id, items=items, total=round(total, 2))


@router.get("/{session_id}", response_model=CartResponse)
async def get_cart(session_id: str, redis: Redis = Depends(get_redis)):
    cart = await _load_cart(redis, session_id)
    return _build_response(session_id, cart)


@router.post("/", response_model=CartResponse)
async def add_to_cart(
    payload: AddToCartRequest,
    session_id: str | None = None,
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
):
    product = await db.get(Product, payload.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.stock < payload.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")

    sid = session_id or str(uuid.uuid4())
    cart = await _load_cart(redis, sid)

    key = str(payload.product_id)
    if key in cart:
        cart[key]["quantity"] += payload.quantity
    else:
        cart[key] = {
            "product_id": product.id,
            "name": product.name,
            "price": float(product.price),
            "quantity": payload.quantity,
            "image_url": product.image_url,
        }

    await _save_cart(redis, sid, cart)
    return _build_response(sid, cart)


@router.put("/{session_id}/{product_id}", response_model=CartResponse)
async def update_cart_item(
    session_id: str,
    product_id: int,
    payload: UpdateCartRequest,
    redis: Redis = Depends(get_redis),
):
    cart = await _load_cart(redis, session_id)
    key = str(product_id)

    if key not in cart:
        raise HTTPException(status_code=404, detail="Item not in cart")

    if payload.quantity <= 0:
        del cart[key]
    else:
        cart[key]["quantity"] = payload.quantity

    await _save_cart(redis, session_id, cart)
    return _build_response(session_id, cart)


@router.delete("/{session_id}/{product_id}", response_model=CartResponse)
async def remove_from_cart(
    session_id: str,
    product_id: int,
    redis: Redis = Depends(get_redis),
):
    cart = await _load_cart(redis, session_id)
    cart.pop(str(product_id), None)
    await _save_cart(redis, session_id, cart)
    return _build_response(session_id, cart)


@router.delete("/{session_id}", response_model=CartResponse)
async def clear_cart(session_id: str, redis: Redis = Depends(get_redis)):
    await redis.delete(_cart_key(session_id))
    return _build_response(session_id, {})
