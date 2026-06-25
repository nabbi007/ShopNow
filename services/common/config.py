"""Configuration shared by every service.

Each service subclasses BaseAppSettings to add its own DATABASE_URL / REDIS_URL /
upstream URLs. The auth-related values (SECRET_KEY, token lifetime) live here so
all services validate JWTs with the same key.
"""
from pydantic_settings import BaseSettings


class BaseAppSettings(BaseSettings):
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ENVIRONMENT: str = "development"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    # Permissive by default; requests are same-origin through the gateway/ALB,
    # so CORS isn't normally exercised.
    CORS_ORIGINS: list[str] = ["*"]

    class Config:
        env_file = ".env"


_INSECURE_SECRETS = {"dev-secret-key-change-in-production", "change-me", ""}


def assert_secret_is_safe(settings: BaseAppSettings) -> None:
    """Fail fast if a non-dev environment is left on the insecure default key."""
    if settings.ENVIRONMENT != "development" and settings.SECRET_KEY in _INSECURE_SECRETS:
        raise RuntimeError(
            "SECRET_KEY is unset or insecure in a non-development environment. "
            'Generate one with: python -c "import secrets; print(secrets.token_hex(32))"'
        )
