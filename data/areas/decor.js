// Finishing touches added to an area after it's built: reeds along the
// water's edge and lily pads out on open water. They're scenery only (you can
// walk through reeds), and they keep clear of fishing spots and anything else
// already there.

import { GROUND } from '../../src/world/area.js';

const hash = (x, y, s) => {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

export function waterEdges(def) {
  const { W, H, ground, props } = def;
  const g = (x, y) => (x >= 0 && y >= 0 && x < W && y < H ? ground[y * W + x] : -1);
  const used = new Set();
  const nearFish = new Set();
  for (const p of props) for (const t of p.tiles) {
    used.add(t.y * W + t.x);
    if (p.type === 'fishingSpot') for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) nearFish.add((t.y + dy) * W + t.x + dx);
  }
  for (const e of def.exits || []) for (const t of e.tiles) used.add(t.y * W + t.x);
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const k = y * W + x;
    if (used.has(k) || nearFish.has(k)) continue;
    const t = g(x, y);
    if (t === GROUND.GRASS || t === GROUND.SAND) {
      const shore = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => g(x + dx, y + dy) === GROUND.WATER);
      if (shore && hash(x, y, 7) < 0.28) props.push({ type: 'reeds', tiles: [{ x, y }], x, y, blocks: false });
    } else if (t === GROUND.WATER) {
      let open = true;
      for (let dy = -1; dy <= 1 && open; dy++) for (let dx = -1; dx <= 1; dx++) if (g(x + dx, y + dy) !== GROUND.WATER) { open = false; break; }
      if (open && hash(x, y, 9) < 0.06) props.push({ type: 'lilyPads', tiles: [{ x, y }], x, y, blocks: false });
    }
  }
  return def;
}
