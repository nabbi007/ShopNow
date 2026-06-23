"""Unit tests for product schema validation (the rules added in hardening)."""
import pytest
from pydantic import ValidationError

from app.schemas.product import ProductCreate, ProductUpdate


def test_valid_product():
    p = ProductCreate(name="Widget", price=9.99, stock=3)
    assert p.price == 9.99
    assert p.stock == 3


def test_price_must_be_positive():
    with pytest.raises(ValidationError):
        ProductCreate(name="Widget", price=0, stock=1)
    with pytest.raises(ValidationError):
        ProductCreate(name="Widget", price=-5, stock=1)


def test_stock_cannot_be_negative():
    with pytest.raises(ValidationError):
        ProductCreate(name="Widget", price=1.0, stock=-1)


def test_update_rejects_bad_values_but_allows_partial():
    # Partial update with only a valid field is fine.
    assert ProductUpdate(stock=10).stock == 10
    with pytest.raises(ValidationError):
        ProductUpdate(price=-1)
