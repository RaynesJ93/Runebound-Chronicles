// A shop's live stock and prices (kept for the session, not saved).

import { ITEMS } from '../../data/items.js';

const BUY_MARKUP = 1.0; // you pay the item's value when stock is normal
const SELL_RATE = 0.35; // the shop pays about a third
const STEP = 0.03; // each item above/below normal stock shifts the price 3%

export class Shop {
  constructor(def) {
    this.name = def.name;
    this.stock = def.stock.map((s) => ({ id: s.id, base: s.base, qty: s.base }));
  }

  entry(id) { return this.stock.find((s) => s.id === id); }

  buyPrice(id) {
    const s = this.entry(id);
    const v = ITEMS[id].value;
    const shift = s ? Math.max(-0.3, Math.min(0.5, (s.base - s.qty) * STEP)) : 0;
    return Math.max(1, Math.round(v * BUY_MARKUP * (1 + shift)));
  }

  sellPrice(id) {
    if (id === 'coins') return 0;
    const s = this.entry(id);
    const v = ITEMS[id].value;
    const over = s ? Math.max(0, s.qty - s.base) : 0;
    return Math.max(0, Math.floor(v * SELL_RATE * Math.max(0.3, 1 - over * STEP)));
  }

  // Buy up to qty: limited by stock, coins and bag space. Returns { n, cost }.
  buy(id, qty, inv) {
    const s = this.entry(id);
    if (!s || s.qty <= 0) return { n: 0, cost: 0, why: 'out of stock' };
    let n = 0;
    let cost = 0;
    while (n < qty && s.qty > 0) {
      const p = this.buyPrice(id);
      if (inv.count('coins') < p) { if (!n) return { n: 0, cost: 0, why: 'coins' }; break; }
      if (inv.room(id, 1) < 1) { if (!n) return { n: 0, cost: 0, why: 'space' }; break; }
      inv.remove('coins', p);
      inv.add(id, 1);
      s.qty--;
      n++;
      cost += p;
    }
    return { n, cost };
  }

  // Sell up to qty of the item in bag slot i. Returns { n, earned }.
  sell(i, qty, inv) {
    const slot = inv.slots[i];
    if (!slot || slot.id === 'coins') return { n: 0, earned: 0 };
    const id = slot.id;
    let n = 0;
    let earned = 0;
    while (n < qty && inv.count(id) > 0) {
      const p = this.sellPrice(id);
      inv.remove(id, 1);
      let s = this.entry(id);
      if (!s) { s = { id, base: 0, qty: 0 }; this.stock.push(s); }
      s.qty++;
      if (p > 0) inv.add('coins', p);
      n++;
      earned += p;
    }
    return { n, earned };
  }

  // Called every so often: stock drifts back towards normal.
  restock() {
    for (const s of this.stock) {
      if (s.qty < s.base) s.qty++;
      else if (s.qty > s.base) s.qty--;
    }
    this.stock = this.stock.filter((s) => s.base > 0 || s.qty > 0);
  }
}
