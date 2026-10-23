# 06 — Motion Choreography: Physics, Stagger & the 12 Principles in Code

Motion is body language. A linear `interpolate(frame, [0, 20], [0, 100])` slides like a robotic conveyor belt. Senior motion designers choreograph **mass, tension, anticipation, overlapping action, and settle**.

---

## 1. Emotional Spring Profiles (`src/tokens/springPhysics.ts`)

Never invent arbitrary `spring()` numbers per component. Choose from calibrated physical profiles based on the **mass and emotional intent** of the element:

| Preset Name | Remotion `config` | Overshoot | Feel & Ideal Use Case |
| :--- | :--- | :---: | :--- |
| **`editorial`** | `{ mass: 1.0, damping: 26, stiffness: 185, overshootClamping: false }` | `0%` | Silk-smooth deceleration, zero bounce. Headlines, luxury cards, serious data. |
| **`snappy`** | `{ mass: 0.65, damping: 18, stiffness: 290, overshootClamping: false }` | `~2%` | Crisp, immediate UI response. Cursors, pills, tooltips, terminal lines (`60fps` shines). |
| **`tactile`** | `{ mass: 0.85, damping: 14, stiffness: 240, overshootClamping: false }` | `~7%` | Physical micro-snap like a mechanical switch. Callout badges, active toggles, checkmarks. |
| **`heavyCinema`** | `{ mass: 2.1, damping: 36, stiffness: 85, overshootClamping: false }` | `0%` | High inertia dolly rig. `<CameraRig25D>` pans, world zooms, architectural slabs. |
| **`tensionSnap`** | `interpolate` w/ `Easing.bezier(0.85, 0, 0.15, 1)` | `0%` | Slow coil of energy → whip-fast midpoint → sharp lock. Polarity flips & wipe cuts. |

---

## 2. Translating Classic Animation Principles to Remotion

### Principle A: Anticipation (`3–5 frames` before major action)
Before an element launches upward or zooms forward, pull it slightly *backward* (`scale: 1.0 → 0.965` or `y: 0 → +6px` over `4 frames`), then fire the main spring on frame `5`. That tiny wind-up telegraphs physical force to the viewer's eye.

### Principle B: Overlapping Action & Choreographed Stagger
Nothing in nature arrives on the exact same millisecond. When revealing a composite UI card or data scene, enforce a strict **Lead → Core → Trail** stagger:
* `Frame +0`: Background container / hairline border expands (`editorial` spring)
* `Frame +4`: Eyebrow / category tag wipes in
* `Frame +7`: Hero headline masked line-reveal (`stagger = 4 frames` per line)
* `Frame +13`: Primary data curve evolves (`@remotion/paths`) or counter ticks up
* `Frame +19`: Focal 10%-accent badge pops in (`tactile` spring + `soft-pop.wav` SFX!)

**Hard Cap**: Total entrance choreography for a single card/lockup should finish its primary read within **`22–34 frames` (`0.4s–0.6s` at 60fps)**—staggers that drag on for 2 seconds bore the viewer.

### Principle C: Masked Kinetic Typography (Never Plain Opacity Fade!)
Plain `opacity: 0 → 1` looks like PowerPoint 2003. Wrap every headline line in an `overflow: "hidden"` clip mask with slight bottom padding (`paddingBottom: "0.12em"` so descenders like `g, y, p` never clip!) and animate `translateY("108%") → translateY("0%")` paired with subtle rotation `1.5deg → 0deg`.

### Principle D: Continuous Secondary Life (Zero Frozen Frames)
Once a spring settles at `1.0`, the frame must NOT turn into a frozen PNG screenshot for the remaining 2.5 seconds:
* Apply a slow, continuous camera breath (`scale = 1 + 0.025 * (frame / durationInFrames)`).
* Keep subtle ambient motion alive: cursor blink, live waveform shimmer, gentle parallax between foreground (`1.0x` pan) and background grid (`0.35x` pan).

### Principle E: Motivated Exit (Or Cut at Peak Energy)
Don't waste 20 frames fading every element out symmetrically before every cut! Usually it is **stronger to hold the settled composition and cut cleanly (or wipe/pan camera) to the next shot** while visual energy is still present. Reserve full element teardowns for major chapter endings.

---

## 3. High-Leverage Visual Archetypes (`VisualMetaphorStage.tsx`)

1. **Continuous 2.5D Canvas (`CameraRig25D`)**: Place Step 1 at `(0, 0)`, Step 2 at `(1400, 120)`, Step 3 at `(2800, -160)` on one giant virtual canvas, connect them with animated SVG Bezier cables, and fly the virtual camera smoothly between coordinates. Viewers grasp spatial relationships instantly.
2. **Authentic Product / Terminal Surfaces**: Never screenshot blurry JPEGs if you can render crisp React vector UI at `2x` pixel density—show real syntax-highlighted code typing deterministically, real cursor Bezier arcs (never straight diagonal robot lines!), and click ripple compression (`scale: 0.94` on press).
3. **Comparative Data Tension**: When animating a metric (`+340%` or `12ms vs 480ms`), always render the **baseline/competitor reference bar first**, let it finish, then fire the hero bar past it with `tactile` spring physics and a `tabular-nums` rolling counter.
