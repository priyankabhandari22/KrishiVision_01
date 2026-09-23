"""
user_service.py
---------------
MongoDB-backed persistence for KrishiVision app users (farmer accounts).

MongoDB settings support:
  KRISHIVISION_MONGODB_URI / MONGO_URI / MONGODB_URI
  KRISHIVISION_MONGODB_DATABASE / MONGO_DATABASE

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

_DATA_DIR = Path(__file__).resolve().parents[1] / "data"
_USERS_FILE = _DATA_DIR / "users_store.json"
_mongo_client = None
_mongo_collection = None


class UserExistsError(Exception):
    """Raised when registering an email that is already registered."""


class UserNotFoundError(Exception):
    """Raised when a user cannot be found by email or id."""


def _get_mongo_uri() -> str:
    return (
        os.getenv("KRISHIVISION_MONGODB_URI")
        or os.getenv("MONGO_URI")
        or os.getenv("MONGODB_URI")
        or "mongodb://localhost:27017/KrishiVisonDb"
    ).strip()


def _get_mongo_collection():
    """Connect and return the users collection, or None if unavailable."""
    global _mongo_client, _mongo_collection
    if _mongo_collection is not None:
        return _mongo_collection

    uri = _get_mongo_uri()
    db_name = os.getenv("KRISHIVISION_MONGODB_DATABASE", os.getenv("MONGO_DATABASE", "KrishiVisonDb"))
    coll_name = os.getenv("KRISHIVISION_MONGODB_USERS_COLLECTION", "users")

    try:
        from pymongo import MongoClient

        client = MongoClient(uri, serverSelectionTimeoutMS=2500)
        client.admin.command("ping")
        collection = client[db_name][coll_name]
        collection.create_index("email", unique=True)
        _mongo_client = client
        _mongo_collection = collection
        logger.info(
            "Connected to MongoDB database '%s', collection '%s'.",
            db_name,
            coll_name,
        )
        return _mongo_collection
    except Exception as exc:
        _mongo_client = None
        _mongo_collection = None
        logger.warning(
            "MongoDB is unavailable at %s; using JSON fallback for users: %s",
            uri,
            exc,
        )
        return None


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


def _format_user(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    if doc is None:
        return None
    user = dict(doc)
    user["id"] = str(user.get("id") or user.get("_id") or "")
    user.pop("_id", None)
    return user


def to_public_user(user: Dict[str, Any]) -> Dict[str, str]:
    """Return a safe, password-free user payload for API responses."""
    if not user:
        return {}
    uid = str(user.get("id") or user.get("_id") or "")
    return {"id": uid, "name": user.get("name", ""), "email": user.get("email", "")}


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
        doc = collection.find_one({"email": email})
        return _format_user(doc)
    return next(
        (record for record in _load_json_users() if record.get("email") == email),
        None,
    )


def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Find a user by id or _id ObjectId or return None."""
    collection = _get_mongo_collection()
    if collection is not None:
        doc = collection.find_one({"id": user_id})
        if doc is None and len(user_id) == 24:
            try:
                from bson.objectid import ObjectId

                doc = collection.find_one({"_id": ObjectId(user_id)})
            except Exception:
                doc = None
        return _format_user(doc)

    return next(
        (record for record in _load_json_users() if str(record.get("id")) == str(user_id)),
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