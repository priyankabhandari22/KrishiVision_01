"""
predict.py
----------
REST endpoint for POST /predict.
"""

from fastapi import APIRouter, Depends, File, UploadFile, status
from backend.controllers import handle_prediction
from backend.middleware import get_current_user
from backend.models import AdvisoryResponse

router = APIRouter(tags=["Prediction"])


@router.post(
    "/predict",
    response_model=AdvisoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Predict Disease & Generate Advisory",
    description=(
        "Accepts a leaf image file upload, runs disease classification and Grad-CAM "
        "visual explanation, and returns full farmer-facing advisory guidance. "
        "Requires an authenticated session."
    ),
)
async def predict_image(
    file: UploadFile = File(
        ...,
        description="Leaf image file upload (JPEG, PNG, WebP format).",
    ),
    user: dict = Depends(get_current_user),
):
    """
    POST /predict endpoint.
    Accepts an uploaded image file and delegates to predict_controller.handle_prediction().
    Ownership of the saved record is derived from the authenticated user.
    """
    return await handle_prediction(file, user_id=user["id"])
