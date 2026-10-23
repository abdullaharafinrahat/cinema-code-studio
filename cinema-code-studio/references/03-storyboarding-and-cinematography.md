# 03 — Complete Storyboarding & Cinematography in Code

A real director never "wings it in the timeline." Every shot is planned in `preprod/04_storyboard.json` (validated against `assets/schemas/storyboard.schema.json`) and rendered to a visual contact board (`preprod/storyboard.png`) via `scripts/render_storyboard_board.py` before Remotion scene coding begins.

---

## 1. Cinematic Shot Scale Taxonomy (Footage & Motion Graphics)

Shot scale controls **psychological intimacy vs. structural context**—even in pure UI or vector motion graphics!

| Code | Shot Scale | Footage Equivalent | Motion Graphics / UI Equivalent | Psychological Effect |
| :--- | :--- | :--- | :--- | :--- |
| `ECU` | Extreme Close-Up | Eyes / hands / detail | Single button click, cursor micro-hover, one metric digit ticking | Intense focus, tactile precision, high tension |
| `CU` | Close-Up | Head & shoulders (`1.18x+`) | Single card, single terminal command, hero word | Intimacy, conviction, emotional truth |
| `MS` | Medium Shot | Waist-up conversational (`1.0x`) | 2–3 connected cards, split comparison, mobile mockup | Conversational clarity, balanced explanation |
| `WS` | Wide Shot | Full environment + subject | Full application dashboard, multi-stage system map | Spatial orientation, architectural proof |
| `EWS` | Extreme Wide Shot | Tiny subject in vast space | 64-node network topology, full year timeline zoom-out | Scale awe, systemic perspective, isolation/grandeur |

### Scale Alternation Law
Never cut from `MS` to `MS` along the same visual axis without changing scale by at least **14–20%** (`MS → CU`) or shifting composition grid—otherwise the cut registers in the brain as a technical glitch (unmotivated jump cut).

---

## 2. Composition Grids & Normalized Coordinates

All focal coordinates `[x, y]` in `04_storyboard.json` use normalized screen coordinates where `[0.0, 0.0]` is top-left, `[0.5, 0.5]` is dead center, and `[1.0, 1.0]` is bottom-right.

### Grid 1: `RULE_OF_THIRDS`
* Power intersections: `[0.33, 0.33]`, `[0.67, 0.33]`, `[0.33, 0.67]`, `[0.67, 0.67]`.
* Speaker eye-line ALWAYS sits near `y = 0.33–0.38` (never dead-center `y = 0.50` with wasted headroom above the skull).
* Look-room rule: If speaker looks slightly right, place eyes at `x = 0.36` so open negative space opens into `x = 0.60–0.90` (ideal zone for side callout graphics!).

### Grid 2: `CENTER_PUNCH`
* Focal coordinate: `[0.50, 0.46]` (optical center sits ~4% above geometric center).
* Best for rapid kinetic typography, bold hero metrics, iconic product reveals, and fast short-form cuts where zero eye-travel time is desired.

### Grid 3: `ASYMMETRIC_EDITORIAL`
* Left `38%` holds pinned thesis label (`x = 0.22, y = 0.35`); right `62%` holds animated evidence stage (`x = 0.68, y = 0.50`).
* Best for `16:9` explainers, financial/technical deep dives, and case studies.

### Grid 4: `VERTICAL_SAFE_STACK` (`9:16` Social Native)
* Active safe box: `x ∈ [0.08, 0.86]`, `y ∈ [0.12, 0.76]`.
* Keeps critical text and faces clear of top status bars, right-rail like/share buttons (`x > 0.86`), and bottom author/caption drawers (`y > 0.78`).

---

## 3. Camera Motivation Law

In amateur motion graphics, things zoom and spin constantly for no reason. In cinema, **the camera only moves when motivated by story or subject energy**:

| Camera Move | Psychological Meaning | When to Use |
| :--- | :--- | :--- |
| **`STATIC_BREATH`** (`1.00 → 1.025` imperceptible drift) | Calm authority, objective truth | Clean thesis statements, balanced comparisons |
| **`DOLLY_IN_INTIMATE`** (`1.00 → 1.16` eased) | Rising realization, confession, narrowing focus | Problem agitation, emotional turning point, secret reveal |
| **`PULL_BACK_REVEAL`** (`1.45 → 1.00` spring-damped) | Context expansion ("it's bigger than you thought") | Zooming out from one data point to reveal the whole system |
| **`LATERAL_TRACK`** (`panX` across continuous 2.5D world) | Causal progression (`Step A → Step B → Step C`) | Workflows, pipelines, chronological timelines |
| **`RACK_FOCUS_Z`** (blur foreground/background layer swap) | Shifting perspective from symptom to root cause | Layered UI slabs or multi-plane depth compositions |

