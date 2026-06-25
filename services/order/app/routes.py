import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.clients import get_cart, clear_cart, decrement_stock
from app.database import get_db
from app.models import Order, OrderItem
from app.schemas import OrderCreate, OrderResponse
from common.security import get_current_principal, require_admin, Principal

router = APIRouter(prefix="/api/orders", tags=["orders"])
logger = logging.getLogger("shopnow.order")

NOT_FOUND = "Order not found"


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def place_order(
    payload: OrderCreate,
    db: AsyncSession = Depends(get_db),
    principal: Principal = Depends(get_current_principal),
):
    cart = await get_cart(payload.session_id)
    items = cart.get("items", [])
    if not items:
        raise HTTPException(status_code=400, detail="Cart is empty or session expired")

    # Reserve stock in the catalog (authoritative price comes back), then build
    # the order line items. NOTE: if a later item fails, earlier decrements are
    # not compensated — a production system would wrap this in a saga/outbox.
    order_items = []
    total = 0.0
    for item in items:
        product = await decrement_stock(item["product_id"], item["quantity"])
        unit_price = float(product["price"])
        total += unit_price * item["quantity"]
        order_items.append(
            OrderItem(
                product_id=product["id"],
                product_name=product["name"],
                quantity=item["quantity"],
                unit_price=unit_price,
            )
        )

    order = Order(
        customer_name=principal.name or principal.email or "Customer",
        customer_email=principal.email or "",
        shipping_address=payload.shipping_address,
        total_amount=round(total, 2),
        items=order_items,
    )
    db.add(order)
    await db.commit()
    await db.refresh(order)

    await clear_cart(payload.session_id)
    logger.info("Order %s placed by user_id=%s total=%.2f", order.id, principal.id, order.total_amount)
    return order


@router.get("/", response_model=list[OrderResponse])
async def list_orders(
    db: AsyncSession = Depends(get_db), _admin: Principal = Depends(require_admin)
):
    """Admin-only: every order. Customers use /me."""
    result = await db.execute(select(Order))
    return result.scalars().all()


# Declared before "/{order_id}" so "me" isn't matched as an int path param.
@router.get("/me", response_model=list[OrderResponse])
async def my_orders(
    db: AsyncSession = Depends(get_db),
    principal: Principal = Depends(get_current_principal),
):
    result = await db.execute(
        select(Order).where(Order.customer_email == principal.email).order_by(Order.id.desc())
    )
    return result.scalars().all()


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    principal: Principal = Depends(get_current_principal),
):
    order = await db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail=NOT_FOUND)
    if order.customer_email != principal.email and principal.role != "admin":
        raise HTTPException(status_code=404, detail=NOT_FOUND)
    return order
