// Copperdeep Depths — the lower level of Copperdeep Mine, down a tunnel at the
// back of the iron gallery.
//
// A landing at the south (the way back up), three coal caverns (west, north
// and east) with a few iron rocks, and cave beasts roaming the dark.

import { GROUND } from '../../src/world/area.js';
import { mulberry32 } from '../../src/core/rng.js';

const W = 40;
const H = 32;

export function buildDepths() {
  const ground = new Uint8Array(W * H).fill(GROUND.ROCKWALL);
  const blocked = new Uint8Array(W * H).fill(1);
  const props = [];
  const rng = mulberry32(3030);
  const inB = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
  const i = (x, y) => y * W + x;
  const dig = (x, y) => { if (inB(x, y) && x > 0 && y > 0 && x < W - 1 && y < H - 1) { ground[i(x, y)] = GROUND.CAVE; blocked[i(x, y)] = 0; } };
  const cavern = (cx, cy, rx, ry) => {
    for (let y = Math.floor(cy - ry - 1); y <= cy + ry + 1; y++) for (let x = Math.floor(cx - rx - 1); x <= cx + rx + 1; x++) {
      const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
      if (d < 0.78 || (d < 1.08 && rng() < 0.55)) dig(x, y);
    }
  };
  const tunnel = (x0, y0, x1, y1) => {
    let x = x0, y = y0;
    while (x !== x1 || y !== y1) {
      dig(x, y); dig(x + 1, y); dig(x, y + 1);
      if (x !== x1 && (y === y1 || rng() < 0.5)) x += Math.sign(x1 - x); else y += Math.sign(y1 - y);
    }
    dig(x, y); dig(x + 1, y); dig(x, y + 1);
  };

  // ---- Caverns ---------------------------------------------------------------------
  cavern(20, 25, 6, 3.6);   // the landing
  dig(20, 29); dig(20, 30); // up to the iron gallery
  cavern(8.5, 14, 6, 6);    // west coal cavern
  cavern(20, 7, 7, 4.5);    // north coal cavern
  cavern(31.5, 14, 5.5, 6); // east coal cavern
  tunnel(15, 23, 10, 19);
  tunnel(25, 23, 30, 19);
  tunnel(19, 21, 20, 11);
  tunnel(13, 10, 14, 7);
  tunnel(27, 7, 29, 9);

  const prop = (type, tiles, extra = {}) => {
    props.push({ type, tiles, x: tiles[0].x, y: tiles[0].y, ...extra });
    if (extra.blocks !== false) for (const t of tiles) blocked[i(t.x, t.y)] = 1;
  };
  const one = (type, x, y, extra) => prop(type, [{ x, y }], extra);
  const isFloor = (x, y) => inB(x, y) && ground[i(x, y)] === GROUND.CAVE && !blocked[i(x, y)];

  // ---- The landing -----------------------------------------------------------------------
  one('caveMouth', 20, 30, { blocks: false });
  one('sign', 23, 27, { interact: ['COPPERDEEP DEPTHS', 'Coal in every cavern. Cave beasts too.', 'Up: back to the iron gallery.'] });
  for (const [x, y] of [[16, 26], [24, 24]]) one('lamp', x, y);
  one('crate', 15, 24);
  one('barrel', 25, 26);

  // ---- Rocks -----------------------------------------------------------------------------
  const ore = (variant, x, y) => { if (isFloor(x, y)) one('ore', x, y, { variant }); };
  for (const [x, y] of [[5, 11], [8, 9], [4, 15], [11, 13], [7, 18], [10, 16]]) ore('coal', x, y);
  for (const [x, y] of [[16, 5], [19, 4], [23, 5], [25, 8], [15, 8]]) ore('coal', x, y);
  for (const [x, y] of [[30, 10], [34, 12], [28, 15], [35, 16], [32, 18]]) ore('coal', x, y);
  for (const [x, y] of [[12, 11], [21, 9], [33, 9], [6, 13]]) ore('iron', x, y);
  for (const [x, y] of [[9, 20], [31, 21], [20, 11]]) one('lamp', x, y);

  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    if (!isFloor(x, y) || (x >= 18 && x <= 22 && y >= 26)) continue;
    if (rng() < 0.07) one('rubble', x, y, { blocks: false });
  }

  return {
    id: 'depths',
    name: 'Copperdeep Depths',
    W, H, ground, blocked, props, indoors: true,
    spawn: { x: 20, y: 28, facing: Math.PI },
    exits: [
      { tiles: [{ x: 20, y: 30 }], to: 'mine', at: { x: 23, y: 4 }, facing: 0 },
    ],
    spawns: [
      { enemy: 'caveBeast', x: 8, y: 13 },
      { enemy: 'caveBeast', x: 20, y: 6 },
      { enemy: 'caveBeast', x: 32, y: 13 },
      { enemy: 'caveBeast', x: 11, y: 17 },
      { enemy: 'caveBeast', x: 29, y: 17 },
    ],
  };
}
