// Run by tests/test_recipes_and_look.py after compiling src/tokens/faceSafe.ts to JS.
// usage: node faceSafe.check.mjs <path-to-compiled-faceSafe.js>
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";

const mod = await import(pathToFileURL(process.argv[2]).href);
const { placePills, boxesOverlap, DEFAULT_FACE_BOX, estimatePillWidth } = mod;

const mk = (n, w = 0.16, h = 0.06) => Array.from({ length: n }, () => ({ w, h }));
const faces = [
  DEFAULT_FACE_BOX,
  { x: 0.2, y: 0.12, w: 0.26, h: 0.44 }, // speaker off to the left
  { x: 0.55, y: 0.1, w: 0.3, h: 0.5 },   // speaker off to the right
  { x: 0.3, y: 0.05, w: 0.4, h: 0.6 },   // close-up, big face
];

let checked = 0;
for (const face of faces) {
  for (const n of [1, 2, 3, 4]) {
    for (const w of [0.12, 0.2, 0.3]) {
      const r = placePills(mk(n, w), face);
      for (const p of r.items) {
        assert.ok(!boxesOverlap(p, face), `pill overlaps face (face=${JSON.stringify(face)}, n=${n}, w=${w})`);
        assert.ok(p.x >= 0 && p.y >= 0 && p.x + p.w <= 1.0001 && p.y + p.h <= 1.0001, `pill leaves the frame`);
        checked++;
      }
    }
  }
}
// Normal cases must be placed beside the face, not shoved into the fallback row.
const normal = placePills(mk(3, 0.16), DEFAULT_FACE_BOX);
assert.equal(normal.ok, true);
assert.ok(normal.items.every((p) => p.side !== "bottom"), "normal case should use side columns");
// Bengali text is estimated wider than Latin text of the same length.
assert.ok(estimatePillWidth("আপনি যদি", 50, 1920, 30) > estimatePillWidth("abcdefgh", 50, 1920, 30));
console.log(JSON.stringify({ ok: true, placementsChecked: checked }));
