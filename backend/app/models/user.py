from sqlalchemy import String, Integer
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(
        String(200), unique=True, index=True, nullable=False
    )
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    # "customer" (default) or "admin". Gates product-catalog mutations and the
    # admin-only order listing. See app.auth.require_admin.
    role: Mapped[str] = mapped_column(
        String(20), nullable=False, default="customer", server_default="customer"
    )
