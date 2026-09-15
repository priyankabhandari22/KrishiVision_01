"""
backend
-------
Backend package for KrishiVision REST API.
Registers hyphenated package aliases in sys.modules for clean imports across backend services.
"""

import sys
import types
from pathlib import Path

_ROOT = Path(__file__).resolve().parent.parent


def _ensure_module_alias(alias: str, rel_dir: str) -> None:
    if alias not in sys.modules:
        pkg_path = _ROOT / rel_dir
        if pkg_path.exists():
            mod = types.ModuleType(alias)
            mod.__path__ = [str(pkg_path)]
            sys.modules[alias] = mod


# Register aliases for hyphenated directory names
_ensure_module_alias("disease_detection", "disease-detection")
_ensure_module_alias("agricultural_advisor", "agricultural-advisor")
