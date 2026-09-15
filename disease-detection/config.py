"""
config.py
---------
Shared inference configuration for KrishiVision disease-detection.

This is the SINGLE authoritative source for the confidence threshold and any
other model-level inference parameters. All modules in this repository must
import constants from here rather than defining their own numeric literals.

To change the threshold, edit CONFIDENCE_THRESHOLD below — do not duplicate
the value in prediction/classifier.py, backend routes, or frontend constants.

See documentation/methodology/confidence-threshold-policy.md for the full
rationale behind the chosen default value.
"""

# ---------------------------------------------------------------------------
# Confidence threshold
# ---------------------------------------------------------------------------

#: Minimum softmax probability for a prediction to be considered confident.
#:
#: When the winning class probability falls below this value, `is_confident`
#: is set to False in the prediction contract output. The frontend and backend
#: must react by surfacing a warning to the farmer (e.g. "uncertain — please
#: retake the photo in better lighting").
#:
#: Default: 0.70 (70%)
#: Rationale: see documentation/methodology/confidence-threshold-policy.md
CONFIDENCE_THRESHOLD: float = 0.70

#: Human-readable warning message surfaced by the API layer when
#: is_confident is False. Defined here so both backend and frontend share
#: the same default copy without duplication.
LOW_CONFIDENCE_WARNING: str = (
    "Prediction confidence is low. The result may not be reliable. "
    "Please retake the photo in better lighting with the full leaf clearly visible, "
    "then try again."
)
