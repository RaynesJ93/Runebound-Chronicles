// Route 1 — Thornwood Forest.
// A winding road north from Brambleford, through thick woods, over a stream,
// past Bram the woodcutter's cabin, a goblin camp (west) and a wolf den
// (north-east), to Copperdeep Mine at the top of the road.
//
// Goblins and wolves move in with Batch 3; their clearings are ready for them.

import { GROUND } from '../../src/world/area.js';
import { mulberry32 } from '../../src/core/rng.js';

const W = 34;
const H = 60;

export function buildRoute1() {
  const ground = new Uint8Array(W * H);
  const blocked = new Uint8Array(W * H);
  const open = new Uint8Array(W * H); // tiles kept clear of forest
  const props = [];
  const buildings = [];
  const rng = mulberry32(51);

  const inB = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
  const i = (x, y) => y * W + x;
  const paint = (x, y, g) => { if (inB(x, y)) { ground[i(x, y)] = g; open[i(x, y)] = 1; } };
  const rect = (x0, y0, x1, y1, g) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) paint(x, y, g); };
  const clear = (x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (inB(x, y)) open[i(x, y)] = 1; };
  const block = (x, y) => { if (inB(x, y)) blocked[i(x, y)] = 1; };
  const taken = new Uint8Array(W * H);
  const free = (x, y) => inB(x, y) && !blocked[i(x, y)] && !taken[i(x, y)];
  const prop = (type, tiles, extra = {}) => {
    const p = { type, tiles, x: tiles[0].x, y: tiles[0].y, ...extra };
    for (const t of tiles) { if (inB(t.x, t.y)) taken[i(t.x, t.y)] = 1; if (extra.blocks !== false) block(t.x, t.y); }
    props.push(p);
    return p;
  };
  const one = (type, x, y, extra) => prop(type, [{ x, y }], extra);
  const placeIfFree = (type, x, y, extra) => { if (free(x, y) && ground[i(x, y)] === GROUND.GRASS) one(type, x, y, extra); };

  // ---- The road (two tiles wide) -------------------------------------------------
  rect(16, 50, 17, 59, GROUND.PATH);
  for (let k = 0; k <= 6; k++) rect(16 + k, 49 - k, 17 + k, 50 - k, GROUND.PATH);
  rect(22, 21, 23, 44, GROUND.PATH);
  for (let k = 0; k <= 10; k++) rect(21 - k, 20 - k, 23 - k, 21 - k, GROUND.PATH);
  rect(12, 0, 13, 11, GROUND.PATH);

  // ---- Stream with a bridge where the road crosses ----------------------------------
  for (let x = 0; x < W; x++) {
    const cy = 29 + Math.round(Math.sin(x / 3.6) * 1.3);
    for (let y = cy - 1; y <= cy + 1; y++) {
      const onRoad = ground[i(x, y)] === GROUND.PATH;
      ground[i(x, y)] = onRoad ? GROUND.BRIDGE : GROUND.WATER;
      open[i(x, y)] = 1;
      if (!onRoad) { block(x, y); taken[i(x, y)] = 1; }
    }
    clear(x, cy - 2, x, cy + 2); // grassy banks
  }

  // Fishing spots on the stream: fast water for lure fishing, a calmer pool for bait.
  // The bank tile beside each is kept clear so you can always reach it.
  const streamY = (x) => 29 + Math.round(Math.sin(x / 3.6) * 1.3);
  for (const [x, side, variant] of [[18, -1, 'lure'], [20, -1, 'lure'], [10, -1, 'lure'], [14, -1, 'bait']]) {
    const y = streamY(x) + side;
    props.push({ type: 'fishingSpot', tiles: [{ x, y }], x, y, variant });
    taken[i(x, y)] = 1;
    taken[i(x, y + side)] = 1; // the bank
  }

  // ---- Clearings ---------------------------------------------------------------------
  // Goblin camp (west), linked by a little trail
  rect(3, 40, 11, 50, GROUND.GRASS); clear(3, 40, 11, 50);
  rect(12, 46, 18, 47, GROUND.PATH);
  rect(5, 44, 9, 47, GROUND.PATH); // trampled earth around the fire
  // Wolf den (north-east)
  clear(23, 6, 31, 16);
  rect(14, 13, 22, 13, GROUND.PATH);
  // Bram's cabin (east of the road, south of the stream)
  clear(24, 33, 31, 41);
  rect(24, 39, 28, 39, GROUND.PATH);
  rect(28, 37, 28, 38, GROUND.PATH);
  // Small glade by the south entrance
  clear(9, 52, 15, 57);

  // ---- Bram's cabin -------------------------------------------------------------------
  const cabin = { id: 'cabin', kind: 'cabin', label: null, sign: 'bow', x: 26, y: 33, w: 5, h: 4, doorX: 28, doorW: 1,
    doorText: ["Bram's cabin. It smells of pine sap and woodsmoke.", 'A board by the door shows a bow and arrow: "New adventurers — ask Bram for a free bow!"'] };
  for (let y = cabin.y; y < cabin.y + cabin.h; y++) for (let x = cabin.x; x < cabin.x + cabin.w; x++) { block(x, y); taken[i(x, y)] = 1; }
  buildings.push({ ...cabin, doorTiles: [{ x: cabin.doorX, y: cabin.y + cabin.h - 1 }] });
  props.push({ type: 'door', tiles: [{ x: cabin.doorX, y: cabin.y + cabin.h - 1 }], x: cabin.doorX, y: cabin.y + cabin.h - 1, building: 'cabin', interact: cabin.doorText });
  prop('logPile', [{ x: 25, y: 37 }, { x: 26, y: 37 }], { interact: ['A neat pile of logs, ready for the winter.'] });
  for (const [x, y] of [[30, 38], [25, 40], [31, 40]]) one('stump', x, y);
  one('crate', 24, 36);

  // ---- Goblin camp props ----------------------------------------------------------------
  prop('tent', [{ x: 4, y: 41 }, { x: 5, y: 41 }], { interact: ['A grubby goblin tent. It smells awful.', 'Nobody is home... for now.'] });
  prop('tent', [{ x: 8, y: 41 }, { x: 9, y: 41 }], { interact: ['Another goblin tent, patched with old sacks.'] });
  one('campfire', 7, 45, { action: 'cook', interact: ['A campfire, still warm. The goblins must be nearby.'] });
  for (const [x, y] of [[4, 47], [10, 44]]) one('crate', x, y);
  for (const [x, y] of [[6, 48], [9, 47], [3, 45]]) one('bones', x, y, { blocks: false });

  // ---- Wolf den: rocks and bones --------------------------------------------------------
  for (const [x, y] of [[26, 7], [27, 7], [29, 8], [30, 10], [24, 9], [28, 12], [31, 14], [25, 15]]) one('rock', x, y);
  for (const [x, y] of [[27, 10], [25, 12], [29, 13]]) one('bones', x, y, { blocks: false });

  // ---- North end: rockslide over the mine road -------------------------------------------
  // ---- North end: the mine entrance (the rockslide has been cleared to the sides) --------
  for (const [x, y] of [[11, 1], [14, 1], [11, 0], [14, 0], [10, 0], [15, 0]]) one('rock', x, y);
  one('rubble', 15, 2, { blocks: false });
  one('rubble', 10, 2, { blocks: false });

  // ---- Signs -------------------------------------------------------------------------------
  one('sign', 19, 56, { interact: ['ROUTE 1 — Thornwood Forest.', 'North: Copperdeep Mine.  South: Brambleford.'] });
  one('sign', 14, 45, { interact: ['DANGER! Goblin camp to the west.', 'Signed, the Brambleford Watch.'] });
  one('sign', 14, 16, { interact: ['Wolf den to the east. Travel in daylight.'] });
  one('sign', 24, 42, { interact: ["Bram's Woodcutting — logs, kindling and advice.", 'New to adventuring? Ask Bram for a FREE bow and arrows!'] });
  one('sign', 14, 9, { interact: ['Copperdeep Mine — just ahead. Open again!', 'Miners wanted: see Dorrin inside.'] });

  // ---- Forest: thickest far from the road and clearings ------------------------------------
  const dist = new Int16Array(W * H).fill(99);
  const q = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (open[i(x, y)]) { dist[i(x, y)] = 0; q.push(i(x, y)); }
  for (let h = 0; h < q.length; h++) {
    const c = q[h]; const cx = c % W; const cy = (c / W) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = cx + dx, ny = cy + dy;
      if (!inB(nx, ny) || dist[i(nx, ny)] !== 99) continue;
      dist[i(nx, ny)] = dist[c] + 1; q.push(i(nx, ny));
    }
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const d = dist[i(x, y)];
    const edge = x === 0 || x === W - 1;
    const chance = edge ? 1 : d === 0 ? 0 : d === 1 ? 0.25 : d === 2 ? 0.6 : 0.9;
    if (rng() < chance) placeIfFree('tree', x, y, { variant: rng() < 0.65 ? 'pine' : 'oak' });
  }
  // a few trees inside the clearings, so they don't look mown
  for (const [x, y] of [[10, 55], [25, 34], [3, 49], [30, 16]]) placeIfFree('tree', x, y, { variant: 'oak' });

  // ---- Undergrowth: tall grass, bushes, flowers, mushrooms ----------------------------------
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!free(x, y) || ground[i(x, y)] !== GROUND.GRASS) continue;
    const r = rng();
    const patch = Math.sin(x * 0.7) + Math.cos(y * 0.45) > 0.9;
    if (patch && r < 0.85) one('tallGrass', x, y, { blocks: false });
    else if (r < 0.03) one('bush', x, y);
    else if (r < 0.07) one('flowers', x, y, { blocks: false });
    else if (r < 0.1) one('mushrooms', x, y, { blocks: false });
  }

  return {
    id: 'route1',
    name: 'Route 1 — Thornwood',
    W, H, ground, blocked, props, buildings,
    spawn: { x: 16, y: 58, facing: Math.PI },
    exits: [
      { tiles: [{ x: 16, y: 59 }, { x: 17, y: 59 }], to: 'brambleford', at: { x: 21, y: 1 }, facing: 0 },
      { tiles: [{ x: 12, y: 0 }, { x: 13, y: 0 }], to: 'mine', at: { x: 15, y: 26 }, facing: Math.PI },
    ],
    // Monsters and where they live (see data/enemies.js).
    spawns: [
      { enemy: 'goblin', x: 6, y: 44 },
      { enemy: 'goblin', x: 9, y: 46 },
      { enemy: 'goblin', x: 4, y: 49 },
      { enemy: 'goblin', x: 10, y: 49 },
      { enemy: 'goblin', x: 13, y: 47 },
      { enemy: 'goblinBrute', x: 6, y: 42 },
      // The wolf den (north-east)
      { enemy: 'wolf', x: 25, y: 11 },
      { enemy: 'wolf', x: 28, y: 14 },
      { enemy: 'wolf', x: 30, y: 9 },
      { enemy: 'alphaWolf', x: 28, y: 9 },
    ],
  };
}
