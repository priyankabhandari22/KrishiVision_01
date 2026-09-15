"""
validators.py
-------------
Input validation for leaf images before preprocessing.
All checks raise ImageValidationError with clear, user-facing messages
that the API layer can forward directly to the caller.
"""

import io
from PIL import Image, UnidentifiedImageError

# Minimum acceptable dimensions (pixels). Images smaller than this are
# unlikely to contain enough detail for reliable inference.
MIN_WIDTH = 50
MIN_HEIGHT = 50

# Maximum file size accepted (bytes) — guards against accidental uploads of
# huge raw files that would stall the server.
MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024  # 20 MB

# Allowed PIL image modes — we need colour information for ResNet50.
ALLOWED_MODES = {"RGB", "RGBA"}


class ImageValidationError(ValueError):
    """
    Raised when an uploaded file fails pre-processing validation.

    Attributes
    ----------
    message : str
        A plain-language description suitable for returning to the user via
        the API response body.
    """

    def __init__(self, message: str) -> None:
        self.message = message
        super().__init__(message)


def validate_image(file_bytes: bytes) -> Image.Image:
    """
    Validate raw bytes from an uploaded file and return a PIL Image.

    Parameters
    ----------
    file_bytes : bytes
        Raw bytes of the uploaded file.

    Returns
    -------
    PIL.Image.Image
        Validated, opened image ready to pass to the preprocessor.

    Raises
    ------
    ImageValidationError
        If the file fails any validation check.
    """
    # 1. Check file size before doing anything expensive.
    size = len(file_bytes)
    if size == 0:
        raise ImageValidationError(
            "The uploaded file is empty. Please upload a valid leaf image."
        )
    if size > MAX_FILE_SIZE_BYTES:
        raise ImageValidationError(
            f"The uploaded file is too large ({size / (1024 * 1024):.1f} MB). "
            f"Maximum allowed size is {MAX_FILE_SIZE_BYTES // (1024 * 1024)} MB."
        )

    # 2. Attempt to open — this also catches non-image file types.
    try:
        image = Image.open(io.BytesIO(file_bytes))
        image.verify()  # Catch truncated / corrupt files early.
    except UnidentifiedImageError:
        raise ImageValidationError(
            "The uploaded file could not be recognised as an image. "
            "Please upload a JPEG, PNG, or WebP leaf photo."
        )
    except Exception:
        raise ImageValidationError(
            "The uploaded image appears to be corrupt or incomplete. "
            "Please try a different photo."
        )

    # Re-open after verify() (verify() leaves the file pointer in an unusable state).
    image = Image.open(io.BytesIO(file_bytes))

    # 3. Check colour mode — convert RGBA to RGB; reject anything else.
    if image.mode not in ALLOWED_MODES:
        raise ImageValidationError(
            f"Unsupported image colour mode '{image.mode}'. "
            "Please upload a standard colour (RGB) leaf image."
        )

    # 4. Check minimum dimensions.
    width, height = image.size
    if width < MIN_WIDTH or height < MIN_HEIGHT:
        raise ImageValidationError(
            f"The uploaded image is too small ({width}×{height} px). "
            f"Minimum required size is {MIN_WIDTH}×{MIN_HEIGHT} px. "
            "Please upload a clearer, higher-resolution leaf photo."
        )

    return image
