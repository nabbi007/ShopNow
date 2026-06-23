import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from redis.asyncio import Redis
from app.database import get_db
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.schemas.order import OrderCreate, OrderResponse
from app.dependencies import get_redis
from app.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def place_order(
    payload: OrderCreate,
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
    current_user: User = Depends(get_current_user),
):
    raw = await redis.get(f"cart:{payload.session_id}")
    if not raw:
        raise HTTPException(status_code=400, detail="Cart is empty or session expired")

    cart = json.loads(raw)
    if not cart:
        raise HTTPException(status_code=400, detail="Cart is empty")

    order_items = []
    total = 0.0

    for key, item in cart.items():
        product = await db.get(Product, item["product_id"])
        if not product:
            raise HTTPException(
                status_code=404, detail=f"Product {item['product_id']} not found"
            )
        if product.stock < item["quantity"]:
            raise HTTPException(
                status_code=400, detail=f"Insufficient stock for {product.name}"
            )
        product.stock -= item["quantity"]
        subtotal = float(product.price) * item["quantity"]
        total += subtotal
        order_items.append(
            OrderItem(
                product_id=product.id,
                product_name=product.name,
                quantity=item["quantity"],
                unit_price=float(product.price),
            )
        )

    order = Order(
        customer_name=payload.customer_name,
        customer_email=payload.customer_email,
        shipping_address=payload.shipping_address,
        total_amount=round(total, 2),
        items=order_items,
    )
    db.add(order)
    await db.commit()
    await db.refresh(order)

    await redis.delete(f"cart:{payload.session_id}")

    return order


@router.get("/", response_model=list[OrderResponse])
async def list_orders(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Order))
    return result.scalars().all()


# NOTE: declared before "/{order_id}" so "me" isn't matched as an int path param.
@router.get("/me", response_model=list[OrderResponse])
async def my_orders(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Order)
        .where(Order.customer_email == current_user.email)
        .order_by(Order.id.desc())
    )
    return result.scalars().all()


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int, db: AsyncSession = Depends(get_db)):
    order = await db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
