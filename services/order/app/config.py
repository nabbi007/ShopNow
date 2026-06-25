from common.config import BaseAppSettings, assert_secret_is_safe


class Settings(BaseAppSettings):
    DATABASE_URL: str
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    # Upstream services this one orchestrates at checkout.
    CATALOG_URL: str = "http://catalog:8000"
    CART_URL: str = "http://cart:8000"


settings = Settings()
assert_secret_is_safe(settings)
