"""
history_service.py
------------------
MongoDB-backed persistence for KrishiVision prediction history and analytics.

MongoDB settings can be overridden with environment variables:
  KRISHIVISION_MONGODB_URI
  KRISHIVISION_MONGODB_DATABASE
  KRISHIVISION_MONGODB_COLLECTION

The default URI is the local MongoDB instance requested for this project.
JSON storage remains a development fallback when MongoDB is unavailable.
"""

from __future__ import annotations

import json
import logging
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv

logger = logging.getLogger(__name__)

_PROJECT_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(_PROJECT_ROOT / ".env")

def _get_mongo_uri() -> str:
    return (
        os.getenv("KRISHIVISION_MONGODB_URI")
        or os.getenv("MONGO_URI")
        or os.getenv("MONGODB_URI")
        or "mongodb://localhost:27017/KrishiVisonDb"
    ).strip()


def _get_mongo_collection():
    """Connect and return the history collection, or None if unavailable."""
    global _mongo_client, _mongo_collection
    if _mongo_collection is not None:
        return _mongo_collection

    uri = _get_mongo_uri()
    db_name = os.getenv("KRISHIVISION_MONGODB_DATABASE", os.getenv("MONGO_DATABASE", "KrishiVisonDb"))
    coll_name = os.getenv("KRISHIVISION_MONGODB_COLLECTION", "prediction_history")

    try:
        from pymongo import ASCENDING, MongoClient

        client = MongoClient(uri, serverSelectionTimeoutMS=2500)
        client.admin.command("ping")
        collection = client[db_name][coll_name]
        collection.create_index([("timestamp", ASCENDING)])
        collection.create_index([("user_id", ASCENDING), ("timestamp", ASCENDING)])
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
            "MongoDB is unavailable at %s; using JSON fallback: %s",
            uri,
            exc,
        )
        return None


def _load_json_history() -> List[Dict[str, Any]]:
    _DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not _HISTORY_FILE.exists():
        return []
    try:
        with open(_HISTORY_FILE, "r", encoding="utf-8") as file:
            return json.load(file)
    except Exception as exc:
        logger.error("Failed to load JSON history fallback: %s", exc)
        return []


def _save_json_history(records: List[Dict[str, Any]]) -> None:
    _DATA_DIR.mkdir(parents=True, exist_ok=True)
    try:
        with open(_HISTORY_FILE, "w", encoding="utf-8") as file:
            json.dump(records, file, indent=2, ensure_ascii=False)
    except Exception as exc:
        logger.error("Failed to write JSON history fallback: %s", exc)


def _build_record(advisory_data: Dict[str, Any], filename: str, user_id: Optional[str] = None) -> Dict[str, Any]:
    prediction_meta = advisory_data.get("prediction") or advisory_data
    return {
        "id": f"pred_{uuid.uuid4().hex[:10]}",
        "user_id": user_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "filename": filename,
        "crop": prediction_meta.get("crop", "unknown"),
        "disease": prediction_meta.get("disease", "unknown"),
        "status": prediction_meta.get("status", "unknown"),
        "confidence": prediction_meta.get("confidence", 0.0),
        "is_confident": prediction_meta.get("is_confident", True),
        "heatmap_path": prediction_meta.get("heatmap_path"),
        "explanation": advisory_data.get("explanation", ""),
        "immediate_actions_count": len(advisory_data.get("immediate_actions", [])),
        "disclaimer": advisory_data.get("disclaimer", ""),
        "full_advisory": advisory_data,
    }


def _normalize_record(record: Dict[str, Any]) -> Dict[str, Any]:
    """Backfill top-level fields for records created before history schema fixes."""
    advisory = record.get("full_advisory") or {}
    prediction = advisory.get("prediction") or advisory
    for field in ("crop", "disease", "status", "confidence", "is_confident", "heatmap_path"):
        if field in prediction:
            record[field] = prediction[field]
    if advisory.get("explanation") and not record.get("explanation"):
        record["explanation"] = advisory["explanation"]
    return record


def record_prediction(advisory_data: Dict[str, Any], filename: str, user_id: Optional[str] = None) -> Dict[str, Any]:
    """Record a prediction in MongoDB, falling back to the local JSON store.

    The owning user's ID is supplied by the authenticated session, never by
    the client, so records can be isolated per farmer.
    """
    record = _build_record(advisory_data, filename, user_id=user_id)
    collection = _get_mongo_collection()
    if collection is not None:
        collection.insert_one(record)
        return record

    records = _load_json_history()
    records.insert(0, record)
    _save_json_history(records)
    return record


def _matches(
    record: Dict[str, Any],
    crop: Optional[str],
    disease: Optional[str],
    status: Optional[str],
    user_id: Optional[str] = None,
) -> bool:
    if user_id is not None and record.get("user_id") != user_id:
        return False
    return not any(
        value and str(record.get(field, "")).lower() != value.lower()
        for field, value in (("crop", crop), ("disease", disease), ("status", status))
    )


