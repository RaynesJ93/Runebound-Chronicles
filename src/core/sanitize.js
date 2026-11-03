// Repairs a loaded save so a damaged or very old one can never crash the game.
//
// Runs after migrations and the merge over defaults. It only fixes things that
// are actually broken: unknown items are dropped, numbers that aren't numbers
// go back to their defaults, settings with unknown values are reset.

import { ITEMS, maxStack } from '../../data/items.js';

// Bank notes were removed in v0.17: notes become the real item.
const LEGACY_NOTES = { runeEssenceNoted: 'runeEssence' };
const unNote = (s) => (s && typeof s === 'object' && LEGACY_NOTES[s.id] ? { ...s, id: LEGACY_NOTES[s.id] } : s);
import { AREAS, START_AREA } from '../../data/areas/index.js';
import { SLOTS } from '../items/equipment.js';
import { SKILLS } from '../skills/skills.js';
import { defaultState } from './state.js';

const INV_SIZE = 28;

const num = (v, fallback, min = -Infinity, max = Infinity) =>
  (typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback);

// { id, qty } with a known item and a positive whole quantity, or null.
// keepQty: the bank stacks everything, so it may hold 5 of a non-stacking item.
function cleanStack(s, keepQty = false) {
  if (!s || typeof s !== 'object' || !ITEMS[s.id]) return null;
  const qty = Math.floor(num(s.qty, 1, 0, 2147483647));
  if (qty <= 0) return null;
  return { id: s.id, qty: ITEMS[s.id].stackable || keepQty ? qty : 1 };
}

const ENUMS = {
  dpad: ['auto', 'on', 'off'],
  attackStyle: ['accurate', 'aggressive', 'defensive', 'controlled'],
  rangedStyle: ['accurate', 'rapid', 'longrange'],
  spell: ['windStrike', 'waterStrike'],
  itemTap: ['use', 'menu'],
  textSpeed: ['normal', 'fast', 'instant'],
};

export function sanitize(state) {
  const def = defaultState();

  // Where you are
  const p = state.player;
  if (!AREAS[p.area]) { p.area = START_AREA; p.x = def.player.x; p.y = def.player.y; }
  p.x = Math.round(num(p.x, def.player.x, 0, 999));
  p.y = Math.round(num(p.y, def.player.y, 0, 999));
  p.facing = num(p.facing, 0);
  p.hp = Math.round(num(p.hp, def.player.hp, 0, 99));
  state.run.on = !!state.run.on;
  state.run.energy = num(state.run.energy, 100, 0, 100);

  // Settings
  const s = state.settings;
  for (const [k, ok] of Object.entries(ENUMS)) if (!ok.includes(s[k])) s[k] = def.settings[k];
  for (const k of ['autoRetaliate', 'xpDrops', 'batterySaver']) if (typeof s[k] !== 'boolean') s[k] = def.settings[k];
  s.zoomStep = Math.round(num(s.zoomStep, 0, -2, 3));

  // Skills
  for (const sk of SKILLS) {
    const xp = state.skills[sk.id]?.xp;
    state.skills[sk.id] = { xp: num(xp, def.skills[sk.id].xp, 0, 200_000_000) };
  }
  for (const [k, v] of Object.entries(state.boosts || {})) if (!SKILLS.some((x) => x.id === k) || !(num(v, 0) > 0)) delete state.boosts[k];

  // Items
  const inv = (Array.isArray(state.inventory) ? state.inventory : []).map(unNote);
  state.inventory = Array.from({ length: INV_SIZE }, (_, i) => cleanStack(inv[i], true));
  const eq = {};
  for (const slot of SLOTS) {
    const it = cleanStack(state.equipment?.[slot]);
    eq[slot] = it && ITEMS[it.id].equip?.slot === slot ? it : null;
  }
  state.equipment = eq;
  state.bank = (Array.isArray(state.bank) ? state.bank : []).map(unNote).map((b) => cleanStack(b, true)).filter(Boolean);
  // merge bank entries of the same item (two notes stacks may have become one item)
  const merged = [];
  for (const b of state.bank) { const m = merged.find((x) => x.id === b.id); if (m) m.qty += b.qty; else merged.push(b); }
  state.bank = merged;
  // Stacks bigger than a slot allows are split over free slots; anything that
  // doesn't fit goes to the bank, so nothing is ever lost.
  for (let i = 0; i < INV_SIZE; i++) {
    const s = state.inventory[i];
    if (!s) continue;
    const max = maxStack(s.id);
    while (s.qty > max) {
      const extra = s.qty - max;
      const free = state.inventory.indexOf(null);
      if (free < 0) {
        s.qty = max;
        const m = state.bank.find((x) => x.id === s.id);
        if (m) m.qty += extra; else state.bank.push({ id: s.id, qty: extra });
        break;
      }
      const take = Math.min(extra, max);
      state.inventory[free] = { id: s.id, qty: take };
      s.qty -= take;
    }
  }

  // Gravestone
  const g = state.grave;
  if (g && (typeof g !== 'object' || !AREAS[g.area] || !Array.isArray(g.items))) state.grave = null;
  else if (g) {
    // Items that were worn remember their slot, so reclaiming puts them back on.
    g.items = g.items.map(unNote).map((it) => {
      const c = cleanStack(it, true);
      if (c && SLOTS.includes(it.slot)) c.slot = it.slot;
      return c;
    }).filter(Boolean);
    g.x = Math.round(num(g.x, 0));
    g.y = Math.round(num(g.y, 0));
    g.createdAt = num(g.createdAt, state.stats.playTimeSec);
    if (!g.items.length) state.grave = null;
  }

  // Stats
  state.stats.playTimeSec = num(state.stats.playTimeSec, 0, 0);
  for (const k of ['tilesWalked', 'deaths', 'kills']) state.stats[k] = Math.floor(num(state.stats[k], 0, 0));
  if (state.flags === null || typeof state.flags !== 'object') state.flags = def.flags;
  return state;
}
