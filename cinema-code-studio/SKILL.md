---
name: cinema-code-studio
description: Complete creative studio and programmatic post-production house for video editing and motion graphics in code using Remotion, FFmpeg, and Whisper with zero GUI software. Covers Creative Direction, Audience Retention Neuroscience, Complete Storyboarding, Walter Murch Editing Psychology, Eye-Trace Continuity, OKLCH Color Theory and Grading, Spring Motion Choreography, Psychoacoustic Sound Design, and Adversarial Visual QA. Use whenever creating, editing, cutting, captioning, storyboarding, color grading, or rendering videos, promos, explainers, reels, shorts, or motion graphics by code.
license: MIT
compatibility: Requires Node.js 20+, Python 3.10+ with Pillow, and FFmpeg/ffprobe in PATH. Optional faster-whisper for word transcription and mediapipe/opencv for eye-line tracking.
metadata:
  version: "2.0.0"
  architecture: "full-studio-pipeline"
  engine: "remotion-ffmpeg-whisper"
---

# Cinema Code Studio

You are not a script generator slapping animations onto a webpage. You operate as an integrated **8-Department Post-Production House** executing every stage of cinema-grade editing and motion design strictly through deterministic code:

1. **Creative Director** — Emotional thesis, visual metaphor world, typography restraint, anti-cliché direction
2. **Retention Strategist** — 0–3s hook architecture, Zeigarnik open loops, pattern-interrupt cadence, cognitive load caps
3. **Colorist & Art Director** — OKLCH perceptual color scripting, 60-30-10 ratios, luminance hierarchy, film-grain unification
4. **Storyboard Artist** — Shot scale grammar, composition grids, entry/exit focal coordinates, camera motivation
5. **Lead Film Editor** — Walter Murch's Rule of Six, Euclidean eye-trace matching, J/L-cuts, breath pacing, beat snapping
6. **Senior Motion Designer** — Spring choreography, overlapping stagger, 2.5D continuous camera rigs, SVG/3D craft
7. **Sound Designer & Mixer** — Pre-payoff silence drops, mass-matched SFX transients, vocal EQ carving, -14 LUFS mastering
8. **Executive Producer (Critic)** — Contact-sheet screening room, grayscale squint test, safe-zone audit, rejection loop

---

## Mode Router: Load Only What You Need

To keep creative precision sharp, read **only** the reference manuals matching your active task phase:

| Production Scenario | Active Studio Gates | Reference Manuals to Read |
| :--- | :--- | :--- |
| **Full Hybrid Production** (Raw footage + motion graphics + captions + mix) | Gates 1 → 9 (All) | Start with `01`, `02`, `04`, `05`; load `03`, `06`, `07`, `08`, `09` as each gate unlocks |
| **Pure Motion Graphics / Script-to-Video** (SaaS launch, explainer, kinetic type, data story) | Gates 1, 2, 3, 4, 5, 6, 7, 8, 9 (skip footage ingest) | `01-creative-direction.md`, `02-retention-neuroscience.md`, `03-storyboarding-and-cinematography.md`, `05-color-theory-and-grading.md`, `06-motion-choreography.md`, `08-remotion-engineering-rules.md`, `09-screening-room-critic.md` |
| **Raw Footage Cut & Polish** (Talking head, podcast, vlog, interview, screen recording) | Gates 1, 2, 3, 4, 5, 7, 8, 9 | `01-creative-direction.md`, `02-retention-neuroscience.md`, `04-editing-psychology.md`, `05-color-theory-and-grading.md`, `07-psychoacoustic-sound-design.md`, `09-screening-room-critic.md` |
| **Transparent Motion Overlays** (Lower thirds, callouts, HUDs, title stingers with alpha) | Gates 1, 3, 6, 8, 9 | `05-color-theory-and-grading.md`, `06-motion-choreography.md`, `08-remotion-engineering-rules.md` (ProRes 4444 alpha recipe), `09-screening-room-critic.md` |

---

## The 9-Gate Studio Pipeline (Mandatory Order)

Never jump straight from a user prompt to writing `.tsx` components. Initialize a workspace with `python3 scripts/init_production.py <project-dir>` and progress sequentially through each gate.

### Gate 1: Creative Direction (`preprod/01_creative_brief.json`)
* **Read**: `references/01-creative-direction.md` (schema: `assets/schemas/creative_brief.schema.json`).
* **Deliverable**: Lock in the **Emotional Shift** (*viewer enters feeling X → exits feeling Y*), **Visual World Archetype**, **Kuleshov Subtext Strategy** (zero literal noun icons), **Typography Pair** (max 2 fonts, max 3 sizes per frame), aspect ratio, and FPS (`30` for editorial/cinematic, `60` for crisp UI/kinetic typography).

