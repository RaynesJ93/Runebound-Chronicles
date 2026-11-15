// The Slayer Caverns — behind Kesta's camp in south-west Thornwood (v0.48.0).
//
// One winding way through four sections, each with its own slayer monster,
// tougher the deeper you go:
//   entrance hall (south) → 1. the Crawling Pit (west, cave crawlers, Slayer 10)
//   → 2. the Roost (north-west, bloodbats, 25) → 3. the Wraith Gallery
//   (north, stone wraiths, 45) → 4. the Wyrm's Hearth (east, ember wyrms, 60).
// Corridors join them; a sign at each section's mouth says what's inside.

import { GROUND } from '../../src/world/area.js';
import { mulberry32 } from '../../src/core/rng.js';

const W = 64;
const H = 46;

// The four sections: centre, size, monster, how many, sign text.
const SECTIONS = [
  { name: 'THE CRAWLING PIT', cx: 11, cy: 32, rx: 8, ry: 6.5, enemy: 'caveCrawler', n: 6, slayer: 10,
    sign: { x: 19, y: 36 }, text: 'Cave crawlers. Their wounds close as you watch: hit hard and keep hitting.' },
  { name: 'THE ROOST', cx: 12, cy: 10, rx: 8.5, ry: 6.5, enemy: 'bloodbat', n: 6, slayer: 25,
    sign: { x: 13, y: 19 }, text: 'Bloodbats. Every bite heals them. Eat early.' },
  { name: 'THE WRAITH GALLERY', cx: 34, cy: 9, rx: 8.5, ry: 5.5, enemy: 'stoneWraith', n: 5, slayer: 45,
    sign: { x: 24, y: 11 }, text: 'Stone wraiths. Blades and arrows barely scratch them. Bring a hammer, or cast.' },
  { name: "THE WYRM'S HEARTH", cx: 51, cy: 28, rx: 9, ry: 8, enemy: 'emberWyrm', n: 4, slayer: 60,
    sign: { x: 46, y: 17 }, text: 'Ember wyrms. Every few bites, fire. The deepest and the deadliest.' },
];

