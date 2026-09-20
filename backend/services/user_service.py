"""
user_service.py
---------------
MongoDB-backed persistence for KrishiVision app users (farmer accounts).

MongoDB settings reuse the same environment variables as history_service:
  KRISHIVISION_MONGODB_URI
  KRISHIVISION_MONGODB_DATABASE

Users are stored in the "users" collection (or, when MongoDB is unavailable,
in a local JSON file as a development fallback). Passwords are never stored
in plaintext - only the password hash produced by auth_service.
"""

from __future__ import annotations

import json
import logging
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional

from dotenv import load_dotenv

logger = logging.getLogger(__name__)

_PROJECT_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(_PROJECT_ROOT / ".env")

MONGODB_URI = os.getenv(
    "KRISHIVISION_MONGODB_URI",
    "mongodb://localhost:27017/KrishiVisonDb",
)
MONGODB_DATABASE = os.getenv("KRISHIVISION_MONGODB_DATABASE", "KrishiVisonDb")
MONGODB_COLLECTION = os.getenv("KRISHIVISION_MONGODB_USERS_COLLECTION", "users")

_DATA_DIR = Path(__file__).resolve().parents[1] / "data"
_USERS_FILE = _DATA_DIR / "users_store.json"
_mongo_client = None
_mongo_collection = None
_mongo_checked = False


class UserExistsError(Exception):
    """Raised when registering an email that is already registered."""


class UserNotFoundError(Exception):
    """Raised when a user cannot be found by email or id."""


def _get_mongo_collection():
    """Connect once and return the users collection, or None if unavailable."""
    global _mongo_client, _mongo_collection, _mongo_checked
    if _mongo_checked:
        return _mongo_collection

    _mongo_checked = True
    try:
        from pymongo import MongoClient

        _mongo_client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=1500)
        _mongo_client.admin.command("ping")
        _mongo_collection = _mongo_client[MONGODB_DATABASE][MONGODB_COLLECTION]
        _mongo_collection.create_index("email", unique=True)
        logger.info(
            "Connected to MongoDB database '%s', collection '%s'.",
            MONGODB_DATABASE,
            MONGODB_COLLECTION,
        )
    except Exception as exc:
        _mongo_client = None
        _mongo_collection = None
        logger.warning(
            "MongoDB is unavailable at %s; using JSON fallback for users: %s",
            MONGODB_URI,
            exc,
        )

    return _mongo_collection


def _load_json_users() -> list[Dict[str, Any]]:
    _DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not _USERS_FILE.exists():
        return []
    try:
        with open(_USERS_FILE, "r", encoding="utf-8") as file:
            return json.load(file)
    except Exception as exc:
        logger.error("Failed to load JSON users fallback: %s", exc)
        return []


def _save_json_users(users: list[Dict[str, Any]]) -> None:
    _DATA_DIR.mkdir(parents=True, exist_ok=True)
    try:
        with open(_USERS_FILE, "w", encoding="utf-8") as file:
            json.dump(users, file, indent=2, ensure_ascii=False)
    except Exception as exc:
        logger.error("Failed to write JSON users fallback: %s", exc)


def to_public_user(user: Dict[str, Any]) -> Dict[str, str]:
    """Return a safe, password-free user payload for API responses."""
    if user is None:
        return {}
    return {"id": str(user["id"]), "name": user.get("name", ""), "email": user.get("email", "")}


def create_user(name: str, email: str, password_hash: str) -> Dict[str, Any]:
    """Create a new user. Raises UserExistsError when the email is taken."""
    email = email.strip().lower()
    user = {
        "id": f"usr_{uuid.uuid4().hex[:12]}",
        "name": name.strip(),
        "email": email,
        "password_hash": password_hash,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    collection = _get_mongo_collection()
    if collection is not None:
        try:
            collection.insert_one(dict(user))
            return user
        except Exception as exc:
            if "E11000" in str(exc):
                raise UserExistsError(email) from exc
            raise

    users = _load_json_users()
    if any(existing.get("email") == email for existing in users):
        raise UserExistsError(email)
    users.append(user)
    _save_json_users(users)
    return user


def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Find a user by email (case-insensitive) or return None."""
    email = email.strip().lower()
    collection = _get_mongo_collection()
    if collection is not None:
        return collection.find_one({"email": email}, {"_id": 0})
    return next(
        (record for record in _load_json_users() if record.get("email") == email),
        None,
    )


def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Find a user by id or return None."""
    collection = _get_mongo_collection()
    if collection is not None:
        return collection.find_one({"id": user_id}, {"_id": 0})
    return next(
        (record for record in _load_json_users() if record.get("id") == user_id),
        None,
    )


def delete_user(email: str) -> bool:
    """Delete a user by email. Returns True when a user was removed."""
    email = email.strip().lower()
    collection = _get_mongo_collection()
    if collection is not None:
        result = collection.delete_one({"email": email})
        return result.deleted_count > 0

    users = _load_json_users()
    remaining = [record for record in users if record.get("email") != email]
    if len(remaining) == len(users):
        return False
    _save_json_users(remaining)
    return True