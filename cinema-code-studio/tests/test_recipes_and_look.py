#!/usr/bin/env python3
"""
Regression tests for the v5 quality layer: look audit, semantic colors, recipe audit, face-safe placement.

Run:  python3 -m unittest discover -s tests -v
"""

from __future__ import annotations

import copy
import json
import random
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SCRIPTS = ROOT / "scripts"
STUDIO = ROOT / "assets" / "remotion-studio"
sys.path.insert(0, str(SCRIPTS))

import audit_recipes  # noqa: E402
import look_audit  # noqa: E402
import validate_color_script as vcs  # noqa: E402

W, H = 1280, 720


def circuit_frame() -> Image.Image:
    im = Image.new("RGB", (W, H), (6, 10, 24))
    d = ImageDraw.Draw(im)
    rnd = random.Random(3)
    for _ in range(26):
        x, y = rnd.randint(40, W - 40), rnd.randint(40, H - 40)
        for _ in range(4):
            if rnd.random() < 0.5:
                nx = max(10, min(W - 10, x + rnd.choice([-1, 1]) * rnd.randint(120, 380)))
                d.line([x, y, nx, y], fill=(60, 220, 255), width=2)
                x = nx
            else:
                ny = max(10, min(H - 10, y + rnd.choice([-1, 1]) * rnd.randint(80, 260)))
                d.line([x, y, x, ny], fill=(60, 220, 255), width=2)
                y = ny
            d.ellipse([x - 5, y - 5, x + 5, y + 5], outline=(60, 220, 255), width=2)
    return im.filter(ImageFilter.GaussianBlur(0.6))


def violet_pink_gradient() -> Image.Image:
    x = np.linspace(0, 1, W)[None, :, None]
    c1, c2, c3 = np.array([99, 102, 241]), np.array([168, 85, 247]), np.array([236, 72, 153])
    a = np.where(x < 0.5, c1 + (c2 - c1) * (x * 2), c2 + (c3 - c2) * ((x - 0.5) * 2))
    a = np.broadcast_to(a, (H, W, 3))
    return Image.fromarray(a.astype(np.uint8))


def clean_ui_frame() -> Image.Image:
    im = Image.new("RGB", (W, H), (4, 10, 24))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([200, 120, 1080, 600], 24, fill=(240, 244, 250))
    for i in range(5):
        d.rectangle([240, 170 + i * 70, 900, 200 + i * 70], fill=(29, 99, 237))
    d.rectangle([240, 520, 1000, 560], fill=(229, 72, 77))  # red "wrong" label
    d.rectangle([240, 580, 700, 590], fill=(236, 72, 153))  # hot-pink UI accent
    return im


class LookAuditTests(unittest.TestCase):
    def test_circuit_decoration_is_flagged(self):
        m = look_audit.audit_image(circuit_frame())
        self.assertGreater(m["circuitPct"], look_audit.MAX_CIRCUIT_PCT)

    def test_violet_to_pink_gradient_is_flagged(self):
        m = look_audit.audit_image(violet_pink_gradient())
        self.assertGreater(m["violetPct"], look_audit.MAX_VIOLET_PCT)

    def test_clean_ui_with_red_and_pink_passes(self):
        m = look_audit.audit_image(clean_ui_frame())
        self.assertLessEqual(m["violetPct"], look_audit.MAX_VIOLET_PCT)
        self.assertLessEqual(m["circuitPct"], look_audit.MAX_CIRCUIT_PCT)

    def test_directory_report_status(self):
        with tempfile.TemporaryDirectory() as td:
            td = Path(td)
            clean_ui_frame().save(td / "a.png")
            circuit_frame().save(td / "b.png")
            rep = look_audit.audit_paths(sorted(td.glob("*.png")))
            self.assertEqual(rep["status"], "look_violation")  # 1 of 2 frames flagged (> 5%)
            self.assertEqual(rep["flaggedFrames"], 1)


