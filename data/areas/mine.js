// Copperdeep Mine — reached from the north-west road through Thornwood, now the rockslide
// has been cleared.
//
// Entrance hall (south) with the miners' furnace and anvil; a west gallery of
// copper and tin rocks; a deeper east gallery of iron, where tunnel goblins
// have moved in.

import { GROUND } from '../../src/world/area.js';
import { mulberry32 } from '../../src/core/rng.js';

const W = 32;
const H = 28;

export function buildMine() {
  const ground = new Uint8Array(W * H).fill(GROUND.ROCKWALL);
  const blocked = new Uint8Array(W * H).fill(1);
  const props = [];
  const rng = mulberry32(77);
  const inB = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
  const i = (x, y) => y * W + x;
  const dig = (x, y) => { if (inB(x, y) && x > 0 && y > 0 && x < W - 1) { ground[i(x, y)] = GROUND.CAVE; blocked[i(x, y)] = 0; } };
  // A cave room: an ellipse with ragged edges.
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
  cavern(15.5, 21, 7, 4.5); // entrance hall
  for (let y = 24; y < H; y++) { dig(15, y); dig(16, y); } // the way out
  cavern(7, 11, 5.5, 5); // west gallery: copper and tin
  cavern(24, 9, 6, 5.5); // east gallery: iron
  tunnel(11, 19, 7, 15);
  tunnel(19, 18, 23, 13);
  tunnel(10, 9, 19, 8);

  const prop = (type, tiles, extra = {}) => {
    props.push({ type, tiles, x: tiles[0].x, y: tiles[0].y, ...extra });
    if (extra.blocks !== false) for (const t of tiles) blocked[i(t.x, t.y)] = 1;
  };
  const one = (type, x, y, extra) => prop(type, [{ x, y }], extra);
  const isFloor = (x, y) => inB(x, y) && ground[i(x, y)] === GROUND.CAVE && !blocked[i(x, y)];

  // ---- Entrance hall: the miners' camp ---------------------------------------------------
  prop('furnace', [{ x: 11, y: 19 }], { action: 'smelt', interact: ['A stone furnace, glowing hot.'] });
  prop('anvil', [{ x: 13, y: 19 }], { action: 'smith', interact: ['A heavy iron anvil.'] });
  one('sign', 18, 22, { interact: ['COPPERDEEP MINE — open again!', 'West: copper and tin.  East: iron (beware the tunnel goblins).'] });
  for (const [x, y] of [[20, 19], [21, 20]]) one('crate', x, y);
  one('barrel', 10, 22);
  for (const [x, y] of [[12, 23], [19, 23]]) one('lamp', x, y);

  // ---- Ore rocks -----------------------------------------------------------------------
  const ore = (variant, x, y) => { if (isFloor(x, y)) one('ore', x, y, { variant }); };
  for (const [x, y] of [[4, 8], [6, 7], [9, 8], [3, 11], [5, 14]]) ore('copper', x, y);
  for (const [x, y] of [[8, 13], [10, 11], [4, 12], [7, 15], [11, 13]]) ore('tin', x, y);
  for (const [x, y] of [[21, 6], [25, 5], [28, 8], [27, 12], [22, 11]]) ore('iron', x, y);

  // Loose rubble, so the caves don't look swept. (No loose boulders: they'd look
  // too much like mined-out ore rocks.)
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    if (!isFloor(x, y) || (x >= 14 && x <= 17 && y >= 19)) continue;
    const r = rng();
    if (r < 0.06) one('rubble', x, y, { blocks: false });
  }

  return {
    id: 'mine',
    name: 'Copperdeep Mine',
    W, H, ground, blocked, props, indoors: true,
    spawn: { x: 15, y: 25, facing: Math.PI },
    exits: [
      { tiles: [{ x: 15, y: H - 1 }, { x: 16, y: H - 1 }], to: 'route1', at: { x: 30, y: 2 }, facing: 0 },
    ],
    spawns: [
      { enemy: 'tunnelGoblin', x: 24, y: 9 },
      { enemy: 'tunnelGoblin', x: 26, y: 7 },
      { enemy: 'tunnelGoblin', x: 23, y: 12 },
    ],
  };
}
