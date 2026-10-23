#!/usr/bin/env python3
"""
Gate 0/1 Workspace Initializer for Cinema Code Studio.
Scaffolds a complete production directory (`preprod/`, `remotion/`, `audio/`, `out/`)
by copying the bundled Remotion Studio starter and psychoacoustic SFX kit.
"""

from __future__ import annotations

import argparse
import json
import shutil
from pathlib import Path


def init_production(target_dir: Path, title: str, width: int, height: int, fps: int) -> dict:
    skill_root = Path(__file__).resolve().parent.parent
    template_dir = skill_root / "assets" / "remotion-studio"
    audio_kit_dir = skill_root / "assets" / "audio-kit"

    target_dir = target_dir.resolve()
    preprod_dir = target_dir / "preprod"
    remotion_dir = target_dir / "remotion"
    public_media_dir = remotion_dir / "public" / "media"
    public_sfx_dir = remotion_dir / "public" / "sfx"
    out_dir = target_dir / "out"

    for d in (preprod_dir, public_media_dir, public_sfx_dir, out_dir):
        d.mkdir(parents=True, exist_ok=True)

    if template_dir.exists():
        shutil.copytree(template_dir, remotion_dir, dirs_exist_ok=True)

    copied_sfx = []
    if audio_kit_dir.exists():
        for wav in sorted(audio_kit_dir.glob("*")):
            if wav.is_file():
                shutil.copy2(wav, public_sfx_dir / wav.name)
                copied_sfx.append(wav.name)

    aspect = "9:16" if height > width else ("1:1" if height == width else "16:9")

    brief_stub = {
        "projectTitle": title,
        "targetAudience": "Define primary viewer persona",
        "format": {
            "width": width,
            "height": height,
            "fps": fps,
            "targetDurationSec": 30,
        },
        "emotionalArc": {
            "fromState": "Initial viewer friction or curiosity",
            "tensionState": "Escalating stakes or hidden insight",
            "toState": "Resolved clarity and conviction",
            "coreThesis": "Single unforgettable takeaway sentence",
        },
        "visualWorld": "SWISS_EDITORIAL_DARK",
        "kuleshovStrategy": "Show concrete causal evidence instead of literal noun icons.",
        "typography": {
            "displayFont": "Inter Tight",
            "utilityFont": "JetBrains Mono",
            "tabularNumerals": True,
        },
        "antiGoals": [
            "No fade-in from black on Frame 0",
            "No literal stock icons (clocks, lightbulbs, padlocks)",
            "No raw #FFFFFF stickers over footage",
        ],
    }

    brief_path = preprod_dir / "01_creative_brief.json"
    if not brief_path.exists():
        brief_path.write_text(json.dumps(brief_stub, indent=2), encoding="utf-8")

    summary = {
        "status": "initialized",
        "projectRoot": str(target_dir),
        "aspectRatio": aspect,
        "resolution": f"{width}x{height}@{fps}fps",
        "preprodDir": str(preprod_dir),
        "remotionDir": str(remotion_dir),
        "outDir": str(out_dir),
        "bundledSfx": copied_sfx,
        "nextGate": "Edit preprod/01_creative_brief.json (Gate 1), then build retention & color script.",
    }
    return summary


def main() -> None:
    parser = argparse.ArgumentParser(description="Initialize a Cinema Code Studio production workspace.")
    parser.add_argument("project_dir", type=Path, help="Target directory for the video project")
    parser.add_argument("--title", default="Untitled Studio Film", help="Production title")
    parser.add_argument("--width", type=int, default=1920, help="Frame width in pixels (default: 1920)")
    parser.add_argument("--height", type=int, default=1080, help="Frame height in pixels (default: 1080)")
    parser.add_argument("--fps", type=int, default=60, choices=[24, 25, 30, 60], help="Frames per second")
    args = parser.parse_args()

    result = init_production(args.project_dir, args.title, args.width, args.height, args.fps)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