---

## 4. Writing `04_storyboard.json`

Every shot entry must specify:
* `shotId`: Sequential ID (`"S01"`, `"S02"`, ...)
* `startSec`, `endSec`: Exact timing in seconds (`endSec > startSec`)
* `narrativeBeat`: `"HOOK" | "SETUP" | "TENSION" | "EVIDENCE" | "REHOOK" | "PAYOFF" | "CTA"`
* `shotScale`: `"ECU" | "CU" | "MS" | "WS" | "EWS"`
* `compositionGrid`: `"CENTER_PUNCH" | "RULE_OF_THIRDS" | "ASYMMETRIC_EDITORIAL" | "VERTICAL_SAFE_STACK"`
* `entryFocalPoint`: `[x, y]` where the viewer's eye lands in the first 4 frames of the shot
* `exitFocalPoint`: `[x, y]` where the viewer's eye rests on the final frame of the shot
* `visualDescription`: Concrete visual staging (never vague adjectives)
* `audioScript`: Exact VO words or sonic event occurring during this shot
* `onScreenWordCount`: Exact count of visible graphic words (excluding subtitles)
* `cognitiveLoadScore`: `1` (simple single subject), `2` (structured visual metaphor), `3` (high-density comparison—use sparingly!)
* `captionsActive`: `true` or `false` (must be `false` when `onScreenWordCount > 6` or `cognitiveLoadScore >= 2`)
* `cameraMove`: `{ "type": "...", "motivation": "..." }`
* `transitionOut`: `{ "type": "HARD_CUT" | "J_CUT" | "L_CUT" | "MATCH_CUT" | "DIRECTIONAL_WIPE" | "CAMERA_PAN", "durationFrames": 0..24 }`

Once written, ALWAYS run:
```bash
python3 scripts/audit_eye_trace.py preprod/04_storyboard.json
python3 scripts/audit_edit_diversity.py \\
  --grammar preprod/01a_edit_grammar.json \\
  --storyboard preprod/04_storyboard.json \\
  [--timeline preprod/05_timeline.json]
python3 scripts/render_storyboard_board.py preprod/04_storyboard.json --out preprod/storyboard.png
```
Inspect `storyboard.png` to confirm visual variety in shot scales (`WS → MS → CU`), smooth focal crosshairs, and cohesive color progression before building `05_timeline.json`.

---

## 5. Per-Script Shot Vocabulary (Gate 1.5)

**The "Same Edit" Problem**: When you run the skill with different scripts and get identical edits, the root cause is a **fixed narrative skeleton** (`HOOK/SETUP/TENSION/EVIDENCE/REHOOK/PAYOFF/CTA`) combined with a fixed shot-scale taxonomy (`ECU/CU/MS/WS/EWS`) and a fixed camera-move taxonomy (`STATIC_BREATH/DOLLY_IN_INTIMATE/PULL_BACK_REVEAL/LATERAL_TRACK/RACK_FOCUS_Z`). Every script gets the same 7 beats in the same order, the same 5 shot scales, and the same 5 camera moves — so the edit looks identical even when assets differ.

**The Fix**: Before storyboarding, extract THIS script's unique narrative arc and generate a **per-script shot vocabulary**, **camera-move sequence**, **transition vocabulary**, and **pacing signature** in `preprod/01a_edit_grammar.json`.

### Step 1: Extract the Script's Unique Narrative Shape

Read the script and identify its actual narrative arc. Never default to the universal skeleton. Examples:

| Script Type | Unique Arc | Custom Beats |
|:---|:---|:---|
| SaaS Launch ("Why X is broken") | Contrarian Reveal | `INVERT_PREMISE`, `CRITICAL_FLAW`, `EXPERIMENT`, `BLOWUP`, `RECONSTRUCTION`, `TRIUMPH` |
| Brand Film ("From zero to hero") | Origin-Trial-Triumph | `ORIGIN_LONGING`, `CRUSHING_SETBACK`, `DECISION_POINT`, `SACRIFICE`, `VICTORY_DAM` |
| Explainer ("How X works") | Layered Demystification | `SUPERFICIAL_ASPECT`, `SURPRISE_INSIGHT`, `LAYER_Peel`, `CORE_MECHANISM`, `FAMILIAR_APPLICATION` |
| Investigative ("What's really happening") | Unraveling Mystery | `BENIGN_OBSERVATION`, `DISCREPANCY`, `DEEP_DIVE`, `CONTRADICTION`, `REVELATION`, `IMPLICATION` |
| Tutorial ("Build X from scratch") | Destruction-Construction | `COMPLETE_WRECK`, `SKELETAL_REBUILD`, `FUNCTIONAL_REVIVE`, `POLISH_PAYOFF` |

