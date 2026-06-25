from common.config import BaseAppSettings


class Settings(BaseAppSettings):
    REDIS_URL: str = "redis://redis:6379"
    # Base URL of the catalog-service (for product lookups).
    CATALOG_URL: str = "http://catalog:8000"


settings = Settings()
