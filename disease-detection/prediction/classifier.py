"""
classifier.py
-------------
Inference wrapper for the KrishiVision per-crop ResNet50 leaf disease classifiers.

Two separate 5-class ResNet50 models are used:
  - best_guava_ResNet50.keras  (classes 0–4, guava-specific)
  - best_citrus_ResNet50.keras (classes 0–4, citrus-specific)

The crop is chosen by comparing the top softmax probability from each model;
the model with the higher confidence wins.

Class-index ordering for each crop model (from dataset directory alphabetical
sort used during test3 training):

  Guava model:
      Index │ Label
      ──────┼──────────────────
        0   │ Phytopthora
        1   │ Red rust
        2   │ Scab
        3   │ Styler and Root
        4   │ healthy (a.k.a. Disease Free)

  Citrus model:
      Index │ Label
      ──────┼──────────────────
        0   │ blackspot
        1   │ canker
        2   │ greening
        3   │ healthy
        4   │ melanose

Output conforms to documentation/methodology/prediction-contract.md:
  {
    "crop":        str,   # "citrus" | "guava"
    "disease":     str,   # human-readable class label used by agricultural-advisor
    "status":      str,   # "healthy" | "diseased"
    "confidence":  float  # softmax probability of winning class, 0.0–1.0
  }

This file contains NO training logic — no fit(), no dataset loading.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import TypedDict

import numpy as np

# Shared inference config — CONFIDENCE_THRESHOLD lives here, not in this file.
from disease_detection.config import CONFIDENCE_THRESHOLD  # noqa: E402

# ---------------------------------------------------------------------------
# Paths to per-crop model checkpoints
# ---------------------------------------------------------------------------
_PROJECT_ROOT = Path(__file__).resolve().parents[2]
_MODELS_DIR = Path(__file__).resolve().parent.parent / "models"


def _default_crop_model_path(crop: str) -> Path:
    """Find the best per-crop ResNet50 checkpoint."""
    # Primary: test3 best models stored in disease-detection/models/
    primary = _MODELS_DIR / f"best_{crop}_ResNet50.keras"
    # Fallback: legacy naming conventions
    legacy = _MODELS_DIR / f"KrishiVision_{crop.capitalize()}_ResNet50.keras"
    ks_out = _PROJECT_ROOT.parent / "ks" / "outputs" / f"best_model_{crop}_ResNet50.keras"
    ks_out3 = _PROJECT_ROOT.parent / "ks" / "outputs_test3" / f"best_{crop}_ResNet50.keras"
    for candidate in (primary, legacy, ks_out, ks_out3):
        if candidate.exists():
            return candidate
    return primary  # will raise ModelNotFoundError later


_CROP_MODEL_PATHS: dict[str, Path] = {
    "citrus": Path(os.environ.get(
        "KRISHIVISION_CITRUS_MODEL_PATH",
        _default_crop_model_path("citrus"),
    )),
    "guava": Path(os.environ.get(
        "KRISHIVISION_GUAVA_MODEL_PATH",
        _default_crop_model_path("guava"),
    )),
}

# ---------------------------------------------------------------------------
# Per-crop class-index → human label mapping
# Used by the agricultural-advisor; labels must match disease-knowledge JSONs.
# ---------------------------------------------------------------------------
_GUAVA_LABEL_MAP: dict[int, str] = {
    0: "Phytopthora",
    1: "Red rust",
    2: "Scab",
    3: "Styler and Root",
    4: "Disease Free",
}

_CITRUS_LABEL_MAP: dict[int, str] = {
    0: "Black spot",
    1: "Canker",
    2: "Greening",
    3: "Healthy",
    4: "Melanose",
}

_CROP_LABEL_MAPS: dict[str, dict[int, str]] = {
    "guava": _GUAVA_LABEL_MAP,
    "citrus": _CITRUS_LABEL_MAP,
}

# Labels that mean "no disease detected" for their respective crop.
_HEALTHY_LABELS: frozenset[str] = frozenset({"Healthy", "Disease Free"})


class PredictionResult(TypedDict):
    """Typed dict that matches prediction-contract.md exactly."""
    crop:          str
    disease:       str
    status:        str
    confidence:    float
    is_confident:  bool
    _model: object
    _class_index: int


class ModelNotFoundError(FileNotFoundError):
    """
    Raised when a per-crop ResNet50 checkpoint cannot be found.
    The system must never silently fall back to an untrained model.
    """
    def __init__(self, path: Path) -> None:
        self.path = path
        super().__init__(
            f"Trained model checkpoint not found at: {path}\n"
            f"Place the required .keras files in {_MODELS_DIR}\n"
            "before starting the server. Do NOT substitute an untrained model."
        )


# ---------------------------------------------------------------------------
# Module-level model singletons — loaded once on first use.
# ---------------------------------------------------------------------------
_crop_models: dict[str, object] | None = None


def load_model():
    """
    Compatibility entry point — warm-loads the per-crop ResNet50 checkpoints.

    Returns a dict ``{"guava": keras.Model, "citrus": keras.Model}``.
    Callers needing only the guava model can index ``["guava"]``.

    Raises
    ------
    ModelNotFoundError
        If any required .keras file is missing.
    """
    return load_crop_models()


def load_crop_models() -> dict[str, object]:
    """
    Load both per-crop ResNet50 checkpoints from disk exactly once.

    Returns the dict of crop → Keras model. Subsequent calls return the
    cached instance without re-reading files.
    """
    global _crop_models
    if _crop_models is not None:
        return _crop_models

    missing = [str(path) for path in _CROP_MODEL_PATHS.values() if not path.exists()]
    if missing:
        raise ModelNotFoundError(_CROP_MODEL_PATHS["citrus"]) from FileNotFoundError(
            "Missing per-crop model files: " + ", ".join(missing)
        )

    import keras  # local import — avoids forcing TF to load at import time
    _crop_models = {
        crop: keras.models.load_model(str(path))
        for crop, path in _CROP_MODEL_PATHS.items()
    }
    return _crop_models


def predict(preprocessed_tensor: np.ndarray) -> PredictionResult:
    """
    Run inference on a preprocessed leaf image tensor.

    Parameters
    ----------
    preprocessed_tensor : numpy.ndarray
        Float32 array of shape ``(1, 224, 224, 3)`` produced by
        ``disease_detection.preprocessing.preprocess()``.

    Returns
    -------
    PredictionResult
        A dict conforming to documentation/methodology/prediction-contract.md:
        {
          "crop":         "citrus" | "guava",
          "disease":      <human-readable class label>,
          "status":       "healthy" | "diseased",
          "confidence":   <float 0.0–1.0>,
          "is_confident": <bool>
        }

    Raises
    ------
    ModelNotFoundError
        If a checkpoint file is absent.
    ValueError
        If the tensor shape is not (1, 224, 224, 3).
    """
    # --- Input shape guard ------------------------------------------------
    expected_shape = (1, 224, 224, 3)
    if preprocessed_tensor.shape != expected_shape:
        raise ValueError(
            f"predict() received tensor of shape {preprocessed_tensor.shape}; "
            f"expected {expected_shape}. Ensure the input passed through "
            "preprocessing.preprocess() before calling predict()."
        )

    model, crop, disease, class_index, confidence = _predict_with_crop_models(preprocessed_tensor)

    # --- Derive health status ----------------------------------------------
    status = "healthy" if disease in _HEALTHY_LABELS else "diseased"

    # --- Derive confidence flag --------------------------------------------
    # The agricultural-advisor layer uses is_confident to decide whether to
    # show an uncertainty warning to the farmer.
    is_confident = confidence >= CONFIDENCE_THRESHOLD

    return PredictionResult(
        crop=crop,
        disease=disease,
        status=status,
        confidence=round(confidence, 4),
        is_confident=is_confident,
        _model=model,
        _class_index=class_index,
    )


def _predict_with_crop_models(
    preprocessed_tensor: np.ndarray,
) -> tuple[object, str, str, int, float]:
    """
    Run both per-crop ResNet50 models and pick the winner.

    The crop whose model produces the highest softmax probability is selected.
    The class_index returned is within the winning crop's 0–4 index space.
    """
    global _crop_models

    if _crop_models is None:
        load_crop_models()

    candidates = []
    for crop, model in _crop_models.items():
        probabilities = model.predict(preprocessed_tensor, verbose=0)[0]
        class_index = int(np.argmax(probabilities))
        candidates.append((float(probabilities[class_index]), model, crop, class_index))

    confidence, model, crop, class_index = max(candidates, key=lambda item: item[0])
    disease = _CROP_LABEL_MAPS[crop][class_index]
    return model, crop, disease, class_index, confidence