### Step 2: Generate a Per-Script Shot Vocabulary

From the custom beats, derive a **shot-scale sequence** that alternates. Never use the same scale 3+ times consecutively:

```json
"shotVocabulary": ["EWS", "ECU", "MS", "CU", "WS", "CU", "ECU", "WS", "MS", "EWS"]
```

Each scale transition must change perspective by at least 14% — `EWS → ECU` is dramatic; `EWS → WS` is a subtle shift.

### Step 3: Generate a Per-Script Camera-Move Vocabulary

Each camera move must have a unique motivation tied to a specific script beat. Never reuse the same move type 3+ times consecutively:

```json
"cameraMoveVocabulary": [
  {"type": "CRASH_ZOOM_REVEAL", "motivation": "Crash into the critical flaw to shatter the viewer's assumptions", "beatId": "CRITICAL_FLAW"},
  {"type": "WHIP_PAN_SACCADE", "motivation": "Rapid whip to show the viewer's eye racing between competing options", "beatId": "EXPERIMENT"},
  {"type": "TILT_AROUND_PORTAL", "motivation": "Tilt around the portal to reveal the rebuilt world from a new angle", "beatId": "RECONSTRUCTION"},
  {"type": "ORBITAL_ORBIT", "motivation": "Orbit the hero to celebrate the full system working end-to-end", "beatId": "TRIUMPH"},
  {"type": "VERTICAL_DROP", "motivation": "Drop vertically into the core mechanism to show the deepest layer", "beatId": "CORE_MECHANISM"}
]
```

### Step 4: Generate a Per-Script Transition Vocabulary

Each transition type must be unique — no two consecutive transitions share the same type:

```json
"transitionVocabulary": ["HARD_CUT", "BOKEH_RING_WIPE", "MATCH_CUT", "PORTAL_ZOOM_OUT", "VELOCITY_MATCH_DISSOLVE", "J_CUT", "L_CUT", "GLOW_SWEEP_FRAME"]
```

### Step 5: Generate a Pacing Signature

Every script has its own rhythmic DNA:

```json
"pacingSignature": {
  "startPace": "IMMEDIATE_CONFRONTATION",
  "accelerationPoint": "After the counterexample at beat CRITICAL_FLAW",
  "peakPace": "RAPID_PACING",
  "breathHoldLocation": "The silent rebuild at RECONSTRUCTION (8.5s single hold)",
  "endingPace": "IMPACT_RESOLUTION"
}
```

### Step 6: Define Forbidden Repetitions

Explicitly ban the patterns that cause "same edit" leakage:

```json
"forbiddenRepetitions": [
  "No three consecutive CU shots",
  "No portal-zoom-out on every transition (max 2 per script)",
  "No BokehRingWipe between every scene (max 3 per script)",
  "No camera move repeated 3+ times consecutively"
]
```

### Step 7: Lock the Script Signature Hash

Generate a deterministic hash or short phrase that uniquely identifies this edit's grammar:

```json
"scriptSignatureHash": "INVERT-FLAW-SHADOW-REBUILD-0425"
```

Every shot in `04_storyboard.json` must carry `editGrammarSignature` matching this hash. The `audit_edit_diversity.py` validator enforces this.

### Enforcement

`audit_edit_diversity.py` checks:
1. **Script Shape Diversity**: `scriptShape.beatSequence` must NOT use the universal skeleton (HOOK/SETUP/TENSION/EVIDENCE/REHOOK/PAYOFF/CTA) — at least 50% of beats must be custom.
2. **Shot Scale Alternation**: No 3+ consecutive shots at the same scale.
3. **Camera Move Diversity**: No 3+ consecutive shots using the same camera-move type.
4. **Transition Diversity**: No 2+ consecutive shots with the same transition-out type.
5. **Component Reuse**: `05_timeline.json` must NOT reuse the same `component` name more than once.
6. **Edit Grammar Signature**: Every storyboard shot's `editGrammarSignature` must match the grammar's `scriptSignatureHash`.
7. **Forbidden Repetitions**: Validates all `forbiddenRepetitions` rules.
