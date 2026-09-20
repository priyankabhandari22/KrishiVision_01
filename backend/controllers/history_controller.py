"""
history_controller.py
--------------------
Controllers handling HTTP requests for prediction history and research analytics.
"""

from __future__ import annotations

from typing import Optional
from fastapi import HTTPException, status
from backend.services.history_service import (
    clear_history,
    get_all_history,
    get_analytics_summary,
    get_prediction_by_id,
)


def handle_get_history(
    user_id: str,
    crop: Optional[str] = None,
    disease: Optional[str] = None,
    status_filter: Optional[str] = None,
    limit: int = 100,
):
    """Retrieve the authenticated user's filtered prediction history."""
    try:
        history = get_all_history(
            user_id=user_id, crop=crop, disease=disease, status=status_filter, limit=limit
        )
        return {"count": len(history), "history": history}
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch history: {exc}",
        )


def handle_get_prediction_by_id(record_id: str, user_id: str):
    """Retrieve a single prediction record owned by the current user.

    Ownership is enforced here so a farmer can never retrieve, or even
    probe for, another user's record - it simply reads as not found.
    """
    record = get_prediction_by_id(record_id, user_id=user_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prediction record with ID '{record_id}' not found.",
        )
    return record


def handle_clear_history(user_id: str):
    """Clear the current user's prediction history only."""
    try:
        cleared_count = clear_history(user_id=user_id)
        return {"message": "History cleared successfully.", "cleared_count": cleared_count}
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear history: {exc}",
        )


def handle_get_analytics(user_id: str):
    """Retrieve personal analytics computed from the current user's records."""
    try:
        return get_analytics_summary(user_id=user_id)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate analytics summary: {exc}",
        )
