"""
predict_controller.py
---------------------
Controller for POST /predict endpoint.

Responsibilities:
  1. Validates incoming HTTP image upload file.
  2. Invokes backend.services.run_pipeline orchestration service.
  3. Formats and returns backend.models.AdvisoryResponse.
  4. Catches and translates pipeline exceptions into clean HTTP status codes
     and user-friendly error messages without leaking internal tracebacks.
"""

from __future__ import annotations

import logging
from fastapi import HTTPException, UploadFile, status

from agricultural_advisor.recommendations import UnknownClassError
from backend.models import AdvisoryResponse
from backend.services import run_pipeline
from disease_detection.prediction import ModelNotFoundError
from disease_detection.preprocessing import ImageValidationError

logger = logging.getLogger(__name__)


async def handle_prediction(file: UploadFile) -> AdvisoryResponse:
    """
    Controller logic for POST /predict.

    Parameters
    ----------
    file : UploadFile
        Uploaded leaf image file from the client.

    Returns
    -------
    AdvisoryResponse
        Validated advisory response JSON payload.

    Raises
    ------
    HTTPException
        - HTTP 400 Bad Request: Empty/missing file or invalid image content/format.
        - HTTP 422 Unprocessable Entity: Unsupported crop or unknown class.
        - HTTP 503 Service Unavailable: Model file missing or uninitialized.
        - HTTP 500 Internal Server Error: Generic fallback for unexpected failures.
    """
    # 1. Validate file presence
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided. Please upload a leaf image file.",
        )

    # 2. Read image bytes
    try:
        file_bytes = await file.read()
    except Exception as exc:
        logger.error(f"Failed to read upload file bytes: {exc}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not read uploaded image data.",
        )

    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty. Please upload a valid leaf image.",
        )

    # 3. Call pipeline orchestration service with exception handling
    try:
        response: AdvisoryResponse = run_pipeline(file_bytes, file.filename)
        return response

    except ImageValidationError as exc:
        # User-facing image validation error (empty, corrupt, wrong mode/size)
        logger.warning(f"Image validation failed for '{file.filename}': {exc.message}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=exc.message,
        )

    except UnknownClassError as exc:
        # Prediction returned a class outside the 10 trained categories
        logger.warning(f"Unknown class error for '{file.filename}': {exc}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="The prediction model returned an unsupported crop or disease class.",
        )

    except ModelNotFoundError as exc:
        # Missing model checkpoint file on disk
        logger.error(f"Model checkpoint error: {exc}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Disease classification model is currently unavailable on the server.",
        )

    except Exception as exc:
        # Unexpected internal pipeline failure — log full exception, hide stack trace from client
        logger.exception(f"Unexpected pipeline failure for '{file.filename}': {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred while processing the leaf image. Please try again later.",
        )
