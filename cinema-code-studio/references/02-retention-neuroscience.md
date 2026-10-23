# 02 — Audience Retention Neuroscience & Pacing Engineering

Audience drop-off is rarely caused by "bad animation"—it is caused by **predictability** (sensory habituation) or **cognitive overload** (split visual/verbal attention). Encode retention scientifically in `preprod/02_retention_map.json`.

---

## 1. The Retention Curve Anatomy

Viewer abandonment follows a steep logarithmic decay in the first 5 seconds, followed by step-function drops at unresolved transitions or information dumps.

### Zone 1: Frame 0 (`t = 0.00s`) — The Scroll/Click Survival Gate
* **Hard Law**: Frame `0` is BOTH the video's first rendered frame and often its **autoplay preview thumbnail**.
* **Never**: Fade in from black, start on an empty background waiting for text to slide in at frame 15, or open with a slow `"Hi guys, welcome back"` greeting.
* **Always**: Start *in medias res*—subject already mid-expression or hero visual already 75% formed with active kinetic energy (`scale` / `camera` already moving on frame 0) and a high-contrast focal anchor (`|ΔL| >= 0.42`).

### Zone 2: The 0–3 Second Triple-Lock Hook
Within the first `90 frames` (at 30fps) / `180 frames` (at 60fps), align all three sensory channels simultaneously:
1. **Visual Hook**: Immediate pattern discrepancy, striking visual proof, or bold kinetic claim (`<= 5 words` on screen).
2. **Auditory Hook**: Clean vocal thesis *or* crisp acoustic transient (`soft-pop` / `sub-impact`) within frames `0–8`—never dead silence at `t = 0`.
3. **Semantic Hook (Value Contract)**: Confirm immediately that the video delivers on the user's expectation, then open a specific gap in their knowledge.

---

## 2. Zeigarnik Open Loops (Curiosity Architecture)

The human brain experiences mild cognitive tension when a causal loop is opened and not yet closed (the **Zeigarnik Effect**). Once you answer the only open question, viewers leave—even if 40 seconds remain.

### Loop Overlapping Formula
Never close Loop A *before* planting the seed of Loop B:

```text
[0s] Open Loop 1 ("Why 90% of edits feel amateur...")
  │
  ├── [14s] Plant Loop 2 ("...and even fixing cuts fails if you miss the eye-trace trap")
  │     │
  ▼     │
[18s] Close Loop 1 (Payoff 1)
        │
        ├── [34s] Plant Loop 3 ("...which unlocks the 1-frame audio trick")
        ▼
      [38s] Close Loop 2 (Payoff 2) ──► [55s] Final Payoff & CTA/Synthesis
```

---

## 3. Pattern-Interrupt Cadence (Habituation Prevention)

Neurons stop firing strongly to unchanging stimuli within `3–5 seconds`. However, **random hyper-cutting every 0.8 seconds causes fatigue**. Balance **Micro-Shifts** (keep visual cortex engaged) with **Macro-Resets** (re-awaken attention):

| Format | Micro-Shift Interval | Macro-Reset Interval | Allowed Breath Hold (Thesis Reveal) |
| :--- | :--- | :--- | :--- |
| **Short-Form (`15–60s` Reels/Shorts/TikTok)** | Every `1.6s – 3.0s` | Every `10s – 14s` | Up to `3.6s` (must have subtle camera drift) |
| **Product Promo / Launch (`60–150s`)** | Every `2.2s – 4.0s` | Every `18s – 25s` | Up to `4.5s` on hero product shot |
| **Long-Form Explainer / Essay (`3–15m`)** | Every `3.5s – 6.5s` | Every `30s – 45s` | Up to `7.0s` on emotional story beats |

### Valid Micro-Shifts (Choose with Motivation)
* Speaker angle/scale change (`1.00x` → `1.14x` eye-anchored push)
* Contextual callout badge or kinetic keyword lockup
* Camera rig pan to adjacent node on the 2.5D canvas
* B-roll cut illustrating the concrete consequence of the spoken claim

### Valid Macro-Resets
* Polarity inversion (dark obsidian environment flips cleanly to tactile paper-white canvas for a counter-argument)
* Full-screen motion graphic takeover replacing talking head
* Musical dropout (12 frames of dead silence before a major reveal) + tempo shift

---

## 4. Cognitive Load & Mayer's Dual-Channel Law

Richard Mayer's Cognitive Theory of Multimedia Learning establishes that humans process **visual/spatial** information and **auditory/verbal** information in two separate, capacity-limited channels:

1. **Redundancy Penalty (The Caption Trap)**:
   * When a speaker is talking on camera (low visual complexity), **word-highlighted captions boost retention** (especially on mobile).
   * When the screen displays a **data chart, architecture diagram, code block, or multi-label UI mockup** (`> 6 words` of graphic text), showing bottom subtitles simultaneously forces the viewer's eyes to ping-pong vertically. Comprehension plunges.
   * **Rule**: Set `"captionsActive": false` in `04_storyboard.json` on every dense graphic shot (`cognitiveLoadScore >= 2`).

2. **Saccadic Reading-Speed Floor**:
   * Viewers read unfamiliar video overlays while listening at roughly **3.2 words per second**, plus `0.55s` of visual acquisition latency.
   * Minimum shot/hold duration for text on screen:
     ```
     min_duration_sec = (on_screen_word_count / 3.2) + 0.55
     ```
   * Example: A 7-word headline requires at least `(7 / 3.2) + 0.55 = 2.74 seconds`. Flashing 12 words for 1.5 seconds frustrates viewers and causes immediate drop-off.

3. **Three-Chunk Working Memory Limit**:
   * Never reveal a 7-box flowchart all at once. Reveal **1 node**, dim it to `45%` opacity as context, reveal **node 2**, dim it, and highlight **node 3**. Guide attention sequentially.
