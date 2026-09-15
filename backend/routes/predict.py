"""
predict.py
----------
REST endpoint for POST /predict.
"""

from fastapi import APIRouter, File, UploadFile, status
from backend.controllers import handle_prediction
from backend.models import AdvisoryResponse

router = APIRouter(tags=["Prediction"])


@router.post(
    "/predict",
    response_model=AdvisoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Predict Disease & Generate Advisory",
    description=(
        "Accepts a leaf image file upload, runs disease classification and Grad-CAM "
        "visual explanation, and returns full farmer-facing advisory guidance."
    ),
)
async def predict_image(
    file: UploadFile = File(
        ...,
        description="Leaf image file upload (JPEG, PNG, WebP format).",
    )
):
    """
    POST /predict endpoint.
    Accepts an uploaded image file and delegates to predict_controller.handle_prediction().
    """
    return await handle_prediction(file)
