// What happens to your things when you die (design doc, section 8):
// you keep your 3 most valuable items; the rest go into a gravestone where
// you fell. It lasts 15 minutes of play. Reclaiming is free for the first
// 5 minutes, then costs a small fee. If it crumbles, the items are lost.

import { ITEMS } from '../../data/items.js';

export const KEEP = 3;
export const GRAVE_SECONDS = 15 * 60;
export const FREE_SECONDS = 5 * 60;

const value = (id) => ITEMS[id]?.value ?? 0;

// Splits your belongings. Removes lost items from the inventory/equipment and
// returns { kept: [names], lost: [{ id, qty, slot? }] }.
export function splitOnDeath(inv, eq) {
  // Each non-stacking item is one "unit"; a stack counts as one unit of one item.
  const units = [];
  for (const [slot, s] of Object.entries(eq.slots)) if (s) units.push({ where: 'eq', slot, id: s.id, v: value(s.id) });
  inv.slots.forEach((s, i) => { if (s) units.push({ where: 'inv', i, id: s.id, v: value(s.id) }); });
  units.sort((a, b) => b.v - a.v);
  const keep = new Set(units.slice(0, KEEP));
  const lost = [];
  const kept = [];
  for (const u of units) {
    if (u.where === 'eq') {
      const s = eq.slots[u.slot];
      if (keep.has(u)) { kept.push(ITEMS[s.id].name); if (s.qty > 1) { lost.push({ id: s.id, qty: s.qty - 1 }); s.qty = 1; } continue; }
      lost.push({ id: s.id, qty: s.qty, slot: u.slot });
      eq.slots[u.slot] = null;
    } else {
      const s = inv.slots[u.i];
      if (keep.has(u)) { kept.push(ITEMS[s.id].name); if (s.qty > 1) { lost.push({ id: s.id, qty: s.qty - 1 }); s.qty = 1; } continue; }
      lost.push({ id: s.id, qty: s.qty });
      inv.slots[u.i] = null;
    }
  }
  return { kept, lost };
}

export function graveFee(grave) {
  const total = grave.items.reduce((n, it) => n + value(it.id) * it.qty, 0);
  return Math.min(1000, Math.max(10, Math.round(total * 0.1)));
}

// Put the grave's items back: worn items into their empty slots, the rest
// into the bag. Anything that doesn't fit stays in the grave.
export function reclaim(grave, inv, eq) {
  const left = [];
  for (const it of grave.items) {
    if (it.slot && !eq.slots[it.slot]) { eq.slots[it.slot] = { id: it.id, qty: it.qty }; continue; }
    const n = inv.add(it.id, it.qty);
    if (n < it.qty) left.push({ ...it, qty: it.qty - n, slot: undefined });
  }
  grave.items = left;
  return left.length === 0;
}
