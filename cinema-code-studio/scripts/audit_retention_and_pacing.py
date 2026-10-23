#!/usr/bin/env python3
"""
Gate 5 Retention Neuroscience, Rhythm Variance & Cognitive Load Auditor.
Enforces:
1. Frame-0 Hook Readiness (S01 starts at 0.0s as HOOK beat)
2. Saccadic Reading-Speed Floor (`duration >= words / 3.2 + 0.55s`)
3. Mayer's Dual-Channel Collision Law (`captionsActive` MUST be false when `onScreenWordCount > 6` or `cognitiveLoadScore >= 2`)
4. Asymmetric Editorial Rhythm (flags robotic uniform scene timers where std-dev of shot durations < 0.22s)
5. Habituation Dead-Zone Check (flags unmotivated static holds exceeding format threshold)
6. Timeline <-> Storyboard frame sync check (when `05_timeline.json` is also passed)
"""

from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path


def audit_retention(storyboard_path: Path, timeline_path: Path | None = None) -> dict:
    sb = json.loads(storyboard_path.read_text(encoding="utf-8"))
    shots = sb.get("shots", [])
    fps = int(sb.get("fps", 60))

    errors: list[str] = []
    warnings: list[str] = []

    if not shots:
        return {"valid": False, "errors": ["Storyboard contains zero shots."], "warnings": []}

    total_dur = shots[-1]["endSec"] - shots[0]["startSec"]
    is_short_form = total_dur <= 65.0
    max_hold = 4.2 if is_short_form else 7.0

    # 1. Frame-0 Hook Check
    first = shots[0]
    if first["startSec"] != 0:
        errors.append(f"S01 must start at 0.0s (got {first['startSec']}s) — zero dead lead-in allowed.")
    if first.get("narrativeBeat") != "HOOK":
        errors.append(f"S01 `narrativeBeat` must be 'HOOK' (got '{first.get('narrativeBeat')}').")
    if (first["endSec"] - first["startSec"]) > 3.5:
        warnings.append(
            f"S01 hook shot lasts {round(first['endSec'] - first['startSec'], 2)}s (> 3.5s). "
            "Ensure a micro-shift occurs before 3.0s to lock scroll survival."
        )

    durations: list[float] = []
    prev_scale = None

    for idx, shot in enumerate(shots):
        sid = shot["shotId"]
        dur = round(shot["endSec"] - shot["startSec"], 3)
        if dur <= 0:
            errors.append(f"[{sid}] Invalid non-positive shot duration ({dur}s).")
            continue
        durations.append(dur)

        # 2. Reading-speed floor check
        words_on_screen = int(shot.get("onScreenWordCount", 0))
        if words_on_screen > 0:
            min_read_sec = round((words_on_screen / 3.2) + 0.55, 2)
            if dur + 0.05 < min_read_sec:
                errors.append(
                    f"[{sid}] Saccadic reading-speed violation: {words_on_screen} graphic words require "
                    f">= {min_read_sec}s on screen, but shot is only {dur}s. Cut words or lengthen hold."
                )

        # 3. Mayer's Dual-Channel Cognitive Load check
        cog_load = int(shot.get("cognitiveLoadScore", 1))
        captions_on = bool(shot.get("captionsActive", False))
        if captions_on and (words_on_screen > 6 or cog_load >= 2):
            errors.append(
                f"[{sid}] Mayer's Dual-Text Collision: `captionsActive` is true while "
                f"onScreenWordCount={words_on_screen}, cognitiveLoadScore={cog_load}. "
                "Set `captionsActive: false` so viewers aren't forced to read two text streams at once."
            )

        # 4. Habituation / static dead-zone check
        cam_type = shot.get("cameraMove", {}).get("type", "STATIC_BREATH")
        if dur > max_hold and cam_type == "STATIC_BREATH":
            warnings.append(
                f"[{sid}] Potential retention dead zone: {dur}s hold (> {max_hold}s) on STATIC_BREATH. "
                "Add a micro-shift, dolly push, or progressive layer reveal."
            )

        # 5. Same-scale jump cut warning
        scale = shot.get("shotScale")
        trans = shot.get("transitionOut", {}).get("type", "HARD_CUT")
        if prev_scale == scale and idx > 0 and shots[idx - 1].get("transitionOut", {}).get("type") == "HARD_CUT":
            warnings.append(
                f"[{shots[idx - 1]['shotId']} -> {sid}] Back-to-back `{scale}` shots on HARD_CUT. "
                "Verify camera angle or visual stage changes so it doesn't feel like an unmasked jump cut."
            )
        prev_scale = scale

    # 6. Asymmetric Editorial Rhythm check (variance of shot durations)
    rhythm_std = 0.0
    if len(durations) >= 3:
        mean_d = sum(durations) / len(durations)
        rhythm_std = round(math.sqrt(sum((d - mean_d) ** 2 for d in durations) / len(durations)), 3)
        if rhythm_std < 0.22:
            errors.append(
                f"Robotic uniform pacing detected: shot duration std-dev is {rhythm_std}s (< 0.22s). "
                "Vary cut lengths (staccato buildup -> deliberate breath hold on thesis payoff)."
            )

    # 7. Optional Timeline sync check
    timeline_summary = None
    if timeline_path and timeline_path.exists():
        tl = json.loads(timeline_path.read_text(encoding="utf-8"))
        tl_fps = int(tl.get("meta", {}).get("fps", fps))
        scenes = tl.get("scenes", [])
        raw_sum = sum(int(s.get("durationInFrames", 0)) for s in scenes)
        overlap_sum = sum(
            int(s.get("transitionAfter", {}).get("durationInFrames", 0))
            for s in scenes[:-1]
            if s.get("transitionAfter", {}).get("type", "none") != "none"
        )
        effective_frames = raw_sum - overlap_sum
        timeline_summary = {
            "sceneCount": len(scenes),
            "rawSumFrames": raw_sum,
            "transitionOverlapFrames": overlap_sum,
            "effectiveCompositionFrames": effective_frames,
            "effectiveDurationSec": round(effective_frames / max(1, tl_fps), 3),
        }
        if effective_frames <= 0:
            errors.append("Timeline effectiveCompositionFrames <= 0 after subtracting transition overlaps.")

    return {
        "valid": len(errors) == 0,
        "formatClass": "SHORT_FORM" if is_short_form else "LONG_OR_MID_FORM",
        "totalStoryboardSec": round(total_dur, 2),
        "rhythmStdDevSec": rhythm_std,
        "timelineCheck": timeline_summary,
        "errors": errors,
        "warnings": warnings,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Audit storyboard & timeline for retention, cognitive load, and rhythm.")
    parser.add_argument("storyboard", type=Path, help="Path to 04_storyboard.json")
    parser.add_argument("timeline", nargs="?", type=Path, default=None, help="Optional path to 05_timeline.json")
    args = parser.parse_args()

    if not args.storyboard.exists():
        print(f"Error: storyboard not found: {args.storyboard}", file=sys.stderr)
        sys.exit(1)

    report = audit_retention(args.storyboard, args.timeline)
    print(json.dumps(report, indent=2))
    sys.exit(0 if report["valid"] else 1)


if __name__ == "__main__":
    main()
