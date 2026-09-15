"""
history.py
----------
REST endpoints for prediction history logs and research analytics.
"""

from typing import Optional
from fastapi import APIRouter, Query, status
from backend.controllers import (
    handle_clear_history,
    handle_get_analytics,
    handle_get_history,
    handle_get_prediction_by_id,
)
from backend.models import AnalyticsSummary, HistoryListResponse

router = APIRouter(tags=["History & Analytics"])


@router.get(
    "/history",
    response_model=HistoryListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Prediction History",
    description="Returns recorded leaf disease diagnosis history.",
)
async def get_history(
    crop: Optional[str] = Query(None, description="Filter by crop ('citrus' or 'guava')"),
    disease: Optional[str] = Query(None, description="Filter by disease name"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by health status ('healthy' or 'diseased')"),
    limit: int = Query(100, ge=1, le=500, description="Max records to return"),
):
    return handle_get_history(crop=crop, disease=disease, status_filter=status_filter, limit=limit)


@router.get(
    "/history/{record_id}",
    status_code=status.HTTP_200_OK,
    summary="Get Single Prediction Record",
)
async def get_prediction_detail(record_id: str):
    return handle_get_prediction_by_id(record_id)


@router.delete(
    "/history",
    status_code=status.HTTP_200_OK,
    summary="Clear Prediction History",
)
async def delete_history():
    return handle_clear_history()


@router.get(
    "/analytics",
    response_model=AnalyticsSummary,
    status_code=status.HTTP_200_OK,
    summary="Get Research Analytics & Model Benchmarks",
    description="Returns aggregate disease distribution, low-confidence flags, and model performance comparisons.",
)
async def get_analytics():
    return handle_get_analytics()
