"""
classifier.py
-------------
Inference wrapper for the KrishiVision ResNet50 leaf disease classifier.

Model architecture notes (confirmed with project owner — do NOT change without
re-confirming against the Colab training notebook):
  - Single 10-way softmax output head. The model classifies across all 10
    classes in one pass; there is no separate Citrus head / Guava head.
  - Class-index ordering as used during Colab training (ImageDataGenerator
    class_indices, directory-name sorted order):

      Index │ Crop   │ Class label
      ──────┼────────┼─────────────────
        0   │ Guava  │ Disease Free
        1   │ Guava  │ Phytopthora
        2   │ Guava  │ Red rust
        3   │ Guava  │ Scab
        4   │ Guava  │ Styler and Root
        5   │ Citrus │ Black spot
        6   │ Citrus │ Melanose
        7   │ Citrus │ Canker
        8   │ Citrus │ Greening
        9   │ Citrus │ Healthy

  - `crop` is therefore derived from which index wins: 0–4 → "guava",
    5–9 → "citrus". No secondary classifier is needed.

Output conforms to documentation/methodology/prediction-contract.md:
  {
    "crop":        str,   # "citrus" | "guava"
    "disease":     str,   # exact trained class label
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
# Path to the pre-trained checkpoint (relative to this file's location).
# ---------------------------------------------------------------------------
_MODEL_PATH = (
    Path(__file__).resolve()
    .parent  # prediction/
    .parent  # disease-detection/
    / "models"
    / "KrishiVision_ResNet50.keras"
)

_PROJECT_ROOT = Path(__file__).resolve().parents[2]


def _default_crop_model_path(crop: str) -> Path:
    """Find an existing crop checkpoint without requiring shell setup."""
    candidates = (
        Path(__file__).resolve().parents[1] / "models" / f"KrishiVision_{crop.capitalize()}_ResNet50.keras",
        _PROJECT_ROOT.parent / "ks" / "outputs" / f"best_model_{crop}_ResNet50.keras",
    )
    return next((path for path in candidates if path.exists()), candidates[0])


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
# Class index → (crop, label) mapping.
# Confirmed against Google Colab training notebook class_indices ordering.
# Guava classes occupy indices 0-4; Citrus classes occupy indices 5-9.
# ---------------------------------------------------------------------------
_CLASS_MAP: dict[int, tuple[str, str]] = {
    0: ("guava",  "Disease Free"),
    1: ("guava",  "Phytopthora"),
    2: ("guava",  "Red rust"),
    3: ("guava",  "Scab"),
    4: ("guava",  "Styler and Root"),
    5: ("citrus", "Black spot"),
    6: ("citrus", "Melanose"),
    7: ("citrus", "Canker"),
    8: ("citrus", "Greening"),
    9: ("citrus", "Healthy"),
}

# Labels that mean "no disease detected" for their respective crop.
_HEALTHY_LABELS: frozenset[str] = frozenset({"Healthy", "Disease Free"})

# ---------------------------------------------------------------------------
# Confidence threshold — imported from disease_detection.config.
# Do NOT redefine it here. Change the value in disease-detection/config.py.
# See documentation/methodology/confidence-threshold-policy.md for rationale.
# ---------------------------------------------------------------------------


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
    Raised when KrishiVision_ResNet50.keras cannot be found at the expected
    path. The system must never silently fall back to an untrained model.
    """
    def __init__(self, path: Path) -> None:
        self.path = path
        super().__init__(
            f"Trained model checkpoint not found at: {path}\n"
            "Place KrishiVision_ResNet50.keras in disease-detection/models/ "
            "before starting the server. Do NOT substitute an untrained model."
        )


# ---------------------------------------------------------------------------
# Module-level model singleton — loaded once on first use.
# ---------------------------------------------------------------------------
_model = None
_crop_models: dict[str, object] | None = None


def load_model():
    """
    Load the ResNet50 checkpoint from disk exactly once.

    Returns the Keras model object. Subsequent calls return the cached
    instance without re-reading the file.

    Raises
    ------
    ModelNotFoundError
        If the .keras file is missing at the expected location.
    """
    global _model

    if _model is not None:
        return _model

    if not _MODEL_PATH.exists():
        raise ModelNotFoundError(_MODEL_PATH)

    import keras  # local import — avoids forcing TF to load at import time
    _model = keras.models.load_model(str(_MODEL_PATH))
    return _model


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
          "disease":      <exact trained label>,
          "status":       "healthy" | "diseased",
          "confidence":   <float 0.0–1.0>,
          "is_confident": <bool>
        }

    Raises
    ------
    ModelNotFoundError
        If the checkpoint file is absent (propagated from load_model).
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

    if _MODEL_PATH.exists():
        model = load_model()
        probabilities = model.predict(preprocessed_tensor, verbose=0)[0]
        class_index = int(np.argmax(probabilities))
        confidence = float(probabilities[class_index])
        crop, disease = _CLASS_MAP[class_index]
    else:
        model, crop, disease, class_index, confidence = _predict_with_crop_models(preprocessed_tensor)

    # The hidden fields are used by the orchestration layer for Grad-CAM and
    # are never serialized into the API response.

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
    """Use the two existing crop-specific models when no combined model exists.

    This is an explicit compatibility path for the checkpoints produced by the
    training project. It compares the winning softmax score from each crop
    model; the combined 10-class checkpoint remains the preferred path.
    """
    global _crop_models

    if _crop_models is None:
        missing = [str(path) for path in _CROP_MODEL_PATHS.values() if not path.exists()]
        if missing:
            raise ModelNotFoundError(
                _MODEL_PATH,
            ) from FileNotFoundError(
                "Missing combined model and crop-specific fallback models: " + ", ".join(missing)
            )
        import keras
        _crop_models = {
            crop: keras.models.load_model(str(path))
            for crop, path in _CROP_MODEL_PATHS.items()
        }

    label_maps = {
        "citrus": {
            0: "Black spot", 1: "Canker", 2: "Greening", 3: "Healthy", 4: "Melanose"
        },
        "guava": {
            0: "Phytopthora", 1: "Red rust", 2: "Scab", 3: "Styler and Root", 4: "Disease Free"
        },
    }
    candidates = []
    for crop, model in _crop_models.items():
        probabilities = model.predict(preprocessed_tensor, verbose=0)[0]
        class_index = int(np.argmax(probabilities))
        candidates.append((float(probabilities[class_index]), model, crop, class_index))

    confidence, model, crop, class_index = max(candidates, key=lambda item: item[0])
    disease = label_maps[crop][class_index]
    return model, crop, disease, class_index, confidence
