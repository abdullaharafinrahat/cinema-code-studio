# Cinema Code Studio

A full-craft programmatic video editing, cinematography, motion graphics, OKLCH analog color grading, and EBU R128 psychoacoustic mastering **Agent Skill** built on **Remotion (React/TypeScript) + FFmpeg + Whisper/Python** — zero GUI timelines required.

![Executive Producer QA Screening Sheet](examples/the-invisible-cut/preprod/qa-screening-sheet.png)

---

## Core Architecture & Studio Laws

Every production runs through a **9-Gate Deterministic Pipeline** governed by `cinema-code-studio/SKILL.md`:

1. **Gate 0 — Media & Transcript Intelligence** (`probe_and_normalize.py`, `transcribe_and_diarize.py`, `analyze_audio_energy.py`)
2. **Gate 1 — Creative Direction & Visual World** (`01_creative_brief.json`)
3. **Gate 2 — Audience Retention & Pacing Architecture** (`02_retention_map.json`)
4. **Gate 3 — Perceptual OKLCH Analog Color Script** (`validate_color_script.py`)
   - **Anti-AI-Slop Pigment Law**: Mathematically bans purple/violet hues (`275°–345°`), synthetic neon chroma (`OKLCH C > 0.175`), electric cyan, cold blue-slate dark backgrounds, and outer-glow laser `box-shadow` halos in favor of warm matte carbon, smoked basalt, silver-gelatin bone, aged Kodak brass, matte Braun terracotta, and unbleached archival museum paper.
5. **Gate 4 — Storyboard & Walter Murch Eye-Trace Continuity** (`audit_eye_trace.py`, `render_storyboard_board.py`)
6. **Gate 5 — Master Frame-Accurate Timeline Compilation** (`audit_retention_and_pacing.py`)
7. **Gate 6 — Deterministic Remotion Choreography** (`useCurrentFrame()` + `spring()` physics, zero CSS transitions)
8. **Gate 7 — Psychoacoustic Sound Design & Mastering** (`master_mix_and_render.py` — 65% pre-lap whooshes, sidechain VO ducking, `-14.0 LUFS / -1.0 dBTP`)
9. **Gate 8 — Executive Producer Visual QA Screening Room** (`qa_screening_room.py` — rule-of-thirds, safe-zone overlays, luminance clipping telemetry, and 25% grayscale squint strip)

![Storyboard & Eye-Trace Continuity Sheet](examples/the-invisible-cut/preprod/storyboard.png)

---

## Repository Structure

```text
├── cinema-code-studio/                 # Complete Agent Skill source (SKILL.md + Tier-3 resources)
│   ├── SKILL.md                        # Orchestrator & 10 Non-Negotiable Studio Laws
│   ├── references/                     # 9 deep manuals (Eye-Trace, OKLCH, Retention, Audio, Remotion)
│   ├── scripts/                        # 12 zero-dependency Python validators, renderers & mixers
│   └── assets/
│       ├── remotion-studio/            # Reusable Remotion 4.0.242 TypeScript template & primitives
│       ├── audio-kit/                  # 48kHz broadcast Foley/SFX kit
│       ├── schemas/                    # Strict JSON Schemas for brief, storyboard & timeline
│       └── examples/                   # Validated analog OKLCH & eye-trace reference JSONs
├── cinema-code-studio.skill            # Packaged installable .skill archive
└── examples/
    └── the-invisible-cut/              # Sample 1080p60 showcase film ("The Invisible Cut")
        ├── preprod/                    # Brief, retention map, color script, storyboard & QA sheets
        └── remotion/                   # Custom scene choreography (InvisibleCutScenes.tsx)
```

---

## Quickstart

### 1. Scaffold a New Production
```bash
python3 cinema-code-studio/scripts/init_production.py ./my-film --fps 60 --aspect 16:9
```

### 2. Run Studio Validators & Visual Boards
```bash
python3 cinema-code-studio/scripts/validate_color_script.py examples/the-invisible-cut/preprod/03_color_script.json
python3 cinema-code-studio/scripts/audit_eye_trace.py examples/the-invisible-cut/preprod/04_storyboard.json
python3 cinema-code-studio/scripts/audit_retention_and_pacing.py \
  examples/the-invisible-cut/preprod/04_storyboard.json \
  examples/the-invisible-cut/preprod/05_timeline.json
```

### 3. Screen Critical Frames & Render Master
```bash
cd examples/the-invisible-cut/remotion
npm install
npm run typecheck
npx remotion render MasterSequence ../out/picture.mp4 --codec=h264 --crf=18 --pixel-format=yuv420p
```
