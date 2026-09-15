"""
evaluation_service.py
---------------------
Load recorded model evaluation metrics for the research dashboard.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict

_EVALUATION_FILE = Path(__file__).resolve().parents[1] / "data" / "evaluation_metrics.json"


def get_evaluation_metrics() -> Dict[str, Any]:
    """Return stored ResNet50 evaluation metrics and confusion matrix."""
    if not _EVALUATION_FILE.exists():
        return {
            "source": None,
            "selected_model": "ResNet50",
            "models": [],
            "combined_metrics": {},
            "per_class": [],
            "confusion_matrix": {"labels": [], "matrix": [], "note": "Evaluation data not available"},
        }

    with _EVALUATION_FILE.open(encoding="utf-8") as handle:
        return json.load(handle)
