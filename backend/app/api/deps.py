"""
Shared FastAPI dependencies. `get_current_user` is the ONLY place a
request's JWT gets turned into an actual authenticated user.
`require_case_access` is the ONLY place case-level authorization is
decided -- used by cases.py, timeline.py, and hearings.py, so a fix here
fixes it everywhere.
"""
from fastapi import Depends, Header
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.user import User
from app.repositories import user_repository
from app.schemas.common import AppError
from app.security.jwt import decode_access_token


async def get_current_user(
    authorization: str | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise AppError("UNAUTHORIZED", "Missing or malformed Authorization header.", status_code=401)

    token = authorization.removeprefix("Bearer ").strip()
    try:
        payload = decode_access_token(token)
    except JWTError:
        raise AppError("UNAUTHORIZED", "Invalid or expired token.", status_code=401)

    user = await user_repository.get_by_id(db, payload["sub"])
    if not user or not user.is_active:
        raise AppError("UNAUTHORIZED", "User no longer exists or is inactive.", status_code=401)

    return user


async def get_current_user_optional(
    authorization: str | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    if not authorization:
        return None
    try:
        return await get_current_user(authorization, db)
    except AppError:
        return None


async def require_case_access(case_id: str, current_user: User, db: AsyncSession):
    """
    Two ways in: you own the case, or you're a lawyer with an ACCEPTED
    escalation on it. Defined once so a fix here fixes it everywhere,
    instead of three copies of the same security check quietly drifting
    apart.
    """
    from app.repositories import case_repository, escalation_repository

    case = await case_repository.get_by_id(db, case_id)
    if not case:
        raise AppError("NOT_FOUND", "Case not found.", status_code=404)

    if case.owner_user_id == current_user.id or case.owner_lawyer_id == current_user.id:
        return case

    has_access = await escalation_repository.has_accepted_access(db, case_id, current_user.id)
    if not has_access:
        raise AppError("FORBIDDEN", "You do not have access to this case.", status_code=403)

    return case