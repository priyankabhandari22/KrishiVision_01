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

MONGODB_URI = os.getenv(
    "KRISHIVISION_MONGODB_URI",
    "mongodb://localhost:27017/KrishiVisonDb",
)
MONGODB_DATABASE = os.getenv("KRISHIVISION_MONGODB_DATABASE", "KrishiVisonDb")
MONGODB_COLLECTION = os.getenv("KRISHIVISION_MONGODB_COLLECTION", "prediction_history")

_DATA_DIR = Path(__file__).resolve().parents[1] / "data"
_HISTORY_FILE = _DATA_DIR / "history_store.json"
_mongo_client = None
_mongo_collection = None
_mongo_checked = False


def _get_mongo_collection():
    """Connect once and return the history collection, or None if unavailable."""
    global _mongo_client, _mongo_collection, _mongo_checked
    if _mongo_checked:
        return _mongo_collection

    _mongo_checked = True
    try:
        from pymongo import ASCENDING, MongoClient

        _mongo_client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=1500)
        _mongo_client.admin.command("ping")
        _mongo_collection = _mongo_client[MONGODB_DATABASE][MONGODB_COLLECTION]
        _mongo_collection.create_index([("timestamp", ASCENDING)])
        logger.info(
            "Connected to MongoDB database '%s', collection '%s'.",
            MONGODB_DATABASE,
            MONGODB_COLLECTION,
        )
    except Exception as exc:
        _mongo_client = None
        _mongo_collection = None
        logger.warning(
            "MongoDB is unavailable at %s; using JSON fallback: %s",
            MONGODB_URI,
            exc,
        )

    return _mongo_collection


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


def _build_record(advisory_data: Dict[str, Any], filename: str) -> Dict[str, Any]:
    prediction_meta = advisory_data.get("prediction") or advisory_data
    return {
        "id": f"pred_{uuid.uuid4().hex[:10]}",
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


def record_prediction(advisory_data: Dict[str, Any], filename: str) -> Dict[str, Any]:
    """Record a prediction in MongoDB, falling back to the local JSON store."""
    record = _build_record(advisory_data, filename)
    collection = _get_mongo_collection()
    if collection is not None:
        collection.insert_one(record)
        return record

    records = _load_json_history()
    records.insert(0, record)
    _save_json_history(records)
    return record


def _matches(record: Dict[str, Any], crop: Optional[str], disease: Optional[str], status: Optional[str]) -> bool:
    return not any(
        value and str(record.get(field, "")).lower() != value.lower()
        for field, value in (("crop", crop), ("disease", disease), ("status", status))
    )


def get_all_history(
    crop: Optional[str] = None,
    disease: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 100,
) -> List[Dict[str, Any]]:
    """Fetch newest history records with optional filters."""
    collection = _get_mongo_collection()
    if collection is not None:
        query = {
            field: value
            for field, value in (("crop", crop), ("disease", disease), ("status", status))
            if value
        }
        return [_normalize_record(record) for record in collection.find(query, {"_id": 0}).sort("timestamp", -1).limit(limit)]

    return [
        _normalize_record(record) for record in _load_json_history()
        if _matches(record, crop, disease, status)
    ][:limit]


def get_prediction_by_id(record_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve one history record by its application-level ID."""
    collection = _get_mongo_collection()
    if collection is not None:
        return collection.find_one({"id": record_id}, {"_id": 0})

    return next((_normalize_record(record) for record in _load_json_history() if record.get("id") == record_id), None)


def clear_history() -> int:
    """Delete all prediction records and return the number removed."""
    collection = _get_mongo_collection()
    if collection is not None:
        return collection.delete_many({}).deleted_count

    records = _load_json_history()
    _save_json_history([])
    return len(records)


def _empty_analytics() -> Dict[str, Any]:
    return {
        "total_predictions": 0,
        "healthy_count": 0,
        "diseased_count": 0,
        "low_confidence_count": 0,
        "average_confidence": 0.0,
        "disease_distribution": [],
        "crop_distribution": {"citrus": 0, "guava": 0},
        "model_benchmarks": {
            "selected_model": "ResNet50",
            "selected_accuracy": 84.09,
            "comparison": [
                {"name": "ResNet50", "accuracy": 84.09, "status": "Production Selected"},
                {"name": "EfficientNet-B0", "accuracy": 77.53, "status": "Evaluated"},
                {"name": "MobileNetV3", "accuracy": 62.12, "status": "Evaluated"},
            ],
        },
    }


def get_analytics_summary() -> Dict[str, Any]:
    """Calculate analytics from the same MongoDB/JSON history source."""
    records = get_all_history(limit=500)
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

    summary = _empty_analytics()
    summary.update({
        "total_predictions": total,
        "healthy_count": healthy_count,
        "diseased_count": diseased_count,
        "low_confidence_count": low_confidence_count,
        "average_confidence": round(average_confidence, 4),
        "disease_distribution": sorted(counts.values(), key=lambda item: item["count"], reverse=True),
        "crop_distribution": crop_counts,
    })
    return summary
