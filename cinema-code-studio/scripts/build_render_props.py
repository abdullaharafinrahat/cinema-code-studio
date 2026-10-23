#!/usr/bin/env python3
"""
Gate 10 helper: wrap a project's 05_timeline.json as Remotion input props.

Remotion v4 receives the timeline through `--props`. Without this step the
render falls back to the bundled reference reel, which is one cause of the
"every video looks identical" bug.

Usage:
    python3 scripts/build_render_props.py preprod/05_timeline.json --out preprod/render-props.json

Then render from the remotion/ directory:
    npx remotion render MasterSequence ../out/picture.mp4 --props=../preprod/render-props.json
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser(description="Write Remotion --props JSON from a project timeline.")
    parser.add_argument("timeline", type=Path, help="Path to 05_timeline.json")
    parser.add_argument("--out", type=Path, required=True, help="Output props JSON path")
    args = parser.parse_args()

    if not args.timeline.exists():
        print(f"Error: timeline not found: {args.timeline}", file=sys.stderr)
        sys.exit(1)

    timeline = json.loads(args.timeline.read_text(encoding="utf-8"))
    for key in ("meta", "scenes"):
        if key not in timeline:
            print(f"Error: timeline is missing '{key}'", file=sys.stderr)
            sys.exit(1)

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps({"timeline": timeline}, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({"out": str(args.out), "scenes": len(timeline["scenes"]), "title": timeline["meta"].get("title", "")}, indent=2))


if __name__ == "__main__":
    main()
