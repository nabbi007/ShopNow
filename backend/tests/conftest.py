"""Test bootstrap.

Settings (app.config) has required fields with no defaults, so we set dummy
values before any app module is imported. No real DB/Redis connection is made
by these unit tests — the engine is created lazily and never used.
"""
import os

os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://test:test@localhost:5432/test")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379")
os.environ.setdefault("SECRET_KEY", "test-secret-key-0123456789abcdef")
os.environ.setdefault("ENVIRONMENT", "development")
