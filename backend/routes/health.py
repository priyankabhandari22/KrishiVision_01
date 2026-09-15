"""
health.py
---------
REST endpoint for GET /health.
"""

from fastapi import APIRouter
from backend.controllers import handle_health

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    summary="Health Check",
    description="Check the operational status of the KrishiVision API.",
)
async def health_check():
    """
    GET /health endpoint.
    Delegates execution to health_controller.handle_health().
    """
    return await handle_health()
