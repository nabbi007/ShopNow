import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.config import settings
from app.database import engine, Base
from app.models import Product, Order, OrderItem, User
from app.rate_limit import limiter
from app.routes import products, cart, orders, auth

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger("shopnow")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting ShopNow API (environment=%s)", settings.ENVIRONMENT)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()
    logger.info("ShopNow API shut down")


app = FastAPI(
    title="ShopNow API",
    description="E-commerce backend for ShopNow",
    version="1.0.0",
    lifespan=lifespan,
)

# Rate limiting (slowapi): returns HTTP 429 when a client exceeds a route's
# limit. Per-route limits are declared with @limiter.limit in the route modules.
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(products.router, prefix="/api")
app.include_router(cart.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(auth.router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "shopnow-backend"}
