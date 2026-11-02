// Rolls an enemy's loot table. Returns [{ item, qty, rare }].

const qtyOf = (e, rng) => (e.qty ?? (e.min + Math.floor(rng() * (e.max - e.min + 1))));

export function rollLoot(loot, rng) {
  if (!loot) return [];
  const out = [];
  for (const e of loot.always || []) out.push({ item: e.item, qty: qtyOf(e, rng), rare: false });
  if (loot.main?.length) {
    let r = rng();
    for (const e of loot.main) {
      if (r < e.chance) { out.push({ item: e.item, qty: qtyOf(e, rng), rare: false }); break; }
      r -= e.chance;
    }
  }
  if (loot.rare && rng() < loot.rare.chance) {
    const t = loot.rare.table;
    const e = t[Math.floor(rng() * t.length)];
    out.push({ item: e.item, qty: qtyOf(e, rng), rare: true });
  }
  return out;
}
