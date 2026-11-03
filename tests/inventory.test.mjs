// Inventory stacking tests. Run with:  node tests/inventory.test.mjs
import assert from 'node:assert/strict';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { Inventory } = await import('../src/items/inventory.js');
const { maxStack } = await import('../data/items.js');
const { migrate } = await import('../src/core/save.js');
const { defaultState } = await import('../src/core/state.js');

const fresh = () => new Inventory({ inventory: Array(28).fill(null) });
const tests = [];
const test = (name, fn) => tests.push({ name, fn });

test('stack sizes', () => {
  for (const id of ['logs', 'oakLogs', 'copperOre', 'ironBar', 'runeEssence', 'rawShrimps', 'shrimps', 'bread', 'cookedTrout', 'cowhide', 'leather', 'burntFish']) assert.equal(maxStack(id), 20, id);
  for (const id of ['bronzeArrow', 'ironArrow', 'airRune', 'mindRune', 'waterRune', 'feather', 'fishingBait', 'thread', 'arrowShaft']) assert.equal(maxStack(id), 999, id);
  assert.equal(maxStack('coins'), Infinity);
  for (const id of ['bronzeSword', 'leatherBody', 'bronzeAxe', 'attackPotion4', 'bones']) assert.equal(maxStack(id), 1, id);
});

test('25 logs fill one slot of 20 and start another', () => {
  const inv = fresh();
  assert.equal(inv.add('logs', 25), 25);
  assert.deepEqual(inv.slots.filter(Boolean).map((s) => s.qty), [20, 5]);
  inv.add('logs', 17);
  assert.deepEqual(inv.slots.filter(Boolean).map((s) => s.qty), [20, 20, 2]);
});

test('runes stack to 999 a slot, coins without limit', () => {
  const inv = fresh();
  inv.add('airRune', 1500);
  assert.deepEqual(inv.slots.filter(Boolean).map((s) => s.qty), [999, 501]);
  inv.add('coins', 5_000_000);
  assert.equal(inv.slots.filter((s) => s?.id === 'coins').length, 1);
});

test('room accounts for part-filled stacks and free slots', () => {
  const inv = fresh();
  for (let k = 0; k < 27; k++) inv.add('bronzeSword', 1);
  inv.add('rawShrimps', 15);
  assert.equal(inv.room('rawShrimps', 50), 5);
  assert.equal(inv.add('rawShrimps', 10), 5);
  assert.equal(inv.room('rawShrimps', 1), 0);
  assert.equal(inv.room('bronzeSword', 1), 0);
});

test('eating takes one from a stack', () => {
  const inv = fresh();
  inv.add('shrimps', 20);
  inv.takeOne(0);
  assert.equal(inv.count('shrimps'), 19);
});

test('remove takes from several stacks', () => {
  const inv = fresh();
  inv.add('copperOre', 45);
  assert.ok(inv.remove('copperOre', 30));
  assert.equal(inv.count('copperOre'), 15);
});

test('old saves: notes become essence, oversized stacks split or go to the bank', () => {
  const d = defaultState();
  d.inventory = Array(28).fill(null);
  d.inventory[0] = { id: 'runeEssenceNoted', qty: 30 };
  d.inventory[1] = { id: 'airRune', qty: 2500 };
  for (let k = 2; k < 27; k++) d.inventory[k] = { id: 'bronzeSword', qty: 1 };
  d.bank = [{ id: 'runeEssenceNoted', qty: 10 }, { id: 'runeEssence', qty: 5 }];
  const s = migrate(2, d);
  assert.equal(s.inventory[0].id, 'runeEssence');
  assert.equal(s.inventory[0].qty, 20);
  assert.equal(s.inventory[1].qty, 999);
  const essenceInBank = s.bank.find((b) => b.id === 'runeEssence').qty;
  const runesInBank = s.bank.find((b) => b.id === 'airRune')?.qty || 0;
  const runesInBag = s.inventory.filter((x) => x?.id === 'airRune').reduce((a, x) => a + x.qty, 0);
  const essInBag = s.inventory.filter((x) => x?.id === 'runeEssence').reduce((a, x) => a + x.qty, 0);
  assert.equal(essInBag + essenceInBank, 45, 'all essence kept');
  assert.equal(runesInBag + runesInBank, 2500, 'all runes kept');
  assert.ok(!s.bank.some((b) => b.id === 'runeEssenceNoted'));
});

let failed = 0;
for (const t of tests) {
  try { await t.fn(); console.log(`  ✓ ${t.name}`); } catch (err) { failed++; console.log(`  ✗ ${t.name}\n    ${err.message}`); }
}
console.log(`\n${tests.length - failed} passed, ${failed} failed`);
process.exitCode = failed ? 1 : 0;
