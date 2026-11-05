// The Goblin Warrens — under the sealed cave in north-west Thornwood
// (The Runebound, chapter 5). Opens once you break the boulders (flag caveOpen).
//
// A landing at the south (back up to Thornwood), a winding tunnel north with a
// den on each side full of warren goblins, and the great dig at the north end,
// where the goblins are chipping at the rune-sealed door of Grubnak's chamber.

import { GROUND } from '../../src/world/area.js';
import { mulberry32 } from '../../src/core/rng.js';

const W = 44;
const H = 36;

export function buildWarrens() {
  const ground = new Uint8Array(W * H).fill(GROUND.ROCKWALL);
  const blocked = new Uint8Array(W * H).fill(1);
  const props = [];
  const rng = mulberry32(5150);
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

  // ---- Caverns -------------------------------------------------------------------
  cavern(22, 30, 5, 3);      // the landing
  dig(22, 34);
  for (let y = 31; y <= 34; y++) dig(22, y);
  tunnel(21, 27, 19, 20);    // north, winding
  tunnel(19, 20, 23, 14);
  tunnel(23, 14, 22, 10);    // up into the great dig
  cavern(9, 21, 6, 5);       // the west den
  tunnel(17, 21, 12, 21);
  cavern(35, 18, 6, 5);      // the east den
  tunnel(23, 17, 31, 18);
  cavern(22, 7, 10, 5);      // the great dig
  for (let y = 2; y <= 4; y++) for (let x = 20; x <= 24; x++) dig(x, y);

  const prop = (type, tiles, extra = {}) => {
    props.push({ type, tiles, x: tiles[0].x, y: tiles[0].y, ...extra });
    if (extra.blocks !== false) for (const t of tiles) blocked[i(t.x, t.y)] = 1;
  };
  const one = (type, x, y, extra) => prop(type, [{ x, y }], extra);
  const isFloor = (x, y) => inB(x, y) && ground[i(x, y)] === GROUND.CAVE && !blocked[i(x, y)];
  const put = (type, x, y, extra) => { if (isFloor(x, y)) one(type, x, y, extra); };

  // ---- The landing ---------------------------------------------------------------
  one('caveMouth', 22, 34, { blocks: false });
  one('sign', 25, 31, { interact: ['Scratched into a plank, in goblin letters:', '"KEEP OUT. DIGGING. BY ORDER OF THE CHIEF OF CHIEFS."'] });
  for (const [x, y] of [[18, 30], [26, 29]]) put('lamp', x, y);
  put('crate', 18, 32);
  put('barrel', 26, 32);

  // ---- The dens ------------------------------------------------------------------
  put('campfire', 9, 21, { interact: ['A smoky goblin cookfire. Something is roasting on it. Best not to ask what.'] });
  put('campfire', 35, 18, { interact: ['A goblin cookfire, still warm.'] });
  for (const [x, y] of [[6, 18], [12, 24], [5, 23], [33, 15], [38, 21], [31, 20]]) put('bones', x, y, { blocks: false });
  for (const [x, y] of [[4, 20], [13, 18], [38, 15], [39, 19]]) put('crate', x, y);
  for (const [x, y] of [[5, 25], [34, 22]]) put('barrel', x, y);

  // ---- The great dig -------------------------------------------------------------
  // Grubnak's chamber door: sealed with the runekeepers' runes, which the
  // goblins have been chipping at. Glowing rune stones stand either side.
  prop('runeDoor', [{ x: 21, y: 2 }, { x: 22, y: 2 }, { x: 23, y: 2 }], { chamberDoor: true, interact: ['A great door of solid rock, carved all over with runes. They glow a faint, steady blue.', 'Something behind it is breathing.'] });
  one('runeStone', 19, 3, { interact: ['A standing stone carved with a glowing rune. Part of the seal on the door.'] });
  one('runeStone', 25, 3, { interact: ['A standing stone carved with a glowing rune. Someone has been hacking at it with a pick.'] });
  for (const [x, y] of [[14, 6], [30, 6], [16, 10], [28, 10]]) put('lamp', x, y);
  for (const [x, y] of [[17, 5], [27, 5], [15, 8], [29, 8], [20, 9], [24, 9]]) put('rubble', x, y, { blocks: false });
  for (const [x, y] of [[13, 8], [31, 8]]) put('crate', x, y);

  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    if (!isFloor(x, y) || (x >= 20 && x <= 24 && y >= 28)) continue;
    if (rng() < 0.05) one('rubble', x, y, { blocks: false });
  }

  return padTop({
    id: 'warrens',
    name: 'Goblin Warrens',
    W, H, ground, blocked, props, indoors: true,
    spawn: { x: 22, y: 32, facing: Math.PI },
    exits: [
      { tiles: [{ x: 22, y: 34 }], to: 'route1', at: { x: 7, y: 8 }, facing: 0 },
    ],
    spawns: [
      { enemy: 'warrenGoblin', x: 7, y: 20 },
      { enemy: 'warrenGoblin', x: 11, y: 23 },
      { enemy: 'warrenGoblin', x: 6, y: 24 },
      { enemy: 'warrenGoblin', x: 34, y: 16 },
      { enemy: 'warrenGoblin', x: 37, y: 20 },
      { enemy: 'warrenGoblin', x: 32, y: 19 },
      { enemy: 'warrenGoblin', x: 17, y: 7 },
      { enemy: 'warrenGoblin', x: 27, y: 7 },
      { enemy: 'goblinDigmaster', x: 22, y: 6 },
    ],
  }, PAD);
}

// Solid rock added above the map, so the camera (which stops at the map's
// edge) can show the chamber door below the buttons at the top of the screen.
// Everything above is laid out without it; this shifts it all down.
const PAD = 3;
function padTop(a, n) {
  const H2 = a.H + n;
  const ground = new Uint8Array(a.W * H2).fill(GROUND.ROCKWALL);
  const blocked = new Uint8Array(a.W * H2).fill(1);
  ground.set(a.ground, a.W * n);
  blocked.set(a.blocked, a.W * n);
  const down = (t) => ({ ...t, y: t.y + n });
  return {
    ...a, H: H2, ground, blocked,
    props: a.props.map((p) => ({ ...p, y: p.y + n, tiles: p.tiles.map(down) })),
    spawn: down(a.spawn),
    exits: a.exits.map((e) => ({ ...e, tiles: e.tiles.map(down) })),
    spawns: a.spawns.map(down),
  };
}
