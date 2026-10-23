#!/usr/bin/env python3
"""
Regression tests for the script-binding gates.

Run:  python3 -m unittest discover -s tests -v

The main regression: two different scripts must NOT be able to share an edit
grammar, a signature, or a storyboard, and must not produce identical structure.
"""

from __future__ import annotations

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPTS = ROOT / "scripts"
sys.path.insert(0, str(SCRIPTS))

from studio_common import compute_signature, ingest_script, normalize_text, script_hash  # noqa: E402

SCRIPT_A = """Your dashboard lies to you about speed.
Every metric was measured on the wrong thing.
We rebuilt the pipeline from the first frame.
Now every render finishes in four minutes."""

SCRIPT_B = """Grandmother kept the recipe in her head.
Nobody wrote it down before she died.
So the family spent a year rebuilding the soup.
Today it tastes exactly like her kitchen."""

BEATS_A = ["INVERT_PREMISE", "CRITICAL_FLAW", "REBUILD", "PAYOFF"]
BEATS_B = ["LOSS", "SEARCH", "RECONSTRUCTION", "HOMECOMING"]


def make_grammar(script_text: str, beats: list[str], spans: list[str], shot_cams: list[str]) -> dict:
    g = {
        "projectTitle": "Test Film",
        "scriptShape": {
            "arcName": "Test Arc " + beats[0],
            "beatCount": len(beats),
            "beatSequence": beats,
            "beatDescriptions": {b: f"What happens in {b.lower()} for this script" for b in beats},
            "beatSourceSpans": dict(zip(beats, spans)),
        },
        "shotVocabulary": ["EWS", "ECU", "MS", "CU", "WS"],
        "cameraMoveVocabulary": [
            {"type": t, "motivation": f"Motivated move number {i} for this beat", "beatId": beats[i % len(beats)]}
            for i, t in enumerate(shot_cams)
        ],
        "transitionVocabulary": ["HARD_CUT", "MATCH_CUT", "J_CUT"],
        "pacingSignature": {
            "startPace": "IMMEDIATE_CONFRONTATION",
            "accelerationPoint": "After the first counterexample",
            "peakPace": "RAPID_PACING",
            "breathHoldLocation": "The final hold",
            "endingPace": "IMPACT_RESOLUTION",
        },
        "forbiddenRepetitions": [],
    }
    return g


def make_storyboard(grammar: dict, cams: list[str], scales: list[str], transitions: list[str]) -> dict:
    beats = grammar["scriptShape"]["beatSequence"]
    sig = grammar.get("scriptSignatureHash", "")
    shots = []
    for i, (cam, scale, tr) in enumerate(zip(cams, scales, transitions)):
        shots.append(
            {
                "shotId": f"S{i + 1:02d}",
                "narrativeBeat": beats[i % len(beats)],
                "shotScale": scale,
                "cameraMove": {"type": cam, "motivation": "Motivated move for this shot", "beatId": beats[i % len(beats)]},
                "transitionOut": {"type": tr, "durationFrames": 0},
                "editGrammarSignature": sig,
            }
        )
    return {"projectTitle": "Test Film", "shots": shots}


def build_project(root: Path, script_text: str, beats: list[str], spans: list[str], cams, scales, trans) -> Path:
    """Create preprod/ with ingested script, stamped grammar, and storyboard."""
    preprod = root / "preprod"
    preprod.mkdir(parents=True, exist_ok=True)
    src = root / "source_script.txt"
    src.write_text(script_text, encoding="utf-8")
    ingest_script(src, preprod)

    grammar = make_grammar(script_text, beats, spans, cams)
    gpath = preprod / "01a_edit_grammar.json"
    gpath.write_text(json.dumps(grammar, indent=2), encoding="utf-8")
    run([sys.executable, str(SCRIPTS / "stamp_edit_grammar.py"), str(gpath)])

    grammar = json.loads(gpath.read_text(encoding="utf-8"))
    storyboard = make_storyboard(grammar, cams, scales, trans)
    (preprod / "04_storyboard.json").write_text(json.dumps(storyboard, indent=2), encoding="utf-8")
    return root


def run(cmd: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, capture_output=True, text=True)


def audit(project: Path, grammar: Path | None = None, extra: list[str] | None = None) -> subprocess.CompletedProcess:
    preprod = project / "preprod"
    cmd = [
        sys.executable,
        str(SCRIPTS / "audit_edit_diversity.py"),
        "--grammar",
        str(grammar or preprod / "01a_edit_grammar.json"),
        "--storyboard",
        str(preprod / "04_storyboard.json"),
    ]
    tl = preprod / "05_timeline.json"
    if tl.exists():
        cmd += ["--timeline", str(tl)]
    return run(cmd + (extra or []))


