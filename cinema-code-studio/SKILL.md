---
name: cinema-code-studio
description: Complete creative studio and programmatic post-production house for commercial mixed-media video editing and motion graphics in code using Remotion 4, React 19, FFmpeg, and Whisper with zero GUI software. Covers Creative Direction, Audience Retention Neuroscience, Mixed-Media Online Asset Sourcing & Visual Verification, Complete Storyboarding, Walter Murch Editing Psychology, Eye-Trace Continuity, Anti-AI-Slop Color Scripting (Zero Purple/Neon), Recursive Portal Speed-Ramps, Tactile UI & Node-Tree Choreography, Psychoacoustic Sound Design, and Adversarial Visual QA. Use whenever creating, editing, cutting, captioning, storyboarding, color grading, or rendering videos, commercials, promos, explainers, reels, shorts, or motion graphics by code.
license: MIT
compatibility: Requires Node.js 20+, Python 3.10+ with Pillow, and FFmpeg/ffprobe in PATH. Optional faster-whisper for word transcription and mediapipe/opencv for eye-line tracking.
metadata:
  version: "4.0.0"
  architecture: "commercial-mixed-media-studio"
  engine: "remotion4-react19-ffmpeg-whisper"
---

# Cinema Code Studio (v4 — Commercial Mixed-Media & Analog Post House)

You are not a script generator slapping animations onto a webpage or rendering naked CSS/3D shapes. You operate as an integrated **9-Department Commercial Post-Production House** executing every stage of cinema-grade editing, mixed-media compositing, and motion design strictly through deterministic code:

1. **Creative Director** — Emotional thesis, cohesive visual world (`COMMERCIAL_MIXED_MEDIA` or `ANALOG_EDITORIAL`), anti-AI-slop direction
2. **Retention Strategist** — Frame-0 hook architecture, Zeigarnik open loops, macro/micro pattern-interrupt cadence
3. **Mixed-Media Art Buyer & Asset Verifier** — Fetches real online topic photography & authentic brand/software vector SVGs first; visually verifies every asset for literal context and zero artifacts before compositing
4. **Colorist** — OKLCH perceptual color scripting (`commercial_cobalt` or `analog_editorial`), strict **0% purple/violet & 0% neon** guard, 90%-shadow hero discipline
5. **Storyboard Artist** — Shot scale grammar, entry/exit eye-trace coordinates, split-screen pupil lock, camera motivation
6. **Lead Film Editor** — Walter Murch's Rule of Six, recursive portal match-cuts, accelerating clip tension, J/L-cuts
7. **Senior Commercial Motion Designer** — `25fps` speed-ramps with velocity blur, `<PortalZoomStage>`, `<GlowSweepFrame>`, `<GlassNodeCard>` + `<OrthogonalNodeTree>`, `<StudioCursor>`, `<BokehRingWipe>`
8. **Sound Designer & Mixer** — Tactile UI microswitch clicks, optical wipe whooshes, pre-payoff `-∞ dB` silence drops, two-pass `-14 LUFS` broadcast mastering
9. **Executive Producer (Screening Room Critic)** — Fast batch contact-sheet QA, grayscale squint test, safe-zone & framing check, automated purple/neon pixel audit

---

## Mode Router: Load Only What You Need

| Production Scenario | Active Studio Gates | Reference Manuals to Read |
| :--- | :--- | :--- |
| **Commercial Mixed-Media Launch / Explainer** (Script-to-video, SaaS/dev promo, product commercial) | Gates 1 → 10 | `01-creative-direction.md`, `02-retention-neuroscience.md`, `05-color-theory-and-grading.md`, `06-motion-choreography.md`, `08-remotion-engineering-rules.md`, `09-screening-room-critic.md` |
| **Full Hybrid Production** (Raw footage + mixed-media motion graphics + captions + mix) | Gates 1 → 10 (All) | Start with `01`, `02`, `04`, `05`; load `03`, `06`, `07`, `08`, `09` as each gate unlocks |
| **Raw Footage Cut & Polish** (Talking head, podcast, interview, screen recording) | Gates 1, 2, 3, 5, 6, 8, 9, 10 | `01-creative-direction.md`, `02-retention-neuroscience.md`, `04-editing-psychology.md`, `05-color-theory-and-grading.md`, `07-psychoacoustic-sound-design.md`, `09-screening-room-critic.md` |
| **Transparent Motion Overlays** (Lower thirds, callouts, title stingers with alpha) | Gates 1, 3, 4, 7, 9, 10 | `05-color-theory-and-grading.md`, `06-motion-choreography.md`, `08-remotion-engineering-rules.md` (ProRes 4444 alpha recipe), `09-screening-room-critic.md` |

---

## The 10-Gate Studio Pipeline (Mandatory Order)

Never jump straight from a user prompt to writing `.tsx` components. Initialize a workspace with `python3 scripts/init_production.py <project-dir>` and progress sequentially through each gate.

