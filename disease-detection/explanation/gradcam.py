"""
gradcam.py
----------
Grad-CAM visual explanation for KrishiVision leaf disease predictions.

Grad-CAM (Gradient-weighted Class Activation Mapping) highlights the image
regions that most strongly influenced the ResNet50 classification decision,
giving farmers and reviewers a visual justification for the prediction.

Reference: Selvaraju et al., 2017 — https://arxiv.org/abs/1610.02391

Design contract:
  - Input:  the loaded Keras model, the preprocessed tensor, and the predicted
            class index (all supplied by the caller — this module never calls
            preprocessing or the prediction wrapper itself).
  - Output: path to a JPEG image file containing the Grad-CAM heatmap overlaid
            on the original leaf image. This path populates `heatmap_path` in
            prediction-contract.md.

ResNet50 layer note:
  Grad-CAM requires the output of the final convolutional feature map before
  global average pooling. For the standard Keras ResNet50 architecture that
  is the layer named "conv5_block3_out" (shape: batch × 7 × 7 × 2048).
  If the checkpoint was built with a custom base, pass `last_conv_layer_name`
  explicitly when calling generate_gradcam().
"""

from __future__ import annotations

import uuid
from pathlib import Path

import numpy as np
from PIL import Image

# Name of the last convolutional layer in the standard Keras ResNet50.
# This is the 7×7 feature map just before global average pooling.
_DEFAULT_LAST_CONV_LAYER = "conv5_block3_out"

# Heatmap colour map: "jet" produces the classic blue→green→yellow→red
# spectrum that makes disease regions visually salient.
_COLORMAP = "jet"

# Default directory for saved heatmap files (relative to the repository root).
# The backend / API layer may override this by passing `output_dir` explicitly.
_DEFAULT_OUTPUT_DIR = Path(__file__).resolve().parents[2] / "backend" / "static" / "heatmaps"


class GradCAMError(RuntimeError):
    """
    Raised when Grad-CAM computation fails.

    Typical causes: the named conv layer doesn't exist in the loaded model,
    or the gradient tape returns None (e.g., the layer is not differentiable).
    """
    def __init__(self, message: str) -> None:
        self.message = message
        super().__init__(message)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _get_gradcam_heatmap(
    model,
    preprocessed_tensor: np.ndarray,
    class_index: int,
    last_conv_layer_name: str,
) -> np.ndarray:
    """
    Compute the raw Grad-CAM heatmap as a 2-D float array in [0, 1].

    Parameters
    ----------
    model : keras.Model
        The loaded KrishiVision ResNet50 model.
    preprocessed_tensor : np.ndarray
        Shape (1, 224, 224, 3), already normalised — not re-processed here.
    class_index : int
        Index of the winning class from the prediction wrapper (0–9).
    last_conv_layer_name : str
        Name of the final convolutional layer to hook.

    Returns
    -------
    np.ndarray
        2-D float32 array, shape (H, W), values in [0, 1], where 1 is the
        most influential region for the predicted class.
    """
    import tensorflow as tf

    # --- Build a sub-model that outputs (conv_feature_maps, final_logits) --
    layer_result = _find_layer_with_owner(model, last_conv_layer_name)
    if layer_result is None:
        available = [layer.name for layer in model.layers]
        raise GradCAMError(
            f"Layer '{last_conv_layer_name}' not found in the loaded model. "
            f"Available layers: {available}. "
            "Pass the correct layer name via the last_conv_layer_name argument."
        )
    last_conv_layer, feature_model_owner = layer_result

    if feature_model_owner is model:
        grad_model = tf.keras.models.Model(
            inputs=model.inputs,
            outputs=[last_conv_layer.output, model.output],
        )
        outer_tail_layers = []
    else:
        grad_model = tf.keras.models.Model(
            inputs=feature_model_owner.inputs,
            outputs=[last_conv_layer.output, feature_model_owner.output],
        )
        owner_index = next(
            index for index, layer in enumerate(model.layers)
            if layer is feature_model_owner
        )
        outer_tail_layers = model.layers[owner_index + 1:]

    # --- Compute gradients of the target class score w.r.t. feature maps ---
    tensor = tf.cast(preprocessed_tensor, tf.float32)

    with tf.GradientTape() as tape:
        tape.watch(tensor)
        conv_outputs, predictions = grad_model(tensor, training=False)
        for layer in outer_tail_layers:
            predictions = layer(predictions, training=False)
        # Scalar: the logit for our predicted class.
        class_score = predictions[:, class_index]

    # Gradients of class score w.r.t. the last conv feature maps.
    grads = tape.gradient(class_score, conv_outputs)  # shape: (1, H, W, C)

    if grads is None:
        raise GradCAMError(
            "Gradient tape returned None — the target layer may not be "
            "connected to the model output in a differentiable way."
        )

    # --- Pool gradients across spatial dimensions (global average pooling) --
    # Shape: (C,) — one importance weight per feature-map channel.
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    # --- Weight feature maps by their channel importance -------------------
    conv_outputs = conv_outputs[0]                     # shape: (H, W, C)
    heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]  # shape: (H, W, 1)
    heatmap = tf.squeeze(heatmap)                      # shape: (H, W)

    # --- ReLU: keep only features that increase the class score ------------
    heatmap = tf.nn.relu(heatmap).numpy()              # shape: (H, W)

    # --- Normalise to [0, 1] -----------------------------------------------
    heatmap_max = heatmap.max()
    if heatmap_max > 0:
        heatmap = heatmap / heatmap_max

    return heatmap.astype(np.float32)


