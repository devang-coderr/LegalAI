"""
The response envelope every endpoint returns, matching the frontend's
existing contract exactly (verified against types/api.ts during Phase 0):

    { "success": true, "data": {...}, "message": null, "error": null, "meta": null }
    { "success": false, "data": null, "message": "...", "error": {code, message, details}, "meta": null }

Every route in this project returns `Envelope[SomeSchema]` on success. Errors
are NOT built by hand in each route -- raise `AppError` (below) and the
global exception handler in main.py converts it to the error shape
automatically, with the right HTTP status code. This is what keeps the
error format consistent across 20+ endpoints without repeating the same
try/except in every single one.
"""
from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel, ConfigDict

T = TypeVar("T")

class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=lambda s: "".join(
            word.capitalize() if i else word
            for i, word in enumerate(s.split("_"))
        ),
        populate_by_name=True,
    )


class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[dict[str, Any]] = None


class Envelope(BaseModel, Generic[T]):
    success: bool
    data: Optional[T] = None
    message: Optional[str] = None
    error: Optional[ErrorDetail] = None
    meta: Optional[dict[str, Any]] = None


class AppError(Exception):
    """
    Raise this from any service/repository when something goes wrong in a
    way the caller needs a clean, typed error for -- not a bare Exception,
    not a raw HTTPException. main.py's exception handler catches this and
    builds the error envelope automatically.

    Example: raise AppError("NOT_FOUND", "Case not found", status_code=404)
    """

    def __init__(self, code: str, message: str, status_code: int = 400, details: dict | None = None):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(message)