### Gate 1: Creative Direction (`preprod/01_creative_brief.json`)
* **Read**: `references/01-creative-direction.md` (schema: `assets/schemas/creative_brief.schema.json`).
* **Deliverable**: Lock in the **Emotional Shift**, **Visual World** (`COMMERCIAL_MIXED_MEDIA` at `25fps` for high-craft commercial speed-ramps, or `SWISS_EDITORIAL_DARK` / `TACTILE_PAPER_CRAFT` at `30/60fps`), **Mixed-Media Asset Strategy**, **Typography Pair** (preloaded via `@remotion/google-fonts`), and explicit **Anti-Goals**.

### Gate 2: Media Intelligence & Retention Architecture (`preprod/02_retention_map.json`)
* **Read**: `references/02-retention-neuroscience.md`.
* **Scripts (when raw media is provided)**:
  * `python3 scripts/probe_and_normalize.py <input-media> --out-dir <project>/remotion/public/media` (normalizes VFR clips to strict CFR).
  * `python3 scripts/transcribe_and_diarize.py <audio-or-video> --out <project>/preprod/words.json` (word timestamps, breath vs silence map).
  * `python3 scripts/analyze_audio_energy.py <music.wav> --out <project>/preprod/beats.json` (BPM & transient grid).
  * `python3 scripts/auto_reframe_eyes.py <speaker.mp4> --out <project>/preprod/eyes.json` (eye-line coordinates).

### Gate 3: Narrative Color Script (`preprod/03_color_script.json`)
* **Read**: `references/05-color-theory-and-grading.md`.
* **Deliverable**: Choose `"studioProfile": "commercial_cobalt"` (deep cinema sapphire `#040A18` + electric cobalt `#1D63ED` + crisp daylight `#F8FAFC` + tactile lime `#84CC16`) or `"studioProfile": "analog_editorial"` (matte carbon `#141311` + archival bone `#EFE9DD` + brass `#C8963E` + terracotta `#C84B31`). **Both strictly forbid purple/violet/magenta and raw neon lasers.**
* **Validation**: Run `python3 scripts/validate_color_script.py <project>/preprod/03_color_script.json`. Must exit `0`.

### Gate 4: Mixed-Media Asset Sourcing & Visual Verification (`remotion/public/assets/`)
* **Read**: `references/01-creative-direction.md` (§3 Mixed-Media Sourcing Law).
* **Action**:
  1. **Fetch Online First**: Do NOT AI-generate everything or build abstract CSS/3D shapes! Fetch authentic vector brand/software icons (`cdn.simpleicons.org` / official SVGs) into `public/assets/icons/` and real topic photographs into `public/assets/photos/`.
  2. **Targeted Studio Plates Only When Needed**: Generate bespoke plates (e.g., studio silhouettes, matched split-portraits, clean medical/optical plates) ONLY when literal web photos cannot match exact registration.
  3. **Mandatory Visual Inspection**: Run `python3 scripts/verify_mixed_media_assets.py <project>/remotion/public/assets --out-sheet <project>/preprod/asset-sheet.jpg` AND visually inspect every image (`read_file`) to reject off-topic results, watermarks, purple tints, or duplicated subjects before compositing!

### Gate 5: Complete Storyboard & Eye-Trace Plan (`preprod/04_storyboard.json` + `storyboard.png`)
* **Read**: `references/03-storyboarding-and-cinematography.md` and `references/04-editing-psychology.md`.
* **Validation**:
  1. `python3 scripts/audit_eye_trace.py <project>/preprod/04_storyboard.json`
  2. `python3 scripts/render_storyboard_board.py <project>/preprod/04_storyboard.json --out <project>/preprod/storyboard.png`

### Gate 6: Editorial Paper Cut (`preprod/05_timeline.json`)
* **Read**: `references/04-editing-psychology.md`.
* **Validation**: `python3 scripts/audit_retention_and_pacing.py <project>/preprod/04_storyboard.json <project>/preprod/05_timeline.json`

### Gate 7: Commercial Mixed-Media & Camera Choreography (`remotion/src/`)
* **Read**: `references/06-motion-choreography.md` and `references/08-remotion-engineering-rules.md`.
* **Deliverable**: Compose 5–8 literal mixed-media layers per shot using `src/commercial/CommercialPrimitives.tsx`:
  * `PortalZoomStage` for recursive "World-Inside-World" speed-ramp zoom-outs (e.g., fullscreen studio silhouette → NLE program monitor → 3D tilted workspace) with velocity blur
  * `GlowSweepFrame` for animated perimeter light-sweeps + architectural `+` reticles
  * `GlassNodeCard` & `OrthogonalNodeTree` for connected frosted-glass callout hierarchies (never flat SaaS 4-column grids!)
  * `SplitMatchViewport` for pupil-calibrated split-portrait match cuts
  * `StudioCursor` for tactile click-bounce & ripple interactions (strikeouts, exposure faders, `[M] MUTE`, CLI `Render 4K`)
  * `BokehRingWipe` for foreground out-of-focus studio ring-light transitions across cuts

