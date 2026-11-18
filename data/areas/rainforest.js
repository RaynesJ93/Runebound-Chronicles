// Greenmire Rainforest (v0.56.0): a steamy rainforest south of Brambleford,
// over the bridge on the south road. Dark green ground ('jungle' theme), huge
// trees, a winding stream, and three Runecrafting altars moved here from
// around the world:
//
// - West: the Earth altar, in a muddy clearing ringed by mossy boulders (Runecrafting 9)
// - East: the Fire altar, among steaming volcanic vents (14)
// - South, over the stream: the Body altar, in an overgrown stone ruin (20)

import { GROUND } from '../../src/world/area.js';
import { mulberry32 } from '../../src/core/rng.js';

const W = 64;
const H = 56;

export function buildRainforest() {
  const ground = new Uint8Array(W * H); // grass
  const blocked = new Uint8Array(W * H);
  const props = [];
  const rng = mulberry32(5656);
  const inB = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
  const i = (x, y) => y * W + x;
  const taken = new Uint8Array(W * H);
  const keep = new Uint8Array(W * H); // kept clear of trees and clutter
  const paint = (x, y, g) => { if (inB(x, y)) { ground[i(x, y)] = g; blocked[i(x, y)] = 0; keep[i(x, y)] = 1; } };
  const rect = (x0, y0, x1, y1, g) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) paint(x, y, g); };
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
  // Painted decorations (decor:<key>)
  const decor = (key, x, y, name, text, opt = {}) => {
    const tiles = opt.wide ? [{ x, y }, { x: x + 1, y }] : [{ x, y }];
    if (!tiles.every((t) => free(t.x, t.y))) return;
    prop('decor', tiles, { art: key, name, flat: !!opt.flat, blocks: !opt.walk, light: opt.light, interact: [text] });
  };

  // ---- The stream: winds west to east across the middle ----
  for (let x = 0; x < W; x++) {
    const cy = 33 + Math.sin(x / 7) * 2.4 + Math.sin(x / 3.1) * 0.6;
    for (let y = Math.floor(cy - 1.4); y <= Math.ceil(cy + 1.4); y++) {
      if (!inB(x, y) || Math.abs(y - cy) > 1.5) continue;
      ground[i(x, y)] = GROUND.WATER; block(x, y); keep[i(x, y)] = 1;
    }
  }

  // ---- Places ----
  disc(32, 4, 4, 3, GROUND.GRASS);       // the clearing you arrive in
  disc(12, 22, 6.5, 5, GROUND.PATH);     // the earth clearing (mud)
  disc(52, 22, 6.5, 5, GROUND.PATH);     // the fire vents
  rect(26, 43, 38, 51, GROUND.PLAZA);    // the overgrown ruin (body)

  // ---- Paths ----
  path([32, 0], [32, 8], [31, 14], [32, 19]);          // north entrance → the crossroads
  path([31, 19], [24, 21], [17, 22]);                  // → the earth clearing
  path([33, 19], [40, 22], [46, 22]);                  // → the fire vents
  path([32, 20], [32, 28]);                            // → the stream
  path([32, 38], [31, 41], [32, 43]);                  // the far bank → the ruin
  // The bridge over the stream, straight across (x 32-33)
  for (let y = 28; y <= 38; y++) for (const x of [32, 33]) {
    if (ground[i(x, y)] === GROUND.WATER) { ground[i(x, y)] = GROUND.BRIDGE; blocked[i(x, y)] = 0; keep[i(x, y)] = 1; }
  }

  // ---- Arrival ----
  one('sign', 35, 3, { interact: ['GREENMIRE RAINFOREST', 'North: Brambleford.', 'West: the Earth altar. East: the Fire altar. South, over the stream: the Body altar.'] });

  // ---- The altars ----
  prop('altar', [{ x: 11, y: 21 }, { x: 12, y: 21 }], { variant: 'earth' });
  prop('altar', [{ x: 52, y: 21 }, { x: 53, y: 21 }], { variant: 'fire' });
  prop('altar', [{ x: 32, y: 47 }, { x: 33, y: 47 }], { variant: 'body' });

  // Earth: mossy boulders round a muddy clearing
  for (let k = 0; k < 9; k++) {
    const a = (k / 9) * Math.PI * 2 + 0.4;
    const x = Math.round(12 + Math.cos(a) * 6), y = Math.round(22 + Math.sin(a) * 4.5);
    if (Math.abs(a - Math.PI * 2.05) < 0.5) continue; // leave the east side open for the path
    if (k % 3 === 0) decor('vineBoulder', x, y, 'mossy boulder', 'A boulder swallowed by moss and vines.'); else put('rock', x, y);
  }
  for (const [x, y] of [[9, 24], [15, 24], [13, 19]]) put('mushrooms', x, y, { blocks: false });

  // Fire: steaming vents, a pool of lava, black glass
  for (const [x, y] of [[48, 20], [56, 24], [49, 25], [55, 19]]) decor('emberVent', x, y, 'steam vent', 'Hot steam hisses out of a crack in the ground.', { light: ['#ff8a3a', 30, true] });
  decor('lavaPool', 55, 22, 'lava pool', 'A pool of bubbling lava, deep in the rainforest. The leaves nearby are scorched.', { wide: true, flat: true, light: ['#ff6a2a', 40, true] });
  for (const [x, y] of [[47, 23], [57, 21]]) decor('obsidianCluster', x, y, 'obsidian', 'Black volcanic glass, still warm.');

  // Body: an overgrown ruin, walls at the corners, a statue watching the altar
  for (const [x, y] of [[26, 43], [38, 43], [26, 51], [38, 51], [26, 47], [38, 47]]) one('ruinWall', x, y);
  prop('fallenPillar', [{ x: 28, y: 50 }, { x: 29, y: 50 }]);
  decor('hoodedStatue', 30, 45, 'mossy statue', 'A hooded figure carved in stone, its face worn smooth by the rain.');
  decor('hoodedStatue', 35, 45, 'mossy statue', 'A hooded figure carved in stone. Vines have crept into its sleeves.');
  for (const [x, y] of [[28, 46], [36, 49], [34, 50]]) put('rubble', x, y, { blocks: false });
  decor('vineBones', 37, 49, 'overgrown bones', 'Old bones, wrapped in vines. Someone came for the body runes and stayed.', { walk: true, flat: true });

  // ---- The rainforest: dense trees, bushes, ferny undergrowth ----
  const TREES = ['willow', 'oldOak', 'yew', 'oak', 'willow', 'oldOak'];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!free(x, y) || keep[i(x, y)] || ground[i(x, y)] !== GROUND.GRASS) continue;
    const edge = x < 2 || y < 2 || x >= W - 2 || y >= H - 2;
    const r = rng();
    if (edge || r < 0.16) one('tree', x, y, { variant: TREES[Math.floor(rng() * TREES.length)] });
    else if (r < 0.24) one('bush', x, y, { blocks: false });
    else if (r < 0.34) one('tallGrass', x, y, { blocks: false });
    else if (r < 0.36) one('mushrooms', x, y, { blocks: false });
    else if (r < 0.38) one('flowers', x, y, { blocks: false });
    else if (r < 0.385) decor('vineBoulder', x, y, 'mossy boulder', 'A boulder swallowed by moss and vines.');
    else if (r < 0.39) decor('thornTendrils', x, y, 'thorny vines', 'Thick thorny vines hang from the branches.', { walk: true });
  }

  return {
    id: 'rainforest',
    name: 'Greenmire Rainforest',
    W, H, ground, blocked, props,
    theme: 'jungle', // darker, lusher ground (v0.56.0)
    spawn: { x: 32, y: 2, facing: 0 },
    exits: [
      // back north over the bridge to Brambleford
      { tiles: [{ x: 32, y: 0 }, { x: 33, y: 0 }], to: 'brambleford', at: { x: 40, y: 51 }, facing: Math.PI },
    ],
    spawns: [],
  };
}