export function buildSlayerCave() {
  const ground = new Uint8Array(W * H).fill(GROUND.ROCKWALL);
  const blocked = new Uint8Array(W * H).fill(1);
  const props = [];
  const spawns = [];
  const rng = mulberry32(8181);
  const inB = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
  const i = (x, y) => y * W + x;
  const path = new Uint8Array(W * H); // corridor tiles: nothing is put on these
  const dig = (x, y) => { if (inB(x, y) && x > 0 && y > 0 && x < W - 1 && y < H - 1) { ground[i(x, y)] = GROUND.CAVE; blocked[i(x, y)] = 0; } };
  const cavern = (cx, cy, rx, ry) => {
    for (let y = Math.floor(cy - ry - 1); y <= cy + ry + 1; y++) for (let x = Math.floor(cx - rx - 1); x <= cx + rx + 1; x++) {
      const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
      if (d < 0.78 || (d < 1.08 && rng() < 0.55)) dig(x, y);
    }
  };
  // A corridor two or three tiles wide, wandering a little, through each point in turn.
  const corridor = (...pts) => {
    for (let k = 1; k < pts.length; k++) {
      let [x, y] = pts[k - 1];
      const [x1, y1] = pts[k];
      const step = () => { for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) { dig(x + dx, y + dy); if (inB(x + dx, y + dy)) path[i(x + dx, y + dy)] = 1; } };
      while (x !== x1 || y !== y1) {
        step();
        if (x !== x1 && (y === y1 || rng() < 0.5)) x += Math.sign(x1 - x); else y += Math.sign(y1 - y);
      }
      step();
    }
  };

  // ---- The caverns and the corridors between them --------------------------------------
  cavern(32, 38, 6.5, 3.8); // the entrance hall
  for (let y = 36; y <= H - 2; y++) { dig(32, y); path[i(32, y)] = 1; } // out to Thornwood
  for (const s of SECTIONS) cavern(s.cx, s.cy, s.rx, s.ry);
  // Each corridor starts and ends well inside the caverns it joins.
  corridor([28, 38], [22, 39], [15, 34]);           // hall → Crawling Pit
  corridor([10, 28], [8, 22], [12, 19], [12, 14]);  // Crawling Pit → Roost
  corridor([17, 10], [23, 12], [29, 9]);            // Roost → Wraith Gallery
  corridor([39, 10], [44, 14], [47, 17], [49, 23]); // Wraith Gallery → Wyrm's Hearth

  const prop = (type, tiles, extra = {}) => {
    props.push({ type, tiles, x: tiles[0].x, y: tiles[0].y, ...extra });
    if (extra.blocks !== false) for (const t of tiles) blocked[i(t.x, t.y)] = 1;
  };
  const one = (type, x, y, extra) => prop(type, [{ x, y }], extra);
  const isFloor = (x, y) => inB(x, y) && ground[i(x, y)] === GROUND.CAVE && !blocked[i(x, y)];
  const free = (x, y) => isFloor(x, y) && !path[i(x, y)];
  // Only on open floor off the corridors (so nothing blocks the way), else the nearest such tile.
  const put = (type, x, y, extra) => {
    for (let r = 0; r < 4; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (free(x + dx, y + dy)) { one(type, x + dx, y + dy, extra); return; }
    }
  };

  // ---- The entrance hall ---------------------------------------------------------------
  one('caveMouth', 32, H - 2, { blocks: false });
  put('sign', 34, 41, { interact: ['THE SLAYER CAVERNS', 'Kesta\'s hunting ground. Deeper is deadlier.', 'West: the Crawling Pit, then the Roost, the Wraith Gallery and the Wyrm\'s Hearth.'] });
  for (const [x, y] of [[27, 36], [37, 36]]) put('lamp', x, y);
  put('crate', 36, 39);
  put('barrel', 37, 38);
  put('crate', 35, 40);

  // ---- The sections ----------------------------------------------------------------------
  for (const s of SECTIONS) {
    put('sign', s.sign.x, s.sign.y, { interact: [`${s.name} — SLAYER ${s.slayer}`, s.text] });
  }
  // Lamps along the way
  for (const [x, y] of [[27, 41], [10, 22], [22, 11], [45, 15], [5, 30], [16, 28], [7, 6], [17, 13], [30, 5], [39, 12]]) put('lamp', x, y);
  // 1. the Crawling Pit: rubble and old bones
  for (const [x, y] of [[6, 33], [14, 30], [10, 36], [16, 34]]) put('bones', x, y, { blocks: false });
  // 2. the Roost: bones everywhere, and crystals in the roof's drip
  for (const [x, y] of [[8, 8], [15, 7], [6, 12], [17, 11], [11, 14], [12, 6]]) put('bones', x, y, { blocks: false });
  for (const [x, y] of [[5, 9], [18, 8]]) put('crystalShard', x, y);
  // 3. the Wraith Gallery: broken pillars and old rune stones
  const pillarText = { interact: ['A fallen pillar, carved with faces worn smooth.'] };
  for (const [x, y] of [[30, 7], [37, 11]]) if (free(x, y) && free(x + 1, y)) prop('fallenPillar', [{ x, y }, { x: x + 1, y }], pillarText);
  const runeText = { interact: ['An old rune stone. The rune on it has been scratched out.'] };
  for (const [x, y] of [[28, 10], [40, 7], [34, 5]]) put('runeStone', x, y, runeText);
  // 4. the Wyrm's Hearth: braziers, scorched bones, a gem rock
  for (const [x, y] of [[46, 25], [56, 25], [51, 33]]) put('campfire', x, y, { action: 'cook', interact: ['A brazier of glowing coals. The wyrms keep it lit. You could cook on it.'] });
  for (const [x, y] of [[48, 30], [54, 29], [50, 22], [57, 31]]) put('bones', x, y, { blocks: false });
  put('ore', 58, 27, { variant: 'gem' });

  // Rubble scattered through the caves, never in the hall's doorway
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    if (!isFloor(x, y) || (y >= 40 && Math.abs(x - 32) <= 2)) continue;
    if (rng() < 0.05) one('rubble', x, y, { blocks: false });
  }

  // ---- Monsters: spread out in the middle of each section --------------------------------
  for (const s of SECTIONS) {
    const spots = [];
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const d = ((x - s.cx) / s.rx) ** 2 + ((y - s.cy) / s.ry) ** 2;
      if (d < 0.55 && isFloor(x, y)) spots.push({ x, y, r: rng() });
    }
    spots.sort((a, b) => a.r - b.r);
    const took = [];
    for (const p of spots) {
      if (took.length >= s.n) break;
      if (took.every((q) => Math.max(Math.abs(q.x - p.x), Math.abs(q.y - p.y)) >= 3)) took.push(p);
    }
    for (const p of took) spawns.push({ enemy: s.enemy, x: p.x, y: p.y });
  }

  return {
    id: 'slayerCave',
    name: 'The Slayer Caverns',
    W, H, ground, blocked, props, indoors: true,
    spawn: { x: 32, y: H - 3, facing: Math.PI },
    exits: [
      { tiles: [{ x: 32, y: H - 2 }], to: 'route1', at: { x: 38, y: 76 }, facing: 0 },
    ],
    spawns,
  };
}
