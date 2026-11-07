// The map: an area drawn small (ground, trees, water, buildings), plus the
// markers to put on top of it — you, villagers, monsters, skilling spots, the
// bank and shop, the ways out, and place names from data/mapLabels.js.

import { GROUND, Area } from '../world/area.js';
import { AREAS } from '../../data/areas/index.js';
import { NPCS } from '../../data/npcs.js';
import { ENEMIES } from '../../data/enemies.js';
import { LABELS, MAP_NAME, INSIDE } from '../../data/mapLabels.js';
import { iconUrl } from '../render/icons.js';
import { itemIcon } from '../render/items.js';

export const PX = 6; // canvas pixels per tile

const rgb = (h) => `#${h.toString(16).padStart(6, '0')}`;

const PALETTE = {
  normal: {
    [GROUND.GRASS]: '#6aa84a', [GROUND.PATH]: '#d2b47a', [GROUND.PLAZA]: '#bdb19a', [GROUND.WATER]: '#3f86c6',
    [GROUND.SAND]: '#e4d08e', [GROUND.DIRT]: '#9a7a50', [GROUND.BRIDGE]: '#8a5a32', [GROUND.FLOOR]: '#a88458',
    [GROUND.WALL]: '#4a3a2c', [GROUND.CAVE]: '#7a6a58', [GROUND.ROCKWALL]: '#4c4a4e',
    tree: '#2f6a2a', treeDark: '#24561f', rock: '#8a8a86', fence: '#6e4a28', roof: '#9a3b30', edge: '#2b1d16',
  },
  vale: {
    [GROUND.GRASS]: '#3e5a5a', [GROUND.PATH]: '#8a8070', [GROUND.PLAZA]: '#8a8a94', [GROUND.WATER]: '#2a5a8a',
    [GROUND.SAND]: '#a8a080', [GROUND.DIRT]: '#5a4e48', [GROUND.BRIDGE]: '#6a4a32', [GROUND.FLOOR]: '#7a6a58',
    [GROUND.WALL]: '#2e2a30', [GROUND.CAVE]: '#5a5060', [GROUND.ROCKWALL]: '#3a3840',
    tree: '#2a3248', treeDark: '#3a2a48', rock: '#6a6a78', fence: '#4a3a2c', roof: '#6a4a6a', edge: '#14101a',
  },
};

// Props that mean something on the map, and the icon each gets.
const SPOT = {
  fishingSpot: { icon: () => iconUrl('fishing'), name: 'Fishing' },
  ore: { icon: () => iconUrl('mining'), name: 'Mining' },
  furnace: { icon: () => iconUrl('smithing'), name: 'Furnace' },
  anvil: { icon: () => iconUrl('smithing'), name: 'Anvil' },
  cookingPit: { icon: () => iconUrl('cooking'), name: 'Cooking' },
  campfire: { icon: () => iconUrl('cooking'), name: 'Cooking' },
  tanningRack: { icon: () => iconUrl('crafting'), name: 'Tanning' },
  altar: { icon: () => iconUrl('runecrafting'), name: 'Altar' },
  campChest: { icon: () => itemIcon('coins').url, name: 'Bank chest' },
};
const BUILDING_SPOT = {
  bank: { icon: () => itemIcon('coins').url, name: 'Bank' },
  store: { icon: () => itemIcon('bag').url, name: 'General Store' },
};

const built = new Map();
const areaFor = (id) => {
  if (!built.has(id)) built.set(id, new Area(AREAS[id]()));
  return built.get(id);
};

// The map to show for where the player is: rooms show the outside, with the
// player at the door they came in through.
export function mapPlace(areaId, x, y) {
  const outside = INSIDE[areaId];
  if (!outside) return { id: areaId, x, y };
  const a = areaFor(outside);
  const door = a.exits.find((e) => e.to === areaId)?.tiles[0];
  return { id: outside, x: door?.x ?? a.spawn.x, y: door?.y ?? a.spawn.y };
}

