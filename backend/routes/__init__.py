"""
backend.routes
--------------
Central APIRouter combining health check and prediction endpoints.
"""

from fastapi import APIRouter
from .health import router as health_router
from .predict import router as predict_router
from .history import router as history_router
from .evaluation import router as evaluation_router
from .auth import router as auth_router

router = APIRouter()
router.include_router(health_router)
router.include_router(auth_router)
router.include_router(predict_router)
router.include_router(history_router)
router.include_router(evaluation_router)

__all__ = ["router", "health_router", "auth_router", "predict_router", "history_router", "evaluation_router"]

