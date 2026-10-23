#!/usr/bin/env python3
"""
Gate 7 Procedural Psychoacoustic SFX Synthesizer.
Generates studio-clean 48kHz 16-bit stereo WAV sound effects mathematically using
physical envelope + frequency-sweep models (zero external dependencies):
- `micro-click.wav`   (crisp tactile UI click / counter tick)
- `soft-pop.wav`      (warm pitch-drop bubble/card entrance settle)
- `airy-whoosh.wav`   (band-limited swept noise for camera pans & directional wipes)
- `sub-impact.wav`    (deep cinematic 95Hz->38Hz sub-bass drop for hero title locks)
- `tension-riser.wav` (1.1s accelerating harmonic swell ending cleanly before payoff drop)
"""

from __future__ import annotations

import argparse
import json
import math
import random
import struct
import wave
from pathlib import Path

SR = 48000


def write_stereo_wav(path: Path, left: list[float], right: list[float] | None = None) -> None:
    if right is None:
        right = left
    path.parent.mkdir(parents=True, exist_ok=True)
    frames = bytearray()
    for l_val, r_val in zip(left, right):
        li = max(-32767, min(32767, int(l_val * 32767.0)))
        ri = max(-32767, min(32767, int(r_val * 32767.0)))
        frames.extend(struct.pack("<hh", li, ri))
    with wave.open(str(path), "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes(bytes(frames))


def gen_micro_click() -> tuple[list[float], list[float]]:
    dur = 0.038
    n = int(SR * dur)
    rng = random.Random(42)
    samples = []
    phase = 0.0
    for i in range(n):
        t = i / SR
        env = math.exp(-t * 145.0)
        freq = 2800.0 * math.exp(-t * 55.0) + 650.0
        phase += (2.0 * math.pi * freq) / SR
        transient = (0.72 * math.sin(phase) + 0.28 * (rng.uniform(-1.0, 1.0) * math.exp(-t * 280.0))) * env * 0.65
        samples.append(transient)
    return samples, samples


def gen_soft_pop() -> tuple[list[float], list[float]]:
    dur = 0.11
    n = int(SR * dur)
    samples = []
    phase = 0.0
    for i in range(n):
        t = i / SR
        attack = min(1.0, t / 0.004)
        decay = math.exp(-t * 42.0)
        # Warm pitch envelope: starts low, snaps up slightly, settles smoothly
        freq = 220.0 + 420.0 * math.exp(-t * 38.0)
        phase += (2.0 * math.pi * freq) / SR
        val = math.sin(phase) * attack * decay * 0.72
        samples.append(val)
    return samples, samples


def gen_airy_whoosh() -> tuple[list[float], list[float]]:
    dur = 0.34
    n = int(SR * dur)
    rng = random.Random(108)
    left, right = [], []
    lp_l = 0.0
    lp_r = 0.0
    hp_l = 0.0
    prev_x_l = 0.0
    for i in range(n):
        u = i / max(1, n - 1)
        # Bell curve peaking right at u = 0.50 (cut center)
        env = math.sin(math.pi * u) ** 2.2
        cutoff = 280.0 + 3100.0 * (math.sin(math.pi * u) ** 1.6)
        rc = 1.0 / (2.0 * math.pi * cutoff)
        dt = 1.0 / SR
        alpha = dt / (rc + dt)

        nl = rng.uniform(-1.0, 1.0)
        nr = rng.uniform(-1.0, 1.0)
        lp_l = lp_l + alpha * (nl - lp_l)
        lp_r = lp_r + alpha * (nr - lp_r)
        # Gentle high-pass to keep mud out
        hp_l = 0.96 * (hp_l + lp_l - prev_x_l)
        prev_x_l = lp_l

        pan_l = 0.85 - 0.35 * u
        pan_r = 0.50 + 0.35 * u
        left.append(hp_l * env * pan_l * 0.75)
        right.append(lp_r * env * pan_r * 0.75)
    return left, right


def gen_sub_impact() -> tuple[list[float], list[float]]:
    dur = 0.68
    n = int(SR * dur)
    rng = random.Random(7)
    samples = []
    phase = 0.0
    for i in range(n):
        t = i / SR
        attack = min(1.0, t / 0.005)
        body_env = math.exp(-t * 5.8)
        punch_env = math.exp(-t * 48.0)
        freq = 38.0 + 78.0 * math.exp(-t * 24.0)
        phase += (2.0 * math.pi * freq) / SR
        sub = math.tanh(1.35 * math.sin(phase)) * body_env * 0.78
        thump = rng.uniform(-1.0, 1.0) * punch_env * 0.18
        samples.append((sub + thump) * attack)
    return samples, samples


def gen_tension_riser() -> tuple[list[float], list[float]]:
    dur = 1.15
    n = int(SR * dur)
    rng = random.Random(99)
    left, right = [], []
    p1 = 0.0
    p2 = 0.0
    lp = 0.0
    for i in range(n):
        u = i / max(1, n - 1)
        # Exponential tension curve + clean 18ms cutoff tail before payoff silence
        tail = min(1.0, (1.0 - u) / 0.02)
        env = (u ** 2.6) * tail
        f1 = 130.0 + 540.0 * (u ** 2.1)
        f2 = f1 * 1.498  # Slight detuned fifth interval
        p1 += (2.0 * math.pi * f1) / SR
        p2 += (2.0 * math.pi * f2) / SR

        noise = rng.uniform(-1.0, 1.0)
        lp = lp + (0.04 + 0.32 * u) * (noise - lp)
        tone = 0.42 * math.sin(p1) + 0.30 * math.sin(p2)
        left.append((tone + 0.28 * lp) * env * 0.68)
        right.append((tone + 0.28 * (-lp)) * env * 0.68)
    return left, right


def build_kit(out_dir: Path) -> dict:
    specs = [
        ("micro-click.wav", gen_micro_click, "High transient click for cursors, ticks, and toggles", 0),
        ("soft-pop.wav", gen_soft_pop, "Warm mid-transient settle for badges and callout cards", 0),
        ("airy-whoosh.wav", gen_airy_whoosh, "Stereo swept air whoosh; peak sits at 0.17s (start ~6-10 frames early)", -10),
        ("sub-impact.wav", gen_sub_impact, "Deep 38Hz sub-bass drop for macro title locks and polarity flips", 0),
        ("tension-riser.wav", gen_tension_riser, "1.15s harmonic tension swell; end 2-8 frames before payoff reveal", -69),
    ]
    manifest_items = []
    for filename, fn, usage, frame_lead_60fps in specs:
        l_ch, r_ch = fn()
        target = out_dir / filename
        write_stereo_wav(target, l_ch, r_ch)
        manifest_items.append(
            {
                "file": filename,
                "durationSec": round(len(l_ch) / SR, 3),
                "sampleRate": SR,
                "recommendedLeadFramesAt60Fps": frame_lead_60fps,
                "usage": usage,
            }
        )
    manifest = {"kit": "cinema-code-studio-psychoacoustic-v2", "license": "CC0-Procedural", "sounds": manifest_items}
    (out_dir / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    return manifest


def main() -> None:
    parser = argparse.ArgumentParser(description="Synthesize clean 48kHz studio SFX WAV kit.")
    parser.add_argument("--out-dir", type=Path, required=True, help="Target directory for WAV files")
    args = parser.parse_args()
    manifest = build_kit(args.out_dir)
    print(json.dumps({"status": "synthesized", "count": len(manifest["sounds"]), "outDir": str(args.out_dir)}, indent=2))


if __name__ == "__main__":
    main()
