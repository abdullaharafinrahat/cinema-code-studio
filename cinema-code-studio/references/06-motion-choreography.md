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

## 3. Commercial Mixed-Media & Recursive Camera Choreography (`src/commercial/CommercialPrimitives.tsx`)

High-craft commercial motion graphics require **heavy virtual camera movement** so no text or object sits parked statically in the frame:

1. **Recursive "World-Inside-World" Portal Zooms (`<PortalZoomStage>`)**:
   * Open full-bleed inside an inner subject (e.g., `initialScale={2.24}` on a `990×500` NLE preview window—remember to multiply inner center `(dx, dy)` by `initialScale` so `initialOffset = [-dx * initialScale, -dy * initialScale]` prevents any surrounding chrome bleed!).
   * On the beat, speed-ramp zoom out (`14–18 frames` at `25 fps` with `Easing.bezier(0.16, 1, 0.3, 1)` and velocity-proportional `blur(7px)` at mid-ramp) to reveal the full NLE editor, 3×3 cinema monitor wall, or 3D Studio Display!
2. **Animated Corner Light-Sweeps & Connected Node Trees (`<GlowSweepFrame>` + `<OrthogonalNodeTree>`)**:
   * Frame hero photography inside `<GlowSweepFrame showReticles>` (tracing a white-hot + cobalt highlight around rounded corners) and wire it via orthogonal SVG spines to frosted `<GlassNodeCard>` pills (`cobalt` → `dark` → `lime` hero payoff).
3. **Foreground Optical Ring-Light Wipes (`<BokehRingWipe>`)**:
   * Sweep an out-of-focus `1560px` foreground ring light (`filter: "blur(26px)"`) across major world transitions (`10–14 frames`), switching `<Sequence>` boundaries cleanly at peak ring occlusion.
4. **Tactile Cursor Micro-Interactions (`<StudioCursor>`)**:
   * Drive state changes physically—cursor glides along `EASE_COMMERCIAL`, clicks `[M] MUTE MASTER` or `Render 4K` with spring compression (`0.82x` bounce + expanding ripple ring), and triggers immediate visual/acoustic consequence!
5. **Continuous 2.5D Canvas (`CameraRig25D`) & Comparative Data Tension**:
   * When animating metrics or comparative baselines, render the baseline first or discipline 90% of competing cards into `8%` blurred shadow so ONE hero viewport commands 100% of viewer attention.