class SemanticColorTests(unittest.TestCase):
    def base(self) -> dict:
        return json.loads((ROOT / "assets/examples/03_color_script.commercial.example.json").read_text())

    def run_validator(self, data: dict) -> tuple[list[str], dict]:
        errs, _, _ = [], [], {}
        profile = data["studioProfile"]
        errs = []
        for mood in data["moods"]:
            e, _, _ = vcs.validate_palette_mood(mood, profile=profile)
            errs.extend(e)
        return errs, data

    def test_commercial_example_with_red_and_lime_is_valid(self):
        errs, _ = self.run_validator(self.base())
        self.assertEqual(errs, [])

    def test_error_role_cannot_drift_to_magenta(self):
        d = self.base()
        d["moods"][0]["colors"]["semantic"]["error"] = "#D946EF"
        errs, _ = self.run_validator(d)
        self.assertTrue(any("hue lane" in e for e in errs))

    def test_gray_meaning_color_is_rejected(self):
        d = self.base()
        d["moods"][0]["colors"]["semantic"]["error"] = "#8A8A8A"
        errs, _ = self.run_validator(d)
        self.assertTrue(any("too gray" in e or "hue lane" in e for e in errs))

    def test_violet_hero_accent_still_banned(self):
        d = self.base()
        d["moods"][0]["colors"]["heroAccent"] = "#8B5CF6"
        errs, _ = self.run_validator(d)
        self.assertTrue(any("purple" in e for e in errs))


def storyboard(recipes: list[tuple[str, dict]], shot_len: float = 3.0) -> dict:
    shots = []
    for i, (rid, params) in enumerate(recipes):
        shots.append(
            {
                "shotId": f"S{i + 1:02d}",
                "startSec": i * shot_len,
                "endSec": (i + 1) * shot_len,
                "recipeId": rid,
                "recipeParams": copy.deepcopy(params),
            }
        )
    return {"shots": shots}


GOOD = [
    ("TITLE_CARD", {"lines": ["Edit like a pro"], "accentLine": 0}),
    ("SPEAKER_ORBIT_PILLS", {"pills": [{"text": "Tools"}, {"text": "Taste"}]}),
    ("WRONG_RIGHT_CARDS", {"wrong": ["Presets"], "right": ["Story"]}),
    ("STEP_LABELS", {"steps": [{"label": "Learn"}, {"label": "Build"}, {"label": "Ship"}]}),
    ("MINI_SPEAKER_FRAME", {"chip": "Module 3"}),
]


class RecipeAuditTests(unittest.TestCase):
    lib = audit_recipes.load_library()

    def run_audit(self, sb: dict):
        return audit_recipes.audit(sb, self.lib)

    def test_good_storyboard_passes(self):
        errs, _, stats = self.run_audit(storyboard(GOOD))
        self.assertEqual(errs, [])
        self.assertEqual(stats["distinct"], 5)

    def test_missing_recipe_id_fails(self):
        sb = storyboard(GOOD)
        del sb["shots"][0]["recipeId"]
        errs, _, _ = self.run_audit(sb)
        self.assertTrue(any("missing `recipeId`" in e for e in errs))

    def test_unknown_recipe_fails(self):
        sb = storyboard(GOOD)
        sb["shots"][1]["recipeId"] = "NEON_CIRCUIT_HUD"
        errs, _, _ = self.run_audit(sb)
        self.assertTrue(any("unknown recipeId" in e for e in errs))

    def test_custom_requires_note(self):
        sb = storyboard(GOOD)
        sb["shots"][0]["recipeId"] = "CUSTOM"
        errs, _, _ = self.run_audit(sb)
        self.assertTrue(any("recipeNote" in e for e in errs))
        sb["shots"][0]["recipeNote"] = "Needs a hand-drawn map the library lacks."
        errs, _, _ = self.run_audit(sb)
        self.assertEqual(errs, [])

    def test_five_pills_fails(self):
        sb = storyboard(GOOD)
        sb["shots"][1]["recipeParams"]["pills"] = [{"text": f"w{i}"} for i in range(5)]
        errs, _, _ = self.run_audit(sb)
        self.assertTrue(any("needs 2-4" in e for e in errs))

    def test_same_recipe_twice_in_a_row_fails(self):
        sb = storyboard(GOOD + [GOOD[-1]])
        errs, _, _ = self.run_audit(sb)
        self.assertTrue(any("twice in a row" in e for e in errs))

    def test_one_recipe_dominating_fails(self):
        seq = [GOOD[1], GOOD[0], GOOD[1], GOOD[2], GOOD[1]]
        errs, _, _ = self.run_audit(storyboard(seq))
        self.assertTrue(any("Vary the edit" in e for e in errs))

    def test_too_many_words_for_the_duration_fails(self):
        sb = storyboard([("TITLE_CARD", {"lines": ["one two three four five six seven eight nine ten eleven"]})], shot_len=1.5)
        errs, _, _ = self.run_audit(sb)
        self.assertTrue(any("on-screen words" in e for e in errs))

    def test_spec_only_recipe_warns(self):
        sb = storyboard([("PHONE_FLOAT_CARDS", {"screen": "a.png", "cards": [{"text": "x"}, {"text": "y"}]})])
        errs, warns, _ = self.run_audit(sb)
        self.assertEqual(errs, [])
        self.assertTrue(any("no template" in w for w in warns))

    def test_same_copy_across_scripts_is_caught(self):
        a = storyboard(GOOD)
        ok, overlap = audit_recipes.compare(a, a)
        self.assertFalse(ok)
        self.assertEqual(overlap, 1.0)
        b = storyboard(
            [
                ("TITLE_CARD", {"lines": ["Grow tomatoes indoors"], "accentLine": 0}),
                ("SPEAKER_ORBIT_PILLS", {"pills": [{"text": "Light"}, {"text": "Soil"}]}),
            ]
        )
        ok, _ = audit_recipes.compare(a, b)
        self.assertTrue(ok)

    def test_every_recipe_component_exists_for_implemented_status(self):
        for r in self.lib["recipes"]:
            if r["status"] == "implemented":
                self.assertTrue((STUDIO / r["component"]).exists(), r["component"])