CAMS = ["DOLLY_IN_INTIMATE", "WHIP_PAN_SACCADE", "CRASH_ZOOM_REVEAL", "ORBITAL_ORBIT", "VERTICAL_DROP", "LATERAL_TRACK"]
SCALES = ["EWS", "ECU", "MS", "CU", "WS", "ECU"]
TRANS = ["HARD_CUT", "MATCH_CUT", "J_CUT", "HARD_CUT", "MATCH_CUT", "J_CUT"]
SPANS_A = ["Your dashboard lies to you about speed.", "Every metric was measured on the wrong thing.",
           "We rebuilt the pipeline from the first frame.", "Now every render finishes in four minutes."]
SPANS_B = ["Grandmother kept the recipe in her head.", "Nobody wrote it down before she died.",
           "So the family spent a year rebuilding the soup.", "Today it tastes exactly like her kitchen."]


class ScriptBindingTests(unittest.TestCase):
    def setUp(self) -> None:
        self._tmp = tempfile.TemporaryDirectory()
        self.tmp = Path(self._tmp.name)

    def tearDown(self) -> None:
        self._tmp.cleanup()

    def test_fresh_project_passes(self) -> None:
        p = build_project(self.tmp / "a", SCRIPT_A, BEATS_A, SPANS_A, CAMS, SCALES, TRANS)
        r = audit(p)
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)

    def test_grammar_copied_to_other_script_fails(self) -> None:
        # The original bug: grammar for script A reused for script B.
        a = build_project(self.tmp / "a", SCRIPT_A, BEATS_A, SPANS_A, CAMS, SCALES, TRANS)
        b = self.tmp / "b" / "preprod"
        b.mkdir(parents=True)
        (b / "00_script.txt").write_text(SCRIPT_B, encoding="utf-8")
        (b / "01a_edit_grammar.json").write_text((a / "preprod" / "01a_edit_grammar.json").read_text())
        (b / "04_storyboard.json").write_text((a / "preprod" / "04_storyboard.json").read_text())
        r = audit(self.tmp / "b")
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("scriptSha256", r.stdout)

    def test_hand_typed_signature_fails(self) -> None:
        p = build_project(self.tmp / "a", SCRIPT_A, BEATS_A, SPANS_A, CAMS, SCALES, TRANS)
        gp = p / "preprod" / "01a_edit_grammar.json"
        g = json.loads(gp.read_text())
        g["scriptSignatureHash"] = "INVERT-FLAW-SHADOW-REBUILD-0425"
        gp.write_text(json.dumps(g))
        self.assertNotEqual(audit(p).returncode, 0)

    def test_editing_grammar_after_stamp_fails(self) -> None:
        p = build_project(self.tmp / "a", SCRIPT_A, BEATS_A, SPANS_A, CAMS, SCALES, TRANS)
        gp = p / "preprod" / "01a_edit_grammar.json"
        g = json.loads(gp.read_text())
        g["transitionVocabulary"] = ["GLOW_SWEEP_FRAME"]
        gp.write_text(json.dumps(g))
        r = audit(p)
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("scriptSignatureHash", r.stdout)

    def test_script_changed_after_stamp_fails(self) -> None:
        p = build_project(self.tmp / "a", SCRIPT_A, BEATS_A, SPANS_A, CAMS, SCALES, TRANS)
        (p / "preprod" / "00_script.txt").write_text(SCRIPT_B, encoding="utf-8")
        self.assertNotEqual(audit(p).returncode, 0)

    def test_missing_script_fails(self) -> None:
        p = build_project(self.tmp / "a", SCRIPT_A, BEATS_A, SPANS_A, CAMS, SCALES, TRANS)
        (p / "preprod" / "00_script.txt").unlink()
        r = audit(p)
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("Script not ingested", r.stdout)

    def test_non_verbatim_beat_span_fails(self) -> None:
        spans = list(SPANS_A)
        spans[1] = "Every metric was measured on the entirely wrong thing."  # paraphrase
        p = build_project(self.tmp / "a", SCRIPT_A, BEATS_A, spans, CAMS, SCALES, TRANS)
        r = audit(p)
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("not verbatim", r.stdout)

    def test_missing_beat_span_fails(self) -> None:
        p = build_project(self.tmp / "a", SCRIPT_A, BEATS_A, SPANS_A, CAMS, SCALES, TRANS)
        gp = p / "preprod" / "01a_edit_grammar.json"
        g = json.loads(gp.read_text())
        del g["scriptShape"]["beatSourceSpans"]["PAYOFF"]
        gp.write_text(json.dumps(g))
        run([sys.executable, str(SCRIPTS / "stamp_edit_grammar.py"), str(gp)])  # re-derive signature so only the span is wrong
        r = audit(p)
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("PAYOFF", r.stdout)

    def test_normalization_ignores_quotes_and_whitespace(self) -> None:
        self.assertEqual(normalize_text("It\u2019s  fine\u2014really."), normalize_text("It's fine-really."))
        self.assertEqual(script_hash("A  b\n\nC"), script_hash("a b c"))

    def test_signature_changes_with_script(self) -> None:
        g = make_grammar(SCRIPT_A, BEATS_A, SPANS_A, CAMS)
        self.assertNotEqual(compute_signature(g, script_hash(SCRIPT_A)), compute_signature(g, script_hash(SCRIPT_B)))


