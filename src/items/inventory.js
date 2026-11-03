// The 28-slot inventory, saved in state.inventory as [{ id, qty } | null] x 28.
// Stackable items fill a slot up to their stack size (20 for materials and food,
// 999 for arrows and runes, no limit for coins), then start a new slot.

import { ITEMS, maxStack } from '../../data/items.js';

export const INVENTORY_SIZE = 28;

export class Inventory {
  constructor(state) {
    this.state = state;
    const slots = Array.isArray(state.inventory) ? state.inventory.slice(0, INVENTORY_SIZE) : [];
    while (slots.length < INVENTORY_SIZE) slots.push(null);
    state.inventory = slots.map((s) => (s && ITEMS[s.id] && s.qty > 0 ? s : null));
  }

  get slots() { return this.state.inventory; }

  get freeSlots() { return this.slots.filter((s) => !s).length; }

  count(id) {
    return this.slots.reduce((n, s) => n + (s && s.id === id ? s.qty : 0), 0);
  }

  // How many of this item would fit right now.
  room(id, qty) {
    const max = maxStack(id);
    if (max === 1) return Math.min(qty, this.freeSlots);
    if (max === Infinity) return this.slots.some((s) => s && s.id === id) || this.freeSlots ? qty : 0;
    let space = this.freeSlots * max;
    for (const s of this.slots) if (s && s.id === id) space += Math.max(0, max - s.qty);
    return Math.min(qty, space);
  }

  // Adds up to qty (topping up existing stacks first); returns how many were added.
  add(id, qty = 1) {
    const n = this.room(id, qty);
    if (n <= 0) return 0;
    const slots = this.slots;
    const max = maxStack(id);
    let left = n;
    if (max > 1) {
      for (const s of slots) {
        if (!left) break;
        if (!s || s.id !== id || s.qty >= max) continue;
        const take = Math.min(left, max - s.qty);
        s.qty += take;
        left -= take;
      }
    }
    while (left > 0) {
      const take = Math.min(left, max);
      slots[slots.indexOf(null)] = { id, qty: take };
      left -= take;
    }
    return n;
  }

  // Takes one item from a slot (eating one fish from a stack of 20).
  takeOne(i) {
    const s = this.slots[i];
    if (!s) return null;
    s.qty -= 1;
    if (s.qty <= 0) this.slots[i] = null;
    return { id: s.id, qty: 1 };
  }

  // Takes the item out of a slot (the whole stack). Returns what was removed.
  removeSlot(i) {
    const s = this.slots[i];
    this.slots[i] = null;
    return s;
  }

  // Removes qty of an item (from stacks or single slots). Returns true if it had enough.
  remove(id, qty = 1) {
    if (this.count(id) < qty) return false;
    let left = qty;
    for (let i = 0; i < this.slots.length && left > 0; i++) {
      const s = this.slots[i];
      if (!s || s.id !== id) continue;
      const take = Math.min(left, s.qty);
      s.qty -= take;
      left -= take;
      if (s.qty <= 0) this.slots[i] = null;
    }
    return true;
  }

  swap(a, b) {
    const s = this.slots;
    if (a === b || a < 0 || b < 0 || a >= s.length || b >= s.length) return;
    [s[a], s[b]] = [s[b], s[a]];
  }
}