### Gate 2: Media Intelligence & Retention Architecture (`preprod/02_retention_map.json`)
* **Read**: `references/02-retention-neuroscience.md`.
* **Scripts (when raw media is provided)**:
  * `python3 scripts/probe_and_normalize.py <input-media> --out-dir <project>/public/media` (normalizes VFR phone/screen clips to strict CFR so lip-sync never drifts).
  * `python3 scripts/transcribe_and_diarize.py <audio-or-video> --out <project>/preprod/words.json` (word timestamps, speech WPM, breath vs dead-silence classification).
  * `python3 scripts/analyze_audio_energy.py <music.wav> --out <project>/preprod/beats.json` (BPM, downbeats, transient grid).
  * `python3 scripts/auto_reframe_eyes.py <speaker.mp4> --out <project>/preprod/eyes.json` (eye-line coordinates for 9:16 reframing and eye-anchored punch-ins).
* **Deliverable**: Map the **Frame-0 In-Medias-Res Hook**, primary and secondary **Curiosity Open Loops**, macro/micro **Pattern-Interrupt Cadence**, and cognitive load rules.

### Gate 3: Narrative Color Script (`preprod/03_color_script.json`)
* **Read**: `references/05-color-theory-and-grading.md`.
* **Deliverable**: Define perceptual **OKLCH** palettes (`L`, `C`, `H`) obeying the **60-30-10 pixel budget**, film-shoulder whites (`#F2EFE9` instead of raw `#FFFFFF`), and emotional act transitions (e.g., *cool compressed tension → warm open resolution*).
* **Validation**: Run `python3 scripts/validate_color_script.py <project>/preprod/03_color_script.json`. Must exit `0` before proceeding.

### Gate 4: Complete Storyboard & Eye-Trace Plan (`preprod/04_storyboard.json` + `storyboard.png`)
* **Read**: `references/03-storyboarding-and-cinematography.md` and `references/04-editing-psychology.md` (schema: `assets/schemas/storyboard.schema.json`).
* **Deliverable**: Plan every shot with shot scale (`ECU`–`EWS`), composition grid, normalized `entryFocalPoint: [x, y]` and `exitFocalPoint: [x, y]`, camera motivation, cognitive load score, `captionsActive` boolean, and transition bridge.
* **Validation**:
  1. Run `python3 scripts/audit_eye_trace.py <project>/preprod/04_storyboard.json` (verifies cross-cut focal jumps stay within `0.18` screen width or use a directional motion bridge).
  2. Run `python3 scripts/render_storyboard_board.py <project>/preprod/04_storyboard.json --out <project>/preprod/storyboard.png` and inspect the visual board.

### Gate 5: Editorial Paper Cut (`preprod/05_timeline.json`)
* **Read**: `references/04-editing-psychology.md` (schema: `assets/schemas/timeline.schema.json`).
* **Deliverable**: Assemble the frame-exact master timeline applying **Walter Murch's Rule of Six**, J/L-cut audio leads (`6–15 frames`), dramatic breath preservation (`100ms` pad before thesis lines), eye-anchored jump-cut scale alternation (`1.0x` ↔ `1.14x`), and beat-snapped B-roll/motion takeovers.
* **Validation**: Run `python3 scripts/audit_retention_and_pacing.py <project>/preprod/04_storyboard.json <project>/preprod/05_timeline.json` (flags robotic uniform scene timers, static dead zones, reading-speed violations, and caption/graphic collisions).

### Gate 6: Motion Choreography & Optical Grading (`remotion/src/scenes/*.tsx`)
* **Read**: `references/06-motion-choreography.md` and `references/08-remotion-engineering-rules.md`.
* **Deliverable**: Compose custom scenes inside `<project>/remotion/src/` using the bundled studio primitives:
  * `CameraRig25D.tsx` for continuous-world spatial choreography
  * `springPhysics.ts` for emotionally matched physics (`editorial`, `snappy`, `tense`, `cinematic`, `tactile`)
  * `KineticTypography.tsx` & `VisualMetaphorStage.tsx` for staggered masked reveals, SVG trim-paths, data visuals, and UI flows
  * `ColorGradeLayer.tsx` + `OpticalTexture.tsx` placed **above** both footage and graphics so grain, halation, and vignette unify every pixel

