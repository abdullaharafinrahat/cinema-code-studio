#!/usr/bin/env python3
"""
Gate 4 Visual Storyboard Sheet Renderer.
Renders `04_storyboard.json` into a clean dark-room Studio Storyboard Sheet (`storyboard.png`)
using Pillow so the Creative Director / user can inspect composition grids, eye-trace vectors,
shot scale progression, color script swatches, and VO pacing before coding scenes.
"""

from __future__ import annotations

import argparse
import json
import math
import textwrap
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

BEAT_COLORS = {
    "HOOK": (200, 75, 49),      # Braun Terracotta
    "SETUP": (168, 159, 145),   # Warm Pewter
    "TENSION": (184, 67, 42),   # Iron Oxide Rust
    "EVIDENCE": (110, 139, 107),# Analog Sage
    "REHOOK": (200, 150, 62),   # Aged Brass
    "PAYOFF": (212, 163, 89),   # Champagne Gold
    "CTA": (226, 218, 203),     # Silver-Gelatin Bone
}


def parse_hex_rgb(hex_str: str, fallback: tuple[int, int, int]) -> tuple[int, int, int]:
    s = hex_str.strip().lstrip("#")
    if len(s) == 6:
        try:
            return int(s[0:2], 16), int(s[2:4], 16), int(s[4:6], 16)
        except ValueError:
            pass
    return fallback


def draw_arrow(
    draw: ImageDraw.ImageDraw,
    p1: tuple[float, float],
    p2: tuple[float, float],
    color: tuple[int, int, int],
    width: int = 2,
) -> None:
    draw.line([p1, p2], fill=color, width=width)
    dx, dy = p2[0] - p1[0], p2[1] - p1[1]
    dist = math.hypot(dx, dy)
    if dist < 6:
        return
    angle = math.atan2(dy, dx)
    head_len = 8
    a1 = angle + math.pi * 0.82
    a2 = angle - math.pi * 0.82
    draw.polygon(
        [
            p2,
            (p2[0] + head_len * math.cos(a1), p2[1] + head_len * math.sin(a1)),
            (p2[0] + head_len * math.cos(a2), p2[1] + head_len * math.sin(a2)),
        ],
        fill=color,
    )


def load_ui_font(size: int = 12) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/TTF/DejaVuSans.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "C:/Windows/Fonts/segoeui.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            try:
                return ImageFont.truetype(path, size=size)
            except OSError:
                pass
    return ImageFont.load_default()


