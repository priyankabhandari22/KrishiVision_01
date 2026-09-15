"""
schemas.py
----------
Stateless Pydantic data schemas for KrishiVision backend pipeline.

Defines schemas for:
1. ImageUploadRequest: Incoming image upload payload metadata.
2. PredictionResult: Prediction contract result matching prediction-contract.md exactly.
3. LongTermPrevention: Structured long-term monitoring and hygiene prevention model.
4. AdvisoryResponse: Final farmer-facing advisory response combining explanation,
   immediate actions, spread prevention, long-term prevention, and confidence warnings.
"""

from __future__ import annotations

from typing import List, Literal, Optional
from pydantic import BaseModel, Field, field_validator

# ---------------------------------------------------------------------------
# Allowed Constants conforming to prediction-contract.md
# ---------------------------------------------------------------------------
ALLOWED_CROPS = {"citrus", "guava"}
ALLOWED_DISEASES = {
    "Black spot",
    "Melanose",
    "Canker",
    "Greening",
    "Healthy",
    "Disease Free",
    "Phytopthora",
    "Red rust",
    "Scab",
    "Styler and Root",
}


# ---------------------------------------------------------------------------
# 1. Incoming Image Upload Request Schema
# ---------------------------------------------------------------------------
class ImageUploadRequest(BaseModel):
    """
    Data schema for incoming leaf image upload request.
    """
    filename: str = Field(
        ...,
        description="Original filename of the uploaded leaf image.",
        examples=["leaf_sample.jpg"],
    )
    content_type: str = Field(
        ...,
        description="MIME type of the uploaded file (e.g. image/jpeg, image/png).",
        examples=["image/jpeg"],
    )
    size_bytes: Optional[int] = Field(
        default=None,
        ge=0,
        description="Size of the uploaded image file in bytes.",
    )
    image_b64: Optional[str] = Field(
        default=None,
        description="Optional base64-encoded image payload for JSON transmission.",
    )

    @field_validator("content_type")
    @classmethod
    def validate_content_type(cls, value: str) -> str:
        allowed = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
        if value.lower() not in allowed:
            raise ValueError(f"Unsupported content_type '{value}'. Must be one of {allowed}.")
        return value.lower()


# ---------------------------------------------------------------------------
# 2. Prediction Result Schema (Matching prediction-contract.md exactly)
# ---------------------------------------------------------------------------
class PredictionResult(BaseModel):
    """
    Data schema for model prediction result.
    Conforms EXACTLY to documentation/methodology/prediction-contract.md:
      - crop: "citrus" | "guava"
      - disease: exact trained class label (one of 10)
      - status: "healthy" | "diseased"
      - confidence: float 0.0–1.0
      - is_confident: bool (True if confidence >= 0.70)
      - heatmap_path: local path or URL to Grad-CAM visualization
    """
    crop: Literal["citrus", "guava"] = Field(
        ...,
        description="Detected crop category ('citrus' or 'guava').",
    )
    disease: str = Field(
        ...,
        description="Exact trained class label.",
    )
    status: Literal["healthy", "diseased"] = Field(
        ...,
        description="Health status ('healthy' or 'diseased').",
    )
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Softmax probability of the winning class (0.0 to 1.0).",
    )
    is_confident: bool = Field(
        ...,
        description="True if confidence >= threshold (0.70).",
    )
    heatmap_path: Optional[str] = Field(
        default=None,
        description="Path or URL to the generated Grad-CAM heatmap image, or None if generation failed.",
    )

    @field_validator("disease")
    @classmethod
    def validate_disease(cls, value: str) -> str:
        if value not in ALLOWED_DISEASES:
            raise ValueError(
                f"Invalid disease label '{value}'. Must be one of {sorted(list(ALLOWED_DISEASES))}."
            )
        return value


# ---------------------------------------------------------------------------
# 3. Long-Term Prevention & Monitoring Schema
# ---------------------------------------------------------------------------
class LongTermPrevention(BaseModel):
    """
    Data schema for long-term prevention practices and monitoring schedules.
    """
    inspection_frequency: Literal["monthly", "fortnightly", "weekly"] = Field(
        ...,
        description="Recommended leaf inspection cadence based on disease profile.",
    )
    inspection_guidance: str = Field(
        ...,
        description="Plain-language description of inspection frequency and focus areas.",
    )
    universal_hygiene_practices: List[str] = Field(
        ...,
        description="Recurring sanitation practices applicable to all farms.",
    )
    long_term_monitoring: List[str] = Field(
        ...,
        description="Disease-specific long-term monitoring and surveillance steps.",
    )


