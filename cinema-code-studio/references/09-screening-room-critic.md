# 09 — The Screening Room: Adversarial QA & Executive Producer Critique

Because code-driven editing happens without a live GUI timeline monitor, **visual defects hide silently inside valid TypeScript code** (a headline wrapping awkwardly onto 3 lines, a TikTok right-rail icon covering a metric, two elements competing at equal luminance, or a black gap at a transition seam).

At **Gate 8**, step out of the "Creator" mindset and assume the role of an unforgiving **Executive Producer** reviewing dailies in the Screening Room.

---

## 1. Running the Screening Room Suite

Execute the automated inspection suite before any full-length render:

```bash
python3 scripts/qa_screening_room.py \
  --project <project>/remotion \
  --timeline <project>/preprod/05_timeline.json \
  --out <project>/preprod/qa-screening-sheet.png
```

Then **visually inspect `<project>/preprod/qa-screening-sheet.png`** (do not merely check exit code!). The generated sheet displays:
1. **Critical Keyframes** (Frame `0` hook, settled peak of every shot, and mid-transition frames) with burned-in `[Frame # | Timecode | Shot ID]`.
2. **Rule-of-Thirds & Platform Safe-Zone Overlays** (highlighting UI danger regions on `9:16` Shorts/Reels/TikTok or `16:9` title-safe margins).
3. **Bottom Grayscale "Squint Strip"** showing every sampled frame desaturated at miniature scale so luminance hierarchy flaws jump out immediately.

---

## 2. The 6-Axis Executive Producer Scorecard (`1–10`)

Score the contact sheet honestly across all six studio pillars. **Every pillar must score `>= 8/10` to authorize final master rendering.**

### Axis 1: Frame-0 Hook Magnetism
* **Pass (`8–10`)**: Frame `0` looks like a designed poster—clear focal subject, full tonal contrast, immediate narrative intrigue, zero blank fade-in.
* **Fail (`< 8`)**: Frame `0` is dark, mid-blur, empty background, or tiny unreadable label.
* **Surgical Fix**: Offset initial entrance spring by `+12 frames` at `S01` (`spring({ frame: frame + 12, ... })`) so Frame `0` starts already 80% revealed and moving!

### Axis 2: Squint-Test Focal Hierarchy
* **Pass (`8–10`)**: Looking at the grayscale strip at the bottom of `qa-screening-sheet.png`, your eye goes to **one unmistakable hero** per panel.
* **Fail (`< 8`)**: Uniform muddy mid-grays, or 4 bright cards shouting at identical brightness.
* **Surgical Fix**: Dim supporting containers/labels (`opacity: 0.55` or lower OKLCH `L` to `0.58`) and reserve high lightness/chroma strictly for the active element.

### Axis 3: Typography Breathing Room & Clipping Audit
* **Pass (`8–10`)**: Clean 1–2 line breaks (`textWrap: "balance"`), generous `>= 40%` negative space, zero clipped descenders (`g, j, p, y`), zero text colliding with safe-zone borders.
* **Fail (`< 8`)**: Orphan single word on line 3, cramped card padding, text touching frame edge or `9:16` right/bottom UI danger masks.
* **Surgical Fix**: Reduce copy length (tighten words before shrinking font below legibility floor!), increase container padding, add `textWrap: "balance"`, and clamp inside `safeZones.ts`.

### Axis 4: Eye-Trace & Transition Seam Continuity
* **Pass (`8–10`)**: Mid-transition frames look clean (no double-exposed text soup!) and adjacent shots keep focal gaze cohesive.
* **Fail (`< 8`)**: Overlapping unreadable text during cross-dissolves, or 1-frame black flash between clips.
* **Surgical Fix**: Replace sloppy cross-dissolves on text scenes with clean hard cuts, directional mask wipes, or camera-pan transitions; check `<TransitionSeries>` overlap frame math.

### Axis 5: Color Cohesion, Zero Purple/Neon & Mixed-Media Registration
* **Pass (`8–10`)**: `maxPurplePct <= 0.25%` across all sampled frames; recursive `<PortalZoomStage>` initial frames show 0px of surrounding NLE/device chrome bleed; zoomed callout cards stay 100% inside `1920x1080` safe margins; split-portrait match cuts align pupils & nose bridge within `1–2px`; `StudioCursor` tips land dead-center on clicked buttons (`[M] MUTE`, `Render 4K`).
* **Fail (`< 8`)**: Any purple/violet/neon contamination, clipped side callout pills during zoom-ins, misaligned split-face halves, or cursor clicking empty air next to a button.
* **Surgical Fix**: Scale only the central hero ring/subject while keeping side callout cards anchored in safe zones, multiply inner viewport center offsets by `initialScale`, lock split-bar oscillation within `±1%` of the `50%` nose bridge, and re-verify fixed frames visually!

### Axis 6: Cognitive Load & Caption Discipline
* **Pass (`8–10`)**: Captions appear cleanly on speaker shots and step out of the way on dense data/UI takeovers.
* **Fail (`< 8`)**: Bottom karaoke captions colliding with chart axes or forcing dual-reading fatigue.
* **Surgical Fix**: Set `"captionsActive": false` on high-density storyboard shots and verify `audit_retention_and_pacing.py` passes cleanly.