def get_all_history(
    user_id: Optional[str] = None,
    crop: Optional[str] = None,
    disease: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 100,
) -> List[Dict[str, Any]]:
    """Fetch newest history records with optional filters.

    When ``user_id`` is provided, only records owned by that user are
    returned. Legacy records without a ``user_id`` owner are excluded so one
    farmer never sees another farmer's (or the shared legacy) predictions.
    """
    collection = _get_mongo_collection()
    if collection is not None:
        query = {"user_id": user_id}
        query.update({
            field: value
            for field, value in (("crop", crop), ("disease", disease), ("status", status))
            if value
        })
        return [_normalize_record(record) for record in collection.find(query, {"_id": 0}).sort("timestamp", -1).limit(limit)]

    return [
        _normalize_record(record) for record in _load_json_history()
        if _matches(record, crop, disease, status, user_id=user_id)
    ][:limit]


def get_prediction_by_id(record_id: str, user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Retrieve one history record by its application-level ID.

    When ``user_id`` is provided, the record is only returned when it belongs
    to that user - so callers can never discover or open another user's record.
    """
    collection = _get_mongo_collection()
    if collection is not None:
        query = {"id": record_id}
        if user_id is not None:
            query["user_id"] = user_id
        return collection.find_one(query, {"_id": 0})

    if user_id is None:
        return next((_normalize_record(record) for record in _load_json_history() if record.get("id") == record_id), None)
    return next(
        (_normalize_record(record) for record in _load_json_history()
         if record.get("id") == record_id and record.get("user_id") == user_id),
        None,
    )


def clear_history(user_id: Optional[str] = None) -> int:
    """Delete prediction records and return the number removed.

    When ``user_id`` is provided only that user's records are deleted, so a
    farmer can never clear another user's (or the shared legacy) history.
    """
    collection = _get_mongo_collection()
    if collection is not None:
        if user_id is None:
            return collection.delete_many({}).deleted_count
        return collection.delete_many({"user_id": user_id}).deleted_count

    records = _load_json_history()
    if user_id is None:
        _save_json_history([])
        return len(records)
    remaining = [record for record in records if record.get("user_id") != user_id]
    _save_json_history(remaining)
    return len(records) - len(remaining)


def _empty_analytics() -> Dict[str, Any]:
    return {
        "total_predictions": 0,
        "healthy_count": 0,
        "diseased_count": 0,
        "low_confidence_count": 0,
        "average_confidence": 0.0,
        "last_scan_confidence": None,
        "last_scan_at": None,
        "disease_distribution": [],
        "crop_distribution": {"citrus": 0, "guava": 0},
        "model_benchmarks": {
            "selected_model": "ResNet50",
            "selected_accuracy": 90.52,
            "per_crop_accuracy": {"guava": 93.75, "citrus": 88.82},
            "comparison": [
                {"name": "ResNet50", "accuracy": 90.52, "status": "Production Selected"},
                {"name": "EfficientNet-B0", "accuracy": 82.76, "status": "Evaluated"},
                {"name": "MobileNetV3", "accuracy": 80.61, "status": "Evaluated"},
            ],
        },
    }


def get_analytics_summary(user_id: Optional[str] = None) -> Dict[str, Any]:
    """Calculate personal analytics from the authenticated user's records only.

    When ``user_id`` is provided all counts and distributions are scoped to
    that user. Legacy records without an owner never leak into a farmer's
    analytics.
    """
    records = get_all_history(user_id=user_id, limit=500)
    if not records:
        return _empty_analytics()

    total = len(records)
    healthy_count = sum(record.get("status") == "healthy" for record in records)
    diseased_count = sum(record.get("status") == "diseased" for record in records)
    low_confidence_count = sum(not record.get("is_confident", True) for record in records)
    average_confidence = sum(float(record.get("confidence", 0.0)) for record in records) / total
    counts: Dict[str, Dict[str, Any]] = {}
    crop_counts = {"citrus": 0, "guava": 0}

    for record in records:
        crop = str(record.get("crop", "unknown")).lower()
        disease = record.get("disease", "unknown")
        if crop in crop_counts:
            crop_counts[crop] += 1
        key = f"{crop.capitalize()} - {disease}"
        counts.setdefault(key, {
            "label": key,
            "crop": crop,
            "disease": disease,
            "count": 0,
            "status": record.get("status", "diseased"),
        })["count"] += 1

    most_recent = records[0]
    summary = _empty_analytics()
    summary.update({
        "total_predictions": total,
        "healthy_count": healthy_count,
        "diseased_count": diseased_count,
        "low_confidence_count": low_confidence_count,
        "average_confidence": round(average_confidence, 4),
        "last_scan_confidence": round(float(most_recent.get("confidence", 0.0)), 4) if most_recent.get("confidence") is not None else None,
        "last_scan_at": most_recent.get("timestamp"),
        "disease_distribution": sorted(counts.values(), key=lambda item: item["count"], reverse=True),
        "crop_distribution": crop_counts,
    })
    return summary
