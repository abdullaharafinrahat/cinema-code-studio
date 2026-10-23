# 04 — Editing Psychology: Walter Murch's Rule of Six & Invisible Craft

Great editing feels inevitable—the cut happens at the exact millisecond the viewer's brain *wants* a new perspective. Encode these film-editing principles into `preprod/05_timeline.json`.

---

## 1. Walter Murch's Rule of Six (Decision Hierarchy)

When two editing rules conflict, resolve them strictly by Walter Murch's weighted hierarchy from *In the Blink of an Eye*:

1. **Emotion (51%)**: Does this cut change or intensify how the audience *feels*? If a slightly imperfect continuity cut preserves a raw, authentic vocal crack or dramatic pause, **keep Emotion** over mechanical neatness.
2. **Story (23%)**: Does this shot advance the narrative thesis or open/close a curiosity loop? Cut anything purely ornamental—even your prettiest animation.
3. **Rhythm (10%)**: Does the cut land at a musically and linguistically natural inflection point?
4. **Eye-Trace (7%)**: Where is the viewer's fovea pointed on the outgoing frame vs. the incoming frame?
5. **2D Screen Plane (5%)**: Are directional vectors and screen axes respected?
6. **3D Spatial Continuity (4%)**: Does the virtual room/canvas feel spatially coherent?

Together, **Emotion + Story + Rhythm = 84%** of an edit's success.

---

## 2. Eye-Trace Mathematics (`audit_eye_trace.py`)

Human foveal vision covers only **~2 degrees** of visual angle. After an unexpected cut to a far corner of the frame, saccadic eye movement + visual re-orientation takes `200–280ms` (6–17 frames!). On a fast 1.5-second shot, wasting 0.25s hunting for the focal point makes the edit feel chaotic and exhausting.

### The Euclidean Jump Rule
Given outgoing `exitFocalPoint = (x1, y1)` and incoming `entryFocalPoint = (x2, y2)`:
```
jump_distance = sqrt((x2 - x1)^2 + (y2 - y1)^2)
```
* **`jump_distance <= 0.18` (Green Zone)**: Seamless hard cut! The incoming hero lands virtually inside the viewer's existing foveal focus.
* **`0.18 < jump_distance <= 0.32` (Amber Zone)**: Acceptable **only** on slow narrative resets (`shot duration >= 3.0s`) OR when accompanied by a directional audio pan/whoosh cue.
* **`jump_distance > 0.32` (Red Zone — Jarring Cut)**: Forbidden on a hard cut! You must either:
  1. Re-compose Shot `n+1` so its hero enters near `(x1, y1)`, OR
  2. Animate a **Motion Bridge** in Shot `n` (e.g., an SVG connector line, cursor, or `DIRECTIONAL_WIPE` sweeping from `(x1, y1)` toward `(x2, y2)` so the eye physically rides the movement).

---

## 3. Split Edits: J-Cuts & L-Cuts (Banishing "Blocky" Cuts)

Amateur code editors cut audio and video on the exact same frame (`videoStart == audioStart`) on every scene. That creates rigid, "brick-wall" scene boundaries.

### J-Cut (Audio Leads Video by `6–14 frames` / `0.20–0.45s`)
* **How it works**: While Shot A is still finishing visually, the first word or rising sound of Shot B begins. Then the picture cuts to Shot B right on the stressed syllable.
* **Psychological effect**: Propels the viewer forward—the brain hears a new voice/space and *subconsciously asks to see it*, making the visual cut feel like answering a wish.
* **Use when**: Transitioning from a visual hook into an explanation, or stepping into a new chapter.

### L-Cut (Audio Trails Video by `10–20 frames` / `0.33–0.65s`)
* **How it works**: Speaker finishes an emotional sentence while we have *already* cut visually to the B-roll proof, reaction, or motion-graphic consequence—or vice versa (speaker's voice trails over the opening frames of the graphic takeover).
* **Psychological effect**: Binds spoken claim and visual proof into a single continuous thought.
* **Use when**: Launching full-screen motion graphic takeovers over a talking-head track.

---

## 4. Speech Cutting, Breath Psychology & Jump-Cut Masking

When cutting raw spoken footage using `words.json` from `scripts/transcribe_and_diarize.py`:

1. **Never Zero-Clip Consonants**: Plosives (`p, b, t, k`) and fricatives (`s, sh, f`) start `40–70ms` before Whisper's nominal word boundary. Always apply:
   * `preSpeechPadMs = 85` (`~3–5 frames`)
   * `postSpeechPadMs = 120` (`~4–7 frames`)
2. **Distinguish Dead Air vs. Dramatic Breath**:
   * **Cut**: Mid-sentence `"uh"`, `"um"`, false starts, throat clears, and blank cognitive pauses `> 400ms` during routine exposition.
   * **Preserve**: A clean `180–300ms` inhale immediately before the climax or most vulnerable/important sentence of the video. Stripping 100% of breaths creates claustrophobic "AI-chop" fatigue.
3. **Masking Same-Angle Jump Cuts**:
   Whenever you cut dead air between two sentences from the same camera setup, pick ONE of three invisible editors' masks:
   * **Mask A (Scale Punch)**: Alternate `scale: 1.00` ↔ `scale: 1.15`, anchored strictly to the speaker's eye midpoint `(eyeX, eyeY)` from `auto_reframe_eyes.py` so the eyes stay locked at `y = 0.35` (zero vertical head-bob!).
   * **Mask B (B-Roll / Graphic Bridge)**: Cover the seam with `1.8–3.5s` of motion graphics or B-roll while keeping the audio cut clean underneath.
   * **Mask C (Framing Crop Shift)**: Reframe from a wide studio two-thirds shot to an intimate tight crop on emotional statements.

---

## 5. Match Cuts & Velocity Continuity

The highest-craft transition between live footage and motion graphics is the **Graphic / Motion Match Cut**:
* **Shape Match**: A circular coffee mug / camera lens in footage dissolves in `6 frames` into a circular radial chart at the exact same `[x, y]` radius.
* **Velocity Match**: If Scene A pushes inward (`scale: 1.0 → 1.35`, accelerating over the last `10 frames`), Scene B **starts** at `scale: 0.82 → 1.00` decelerating with a damped spring. The shared inward Z-velocity makes two completely different worlds feel physically fused.
