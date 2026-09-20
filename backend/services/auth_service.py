"""
auth_service.py
---------------
Password hashing and JWT session handling for KrishiVision.

Passwords are hashed with PBKDF2-HMAC-SHA256 (stdlib only, ~210k iterations)
and stored as:  pbkdf2_sha256$<iterations>$<salt_hex>$<hash_hex>

Sessions use signed JSON Web Tokens. Configuration comes from environment
variables (see .env.example):
  KRISHIVISION_JWT_SECRET
  KRISHIVISION_TOKEN_EXPIRE_HOURS
  KRISHIVISION_COOKIE_NAME
  KRISHIVISION_COOKIE_SECURE
"""

from __future__ import annotations

import hashlib
import hmac
import logging
import os
import secrets
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, Optional

import jwt
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

_PROJECT_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(_PROJECT_ROOT / ".env")

JWT_SECRET = os.getenv("KRISHIVISION_JWT_SECRET", "").strip()
JWT_ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = int(os.getenv("KRISHIVISION_TOKEN_EXPIRE_HOURS", "168"))
COOKIE_NAME = os.getenv("KRISHIVISION_COOKIE_NAME", "krishivision_token")
COOKIE_SECURE = os.getenv("KRISHIVISION_COOKIE_SECURE", "false").strip().lower() in ("1", "true", "yes")

PBKDF2_ITERATIONS = 210_000
PBKDF2_HASH_NAME = "pbkdf2_sha256"
HASH_LENGTH = 32


# ---------------------------------------------------------------------------
# Password hashing
# ---------------------------------------------------------------------------
def hash_password(password: str) -> str:
    """Hash a password with PBKDF2 and a fresh random salt."""
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        PBKDF2_ITERATIONS,
        dklen=HASH_LENGTH,
    )
    return "{0}${1}${2}${3}".format(
        PBKDF2_HASH_NAME,
        PBKDF2_ITERATIONS,
        salt.hex(),
        digest.hex(),
    )


def verify_password(password: str, stored_hash: str) -> bool:
    """Verify a password against a stored pbkdf2_sha256 hash (timing safe)."""
    if not stored_hash:
        return False
    try:
        name, iterations_str, salt_hex, hash_hex = stored_hash.split("$")
        if name != PBKDF2_HASH_NAME:
            return False
        iterations = int(iterations_str)
        salt = bytes.fromhex(salt_hex)
        expected = bytes.fromhex(hash_hex)
    except (ValueError, AttributeError):
        return False

    actual = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        iterations,
        dklen=len(expected),
    )
    return hmac.compare_digest(actual, expected)


# ---------------------------------------------------------------------------
# JWT sessions
# ---------------------------------------------------------------------------
def _now():
    return datetime.now(timezone.utc)


def create_token(user: Dict[str, Any]) -> str:
    """Create a signed JWT for a user dict (id, name, email)."""
    payload = {
        "sub": user["id"],
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "iat": _now(),
        "exp": _now() + timedelta(hours=TOKEN_EXPIRE_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """Validate a JWT and return its payload, or None when invalid/expired."""
    if not token:
        return None
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError as exc:
        logger.debug("JWT validation failed: %s", exc)
        return None