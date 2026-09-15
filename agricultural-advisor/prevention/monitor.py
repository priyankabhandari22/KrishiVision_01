"""
monitor.py
----------
Long-term prevention and monitoring layer for KrishiVision.

This module is DELIBERATELY SEPARATE from agricultural-advisor/recommendations/
and must remain so. The separation enforces the pipeline contract:

  recommendations/advisor.py  → short-term: description + immediate_actions
  prevention/monitor.py       → long-term:  spread_prevention + monitoring schedule

The backend API assembles both into a single response, but they must never
be merged into one function — each layer has its own concern and lifecycle.

What this module adds over the raw knowledge entry:
  - `universal_hygiene_practices` — recurring good-practice routines that
    apply to every farm regardless of the detected disease or crop.
  - `inspection_schedule` — structured inspection frequency guidance keyed to
    the disease's risk profile (routine, elevated, urgent).
  - `spread_prevention` — disease-specific spread prevention from the
    knowledge entry (medium-term, ongoing).
  - `long_term_monitoring` — disease-specific long-term surveillance steps
    from the knowledge entry.

Nothing in this file invents chemical names, brand names, or dosages.
All disease-specific text originates from the disease-knowledge/ JSON files.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Literal, TypedDict

# ---------------------------------------------------------------------------
# Path to the shared disease-knowledge directory.
# The prevention layer reads the same knowledge files as the recommendation
# layer but extracts only the long-term fields. Each layer loads what it
# needs independently — no shared runtime state between the two modules.
# ---------------------------------------------------------------------------
_KNOWLEDGE_DIR = (
    Path(__file__).resolve()
    .parent   # prevention/
    .parent   # agricultural-advisor/
    / "disease-knowledge"
)

# ---------------------------------------------------------------------------
# Authoritative (crop, disease) → filename map.
# Must stay in sync with the equivalent map in recommendations/advisor.py.
# If a new class is ever added, update BOTH maps and add a knowledge file.
# ---------------------------------------------------------------------------
_KNOWLEDGE_FILE_MAP: dict[tuple[str, str], str] = {
    ("citrus", "Black spot"):      "citrus_black_spot.json",
    ("citrus", "Melanose"):        "citrus_melanose.json",
    ("citrus", "Canker"):          "citrus_canker.json",
    ("citrus", "Greening"):        "citrus_greening.json",
    ("citrus", "Healthy"):         "citrus_healthy.json",
    ("guava",  "Disease Free"):    "guava_disease_free.json",
    ("guava",  "Phytopthora"):     "guava_phytopthora.json",
    ("guava",  "Red rust"):        "guava_red_rust.json",
    ("guava",  "Scab"):            "guava_scab.json",
    ("guava",  "Styler and Root"): "guava_styler_and_root.json",
}

# ---------------------------------------------------------------------------
# Inspection frequency tiers.
# These are assigned per (crop, disease) based on the disease's known spread
# speed and severity — NOT on the model's confidence score. Confidence
# affects the recommendation layer's uncertainty warning; here we describe
# the monitoring cadence appropriate for the disease itself.
# ---------------------------------------------------------------------------

#: How frequently a farmer should inspect after a given diagnosis.
InspectionFrequency = Literal["monthly", "fortnightly", "weekly"]

_INSPECTION_FREQUENCY: dict[tuple[str, str], InspectionFrequency] = {
    # Citrus
    ("citrus", "Healthy"):    "monthly",      # routine maintenance
    ("citrus", "Black spot"): "fortnightly",  # fungal — active during wet season
    ("citrus", "Melanose"):   "fortnightly",  # fungal from dead wood
    ("citrus", "Canker"):     "weekly",        # bacterial — fast spreading
    ("citrus", "Greening"):   "weekly",        # incurable — psyllid monitoring critical
    # Guava
    ("guava",  "Disease Free"):    "monthly",
    ("guava",  "Red rust"):        "fortnightly",
    ("guava",  "Scab"):            "fortnightly",
    ("guava",  "Phytopthora"):     "weekly",    # soil-borne — can cause rapid tree loss
    ("guava",  "Styler and Root"): "weekly",    # combined root + fruit threat
}

_FREQUENCY_GUIDANCE: dict[InspectionFrequency, str] = {
    "monthly": (
        "Inspect all trees once a month, and after any significant weather event "
        "(heavy rain, strong wind, extreme heat). Focus on new leaf growth, "
        "fruit surfaces, and the trunk base."
    ),
    "fortnightly": (
        "Inspect all trees every two weeks during the active growing and wet seasons, "
        "and monthly during dry periods. Pay close attention to new growth flushes "
        "and fruit at early stages of development."
    ),
    "weekly": (
        "Inspect all trees at least once a week while active symptoms are present. "
        "Check for new lesions, wilting, fruit drop, and spread to neighbouring trees. "
        "Keep a written log of changes between inspections."
    ),
}

# ---------------------------------------------------------------------------
# Universal hygiene practices — applies to every farm, every disease.
# These are recurring habits, not one-time actions (which belong in
# immediate_actions in the recommendations layer).
# ---------------------------------------------------------------------------
_UNIVERSAL_HYGIENE_PRACTICES: list[str] = [
    "Disinfect all pruning and harvesting tools between every tree, every time — "
    "this single habit prevents the majority of mechanical disease spread.",
    "Remove and destroy fallen fruit, leaves, and cut branches promptly — "
    "do not leave organic debris on the orchard floor.",
    "Wash hands and disinfect footwear when moving between different areas "
    "of the grove, particularly if one area has a confirmed or suspected infection.",
    "Keep a simple orchard diary: record dates of inspections, symptoms observed, "
    "and actions taken — patterns become visible over time.",
    "Do not introduce planting material (seedlings, cuttings, budwood) from "
    "outside the grove without confirmation that it is certified disease-free.",
    "Review irrigation method periodically — overhead irrigation that wets "
    "foliage creates conditions favourable to many fungal and bacterial diseases.",
]


# ---------------------------------------------------------------------------
# Types
# ---------------------------------------------------------------------------

class PreventionPlan(TypedDict):
    """
    Structured long-term prevention and monitoring plan.

    Returned by get_prevention_plan() and assembled by the backend API into
    the final response alongside AdvisoryResponse from the recommendations layer.

    Fields
    ------
    crop                      : "citrus" | "guava"
    disease                   : exact trained class label
    inspection_frequency      : "monthly" | "fortnightly" | "weekly"
    inspection_guidance       : str — plain-language description of the cadence
    universal_hygiene_practices : list[str] — recurring good habits for all farms
    spread_prevention         : list[str] — disease-specific ongoing spread controls
    long_term_monitoring      : list[str] — disease-specific surveillance steps
    """
    crop:                       str
    disease:                    str
    inspection_frequency:       InspectionFrequency
    inspection_guidance:        str
    universal_hygiene_practices: list[str]
    spread_prevention:          list[str]
    long_term_monitoring:       list[str]


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _load_knowledge(crop: str, disease: str) -> dict:
    """Load and return the disease-knowledge JSON for the given (crop, disease)."""
    key = (crop.lower(), disease)
    filename = _KNOWLEDGE_FILE_MAP.get(key)

    if filename is None:
        # Mirror the hard-fail behaviour of the recommendations layer.
        # The prevention layer must never fabricate guidance for unknown classes.
        raise ValueError(
            f"No disease-knowledge entry for crop='{crop}', disease='{disease}'. "
            "The prevention layer only covers the 10 trained classes."
        )

    knowledge_path = _KNOWLEDGE_DIR / filename
    if not knowledge_path.exists():
        raise FileNotFoundError(
            f"Knowledge file '{filename}' is registered but missing at: {knowledge_path}. "
            "This is a repository configuration error."
        )

    with open(knowledge_path, encoding="utf-8") as f:
        return json.load(f)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def get_prevention_plan(crop: str, disease: str) -> PreventionPlan:
    """
    Return the long-term prevention and monitoring plan for a detected disease.

    This function is called AFTER get_recommendation() in the request pipeline.
    The backend assembles both outputs into a single API response — this module
    must never merge its output with the recommendations layer internally.

    Parameters
    ----------
    crop : str
        "citrus" or "guava" — as returned by prediction/classifier.py.
    disease : str
        Exact trained class label — as returned by prediction/classifier.py.

    Returns
    -------
    PreventionPlan
        Structured plan containing:
        - inspection frequency tier and plain-language guidance
        - universal recurring hygiene practices (all farms)
        - disease-specific spread prevention (from knowledge entry)
        - disease-specific long-term monitoring steps (from knowledge entry)

    Raises
    ------
    ValueError
        If (crop, disease) is outside the 10 trained categories.
    FileNotFoundError
        If the knowledge file is registered but missing (configuration error).
    """
    knowledge = _load_knowledge(crop, disease)

    key = (crop.lower(), disease)
    frequency: InspectionFrequency = _INSPECTION_FREQUENCY[key]

    return PreventionPlan(
        crop=crop,
        disease=disease,
        inspection_frequency=frequency,
        inspection_guidance=_FREQUENCY_GUIDANCE[frequency],
        universal_hygiene_practices=_UNIVERSAL_HYGIENE_PRACTICES,
        spread_prevention=knowledge["spread_prevention"],
        long_term_monitoring=knowledge["long_term_monitoring"],
    )