export function drawArea(id) {
  const a = areaFor(id);
  const pal = PALETTE[a.theme === 'vale' ? 'vale' : 'normal'];
  const c = document.createElement('canvas');
  c.width = a.W * PX;
  c.height = a.H * PX;
  const g = c.getContext('2d');
  for (let y = 0; y < a.H; y++) for (let x = 0; x < a.W; x++) {
    g.fillStyle = pal[a.ground[a.idx(x, y)]] || pal[GROUND.GRASS];
    g.fillRect(x * PX, y * PX, PX, PX);
  }
  for (const p of a.props) {
    if (p.blocks === false) continue;
    const fill = p.type === 'tree' ? ((p.x + p.y) % 3 ? pal.tree : pal.treeDark)
      : p.type === 'rock' || p.type === 'rubble' ? pal.rock
      : p.type === 'fence' ? pal.fence : null;
    if (!fill) continue;
    g.fillStyle = fill;
    for (const t of p.tiles) {
      if (p.type === 'tree') { g.beginPath(); g.arc((t.x + 0.5) * PX, (t.y + 0.5) * PX, PX * 0.62, 0, Math.PI * 2); g.fill(); }
      else if (p.type === 'fence') g.fillRect(t.x * PX + PX * 0.25, t.y * PX + PX * 0.25, PX * 0.5, PX * 0.5);
      else g.fillRect(t.x * PX + 1, t.y * PX + 1, PX - 2, PX - 2);
    }
  }
  for (const b of a.buildings) {
    g.fillStyle = pal.edge;
    g.fillRect(b.x * PX, b.y * PX, b.w * PX, b.h * PX);
    g.fillStyle = b.roof != null ? rgb(b.roof) : b.kind === 'bank' ? '#5a6a8a' : b.kind === 'store' ? '#9a6a2a' : b.kind === 'cabin' ? '#6a4a2a' : pal.roof;
    g.fillRect(b.x * PX + 1, b.y * PX + 1, b.w * PX - 2, b.h * PX - 2);
  }
  return c;
}

// Everything to put on top of the map, in tiles. `live` (optional) has the
// current npcs and enemies, so they show where they are right now; otherwise
// they show at home.
export function markers(id, live, star = null, flags = {}) {
  const a = areaFor(id);
  const out = [];
  // Skilling spots: one icon per cluster of the same kind.
  for (const p of a.props) {
    const s = SPOT[p.type];
    if (!s) continue;
    const kind = p.type === 'anvil' ? 'furnace' : p.type === 'campfire' ? 'cookingPit' : p.type;
    if (out.some((m) => m.kind === kind && Math.hypot(m.x - p.x, m.y - p.y) < 6)) continue;
    out.push({ type: 'spot', kind, x: p.x + (p.tiles.length > 1 ? 1 : 0.5), y: p.y + 0.5, icon: s.icon(), name: s.name });
  }
  // Lodestones you've attuned.
  for (const p of a.props) if (p.type === 'lodestone' && flags?.lodestones?.[p.lodestone]) out.push({ type: 'spot', kind: 'lodestone', x: p.x + 0.5, y: p.y + 0.5, icon: iconUrl('runecrafting'), name: 'Lodestone' });
  for (const b of a.buildings) {
    const s = BUILDING_SPOT[b.kind];
    if (s) out.push({ type: 'spot', kind: b.kind, x: b.x + b.w / 2, y: b.y + b.h / 2, icon: s.icon(), name: s.name });
  }
  // Ways out (not doors into rooms, which the buildings already show).
  for (const e of a.exits) {
    if (INSIDE[e.to] || (e.when && !e.when(flags || {}))) continue;
    const t = e.tiles[0];
    const edge = t.y <= 1 ? 'n' : t.y >= a.H - 2 ? 's' : t.x <= 1 ? 'w' : t.x >= a.W - 2 ? 'e' : 'n';
    out.push({ type: 'exit', x: t.x + e.tiles.length / 2, y: t.y + 0.5, edge, name: `To ${MAP_NAME[e.to] || e.to}` });
  }
  // People and monsters.
  const npcs = live?.npcs?.length ? live.npcs.map((n) => ({ name: n.name, ...n.tile }))
    : NPCS.filter((n) => n.area === id).map((n) => ({ name: n.name, x: n.x, y: n.y }));
  for (const n of npcs) out.push({ type: 'npc', x: n.x + 0.5, y: n.y + 0.5, name: n.name });
  const foes = live?.enemies ? live.enemies.filter((e) => !e.dead).map((e) => ({ name: e.name, boss: e.def.boss, ...e.tile }))
    : (a.spawns || []).filter((s) => !s.when || s.when(flags || {})).map((s) => ({ name: ENEMIES[s.enemy]?.name || s.enemy, boss: ENEMIES[s.enemy]?.boss, x: s.x, y: s.y }));
  for (const f of foes) out.push({ type: 'enemy', x: f.x + 0.5, y: f.y + 0.5, name: f.name, boss: !!f.boss });
  for (const l of LABELS[id] || []) out.push({ type: 'label', x: l.x + 0.5, y: l.y + 0.5, name: l.text });
  if (star && star.area === id) out.push({ type: 'spot', kind: 'star', x: star.x + 0.5, y: star.y + 0.5, icon: itemIcon('stardust').url, name: `Shooting star (size ${star.size})` });
  return { W: a.W, H: a.H, name: MAP_NAME[id] || a.name, dark: a.dark, list: out };
}
