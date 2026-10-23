# 01 — Creative Direction & Visual Worldbuilding

Before cutting a single clip or animating a single div, the **Creative Director** defines *why* the piece exists, *how* it should feel, and *what visual laws govern its universe*. Output this decision as `preprod/01_creative_brief.json` (conforming to `assets/schemas/creative_brief.schema.json`).

---

## 1. The Emotional Transformation Arc

Viewers do not remember feature lists or facts; they remember **emotional state transitions**. Define every video using a strict **From → Through → To** vector:

| Video Archetype | Viewer Starts Feeling (`fromState`) | Midpoint Friction (`tensionState`) | Viewer Leaves Feeling (`toState`) |
| :--- | :--- | :--- | :--- |
| **Product / SaaS Launch** | Resigned to slow, fragmented workflow | Realizing hidden cost of status quo | Inevitable clarity & effortless speed |
| **Technical Explainer** | Intimidated by opaque complexity | Curiosity as layers peel apart | Empowered mastery ("I actually get it") |
| **Founder / Brand Film** | Skeptical of another polished pitch | Visceral recognition of shared struggle | Earned trust & conviction |
| **Data / Investigative Essay** | Passive assumption of conventional wisdom | Cognitive dissonance as data contradicts | Urgent insight & paradigm shift |
| **Short-Form Social Hook** | Numb scroll autopilot | Immediate pattern violation / open question | Satisfying payoff worth rewatching |

---

## 2. Selecting ONE Cohesive Visual World

Amateur AI videos fail because Scene 1 looks like dark cyberpunk, Scene 2 uses corporate flat icons, and Scene 3 looks like a pastel Notion doc. Lock **one** visual world for the entire runtime:

### Archetype A: `SWISS_EDITORIAL_DARK`
* **Atmosphere**: Deep obsidian charcoal (`oklch(0.15 0.01 260)`), crisp hairline `1px` structural grids (`rgba(255,255,255,0.08)`), generous negative space (`>= 45%` open canvas).
* **Typography**: High-contrast serif or neo-grotesque display (`Instrument Serif` / `Inter Tight`) + crisp tabular mono (`JetBrains Mono`) for data/labels.
* **Motion Character**: Weighted editorial springs (`damping: 26, stiffness: 180`), zero cartoon bounce, razor-sharp mask reveals.
* **Best For**: AI/dev tools, fintech, investigative journalism, high-ticket B2B, architecture.

### Archetype B: `TACTILE_PAPER_CRAFT`
* **Atmosphere**: Warm museum off-white (`oklch(0.95 0.015 80)`), deep ink carbon (`oklch(0.18 0.01 250)`), subtle paper fiber noise, editorial highlighter accents (vermilion, cobalt, highlighter amber).
* **Typography**: Editorial serif (`Newsreader` / `Playfair`) + clean geometric sans (`Plus Jakarta Sans`).
* **Motion Character**: Stepped or brisk tactile settles, subtle drop shadows mimicking physical card elevation, hand-drawn SVG path underlines.
* **Best For**: Education, essays, productivity apps, cultural commentary, human-centric storytelling.

### Archetype C: `PRECISION_CINEMA_LAB`
* **Atmosphere**: Deep tungsten/slate (`oklch(0.13 0.02 235)`), optical depth-of-field blur on background layers, subtle anamorphic halation on bright highlights, 2.5D spatial camera dolly moves.
* **Typography**: Wide architectural sans (`Space Grotesk` / `Syne`) + technical mono HUD readouts.
* **Motion Character**: Heavy cinematic camera momentum (`mass: 1.8, damping: 32`) paired with snappy `60fps` micro-telemetry ticks.
* **Best For**: Hardware, robotics, cybersecurity, infrastructure, cinematic trailers.

### Archetype D: `KINETIC_PULSE_SOCIAL`
* **Atmosphere**: Bold tonal blocks that invert polarity on macro beats (dark → saturated accent → light), tight framing, ultra-high figure-ground contrast for mobile screens.
* **Typography**: Heavy condensed/display grotesque (`Archivo Black` / `Clash Display`), max 3–5 words per screen.
* **Motion Character**: Punchy micro-overshoot (`damping: 13, stiffness: 250`), rhythmic beat-locked cuts, eye-centered composition.
* **Best For**: Reels, TikTok, YouTube Shorts, kinetic manifestos, event teasers.

---

## 3. The Kuleshov Subtext Law (Zero Literal Clichés)

Lev Kuleshov proved that meaning arises from the **collision between audio and visual**, not duplication.

* **FORBIDDEN (Literal Duplication / Stock Cliché)**:
  * Script says *"save time"* → showing a clock or stopwatch icon.
  * Script says *"global scale"* → showing a generic spinning wireframe globe.
  * Script says *"security"* → showing a padlock icon.
  * Script says *"growth"* → showing a generic 3-bar green arrow chart.
  * Script says *"AI brain"* → showing glowing purple synapses.

* **REQUIRED (Visual Evidence, Contrast, or Consequence)**:
  * Script says *"save time"* → show a 14-step legacy checklist collapsing into 1 executed command while a frame counter stops at `0.18s`.
  * Script says *"security"* → show live unauthorized request packets hitting an isolation boundary and disintegrating on contact.
  * Script says *"growth"* → show actual customer cohort curves expanding with real unit labels and comparative baseline tension.

---

## 4. Typography & Spatial Discipline

1. **Two-Font Ceiling**: Select `displayFont` (headlines/statements) and `utilityFont` (captions, metrics, UI labels). Never introduce a third font.
2. **Three-Size Ceiling Per Frame**: Any single frame may contain at most **Hero Display**, **Supporting Subhead**, and **Micro Metadata/Label**.
3. **Tabular Numerals Mandatory**: Every animated counter, timestamp, currency, or chart axis must set `fontVariantNumeric: "tabular-nums"` so digits never jitter horizontally while counting.
4. **Negative Space Floor**: At least **40% of frame area** in motion-graphic scenes must remain uncluttered background/atmosphere. Crowded frames look cheap and destroy retention.
5. **Aspect-Ratio Native Design**: Never shrink a `16:9` layout inside black letterbox bars to make a `9:16` vertical video. Re-stack spatial hierarchy vertically inside safe zones (`top >= 12%`, `bottom >= 22%`, `right >= 14%` on `9:16` to clear platform UI icons).
