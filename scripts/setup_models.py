"""
setup_models.py
---------------
Copy the per-crop ResNet50 checkpoints from the ks training project into
disease-detection/models/ so the inference pipeline can start.

Usage:
    python scripts/setup_models.py
"""

from __future__ import annotations

import shutil
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
MODELS_DIR = PROJECT_ROOT / "disease-detection" / "models"
KS_OUTPUTS = PROJECT_ROOT.parent / "ks" / "outputs_test3"

COPY_MAP = {
    "best_guava_ResNet50.keras": "best_guava_ResNet50.keras",
    "best_citrus_ResNet50.keras": "best_citrus_ResNet50.keras",
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

    if copied == 0:
        raise SystemExit(
            "No model files copied. Place best_guava_ResNet50.keras and "
            "best_citrus_ResNet50.keras in disease-detection/models/ manually."
        )

    print(f"Done. {copied} crop model(s) ready in {MODELS_DIR}")


if __name__ == "__main__":
    main()