def render_board(storyboard_path: Path, out_png: Path) -> dict:
    data = json.loads(storyboard_path.read_text(encoding="utf-8"))
    shots = data.get("shots", [])
    aspect = data.get("aspectRatio", "16:9")
    title = data.get("projectTitle", "Untitled Production")
    fps = data.get("fps", 60)

    is_vertical = aspect == "9:16"
    cols = 4 if is_vertical else 3
    rows = max(1, math.ceil(len(shots) / cols))

    card_w = 340 if is_vertical else 440
    vp_w = 198 if is_vertical else 392
    vp_h = 352 if is_vertical else 220
    card_h = vp_h + 195
    pad = 26
    header_h = 86

    canvas_w = pad + cols * (card_w + pad)
    canvas_h = header_h + rows * (card_h + pad) + pad

    img = Image.new("RGB", (canvas_w, canvas_h), (13, 16, 23))
    draw = ImageDraw.Draw(img)
    font = load_ui_font(12)

    # Header bar
    draw.rectangle([(0, 0), (canvas_w, header_h - 12)], fill=(20, 25, 35))
    total_dur = shots[-1]["endSec"] if shots else 0.0
    header_text = (
        f"CINEMA CODE STUDIO  |  STORYBOARD & EYE-TRACE SHEET  |  {title.upper()}  "
        f"[{aspect} @ {fps}fps | {len(shots)} Shots | {total_dur:.2f}s]"
    )
    draw.text((pad, 22), header_text, fill=(242, 239, 233), font=font)
    draw.text(
        (pad, 44),
        "Legend:  (O) Entry Focal Point   ---> Intra-Shot Gaze Drift   [Grid] Composition & Safe Zones",
        fill=(148, 163, 184),
        font=font,
    )

    for idx, shot in enumerate(shots):
        r = idx // cols
        c = idx % cols
        cx = pad + c * (card_w + pad)
        cy = header_h + r * (card_h + pad)

        # Card shell
        draw.rounded_rectangle(
            [(cx, cy), (cx + card_w, cy + card_h)],
            radius=10,
            fill=(22, 27, 38),
            outline=(45, 55, 72),
            width=1,
        )

        beat = shot.get("narrativeBeat", "SETUP")
        beat_col = BEAT_COLORS.get(beat, (148, 163, 184))
        dur = shot["endSec"] - shot["startSec"]

        # Top metadata strip
        draw.text(
            (cx + 14, cy + 10),
            f"{shot['shotId']}  [{shot['startSec']:.2f}s - {shot['endSec']:.2f}s | {dur:.2f}s]",
            fill=(242, 239, 233),
            font=font,
        )
        badge_x = cx + card_w - 116
        draw.rounded_rectangle([(badge_x, cy + 7), (cx + card_w - 12, cy + 25)], radius=5, fill=beat_col)
        draw.text((badge_x + 8, cy + 10), f"{beat[:10]}|{shot['shotScale']}", fill=(12, 14, 18), font=font)

        # Viewport box
        vx = cx + (card_w - vp_w) // 2
        vy = cy + 34
        pal = shot.get("paletteHexPreview", {})
        bg_rgb = parse_hex_rgb(pal.get("bg", "#141311"), (20, 19, 17))
        surf_rgb = parse_hex_rgb(pal.get("surface", "#201E1B"), (32, 30, 27))
        hero_rgb = parse_hex_rgb(pal.get("hero", "#C8963E"), beat_col)

        draw.rectangle([(vx, vy), (vx + vp_w, vy + vp_h)], fill=bg_rgb, outline=(71, 85, 105), width=1)

        # Rule-of-thirds gridlines
        for frac in (1 / 3, 2 / 3):
            gx = int(vx + vp_w * frac)
            gy = int(vy + vp_h * frac)
            draw.line([(gx, vy), (gx, vy + vp_h)], fill=surf_rgb, width=1)
            draw.line([(vx, gy), (vx + vp_w, gy)], fill=surf_rgb, width=1)

        # Social 9:16 UI danger zone guide
        if is_vertical:
            safe_x1 = int(vx + vp_w * 0.08)
            safe_x2 = int(vx + vp_w * 0.86)
            safe_y1 = int(vy + vp_h * 0.12)
            safe_y2 = int(vy + vp_h * 0.76)
            draw.rectangle([(safe_x1, safe_y1), (safe_x2, safe_y2)], outline=(80, 95, 120), width=1)

        # Entry & Exit Focal Points
        ex1, ey1 = shot["entryFocalPoint"]
        ex2, ey2 = shot["exitFocalPoint"]
        p_in = (vx + ex1 * vp_w, vy + ey1 * vp_h)
        p_out = (vx + ex2 * vp_w, vy + ey2 * vp_h)

        # Draw focal crosshair & gaze vector
        draw.ellipse([(p_in[0] - 9, p_in[1] - 9), (p_in[0] + 9, p_in[1] + 9)], outline=hero_rgb, width=2)
        draw.ellipse([(p_in[0] - 3, p_in[1] - 3), (p_in[0] + 3, p_in[1] + 3)], fill=hero_rgb)
        if math.hypot(p_out[0] - p_in[0], p_out[1] - p_in[1]) > 5:
            draw_arrow(draw, p_in, p_out, hero_rgb, width=2)
        draw.ellipse([(p_out[0] - 5, p_out[1] - 5), (p_out[0] + 5, p_out[1] + 5)], outline=(242, 239, 233), width=1)

        # Palette swatch pills inside bottom-right of viewport
        for s_i, col_rgb in enumerate([bg_rgb, surf_rgb, hero_rgb]):
            sx = vx + vp_w - 54 + s_i * 16
            sy = vy + vp_h - 16
            draw.rectangle([(sx, sy), (sx + 13, sy + 11)], fill=col_rgb, outline=(200, 200, 200))

        # Camera & caption metadata below viewport
        ty = vy + vp_h + 10
        cam_type = shot.get("cameraMove", {}).get("type", "STATIC_BREATH")
        trans_type = shot.get("transitionOut", {}).get("type", "HARD_CUT")
        cap_flag = "CAP:ON" if shot.get("captionsActive") else "CAP:MUTED"
        draw.text(
            (cx + 14, ty),
            f"Cam: {cam_type} | Out: {trans_type} | {cap_flag}",
            fill=(125, 211, 252),
            font=font,
        )

        wrap_chars = 48 if is_vertical else 64
        vis_lines = textwrap.wrap(f"VIS: {shot.get('visualDescription', '')}", width=wrap_chars)[:3]
        for l_idx, line in enumerate(vis_lines):
            draw.text((cx + 14, ty + 20 + l_idx * 15), line, fill=(226, 232, 240), font=font)

        aud_lines = textwrap.wrap(f"VO: \"{shot.get('audioScript', '')}\"", width=wrap_chars)[:2]
        for l_idx, line in enumerate(aud_lines):
            draw.text((cx + 14, ty + 72 + l_idx * 15), line, fill=(148, 163, 184), font=font)

    out_png.parent.mkdir(parents=True, exist_ok=True)
    img.save(out_png, format="PNG")
    return {"status": "rendered", "output": str(out_png), "dimensions": [canvas_w, canvas_h], "shots": len(shots)}


def main() -> None:
    parser = argparse.ArgumentParser(description="Render 04_storyboard.json into a visual studio storyboard PNG.")
    parser.add_argument("storyboard", type=Path, help="Path to 04_storyboard.json")
    parser.add_argument("--out", type=Path, required=True, help="Output PNG path (e.g., preprod/storyboard.png)")
    args = parser.parse_args()

    res = render_board(args.storyboard, args.out)
    print(json.dumps(res, indent=2))


if __name__ == "__main__":
    main()
