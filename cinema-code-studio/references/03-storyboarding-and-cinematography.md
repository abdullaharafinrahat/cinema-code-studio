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
python3 scripts/render_storyboard_board.py preprod/04_storyboard.json --out preprod/storyboard.png
```
Inspect `storyboard.png` to confirm visual variety in shot scales (`WS → MS → CU`), smooth focal crosshairs, and cohesive color progression before building `05_timeline.json`.
