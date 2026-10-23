#!/usr/bin/env python3
"""
Gate 3 Perceptual Color Script & Anti-AI-Slop Validator (Bjorn Ottosson OKLCH Engine).
Validates `03_color_script.json` against Cinema Code Studio Colorist laws:
1. Exact sRGB Hex -> Oklab -> OKLCH conversion (`L`, `C`, `H`)
2. Anti-AI-Slop Pigment Guard:
   - FORBIDS purple / violet / magenta hues (`275 <= H <= 345` when `C > 0.04`)
   - FORBIDS neon over-saturation (`C > 0.175` — enforces physical film dye / print ink ceiling)
   - FORBIDS electric neon cyan (`190 <= H <= 242` when `C > 0.105` and `L > 0.66`)
   - FORBIDS cold tech-navy dark backgrounds (`235 <= H <= 285` when `L < 0.25` and `C > 0.012`)
3. Squint-Test Luminance Separation (`|dL| >= 0.38` between hero/text and background)
4. Film-Shoulder Highlight Rule (forbids raw `#FFFFFF` L>0.985 or dead `#000000` L<0.05)
5. 60-30-10 Pixel Area Budget check
"""

from __future__ import annotations

import argparse
import json
import math
import re
import sys
from pathlib import Path

HEX_RE = re.compile(r"^#?([0-9a-fA-F]{6})$")


def srgb_channel_to_linear(c: float) -> float:
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hex_to_oklch(hex_str: str) -> tuple[float, float, float]:
    """Converts `#RRGGBB` sRGB hex to `(L, C, H_deg)` in perceptual OKLCH space."""
    m = HEX_RE.match(hex_str.strip())
    if not m:
        raise ValueError(f"Invalid 6-digit hex color: {hex_str}")
    raw = m.group(1)
    r = srgb_channel_to_linear(int(raw[0:2], 16) / 255.0)
    g = srgb_channel_to_linear(int(raw[2:4], 16) / 255.0)
    b = srgb_channel_to_linear(int(raw[4:6], 16) / 255.0)

    l_lms = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
    m_lms = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
    s_lms = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b

    l_ = l_lms ** (1.0 / 3.0) if l_lms > 0 else 0.0
    m_ = m_lms ** (1.0 / 3.0) if m_lms > 0 else 0.0
    s_ = s_lms ** (1.0 / 3.0) if s_lms > 0 else 0.0

    L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_
    a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_
    b_ok = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_

    C = math.sqrt(a * a + b_ok * b_ok)
    H = (math.degrees(math.atan2(b_ok, a)) + 360.0) % 360.0
    return round(L, 4), round(C, 4), round(H, 2)


def check_anti_ai_slop(mood_id: str, key: str, hex_val: str, L: float, C: float, H: float) -> list[str]:
    errs: list[str] = []
    # 1. Ban purple / violet / magenta AI-slop hues
    if 275.0 <= H <= 345.0 and C > 0.04:
        errs.append(
            f"[{mood_id}] `{key}` ({hex_val}, H={H} deg, C={C}) uses forbidden purple/violet/magenta hue. "
            "Use analog film/print pigments (ochre, brass, terracotta, sage, bone, warm charcoal)."
        )
    # 2. Ban neon chroma (sRGB synthetics exceed natural film/print pigment C <= 0.175)
    if C > 0.175:
        errs.append(
            f"[{mood_id}] `{key}` ({hex_val}, C={C}) exceeds natural pigment chroma ceiling (C <= 0.175) — "
            "looks like neon digital AI slop. Desaturate into an earthy/matte analog pigment."
        )
    # 3. Ban electric Tailwind sky/cyan glow
    if 190.0 <= H <= 242.0 and C > 0.105 and L > 0.66:
        errs.append(
            f"[{mood_id}] `{key}` ({hex_val}, L={L}, C={C}, H={H} deg) is electric neon cyan/sky. "
            "Use warm brass (#C8963E), matte terracotta (#C84B31), or muted Prussian steel (#4A6678)."
        )
    # 4. Ban generic cold blue-navy dark backgrounds (#0F172A / #0D1017)
    if key in ("dominantBg", "secondarySurface") and L < 0.28 and 235.0 <= H <= 285.0 and C > 0.011:
        errs.append(
            f"[{mood_id}] `{key}` ({hex_val}, H={H} deg, C={C}) is cold blue-slate tech dark mode. "
            "Use warm matte carbon (#141311) or oxide charcoal (#161513) with low chroma (C <= 0.010)."
        )
    return errs


