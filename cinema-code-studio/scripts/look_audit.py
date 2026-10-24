#!/usr/bin/env python3
"""
Look Audit (Gate 9a) — pixel checks for the "AI default look" without banning useful colors.

The old guard flagged a broad hue band, which also fired on legitimate UI colors
(hot-pink timeline clips, a red "mistake" label). This audit measures two narrower things:

1. `violetPct`   — share of pixels in the violet / indigo-violet / purple band (HSV 255-325 deg,
                   S > 0.35, V > 0.25). Cobalt/blue (<= 245 deg) and red/pink-red (>= 330 deg)
                   are NOT counted, so error-red labels and pink UI accents pass.
2. `circuitPct`  — share of pixels belonging to long, thin, axis-aligned bright lines
                   (1-3 px thick, >= 7% of frame width). Circuit-board spines, HUD rules and
                   "tech trace" decoration score high; UI chrome and a few reticles score low.

Thresholds were calibrated on a real reference promo (141 frames sampled at 1 fps: max violet 1.27%,
max circuit 1.30%, so all pass) and on synthetic bad frames (circuit traces ~3.9%, violet-to-pink
gradient ~70%; see tests/test_look_audit.py). Circuit detection is coarse: treat a hit as 'look at it'. Outer glow and neon gradients are NOT measured here;
they stay on the human rubric in references/09-screening-room-critic.md.

Usage:
  python3 scripts/look_audit.py frame1.png frame2.png ...        # exit 1 on violation
  python3 scripts/look_audit.py --dir preprod/stills --json out.json
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

WORK_WIDTH = 640
VIOLET_HUE = (255.0, 325.0)
VIOLET_MIN_S = 0.35
VIOLET_MIN_V = 0.25

# Frame-level limits. A single frame may exceed briefly; the project limit is on the share of frames.
MAX_VIOLET_PCT = 1.5
MAX_CIRCUIT_PCT = 1.6
MAX_FLAGGED_FRAME_SHARE = 0.05


def _load(img: Image.Image) -> np.ndarray:
    img = img.convert("RGB")
    w, h = img.size
    if w != WORK_WIDTH:
        img = img.resize((WORK_WIDTH, max(1, round(h * WORK_WIDTH / w))), Image.Resampling.BILINEAR)
    return np.asarray(img).astype(np.float32) / 255.0


def hsv_arrays(rgb: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    mx = rgb.max(axis=2)
    mn = rgb.min(axis=2)
    d = np.maximum(mx - mn, 1e-9)
    h = np.where(
        mx == r,
        ((g - b) / d) % 6.0,
        np.where(mx == g, (b - r) / d + 2.0, (r - g) / d + 4.0),
    ) * 60.0
    s = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-9), 0.0)
    return h, s, mx


def violet_pct(rgb: np.ndarray) -> float:
    h, s, v = hsv_arrays(rgb)
    m = (h >= VIOLET_HUE[0]) & (h <= VIOLET_HUE[1]) & (s > VIOLET_MIN_S) & (v > VIOLET_MIN_V)
    return float(m.mean() * 100.0)


def _runs_covered(mask: np.ndarray, min_len: int) -> int:
    """Count mask pixels that sit inside horizontal runs of at least `min_len`."""
    total = 0
    for row in mask:
        if not row.any():
            continue
        padded = np.concatenate(([0], row.astype(np.int8), [0]))
        diff = np.diff(padded)
        starts = np.where(diff == 1)[0]
        ends = np.where(diff == -1)[0]
        lens = ends - starts
        total += int(lens[lens >= min_len].sum())
    return total


def circuit_pct(rgb: np.ndarray) -> float:
    luma = rgb @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
    h, w = luma.shape
    min_len = int(w * 0.07)
    delta = 0.16
    k = 3

    # horizontal thin lines: brighter than pixels k rows above and below
    up = np.roll(luma, k, axis=0)
    dn = np.roll(luma, -k, axis=0)
    hmask = (luma - up > delta) & (luma - dn > delta)
    hmask[:k, :] = False
    hmask[-k:, :] = False

    # vertical thin lines: brighter than pixels k columns left and right
    lf = np.roll(luma, k, axis=1)
    rt = np.roll(luma, -k, axis=1)
    vmask = (luma - lf > delta) & (luma - rt > delta)
    vmask[:, :k] = False
    vmask[:, -k:] = False

    covered = _runs_covered(hmask, min_len) + _runs_covered(vmask.T, min_len)
    return float(covered / (h * w) * 100.0)


def audit_image(img: Image.Image) -> dict:
    rgb = _load(img)
    return {"violetPct": round(violet_pct(rgb), 3), "circuitPct": round(circuit_pct(rgb), 3)}


def audit_paths(paths: list[Path]) -> dict:
    frames = []
    for p in paths:
        m = audit_image(Image.open(p))
        m["file"] = str(p)
        m["flags"] = []
        if m["violetPct"] > MAX_VIOLET_PCT:
            m["flags"].append("violet")
        if m["circuitPct"] > MAX_CIRCUIT_PCT:
            m["flags"].append("circuit")
        frames.append(m)
    flagged = [f for f in frames if f["flags"]]
    share = len(flagged) / max(1, len(frames))
    return {
        "status": "ok" if share <= MAX_FLAGGED_FRAME_SHARE else "look_violation",
        "frames": len(frames),
        "flaggedFrames": len(flagged),
        "flaggedShare": round(share, 4),
        "limits": {
            "maxVioletPct": MAX_VIOLET_PCT,
            "maxCircuitPct": MAX_CIRCUIT_PCT,
            "maxFlaggedFrameShare": MAX_FLAGGED_FRAME_SHARE,
        },
        "worst": sorted(frames, key=lambda f: -(f["violetPct"] + f["circuitPct"]))[:5],
    }


def main() -> None:
    ap = argparse.ArgumentParser(description="Violet-band and circuit-line look audit.")
    ap.add_argument("images", nargs="*", type=Path)
    ap.add_argument("--dir", type=Path, help="Directory of stills (png/jpg)")
    ap.add_argument("--json", type=Path, help="Write the report here")
    args = ap.parse_args()

    paths = list(args.images)
    if args.dir:
        for ext in ("*.png", "*.jpg", "*.jpeg"):
            paths.extend(sorted(args.dir.glob(ext)))
    if not paths:
        print("No images given.", file=sys.stderr)
        sys.exit(2)

    report = audit_paths(paths)
    text = json.dumps(report, indent=2)
    if args.json:
        args.json.write_text(text, encoding="utf-8")
    print(text)
    sys.exit(0 if report["status"] == "ok" else 1)


if __name__ == "__main__":
    main()
