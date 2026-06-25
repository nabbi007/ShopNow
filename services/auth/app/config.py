from common.config import BaseAppSettings, assert_secret_is_safe


class Settings(BaseAppSettings):
    DATABASE_URL: str
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10


settings = Settings()
assert_secret_is_safe(settings)