def _find_layer_with_owner(model, layer_name: str):
    """Find a layer and the model that owns its input/output graph."""
    try:
        return model.get_layer(layer_name), model
    except ValueError:
        pass

    for layer in model.layers:
        if hasattr(layer, "get_layer"):
            nested_result = _find_layer_with_owner(layer, layer_name)
            if nested_result is not None:
                return nested_result

    return None


def _overlay_heatmap_on_image(
    heatmap: np.ndarray,
    original_image: Image.Image,
    alpha: float = 0.45,
) -> Image.Image:
    """
    Resize the Grad-CAM heatmap to match `original_image` and blend them.

    Parameters
    ----------
    heatmap : np.ndarray
        2-D float array in [0, 1] produced by _get_gradcam_heatmap().
    original_image : PIL.Image.Image
        The original leaf image (RGB, any size).
    alpha : float
        Blend weight for the heatmap overlay (0 = only image, 1 = only heatmap).

    Returns
    -------
    PIL.Image.Image
        RGB image with the Grad-CAM heatmap blended over the leaf photo.
    """
    import matplotlib
    matplotlib.use("Agg")                 # headless — no display required
    import matplotlib.pyplot as plt       # noqa: E402

    # Upscale heatmap to original image dimensions.
    orig_w, orig_h = original_image.size
    heatmap_uint8 = (heatmap * 255).astype(np.uint8)
    heatmap_pil = Image.fromarray(heatmap_uint8, mode="L").resize(
        (orig_w, orig_h), resample=Image.Resampling.LANCZOS
    )

    # Apply a matplotlib colour map to produce an RGBA colour image.
    cmap = plt.get_cmap(_COLORMAP)
    heatmap_rgba = cmap(np.array(heatmap_pil) / 255.0)         # (H, W, 4)
    heatmap_rgb = (heatmap_rgba[:, :, :3] * 255).astype(np.uint8)
    heatmap_colour = Image.fromarray(heatmap_rgb, mode="RGB")

    # Ensure original is RGB before blending.
    original_rgb = original_image.convert("RGB")

    # Alpha blend: overlay = alpha * heatmap + (1 - alpha) * original.
    overlay = Image.blend(original_rgb, heatmap_colour, alpha=alpha)
    return overlay


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def generate_gradcam(
    model,
    preprocessed_tensor: np.ndarray,
    class_index: int,
    original_image: Image.Image,
    output_dir: Path | str | None = None,
    last_conv_layer_name: str = _DEFAULT_LAST_CONV_LAYER,
) -> str:
    """
    Generate a Grad-CAM heatmap overlay and save it to disk.

    This function is deliberately decoupled from preprocessing and prediction.
    It accepts already-computed artefacts and produces the `heatmap_path` entry
    for the prediction-contract.md response.

    Parameters
    ----------
    model : keras.Model
        The loaded per-crop KrishiVision ResNet50 model (returned by prediction._model).
    preprocessed_tensor : np.ndarray
        Shape (1, 224, 224, 3) float32 — the same tensor passed to predict().
        Not re-preprocessed here.
    class_index : int
        Winning class index (0–4) returned by the prediction wrapper for the
        selected per-crop model.
    original_image : PIL.Image.Image
        The original, un-preprocessed leaf image (for overlay background).
    output_dir : Path | str | None
        Directory to write the heatmap JPEG. Defaults to
        backend/static/heatmaps/. Created automatically if absent.
    last_conv_layer_name : str
        Keras layer name to hook for gradient computation.
        Default: "conv5_block3_out" (standard Keras ResNet50).

    Returns
    -------
    str
        Absolute file path to the saved heatmap JPEG.
        Use this value as `heatmap_path` in the prediction contract response.

    Raises
    ------
    GradCAMError
        If the named conv layer is not found or gradients cannot be computed.
    ValueError
        If class_index is outside 0–4.
    """
    if not (0 <= class_index <= 4):
        raise ValueError(
            f"class_index must be in range 0–4 (received {class_index}). "
            "This should be the argmax index from the winning crop model."
        )

    # --- Resolve and prepare output directory -----------------------------
    out_dir = Path(output_dir) if output_dir is not None else _DEFAULT_OUTPUT_DIR
    out_dir.mkdir(parents=True, exist_ok=True)

    # --- Compute raw Grad-CAM heatmap -------------------------------------
    heatmap = _get_gradcam_heatmap(
        model=model,
        preprocessed_tensor=preprocessed_tensor,
        class_index=class_index,
        last_conv_layer_name=last_conv_layer_name,
    )

    # --- Overlay heatmap on original leaf image ---------------------------
    overlay = _overlay_heatmap_on_image(heatmap, original_image)

    # --- Save to disk with a unique filename ------------------------------
    # UUID prevents filename collisions under concurrent requests.
    filename = f"gradcam_{uuid.uuid4().hex}.jpg"
    output_path = out_dir / filename
    overlay.save(str(output_path), format="JPEG", quality=90)

    return str(output_path)
