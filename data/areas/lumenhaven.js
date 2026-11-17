// Lumenhaven — the hidden fae city (v0.51.0), inspired by OSRS's Zanaris.
// Reached through the fairy ring in south-east Thornwood. Always night; lit
// by glowing toadstools, crystals and fae lanterns.
//
// - South: the fairy ring you arrive by (step back into it to leave)
// - Middle: the market square, with fae stalls
// - North-east: the Cosmic altar, on an island in the starlit pool (Runecrafting 27)
// - West: the Chaos altar, in a broken temple (35)
// - North-west: the Nature altar, in the great tree glade (44)
// - East: the Law altar, in a ring of crystals (54)
// - Far north: the Death altar, in the shadow hollow (65), the deepest part
//
// Three fae monsters roam it: glimmerwisps (market and pools), fae
// sentinels (the glade and crystal shrine) and hollow shades (the hollow).

import { GROUND } from '../../src/world/area.js';
import { mulberry32 } from '../../src/core/rng.js';

const W = 72;
const H = 58;

export function buildLumenhaven() {
  const ground = new Uint8Array(W * H); // grass
  const blocked = new Uint8Array(W * H);
  const props = [];
  const rng = mulberry32(7171);
  const inB = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
  const i = (x, y) => y * W + x;
  const taken = new Uint8Array(W * H);
  const keep = new Uint8Array(W * H); // kept clear of trees and clutter
  const paint = (x, y, g) => { if (inB(x, y)) { ground[i(x, y)] = g; blocked[i(x, y)] = 0; keep[i(x, y)] = 1; } }; // land (unblocks water)
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
  const put = (type, x, y, extra) => { if (free(x, y)) one(type, x, y, extra); };
  const disc = (cx, cy, rx, ry, g) => {
    for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
      if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) paint(x, y, g);
    }
  };
  const water = (cx, cy, rx, ry) => {
    for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
      if (inB(x, y) && ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) { ground[i(x, y)] = GROUND.WATER; block(x, y); keep[i(x, y)] = 1; }
    }
  };
  // A winding path two tiles wide through each point in turn.
  const path = (...pts) => {
    for (let k = 1; k < pts.length; k++) {
      let [x, y] = pts[k - 1];
      const [x1, y1] = pts[k];
      while (x !== x1 || y !== y1) {
        rect(x, y, x + 1, y + 1, GROUND.PATH);
        if (x !== x1 && (y === y1 || rng() < 0.5)) x += Math.sign(x1 - x); else y += Math.sign(y1 - y);
      }
      rect(x, y, x + 1, y + 1, GROUND.PATH);
    }
  };

  // ---- Water first: the starlit pool (with the cosmic island) and small dark pools ----
  water(57, 14, 10, 7.5);
  water(20, 46, 4.5, 3);
  water(52, 46, 4, 2.5);
  water(26, 24, 3, 2);

  // ---- Places -------------------------------------------------------------------------
  disc(36, 52, 4, 3, GROUND.GRASS);              // the fairy ring clearing
  rect(29, 33, 43, 42, GROUND.PLAZA);            // the market square
  disc(57, 14, 2.6, 2.2, GROUND.GRASS);          // the cosmic island
  disc(12, 34, 6, 5, GROUND.PATH);               // the broken temple floor
  disc(14, 12, 8, 7, GROUND.GRASS);              // the great tree glade
  disc(61, 36, 6, 5, GROUND.GRASS);              // the crystal shrine
  disc(36, 7, 9, 5, GROUND.GRASS);               // the shadow hollow

  // ---- Paths between them ---------------------------------------------------------------
  path([35, 49], [36, 44], [35, 42]);                         // ring → market
  path([29, 37], [22, 36], [17, 34]);                         // market → temple
  path([14, 30], [11, 24], [13, 18]);                         // temple → glade
  path([42, 37], [50, 38], [56, 36]);                         // market → crystal shrine
  path([36, 33], [37, 26], [36, 20], [36, 12]);               // market → north → hollow
  path([37, 26], [44, 23], [49, 21]);                         // → the causeway to the cosmic island
  // the causeway across the pool (a bridge of fae light)
  for (let k = 0; k <= 6; k++) { const x = 50 + k, y = 20 - Math.round(k * 0.5); for (const [dx, dy] of [[0, 0], [1, 0]]) { ground[i(x + dx, y + dy)] = GROUND.BRIDGE; blocked[i(x + dx, y + dy)] = 0; keep[i(x + dx, y + dy)] = 1; } }

  // ---- The fairy ring you arrive by -------------------------------------------------------
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    one('glowShrooms', Math.round(36 + Math.cos(a) * 3), Math.round(53 + Math.sin(a) * 2.2), { blocks: false });
  }
  one('sign', 39, 49, { interact: ['LUMENHAVEN', 'The hidden city of the fae. Step back into the ring to go home.', 'The altars lie beyond the market. Beware: the fae do not welcome visitors.'] });

  // ---- The market square -------------------------------------------------------------------
  for (const [x, y] of [[30, 34], [33, 34], [39, 34], [42, 34], [30, 41], [42, 41]]) one('stall', x, y, { interact: ['A fae market stall. Its wares shimmer and change when you look away.'] });
  for (const [x, y] of [[29, 38], [43, 38], [36, 33], [36, 42]]) one('lamp', x, y);
  one('well', 36, 37, { interact: ['A well of liquid starlight. Coins at the bottom glitter like stars.'] });
  for (const [x, y] of [[31, 37], [41, 39], [33, 40]]) put('glowFlowers', x, y, { blocks: false });

  // ---- The altars ------------------------------------------------------------------------------
  prop('altar', [{ x: 57, y: 13 }, { x: 58, y: 13 }], { variant: 'cosmic' });
  prop('altar', [{ x: 11, y: 33 }, { x: 12, y: 33 }], { variant: 'chaos' });
  prop('altar', [{ x: 14, y: 10 }, { x: 15, y: 10 }], { variant: 'nature' });
  prop('altar', [{ x: 61, y: 35 }, { x: 62, y: 35 }], { variant: 'law' });
  prop('altar', [{ x: 36, y: 5 }, { x: 37, y: 5 }], { variant: 'death' });

  // The broken temple (chaos): ruined walls, an arch and a fallen pillar
  for (const [x, y] of [[7, 30], [17, 30], [7, 38], [17, 38], [6, 34]]) one('ruinWall', x, y);
  one('ruinArch', 12, 29);
  prop('fallenPillar', [{ x: 9, y: 37 }, { x: 10, y: 37 }]);
  for (const [x, y] of [[14, 36], [8, 32], [16, 33]]) put('rubble', x, y, { blocks: false });
  // The great tree glade (nature): magic trees in a ring, flowers everywhere
  for (let k = 0; k < 9; k++) {
    const a = (k / 9) * Math.PI * 2 + 0.3;
    put('tree', Math.round(14 + Math.cos(a) * 6), Math.round(12 + Math.sin(a) * 5), { variant: 'magic' });
  }
  for (const [x, y] of [[11, 13], [17, 13], [13, 15], [16, 9], [10, 10]]) put('glowFlowers', x, y, { blocks: false });
  // The crystal shrine (law): crystals in a ring, standing stones
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    put('crystalShard', Math.round(61 + Math.cos(a) * 4), Math.round(36 + Math.sin(a) * 3.2));
  }
  for (const [x, y] of [[57, 39], [65, 39]]) put('standingStone', x, y);
  // The cosmic island: lamps and flowers
  for (const [x, y] of [[56, 15], [59, 15]]) put('glowFlowers', x, y, { blocks: false });
  // The shadow hollow (death): dead and gloom trees, bones, a skeleton
  for (const [x, y] of [[29, 5], [43, 5], [28, 9], [44, 9], [32, 3], [40, 3]]) put('tree', x, y, { variant: k2(x) ? 'dead' : 'gloom' });
  for (const [x, y] of [[33, 8], [40, 8], [35, 10], [38, 4]]) put('bones', x, y, { blocks: false });
  put('skeleton', 31, 7, { blocks: false, interact: ['Someone who came for the death runes.'] });
  for (const [x, y] of [[34, 11], [39, 11]]) put('lamp', x, y);
  one('sign', 37, 13, { interact: ['THE SHADOW HOLLOW', 'Turn back.'] });

  // Lamps along the paths
  for (const [x, y] of [[23, 37], [13, 26], [49, 37], [38, 24], [45, 22], [36, 16]]) put('lamp', x, y);

  // ---- The rest: a fae wood of glowing toadstools, crystals and trees ----------------------------
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!free(x, y) || keep[i(x, y)] || ground[i(x, y)] !== GROUND.GRASS) continue;
    const edge = x < 2 || y < 2 || x >= W - 2 || y >= H - 2;
    const r = rng();
    // v0.51.1: half as many trees as before (8% of open grass, was 16%)
    if (edge || r < 0.08) one('tree', x, y, { variant: r < 0.025 ? 'magic' : r < 0.055 ? 'gloom' : 'pine' });
    else if (r < 0.12) one('glowShrooms', x, y, { blocks: false });
    else if (r < 0.145) one('glowFlowers', x, y, { blocks: false });
    else if (r < 0.155) one('crystalShard', x, y);
  }

  return {
    id: 'lumenhaven',
    name: 'Lumenhaven',
    W, H, ground, blocked, props,
    theme: 'vale', // night colours (until it has its own art)
    dark: true,
    spawn: { x: 36, y: 49, facing: Math.PI },
    exits: [
      // step back into the fairy ring
      { tiles: [{ x: 36, y: 53 }], to: 'route1', at: { x: 70, y: 92 }, facing: 0 },
    ],
    spawns: [
      // glimmerwisps: the market's edges and the pools
      { enemy: 'glimmerwisp', x: 26, y: 42 }, { enemy: 'glimmerwisp', x: 46, y: 42 }, { enemy: 'glimmerwisp', x: 24, y: 30 },
      { enemy: 'glimmerwisp', x: 46, y: 28 }, { enemy: 'glimmerwisp', x: 14, y: 44 }, { enemy: 'glimmerwisp', x: 55, y: 44 },
      // fae sentinels: the glade and the crystal shrine
      { enemy: 'faeSentinel', x: 13, y: 16 }, { enemy: 'faeSentinel', x: 18, y: 10 }, { enemy: 'faeSentinel', x: 57, y: 33 },
      { enemy: 'faeSentinel', x: 64, y: 32 }, { enemy: 'faeSentinel', x: 59, y: 40 },
      // hollow shades: the shadow hollow
      { enemy: 'hollowShade', x: 32, y: 6 }, { enemy: 'hollowShade', x: 40, y: 6 }, { enemy: 'hollowShade', x: 36, y: 9 }, { enemy: 'hollowShade', x: 35, y: 3 },
    ],
  };
}

// Alternate dead and gloom trees round the hollow.
const k2 = (x) => x % 2 === 0;
