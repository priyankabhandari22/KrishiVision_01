"""
history.py
----------
REST endpoints for prediction history logs and research analytics.
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from backend.controllers import (
    handle_clear_history,
    handle_get_analytics,
    handle_get_history,
    handle_get_prediction_by_id,
)
from backend.middleware import get_current_user
from backend.models import AnalyticsSummary, HistoryListResponse

router = APIRouter(tags=["History & Analytics"])


@router.get(
    "/history",
    response_model=HistoryListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Prediction History",
    description="Returns the authenticated user's leaf disease diagnosis history. Requires an authenticated session.",
)
async def get_history(
    crop: Optional[str] = Query(None, description="Filter by crop ('citrus' or 'guava')"),
    disease: Optional[str] = Query(None, description="Filter by disease name"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by health status ('healthy' or 'diseased')"),
    limit: int = Query(100, ge=1, le=500, description="Max records to return"),
    user: dict = Depends(get_current_user),
):
    return handle_get_history(user_id=user["id"], crop=crop, disease=disease, status_filter=status_filter, limit=limit)


@router.get(
    "/history/{record_id}",
    status_code=status.HTTP_200_OK,
    summary="Get Single Prediction Record",
)
async def get_prediction_detail(record_id: str, user: dict = Depends(get_current_user)):
    return handle_get_prediction_by_id(record_id, user_id=user["id"])


@router.delete(
    "/history",
    status_code=status.HTTP_200_OK,
    summary="Clear Prediction History",
    description="Deletes only the authenticated user's prediction history.",
)
async def delete_history(user: dict = Depends(get_current_user)):
    return handle_clear_history(user_id=user["id"])


@router.get(
    "/analytics",
    response_model=AnalyticsSummary,
    status_code=status.HTTP_200_OK,
    summary="Get Personal Analytics & Model Benchmarks",
    description="Returns the authenticated user's aggregate disease distribution, confidence flags, and model performance comparisons. Only the user's own records are included.",
)
async def get_analytics(user: dict = Depends(get_current_user)):
    return handle_get_analytics(user_id=user["id"])
