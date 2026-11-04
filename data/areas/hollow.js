// Copperdeep Hollow — the deepest part of Copperdeep Mine, down a tunnel at the
// top of the Depths' north cavern.
//
// Pitch dark except for the miners' lamps and the faint blue glow of mithril.
// A landing at the south (the way back up), a winding gallery of mithril and
// coal, and night stalkers hunting in the dark.

import { GROUND } from '../../src/world/area.js';
import { mulberry32 } from '../../src/core/rng.js';

const W = 44;
const H = 34;

export function buildHollow() {
  const ground = new Uint8Array(W * H).fill(GROUND.ROCKWALL);
  const blocked = new Uint8Array(W * H).fill(1);
  const props = [];
  const rng = mulberry32(5555);
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
  cavern(22, 27, 5, 3.4);    // the landing
  dig(22, 31); dig(22, 32);  // up to the Depths
  cavern(9, 22, 5.5, 4.5);   // south-west hollow
  cavern(10, 9, 6.5, 5);     // north-west hollow
  cavern(24, 13, 6, 5);      // the great hollow
  cavern(36, 8, 5, 5);       // north-east hollow
  cavern(35, 23, 5, 4.5);    // south-east hollow
  tunnel(17, 26, 12, 23);
  tunnel(9, 18, 10, 13);
  tunnel(16, 10, 19, 12);
  tunnel(29, 11, 32, 9);
  tunnel(27, 26, 32, 24);
  tunnel(35, 19, 35, 13);
  tunnel(22, 24, 23, 18);

  const prop = (type, tiles, extra = {}) => {
    props.push({ type, tiles, x: tiles[0].x, y: tiles[0].y, ...extra });
    if (extra.blocks !== false) for (const t of tiles) blocked[i(t.x, t.y)] = 1;
  };
  const one = (type, x, y, extra) => prop(type, [{ x, y }], extra);
  const isFloor = (x, y) => inB(x, y) && ground[i(x, y)] === GROUND.CAVE && !blocked[i(x, y)];

  // ---- The landing -----------------------------------------------------------------------
  one('caveMouth', 22, 32, { blocks: false });
  one('sign', 25, 29, { interact: ['COPPERDEEP HOLLOW', 'Mithril glows faintly in the dark. So do their eyes.', 'Up: back to the Depths.'] });
  for (const [x, y] of [[18, 27], [26, 26], [22, 16], [10, 21], [35, 22], [11, 9], [36, 9]]) one('lamp', x, y);

  // ---- Rocks -----------------------------------------------------------------------------
  const ore = (variant, x, y) => { if (isFloor(x, y)) one('ore', x, y, { variant }); };
  for (const [x, y] of [[6, 7], [12, 6], [8, 12], [20, 10], [27, 11], [24, 9], [34, 5], [39, 9], [37, 25], [7, 24]]) ore('mithril', x, y);
  for (const [x, y] of [[13, 10], [5, 21], [21, 15], [28, 15], [33, 21], [38, 22]]) ore('coal', x, y);
  for (const [x, y] of [[33, 7], [11, 24]]) ore('gold', x, y);
  for (const [x, y] of [[14, 8], [30, 25]]) ore('gem', x, y);

  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    if (!isFloor(x, y) || (x >= 20 && x <= 24 && y >= 28)) continue;
    const r = rng();
    if (r < 0.06) one('rubble', x, y, { blocks: false });
    else if (r < 0.075) one('crystalShard', x, y, { blocks: false });
  }

  return {
    id: 'hollow',
    name: 'Copperdeep Hollow',
    W, H, ground, blocked, props, indoors: true, dark: true,
    spawn: { x: 22, y: 30, facing: Math.PI },
    exits: [
      { tiles: [{ x: 22, y: 32 }], to: 'depths', at: { x: 24, y: 3 }, facing: 0 },
    ],
    spawns: [
      { enemy: 'nightStalker', x: 10, y: 9 },
      { enemy: 'nightStalker', x: 24, y: 13 },
      { enemy: 'nightStalker', x: 36, y: 8 },
      { enemy: 'nightStalker', x: 35, y: 23 },
      { enemy: 'nightStalker', x: 9, y: 21 },
      { enemy: 'nightStalker', x: 21, y: 12 },
    ],
  };
}
