// The 28-slot inventory, saved in state.inventory as [{ id, qty } | null] x 28.
// Stackable items (coins, runes, arrows) share one slot; others take a slot each.

import { ITEMS } from '../../data/items.js';

export const INVENTORY_SIZE = 28;
const MAX_STACK = 2_147_483_647;

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
    if (ITEMS[id]?.stackable) {
      const stack = this.slots.find((s) => s && s.id === id);
      if (stack) return Math.min(qty, MAX_STACK - stack.qty);
      return this.freeSlots ? qty : 0;
    }
    return Math.min(qty, this.freeSlots);
  }

  // Adds up to qty; returns how many were actually added.
  add(id, qty = 1) {
    const n = this.room(id, qty);
    if (n <= 0) return 0;
    const slots = this.slots;
    if (ITEMS[id]?.stackable) {
      const stack = slots.find((s) => s && s.id === id);
      if (stack) stack.qty += n;
      else slots[slots.indexOf(null)] = { id, qty: n };
    } else {
      for (let k = 0; k < n; k++) slots[slots.indexOf(null)] = { id, qty: 1 };
    }
    return n;
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
