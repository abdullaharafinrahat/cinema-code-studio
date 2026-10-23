#!/usr/bin/env python3
"""
Gate 1.5 stamper: binds an edit grammar to its script.

Writes `scriptSha256` and a DERIVED `scriptSignatureHash` into
`01a_edit_grammar.json`. Nothing here is hand-typed. Run it after you finish
the grammar and beat source spans. `audit_edit_diversity.py` recomputes the
same values, so editing the grammar after stamping makes the audit fail.

Usage:
    python3 scripts/stamp_edit_grammar.py preprod/01a_edit_grammar.json [--script preprod/00_script.txt]
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from studio_common import SCRIPT_FILENAME, compute_signature, script_hash  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description="Stamp 01a_edit_grammar.json with script hash + derived signature.")
    parser.add_argument("grammar", type=Path, help="Path to 01a_edit_grammar.json")
    parser.add_argument("--script", type=Path, default=None, help="Path to ingested script (default: next to grammar)")
    args = parser.parse_args()

    script_path = args.script or args.grammar.parent / SCRIPT_FILENAME
    if not script_path.exists():
        print(f"Error: script not ingested at {script_path}. Run scripts/ingest_script.py first.", file=sys.stderr)
        sys.exit(1)

    grammar = json.loads(args.grammar.read_text(encoding="utf-8"))
    scr_hash = script_hash(script_path.read_text(encoding="utf-8"))
    grammar["scriptSha256"] = scr_hash
    grammar["scriptSignatureHash"] = compute_signature(grammar, scr_hash)
    args.grammar.write_text(json.dumps(grammar, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print(json.dumps({"scriptSha256": scr_hash, "scriptSignatureHash": grammar["scriptSignatureHash"]}, indent=2))


if __name__ == "__main__":
    main()