@unittest.skipUnless(shutil.which("node") and (STUDIO / "node_modules" / ".bin" / "tsc").exists(), "node + installed template required")
class FaceSafeTests(unittest.TestCase):
    def test_placements_never_overlap_the_face(self):
        with tempfile.TemporaryDirectory() as td:
            subprocess.run(
                [str(STUDIO / "node_modules/.bin/tsc"), str(STUDIO / "src/tokens/faceSafe.ts"), "--outDir", td,
                 "--target", "ES2022", "--module", "ES2022", "--skipLibCheck"],
                check=True, cwd=STUDIO,
            )
            r = subprocess.run(["node", str(STUDIO / "tests/faceSafe.check.mjs"), str(Path(td) / "faceSafe.js")],
                               capture_output=True, text=True)
            self.assertEqual(r.returncode, 0, r.stderr)
            self.assertTrue(json.loads(r.stdout)["ok"])


class RecipeTimelineTests(unittest.TestCase):
    def scenes(self):
        return [
            {"id": "a", "kind": "RECIPE", "recipe": {"id": "TITLE_CARD", "params": {"lines": ["One"]}}},
            {"id": "b", "kind": "RECIPE", "recipe": {"id": "TITLE_CARD", "params": {"lines": ["Two"]}}},
        ]

    def run_uniqueness(self, scenes):
        import audit_edit_diversity as aed

        errors, warnings = [], []
        aed.check_component_reuse({"scenes": scenes}, errors, warnings)
        return errors

    def test_different_recipe_params_are_not_duplicates(self):
        self.assertEqual(self.run_uniqueness(self.scenes()), [])

    def test_identical_recipe_scenes_are_flagged(self):
        sc = self.scenes()
        sc[1]["recipe"] = json.loads(json.dumps(sc[0]["recipe"]))
        self.assertTrue(any("repeats the exact" in e for e in self.run_uniqueness(sc)))

    def test_timeline_schema_accepts_recipe_scenes_and_rejects_bad_face_box(self):
        try:
            import jsonschema
        except ImportError:
            self.skipTest("jsonschema not installed")
        schema = json.loads((ROOT / "assets/schemas/timeline.schema.json").read_text())
        tl = json.loads((STUDIO / "public/timeline.json").read_text())
        tl["scenes"] = [{
            "id": "s1", "shotId": "S01", "durationInFrames": 90, "kind": "RECIPE",
            "footage": {"src": "a.mp4", "faceBox": [0.4, 0.1, 0.2, 0.4]},
            "recipe": {"id": "TITLE_CARD", "params": {"lines": ["x"]}},
        }]
        jsonschema.validate(tl, schema)
        tl["scenes"][0]["footage"]["faceBox"] = [0.4, 0.1]
        with self.assertRaises(jsonschema.ValidationError):
            jsonschema.validate(tl, schema)


class BengaliFontTests(unittest.TestCase):
    def test_fonts_ts_loads_a_bengali_subset(self):
        src = (STUDIO / "src/fonts.ts").read_text(encoding="utf-8")
        self.assertIn("HindSiliguri", src)
        self.assertIn('"bengali"', src)
        self.assertIn("fontFor", src)


if __name__ == "__main__":
    unittest.main()
