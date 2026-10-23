#!/usr/bin/env python3
"""
Gate 4 Walter Murch Eye-Trace Auditor.
Computes Euclidean focal-point jump distances across every shot boundary in `04_storyboard.json`.
Enforces:
- Green Zone (`<= 0.18`): Seamless hard cut
- Amber Zone (`0.18 < d <= 0.32`): Allowed only if incoming shot >= 2.8s or bridged by motion transition
- Red Zone (`> 0.32` on unbridged hard cut): Fails validation to prevent viewer eye-hunt fatigue
"""

from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path

BRIDGING_TRANSITIONS = {"MATCH_CUT", "DIRECTIONAL_WIPE", "CAMERA_PAN"}


def audit_eye_trace(storyboard_path: Path) -> dict:
    data = json.loads(storyboard_path.read_text(encoding="utf-8"))
    shots = data.get("shots", [])

    transitions_audit = []
    errors: list[str] = []
    warnings: list[str] = []

    for i in range(len(shots) - 1):
        curr_shot = shots[i]
        next_shot = shots[i + 1]

        x1, y1 = curr_shot["exitFocalPoint"]
        x2, y2 = next_shot["entryFocalPoint"]
        dist = round(math.hypot(x2 - x1, y2 - y1), 4)

        trans_type = curr_shot.get("transitionOut", {}).get("type", "HARD_CUT")
        next_dur = round(next_shot["endSec"] - next_shot["startSec"], 3)
        has_bridge = trans_type in BRIDGING_TRANSITIONS

        if dist <= 0.18:
            zone = "GREEN_SEAMLESS"
        elif dist <= 0.32:
            zone = "AMBER_MODERATE"
            if not has_bridge and next_dur < 2.2:
                warnings.append(
                    f"{curr_shot['shotId']} -> {next_shot['shotId']}: Focal jump {dist} on fast shot ({next_dur}s) "
                    f"with {trans_type}. Consider shifting entryFocalPoint closer to [{x1}, {y1}]."
                )
        else:
            zone = "RED_LARGE_SACCADE"
            if not has_bridge:
                errors.append(
                    f"{curr_shot['shotId']} -> {next_shot['shotId']}: Unbridged hard-cut focal jump d={dist} (> 0.32) "
                    f"from [{x1}, {y1}] to [{x2}, {y2}]. Re-anchor incoming hero or use DIRECTIONAL_WIPE / CAMERA_PAN / MATCH_CUT."
                )

        transitions_audit.append(
            {
                "cut": f"{curr_shot['shotId']} -> {next_shot['shotId']}",
                "fromExit": [x1, y1],
                "toEntry": [x2, y2],
                "euclideanJump": dist,
                "transitionType": trans_type,
                "zone": zone,
            }
        )

    return {
        "valid": len(errors) == 0,
        "shotCount": len(shots),
        "cutsEvaluated": len(transitions_audit),
        "errors": errors,
        "warnings": warnings,
        "cuts": transitions_audit,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Audit cross-cut Euclidean eye-trace continuity on a storyboard.")
    parser.add_argument("storyboard", type=Path, help="Path to 04_storyboard.json")
    args = parser.parse_args()

    if not args.storyboard.exists():
        print(f"Error: storyboard not found: {args.storyboard}", file=sys.stderr)
        sys.exit(1)

    report = audit_eye_trace(args.storyboard)
    print(json.dumps(report, indent=2))
    sys.exit(0 if report["valid"] else 1)


if __name__ == "__main__":
    main()
