// Whispering Vale — a dark, quiet valley east of Thornwood, where it is always
// night, reached by the trail
// through the oak grove. Old magic gathers here.
//
// - North-west: the essence quarry, a rocky pit of glowing essence crystals
// - Middle: the runekeeper's camp, with Aldric and a supply chest (a bank)
// - North-east: the Air altar, on a windy hilltop
// - South-east: the Mind altar, in a ring of standing stones
// - South-west: the Water altar, at the edge of a lake

import { GROUND } from '../../src/world/area.js';
import { mulberry32 } from '../../src/core/rng.js';

const W = 72;
const H = 60;

export function buildVale() {
  const ground = new Uint8Array(W * H); // grass
  const blocked = new Uint8Array(W * H);
  const props = [];
  const rng = mulberry32(4242);
  const inB = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
  const i = (x, y) => y * W + x;
  const taken = new Uint8Array(W * H);
  const keep = new Uint8Array(W * H); // kept clear of trees and clutter
  const paint = (x, y, g) => { if (inB(x, y)) { ground[i(x, y)] = g; keep[i(x, y)] = 1; } };
  const rect = (x0, y0, x1, y1, g) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) paint(x, y, g); };
  const clearArea = (x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (inB(x, y)) keep[i(x, y)] = 1; };
  const block = (x, y) => { if (inB(x, y)) blocked[i(x, y)] = 1; };
  const prop = (type, tiles, extra = {}) => {
    const p = { type, tiles, x: tiles[0].x, y: tiles[0].y, ...extra };
    for (const t of tiles) { if (!inB(t.x, t.y)) continue; taken[i(t.x, t.y)] = 1; if (extra.blocks !== false) block(t.x, t.y); }
    props.push(p);
    return p;
  };
  const one = (type, x, y, extra) => prop(type, [{ x, y }], extra);
  const free = (x, y) => inB(x, y) && !blocked[i(x, y)] && !taken[i(x, y)];
  const placeIfFree = (type, x, y, extra) => { if (free(x, y) && !keep[i(x, y)] && ground[i(x, y)] === GROUND.GRASS) one(type, x, y, extra); };
  const disc = (cx, cy, r, g) => { for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) paint(x, y, g); };

  // ---- Paths ------------------------------------------------------------------------
  // In from the west (Thornwood), out to each corner of the vale.
  rect(0, 29, 22, 30, GROUND.PATH);
  rect(22, 12, 23, 47, GROUND.PATH);          // north-south spine
  rect(23, 29, 52, 30, GROUND.PATH);          // east, past the camp
  for (let k = 0; k <= 12; k++) rect(52 + k, 28 - k, 53 + k, 30 - k, GROUND.PATH); // up to the air altar
  rect(63, 12, 65, 17, GROUND.PATH);
  for (let k = 0; k <= 12; k++) rect(52 + k, 29 + k, 53 + k, 31 + k, GROUND.PATH); // down to the mind altar
  rect(63, 42, 65, 46, GROUND.PATH);
  rect(14, 12, 22, 13, GROUND.PATH);          // to the quarry
  rect(14, 46, 22, 47, GROUND.PATH);          // to the water altar

  // ---- Essence quarry (north-west) -----------------------------------------------------
  // A pit of grey gravel ringed by rock, with a gap facing the path.
  const qx0 = 3, qy0 = 3, qx1 = 15, qy1 = 18;
  for (let y = qy0 - 1; y <= qy1 + 1; y++) for (let x = qx0 - 1; x <= qx1 + 1; x++) {
    if (!inB(x, y)) continue;
    const rim = x < qx0 || x > qx1 || y < qy0 || y > qy1;
    const gap = x === qx1 + 1 && (y === 12 || y === 13);
    if (rim && !gap) { ground[i(x, y)] = GROUND.ROCKWALL; block(x, y); taken[i(x, y)] = 1; keep[i(x, y)] = 1; }
    else paint(x, y, GROUND.CAVE);
  }
  for (const [x, y] of [[5, 5], [8, 4], [12, 6], [4, 9], [9, 9], [13, 10], [6, 13], [10, 15], [5, 17], [13, 16]]) one('ore', x, y, { variant: 'essence' });
  for (const [x, y] of [[7, 7], [11, 12], [4, 15]]) one('rubble', x, y, { blocks: false });
  one('lamp', 16, 11);
  one('sign', 17, 14, { interact: ['ESSENCE QUARRY', 'Mine the crystals with a pickaxe. They never run dry.'] });

  // ---- The runekeeper's camp (middle) ----------------------------------------------------
  clearArea(24, 22, 34, 28);
  rect(25, 24, 33, 27, GROUND.PATH); // trodden earth round the camp
  prop('tent', [{ x: 26, y: 23 }, { x: 27, y: 23 }], { interact: ["Aldric's tent. Star charts and rune sketches are pinned inside."] });
  // The supply chest: an old iron-banded trunk under the tent's awning, where
  // the runekeepers keep their things. It works like a bank.
  one('campChest', 29, 23, { action: 'bank', title: "Runekeepers' supply chest", interact: ["The runekeepers' supply chest. It's linked to the Bank of Brambleford, somehow."] });
  one('campfire', 31, 26, { action: 'cook', interact: ['A small cooking fire.'] });
  for (const [x, y] of [[33, 24], [25, 27]]) one('crate', x, y);
  one('barrel', 33, 25);
  for (const [x, y, t] of [[34, 27, 'crateStack'], [24, 26, 'openBarrel']]) if (free(x, y)) one(t, x, y);
  one('logPile', 32, 23, { interact: ['Firewood.'] });
  // Lanterns at the crossroads, so the way is never quite lost in the dark.
  for (const [x, y] of [[21, 28], [24, 32], [50, 28], [21, 45], [21, 14]]) one('lamp', x, y);
  one('sign', 24, 31, { interact: ['WHISPERING VALE', 'Quarry: north-west.  Air altar: north-east.  Mind altar: south-east.  Water altar: south-west.'] });

  // ---- Air altar (north-east): a windswept hilltop ----------------------------------------
  disc(63, 9, 4.2, GROUND.PLAZA);
  clearArea(57, 3, 69, 15);
  prop('altar', [{ x: 63, y: 8 }, { x: 64, y: 8 }], { variant: 'air' });
  for (const [x, y] of [[59, 6], [67, 7], [60, 12], [66, 12]]) one('rock', x, y);

  // ---- Mind altar (south-east): a ring of standing stones ----------------------------------
  disc(63, 50, 4.5, GROUND.PATH);
  clearArea(57, 44, 69, 56);
  prop('altar', [{ x: 63, y: 49 }, { x: 64, y: 49 }], { variant: 'mind' });
  for (let k = 0; k < 8; k++) {
    if (k === 6) continue; // a gap in the ring facing the path
    const a = (k / 8) * Math.PI * 2;
    one('standingStone', Math.round(63.5 + Math.cos(a) * 4.5), Math.round(49.5 + Math.sin(a) * 4), {});
  }

  // ---- Water altar (south-west): on the shore of a lake ------------------------------------
  const lake = { cx: 7, cy: 50, rx: 6.5, ry: 5 };
  for (let y = 40; y < H; y++) for (let x = 0; x < 20; x++) {
    const d = ((x + 0.5 - lake.cx) / lake.rx) ** 2 + ((y + 0.5 - lake.cy) / lake.ry) ** 2;
    if (d < 1) { ground[i(x, y)] = GROUND.WATER; block(x, y); taken[i(x, y)] = 1; keep[i(x, y)] = 1; }
    else if (d < 1.6) paint(x, y, GROUND.SAND);
  }
  rect(12, 44, 17, 49, GROUND.PLAZA); // a stone platform on the shore
  clearArea(11, 41, 21, 52);
  prop('altar', [{ x: 14, y: 46 }, { x: 15, y: 46 }], { variant: 'water' });
  for (const [x, y] of [[17, 51], [12, 42]]) placeIfFree('thornBush', x, y);

  // Old skeletons lie where the golems roam
  for (const [x, y] of [[38, 18], [48, 10], [30, 40], [54, 36]]) if (free(x, y)) one('skeleton', x, y, { blocks: false, interact: ['A skeleton, half sunk in the dead grass. Crystal dust glitters on the bones.'] });

  // ---- Trees: a forest rim round the vale, and copses within it --------------------------
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (x <= 2 && y >= 27 && y <= 32) continue; // keep the way in clear
    const d = Math.min(x, y, W - 1 - x, H - 1 - y);
    const edge = d <= 1 ? 1 : d === 2 ? 0.7 : d === 3 ? 0.3 : 0;
    const copse = (Math.sin(x * 0.31) + Math.cos(y * 0.27) + Math.sin((x + y) * 0.17)) > 1.6 ? 0.55 : 0.02;
    if (rng() < Math.max(edge, copse)) placeIfFree('tree', x, y, { variant: rng() < 0.45 ? 'dead' : 'gloom' });
  }

  // ---- Wild things: dead grass, ghost-flowers, thorns, glowing mushrooms, crystal shards ----
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!free(x, y) || keep[i(x, y)] || ground[i(x, y)] !== GROUND.GRASS) continue;
    const r = rng();
    const meadow = Math.sin(x * 0.5) + Math.cos(y * 0.4) > 1.1;
    if (meadow && r < 0.7) one('tallGrass', x, y, { blocks: false });
    else if (r < 0.03) one('thornBush', x, y);
    else if (r < 0.06) one('glowFlowers', x, y, { blocks: false });
    else if (r < 0.07) one('rock', x, y);
    else if (r < 0.09) one('glowShrooms', x, y, { blocks: false });
    else if (r < 0.1) one('crystalShard', x, y, { blocks: false });
    else if (r < 0.105) one('bones', x, y, { blocks: false });
  }

  return {
    id: 'vale',
    name: 'Whispering Vale',
    W, H, ground, blocked, props,
    theme: 'vale', // its own ground colours and scenery
    dark: true, // always night here: only glowing things give light
    spawn: { x: 2, y: 29, facing: Math.PI / 2 },
    exits: [
      { tiles: [{ x: 0, y: 29 }, { x: 0, y: 30 }], to: 'route1', at: { x: 109, y: 48 }, facing: -Math.PI / 2 },
    ],
    // Six essence golems, spread thinly across the vale.
    spawns: [
      { enemy: 'essenceGolem', x: 40, y: 16 },
      { enemy: 'essenceGolem', x: 44, y: 8 },
      { enemy: 'essenceGolem', x: 12, y: 24 },
      { enemy: 'essenceGolem', x: 33, y: 38 },
      { enemy: 'essenceGolem', x: 56, y: 37 },
      { enemy: 'essenceGolem', x: 30, y: 51 },
    ],
  };
}
