"""
advisor.py
----------
Recommendation engine for KrishiVision agricultural advisory.

Takes a prediction-contract.md payload and returns a structured,
farmer-friendly advisory response by looking up verified disease-knowledge
entries. It never fabricates advice and will hard-fail if asked about a class
outside the 10 trained categories.

Separation of concerns:
  - This module reads disease-knowledge JSON files — it does NOT call the
    prediction model, run preprocessing, or generate Grad-CAM heatmaps.
  - The is_confident flag from the prediction contract controls whether the
    response is softened and an uncertainty warning is prepended.
  - All guidance text originates from the disease-knowledge/ data files only.
    Nothing in this file invents treatments, chemical names, or dosages.
"""

from __future__ import annotations

import json
import logging
import os
from pathlib import Path
from typing import TypedDict

from dotenv import dotenv_values, load_dotenv

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

_KNOWLEDGE_DIR = (
    Path(__file__).resolve()
    .parent   # recommendations/
    .parent   # agricultural-advisor/
    / "disease-knowledge"
)
_PROJECT_ROOT = Path(__file__).resolve().parents[2]
_ENV_FILE = _PROJECT_ROOT / ".env"
load_dotenv(_ENV_FILE)
if not os.getenv("GEMINI_API_KEY"):
    # Accept the current local file while it is migrated to KEY=value syntax.
    _local_env = dotenv_values(_ENV_FILE)
    if _local_env.get("GEMINI_API_KEY"):
        os.environ["GEMINI_API_KEY"] = _local_env["GEMINI_API_KEY"]
_GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")

# ---------------------------------------------------------------------------
# Authoritative map: (crop, disease) → knowledge file basename.
#
# This is the ONLY place in the codebase that maps prediction-contract labels
# to file names. If a new class is ever added, it must be added here AND a
# corresponding knowledge file must be placed in disease-knowledge/.
# ---------------------------------------------------------------------------
_KNOWLEDGE_FILE_MAP: dict[tuple[str, str], str] = {
    # Citrus
    ("citrus", "Black spot"):     "citrus_black_spot.json",
    ("citrus", "Melanose"):       "citrus_melanose.json",
    ("citrus", "Canker"):         "citrus_canker.json",
    ("citrus", "Greening"):       "citrus_greening.json",
    ("citrus", "Healthy"):        "citrus_healthy.json",
    # Guava
    ("guava",  "Disease Free"):   "guava_disease_free.json",
    ("guava",  "Phytopthora"):    "guava_phytopthora.json",
    ("guava",  "Red rust"):       "guava_red_rust.json",
    ("guava",  "Scab"):           "guava_scab.json",
    ("guava",  "Styler and Root"):"guava_styler_and_root.json",
}

# ---------------------------------------------------------------------------
# Uncertainty warning copy — shown to the farmer when is_confident is False.
# Defined here alongside the logic that uses it.
# ---------------------------------------------------------------------------
_UNCERTAINTY_WARNING = (
    "⚠️ Low confidence: The system is not certain about this identification. "
    "The advice below is based on the most likely match but may not be accurate. "
    "Please retake the photo in clear daylight with the full leaf visible and "
    "try again. If the problem persists or worsens, consult a local agricultural "
    "extension officer or plant pathologist before taking any action."
)

_UNCERTAIN_ACTIONS_PREFIX = (
    "Note: Because confidence is low, treat the following as general precautionary "
    "guidance only. Confirm the diagnosis with an expert before acting. "
    "Avoid irreversible actions (such as removing trees) until the identification "
    "is confirmed."
)


# ---------------------------------------------------------------------------
# Types
# ---------------------------------------------------------------------------

class AdvisoryResponse(TypedDict):
    """
    Structured advisory response returned to the backend / API layer.

    Conforms to the pipeline contract defined in
    documentation/methodology/prediction-contract.md.

    Fields
    ------
    crop              : "citrus" | "guava"
    disease           : exact trained class label
    status            : "healthy" | "diseased"
    confidence        : float 0.0–1.0
    is_confident      : bool
    uncertainty_warning : str | None — present and non-null when is_confident is False
    disclaimer        : str — legal/guidance disclaimer from the knowledge entry
    description       : str — plain-language disease explanation
    immediate_actions : list[str]
    spread_prevention : list[str]
    long_term_monitoring : list[str]
    """
    crop:                str
    disease:             str
    status:              str
    confidence:          float
    is_confident:        bool
    uncertainty_warning: str | None
    disclaimer:          str
    description:         str
    immediate_actions:   list[str]
    spread_prevention:   list[str]
    long_term_monitoring: list[str]


