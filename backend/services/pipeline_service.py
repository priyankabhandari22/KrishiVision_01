"""
pipeline_service.py
-------------------
Orchestration service for KrishiVision end-to-end pipeline.

Pipeline Execution Steps:
  1. Image validation & preprocessing (disease-detection.preprocessing)
  2. Model inference (disease-detection.prediction)
  3. Visual explanation generation (disease-detection.explanation)
  4. Short-term advisory lookup (agricultural-advisor.recommendations)
  5. Long-term prevention lookup (agricultural-advisor.prevention)
  6. Final schema assembly (backend.models.AdvisoryResponse)
"""

from __future__ import annotations

import logging
from pathlib import Path

from agricultural_advisor.prevention import get_prevention_plan
from agricultural_advisor.recommendations import get_recommendation
from backend.models import AdvisoryResponse, LongTermPrevention, PredictionResult
from disease_detection.explanation import generate_gradcam
from disease_detection.prediction import predict
from disease_detection.preprocessing import preprocess, validate_image

logger = logging.getLogger(__name__)

# Directory for saved heatmap images
HEATMAP_DIR = Path(__file__).resolve().parents[1] / "static" / "heatmaps"

# Reverse lookup map: (crop, disease) -> class_index (0-9)
_CLASS_INDEX_MAP: dict[tuple[str, str], int] = {
    ("guava",  "Disease Free"):    0,
    ("guava",  "Phytopthora"):     1,
    ("guava",  "Red rust"):        2,
    ("guava",  "Scab"):            3,
    ("guava",  "Styler and Root"): 4,
    ("citrus", "Black spot"):      5,
    ("citrus", "Melanose"):        6,
    ("citrus", "Canker"):          7,
    ("citrus", "Greening"):        8,
    ("citrus", "Healthy"):         9,
}


def run_pipeline(file_bytes: bytes, filename: str) -> AdvisoryResponse:
    """
    Execute the full end-to-end KrishiVision pipeline.

    Parameters
    ----------
    file_bytes : bytes
        Raw bytes from the uploaded image.
    filename : str
        Original filename of the uploaded image.

    Returns
    -------
    AdvisoryResponse
        Validated Pydantic schema ready to return to the HTTP client.
    """
    # 1. Validate raw image bytes & obtain PIL Image
    pil_image = validate_image(file_bytes)

    # 2. Preprocess to ResNet50 input tensor shape (1, 224, 224, 3)
    tensor = preprocess(pil_image)

    # 3. Run model inference
    prediction = predict(tensor)

    # 4. Determine class index for Grad-CAM
    class_index = prediction["_class_index"]

    # 5. Generate Grad-CAM Heatmap overlay
    heatmap_path = None
    if class_index is not None:
        try:
            heatmap_path = generate_gradcam(
                model=prediction["_model"],
                preprocessed_tensor=tensor,
                class_index=class_index,
                original_image=pil_image,
                output_dir=HEATMAP_DIR,
            )
            heatmap_path = f"/static/heatmaps/{Path(heatmap_path).name}"
        except Exception as exc:
            logger.warning(f"Grad-CAM generation failed: {exc}. Degrading gracefully.")
            # Note: heatmap_path remains None
    else:
        logger.warning("Class index not found. Skipping Grad-CAM generation.")

    # 6. Recommendation lookup
    rec = get_recommendation(
        crop=prediction["crop"],
        disease=prediction["disease"],
        confidence=prediction["confidence"],
        is_confident=prediction["is_confident"],
    )

    # 7. Long-term prevention lookup
    prev = get_prevention_plan(
        crop=prediction["crop"],
        disease=prediction["disease"],
    )

    # 8. Assemble LongTermPrevention schema
    long_term_schema = LongTermPrevention(
        inspection_frequency=prev["inspection_frequency"],
        inspection_guidance=prev["inspection_guidance"],
        universal_hygiene_practices=prev["universal_hygiene_practices"],
        long_term_monitoring=prev["long_term_monitoring"],
    )

    # 9. Assemble PredictionResult schema
    pred_model = PredictionResult(
        crop=prediction["crop"],
        disease=prediction["disease"],
        status=prediction["status"],
        confidence=prediction["confidence"],
        is_confident=prediction["is_confident"],
        heatmap_path=heatmap_path,
    )

    explanation = rec["description"]
    if heatmap_path is None:
        explanation += " (Note: Visual explanation heatmap is currently unavailable.)"

    # 10. Assemble & return final AdvisoryResponse schema
    advisory_response = AdvisoryResponse.assemble(
        prediction=pred_model,
        explanation=explanation,
        immediate_actions=rec["immediate_actions"],
        spread_prevention=rec["spread_prevention"],
        long_term_prevention=long_term_schema,
        confidence_warning=rec["uncertainty_warning"],
        disclaimer=rec["disclaimer"],
    )

    # 11. Record prediction in history service
    try:
        from backend.services.history_service import record_prediction
        record_prediction(advisory_response.model_dump(), filename=filename)
    except Exception as exc:
        logger.error(f"Failed to record prediction history: {exc}")

    return advisory_response

