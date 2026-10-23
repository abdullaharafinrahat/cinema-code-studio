#!/usr/bin/env python3
"""
Gate 2 Media Ingest & VFR-to-CFR Normalizer.
Probes raw camera/screen recordings via ffprobe, detects Variable Frame Rate (VFR)
that causes lip-sync drift in frame-based engines like Remotion, and normalizes to
strict Constant Frame Rate (CFR) H.264 + 48kHz PCM/AAC.
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from fractions import Fraction
from pathlib import Path


def parse_rate(rate_str: str) -> float:
    if not rate_str or rate_str == "0/0":
        return 0.0
    try:
        return float(Fraction(rate_str))
    except (ValueError, ZeroDivisionError):
        return 0.0


def probe_media(media_path: Path) -> dict:
    if not shutil.which("ffprobe"):
        raise RuntimeError("ffprobe not found in PATH. Install ffmpeg to probe raw media.")

    cmd = [
        "ffprobe",
        "-v",
        "error",
        "-show_format",
        "-show_streams",
        "-of",
        "json",
        str(media_path),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True, check=True)
    raw = json.loads(proc.stdout)

    video_stream = next((s for s in raw.get("streams", []) if s.get("codec_type") == "video"), None)
    audio_stream = next((s for s in raw.get("streams", []) if s.get("codec_type") == "audio"), None)

    info: dict = {
        "file": str(media_path),
        "durationSec": float(raw.get("format", {}).get("duration", 0.0)),
        "hasVideo": video_stream is not None,
        "hasAudio": audio_stream is not None,
    }

    if video_stream:
        r_fps = parse_rate(video_stream.get("r_frame_rate", "0/0"))
        avg_fps = parse_rate(video_stream.get("avg_frame_rate", "0/0"))
        is_vfr = abs(r_fps - avg_fps) > 0.05 if (r_fps and avg_fps) else False
        info["video"] = {
            "codec": video_stream.get("codec_name"),
            "width": int(video_stream.get("width", 0)),
            "height": int(video_stream.get("height", 0)),
            "rFrameRate": round(r_fps, 4),
            "avgFrameRate": round(avg_fps, 4),
            "isVariableFrameRate": is_vfr,
            "pixFmt": video_stream.get("pix_fmt"),
        }

    if audio_stream:
        info["audio"] = {
            "codec": audio_stream.get("codec_name"),
            "sampleRate": int(audio_stream.get("sample_rate", 0)),
            "channels": int(audio_stream.get("channels", 0)),
        }

    return info


def normalize_to_cfr(media_path: Path, out_dir: Path, target_fps: int) -> dict:
    info = probe_media(media_path)
    out_dir.mkdir(parents=True, exist_ok=True)
    stem = media_path.stem

    if info["hasVideo"]:
        out_mp4 = out_dir / f"{stem}_cfr{target_fps}.mp4"
        cmd = [
            "ffmpeg",
            "-y",
            "-i",
            str(media_path),
            "-vf",
            f"fps={target_fps},format=yuv420p",
            "-fps_mode",
            "cfr",
            "-c:v",
            "libx264",
            "-preset",
            "fast",
            "-crf",
            "17",
            "-g",
            str(target_fps),
            "-c:a",
            "aac",
            "-ar",
            "48000",
            "-b:a",
            "192k",
            "-movflags",
            "+faststart",
            str(out_mp4),
        ]
        subprocess.run(cmd, check=True, capture_output=True, text=True)
        info["normalizedVideo"] = str(out_mp4)

    if info["hasAudio"]:
        out_wav = out_dir / f"{stem}_48k.wav"
        cmd_wav = [
            "ffmpeg",
            "-y",
            "-i",
            str(media_path),
            "-vn",
            "-acodec",
            "pcm_s16le",
            "-ar",
            "48000",
            "-ac",
            "2",
            str(out_wav),
        ]
        subprocess.run(cmd_wav, check=True, capture_output=True, text=True)
        info["extractedWav"] = str(out_wav)

    return info


def main() -> None:
    parser = argparse.ArgumentParser(description="Probe media and normalize VFR video to strict CFR for Remotion.")
    parser.add_argument("inputs", nargs="+", type=Path, help="Input video/audio files")
    parser.add_argument("--out-dir", type=Path, help="Directory to write CFR normalized MP4 and 48kHz WAV")
    parser.add_argument("--fps", type=int, default=30, choices=[24, 25, 30, 60], help="Target CFR frame rate")
    parser.add_argument("--probe-only", action="store_true", help="Only inspect metadata without transcoding")
    args = parser.parse_args()

    results = []
    for item in args.inputs:
        if not item.exists():
            print(f"Error: file not found: {item}", file=sys.stderr)
            sys.exit(1)
        if args.probe_only or not args.out_dir:
            results.append(probe_media(item))
        else:
            results.append(normalize_to_cfr(item, args.out_dir, args.fps))

    print(json.dumps({"mediaCount": len(results), "items": results}, indent=2))


if __name__ == "__main__":
    main()
