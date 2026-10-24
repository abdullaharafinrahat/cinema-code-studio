#!/usr/bin/env python3
"""
Gate 9 Screening Room Contact-Sheet, Look Audit (violet band + circuit lines) & Grayscale Squint-Test Generator.
Renders critical frames in a single fast Webpack bundle pass (`@remotion/bundler` + `@remotion/renderer`)
and composites `qa-screening-sheet.png` with:
1. Rule-of-thirds & 9:16/16:9 UI safe-zone danger overlays
2. Per-frame dynamic range, white clipping, and violet-band share (`purplePct`, HSV 255-325 deg) and circuit-line share (`circuitPct`)
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

from look_audit import MAX_CIRCUIT_PCT, MAX_VIOLET_PCT


def compute_purple_pct(rgb: Image.Image) -> float:
    """Violet-band share (HSV 255-325 deg). Red / pink-red / cobalt are intentionally not counted."""
    from look_audit import _load, violet_pct

    return round(violet_pct(_load(rgb)), 3)


def compute_circuit_pct(rgb: Image.Image) -> float:
    """Share of pixels in long thin axis-aligned bright lines (circuit / HUD decoration)."""
    from look_audit import _load, circuit_pct

    return round(circuit_pct(_load(rgb)), 3)


def compute_critical_frames(timeline: dict, max_samples: int = 12) -> list[dict]:
    fps = int(timeline.get("meta", {}).get("fps", 25))
    scenes = timeline.get("scenes", [])
    picks: list[dict] = [{"frame": 0, "label": "FRAME_0_HOOK", "shotId": scenes[0]["shotId"] if scenes else "S01"}]

    cursor = 0
    for idx, sc in enumerate(scenes):
        dur = int(sc.get("durationInFrames", 60))
        settled = cursor + min(dur - 2, max(8, int(dur * 0.48)))
        picks.append({"frame": settled, "label": f"{sc.get('shotId', sc['id'])}_SETTLED", "shotId": sc.get("shotId", "")})

        trans = sc.get("transitionAfter", {})
        t_dur = int(trans.get("durationInFrames", 0)) if trans.get("type", "none") != "none" else 0
        if t_dur > 0 and idx < len(scenes) - 1:
            mid_trans = cursor + dur - (t_dur // 2)
            picks.append({"frame": max(0, mid_trans), "label": f"{sc.get('shotId', '')}_TRANS", "shotId": sc.get("shotId", "")})
            cursor += dur - t_dur
        else:
            cursor += dur

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
    node = shutil.which("node")
    npx = shutil.which("npx")
    if not node:
        raise RuntimeError("node not found in PATH.")

    frames_json = json.dumps([s["frame"] for s in samples])
    node_script = f"""
