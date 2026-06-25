from pydantic import BaseModel

from app.models import OrderStatus


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    quantity: int
    unit_price: float

    model_config = {"from_attributes": True}


class OrderCreate(BaseModel):
    # Identity (name/email) comes from the JWT, never the request body.
    shipping_address: str
    session_id: str


class OrderResponse(BaseModel):
    id: int
    customer_name: str
    customer_email: str
    shipping_address: str
    total_amount: float
    status: OrderStatus
    items: list[OrderItemResponse]

    model_config = {"from_attributes": True}
