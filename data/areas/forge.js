// The Sunken Forge — an old dwarven forge hall below Copperdeep Hollow, down a
// tunnel at the top of the Hollow's north-east cavern.
//
// Pitch dark but for braziers and the glow of the ore. A landing at the south
// (the way back up) with a supply chest; a west gallery of adamantite; the
// great forge hall in the middle, where the dwarves' furnace has gone cold
// (Dorrin's quest will light it again) but their anvil still rings; an east
// gallery of runite; and the Molten beast's lair in the far north-east.

import { GROUND } from '../../src/world/area.js';
import { mulberry32 } from '../../src/core/rng.js';

const W = 48;
const H = 38;

export function buildForge() {
  const ground = new Uint8Array(W * H).fill(GROUND.ROCKWALL);
  const blocked = new Uint8Array(W * H).fill(1);
  const props = [];
  const rng = mulberry32(7070);
  const inB = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
  const i = (x, y) => y * W + x;
  const dig = (x, y, g = GROUND.CAVE) => { if (inB(x, y) && x > 0 && y > 0 && x < W - 1 && y < H - 1) { ground[i(x, y)] = g; blocked[i(x, y)] = 0; } };
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
  cavern(23, 31, 5.5, 3.4);  // the landing
  dig(23, 35); dig(23, 36);  // up to the Hollow
  cavern(9, 22, 6, 6);       // west gallery: adamantite
  cavern(23, 15, 8, 6);      // the great forge hall
  cavern(37, 22, 5.5, 5.5);  // east gallery: runite
  cavern(39, 7, 5, 4);       // the Molten beast's lair
  tunnel(18, 30, 12, 26);
  tunnel(28, 30, 34, 26);
  tunnel(22, 28, 23, 21);
  tunnel(15, 16, 13, 19);
  tunnel(31, 16, 34, 18);
  tunnel(37, 16, 38, 11);
  // the forge hall's floor is dressed stone
  for (let y = 11; y <= 19; y++) for (let x = 17; x <= 29; x++) if (ground[i(x, y)] === GROUND.CAVE) ground[i(x, y)] = GROUND.PLAZA;

  const prop = (type, tiles, extra = {}) => {
    props.push({ type, tiles, x: tiles[0].x, y: tiles[0].y, ...extra });
    if (extra.blocks !== false) for (const t of tiles) blocked[i(t.x, t.y)] = 1;
  };
  const one = (type, x, y, extra) => prop(type, [{ x, y }], extra);
  const isFloor = (x, y) => inB(x, y) && (ground[i(x, y)] === GROUND.CAVE || ground[i(x, y)] === GROUND.PLAZA) && !blocked[i(x, y)];

  // ---- The landing -----------------------------------------------------------------------
  one('caveMouth', 23, 36, { blocks: false });
  one('campChest', 20, 30, { action: 'bank', title: 'Forge supply chest', interact: ["A dwarven strongbox. Somehow it's linked to the Bank of Brambleford too."] });
  one('sign', 26, 33, { interact: ['THE SUNKEN FORGE', 'West: adamantite.  East: runite.  North: the great forge.', 'Beware the golems. And whatever lives in the far hall.'] });
  for (const [x, y] of [[18, 31], [28, 31]]) one('lamp', x, y);

  // ---- The great forge hall ------------------------------------------------------------
  prop('furnace', [{ x: 23, y: 11 }], { interact: ["The dwarves' great furnace. It's stone cold.", 'Dorrin might know how to fire it up again.'] });
  prop('anvil', [{ x: 21, y: 13 }], { action: 'smith', interact: ['A dwarven anvil, still sound after all these years.'] });
  prop('anvil', [{ x: 25, y: 13 }], { action: 'smith', interact: ['A dwarven anvil, still sound after all these years.'] });
  for (const [x, y] of [[18, 12], [28, 12], [18, 18], [28, 18]]) one('fallenPillar', x, y, { interact: ['A carved dwarven pillar, long since toppled.'] });
  for (const [x, y] of [[20, 16], [26, 16]]) one('campfire', x, y, { interact: ['An iron brazier. Embers still glow in it.'] });

  // ---- Rocks -----------------------------------------------------------------------------
  const ore = (variant, x, y) => { if (isFloor(x, y)) one('ore', x, y, { variant }); };
  for (const [x, y] of [[5, 19], [8, 17], [12, 18], [4, 24], [7, 27], [13, 24]]) ore('adamantite', x, y);
  for (const [x, y] of [[10, 21], [6, 22], [14, 21]]) ore('coal', x, y);
  for (const [x, y] of [[34, 19], [40, 20], [36, 26], [41, 24]]) ore('runite', x, y);
  for (const [x, y] of [[33, 23], [39, 18]]) ore('coal', x, y);
  for (const [x, y] of [[9, 24], [39, 22]]) one('lamp', x, y);

  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    if (!isFloor(x, y) || ground[i(x, y)] === GROUND.PLAZA || (x >= 21 && x <= 25 && y >= 32)) continue;
    const r = rng();
    if (r < 0.05) one('rubble', x, y, { blocks: false });
    else if (r < 0.06) one('bones', x, y, { blocks: false });
  }

  return {
    id: 'forge',
    name: 'The Sunken Forge',
    W, H, ground, blocked, props, indoors: true, dark: true,
    spawn: { x: 23, y: 34, facing: Math.PI },
    exits: [
      { tiles: [{ x: 23, y: 36 }], to: 'hollow', at: { x: 37, y: 3 }, facing: 0 },
    ],
    spawns: [
      { enemy: 'forgeGolem', x: 9, y: 21 },
      { enemy: 'forgeGolem', x: 23, y: 16 },
      { enemy: 'forgeGolem', x: 37, y: 22 },
      { enemy: 'forgeGolem', x: 10, y: 25 },
      { enemy: 'forgeGolem', x: 35, y: 20 },
      { enemy: 'moltenBeast', x: 39, y: 7 },
    ],
  };
}
