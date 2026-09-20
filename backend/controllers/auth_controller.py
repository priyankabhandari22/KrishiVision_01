"""
auth_controller.py
------------------
Handlers for /auth endpoints: register, login, me, logout.

Sessions are delivered as signed JWTs in an httpOnly cookie so the browser
never has access to the raw token (mitigates XSS token theft). The same
token is also surfaced as a response field for script-based integrations.
"""

from __future__ import annotations

import logging
from typing import Any, Dict

from fastapi import Request
from fastapi.responses import JSONResponse

from backend.models import AuthResponse, AuthUserResponse, RegisterRequest
from backend.services.auth_service import (
    COOKIE_NAME,
    COOKIE_SECURE,
    TOKEN_EXPIRE_HOURS,
    create_token,
    hash_password,
    verify_password,
)
from backend.services.user_service import (
    UserExistsError,
    create_user,
    get_user_by_email,
    to_public_user,
)

logger = logging.getLogger(__name__)


def _cookie_kwargs() -> Dict[str, Any]:
    from datetime import timedelta

    return {
        "key": COOKIE_NAME,
        "httponly": True,
        "secure": COOKIE_SECURE,
        "samesite": "lax",
        "max_age": TOKEN_EXPIRE_HOURS * 3600,
        "path": "/",
    }


def _auth_response(user: Dict[str, Any]) -> JSONResponse:
    token = create_token(user)
    response = JSONResponse(
        content=AuthResponse(
            user=AuthUserResponse(**to_public_user(user)),
            message="ok",
        ).model_dump(),
    )
    response.set_cookie(value=token, **_cookie_kwargs())
    return response


def handle_register(payload: RegisterRequest) -> JSONResponse:
    """Register a new farmer account and start an authenticated session."""
    try:
        password_hash = hash_password(payload.password)
        user = create_user(
            name=payload.name,
            email=payload.email,
            password_hash=password_hash,
        )
    except UserExistsError:
        return JSONResponse(
            status_code=409,
            content={"detail": "An account with this email already exists. Try signing in instead."},
        )

    logger.info("Registered new user: %s", payload.email)
    response = _auth_response(user)
    response.status_code = 201
    return response


def handle_login(email: str, password: str) -> JSONResponse:
    """Authenticate an existing user and start an authenticated session."""
    user = get_user_by_email(email)
    if user is None or not verify_password(password, user.get("password_hash", "")):
        return JSONResponse(
            status_code=401,
            content={
                "detail": "Invalid email or password. Please check your details and try again.",
            },
        )

    logger.info("User signed in: %s", email)
    return _auth_response(user)


def handle_me(user: Dict[str, Any]) -> JSONResponse:
    """Return the currently authenticated user."""
    return JSONResponse(
        content=AuthResponse(
            user=AuthUserResponse(**user),
            message="ok",
        ).model_dump(),
    )


def handle_logout() -> JSONResponse:
    """Clear the session cookie. Does not touch prediction history."""
    response = JSONResponse(content={"message": "Signed out successfully."})
    response.delete_cookie(COOKIE_NAME, path="/")
    return response