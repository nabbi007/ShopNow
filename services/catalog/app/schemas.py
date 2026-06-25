from typing import Optional

from pydantic import BaseModel, Field


class ProductBase(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    description: Optional[str] = None
    price: float = Field(gt=0)
    stock: int = Field(default=0, ge=0)
    image_url: Optional[str] = None
    category: Optional[str] = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = None
    price: Optional[float] = Field(default=None, gt=0)
    stock: Optional[int] = Field(default=None, ge=0)
    image_url: Optional[str] = None
    category: Optional[str] = None


class ProductResponse(ProductBase):
    id: int

    model_config = {"from_attributes": True}


class DecrementRequest(BaseModel):
    quantity: int = Field(gt=0)
