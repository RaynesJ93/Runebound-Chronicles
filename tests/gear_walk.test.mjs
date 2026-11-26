// Gear bent to the walking frames (src/render/gearWalk.js, v0.57.0).
import assert from 'node:assert/strict';
import { bendGear, outline } from '../src/render/gearWalk.js';

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

console.log('gear_walk: ok');
