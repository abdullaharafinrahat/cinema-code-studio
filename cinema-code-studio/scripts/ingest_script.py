#!/usr/bin/env python3
"""
Gate 0 Script Ingestion.

Copies the user's script into `<project>/preprod/00_script.txt` and writes
`00_script.meta.json` (normalized SHA-256 + numbered sentence index). Every
later gate binds to this hash, so an edit grammar cannot be reused across scripts.

Usage:
    python3 scripts/ingest_script.py path/to/script.txt --project ./my-film
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from studio_common import ingest_script  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest a script into a Cinema Code Studio project.")
    parser.add_argument("script", type=Path, help="Path to the script (.txt or .md)")
    parser.add_argument("--project", type=Path, required=True, help="Project root (contains preprod/)")
    args = parser.parse_args()

    if not args.script.exists():
        print(f"Error: script not found: {args.script}", file=sys.stderr)
        sys.exit(1)

    try:
        meta = ingest_script(args.script, args.project.resolve() / "preprod")
    except ValueError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        sys.exit(1)

    print(json.dumps({k: meta[k] for k in ("sourceFile", "scriptSha256", "wordCount")} | {"sentenceCount": len(meta["sentences"])}, indent=2))


if __name__ == "__main__":
    main()
