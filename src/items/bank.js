// The bank: unlimited space, and every item stacks. Saved in state.bank as
// [{ id, qty }] in the order you put things in.

import { ITEMS } from '../../data/items.js';

export class Bank {
  constructor(state) {
    this.state = state;
    if (!Array.isArray(state.bank)) state.bank = [];
    state.bank = state.bank.filter((s) => s && ITEMS[s.id] && s.qty > 0);
  }

  get items() { return this.state.bank; }

  count(id) { return this.items.find((s) => s.id === id)?.qty ?? 0; }

  put(id, qty) {
    if (qty <= 0) return;
    const s = this.items.find((x) => x.id === id);
    if (s) s.qty += qty;
    else this.items.push({ id, qty });
  }

  // Deposit up to qty of the item in inventory slot i (all matching items count).
  deposit(inv, i, qty) {
    const s = inv.slots[i];
    if (!s) return 0;
    const n = Math.min(qty, inv.count(s.id));
    const id = s.id;
    inv.remove(id, n);
    this.put(id, n);
    return n;
  }

  depositAll(inv) {
    let n = 0;
    for (let i = 0; i < inv.slots.length; i++) {
      const s = inv.slots[i];
      if (!s) continue;
      this.put(s.id, s.qty);
      inv.slots[i] = null;
      n++;
    }
    return n;
  }

  depositGear(eq) {
    let n = 0;
    for (const [slot, s] of Object.entries(eq.slots)) {
      if (!s) continue;
      this.put(s.id, s.qty);
      eq.slots[slot] = null;
      n++;
    }
    return n;
  }

  // Withdraw up to qty into the inventory; returns how many came out.
  withdraw(id, qty, inv) {
    const s = this.items.find((x) => x.id === id);
    if (!s) return 0;
    const n = inv.add(id, Math.min(qty, s.qty));
    s.qty -= n;
    if (s.qty <= 0) this.items.splice(this.items.indexOf(s), 1);
    return n;
  }
}
