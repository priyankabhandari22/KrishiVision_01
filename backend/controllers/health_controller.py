"""
health_controller.py
--------------------
Controller interface for GET /health endpoint.
"""

from __future__ import annotations


async def handle_health() -> dict[str, str]:
    """
    Controller logic for API health check.
    Returns status metadata.
    """
    return {
        "status": "healthy",
        "service": "KrishiVision API",
        "version": "1.0.0",
    }
