#!/usr/bin/env python3
"""
Gate 9 Psychoacoustic Sound Mixer & EBU R128 (-14 LUFS) Broadcast Masterer.
Constructs a deterministic FFmpeg filter_complex graph combining:
1. Picture stream from Remotion (`picture.mp4`)
2. Spoken voiceover (`highpass=80Hz` + mud cut + `3.2kHz` presence boost + 3:1 leveling)
3. Music bed (`2.6kHz` vocal-pocket EQ carve + dynamic `sidechaincompress` ducking + pre-payoff silence drops)
4. Frame-exact SFX transients (`adelay` in ms matched to spring/cut frames from `07_sound_cues.json`)
5. Final `loudnorm=I=-14:TP=-1.0:LRA=11` mastering
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path


def build_ffmpeg_command(
    video_path: Path,
    timeline: dict,
    sound_cues: dict,
    sfx_root: Path,
    out_path: Path,
) -> list[str]:
    fps = int(timeline.get("meta", {}).get("fps", 60))
    audio_cfg = timeline.get("audioTracks", {})
    vo_src = audio_cfg.get("voiceoverSrc")
    music_src = audio_cfg.get("musicBedSrc")
    music_gain = float(audio_cfg.get("musicBaseGainDb", -14.0))
    silence_drops = audio_cfg.get("silenceDrops", [])
    cues = sound_cues.get("cues", [])

    cmd = ["ffmpeg", "-y", "-i", str(video_path)]
    input_idx = 1

    vo_idx = None
    if vo_src and Path(vo_src).exists():
        cmd.extend(["-i", str(vo_src)])
        vo_idx = input_idx
        input_idx += 1

    music_idx = None
    if music_src and Path(music_src).exists():
        cmd.extend(["-i", str(music_src)])
        music_idx = input_idx
        input_idx += 1

    cue_inputs: list[tuple[int, dict]] = []
    for cue in cues:
        cue_file = Path(cue["file"])
        if not cue_file.is_absolute():
            cue_file = sfx_root / cue_file
        if cue_file.exists():
            cmd.extend(["-i", str(cue_file)])
            cue_inputs.append((input_idx, cue))
            input_idx += 1

    # If zero external audio stems exist, simply copy/faststart video cleanly
    if vo_idx is None and music_idx is None and not cue_inputs:
        return [
            "ffmpeg",
            "-y",
            "-i",
            str(video_path),
            "-c:v",
            "copy",
            "-movflags",
            "+faststart",
            str(out_path),
        ]

    filters: list[str] = []
    mix_buses: list[str] = []

    if vo_idx is not None:
        if music_idx is not None:
            filters.append(
                f"[{vo_idx}:a]aformat=sample_rates=48000:channel_layouts=stereo,"
                "highpass=f=80,"
                "equalizer=f=280:width_type=q:width=1.5:g=-2.5,"
                "equalizer=f=3200:width_type=q:width=1.2:g=2.0,"
                "acompressor=threshold=-18dB:ratio=3:attack=8:release=120,"
                "asplit=2[vo_main][vo_sc]"
            )
        else:
            filters.append(
                f"[{vo_idx}:a]aformat=sample_rates=48000:channel_layouts=stereo,"
                "highpass=f=80,"
                "equalizer=f=280:width_type=q:width=1.5:g=-2.5,"
                "equalizer=f=3200:width_type=q:width=1.2:g=2.0,"
                "acompressor=threshold=-18dB:ratio=3:attack=8:release=120[vo_main]"
            )
        mix_buses.append("[vo_main]")

    if music_idx is not None:
        # Apply pre-payoff silence drops via volume enable expressions
        drop_filters = ""
        for drop in silence_drops:
            t0 = round(drop["startFrame"] / max(1, fps), 3)
            t1 = round((drop["startFrame"] + drop["durationFrames"]) / max(1, fps), 3)
            drop_filters += f",volume=enable='between(t,{t0},{t1})':volume=-26dB"

        filters.append(
            f"[{music_idx}:a]aformat=sample_rates=48000:channel_layouts=stereo,"
            "highpass=f=45,"
            "equalizer=f=2600:width_type=q:width=1.1:g=-3.5,"
            f"volume={music_gain}dB{drop_filters}[mus_pre]"
        )
        if vo_idx is not None:
            filters.append(
                "[mus_pre][vo_sc]sidechaincompress="
                "threshold=0.025:ratio=6:attack=15:release=450:makeup=1[mus_ducked]"
            )
            mix_buses.append("[mus_ducked]")
        else:
            mix_buses.append("[mus_pre]")

    for c_i, (inp_i, cue) in enumerate(cue_inputs):
        delay_ms = max(0, round((int(cue["frame"]) * 1000.0) / max(1, fps)))
        gain_db = float(cue.get("gainDb", -10.0))
        tag = f"[sfx_{c_i}]"
        filters.append(
            f"[{inp_i}:a]aformat=sample_rates=48000:channel_layouts=stereo,"
            f"volume={gain_db}dB,adelay={delay_ms}|{delay_ms}{tag}"
        )
        mix_buses.append(tag)

    bus_count = len(mix_buses)
    filters.append(
        f"{''.join(mix_buses)}amix=inputs={bus_count}:duration=longest:dropout_transition=0:normalize=0,"
        "loudnorm=I=-14:TP=-1.0:LRA=11[a_master]"
    )

    cmd.extend(
        [
            "-filter_complex",
            ";".join(filters),
            "-map",
            "0:v:0",
            "-map",
            "[a_master]",
            "-c:v",
            "copy",
            "-c:a",
            "aac",
            "-ar",
            "48000",
            "-b:a",
            "256k",
            "-shortest",
            "-movflags",
            "+faststart",
            str(out_path),
        ]
    )
    return cmd


def main() -> None:
    parser = argparse.ArgumentParser(description="Mix voice, ducked music, and frame-exact SFX at -14 LUFS.")
    parser.add_argument("--video", type=Path, required=True, help="Rendered Remotion picture MP4")
    parser.add_argument("--timeline", type=Path, required=True, help="Path to 05_timeline.json")
    parser.add_argument("--sound-cues", type=Path, help="Optional path to 07_sound_cues.json")
    parser.add_argument("--sfx-dir", type=Path, help="Directory holding SFX WAV files")
    parser.add_argument("--out", type=Path, required=True, help="Final output MP4 path")
    parser.add_argument("--dry-run", action="store_true", help="Print FFmpeg command JSON without executing")
    args = parser.parse_args()

    tl = json.loads(args.timeline.read_text(encoding="utf-8"))
    cues = (
        json.loads(args.sound_cues.read_text(encoding="utf-8"))
        if args.sound_cues and args.sound_cues.exists()
        else {"cues": []}
    )
    default_sfx_dir = Path(__file__).resolve().parent.parent / "assets" / "audio-kit"
    sfx_root = args.sfx_dir or default_sfx_dir

    cmd = build_ffmpeg_command(args.video, tl, cues, sfx_root, args.out)
    if args.dry_run:
        print(json.dumps({"dryRun": True, "ffmpegCommand": cmd}, indent=2))
        return

    if not shutil.which("ffmpeg"):
        print("Error: ffmpeg not found in PATH.", file=sys.stderr)
        sys.exit(1)

    args.out.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(cmd, check=True)
    print(json.dumps({"status": "mastered", "output": str(args.out), "loudnessTarget": "-14.0 LUFS / -1.0 dBTP"}, indent=2))


if __name__ == "__main__":
    main()
