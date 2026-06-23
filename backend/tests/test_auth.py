"""Unit tests for auth helpers (no DB required)."""
import jwt

from app.auth import hash_password, verify_password, create_access_token
from app.config import settings


def test_password_hash_round_trip():
    hashed = hash_password("S3cret!pass")
    assert hashed != "S3cret!pass"           # never store plaintext
    assert verify_password("S3cret!pass", hashed)
    assert not verify_password("wrong", hashed)


def test_verify_password_handles_bad_hash():
    # Malformed hash must not raise, just fail verification.
    assert verify_password("whatever", "not-a-real-hash") is False


def test_access_token_encodes_subject():
    token = create_access_token(42)
    decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    assert decoded["sub"] == "42"
    assert "exp" in decoded
