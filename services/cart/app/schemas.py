from typing import Optional

from pydantic import BaseModel


class CartItem(BaseModel):
    product_id: int
    name: str
    price: float
    quantity: int
    image_url: Optional[str] = None


class CartResponse(BaseModel):
    session_id: str
    items: list[CartItem]
    total: float


class AddToCartRequest(BaseModel):
    product_id: int
    quantity: int = 1


class UpdateCartRequest(BaseModel):
    quantity: int
