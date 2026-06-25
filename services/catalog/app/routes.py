from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Product
from app.schemas import ProductCreate, ProductUpdate, ProductResponse, DecrementRequest
from common.security import require_admin, Principal

router = APIRouter(prefix="/api/products", tags=["products"])

NOT_FOUND = "Product not found"


@router.get("/", response_model=list[ProductResponse])
async def list_products(category: str | None = None, db: AsyncSession = Depends(get_db)):
    query = select(Product)
    if category:
        query = query.where(Product.category == category)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail=NOT_FOUND)
    return product


@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    payload: ProductCreate,
    db: AsyncSession = Depends(get_db),
    _admin: Principal = Depends(require_admin),
):
    product = Product(**payload.model_dump())
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return product


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: Principal = Depends(require_admin),
):
    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail=NOT_FOUND)
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(product, field, value)
    await db.commit()
    await db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: Principal = Depends(require_admin),
):
    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail=NOT_FOUND)
    await db.delete(product)
    await db.commit()


# --- Internal endpoint: called by order-service at checkout -----------------
@router.post("/{product_id}/decrement", response_model=ProductResponse)
async def decrement_stock(
    product_id: int, payload: DecrementRequest, db: AsyncSession = Depends(get_db)
):
    """Atomically reduce stock for a purchase. Service-to-service use only."""
    product = await db.get(Product, product_id, with_for_update=True)
    if not product:
        raise HTTPException(status_code=404, detail=NOT_FOUND)
    if product.stock < payload.quantity:
        raise HTTPException(
            status_code=409, detail=f"Insufficient stock for {product.name}"
        )
    product.stock -= payload.quantity
    await db.commit()
    await db.refresh(product)
    return product