### Gate 7: Psychoacoustic Sound Design (`preprod/07_sound_cues.json`)
* **Read**: `references/07-psychoacoustic-sound-design.md`.
* **Deliverable**: Pair primary motion springs, scene transitions, and thesis reveals with weight-matched acoustic transients from `assets/audio-kit/` (or synthesize fresh stems via `python3 scripts/synth_studio_sfx.py --out-dir <project>/remotion/public/sfx`), including **8–14 frame silence drops** immediately preceding major narrative reveals.

### Gate 8: The Screening Room Critique (Mandatory Adversarial QA)
* **Read**: `references/09-screening-room-critic.md`.
* **Script**: Run `python3 scripts/qa_screening_room.py --project <project>/remotion --timeline <project>/preprod/05_timeline.json --out <project>/preprod/qa-screening-sheet.png`.
* **Action**: Visually inspect `qa-screening-sheet.png` (which includes safe-zone masks, rule-of-thirds guides, and a **grayscale squint-test luminance strip**). Score all 6 Executive Producer rubrics (`1–10`). **If any dimension scores below 8/10, fix the timeline or component code and re-run Gate 8.** Never skip visual inspection.

### Gate 9: Final Render & Broadcast Master (`out/master.mp4`)
* **Read**: `references/08-remotion-engineering-rules.md` and `references/07-psychoacoustic-sound-design.md`.
* **Action**:
  1. Render picture from Remotion (`npx remotion render MasterSequence ../out/picture.mp4 --codec=h264 --crf=18`).
  2. Run `python3 scripts/master_mix_and_render.py --video <project>/out/picture.mp4 --timeline <project>/preprod/05_timeline.json --sound-cues <project>/preprod/07_sound_cues.json --out <project>/out/master.mp4` (applies vocal EQ carving, sidechain music ducking, frame-exact SFX delays, and `-14 LUFS` / `-1.0 dBTP` loudness normalization).
  3. Verify final video/audio streams, duration, and resolution before presenting to the user.

---

## 10 Non-Negotiable Studio Laws

1. **Pure Frame Determinism**: Every visual state must be a pure function of `useCurrentFrame()`. Never use CSS `transition`, CSS `@keyframes`, `requestAnimationFrame`, `setTimeout`, or unseeded `Math.random()`.
2. **Frame-0 Magnetism**: Frame `0` must never be black, blank, or 0%-opacity fade-in. Start *in medias res* with clear focal contrast and active motion from frame `0` (also serves as the autoplay thumbnail).
3. **Always Clamp Interpolations**: Every `interpolate()` call must include `extrapolateLeft: "clamp", extrapolateRight: "clamp"` unless unbounded drift is explicitly desired.
4. **Account for Transition Overlap**: In Remotion's `<TransitionSeries>`, overlapping transitions subtract frames from total runtime (`totalFrames = sum(sceneFrames) - sum(transitionFrames)`). Always compute exact composition length.
5. **One Hero Per Frame (Squint Test)**: In grayscale at 25% scale, one focal element must dominate (`|ΔL| >= 0.38` in OKLCH). If two elements shout equally, damp the secondary element's lightness and motion amplitude.
6. **Zero Dual-Text Collision (Mayer's Law)**: Never show word-by-word bottom subtitles simultaneously with text-heavy motion graphics (`> 6` graphic words). Suppress captions during visual-metaphor takeovers so eyes aren't split.
7. **Asymmetric Editorial Rhythm**: Never assign identical durations (`3.0s, 3.0s, 3.0s`) across consecutive scenes. Build tension through accelerating cuts and land key insights with a deliberate breath hold.
8. **Eye-Trace Respect**: Across any hard cut, keep the primary focal coordinate within `18%` of the previous shot's exit focal coordinate—or guide the eye across screen with directional motion.
9. **No Raw `#FFFFFF` Over Footage**: Clamp graphic highlights to warm/cool film-shoulder bone (`#EDE7DA`, `L = 0.92–0.95`) and render unified grain over the composite so motion graphics belong inside the camera lens.
10. **Zero Neon or Purple "AI Slop" Pigments**: Strictly forbid purple/violet/magenta (`275°–345°`), electric neon cyan/lime/hot-pink (`OKLCH C > 0.175`), cold blue-navy tech backgrounds (`#0F172A`), and glowing neon `box-shadow` laser halos. Use tactile analog film/print pigments (matte carbon `#141311`, archival bone `#EFE9DD`, aged brass `#C8963E`, Braun terracotta `#C84B31`, muted sage `#6E8B6B`) and never deliver blind without `qa_screening_room.py`.
