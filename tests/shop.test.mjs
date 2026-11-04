// Shop tests: the general store and Lyra's stardust shop. Run with:  node tests/shop.test.mjs
import assert from 'node:assert/strict';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { Inventory } = await import('../src/items/inventory.js');
const { Shop } = await import('../src/items/shop.js');
const { SHOPS } = await import('../data/shops.js');

const bag = (items) => { const inv = new Inventory({ inventory: Array(28).fill(null) }); for (const [id, n] of items) inv.add(id, n); return inv; };
const tests = [];
const test = (name, fn) => tests.push({ name, fn });

test('Lyra sells for stardust at fixed prices', () => {
  const shop = new Shop(SHOPS.starShop);
  const inv = bag([['stardust', 200], ['coins', 10000]]);
  assert.equal(shop.buyPrice('prospectorJacket'), 120);
  const r = shop.buy('prospectorJacket', 1, inv);
  assert.equal(r.n, 1);
  assert.equal(inv.count('stardust'), 80);
  assert.equal(inv.count('coins'), 10000, 'coins are not touched');
  assert.equal(inv.count('prospectorJacket'), 1);
});

test('Lyra never runs out and never changes her prices', () => {
  const shop = new Shop(SHOPS.starShop);
  const inv = bag([['stardust', 999]]);
  assert.equal(shop.buy('coalBag', 30, inv).n, 30);
  assert.equal(shop.buyPrice('coalBag'), 15);
  assert.equal(inv.count('stardust'), 999 - 30 * 15);
});

test("not enough stardust: nothing is bought", () => {
  const shop = new Shop(SHOPS.starShop);
  const inv = bag([['stardust', 50]]);
  const r = shop.buy('prospectorHelmet', 1, inv);
  assert.equal(r.n, 0);
  assert.equal(r.why, 'coins');
  assert.equal(inv.count('stardust'), 50);
});

test('Lyra buys nothing back', () => {
  const shop = new Shop(SHOPS.starShop);
  const inv = bag([['coal', 20]]);
  assert.equal(shop.sellPrice('coal'), null);
  assert.equal(shop.sell(0, 20, inv).n, 0);
  assert.equal(inv.count('coal'), 20);
});

test('the general store still trades in coins', () => {
  const shop = new Shop(SHOPS.generalStore);
  const inv = bag([['coins', 500]]);
  assert.equal(shop.buy('bronzeSword', 1, inv).n, 1);
  assert.ok(inv.count('coins') < 500);
  assert.ok(shop.sellPrice('bronzeSword') > 0);
});

let failed = 0;
for (const t of tests) {
  try { await t.fn(); console.log(`  ✓ ${t.name}`); } catch (err) { failed++; console.log(`  ✗ ${t.name}\n    ${err.message}`); }
}
console.log(`\n${tests.length - failed} passed, ${failed} failed`);
process.exitCode = failed ? 1 : 0;
