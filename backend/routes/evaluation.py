"""
evaluation.py
-------------
REST endpoint for recorded model evaluation metrics.
"""

from fastapi import APIRouter, status
from backend.services.evaluation_service import get_evaluation_metrics

router = APIRouter(tags=["Evaluation"])


@router.get(
    "/evaluation",
    status_code=status.HTTP_200_OK,
    summary="Get model evaluation metrics",
    description="Returns recorded accuracy, precision, recall, F1, and confusion matrix data.",
)
async def get_evaluation():
    return get_evaluation_metrics()