class SamenessTests(unittest.TestCase):
    def setUp(self) -> None:
        self._tmp = tempfile.TemporaryDirectory()
        self.tmp = Path(self._tmp.name)

    def tearDown(self) -> None:
        self._tmp.cleanup()

    def test_identical_edits_from_different_scripts_are_flagged(self) -> None:
        # Reproduces the user's original problem: different scripts, identical edit structure.
        a = build_project(self.tmp / "a", SCRIPT_A, BEATS_A, SPANS_A, CAMS, SCALES, TRANS)
        b = build_project(self.tmp / "b", SCRIPT_B, BEATS_A, SPANS_B, CAMS, SCALES, TRANS)
        r = run([sys.executable, str(SCRIPTS / "audit_sameness.py"), str(a), str(b)])
        self.assertNotEqual(r.returncode, 0, r.stdout)
        self.assertIn("similarity", r.stdout)

    def test_distinct_edits_pass(self) -> None:
        a = build_project(self.tmp / "a", SCRIPT_A, BEATS_A, SPANS_A, CAMS, SCALES, TRANS)
        b = build_project(
            self.tmp / "b",
            SCRIPT_B,
            BEATS_B,
            SPANS_B,
            ["PULL_BACK_REVEAL", "STATIC_BREATH", "ORBITAL_ORBIT", "DOLLY_IN_INTIMATE", "RACK_FOCUS_Z", "TILT_AROUND_PORTAL"],
            ["WS", "MS", "ECU", "EWS", "CU", "MS"],
            ["PORTAL_ZOOM_OUT", "GLOW_SWEEP_FRAME", "HARD_CUT", "L_CUT", "BOKEH_RING_WIPE", "MATCH_CUT"],
        )
        r = run([sys.executable, str(SCRIPTS / "audit_sameness.py"), str(a), str(b)])
        self.assertEqual(r.returncode, 0, r.stdout)


class TimelineTests(unittest.TestCase):
    def setUp(self) -> None:
        self._tmp = tempfile.TemporaryDirectory()
        self.tmp = Path(self._tmp.name)

    def tearDown(self) -> None:
        self._tmp.cleanup()

    def _timeline(self, scenes: list[dict]) -> Path:
        tl = {"meta": {"title": "t", "fps": 25, "width": 1920, "height": 1080, "visualWorld": "COMMERCIAL_MIXED_MEDIA"}, "scenes": scenes}
        p = self.tmp / "05_timeline.json"
        p.write_text(json.dumps(tl))
        return p

    def _check(self, timeline_path: Path) -> subprocess.CompletedProcess:
        p = build_project(self.tmp / "proj", SCRIPT_A, BEATS_A, SPANS_A, CAMS, SCALES, TRANS)
        return audit(p, extra=["--timeline", str(timeline_path)])

    def test_copy_pasted_scene_fails(self) -> None:
        scene = {"id": "s", "durationInFrames": 50, "kind": "MOTION_SCENE", "archetype": "PULL_QUOTE", "props": {"quote": "Same line here"}}
        r = self._check(self._timeline([dict(scene, id="s1"), dict(scene, id="s2")]))
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("copy-pasted", r.stdout.lower())

    def test_unknown_archetype_fails(self) -> None:
        r = self._check(self._timeline([{"id": "s1", "durationInFrames": 50, "kind": "MOTION_SCENE", "archetype": "BOUNCY_CARDS", "props": {}}]))
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("unknown archetype", r.stdout)

    def test_new_archetypes_are_allowed(self) -> None:
        r = self._check(self._timeline([
            {"id": "s1", "durationInFrames": 50, "kind": "MOTION_SCENE", "archetype": "SEQUENCE_STEPS", "props": {"steps": [{"label": "a"}]}},
            {"id": "s2", "durationInFrames": 50, "kind": "MOTION_SCENE", "archetype": "PULL_QUOTE", "props": {"quote": "x"}},
        ]))
        self.assertEqual(r.returncode, 0, r.stdout)


class RenderPropsTests(unittest.TestCase):
    def test_wraps_timeline_as_props(self) -> None:
        with tempfile.TemporaryDirectory() as d:
            d = Path(d)
            tl = d / "05_timeline.json"
            tl.write_text(json.dumps({"meta": {"fps": 25}, "scenes": []}))
            out = d / "props.json"
            r = run([sys.executable, str(SCRIPTS / "build_render_props.py"), str(tl), "--out", str(out)])
            self.assertEqual(r.returncode, 0, r.stderr)
            self.assertIn("timeline", json.loads(out.read_text()))


if __name__ == "__main__":
    unittest.main()