const path = require("path");
const {{ bundle }} = require("@remotion/bundler");
const {{ selectComposition, renderStill }} = require("@remotion/renderer");
(async () => {{
  const bundled = await bundle({{ entryPoint: path.resolve("src/index.ts") }});
  const comp = await selectComposition({{ serveUrl: bundled, id: {json.dumps(composition_id)} }});
  const frames = {frames_json};
  for (const f of frames) {{
    const clamped = Math.min(comp.durationInFrames - 1, Math.max(0, f));
    await renderStill({{
      composition: comp,
      serveUrl: bundled,
      output: path.join({json.dumps(str(out_dir))}, `still_${{String(f).padStart(5, "0")}}.png`),
      frame: clamped,
    }});
  }}
}})();
"""
    res = subprocess.run([node, "-e", node_script], cwd=str(remotion_dir), capture_output=True, text=True)
    if res.returncode != 0:
        if not npx:
            raise RuntimeError(f"Batch renderStill failed: {res.stderr}")
        for item in samples:
            out_file = out_dir / f"still_{item['frame']:05d}.png"
            subprocess.run(
                [npx, "remotion", "still", composition_id, str(out_file), f"--frame={item['frame']}"],
                cwd=str(remotion_dir),
                check=True,
                capture_output=True,
                text=True,
            )

    return [out_dir / f"still_{item['frame']:05d}.png" for item in samples]


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

    thumb_w = 240 if is_vertical else 420
    thumb_h = int(round(thumb_w * (sample_h / max(1, sample_w))))
    pad = 20
    header_h = 74
    squint_strip_h = 140

    canvas_w = pad + cols * (thumb_w + pad)
    canvas_h = header_h + rows * (thumb_h + 44 + pad) + squint_strip_h + pad

    sheet = Image.new("RGB", (canvas_w, canvas_h), (10, 14, 24))
    draw = ImageDraw.Draw(sheet)
    font = load_ui_font(12)

    draw.rectangle([(0, 0), (canvas_w, header_h - 10)], fill=(16, 23, 38))
    draw.text(
        (pad, 18),
        f"EXECUTIVE PRODUCER SCREENING ROOM  |  {sample_w}x{sample_h} @ {fps}fps  |  {len(frame_images)} Critical Frames",
        fill=(248, 250, 252),
        font=font,
    )
    draw.text(
        (pad, 38),
        "Cyan = Rule of Thirds   Violet <= 1.5%   Circuit lines <= 1.6%   Bottom Row = 25% Grayscale Squint Test",
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
        purple_pct = compute_purple_pct(rgb)
        circuit_pct = compute_circuit_pct(rgb)

        frame_telemetry.append(
            {
                **meta,
                "meanLuma": mean_luma,
                "contrastStd": std_luma,
                "clippedWhitePct": clipped_white_pct,
                "purplePct": purple_pct,
                "circuitPct": circuit_pct,
            }
        )

        r = idx // cols
        c = idx % cols
        x = pad + c * (thumb_w + pad)
        y = header_h + r * (thumb_h + 44 + pad)

        thumb = rgb.resize((thumb_w, thumb_h), Image.Resampling.LANCZOS).convert("RGBA")
        overlay = Image.new("RGBA", (thumb_w, thumb_h), (0, 0, 0, 0))
        odraw = ImageDraw.Draw(overlay)

        for frac in (1 / 3, 2 / 3):
            odraw.line([(int(thumb_w * frac), 0), (int(thumb_w * frac), thumb_h)], fill=(56, 189, 248, 70), width=1)
            odraw.line([(0, int(thumb_h * frac)), (thumb_w, int(thumb_h * frac))], fill=(56, 189, 248, 70), width=1)

        if is_vertical:
            odraw.rectangle([(int(thumb_w * 0.86), int(thumb_h * 0.35)), (thumb_w, thumb_h)], fill=(239, 68, 68, 48))
            odraw.rectangle([(0, int(thumb_h * 0.78)), (thumb_w, thumb_h)], fill=(239, 68, 68, 48))

        composited = Image.alpha_composite(thumb, overlay).convert("RGB")
        sheet.paste(composited, (x, y))
        draw.rectangle([(x, y), (x + thumb_w, y + thumb_h)], outline=(65, 78, 98), width=1)

        draw.text(
            (x, y + thumb_h + 6),
            f"f={meta['frame']} ({meta['timeSec']}s) {meta['label']}",
            fill=(248, 250, 252),
            font=font,
        )
        warn_col = (248, 113, 113) if (purple_pct > MAX_VIOLET_PCT or circuit_pct > MAX_CIRCUIT_PCT or std_luma < 0.04) else (148, 163, 184)
        draw.text(
            (x, y + thumb_h + 22),
            f"Luma={mean_luma} Std={std_luma} Violet={purple_pct}% Circuit={circuit_pct}%",
            fill=warn_col,
            font=font,
        )

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
    max_purple = max((t["purplePct"] for t in frame_telemetry), default=0.0)
    max_circuit = max((t["circuitPct"] for t in frame_telemetry), default=0.0)
    return {
        "status": "ok" if (max_purple <= MAX_VIOLET_PCT and max_circuit <= MAX_CIRCUIT_PCT) else "look_violation",
        "maxPurplePct": max_purple,
        "maxCircuitPct": max_circuit,
        "screeningSheet": str(out_png),
        "framesEvaluated": frame_telemetry,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate Gate 8 Executive Producer QA Screening Sheet.")
    parser.add_argument("--timeline", type=Path, help="Path to 05_timeline.json")
    parser.add_argument("--frames-list", type=str, help="Comma-separated frame indices (e.g., 35,58,95,160,345,565,875)")
    parser.add_argument("--fps", type=int, default=25, help="FPS when using --frames-list")
    parser.add_argument("--out", type=Path, required=True, help="Output PNG path for qa-screening-sheet.png")
    parser.add_argument("--project", type=Path, help="Remotion project directory")
    parser.add_argument("--composition", default="MasterSequence", help="Remotion Composition ID")
    parser.add_argument("--frames-dir", type=Path, help="Optional directory of pre-rendered PNG frames")
    parser.add_argument("--max-samples", type=int, default=12, help="Max critical frames to extract")
    args = parser.parse_args()

    if args.frames_list:
        fps = args.fps
        samples = [
            {"frame": int(f.strip()), "label": f"KEY_{i+1:02d}", "shotId": f"K{i+1:02d}", "timeSec": round(int(f.strip()) / fps, 2)}
            for i, f in enumerate(args.frames_list.split(","))
            if f.strip()
        ]
    elif args.timeline and args.timeline.exists():
        tl = json.loads(args.timeline.read_text(encoding="utf-8"))
        fps = int(tl.get("meta", {}).get("fps", 25))
        samples = compute_critical_frames(tl, args.max_samples)
    else:
        raise SystemExit("Provide either --timeline <05_timeline.json> or --frames-list 0,45,90,...")

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
    print(json.dumps({"screeningSheet": str(args.out), "metricsFile": str(metrics_out), "maxPurplePct": report["maxPurplePct"]}, indent=2))


if __name__ == "__main__":
    main()
