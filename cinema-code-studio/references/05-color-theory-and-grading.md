# 05 — Perceptual Color Theory, Color Scripting & Film Grading

Most code-generated videos scream "developer Bootstrap site" because they pick random sRGB hex values (`#3B82F6`, `#10B981`, `#FFFFFF`) without perceptual lightness calibration or emotional continuity. A real **Colorist & Art Director** designs in **OKLCH**, enforces a strict **60-30-10 pixel budget**, scripts color emotionally across acts, and unifies footage + vector graphics through optical texture.

---

## 1. Why OKLCH Replaces RGB/HSL

In standard HSL, `hsl(60, 100%, 50%)` (pure yellow) has ~93% perceived luminance while `hsl(240, 100%, 50%)` (pure blue) has ~7% perceived luminance—yet both claim `"50% lightness"`. Swapping hues destroys text readability and visual hierarchy.

In **OKLCH** (`oklch(L C H)`):
* **`L` (Perceptual Lightness, `0.00` to `1.00`)**: Equal `L` values look equally bright to the human eye regardless of hue!
* **`C` (Chroma / Saturation, `0.00` to `0.175` Pigment Ceiling)**: Warm carbon/paper neutrals sit at `0.004–0.016`; tactile film/print accents sit at `0.10–0.170`. **Never exceed `C = 0.175`** (high-chroma sRGB neons instantly look like synthetic "AI slop").
* **`H` (Hue Angle — Analog Pigment Bands)**: `~32°–38°` Braun terracotta/iron-oxide, `~72°–82°` aged brass/Kodak ochre/archival paper, `~135°–155°` muted forest sage. **Strictly forbid purple/violet/magenta (`275°–345°`) and electric neon cyan (`195°–240°` at high `L`/`C`).**

### The Squint-Test Luminance Ladder (Dark & Light Modes)

| Layer Role | Dark Cinema Mode (`L`) | Light Editorial Mode (`L`) | Max Chroma (`C`) |
| :--- | :--- | :--- | :--- |
| **60% Dominant Canvas** | `0.17 – 0.20` (Warm Matte Carbon `#141311`) | `0.93 – 0.95` (Archival Paper `#EFE9DD`) | `0.004 – 0.017` (never cold `#0F172A` tech navy) |
| **30% Elevated Surface / Grid** | `0.22 – 0.26` (Smoked Basalt `#201E1B`) | `0.88 – 0.91` (Warm Stone `#E3DCCD`) | `0.007 – 0.022` |
| **Muted Context Copy / Inactive Nodes** | `0.58 – 0.65` (Warm Pewter `#8E877C`) | `0.45 – 0.52` | `0.010 – 0.025` |
| **Primary Headline (Silver-Gelatin Bone/Ink)** | `0.92 – 0.95` (`#EDE7DA`) | `0.18 – 0.21` (`#181613`) | `0.010 – 0.018` |
| **10% Hero Focal Accent (Matte Pigment)** | `0.57 – 0.76` (`#C8963E` / `#C84B31`) | `0.48 – 0.58` (`#B8432A`) | `0.100 – 0.170` (zero neon outer glow!) |

**Hard Validation Rule (`validate_color_script.py`)**:
* Hero focal elements and primary typography MUST maintain `|ΔL| >= 0.36` against their immediate surface so hierarchy passes the **25%-scale grayscale squint test**.
* `validate_color_script.py` automatically rejects purple/violet hues, `C > 0.175` neon saturation, electric cyan, and cold blue-navy dark backgrounds. Never use glowing `box-shadow: 0 0 Npx <accent>` laser halos—rely on crisp `1px` matte borders and tonal value contrast.
* Never use pure `#FFFFFF` (`L = 1.00`) or pure `#000000` (`L = 0.00`)—clamp whites to **silver-gelatin bone** (`#EDE7DA` / `#EFE9DD`) and blacks to warm matte carbon (`#141311`).

---

## 2. The 60–30–10 Pixel Budget

Every frame's pixel area must obey:
* **60% Atmosphere / Negative Space**: Low-chroma canvas or graded background footage.
* **30% Structural Architecture**: Containers, subdued body copy, secondary axes, muted comparison bars.
* **10% High-Chroma Focal Target**: Reserved **exclusively** for the ONE thing the viewer must look at right now (active data line, highlighted keyword, cursor action).
* **Trap**: Coloring 4 cards in 4 bright rainbow colors (`red, blue, green, purple`) gives four `10%` competitors—the eye freezes. Keep 3 inactive cards neutral (`C = 0.02`) and light up **only** the active card (`C = 0.18`).

---

## 3. Color Psychology & Narrative Color Scripting (`03_color_script.json`)

Just like Pixar's *Color Scripts*, color must evolve across narrative beats rather than staying static from `0:00` to the end:

| Narrative State | Temperature & Hue Strategy | Chroma (`C`) | Contrast / Vignette |
| :--- | :--- | :--- | :--- |
| **Problem / Friction / Legacy Chaos** | Cool slate-blue shadows (`H: 235°`) + warning crimson spikes (`H: 25°`) | Suppressed (`0.03`) except error spikes | Tight vignette, compressed midtones |
| **Investigation / Precision Mechanism** | Clean neutral tungsten/obsidian (`H: 250°`) + surgical cyan/cobalt (`H: 215°`) | Controlled (`0.15` on active path) | Crisp tonal separation |
| **Breakthrough / Relief / Payoff** | Lifted warm midtones (`H: 75°–90°` gold/ivory cast) or vibrant emerald/amber | Open, breathable (`0.17`) | Soft halation bloom, relaxed vignette |

`<ColorGradeLayer />` in Remotion reads the active scene's mood from `03_color_script.json` and smoothly interpolates CSS/SVG filter matrices over `18–30 frames` at act boundaries.

---

## 4. Unifying Camera Footage & Motion Graphics

Why do amateur motion graphics look "stuck on top of" camera video? Because camera footage has **sensor noise, lens roll-off, and color cast**, while React `<div>`s are razor-sharp, noiseless sRGB math.

### The 3-Step Composite Fusion Protocol
1. **Skin-Tone Protection**: When grading speaker footage, keep midtone hue shifts gentle so human skin stays near the natural vectorscope I-line (`OKLCH Hue ~ 32°–52°`). Push stylized teal/cobalt casts into **shadows** (`lift`) and warm amber into **highlights** (`gain`), leaving skin midtones clean.
2. **Tinted Shadows & Highlights on Graphics**: Sample or match the footage's shadow hue (`H`) for graphic card backgrounds (`backdropFilter: "blur(18px)"` with tinted translucent fill) rather than slapping opaque `#000000` boxes over footage.
3. **Top-Level Unified `<OpticalTexture />`**: Render subtle animated 35mm SVG luminance grain (`opacity: 0.035`, seeded per frame!) and a `12%` edge vignette **on the top layer of `MasterSequence.tsx`**, *above* both `<OffthreadVideo>` and all text/SVG scenes. Now every graphic shares the exact same film emulsion as the camera footage.