class UnknownClassError(ValueError):
    """
    Raised when the prediction contract references a (crop, disease) pair
    that is not in the 10 trained categories.

    The advisory layer must never fabricate guidance for unknown classes.
    """
    def __init__(self, crop: str, disease: str) -> None:
        self.crop = crop
        self.disease = disease
        super().__init__(
            f"No disease-knowledge entry exists for crop='{crop}', disease='{disease}'. "
            "The advisory layer only covers the 10 trained classes: "
            "Citrus (Black spot, Melanose, Canker, Greening, Healthy) and "
            "Guava (Disease Free, Phytopthora, Red rust, Scab, Styler and Root). "
            "No advice has been generated."
        )


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _load_knowledge(crop: str, disease: str) -> dict:
    """
    Load and return the disease-knowledge JSON for the given (crop, disease).

    Raises
    ------
    UnknownClassError
        If the (crop, disease) pair is not in the authoritative map.
    FileNotFoundError
        If the knowledge file is missing from disk (should not happen in a
        correctly deployed repository — treat as a configuration error).
    """
    key = (crop.lower(), disease)
    filename = _KNOWLEDGE_FILE_MAP.get(key)

    if filename is None:
        raise UnknownClassError(crop, disease)

    knowledge_path = _KNOWLEDGE_DIR / filename

    if not knowledge_path.exists():
        raise FileNotFoundError(
            f"Disease-knowledge file '{filename}' is registered in the class map "
            f"but was not found at: {knowledge_path}. "
            "This is a repository configuration error — the file must not be deleted."
        )

    with open(knowledge_path, encoding="utf-8") as f:
        return json.load(f)


def _soften_actions(actions: list[str]) -> list[str]:
    """
    Prepend the uncertainty prefix to an action list when is_confident is False.
    The original knowledge entries are untouched — this wraps them at runtime.
    """
    return [_UNCERTAIN_ACTIONS_PREFIX] + actions


def _rewrite_description_with_gemini(
    crop: str,
    disease: str,
    description: str,
    immediate_actions: list[str],
    spread_prevention: list[str],
) -> str:
    """Optionally make the verified explanation more farmer-friendly with Gemini.

    Gemini receives only facts already approved by the local knowledge base. If
    the key, SDK, network, or response is unavailable, the verified description
    is returned unchanged.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return description

    try:
        from google import genai
        from google.genai import errors as genai_errors

        client = genai.Client(api_key=api_key)
        prompt = (
            "Rewrite the verified plant-disease explanation below in simple, "
            "farmer-friendly English. Return only one short paragraph. Do not "
            "add treatments, chemicals, dosages, causes, claims, or actions. "
            "Use only the supplied facts.\n\n"
            f"Crop: {crop}\nDisease: {disease}\n"
            f"Verified explanation: {description}\n"
            f"Verified immediate actions: {immediate_actions}\n"
            f"Verified spread prevention: {spread_prevention}"
        )
        response = client.models.generate_content(model=_GEMINI_MODEL, contents=prompt)
        rewritten = (response.text or "").strip()
        return rewritten or description
    except ImportError as exc:
        logger.warning("Gemini SDK unavailable; using verified text: %s", exc)
        return description
    except (OSError, RuntimeError, ValueError, genai_errors.APIError) as exc:
        logger.warning("Gemini advisory rewrite unavailable; using verified text: %s", exc)
        return description


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def get_recommendation(
    crop: str,
    disease: str,
    confidence: float,
    is_confident: bool,
) -> AdvisoryResponse:
    """
    Look up verified disease guidance and return a structured advisory response.

    Parameters
    ----------
    crop : str
        "citrus" or "guava" — as returned by prediction/classifier.py.
    disease : str
        Exact trained class label — as returned by prediction/classifier.py.
    confidence : float
        Softmax probability of the winning class (0.0–1.0).
    is_confident : bool
        From the prediction contract. When False, the response is softened
        and an uncertainty_warning is prepended.

    Returns
    -------
    AdvisoryResponse
        Structured advisory dict ready for the backend to serialise and
        return to the frontend.

    Raises
    ------
    UnknownClassError
        If (crop, disease) is outside the 10 trained categories.
        The advisory layer will never fabricate guidance for unknown classes.
    """
    # --- 1. Load verified knowledge entry ----------------------------------
    # This will raise UnknownClassError if the class is not recognised.
    knowledge = _load_knowledge(crop, disease)

    # --- 2. Extract structured fields from the knowledge entry -------------
    description:          str       = knowledge["description"]
    immediate_actions:    list[str] = knowledge["immediate_actions"]
    spread_prevention:    list[str] = knowledge["spread_prevention"]
    long_term_monitoring: list[str] = knowledge["long_term_monitoring"]
    status:               str       = knowledge["status"]
    disclaimer:           str       = knowledge["disclaimer"]

    description = _rewrite_description_with_gemini(
        crop=crop,
        disease=disease,
        description=description,
        immediate_actions=immediate_actions,
        spread_prevention=spread_prevention,
    )

    # --- 3. Apply uncertainty softening when is_confident is False ---------
    # If the model is not confident, we:
    #   a) Set uncertainty_warning to the standard warning string.
    #   b) Prepend a softening prefix to immediate_actions so the farmer
    #      knows to confirm before acting — especially on irreversible steps.
    #   c) Do NOT modify spread_prevention or long_term_monitoring, as these
    #      are precautionary in nature and appropriate regardless of certainty.
    uncertainty_warning: str | None = None

    if not is_confident:
        uncertainty_warning = _UNCERTAINTY_WARNING
        immediate_actions = _soften_actions(immediate_actions)

    # --- 4. Assemble and return the advisory response ----------------------
    return AdvisoryResponse(
        crop=crop,
        disease=disease,
        status=status,
        confidence=confidence,
        is_confident=is_confident,
        uncertainty_warning=uncertainty_warning,
        disclaimer=disclaimer,
        description=description,
        immediate_actions=immediate_actions,
        spread_prevention=spread_prevention,
        long_term_monitoring=long_term_monitoring,
    )
