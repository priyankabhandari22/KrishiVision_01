"""
preprocessor.py
---------------
Inference-time image preprocessing for KrishiVision.

Produces a normalised tensor that matches the exact input contract of the
ResNet50 checkpoint at disease-detection/models/KrishiVision_ResNet50.keras.

ResNet50 input contract (Keras / TensorFlow):
  - Shape  : (1, 224, 224, 3)   — batch of 1, HWC ordering
  - dtype  : float32
  - Range  : values processed with tf.keras.applications.resnet50.preprocess_input,
             which centres on ImageNet mean (shifts to range ≈ [-128, 128]).

Usage
-----
    from disease_detection.preprocessing import preprocess, ImageValidationError

    try:
        tensor = preprocess(raw_bytes)   # bytes from an HTTP upload
    except ImageValidationError as exc:
        return api_error(exc.message)    # forward to caller

    prediction = model.predict(tensor)
"""

from __future__ import annotations

import numpy as np
from PIL import Image

from .validators import validate_image, ImageValidationError  # noqa: F401 — re-exported

# ResNet50 expected input dimensions.
TARGET_WIDTH: int = 224
TARGET_HEIGHT: int = 224


def preprocess(image: bytes | Image.Image) -> np.ndarray:
    """
    Validate, resize, and normalise a leaf image for ResNet50 inference.

    Accepts either:
    - ``bytes``       — raw file bytes from an HTTP upload (validated first), or
    - ``PIL.Image``   — an already-opened image (skips byte-level validation).

    Parameters
    ----------
    image : bytes or PIL.Image.Image
        The leaf image to preprocess.

    Returns
    -------
    numpy.ndarray
        Float32 array of shape ``(1, 224, 224, 3)`` normalised via
        ``keras.applications.resnet50.preprocess_input``.
        Ready to pass directly to ``model.predict()``.

    Raises
    ------
    ImageValidationError
        If the input fails any validation check (see validators.py).
    TypeError
        If ``image`` is neither bytes nor a PIL Image.
    """
    # --- 1. Obtain a validated PIL Image -----------------------------------
    if isinstance(image, (bytes, bytearray)):
        pil_image: Image.Image = validate_image(bytes(image))
    elif isinstance(image, Image.Image):
        pil_image = image
    else:
        raise TypeError(
            f"preprocess() expects bytes or a PIL.Image.Image, got {type(image).__name__}."
        )

    # --- 2. Ensure RGB (RGBA → RGB, strip alpha channel) -------------------
    if pil_image.mode != "RGB":
        pil_image = pil_image.convert("RGB")

    # --- 3. Resize to ResNet50 input size (224 × 224) ----------------------
    # LANCZOS gives the best downscaling quality for natural images.
    pil_image = pil_image.resize(
        (TARGET_WIDTH, TARGET_HEIGHT), resample=Image.Resampling.LANCZOS
    )

    # --- 4. Convert to float32 NumPy array, add batch dimension ------------
    array = np.array(pil_image, dtype=np.float32)  # shape: (224, 224, 3)
    array = np.expand_dims(array, axis=0)           # shape: (1, 224, 224, 3)

    # --- 5. Apply ResNet50 ImageNet normalisation --------------------------
    # keras.applications.resnet50.preprocess_input performs:
    #   - converts RGB → BGR
    #   - subtracts ImageNet channel means [103.939, 116.779, 123.68]
    # This must match exactly what was used during training in Google Colab.
    from keras.applications.resnet50 import preprocess_input  # lazy import

    array = preprocess_input(array)

    return array  # shape: (1, 224, 224, 3), dtype: float32
