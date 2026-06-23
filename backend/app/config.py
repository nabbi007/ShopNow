from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    REDIS_URL: str
    SECRET_KEY: str
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://frontend:3000"]

    # "development" relaxes a few safety checks (e.g. allows the default
    # SECRET_KEY). Set ENVIRONMENT=production in real deployments.
    ENVIRONMENT: str = "development"

    # Access-token lifetime. Keep short; clients re-authenticate when it expires.
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # DB connection pool (see app/database.py).
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20

    class Config:
        env_file = ".env"


settings = Settings()

# Fail fast in production if the SECRET_KEY was left at an insecure default.
_INSECURE_SECRETS = {"dev-secret-key-change-in-production", "change-me", ""}
if settings.ENVIRONMENT != "development" and settings.SECRET_KEY in _INSECURE_SECRETS:
    raise RuntimeError(
        "SECRET_KEY is unset or using an insecure default in a non-development "
        "environment. Generate one with: python -c "
        '"import secrets; print(secrets.token_hex(32))"'
    )
