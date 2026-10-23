#!/usr/bin/env python3
"""
Gate 2 & 5 Audio Energy, Transient Peak, and BPM Beat-Grid Analyzer.
Uses Python's built-in `wave` + `struct` modules (zero external DSP libs required!)
to analyze 16-bit PCM WAV files (converting via ffmpeg automatically if MP3/MP4 is given),
extracting transient impact frames for beat-snapped B-roll and motion cuts.
"""

from __future__ import annotations

import argparse
import json
import math
import shutil
import struct
import subprocess
import tempfile
import wave
from pathlib import Path


def ensure_pcm16_mono_wav(input_path: Path) -> tuple[Path, tempfile.TemporaryDirectory | None]:
    if input_path.suffix.lower() == ".wav":
        try:
            with wave.open(str(input_path), "rb") as wf:
                if wf.getsampwidth() == 2 and wf.getcomptype() == "NONE":
                    return input_path, None
        except wave.Error:
            pass

    if not shutil.which("ffmpeg"):
        raise RuntimeError("Input is not uncompressed 16-bit WAV and ffmpeg is not in PATH.")

    tmp = tempfile.TemporaryDirectory()
    wav_path = Path(tmp.name) / "decoded.wav"
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(input_path),
            "-vn",
            "-ac",
            "1",
            "-ar",
            "22050",
            "-acodec",
            "pcm_s16le",
            str(wav_path),
        ],
        check=True,
        capture_output=True,
    )
    return wav_path, tmp


def analyze_wav(wav_path: Path, video_fps: int) -> dict:
    with wave.open(str(wav_path), "rb") as wf:
        channels = wf.getnchannels()
        sample_rate = wf.getframerate()
        n_frames = wf.getnframes()
        raw_bytes = wf.readframes(n_frames)

    total_samples = n_frames * channels
    samples = struct.unpack(f"<{total_samples}h", raw_bytes)
    if channels > 1:
        mono = [samples[i] / 32768.0 for i in range(0, total_samples, channels)]
    else:
        mono = [s / 32768.0 for s in samples]

    hop = max(1, int(sample_rate / 100))  # 10ms energy windows
    rms_env: list[float] = []
    for start in range(0, len(mono) - hop, hop):
        chunk = mono[start : start + hop]
        rms = math.sqrt(sum(x * x for x in chunk) / len(chunk))
        rms_env.append(rms)

    # First-order positive spectral/energy flux (onset strength)
    flux = [0.0] + [max(0.0, rms_env[i] - rms_env[i - 1]) for i in range(1, len(rms_env))]
    if not flux:
        return {"durationSec": 0.0, "estimatedBpm": 0.0, "transients": []}

    mean_flux = sum(flux) / len(flux)
    std_flux = math.sqrt(sum((x - mean_flux) ** 2 for x in flux) / len(flux))
    threshold = mean_flux + 1.85 * std_flux

    min_gap_bins = 22  # >= 220ms between detected beat hits
    peaks: list[dict] = []
    last_bin = -min_gap_bins

    for idx in range(1, len(flux) - 1):
        if flux[idx] > threshold and flux[idx] >= flux[idx - 1] and flux[idx] >= flux[idx + 1]:
            if idx - last_bin >= min_gap_bins:
                sec = round((idx * hop) / sample_rate, 4)
                peaks.append(
                    {
                        "timeSec": sec,
                        "frame": round(sec * video_fps),
                        "strength": round(flux[idx] / (threshold + 1e-9), 3),
                    }
                )
                last_bin = idx

    # Estimate BPM via median inter-onset interval mapped into [80, 160] BPM octave
    estimated_bpm = 120.0
    if len(peaks) >= 4:
        intervals = [
            peaks[i]["timeSec"] - peaks[i - 1]["timeSec"]
            for i in range(1, len(peaks))
            if 0.25 <= (peaks[i]["timeSec"] - peaks[i - 1]["timeSec"]) <= 1.5
        ]
        if intervals:
            intervals.sort()
            median_ioi = intervals[len(intervals) // 2]
            bpm = 60.0 / median_ioi
            while bpm < 80.0:
                bpm *= 2.0
            while bpm > 165.0:
                bpm /= 2.0
            estimated_bpm = round(bpm, 1)

    return {
        "durationSec": round(len(mono) / sample_rate, 3),
        "videoFps": video_fps,
        "estimatedBpm": estimated_bpm,
        "transientCount": len(peaks),
        "transients": peaks,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract BPM and frame-indexed audio transients for beat-snapped cuts.")
    parser.add_argument("audio_path", type=Path, help="Input WAV/MP3/MP4 audio source")
    parser.add_argument("--out", type=Path, required=True, help="Output JSON path (e.g., preprod/beats.json)")
    parser.add_argument("--fps", type=int, default=60, help="Target video timeline FPS")
    args = parser.parse_args()

    wav_path, tmp_ctx = ensure_pcm16_mono_wav(args.audio_path)
    try:
        result = analyze_wav(wav_path, args.fps)
    finally:
        if tmp_ctx is not None:
            tmp_ctx.cleanup()

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(
        json.dumps(
            {
                "status": "ok",
                "output": str(args.out),
                "estimatedBpm": result["estimatedBpm"],
                "transientCount": result["transientCount"],
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
