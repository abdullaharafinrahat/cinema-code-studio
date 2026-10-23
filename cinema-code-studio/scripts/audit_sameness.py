#!/usr/bin/env python3
"""
Cross-project sameness audit.

The bug this guards against: different scripts produced identical edits and
motion graphics. Per-project validators cannot see that, so this tool compares
projects with each other.

For each project it extracts the edit structure:
  beats · shot scales · camera moves · transitions · scene archetypes
and compares every pair with a sequence-similarity ratio. It also checks that
each project has a unique `scriptSignatureHash`.

Usage:
    python3 scripts/audit_sameness.py project-a project-b [project-c ...] [--max-similarity 0.85]

Exit 0 = projects are distinct. Exit 1 = at least one pair is too similar or shares a signature.
"""

from __future__ import annotations

import argparse
import json
import sys
from difflib import SequenceMatcher
from pathlib import Path

FIELDS = ("beats", "shotScale", "cameraMove", "transition", "archetype")


def _load(path: Path) -> dict | None:
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def fingerprint(project: Path) -> dict:
    preprod = project / "preprod"
    grammar = _load(preprod / "01a_edit_grammar.json") or {}
    storyboard = _load(preprod / "04_storyboard.json") or {}
    timeline = _load(preprod / "05_timeline.json") or {}
    shots = storyboard.get("shots", [])
    scenes = timeline.get("scenes", [])

    return {
        "name": project.name,
        "signature": grammar.get("scriptSignatureHash", ""),
        "fields": {
            "beats": grammar.get("scriptShape", {}).get("beatSequence", []),
            "shotScale": [s.get("shotScale", "") for s in shots],
            "cameraMove": [s.get("cameraMove", {}).get("type", "") for s in shots],
            "transition": [s.get("transitionOut", {}).get("type", "") for s in shots],
            "archetype": [s.get("archetype", "") for s in scenes],
        },
    }


def similarity(a: dict, b: dict) -> tuple[float, dict]:
    per_field = {}
    for f in FIELDS:
        sa, sb = a["fields"][f], b["fields"][f]
        if not sa and not sb:
            continue
        per_field[f] = round(SequenceMatcher(None, sa, sb, autojunk=False).ratio(), 3)
    overall = round(sum(per_field.values()) / len(per_field), 3) if per_field else 0.0
    return overall, per_field


def main() -> None:
    parser = argparse.ArgumentParser(description="Flag projects whose edits or layouts are too similar.")
    parser.add_argument("projects", nargs="+", type=Path, help="Project root directories (each has preprod/)")
    parser.add_argument("--max-similarity", type=float, default=0.85, help="Pairwise similarity ceiling (0-1)")
    args = parser.parse_args()

    prints = [fingerprint(p.resolve()) for p in args.projects]
    errors: list[str] = []
    pairs = []

    for p in prints:
        if not p["signature"]:
            errors.append(f"{p['name']}: no scriptSignatureHash. Ingest and stamp the script first.")

    for i in range(len(prints)):
        for j in range(i + 1, len(prints)):
            a, b = prints[i], prints[j]
            if a["signature"] and a["signature"] == b["signature"]:
                errors.append(f"{a['name']} and {b['name']} share scriptSignatureHash {a['signature']}.")
            overall, per_field = similarity(a, b)
            pairs.append({"a": a["name"], "b": b["name"], "similarity": overall, "perField": per_field})
            if overall >= args.max_similarity:
                errors.append(
                    f"{a['name']} vs {b['name']}: similarity {overall} >= {args.max_similarity}. "
                    f"Per field: {per_field}. These edits are not distinct enough."
                )

    report = {
        "valid": not errors,
        "projects": [{"name": p["name"], "scriptSignatureHash": p["signature"]} for p in prints],
        "pairs": pairs,
        "errors": errors,
    }
    print(json.dumps(report, indent=2))
    sys.exit(0 if report["valid"] else 1)


if __name__ == "__main__":
    main()
