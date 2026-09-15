"""
auth.py
-------
Optional API key authentication for deployment.

Set KRISHIVISION_API_KEY in .env to require clients to send
  X-API-Key: <your-key>
on protected routes. When unset, all routes remain open (local demo mode).
"""

from __future__ import annotations

import os

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

_API_KEY = os.getenv("KRISHIVISION_API_KEY", "").strip()
_PUBLIC_PREFIXES = ("/health", "/docs", "/openapi.json", "/redoc", "/favicon.ico", "/assets", "/static", "/frontend")


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
