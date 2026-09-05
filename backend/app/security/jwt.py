"""
JWT creation and verification.

The token payload (`sub`, `role`) is the ONLY thing ever trusted for
authorization. Critically -- see Phase 0 Finding, the login request itself
carries a `role` field from the client for UX reasons (pre-filling which
form was used), but that field is NEVER trusted here. The role that ends
up in the token comes from the `User` row in the database, looked up by
email, not from anything the client sent. A request claiming
`"role": "LAWYER"` for a citizen's account gets a token with `role: CITIZEN`
regardless -- see app/services/auth_service.py for where this is enforced.
"""
from datetime import datetime, timedelta, timezone

from jose import jwt, JWTError

from app.core.config import settings


def create_access_token(user_id: str, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    payload = {"sub": user_id, "role": role, "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    """Raises jose.JWTError if the token is invalid, tampered with, or expired."""
    return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