### Gate 8: Psychoacoustic Sound Design (`preprod/07_sound_cues.json`)
* **Read**: `references/07-psychoacoustic-sound-design.md`.
* **Deliverable**: Sync tactile microswitch clicks to every `StudioCursor` press, airy whooshes to every `PortalZoomStage` & `BokehRingWipe`, accelerating ticks to rapid cuts, and an **acoustic `-∞ dB` dead-silence vacuum** immediately preceding the final act reveal.

### Gate 9: The Screening Room Critique (Mandatory Visual QA)
* **Read**: `references/09-screening-room-critic.md`.
* **Script**: Run `python3 scripts/qa_screening_room.py --project <project>/remotion --timeline <project>/preprod/05_timeline.json --out <project>/preprod/qa-screening-sheet.png`.
* **Action**: Visually inspect `qa-screening-sheet.png`! Check initial portal zoom offsets (zero NLE chrome bleed!), safe-zone margins on zoomed callout cards, split-portrait midline registration, cursor tip alignment on clicked buttons, grayscale squint hierarchy, and `maxPurplePct <= 0.25%`. Fix any defect and re-verify before full render.

### Gate 10: Final Render & Broadcast Master (`videos/<name>.mp4`)
* **Action**:
  1. Render picture (`npx remotion render MasterSequence ../out/picture.mp4 --codec=h264 --crf=17 --pixel-format=yuv420p --concurrency=100%`).
  2. Mix & master audio via two-pass EBU R128 `loudnorm` (`-14.0 LUFS`, `-1.0 dBTP`, re-asserting digital zero `0` PCM samples during intentional `-∞ dB` silence drops) and mux with `+faststart`.
  3. Verify streams with `ffprobe` and preserve existing user videos during workspace cleanup.

---

## 12 Non-Negotiable Studio Laws

1. **Zero Neon or Purple "AI Slop" Pigments**: Strictly forbid purple/violet/magenta (`275°–350°`) and hot neon magenta/cyan/green lasers across ALL code, SVGs, and photographs (`purplePct <= 0.25%`).
2. **Fetch & Visually Verify Real Assets First**: Do NOT AI-generate images for everything or build abstract geometric 3D/CSS shapes. Fetch authentic vector brand icons and real online photography when available, and visually inspect every fetched or generated asset (`read_file`) for literal relevance and zero artifacts before using it.
3. **5–8 Literal Mixed-Media Layers Per Shot (Zero Naked Shapes)**: Combine real photography/cutouts, authentic software/brand icons, tactile NLE/terminal UI, frosted node cards, and optical lighting. Never ship rectangular SaaS 4-column card grids or fake sci-fi HUD strings (`CHANNEL 01`, `TC 00:00`, `SIGNAL CORE`).
4. **Heavy Camera Motivation — Zero Parked Text or Objects**: No text or object may sit static on screen for long. Drive continuous spatial energy via recursive `<PortalZoomStage>` zoom-outs, 3D perspective tilts, whip-pan saccades, and focal cortex push-ins.
5. **Preloaded `@remotion/google-fonts` Lock**: Never rely on system `sans-serif`/`serif` (which falls back to `DejaVu Sans` on headless Linux). Preload exact weights in `src/fonts.ts`.
6. **Pure Frame Determinism**: Every visual state must derive purely from `useCurrentFrame()`. Never use CSS `transition`, `@keyframes`, `requestAnimationFrame`, `setTimeout`, or unseeded `Math.random()`.
7. **Monotonically Increasing & Clamped `interpolate()`**: Always pass strictly increasing `inputRange` (`[0, 1]`, reversing `outputRange` when needed) with `{ extrapolateLeft: "clamp", extrapolateRight: "clamp" }`.
8. **Frame-0 Magnetism**: Frame `0` must start *in medias res* at full visual contrast—never fade in from black.
9. **90% Shadow Discipline (One Hero Per Frame)**: When surrounded by competing elements, discipline background elements into deep shadow (`8–15%` luma + soft defocus) so ONE hero viewport commands the room (`|ΔL| >= 0.36`).
10. **Calibrated Eye-Trace & Split-Portrait Registration**: Measure exact pupil & nose-bridge pixel coordinates before match-cutting or splitting faces (`transformOrigin: "50% 37%"`).
11. **Lightweight Optical Compositing**: Never put full-screen SVG `<feTurbulence>` or heavy root CSS `filter:` readbacks over 1080p compositions (stalls headless Skia 25x). Use crisp CSS gradients, GPU transforms, and lightweight `OpticalTexture`.
12. **Mandatory Visual QA & Video Preservation**: Always inspect rendered QA contact sheets with your own eyes before final delivery, and never delete existing rendered videos when cleaning scratch files.
