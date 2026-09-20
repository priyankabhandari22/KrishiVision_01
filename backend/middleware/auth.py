"""
auth.py
-------
Authentication helpers for KrishiVision.

Two mechanisms coexist:

1. OptionalApiKeyMiddleware - optional deployment API key. When
   KRISHIVISION_API_KEY is set, protected routes require an X-API-Key header.
   When unset, all routes stay open (local demo mode).

2. get_current_user - FastAPI dependency for farmer/app authentication.
   Validates the session token from either the httpOnly cookie set at login
   or an Authorization: Bearer <token> header, then returns the public user.
"""

from __future__ import annotations

import os

from fastapi import Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from backend.services.auth_service import COOKIE_NAME, decode_token
from backend.services.user_service import get_user_by_id, to_public_user

_API_KEY = os.getenv("KRISHIVISION_API_KEY", "").strip()
_PUBLIC_PREFIXES = ("/health", "/docs", "/openapi.json", "/redoc", "/favicon.ico", "/assets", "/static", "/frontend", "/auth")


class OptionalApiKeyMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if not _API_KEY:
            return await call_next(request)

        path = request.url.path
        if request.method == "GET" and (path == "/" or path.startswith(_PUBLIC_PREFIXES)):
            return await call_next(request)

        provided = request.headers.get("X-API-Key", "")
        if provided != _API_KEY:
            return JSONResponse(
                status_code=401,
                content={"detail": "Invalid or missing API key. Set X-API-Key header."},
            )

        return await call_next(request)


async def get_current_user(request: Request):
    """
    Resolve the authenticated app user from the session cookie or bearer token.
    Raises HTTPException(401) when the session is missing, invalid, or expired.
    """
    token = request.cookies.get(COOKIE_NAME, "")

    auth_header = request.headers.get("Authorization", "")
    if not token and auth_header.startswith("Bearer "):
        token = auth_header[len("Bearer "):].strip()

    payload = decode_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated. Please sign in to continue.",
        )

    user = get_user_by_id(payload.get("sub", ""))
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account no longer exists. Please sign in again.",
        )

    return to_public_user(user)