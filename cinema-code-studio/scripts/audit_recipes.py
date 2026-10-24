#!/usr/bin/env python3
"""
Recipe Audit (Gate 5b). Keeps output close to proven shot patterns without making every edit identical.

Checks a storyboard against assets/recipes/recipes.json:
  1. Every shot has a recipeId from the library, or CUSTOM with a recipeNote.
  2. Each recipe's required params are present and within count limits.
  3. No recipe takes more than `maxShareOfAnyOneRecipe` of recipe shots; no immediate repeats.
  4. Enough distinct recipes for the runtime.
  5. On-screen word count fits the shot duration (words / 3.2 + 0.55 s).
  6. `spec_only` recipes get a warning: there is no template, so hand-build them to the spec.
  7. Optional --compare <other_storyboard.json>: fails when too many (recipe, label) pairs repeat
     across two different scripts, which is how "same edit, new topic" shows up.

Exit 0 = pass, 1 = errors. Warnings do not fail the gate.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter
from pathlib import Path

LIB_PATH = Path(__file__).resolve().parent.parent / "assets" / "recipes" / "recipes.json"

COUNT_LIMITS = {
    "SPEAKER_ORBIT_PILLS": ("pills", 2, 4),
    "WRONG_RIGHT_CARDS": ("wrong", 1, 4),
    "STEP_LABELS": ("steps", 2, 4),
    "TITLE_CARD": ("lines", 1, 3),
    "PHONE_FLOAT_CARDS": ("cards", 2, 4),
    "UI_STACK": ("screens", 2, 4),
}


def load_library(path: Path = LIB_PATH) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def label_texts(recipe_id: str, params: dict) -> list[str]:
    """Collects the human-readable labels a recipe will show, for word counts and similarity."""
    out: list[str] = []

    def add(v):
        if isinstance(v, str):
            out.append(v)
        elif isinstance(v, dict):
            for key in ("text", "label"):
                if isinstance(v.get(key), str):
                    out.append(v[key])
        elif isinstance(v, list):
            for i in v:
                add(i)

    for key in ("pills", "wrong", "right", "steps", "lines", "chip", "text", "cards", "eyebrow"):
        if key in params:
            add(params[key])
    return out


def norm(t: str) -> str:
    return re.sub(r"\s+", " ", t.strip().lower())


def audit(storyboard: dict, lib: dict, min_distinct_per_min: float | None = None) -> tuple[list[str], list[str], dict]:
    errors: list[str] = []
    warnings: list[str] = []
    recipes = {r["id"]: r for r in lib["recipes"]}
    rules = lib["rules"]
    shots = storyboard.get("shots", [])

    used: list[str] = []
    for shot in shots:
        sid = shot.get("shotId", "?")
        rid = shot.get("recipeId")
        if not rid:
            errors.append(f"{sid}: missing `recipeId` (use a library recipe or CUSTOM with `recipeNote`).")
            continue
        if rid == "CUSTOM":
            if not str(shot.get("recipeNote", "")).strip():
                errors.append(f"{sid}: CUSTOM shots need a `recipeNote` explaining why no recipe fits.")
            continue
        if rid not in recipes:
            errors.append(f"{sid}: unknown recipeId `{rid}`.")
            continue
        used.append(rid)
        spec = recipes[rid]
        params = shot.get("recipeParams") or {}
        for req in spec.get("required", []):
            v = params.get(req)
            if v in (None, "", [], {}):
                errors.append(f"{sid}: recipe {rid} requires param `{req}`.")
        if rid in COUNT_LIMITS:
            key, lo, hi = COUNT_LIMITS[rid]
            n = len(params.get(key) or [])
            if params.get(key) and not (lo <= n <= hi):
                errors.append(f"{sid}: recipe {rid} needs {lo}-{hi} `{key}` (got {n}).")
        if spec["status"] == "spec_only":
            warnings.append(f"{sid}: {rid} has no template yet. Build it by hand to the recipe spec in recipes.json.")

        words = sum(len(t.split()) for t in label_texts(rid, params))
        dur = float(shot.get("endSec", 0)) - float(shot.get("startSec", 0))
        need = words / 3.2 + 0.55 if words else 0.0
        if words and dur + 1e-6 < need:
            errors.append(f"{sid}: {words} on-screen words need >= {need:.2f}s, shot is {dur:.2f}s.")

    counts = Counter(used)
    total = len(used)
    max_share = rules["maxShareOfAnyOneRecipe"]
    if total >= 4:
        for rid, c in counts.items():
            if c / total > max_share + 1e-9:
                errors.append(f"Recipe {rid} is {c}/{total} of recipe shots ({c/total:.0%} > {max_share:.0%}). Vary the edit.")
    for a, b in zip(used, used[1:]):
        if a == b and rules["maxConsecutiveSameRecipe"] <= 1:
            errors.append(f"Recipe {a} is used twice in a row.")
            break

    total_sec = max((float(s.get("endSec", 0)) for s in shots), default=0.0)
    need_distinct = min_distinct_per_min if min_distinct_per_min is not None else rules["minDistinctRecipesPerMinute"]
    if total_sec >= 30 and len(counts) < need_distinct * (total_sec / 60.0) - 1e-9:
        warnings.append(f"Only {len(counts)} distinct recipes in {total_sec:.0f}s (target {need_distinct}/min).")

    stats = {"recipeShots": total, "distinct": len(counts), "usage": dict(counts), "runtimeSec": total_sec}
    return errors, warnings, stats


def fingerprint(storyboard: dict) -> set[tuple[str, str]]:
    fp: set[tuple[str, str]] = set()
    for shot in storyboard.get("shots", []):
        rid = shot.get("recipeId")
        for t in label_texts(rid or "", shot.get("recipeParams") or {}):
            fp.add((rid or "", norm(t)))
    return fp


def compare(a: dict, b: dict, max_overlap: float = 0.3) -> tuple[bool, float]:
    fa, fb = fingerprint(a), fingerprint(b)
    if not fa or not fb:
        return True, 0.0
    overlap = len(fa & fb) / min(len(fa), len(fb))
    return overlap <= max_overlap, round(overlap, 3)


def main() -> None:
    ap = argparse.ArgumentParser(description="Recipe library audit for a storyboard.")
    ap.add_argument("storyboard", type=Path)
    ap.add_argument("--library", type=Path, default=LIB_PATH)
    ap.add_argument("--compare", type=Path, help="Another project's storyboard, to catch repeated copy across scripts")
    args = ap.parse_args()

    sb = json.loads(args.storyboard.read_text(encoding="utf-8"))
    lib = load_library(args.library)
    errors, warnings, stats = audit(sb, lib)

    cmp_report = None
    if args.compare:
        other = json.loads(args.compare.read_text(encoding="utf-8"))
        ok, overlap = compare(sb, other)
        cmp_report = {"overlap": overlap, "ok": ok}
        if not ok:
            errors.append(f"{overlap:.0%} of (recipe, label) pairs repeat the other project. Rewrite the copy for this script.")

    report = {"valid": not errors, "errors": errors, "warnings": warnings, "stats": stats, "compare": cmp_report}
    print(json.dumps(report, indent=2, ensure_ascii=False))
    sys.exit(0 if not errors else 1)


if __name__ == "__main__":
    main()
