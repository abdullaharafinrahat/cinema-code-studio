#!/usr/bin/env python3
"""
Gate 2 & 5 Eye-Line Tracker & Vertical Auto-Reframer.
Tracks speaker eye midpoint `(eyeX, eyeY)` across video frames using MediaPipe or OpenCV,
and smooths trajectories with a critically damped spring filter (eliminating webcam jitter!)
so 16:9 -> 9:16 crops and 1.14x jump-cut scale punches anchor cleanly on the speaker's eyes.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


def critically_damped_smooth(points: list[tuple[float, float]], alpha: float = 0.12) -> list[tuple[float, float]]:
    """Forward-backward zero-phase exponential smoothing with deadband hysteresis."""
    if not points:
        return []
    fwd: list[tuple[float, float]] = [points[0]]
    for x, y in points[1:]:
        px, py = fwd[-1]
        # Deadband: ignore tiny head micro-movements < 1.8% screen width
        if abs(x - px) < 0.018 and abs(y - py) < 0.018:
            fwd.append((px, py))
        else:
            fwd.append((px + alpha * (x - px), py + alpha * (y - py)))

    bwd: list[tuple[float, float]] = [fwd[-1]]
    for x, y in reversed(fwd[:-1]):
        px, py = bwd[-1]
        bwd.append((px + alpha * (x - px), py + alpha * (y - py)))
    bwd.reverse()
    return [(round(x, 4), round(y, 4)) for x, y in bwd]


def expand_face(fx: float, fy: float, fw: float, fh: float, w: int, h: int) -> list[float]:
    """Haar boxes are tight (brow to chin). Grow to cover hair, ears and neck, normalized and clamped."""
    x0 = max(0.0, fx - fw * 0.18)
    y0 = max(0.0, fy - fh * 0.30)
    x1 = min(float(w), fx + fw * 1.18)
    y1 = min(float(h), fy + fh * 1.35)
    return [round(x0 / w, 4), round(y0 / h, 4), round((x1 - x0) / w, 4), round((y1 - y0) / h, 4)]


def detect_eyes_opencv(video_path: Path, sample_every: int = 3) -> tuple[float, list[dict]]:
    import cv2  # type: ignore

    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        raise RuntimeError(f"Could not open video: {video_path}")

    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

    raw_coords: list[tuple[float, float]] = []
    frame_indices: list[int] = []
    last_known = (0.50, 0.36)
    last_face: list[float] | None = None
    face_boxes: list[list[float] | None] = []
    idx = 0

    while True:
        ok, frame = cap.read()
        if not ok:
            break
        if idx % sample_every == 0:
            h, w = frame.shape[:2]
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(gray, scaleFactor=1.15, minNeighbors=5, minSize=(48, 48))
            if len(faces) > 0:
                # Choose largest face
                fx, fy, fw, fh = max(faces, key=lambda b: b[2] * b[3])
                # Human eye-line sits ~38% down from top of bounding box
                ex = (fx + fw * 0.5) / max(1, w)
                ey = (fy + fh * 0.38) / max(1, h)
                last_known = (ex, ey)
                last_face = expand_face(fx, fy, fw, fh, w, h)
            face_boxes.append(last_face)
            raw_coords.append(last_known)
            frame_indices.append(idx)
        idx += 1

    cap.release()
    smoothed = critically_damped_smooth(raw_coords)
    keyframes = [
        {
            "frame": f_idx,
            "timeSec": round(f_idx / fps, 3),
            "eyeX": sx,
            "eyeY": sy,
            "recommended9x16CropCenterX": min(0.82, max(0.18, sx)),
            "faceBox": fb,
        }
        for f_idx, (sx, sy), fb in zip(frame_indices, smoothed, face_boxes)
    ]
    return fps, keyframes


def main() -> None:
    parser = argparse.ArgumentParser(description="Track speaker eye-line for jump-cut anchoring and 9:16 reframing.")
    parser.add_argument("video_path", type=Path, help="Input speaker video")
    parser.add_argument("--out", type=Path, required=True, help="Output JSON path (e.g., preprod/eyes.json)")
    parser.add_argument("--sample-every", type=int, default=3, help="Sample interval in frames")
    args = parser.parse_args()

    if not args.video_path.exists():
        print(f"Error: video not found: {args.video_path}", file=sys.stderr)
        sys.exit(1)

    try:
        fps, keyframes = detect_eyes_opencv(args.video_path, args.sample_every)
    except ImportError:
        print(
            "Error: opencv-python (`cv2`) is required for live video eye tracking. "
            "Install `pip install opencv-python-headless`.",
            file=sys.stderr,
        )
        sys.exit(2)

    avg_x = round(sum(k["eyeX"] for k in keyframes) / max(1, len(keyframes)), 4)
    avg_y = round(sum(k["eyeY"] for k in keyframes) / max(1, len(keyframes)), 4)

    boxes = [k["faceBox"] for k in keyframes if k.get("faceBox")]
    dominant_box = (
        [round(sorted(b[i] for b in boxes)[len(boxes) // 2], 4) for i in range(4)] if boxes else None
    )

    payload = {
        "source": str(args.video_path),
        "dominantFaceBox": dominant_box,  # [x, y, w, h] normalized; feeds FootageSpec.faceBox for recipes
        "fps": round(fps, 3),
        "dominantAnchorEye": [avg_x, avg_y],
        "keyframeCount": len(keyframes),
        "keyframes": keyframes,
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(json.dumps({"status": "ok", "dominantAnchorEye": [avg_x, avg_y], "keyframes": len(keyframes)}, indent=2))


if __name__ == "__main__":
    main()
