# 08 — Remotion Engineering Rules, Traps & Render Recipes

Remotion renders videos by launching headless Chromium workers in parallel—Worker A might render Frame `120` while Worker B renders Frame `4`! Any stateful or wall-clock browser API causes catastrophic flickering, missing assets, or frozen animations. Read this before writing `.tsx` code.

---

## 1. The 7 Silent Failure Traps (And How to Prevent Them)

### Trap 1: CSS Transitions & Keyframes (STRICTLY FORBIDDEN)
* **Bug**: `transition: "all 0.3s ease"`, Tailwind `transition-transform`, or `@keyframes spin` rely on real-time wall-clock ticks. In headless frame-by-frame capture, frames render out of order with zero elapsed browser time—elements freeze or flicker randomly.
* **Fix**: Compute 100% of transforms, opacities, colors, and SVG paths from `const frame = useCurrentFrame()` using `spring()` or `interpolate()`.

### Trap 2: Unclamped `interpolate()` Explosion
* **Bug**: `interpolate(frame, [10, 30], [0, 1])` returns `-0.5` at frame `0` and `5.5` at frame `120`! Opacity wraps weirdly, scales invert upside-down, and elements fly 4,000px off-screen.
* **Fix**: Always pass `{ extrapolateLeft: "clamp", extrapolateRight: "clamp" }`.

### Trap 3: HTML `<video>` or `<img>` Instead of Remotion Tags
* **Bug**: Native `<video>` does not block Chromium's screenshot until the exact frame decode completes, causing black frames or repeated stutter frames. Native `<img>` can screenshot mid-decode.
* **Fix**: ALWAYS use `<OffthreadVideo>` (decodes exact frames in Rust/FFmpeg C-bindings outside Chromium!) and `<Img>` + `staticFile("media/clip.mp4")` from `"remotion"`.

### Trap 4: `<TransitionSeries>` Duration Drift
* **Bug**: Scene A (`90f`) + Transition (`15f`) + Scene B (`90f`) inside `@remotion/transitions` `<TransitionSeries>` equals **`165 frames`**, NOT `180 frames`, because Scene A and Scene B overlap during those `15` transition frames! If `<Composition durationInFrames={180}>` isn't adjusted, the last `15 frames` render black or freeze.
* **Fix**: Total composition frames = `sum(sceneFrames) - sum(transitionOverlapFrames)`. `MasterSequence.tsx` computes this automatically from `05_timeline.json`.

### Trap 5: Unseeded `Math.random()` Grain or Particles
* **Bug**: Using `Math.random()` inside a component produces different particle positions every time a frame re-renders and breaks deterministic diffs.
* **Fix**: Import `random` from `"remotion"` and pass a deterministic string seed: `random(\`particle-\${index}-frame-\${frame}\`)`.

### Trap 6: Font Flash (FOUT) on Early Frames
* **Bug**: External `@import url(...)` CSS fonts finish downloading on frame `8`, so frames `0–7` render in ugly fallback Times New Roman!
* **Fix**: Load fonts via `@remotion/google-fonts` (which automatically blocks frame `0` via `delayRender()` until glyphs are ready) or preload local `.woff2` files via `@remotion/fonts` at module top-level.

### Trap 7: `<Sequence>` Frame Offset Confusion
* **Important**: Inside `<Sequence from={60} durationInFrames={90}>`, calling `useCurrentFrame()` inside the child component returns **`0` at composition frame `60`**! This is a *feature*—every scene component naturally writes its entrance springs starting at local `frame = 0`. Never subtract `60` manually inside the child!

### Trap 8: Full-Screen `<feTurbulence>` & `mix-blend-mode` Software CPU Stalls
* **Bug**: On headless CI/cloud machines without GPU acceleration, a `1920x1080` SVG `<feTurbulence>` filter or root CSS `filter:` / `mix-blend-mode` forces software Skia backdrop readbacks (`~1,000ms+` per frame — a `25x` slowdown!).
* **Fix**: Use lightweight stepped CSS spatial dither patterns (as implemented in `OpticalTexture.tsx`) or apply FFmpeg's native SIMD `noise=alls=4:allf=t+u` filter during `master_mix_and_render.py`.

---

## 2. Three.js & SVG Vector Rules

* **3D Scenes (`@remotion/three`)**: Always wrap 3D content in `<ThreeCanvas width={width} height={height}>` (never `@react-three/fiber`'s `<Canvas>`, which uses `requestAnimationFrame` instead of Remotion's frame clock!). Drive camera/mesh rotation directly from `useCurrentFrame()`.
* **SVG Path Drawing (`@remotion/paths`)**: Use `evolvePath(progress, svgPathString)` to get `{ strokeDasharray, strokeDashoffset }` for buttery After-Effects-style "Trim Paths" line drawing.

---

## 3. Production Export Commands

### Check Single Diagnostic Frame (Fastest Iteration — `< 2s`)
```bash
npx remotion still MasterSequence ../preprod/check-frame.png --frame=45
```

### Standard High-Quality Master Picture (H.264 / MP4)
```bash
npx remotion render MasterSequence ../out/picture.mp4 \
  --codec=h264 \
  --crf=18 \
  --pixel-format=yuv420p \
  --jpeg-quality=92
```

### Transparent Motion Overlay (Apple ProRes 4444 with Straight/Premultiplied Alpha)
Use when user wants lower thirds, callouts, or stingers with real alpha transparency:
```bash
npx remotion render MasterSequence ../out/overlay-alpha.mov \
  --codec=prores \
  --prores-profile=4444 \
  --image-format=png \
  --pixel-format=yuva444p10le
```

### Web Transparent Overlay (VP9 WebM Alpha)
```bash
npx remotion render MasterSequence ../out/overlay-alpha.webm \
  --codec=vp9 \
  --image-format=png \
  --pixel-format=yuva420p
```
