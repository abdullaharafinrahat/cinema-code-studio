# 10 — Shot Recipe Library

Recipes are proven shot patterns taken from a reference Bengali course promo. They exist to raise the quality floor: instead of inventing each scene, you pick a pattern and write **copy, order, and timing for this script**. The machine-readable spec is `assets/recipes/recipes.json`.

## How to use

1. At Gate 5, give every storyboard shot a `recipeId` and `recipeParams`. Use `CUSTOM` only with a `recipeNote` explaining why nothing fits.
2. Run `python3 scripts/audit_recipes.py <storyboard> [--compare <other storyboard>]`.
3. At Gate 6/7, put implemented recipes in the timeline as:

```json
{
  "id": "scene_03_pills",
  "shotId": "S03",
  "durationInFrames": 90,
  "kind": "RECIPE",
  "footage": { "src": "speaker.mp4", "faceBox": [0.44, 0.07, 0.22, 0.47] },
  "recipe": {
    "id": "SPEAKER_ORBIT_PILLS",
    "params": { "pills": [{ "text": "Professional work" }, { "text": "International client", "tone": "lime" }] }
  }
}
```

`footage.faceBox` comes from `eyes.json` (`dominantFaceBox`). Without it a centered default is used, which is wrong for off-center speakers, so track the face.

## The recipes

| Recipe | Use when | Status |
| --- | --- | --- |
| `SPEAKER_ORBIT_PILLS` | The speaker lists 2-4 named things | implemented |
| `WRONG_RIGHT_CARDS` | "Not X, but Y": a mistake, then the better way | implemented |
| `STEP_LABELS` | A path of 2-4 stages | implemented |
| `MINI_SPEAKER_FRAME` | A chapter or section moment; a rest for the eye | implemented |
| `TITLE_CARD` | A claim or offer name that deserves the whole screen | implemented |
| `PHONE_FLOAT_CARDS` | Money, apps, phone-based benefits | spec only |
| `UI_STACK` | A product or workflow as layered app windows | spec only |
| `PORTAL_ZOOM_OUT` | Detail to the bigger picture (build with `PortalZoomStage`) | spec only |
| `SPEAKER_CUTOUT_TEXT_BEHIND` | Text behind the speaker for depth; needs a matte | spec only |

`spec_only` means there is no template. You hand-build the shot to the spec, and the audit warns you so it is not mistaken for a tested template.

## What makes a recipe look right (the reference's habits)

- Flat, solid fills. Soft neutral drop shadows. **No glow, no gradient fills, no circuit lines.**
- Meaning colors do work: red + x for "wrong", lime + check for "right", cobalt for neutral emphasis.
- Labels sit **beside** the face, never on it (`placePills` in `src/tokens/faceSafe.ts` guarantees this).
- One entrance per idea, staggered, finishing within about 34 frames. Held elements keep a slow drift.
- Calm shots are part of the design. A plain speaker shot between busy ones is intentional.
- Real UI and real logos, or faithfully rebuilt ones. Nothing invented.

## Rules the audit enforces

- No recipe takes more than 35% of recipe shots; the same recipe never repeats back to back.
- Counts: pills 2-4, steps 2-4, lines 1-3, wrong cards 1-4.
- On-screen words must fit the shot: `words / 3.2 + 0.55 s`. Add 20% for Bengali copy.
- `--compare` fails when more than 30% of (recipe, label) pairs repeat another project. Copy always comes from this script.

## Adding a recipe

Add it to `recipes.json` with `status: "spec_only"`. Promote it to `implemented` only after a component exists in `src/recipes/`, is registered in `RecipeStage.tsx`, is typed in `types/timeline.ts`, and has a test. The test suite checks that every `implemented` recipe has its component file.
