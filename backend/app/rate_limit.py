"""Shared rate limiter.

Defined in its own module so both app.main (to register the middleware and
exception handler) and the route modules (to apply @limiter.limit) can import
it without a circular import.
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
