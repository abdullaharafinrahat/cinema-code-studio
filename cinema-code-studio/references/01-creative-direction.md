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

### Archetype 0 (Flagship Commercial): `COMMERCIAL_MIXED_MEDIA` (`25 fps`)
* **Atmosphere**: Deep cinema sapphire/obsidian (`#040A18`) paired with high-contrast studio daylight cycloramas (`#F8FAFC`), electric cinema cobalt (`#1D63ED`), and tactile indicator lime (`#84CC16`) — **strictly 0% purple/violet and 0% raw neon**.
* **5–8 Mixed-Media Layers Per Shot**: Real verified photography & cutouts, authentic brand/software vector SVGs (`React`, `TypeScript`, `FFmpeg`, `DaVinci`, `GitHub`, `Apple`), tactile NLE/CLI product chrome, `<GlowSweepFrame>` animated perimeter corner light-sweeps, `<OrthogonalNodeTree>` frosted glass callouts, `<StudioCursor>` micro-interactions, and `<BokehRingWipe>` foreground blurred ring-light transitions.
* **Camera Character**: Heavy continuous virtual camera movement at `25 fps` — recursive `<PortalZoomStage>` "World-Inside-World" zoom-outs with velocity blur, 3D perspective tilts (`rotateY(-13deg) rotateX(6deg)`), and rapid saccade whip-pans. Zero parked/static objects.
* **Best For**: High-craft product commercials, dev-tool launches, SaaS hero films, flagship explainers.

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

## 3. Mixed-Media Asset Sourcing & Visual Verification Law (Gate 4)

Never generate AI images for everything, and never build off-topic abstract CSS/3D geometric structures (`torus`, `icosahedron`, wireframe spheres) when literal real-world visuals exist!

1. **Fetch Authentic Online Assets First**:
   * **Brand & Software Logos**: Fetch genuine vector SVGs (e.g., `https://cdn.simpleicons.org/<slug>/<hex>` or official press kits) into `remotion/public/assets/icons/`. Never hand-draw crude approximations of known logos.
   * **Real Topic Photography**: Search and fetch high-resolution real photographs matching the script's literal subject (color grading suites, film sets, macro human iris, hardware setups) into `remotion/public/assets/photos/`.
2. **Generate Bespoke Studio Plates Only When Required**:
   * Use studio image generation strictly for specialized plates that cannot be sourced cleanly online (e.g., pure `#FFFFFF` cyclorama silhouettes for recursive NLE zoom-outs, or matched gaze-aligned portrait pairs).
3. **Mandatory Visual Verification Before Compositing (`verify_mixed_media_assets.py` + Eye Inspection)**:
   * Run `python3 scripts/verify_mixed_media_assets.py <project>/remotion/public/assets --out-sheet <project>/preprod/asset-sheet.jpg` AND visually inspect every candidate image!
   * Reject watermarks, off-topic stock clichés, purple/neon color casts, or AI generation artifacts (e.g., duplicated side skulls/limbs—crop or isolate cleanly onto pure `#000000` for `mixBlendMode: "screen"` compositing and re-verify visually!).
   * **Never Ship "AI-Slop" Structural Tropes**: Strictly ban 4-column rectangular SaaS card grids, rounded pill-badge soup, and fake sci-fi HUD strings (`CHANNEL 01`, `TC 00:00`, `SIGNAL CORE`, `SYS_READY`).

---

## 4. The Kuleshov Subtext Law (Zero Literal Clichés)

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

## 5. Typography & Spatial Discipline

1. **Preloaded Google/Local Fonts Mandatory (`src/fonts.ts`)**: Never write `fontFamily: "Inter, sans-serif"` without loading the font via `@remotion/google-fonts` or `@remotion/fonts`—headless Linux containers lack system UI fonts and silently fall back to `DejaVu Sans`.
2. **Two-Font Ceiling**: Select `displayFont` (e.g. `Space Grotesk` 700) and `editorialFont` (e.g. `Instrument Serif` Regular/Italic). Never introduce a third font.
2. **Three-Size Ceiling Per Frame**: Any single frame may contain at most **Hero Display**, **Supporting Subhead**, and **Micro Metadata/Label**.
3. **Tabular Numerals Mandatory**: Every animated counter, timestamp, currency, or chart axis must set `fontVariantNumeric: "tabular-nums"` so digits never jitter horizontally while counting.
4. **Negative Space Floor**: At least **40% of frame area** in motion-graphic scenes must remain uncluttered background/atmosphere. Crowded frames look cheap and destroy retention.
5. **Aspect-Ratio Native Design**: Never shrink a `16:9` layout inside black letterbox bars to make a `9:16` vertical video. Re-stack spatial hierarchy vertically inside safe zones (`top >= 12%`, `bottom >= 22%`, `right >= 14%` on `9:16` to clear platform UI icons).
