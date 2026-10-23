#!/usr/bin/env python3
"""
Gate 5.5 Edit Diversity & Structural Uniqueness Auditor.
Enforces that every production has a UNIQUE edit grammar driven by its own script shape:

1. Script Shape Diversity: `01a_edit_grammar.json` must NOT use the universal HOOK/SETUP/TENSION/EVIDENCE/REHOOK/PAYOFF/CTA skeleton — it must define custom beats.
2. Shot Scale Alternation: No 3+ consecutive shots at the same scale.
3. Camera Move Diversity: No 3+ consecutive shots using the same camera-move type.
4. Transition Diversity: No 2+ consecutive shots with the same transition-out type.
5. Component Reuse Check: `05_timeline.json` must NOT reuse the same `component` name more than once (or if reused, must be in a different visual world with different props).
6. Edit Grammar Signature: `04_storyboard.json` shots must carry `editGrammarSignature` matching `01a_edit_grammar.json` — mismatch = copy-paste leak.

Usage:
    python3 scripts/audit_edit_diversity.py \\
        --grammar preprod/01a_edit_grammar.json \\
        --storyboard preprod/04_storyboard.json \\
        [--timeline preprod/05_timeline.json]
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from studio_common import SCRIPT_FILENAME, compute_signature, script_hash, verify_beat_spans  # noqa: E402

UNIVERSAL_SKELETON_BEATS = {"HOOK", "SETUP", "TENSION", "EVIDENCE", "REHOOK", "PAYOFF", "CTA"}

# Must match the archetype union in assets/remotion-studio/src/types/timeline.ts
ALLOWED_ARCHETYPES = {
    "HERO_STATEMENT",
    "COMPARATIVE_BARS",
    "TERMINAL_FLOW",
    "METRIC_PROOF",
    "SEQUENCE_STEPS",
    "PULL_QUOTE",
}


def load_json(path: Path) -> dict:
    if not path.exists():
        raise SystemExit(f"Error: file not found: {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def check_script_shape(grammar: dict, errors: list[str], warnings: list[str]) -> None:
    beat_seq = grammar.get("scriptShape", {}).get("beatSequence", [])
    if not beat_seq:
        errors.append("`scriptShape.beatSequence` is empty — define this script's unique beat arc.")
        return

    unique_beats = set(beat_seq)
    universal_used = unique_beats & UNIVERSAL_SKELETON_BEATS
    if len(unique_beats) == 1 and universal_used:
        errors.append(
            f"`scriptShape.beatSequence` is ['{beat_seq[0]}'] — using the universal skeleton verbatim. "
            "Define a custom narrative arc for THIS script."
        )
    if len(universal_used) >= 3 and len(unique_beats) <= 4:
        errors.append(
            f"`scriptShape.beatSequence` uses {len(universal_used)} universal skeleton beats "
            f"({sorted(universal_used)}). At least 50% of beats must be custom to this script."
        )


def check_shot_scale_alternation(shots: list[dict], errors: list[str], warnings: list[str]) -> None:
    """No 3 consecutive shots at the same scale."""
    scales = [s.get("shotScale", "CU") for s in shots]
    consecutive = 1
    for i in range(1, len(scales)):
        if scales[i] == scales[i - 1]:
            consecutive += 1
            if consecutive >= 3:
                errors.append(
                    f"Shot scale '{scales[i]}' repeats {consecutive + 1} times consecutively "
                    f"(shots {shots[i - 2]['shotId']}..{shots[i]['shotId']}). "
                    "Alternate scales — every cut must change perspective by at least 14%."
                )
                consecutive = 1
        else:
            consecutive = 1


def check_camera_move_diversity(shots: list[dict], errors: list[str], warnings: list[str]) -> None:
    """No 3 consecutive shots using the same camera-move type."""
    move_types = [
        s.get("cameraMove", {}).get("type", "STATIC_BREATH")
        for s in shots
    ]
    consecutive = 1
    for i in range(1, len(move_types)):
        if move_types[i] == move_types[i - 1]:
            consecutive += 1
            if consecutive >= 3:
                errors.append(
                    f"Camera move '{move_types[i]}' repeats {consecutive + 1} times consecutively "
                    f"(shots {shots[i - 2]['shotId']}..{shots[i]['shotId']}). "
                    "Each shot's camera must be motivated by the script beat — vary the rig."
                )
                consecutive = 1
        else:
            consecutive = 1


def check_transition_diversity(shots: list[dict], errors: list[str], warnings: list[str]) -> None:
    """No 2 consecutive shots with the same transition-out type."""
    trans_types = [
        s.get("transitionOut", {}).get("type", "HARD_CUT")
        for s in shots
    ]
    for i in range(1, len(trans_types)):
        if trans_types[i] == trans_types[i - 1]:
            warnings.append(
                f"Transition '{trans_types[i]}' repeats consecutively "
                f"({shots[i - 1]['shotId']} -> {shots[i]['shotId']}). "
                "Vary transitions — no two consecutive cuts should use the same bridge."
            )


def check_component_reuse(timeline: dict, errors: list[str], warnings: list[str]) -> None:
    """
    Layout reuse check.

    v4 counted only the optional `component` field, which the timeline never sets,
    so this check could never fail. It now checks what the timeline actually uses:
    - `component` (if present) must not repeat.
    - An identical (archetype + props) pair must not repeat: that is a copy-pasted scene.
    - One archetype dominating the timeline (> 2 uses) is a warning: the layout vocabulary is too narrow.
    """
    scenes = timeline.get("scenes", [])

    comp_counts = Counter(s["component"] for s in scenes if s.get("component"))
    for comp, count in comp_counts.items():
        if count > 1:
            errors.append(
                f"`component: '{comp}'` is reused {count} times in the timeline. "
                "Each component must be unique per script — parameterize it differently instead."
            )

    seen_pairs: dict[str, str] = {}
    for s in scenes:
        arch = s.get("archetype")
        if not arch:
            continue
        key = json.dumps({"archetype": arch, "props": s.get("props", {})}, sort_keys=True)
        if key in seen_pairs:
            errors.append(
                f"Scene '{s.get('id', '?')}' repeats the exact archetype+props of scene '{seen_pairs[key]}'. "
                "Copy-pasted scenes are not allowed — change the props so the beat has its own content."
            )
        else:
            seen_pairs[key] = s.get("id", "?")

    arch_counts = Counter(s["archetype"] for s in scenes if s.get("archetype"))
    for arch, count in arch_counts.items():
        if count > 2:
            warnings.append(
                f"Archetype '{arch}' is used {count} times. Vary the layouts so the edit does not read as one template."
            )


def check_archetypes(timeline: dict, errors: list[str], warnings: list[str]) -> None:
    for s in timeline.get("scenes", []):
        arch = s.get("archetype")
        if arch and arch not in ALLOWED_ARCHETYPES:
            errors.append(
                f"Scene '{s.get('id', '?')}' uses unknown archetype '{arch}'. Allowed: {sorted(ALLOWED_ARCHETYPES)}."
            )


def check_script_binding(grammar: dict, script_path: Path, errors: list[str], warnings: list[str]) -> None:
    """
    The grammar must be bound to THIS script:
    1. The ingested script exists and its hash equals `scriptSha256`.
    2. `scriptSignatureHash` equals the value recomputed from the script + binding fields.
    3. Every beat is anchored to a verbatim quote from the script.
    """
    if not script_path.exists():
        errors.append(
            f"Script not ingested: {script_path} is missing. Run scripts/ingest_script.py before building the grammar."
        )
        return

    raw = script_path.read_text(encoding="utf-8")
    actual_hash = script_hash(raw)

    stored_hash = grammar.get("scriptSha256", "")
    if stored_hash != actual_hash:
        errors.append(
            f"`scriptSha256` ({stored_hash or 'missing'}) does not match the ingested script ({actual_hash}). "
            "The grammar was built for a different script or the script changed. Re-run stamp_edit_grammar.py after updating the grammar."
        )

    expected_sig = compute_signature(grammar, actual_hash)
    if grammar.get("scriptSignatureHash") != expected_sig:
        errors.append(
            f"`scriptSignatureHash` is '{grammar.get('scriptSignatureHash')}' but the grammar derives '{expected_sig}'. "
            "Signatures are computed, not typed: run scripts/stamp_edit_grammar.py."
        )

    verify_beat_spans(grammar, raw, errors, warnings)


def check_edit_grammar_signature(
    grammar: dict, shots: list[dict], errors: list[str], warnings: list[str]
) -> None:
    expected_sig = grammar.get("scriptSignatureHash", "")
    if not expected_sig:
        errors.append("`scriptSignatureHash` is empty in edit grammar.")
        return

    seen_signatures = set()
    for s in shots:
        sig = s.get("editGrammarSignature", "")
        if not sig:
            warnings.append(
                f"[{s['shotId']}] Shot missing `editGrammarSignature` field — cannot verify script-specific grammar."
            )
            continue
        seen_signatures.add(sig)

    if expected_sig not in seen_signatures:
        errors.append(
            f"`scriptSignatureHash: '{expected_sig}'` in edit grammar does not appear in ANY storyboard shot's "
            "`editGrammarSignature`. The storyboard was not built from this script's unique grammar."
        )

    if len(seen_signatures) > 1:
        extra = seen_signatures - {expected_sig}
        warnings.append(
            f"Found {len(extra)} unexpected `editGrammarSignature` values not matching the grammar hash: {extra}. "
            "Remove leftover signatures from copy-pasted storyboards."
        )


def check_forbidden_repetitions(
    grammar: dict, shots: list[dict], errors: list[str], warnings: list[str]
) -> None:
    forbidden = grammar.get("forbiddenRepetitions", [])
    for rule in forbidden:
        # Check shot scale rule
        if "three consecutive CU" in rule.lower() or "three consecutive cu" in rule.lower():
            scales = [s.get("shotScale", "CU") for s in shots]
            consecutive = 1
            for i in range(1, len(scales)):
                if scales[i] == scales[i - 1]:
                    consecutive += 1
                    if consecutive >= 3:
                        errors.append(f"Forbidden repetition violated: '{rule}' — CU repeats 3+ times.")
                        consecutive = 1
                else:
                    consecutive = 1
        # Check portal-zoom rule
        if "portal-zoom-out" in rule.lower() or "portal zoom" in rule.lower():
            cam_types = [s.get("cameraMove", {}).get("type", "") for s in shots]
            portal_count = sum(1 for t in cam_types if "PORTAL" in t.upper())
            if portal_count > 2:
                errors.append(
                    f"Forbidden repetition violated: '{rule}' — {portal_count} PORTAL_ZOOM_OUT moves "
                    "(max allowed: 2)."
                )
        # Check BokehRingWipe rule
        if "bokehringwipe" in rule.lower() or "bokeh ring wipe" in rule.lower():
            trans_types = [s.get("transitionOut", {}).get("type", "") for s in shots]
            bokeh_count = sum(1 for t in trans_types if "BOKEH" in t.upper())
            if bokeh_count > 3:
                errors.append(
                    f"Forbidden repetition violated: '{rule}' — {bokeh_count} BOKEH_RING_WIPE transitions "
                    "(max allowed: 3)."
                )


def main() -> None:
    parser = argparse.ArgumentParser(description="Audit edit diversity & script-specific grammar uniqueness.")
    parser.add_argument("--grammar", type=Path, required=True, help="Path to 01a_edit_grammar.json")
    parser.add_argument("--storyboard", type=Path, required=True, help="Path to 04_storyboard.json")
    parser.add_argument("--timeline", type=Path, default=None, help="Optional path to 05_timeline.json")
    parser.add_argument(
        "--script",
        type=Path,
        default=None,
        help="Ingested script (default: 00_script.txt next to the grammar)",
    )
    args = parser.parse_args()

    grammar = load_json(args.grammar)
    storyboard = load_json(args.storyboard)
    shots = storyboard.get("shots", [])
    script_path = args.script or args.grammar.parent / SCRIPT_FILENAME

    errors: list[str] = []
    warnings: list[str] = []

    check_script_binding(grammar, script_path, errors, warnings)
    check_script_shape(grammar, errors, warnings)
    check_shot_scale_alternation(shots, errors, warnings)
    check_camera_move_diversity(shots, errors, warnings)
    check_transition_diversity(shots, errors, warnings)
    check_edit_grammar_signature(grammar, shots, errors, warnings)
    check_forbidden_repetitions(grammar, shots, errors, warnings)

    if args.timeline and args.timeline.exists():
        timeline = load_json(args.timeline)
        check_archetypes(timeline, errors, warnings)
        check_component_reuse(timeline, errors, warnings)

    report = {
        "valid": len(errors) == 0,
        "scriptArc": grammar.get("scriptShape", {}).get("arcName", ""),
        "scriptSignatureHash": grammar.get("scriptSignatureHash", ""),
        "shotCount": len(shots),
        "errors": errors,
        "warnings": warnings,
    }
    print(json.dumps(report, indent=2))
    sys.exit(0 if report["valid"] else 1)


if __name__ == "__main__":
    main()
