#!/usr/bin/env python3
"""
Gate 8 Screening Room Contact-Sheet & Grayscale Squint-Test Generator.
Samples critical frames from a Remotion project (or pre-rendered PNG directory):
- Frame 0 (Hook survival test)
- Mid-scene settled composition frames
- Mid-transition overlap frames
Composites a labeled Executive Producer Screening Sheet (`qa-screening-sheet.png`) with:
1. Rule-of-thirds & 9:16/16:9 UI safe-zone danger overlays
2. Per-frame dynamic range & clipping telemetry (`meanLuma`, `clippedWhitePct`)
3. A bottom miniature Grayscale "Squint Test" strip to verify single-hero focal hierarchy
"""

from __future__ import annotations

import argparse
import json
import math
import shutil
import subprocess
import tempfile
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageStat


def compute_critical_frames(timeline: dict, max_samples: int = 12) -> list[dict]:
    fps = int(timeline.get("meta", {}).get("fps", 60))
    scenes = timeline.get("scenes", [])
    picks: list[dict] = [{"frame": 0, "label": "FRAME_0_HOOK", "shotId": scenes[0]["shotId"] if scenes else "S01"}]

    cursor = 0
    for idx, sc in enumerate(scenes):
        dur = int(sc.get("durationInFrames", 60))
        settled = cursor + min(dur - 2, max(12, int(dur * 0.48)))
        picks.append({"frame": settled, "label": f"{sc.get('shotId', sc['id'])}_SETTLED", "shotId": sc.get("shotId", "")})

        trans = sc.get("transitionAfter", {})
        t_dur = int(trans.get("durationInFrames", 0)) if trans.get("type", "none") != "none" else 0
        if t_dur > 0 and idx < len(scenes) - 1:
            mid_trans = cursor + dur - (t_dur // 2)
            picks.append({"frame": max(0, mid_trans), "label": f"{sc.get('shotId', '')}_TRANS", "shotId": sc.get("shotId", "")})
            cursor += dur - t_dur
        else:
            cursor += dur

    # Deduplicate and cap evenly if needed
    unique = []
    seen = set()
    for p in picks:
        if p["frame"] not in seen:
            seen.add(p["frame"])
            p["timeSec"] = round(p["frame"] / max(1, fps), 2)
            unique.append(p)

    if len(unique) > max_samples:
        step = (len(unique) - 1) / (max_samples - 1)
        unique = [unique[round(i * step)] for i in range(max_samples)]
    return unique


def render_remotion_stills(remotion_dir: Path, composition_id: str, samples: list[dict], out_dir: Path) -> list[Path]:
    npx = shutil.which("npx")
    if not npx:
        raise RuntimeError("npx not found in PATH; pass --frames-dir for pre-rendered PNGs or install Node.js.")

    paths: list[Path] = []
    for item in samples:
        out_file = out_dir / f"still_{item['frame']:05d}.png"
        cmd = [
            npx,
            "remotion",
            "still",
            composition_id,
            str(out_file),
            f"--frame={item['frame']}",
        ]
        subprocess.run(cmd, cwd=str(remotion_dir), check=True, capture_output=True, text=True)
        paths.append(out_file)
    return paths


def load_ui_font(size: int = 12) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for path in (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/TTF/DejaVuSans.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "C:/Windows/Fonts/segoeui.ttf",
    ):
        if Path(path).exists():
            try:
                return ImageFont.truetype(path, size=size)
            except OSError:
                pass
    return ImageFont.load_default()


def build_screening_sheet(
    frame_images: list[tuple[dict, Image.Image]],
    out_png: Path,
    fps: int,
) -> dict:
    if not frame_images:
        raise ValueError("No frames provided to build screening sheet.")

    sample_w, sample_h = frame_images[0][1].size
    is_vertical = sample_h > sample_w
    cols = 4 if is_vertical else 3
    rows = math.ceil(len(frame_images) / cols)

    thumb_w = 240 if is_vertical else 380
    thumb_h = int(round(thumb_w * (sample_h / max(1, sample_w))))
    pad = 20
    header_h = 74
    squint_strip_h = 140

    canvas_w = pad + cols * (thumb_w + pad)
    canvas_h = header_h + rows * (thumb_h + 44 + pad) + squint_strip_h + pad

    sheet = Image.new("RGB", (canvas_w, canvas_h), (12, 15, 20))
    draw = ImageDraw.Draw(sheet)
    font = load_ui_font(12)

    draw.rectangle([(0, 0), (canvas_w, header_h - 10)], fill=(20, 25, 34))
    draw.text(
        (pad, 18),
        f"EXECUTIVE PRODUCER SCREENING ROOM  |  {sample_w}x{sample_h} @ {fps}fps  |  {len(frame_images)} Critical Frames",
        fill=(242, 239, 233),
        font=font,
    )
    draw.text(
        (pad, 38),
        "Cyan Dashed = Rule of Thirds   Red Tint = Social UI Danger Zone   Bottom Row = 25% Grayscale Squint Test",
        fill=(148, 163, 184),
        font=font,
    )

    frame_telemetry = []

    for idx, (meta, im) in enumerate(frame_images):
        rgb = im.convert("RGB")
        gray = ImageOps.grayscale(rgb)
        stat = ImageStat.Stat(gray)
        mean_luma = round(stat.mean[0] / 255.0, 3)
        std_luma = round(stat.stddev[0] / 255.0, 3)
        hist = gray.histogram()
        total_px = max(1, rgb.width * rgb.height)
        clipped_white_pct = round((sum(hist[252:]) / total_px) * 100.0, 2)
        black_pct = round((sum(hist[:5]) / total_px) * 100.0, 2)

        frame_telemetry.append(
            {
                **meta,
                "meanLuma": mean_luma,
                "contrastStd": std_luma,
                "clippedWhitePct": clipped_white_pct,
                "nearBlackPct": black_pct,
            }
        )

        r = idx // cols
        c = idx % cols
        x = pad + c * (thumb_w + pad)
        y = header_h + r * (thumb_h + 44 + pad)

        thumb = rgb.resize((thumb_w, thumb_h), Image.Resampling.LANCZOS).convert("RGBA")
        overlay = Image.new("RGBA", (thumb_w, thumb_h), (0, 0, 0, 0))
        odraw = ImageDraw.Draw(overlay)

        # Rule of thirds lines
        for frac in (1 / 3, 2 / 3):
            odraw.line([(int(thumb_w * frac), 0), (int(thumb_w * frac), thumb_h)], fill=(56, 189, 248, 70), width=1)
            odraw.line([(0, int(thumb_h * frac)), (thumb_w, int(thumb_h * frac))], fill=(56, 189, 248, 70), width=1)

        # 9:16 platform UI danger overlay
        if is_vertical:
            odraw.rectangle([(int(thumb_w * 0.86), int(thumb_h * 0.35)), (thumb_w, thumb_h)], fill=(239, 68, 68, 48))
            odraw.rectangle([(0, int(thumb_h * 0.78)), (thumb_w, thumb_h)], fill=(239, 68, 68, 48))

        composited = Image.alpha_composite(thumb, overlay).convert("RGB")
        sheet.paste(composited, (x, y))
        draw.rectangle([(x, y), (x + thumb_w, y + thumb_h)], outline=(65, 78, 98), width=1)

        draw.text(
            (x, y + thumb_h + 6),
            f"f={meta['frame']} ({meta['timeSec']}s) {meta['label']}",
            fill=(242, 239, 233),
            font=font,
        )
        warn_col = (248, 113, 113) if (clipped_white_pct > 8.0 or std_luma < 0.06) else (148, 163, 184)
        draw.text(
            (x, y + thumb_h + 22),
            f"Luma={mean_luma} Std={std_luma} ClipW={clipped_white_pct}%",
            fill=warn_col,
            font=font,
        )

    # Bottom Grayscale Squint-Test Strip
    strip_y = canvas_h - squint_strip_h
    draw.line([(pad, strip_y - 8), (canvas_w - pad, strip_y - 8)], fill=(51, 65, 85), width=1)
    draw.text(
        (pad, strip_y),
        "GRAYSCALE SQUINT-TEST STRIP (One unmistakable focal hero must pop in each frame):",
        fill=(250, 204, 21),
        font=font,
    )

    sq_avail_w = canvas_w - 2 * pad
    sq_w = max(48, min(110, (sq_avail_w - (len(frame_images) - 1) * 8) // max(1, len(frame_images))))
    sq_h = min(92, int(round(sq_w * (sample_h / max(1, sample_w)))))

    for i, (meta, im) in enumerate(frame_images):
        gx = pad + i * (sq_w + 8)
        gy = strip_y + 24
        g_thumb = ImageOps.grayscale(im).resize((sq_w, sq_h), Image.Resampling.BILINEAR).convert("RGB")
        sheet.paste(g_thumb, (gx, gy))
        draw.rectangle([(gx, gy), (gx + sq_w, gy + sq_h)], outline=(100, 116, 139), width=1)
        draw.text((gx + 2, gy + sq_h + 3), f"f{meta['frame']}", fill=(148, 163, 184), font=font)

    out_png.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out_png, format="PNG")
    return {"status": "ok", "screeningSheet": str(out_png), "framesEvaluated": frame_telemetry}


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate Gate 8 Executive Producer QA Screening Sheet.")
    parser.add_argument("--timeline", type=Path, required=True, help="Path to 05_timeline.json")
    parser.add_argument("--out", type=Path, required=True, help="Output PNG path for qa-screening-sheet.png")
    parser.add_argument("--project", type=Path, help="Remotion project directory (runs npx remotion still)")
    parser.add_argument("--composition", default="MasterSequence", help="Remotion Composition ID")
    parser.add_argument("--frames-dir", type=Path, help="Optional directory of pre-rendered PNG frames")
    parser.add_argument("--max-samples", type=int, default=12, help="Max critical frames to extract")
    args = parser.parse_args()

    tl = json.loads(args.timeline.read_text(encoding="utf-8"))
    fps = int(tl.get("meta", {}).get("fps", 60))
    samples = compute_critical_frames(tl, args.max_samples)

    loaded: list[tuple[dict, Image.Image]] = []
    if args.frames_dir and args.frames_dir.exists():
        pngs = sorted(args.frames_dir.glob("*.png"))
        for meta, p in zip(samples, pngs):
            loaded.append((meta, Image.open(p)))
    elif args.project:
        with tempfile.TemporaryDirectory() as tmp:
            still_paths = render_remotion_stills(args.project, args.composition, samples, Path(tmp))
            for meta, p in zip(samples, still_paths):
                im = Image.open(p)
                im.load()
                loaded.append((meta, im.copy()))
    else:
        raise SystemExit("Provide either --project (Remotion folder) or --frames-dir (existing PNGs).")

    report = build_screening_sheet(loaded, args.out, fps)
    metrics_out = args.out.with_suffix(".metrics.json")
    metrics_out.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps({"screeningSheet": str(args.out), "metricsFile": str(metrics_out)}, indent=2))


if __name__ == "__main__":
    main()
