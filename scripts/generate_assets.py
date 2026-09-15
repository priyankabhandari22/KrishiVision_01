"""
generate_assets.py
------------------
Create placeholder frontend raster assets when originals are missing.
"""

from __future__ import annotations

from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError as exc:
    raise SystemExit("Install Pillow first: pip install pillow") from exc

ASSETS_DIR = Path(__file__).resolve().parents[1] / "frontend" / "assets"


def _load_font(size: int):
    for name in ("arial.ttf", "segoeui.ttf", "DejaVuSans.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def create_logo() -> None:
    img = Image.new("RGBA", (320, 120), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.ellipse((8, 18, 88, 98), fill=(37, 117, 66, 255))
    draw.polygon([(48, 28), (72, 58), (48, 88), (24, 58)], fill=(134, 216, 74, 255))
    font = _load_font(34)
    draw.text((98, 36), "KrishiVision", fill=(22, 60, 41, 255), font=font)
    img.save(ASSETS_DIR / "logo-transparent.png")


def create_hero() -> None:
    img = Image.new("RGB", (960, 880), (12, 53, 35))
    draw = ImageDraw.Draw(img)
    for y in range(880):
        shade = 12 + int((y / 880) * 28)
        draw.line([(0, y), (960, y)], fill=(shade, shade + 30, shade + 18))
    draw.ellipse((120, 180, 860, 760), fill=(37, 117, 66))
    draw.ellipse((220, 260, 760, 680), fill=(55, 140, 78))
    draw.polygon([(480, 220), (620, 420), (480, 620), (340, 420)], fill=(167, 216, 74))
    draw.text((300, 720), "Citrus & Guava leaf intelligence", fill=(191, 213, 195), font=_load_font(28))
    img.save(ASSETS_DIR / "hero image.png", quality=92)


def main() -> None:
    ASSETS_DIR.mkdir(parents=True, exist_ok=True)
    create_logo()
    create_hero()
    print(f"Generated assets in {ASSETS_DIR}")


if __name__ == "__main__":
    main()
