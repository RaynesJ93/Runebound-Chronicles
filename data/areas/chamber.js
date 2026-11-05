// Grubnak's chamber — behind the rune door at the top of the Goblin Warrens
// (The Runebound, chapter 6). Opens once you use Aldric's rune key (flag
// chamberOpen).
//
// A round cavern. Grubnak stands in the middle, held by four glowing chains
// that run to rune pillars around the walls (drawn in world2d.js from the
// pillars to him). A short tunnel at the south leads back to the warrens.
// Tobin waits just inside (his NPC entry, tobinChamber, is in npcs.js).

import { GROUND } from '../../src/world/area.js';
import { mulberry32 } from '../../src/core/rng.js';

const W = 32;
const H = 32;

export function buildChamber() {
  const ground = new Uint8Array(W * H).fill(GROUND.ROCKWALL);
  const blocked = new Uint8Array(W * H).fill(1);
  const props = [];
  const rng = mulberry32(6066);
  const inB = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
  const i = (x, y) => y * W + x;
  const dig = (x, y) => { if (inB(x, y) && x > 0 && y > 0 && x < W - 1 && y < H - 1) { ground[i(x, y)] = GROUND.CAVE; blocked[i(x, y)] = 0; } };

  // The round chamber, and the tunnel in from the south.
  const cx = 15.5, cy = 13;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const d = ((x + 0.5 - cx) / 11) ** 2 + ((y + 0.5 - cy) / 9.5) ** 2;
    if (d < 0.86 || (d < 1.0 && rng() < 0.5)) dig(x, y);
  }
  for (let y = 21; y <= 29; y++) { dig(15, y); dig(16, y); if (y > 23) dig(14, y); }

  const prop = (type, tiles, extra = {}) => {
    props.push({ type, tiles, x: tiles[0].x, y: tiles[0].y, ...extra });
    if (extra.blocks !== false) for (const t of tiles) blocked[i(t.x, t.y)] = 1;
  };
  const one = (type, x, y, extra) => prop(type, [{ x, y }], extra);

  // The way back to the warrens.
  one('caveMouth', 15, 29, { blocks: false });

  // Four rune pillars, each holding one of Grubnak's chains. During the fight,
  // 10 mind runes pull a chain tight (usePillar in main.js). Chain 0 is the one
  // that snaps in phase 2.
  const pillarText = ['A rune pillar, humming. A chain of blue light runs from it to Grubnak.', 'In a fight, you could feed it runes to pull his chain tight. Ten mind runes, Tobin said.'];
  [[9, 7], [22, 7], [8, 17], [23, 17]].forEach(([x, y], k) => one('runeStone', x, y, { pillar: true, chain: k, interact: pillarText }));

  for (const [x, y] of [[12, 22], [19, 22], [6, 12], [25, 12]]) one('lamp', x, y);
  for (const [x, y] of [[11, 10], [20, 9], [13, 16], [19, 17], [7, 14], [24, 15]]) one('bones', x, y, { blocks: false });
  for (const [x, y] of [[10, 18], [21, 18], [12, 6], [18, 5]]) one('rubble', x, y, { blocks: false });

  return {
    id: 'chamber',
    name: "Grubnak's chamber",
    W, H, ground, blocked, props, indoors: true,
    spawn: { x: 15, y: 27, facing: Math.PI },
    exits: [
      { tiles: [{ x: 15, y: 29 }], to: 'warrens', at: { x: 22, y: 7 }, facing: 0 },
    ],
    spawns: [
      // Gone for good once he's been beaten (the ending is in part 2).
      { enemy: 'grubnak', x: 15, y: 11, when: (f) => !f.grubnakDown },
    ],
  };
}
