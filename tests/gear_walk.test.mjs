// Gear bent to the walking frames (src/render/gearWalk.js, v0.57.0).
import assert from 'node:assert/strict';
import { bendGear, outline, coverBody } from '../src/render/gearWalk.js';

// A 12x10 "body": a filled block from x0 to x1 on every row, anchored at the feet.
const block = (x0, x1, w = 12, h = 10) => {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = x0; x <= x1; x++) { const i = (y * w + x) * 4; data[i] = 200; data[i + 3] = 255; }
  return { w, h, ax: 6, ay: 10, data };
};
const firstX = (im) => { for (let x = 0; x < im.w; x++) for (let y = 0; y < im.h; y++) if (im.data[(y * im.w + x) * 4 + 3]) return x - im.ax; return null; };

// The body sways 2px right: a rigid weapon goes with it.
const stand = block(4, 7), step = block(6, 9);
assert.deepEqual(outline(stand).get(-1), [-2, 1]);
const sword = block(0, 1); // two columns at the far left
const bent = bendGear(sword, 'weapon', stand, step);
assert.equal(firstX(bent) - firstX(sword), 2, 'weapon follows the torso');

// Armour on the body follows it and stays on it.
const plate = block(4, 7);
const bentPlate = bendGear(plate, 'body', stand, step);
assert.equal(firstX(bentPlate), firstX(step), 'armour sits on the moved body');

// v0.57.1: a helmet hides hair sticking out round it, but not skin.
const head = block(3, 8);                    // 6 wide: "hair" from x 3 to 8
for (let y = 0; y < head.h; y++) { const i = (y * head.w + 8) * 4; head.data[i] = 240; head.data[i + 1] = 190; head.data[i + 2] = 130; } // a column of skin at x 8
const helm = block(4, 7);                    // the helmet covers x 4-7
const cov = coverBody(head, [{ slot: 'head', im: helm }]);
const a = (im, x, y) => im.data[(y * im.w + x) * 4 + 3];
assert.equal(a(cov, 3, 5), 0, 'hair outside the helmet is hidden');
assert.equal(a(cov, 8, 5), 255, 'skin stays');
assert.equal(a(cov, 5, 5), 255, 'under the helmet is untouched');
assert.equal(coverBody(head, [{ slot: 'weapon', im: helm }]).data[(5 * head.w + 3) * 4 + 3], 255, 'weapons hide nothing');

console.log('gear_walk: ok');
