# 07 — Psychoacoustic Sound Design, SFX Weight & Broadcast Mastering

Viewers forgive 720p video, **never bad audio**—and "silent" motion graphics feel weightless because the human brain expects moving mass to displace air. Plan every sonic event in `preprod/07_sound_cues.json` and execute mixing via `scripts/master_mix_and_render.py`.

---

## 1. The Power of Strategic Silence (Pre-Payoff Drop)

Wall-to-wall music + nonstop whooshes numb the auditory cortex. The single strongest retention weapon in post-production is the **Pre-Payoff Silence Drop**:

* **How to execute**: `8 to 14 frames` (`0.25s–0.45s`) immediately before the video's biggest visual reveal or thesis punchline, **cut or duck the music bed by `-24 dB`** accompanied by a short `tension-riser.wav` ending cleanly `2 frames` before the cut.
* On the exact reveal frame: drop `sub-impact.wav` + bring the beat or crisp voice back in.
* Contrast makes the reveal hit `3x` harder without raising peak volume.

---

## 2. Physics-Matched SFX Taxonomy (`assets/audio-kit/`)

Match sound **spectral frequency** to visual **mass and screen area**:

| Bundled Sound File | Spectral Weight | Visual Event Match | Frame Alignment Rule |
| :--- | :--- | :--- | :--- |
| `micro-click.wav` | High-frequency transient (`3–8 kHz`, `-14 dB`) | Cursor click, terminal keypress, counter tick, pill toggle | Exact frame of contact (`offset: 0`) |
| `soft-pop.wav` | Warm mid-transient (`400 Hz – 2 kHz`, `-11 dB`) | Badge entrance, callout card settle, chart dot pop | Peak velocity frame (`+2f` after spring start) |
| `airy-whoosh.wav` | Filtered noise sweep (`250 Hz – 4 kHz`, `-12 dB`) | Camera pan, directional wipe, fast slide-in | Peak of sweep lands **on the cut center frame** (start `6f` early!) |
| `sub-impact.wav` | Deep low-end thud (`45–110 Hz`, `-8 dB`) | Hero title lock, polarity inversion, macro chapter drop | Exact frame of visual impact (`offset: 0`) |
| `tension-riser.wav` | Pitch/filter swell (`1.2s` build, `-10 dB`) | Dolly-in anticipation before major reveal or match cut | Ends `-2 frames` before target cut frame |

### Anti-Spam Restraint Rule
* **Never attach an SFX to every staggered line or every bullet point.** If 4 items stagger in over `16 frames`, place **one** `airy-whoosh.wav` on the container lead and **one** `soft-pop.wav` on the final hero badge—never 4 overlapping machine-gun whooshes.
* Keep minimum gap between same-category whooshes `>= 1.5 seconds`.

---

## 3. Frequency Carving & Sidechain Ducking (`master_mix_and_render.py`)

When music and human speech play together at static volumes, instruments in the **`1.5 kHz – 4.0 kHz` vocal intelligibility band** mask consonants, forcing viewers to strain.

Our automated FFmpeg mastering pipeline applies a 4-stage broadcast chain:
1. **Voice Chain**:
   * `highpass=f=80` (removes room rumble / plosive mud)
   * `equalizer=f=280:width_type=q:width=1.5:g=-2.5` (clears boxiness)
   * `equalizer=f=3200:width_type=q:width=1.2:g=2.0` (crisp consonant presence)
   * `acompressor=threshold=-18dB:ratio=3:attack=8:release=120` (evens out quiet vs loud words)
2. **Music Bed EQ Pocket + Sidechain Ducking**:
   * Carves `-3.5 dB` around `2600 Hz` on the music stem so vocals sit *inside* the music rather than fighting on top of it.
   * `sidechaincompress` triggered by the voice stem automatically ducks music by `-9 dB` within `15ms` when speech begins and smoothly blooms music back up over `450ms` during dramatic pauses or B-roll showcases!
3. **Frame-Exact SFX Bus**:
   * Converts every cue's `frame` into exact milliseconds (`ms = round(frame * 1000 / fps)`) and schedules it with FFmpeg `adelay={ms}|{ms}` + per-cue `volume={gainDb}dB`.
4. **Broadcast Loudness Normalization (`EBU R128 / ITU-R BS.1770`)**:
   * Targets **`-14.0 LUFS` integrated loudness** and **`-1.0 dBTP` true-peak ceiling** (the universal sweet spot for YouTube, Reels, TikTok, LinkedIn, and web players without platform limiter distortion).
