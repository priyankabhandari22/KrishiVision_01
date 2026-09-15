"""
backend.controllers
-------------------
Controllers for KrishiVision REST API endpoints.
"""

from .health_controller import handle_health
from .predict_controller import handle_prediction
from .history_controller import (
    handle_get_history,
    handle_get_prediction_by_id,
    handle_clear_history,
    handle_get_analytics,
)

__all__ = [
    "handle_health",
    "handle_prediction",
    "handle_get_history",
    "handle_get_prediction_by_id",
    "handle_clear_history",
    "handle_get_analytics",
]

