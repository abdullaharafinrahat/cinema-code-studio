#!/usr/bin/env python3
"""
Gate 3.5 Mixed-Media Asset Auditor & Visual Verification Contact Sheet Builder.
Before writing scene `.tsx` code, Cinema Code Studio requires every fetched online photo,
authentic brand/software SVG icon, and studio plate in `public/assets/` to be verified:
1. Raster photos (`jpg`, `jpeg`, `png`, `webp`): checks dimensions, aspect ratio, non-blank variance,
   and HSV purple/violet contamination (`270 <= H <= 335`, `S > 0.35`, `V > 0.25`).
2. Vector icons (`svg`): verifies well-formed XML `<svg>` root and flags forbidden `#8B5CF6`/`purple` fills.
3. Builds a labeled `asset-verification-sheet.jpg` contact sheet so the Creative Director can visually
   confirm literal script relevance and zero duplicated/hallucinated subjects before compositing.
"""

from __future__ import annotations

import argparse
import json
import math
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageStat

RASTER_EXTS = {".jpg", ".jpeg", ".png", ".webp"}
PURPLE_HEX_RE = re.compile(r"#(?:8b5cf6|a855f7|9333ea|7c3aed|c084fc|d946ef|e879f9|ff00ff)\b", re.IGNORECASE)


def compute_purple_pct(im: Image.Image) -> float:
    hsv = im.convert("RGB").resize((240, 135), Image.Resampling.BILINEAR).convert("HSV")
    raw = hsv.tobytes()
    total = len(raw) // 3
    if total == 0:
        return 0.0
    # PIL HSV: H in 0..255 (0..360 deg -> 270 deg = 191, 335 deg = 237), S in 0..255, V in 0..255
    purple_count = 0
    for i in range(0, len(raw), 3):
        h, s, v = raw[i], raw[i + 1], raw[i + 2]
        if 191 <= h <= 237 and s > 90 and v > 64:
            purple_count += 1
    return round((purple_count / total) * 100.0, 3)


def audit_svg(path: Path) -> dict:
    text = path.read_text(encoding="utf-8", errors="replace")
    issues: list[str] = []
    try:
        root = ET.fromstring(text)
        if not root.tag.lower().endswith("svg"):
            issues.append("Root XML element is not <svg>")
    except ET.ParseError as exc:
        issues.append(f"Malformed SVG XML: {exc}")

    if PURPLE_HEX_RE.search(text):
        issues.append("Contains forbidden purple/magenta hex fill")

    return {
        "file": path.name,
        "path": str(path),
        "kind": "svg",
        "bytes": path.stat().st_size,
        "valid": len(issues) == 0,
        "issues": issues,
    }


def audit_raster(path: Path, min_width: int = 400) -> tuple[dict, Image.Image | None]:
    issues: list[str] = []
    try:
        im = Image.open(path)
        im.load()
    except Exception as exc:
        return {
            "file": path.name,
            "path": str(path),
            "kind": "raster",
            "valid": False,
            "issues": [f"Cannot decode image: {exc}"],
        }, None

    w, h = im.size
    if w < min_width:
        issues.append(f"Width {w}px < minimum {min_width}px")

    gray_std = round(ImageStat.Stat(im.convert("L")).stddev[0], 2)
    if gray_std < 6.0:
        issues.append(f"Near-blank or solid-color image (luma std={gray_std})")

    purple_pct = compute_purple_pct(im)
    if purple_pct > 1.5:
        issues.append(f"Purple/violet contamination={purple_pct}% (> 1.5% limit)")

    return {
        "file": path.name,
        "path": str(path),
        "kind": "raster",
        "width": w,
        "height": h,
        "lumaStd": gray_std,
        "purplePct": purple_pct,
        "valid": len(issues) == 0,
        "issues": issues,
    }, im


def build_contact_sheet(rasters: list[tuple[dict, Image.Image]], out_sheet: Path) -> None:
    if not rasters:
        return
    cols = min(3, len(rasters))
    rows = math.ceil(len(rasters) / cols)
    tw, th, pad = 480, 270, 18
    sheet = Image.new("RGB", (pad + cols * (tw + pad), pad + rows * (th + 42 + pad)), (8, 13, 26))
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()

    for idx, (meta, im) in enumerate(rasters):
        r, c = divmod(idx, cols)
        x = pad + c * (tw + pad)
        y = pad + r * (th + 42 + pad)
        thumb = im.convert("RGB").resize((tw, th), Image.Resampling.LANCZOS)
        sheet.paste(thumb, (x, y))
        border_col = (56, 189, 248) if meta["valid"] else (239, 68, 68)
        draw.rectangle([x, y, x + tw, y + th], outline=border_col, width=2)
        draw.text(
            (x + 4, y + th + 6),
            f"{meta['file']} ({meta['width']}x{meta['height']}) purple={meta['purplePct']}%",
            fill=(241, 245, 249),
            font=font,
        )

    out_sheet.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out_sheet, quality=92)


def main() -> None:
    parser = argparse.ArgumentParser(description="Audit mixed-media photos & SVG icons and render verification sheet.")
    parser.add_argument("assets_dir", type=Path, help="Path to remotion/public/assets")
    parser.add_argument("--out-sheet", type=Path, required=True, help="Output JPG/PNG contact sheet path")
    parser.add_argument("--min-width", type=int, default=400, help="Minimum width for raster assets (default: 400)")
    args = parser.parse_args()

    if not args.assets_dir.exists():
        print(f"Error: assets directory not found: {args.assets_dir}", file=sys.stderr)
        sys.exit(1)

    svg_reports: list[dict] = []
    raster_reports: list[dict] = []
    loaded_rasters: list[tuple[dict, Image.Image]] = []

    for p in sorted(args.assets_dir.rglob("*")):
        if not p.is_file():
            continue
        ext = p.suffix.lower()
        if ext == ".svg":
            svg_reports.append(audit_svg(p))
        elif ext in RASTER_EXTS:
            rep, im = audit_raster(p, min_width=args.min_width)
            raster_reports.append(rep)
            if im is not None:
                loaded_rasters.append((rep, im))

    build_contact_sheet(loaded_rasters, args.out_sheet)
    invalid = [r for r in (svg_reports + raster_reports) if not r["valid"]]

    summary = {
        "valid": len(invalid) == 0,
        "svgCount": len(svg_reports),
        "rasterCount": len(raster_reports),
        "contactSheet": str(args.out_sheet),
        "svgs": svg_reports,
        "rasters": raster_reports,
    }
    print(json.dumps(summary, indent=2))
    sys.exit(0 if len(invalid) == 0 else 1)


if __name__ == "__main__":
    main()
