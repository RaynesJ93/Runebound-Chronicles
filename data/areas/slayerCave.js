// The Slayer Caverns — behind Kesta's camp in south-west Thornwood (v0.48.0).
//
// One winding way through four sections, each with its own slayer monster,
// tougher the deeper you go:
//   entrance hall (south) → 1. the Crawling Pit (west, cave crawlers, Slayer 10)
//   → 2. the Roost (north-west, bloodbats, 25) → 3. the Wraith Gallery
//   (north, stone wraiths, 45) → 4. the Wyrm's Hearth (east, ember wyrms, 60)
//   → 5. the Overgrowth (far north-east, vinegrasp horrors, 70; v0.49.0).
// Corridors join them; a sign at each section's mouth says what's inside.

import { GROUND } from '../../src/world/area.js';
import { mulberry32 } from '../../src/core/rng.js';

const W = 84; // v0.49.0: wider, for the Overgrowth (east)
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
    sign: { x: 46, y: 17 }, text: 'Ember wyrms. Every few bites, fire. Past them, something worse.' },
  { name: 'THE OVERGROWTH', cx: 72, cy: 14, rx: 8.5, ry: 7, enemy: 'vinegraspHorror', n: 5, slayer: 70,
    sign: { x: 61, y: 21 }, text: 'Vinegrasp horrors. Their vines will hold you in place. The deepest and the deadliest.' },
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
  corridor([56, 24], [60, 21], [64, 18], [68, 15]); // Wyrm's Hearth → the Overgrowth

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
  // Each section's own painted decorations (art decor:<key>, v0.48.1). flat: lies
  // on the ground (drawn under you); walk: you can walk over it.
  const decor = (key, x, y, name, text, opt = {}) => {
    const wide = opt.wide;
    for (let r = 0; r < 4; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      const tx = x + dx, ty = y + dy;
      if (!free(tx, ty) || (wide && !free(tx + 1, ty))) continue;
      const tiles = wide ? [{ x: tx, y: ty }, { x: tx + 1, y: ty }] : [{ x: tx, y: ty }];
      prop('decor', tiles, { art: key, name, flat: !!opt.flat, blocks: !opt.walk, interact: [text] });
      return;
    }
  };
  // 1. the Crawling Pit: eggs, shed shells and slime
  for (const [x, y] of [[5, 29], [15, 36]]) decor('crawlerEggs', x, y, 'crawler eggs', 'A clutch of pale crawler eggs, soft and faintly warm.');
  for (const [x, y] of [[9, 26], [17, 31]]) decor('crawlerHusk', x, y, 'shed shell', 'A crawler\'s shed shell, split down the back.');
  for (const [x, y] of [[8, 31], [13, 34], [4, 34]]) decor('slimePuddle', x, y, 'slime', 'A puddle of green slime. It smells of rot.', { flat: true, walk: true });
  for (const [x, y] of [[12, 27], [6, 37]]) decor('dripStalagmite', x, y, 'stalagmite', 'A stalagmite, slick with dripping water.');
  for (const [x, y] of [[10, 33], [16, 28]]) decor('glowMoss', x, y, 'glowing moss', 'Moss that glows faintly green. Tiny worms wriggle in it.', { walk: true });
  decor('gnawedRocks', 13, 37, 'gnawed rocks', 'Rocks and bones, gnawed smooth.');
  // 2. the Roost: nests, skulls and blood
  for (const [x, y] of [[6, 7], [17, 12]]) decor('boneNest', x, y, 'bone nest', 'A nest of twigs and bones. Something red lies in the middle.');
  for (const [x, y] of [[15, 6], [5, 13]]) decor('skullPile', x, y, 'skulls', 'A heap of skulls, picked clean.');
  for (const [x, y] of [[10, 9], [14, 12], [8, 13]]) decor('bloodPool', x, y, 'blood', 'A dark pool of blood. Still wet.', { flat: true, walk: true });
  for (const [x, y] of [[11, 5], [18, 9]]) decor('clawedStalagmite', x, y, 'stalagmite', 'Deep claw marks score this stalagmite.');
  decor('roostRock', 4, 9, 'fallen rock', 'A lump of the roof that fell, streaked red.');
  for (const [x, y] of [[12, 15], [7, 10]]) decor('featherHeap', x, y, 'fur and bones', 'Fur, bones and feathers: what the bloodbats left.', { flat: true, walk: true });
  // 3. the Wraith Gallery: statues, graves and spectral candles
  decor('hoodedStatue', 30, 6, 'hooded statue', 'A statue of a hooded figure, broken at the knees. Its face is worn away.', { wide: true });
  decor('hoodedStatue', 38, 12, 'hooded statue', 'Another hooded statue. This one has fallen to its knees.', { wide: true });
  for (const [x, y] of [[33, 5], [28, 11]]) decor('graveSlab', x, y, 'grave slab', 'A grave slab. The name has been scratched out.');
  for (const [x, y] of [[40, 7], [35, 12]]) decor('runePillar', x, y, 'rune pillar', 'A pillar carved with runes that glow a cold blue.');
  for (const [x, y] of [[31, 10], [37, 6]]) decor('ghostCandles', x, y, 'ghost candles', 'Candles burning with pale blue flame. They give no heat.', { walk: true });
  for (const [x, y] of [[26, 8], [41, 10]]) decor('masonryRubble', x, y, 'rubble', 'Broken masonry from the walls.', { walk: true });
  decor('spiritUrn', 36, 9, 'spirit urn', 'A stone urn. Blue mist curls out of it and won\'t blow away.');
  // 4. the Wyrm's Hearth: lava, embers and the wyrms' hoard
  decor('lavaPool', 53, 23, 'lava pool', 'A pool of bubbling lava. Don\'t.', { wide: true, flat: true });
  decor('lavaPool', 47, 32, 'lava pool', 'A pool of bubbling lava. The air shimmers over it.', { wide: true, flat: true });
  for (const [x, y] of [[49, 26], [55, 31]]) decor('emberVent', x, y, 'ember vent', 'A crack in the floor, breathing smoke and sparks.', { walk: true });
  for (const [x, y] of [[44, 28], [57, 28]]) decor('charredSkeleton', x, y, 'charred skeleton', 'Someone who came for the treasure.', { flat: true, walk: true });
  decor('dragonEgg', 58, 24, 'scorched egg', 'A huge scorched egg, hot to the touch. Something inside shifts.');
  decor('scorchedHoard', 59, 30, 'scorched hoard', 'Coins and gems, fused together by the heat. Not worth the burns.', { walk: true });
  for (const [x, y] of [[45, 24], [52, 34]]) decor('obsidianCluster', x, y, 'obsidian', 'Jagged black glass, grown from cooled lava.');
  for (const [x, y] of [[46, 25], [56, 25], [51, 33]]) put('campfire', x, y, { action: 'cook', interact: ['A brazier of glowing coals. The wyrms keep it lit. You could cook on it.'] });
  put('ore', 58, 27, { variant: 'gem' });
  // 5. the Overgrowth: roots, thorns, glowing fungus and rotting wood
  for (const [x, y] of [[66, 10], [77, 9], [79, 16], [68, 19], [74, 20], [64, 14]]) put('thornBush', x, y);
  for (const [x, y] of [[70, 9], [76, 13], [67, 16], [72, 19]]) put('glowShrooms', x, y, { blocks: false });
  for (const [x, y] of [[73, 8], [65, 17], [78, 19]]) put('glowFlowers', x, y, { blocks: false });
  for (const [x, y] of [[71, 12], [77, 17]]) put('mushrooms', x, y, { blocks: false });
  put('hollowLog', 74, 16);
  put('skeleton', 69, 13, { blocks: false, interact: ['A skeleton, wound tight in old vines.'] });
  for (const [x, y] of [[66, 12], [75, 11], [70, 17], [79, 13]]) put('tallGrass', x, y, { blocks: false });
  for (const [x, y] of [[62, 19], [79, 11]]) put('lamp', x, y);

  const zones0 = (x, y) => SECTIONS.some((s) => ((x - s.cx) / s.rx) ** 2 + ((y - s.cy) / s.ry) ** 2 < 1.2);
  // Rubble scattered through the caves (less in the sections), never in the hall's doorway
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    if (!isFloor(x, y) || (y >= 40 && Math.abs(x - 32) <= 2)) continue;
    if (rng() < (zones0(x, y) ? 0.02 : 0.05)) one('rubble', x, y, { blocks: false });
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

  // ---- Zones: each section's own floor and wall textures (v0.48.1) ---------------------
  // Every tile takes the look of the nearest section (or the hall's plain cave).
  const zones = new Uint8Array(W * H);
  const centres = [{ cx: 32, cy: 38, rx: 10, ry: 7, z: 0 }, ...SECTIONS.map((s, k) => ({ ...s, z: k + 1 }))];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let best = 0, bd = Infinity;
    for (const c of centres) {
      const d = Math.hypot((x - c.cx) / c.rx, (y - c.cy) / c.ry);
      if (d < bd) { bd = d; best = c.z; }
    }
    zones[i(x, y)] = best;
  }

  return {
    id: 'slayerCave',
    name: 'The Slayer Caverns',
    W, H, ground, blocked, props, indoors: true,
    zones, zoneTex: ['Crawl', 'Roost', 'Wraith', 'Wyrm', 'Vine'],
    spawn: { x: 32, y: H - 3, facing: Math.PI },
    exits: [
      { tiles: [{ x: 32, y: H - 2 }], to: 'route1', at: { x: 38, y: 76 }, facing: 0 },
    ],
    spawns,
  };
}
