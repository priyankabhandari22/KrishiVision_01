"""
setup_models.py
---------------
Copy trained ResNet50 checkpoints from the ks training project into
disease-detection/models/ so the inference pipeline can start.

Usage:
    python scripts/setup_models.py
"""

from __future__ import annotations

import shutil
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
MODELS_DIR = PROJECT_ROOT / "disease-detection" / "models"
KS_OUTPUTS = PROJECT_ROOT.parent / "ks" / "outputs"

COPY_MAP = {
    "best_model_citrus_ResNet50.keras": "KrishiVision_Citrus_ResNet50.keras",
    "best_model_guava_ResNet50.keras": "KrishiVision_Guava_ResNet50.keras",
}


def main() -> None:
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    copied = 0

    for source_name, dest_name in COPY_MAP.items():
        source = KS_OUTPUTS / source_name
        dest = MODELS_DIR / dest_name
        if not source.exists():
            print(f"SKIP  {source_name} not found at {source}")
            continue
        shutil.copy2(source, dest)
        print(f"COPY  {source.name} -> {dest.relative_to(PROJECT_ROOT)}")
        copied += 1

    combined = MODELS_DIR / "KrishiVision_ResNet50.keras"
    citrus = MODELS_DIR / "KrishiVision_Citrus_ResNet50.keras"
    if citrus.exists() and not combined.exists():
        shutil.copy2(citrus, combined)
        print(f"COPY  {citrus.name} -> {combined.relative_to(PROJECT_ROOT)} (combined alias)")

    if copied == 0:
        raise SystemExit(
            "No model files copied. Place KrishiVision_ResNet50.keras or crop-specific "
            "checkpoints in disease-detection/models/ manually."
        )

    print(f"Done. {copied} crop model(s) ready in {MODELS_DIR}")


if __name__ == "__main__":
    main()