def validate_palette_mood(mood: dict, allow_neon: bool = False) -> tuple[list[str], list[str], dict]:
    errors: list[str] = []
    warnings: list[str] = []
    mood_id = mood.get("id", "unnamed_mood")

    colors = mood.get("colors", {})
    for key in ("dominantBg", "secondarySurface", "primaryText", "heroAccent"):
        if key not in colors:
            errors.append(f"[{mood_id}] Missing required color key `colors.{key}`")

    if errors:
        return errors, warnings, {}

    parsed = {k: hex_to_oklch(colors[k]) for k in ("dominantBg", "secondarySurface", "primaryText", "heroAccent")}
    bg_L, bg_C, bg_H = parsed["dominantBg"]
    surf_L, surf_C, surf_H = parsed["secondarySurface"]
    txt_L, txt_C, txt_H = parsed["primaryText"]
    hero_L, hero_C, hero_H = parsed["heroAccent"]

    if not allow_neon:
        for k, (L_v, C_v, H_v) in parsed.items():
            errors.extend(check_anti_ai_slop(mood_id, k, colors[k], L_v, C_v, H_v))

    # Film-shoulder roll-off checks (no raw #FFFFFF or #000000)
    for label, L_val, hex_val in (
        ("dominantBg", bg_L, colors["dominantBg"]),
        ("primaryText", txt_L, colors["primaryText"]),
    ):
        if L_val > 0.985:
            errors.append(
                f"[{mood_id}] `{label}` ({hex_val}, L={L_val}) is clipped digital white (#FFF). "
                "Use silver-gelatin bone (#EDE7DA or #EFE9DD, L~0.92-0.95)."
            )
        if L_val < 0.05:
            errors.append(
                f"[{mood_id}] `{label}` ({hex_val}, L={L_val}) is crushed pure black (#000). "
                "Use warm matte carbon (#141311, L~0.18)."
            )

    # Squint-test perceptual lightness separation
    text_contrast_dL = round(abs(txt_L - bg_L), 4)
    hero_contrast_dL = round(abs(hero_L - bg_L), 4)
    if text_contrast_dL < 0.45:
        errors.append(
            f"[{mood_id}] Primary text fails squint-test hierarchy: |dL|={text_contrast_dL} (< 0.45) against dominantBg."
        )
    if hero_contrast_dL < 0.36:
        errors.append(
            f"[{mood_id}] Hero accent fails squint-test hierarchy: |dL|={hero_contrast_dL} (< 0.36) against dominantBg."
        )

    if bg_C > 0.06:
        warnings.append(
            f"[{mood_id}] `dominantBg` has elevated chroma C={bg_C} (>0.06). Keep 60% canvas calm and neutral."
        )

    ratios = mood.get("pixelRatio", {"dominant": 60, "secondary": 30, "accent": 10})
    total_ratio = ratios.get("dominant", 0) + ratios.get("secondary", 0) + ratios.get("accent", 0)
    if abs(total_ratio - 100) > 2:
        errors.append(f"[{mood_id}] `pixelRatio` must sum to 100 (got {total_ratio}).")
    if ratios.get("accent", 10) > 15:
        errors.append(f"[{mood_id}] `pixelRatio.accent` is {ratios.get('accent')}% (> 15%).")

    metrics = {
        "dominantBg_OKLCH": [bg_L, bg_C, bg_H],
        "secondarySurface_OKLCH": [surf_L, surf_C, surf_H],
        "primaryText_OKLCH": [txt_L, txt_C, txt_H],
        "heroAccent_OKLCH": [hero_L, hero_C, hero_H],
        "textDeltaL": text_contrast_dL,
        "heroDeltaL": hero_contrast_dL,
    }
    return errors, warnings, metrics


def main() -> None:
    parser = argparse.ArgumentParser(description="Validate OKLCH perceptual color script & Anti-AI-Slop pigment rules.")
    parser.add_argument("color_script", type=Path, help="Path to 03_color_script.json")
    parser.add_argument("--allow-neon", action="store_true", help="Bypass anti-neon/purple pigment guard")
    args = parser.parse_args()

    if not args.color_script.exists():
        print(f"Error: file not found: {args.color_script}", file=sys.stderr)
        sys.exit(1)

    data = json.loads(args.color_script.read_text(encoding="utf-8"))
    moods = data.get("moods", [])
    if not moods:
        print("Error: `03_color_script.json` must contain a non-empty `moods` array.", file=sys.stderr)
        sys.exit(1)

    all_errors: list[str] = []
    all_warnings: list[str] = []
    mood_reports: dict = {}

    for mood in moods:
        errs, warns, metrics = validate_palette_mood(mood, allow_neon=args.allow_neon)
        all_errors.extend(errs)
        all_warnings.extend(warns)
        mood_reports[mood.get("id", "unnamed")] = metrics

    report = {
        "valid": len(all_errors) == 0,
        "moodCount": len(moods),
        "errors": all_errors,
        "warnings": all_warnings,
        "perceptualMetrics": mood_reports,
    }
    print(json.dumps(report, indent=2))
    sys.exit(0 if len(all_errors) == 0 else 1)


if __name__ == "__main__":
    main()
