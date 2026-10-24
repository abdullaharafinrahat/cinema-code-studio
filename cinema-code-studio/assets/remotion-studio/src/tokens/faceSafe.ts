/**
 * Face-safe placement. Overlays (pills, cards, labels) must never cover the speaker's face.
 * All boxes are normalized to the frame: x, y = top-left, w, h = size, all in 0..1.
 *
 * `faceBox` comes from scripts/auto_reframe_eyes.py (`dominantFaceBox`) or FootageSpec.faceBox.
 * Pure functions only, so they can be unit-tested outside Remotion.
 */

export type Box = { x: number; y: number; w: number; h: number };

/** Typical centered talking-head face box, used only when no tracking data exists. */
export const DEFAULT_FACE_BOX: Box = { x: 0.36, y: 0.1, w: 0.28, h: 0.46 };

export const boxesOverlap = (a: Box, b: Box, pad = 0): boolean =>
  a.x < b.x + b.w + pad && a.x + a.w + pad > b.x && a.y < b.y + b.h + pad && a.y + a.h + pad > b.y;

export const inflate = (b: Box, by: number): Box => ({
  x: b.x - by,
  y: b.y - by,
  w: b.w + by * 2,
  h: b.h + by * 2,
});

export type Size = { w: number; h: number };
export type Placement = { x: number; y: number; w: number; h: number; side: "left" | "right" | "bottom" };

export interface PlaceResult {
  ok: boolean;
  /** Uniform scale that was applied to all sizes so everything fits (1 = unchanged). */
  scale: number;
  items: Placement[];
}

const SAFE_MARGIN = 0.04;
const GAP = 0.018;

/**
 * Places pills in the free columns left and right of the face, alternating sides.
 * If they do not fit, shrinks them uniformly down to 60%. If they still do not fit,
 * falls back to a single row below the face. Never returns a placement that overlaps the face.
 */
export function placePills(
  sizes: Size[],
  face: Box = DEFAULT_FACE_BOX,
  opts: { margin?: number; gap?: number; faceClearance?: number } = {},
): PlaceResult {
  const margin = opts.margin ?? SAFE_MARGIN;
  const gap = opts.gap ?? GAP;
  const clear = inflate(face, opts.faceClearance ?? 0.02);

  for (let scale = 1; scale >= 0.6 - 1e-9; scale -= 0.1) {
    const items: Placement[] = [];
    const cursor = { left: clear.y + clear.h * 0.1, right: clear.y + clear.h * 0.1 };
    let failed = false;

    sizes.forEach((s, i) => {
      if (failed) return;
      const w = s.w * scale;
      const h = s.h * scale;
      const leftFree = clear.x - margin;
      const rightFree = 1 - margin - (clear.x + clear.w);
      const preferLeft = i % 2 === 0;
      const order: Array<"left" | "right"> = preferLeft ? ["left", "right"] : ["right", "left"];

      for (const side of order) {
        const free = side === "left" ? leftFree : rightFree;
        if (w > free) continue;
        const y = cursor[side];
        if (y + h > 1 - margin) continue;
        const x = side === "left" ? clear.x - w : clear.x + clear.w;
        const p: Placement = { x, y, w, h, side };
        if (boxesOverlap(p, face)) continue;
        items.push(p);
        cursor[side] = y + h + gap;
        return;
      }
      failed = true;
    });

    if (!failed) return { ok: true, scale, items };
  }

  // Fallback: one row below the face, centered, shrunk to fit the safe width.
  const totalW = sizes.reduce((a, s) => a + s.w, 0) + gap * Math.max(0, sizes.length - 1);
  const avail = 1 - margin * 2;
  const scale = Math.min(1, avail / Math.max(totalW, 1e-6));
  let x = (1 - totalW * scale) / 2;
  const y = Math.min(1 - margin - Math.max(...sizes.map((s) => s.h)) * scale, clear.y + clear.h + gap);
  const items: Placement[] = sizes.map((s) => {
    const p: Placement = { x, y, w: s.w * scale, h: s.h * scale, side: "bottom" };
    x += p.w + gap * scale;
    return p;
  });
  const ok = items.every((p) => !boxesOverlap(p, face)) && items.every((p) => p.y + p.h <= 1);
  return { ok, scale, items };
}

/** Rough text width as a fraction of frame width. Bengali glyphs run wider than Latin. */
export const estimatePillWidth = (text: string, fontPx: number, frameW: number, padPx: number): number => {
  const bengali = /[\u0980-\u09FF]/.test(text);
  const em = bengali ? 0.66 : 0.56;
  return (Array.from(text).length * fontPx * em + padPx * 2) / frameW;
};