# ---------------------------------------------------------------------------
# 4. Final Advisory Response Schema
# ---------------------------------------------------------------------------
class AdvisoryResponse(BaseModel):
    """
    Data schema for final farmer-facing advisory response.

    Combines:
      - Core prediction metadata (crop, disease, status, confidence, is_confident, heatmap_path)
      - Explanation (simple-language disease description)
      - Immediate actions (short-term intervention steps)
      - Spread prevention (medium-term controls)
      - Long-term prevention (inspection schedule + universal hygiene + monitoring)
      - Confidence warning (optional precautionary message when is_confident is False)
      - Guidance disclaimer
    """
    # Prediction contract fields
    crop: Literal["citrus", "guava"] = Field(..., description="Detected crop ('citrus' or 'guava').")
    disease: str = Field(..., description="Exact trained class label.")
    status: Literal["healthy", "diseased"] = Field(..., description="Health status ('healthy' or 'diseased').")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Softmax confidence score (0.0 to 1.0).")
    is_confident: bool = Field(..., description="Whether confidence met or exceeded threshold (0.70).")
    heatmap_path: Optional[str] = Field(
        default=None,
        description="Path or URL to generated Grad-CAM heatmap visualization, or None if unavailable."
    )

    # Advisory content fields
    explanation: str = Field(..., description="Simple-language explanation of the condition.")
    immediate_actions: List[str] = Field(..., description="Immediate short-term actions for the farmer.")
    spread_prevention: List[str] = Field(..., description="Disease spread prevention guidance.")
    long_term_prevention: LongTermPrevention = Field(
        ..., description="Long-term prevention plan (inspection frequency, hygiene, monitoring)."
    )
    confidence_warning: Optional[str] = Field(
        default=None, description="Precautionary warning if prediction confidence is low."
    )
    disclaimer: str = Field(..., description="General advice disclaimer.")

    @classmethod
    def assemble(
        cls,
        prediction: PredictionResult,
        explanation: str,
        immediate_actions: List[str],
        spread_prevention: List[str],
        long_term_prevention: LongTermPrevention,
        disclaimer: str,
        confidence_warning: Optional[str] = None,
    ) -> AdvisoryResponse:
        """
        Factory method to cleanly assemble an AdvisoryResponse from prediction and advisory outputs.
        """
        return cls(
            crop=prediction.crop,
            disease=prediction.disease,
            status=prediction.status,
            confidence=prediction.confidence,
            is_confident=prediction.is_confident,
            heatmap_path=prediction.heatmap_path,
            explanation=explanation,
            immediate_actions=immediate_actions,
            spread_prevention=spread_prevention,
            long_term_prevention=long_term_prevention,
            confidence_warning=confidence_warning,
            disclaimer=disclaimer,
        )


# ---------------------------------------------------------------------------
# 5. History & Analytics Schemas
# ---------------------------------------------------------------------------
class HistoryItem(BaseModel):
    id: str = Field(..., description="Unique prediction record ID")
    timestamp: str = Field(..., description="ISO 8601 creation timestamp")
    filename: str = Field(..., description="Uploaded image filename")
    crop: str = Field(..., description="Detected crop ('citrus' or 'guava')")
    disease: str = Field(..., description="Detected disease label")
    status: str = Field(..., description="Health status ('healthy' or 'diseased')")
    confidence: float = Field(..., description="Confidence score")
    is_confident: bool = Field(..., description="Confidence threshold flag")
    heatmap_path: Optional[str] = Field(default=None, description="Path to Grad-CAM heatmap")
    explanation: str = Field(..., description="Brief explanation")
    full_advisory: Optional[dict] = Field(default=None, description="Full advisory payload")


class HistoryListResponse(BaseModel):
    count: int = Field(..., description="Number of items returned")
    history: List[HistoryItem] = Field(..., description="List of history records")


class DiseaseDistributionItem(BaseModel):
    label: str = Field(..., description="Crop and disease title")
    crop: str = Field(..., description="Crop type")
    disease: str = Field(..., description="Disease label")
    count: int = Field(..., description="Prediction frequency count")
    status: str = Field(..., description="Health status")


class AnalyticsSummary(BaseModel):
    total_predictions: int = Field(..., description="Total recorded predictions")
    healthy_count: int = Field(..., description="Total healthy leaf detections")
    diseased_count: int = Field(..., description="Total diseased leaf detections")
    low_confidence_count: int = Field(..., description="Predictions below 70% threshold")
    average_confidence: float = Field(..., description="Average confidence score across all runs")
    disease_distribution: List[DiseaseDistributionItem] = Field(..., description="Breakdown by disease category")
    crop_distribution: dict = Field(..., description="Breakdown by crop")
    model_benchmarks: dict = Field(..., description="Comparison metrics for ResNet50, EfficientNet, MobileNet")

