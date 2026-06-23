from pydantic import BaseModel
from app.models.order import OrderStatus


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    quantity: int
    unit_price: float

    model_config = {"from_attributes": True}


class OrderCreate(BaseModel):
    # customer_name/email are intentionally NOT accepted from the client; the
    # server derives them from the authenticated user (see routes/orders.py).
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
