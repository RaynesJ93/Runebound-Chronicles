// Equipment tests: two-handed weapons and thrown weapons. Run with:  node tests/equipment.test.mjs
import assert from 'node:assert/strict';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { Inventory } = await import('../src/items/inventory.js');
const { Equipment } = await import('../src/items/equipment.js');
const { SkillBook, XP_TABLE } = await import('../src/skills/skills.js');
const { defaultState } = await import('../src/core/state.js');

const setup = (bag, worn = {}) => {
  const state = defaultState();
  for (const k of Object.keys(state.skills)) state.skills[k].xp = XP_TABLE[60];
  bag.forEach(([id, qty], i) => { state.inventory[i] = { id, qty }; });
  const inv = new Inventory(state);
  const eq = new Equipment(state, new SkillBook(state), inv);
  for (const [slot, id] of Object.entries(worn)) eq.slots[slot] = { id, qty: 1 };
  return { state, inv, eq };
};
const tests = [];
const test = (name, fn) => tests.push({ name, fn });

test('wielding a 2h sword takes the shield off into its bag slot', () => {
  const { inv, eq } = setup([['iron2hSword', 1]], { shield: 'ironKiteshield' });
  assert.equal(eq.equipFromInventory(0).ok, true);
  assert.equal(eq.slots.weapon.id, 'iron2hSword');
  assert.equal(eq.slots.shield, null);
  assert.equal(inv.slots[0].id, 'ironKiteshield');
});

test('swapping a sword for a 2h sword puts both the sword and the shield in the bag', () => {
  const { inv, eq } = setup([['steel2hSword', 1]], { weapon: 'steelSword', shield: 'steelSqShield' });
  assert.equal(eq.equipFromInventory(0).ok, true);
  const ids = inv.slots.filter(Boolean).map((s) => s.id).sort();
  assert.deepEqual(ids, ['steelSqShield', 'steelSword']);
  assert.equal(eq.slots.shield, null);
});

test('no room for the shield: the 2h sword stays in the bag', () => {
  const { inv, eq } = setup(Array.from({ length: 28 }, (_, i) => (i === 0 ? ['bronze2hSword', 1] : ['bones', 1])), { weapon: 'bronzeSword', shield: 'bronzeSqShield' });
  const r = eq.equipFromInventory(0);
  assert.equal(r.ok, false);
  assert.equal(eq.slots.weapon.id, 'bronzeSword');
  assert.equal(eq.slots.shield.id, 'bronzeSqShield');
  assert.equal(inv.slots[0].id, 'bronze2hSword');
});

test('wearing a shield takes a 2h sword off', () => {
  const { inv, eq } = setup([['mithrilKiteshield', 1]], { weapon: 'mithril2hSword' });
  assert.equal(eq.equipFromInventory(0).ok, true);
  assert.equal(eq.slots.shield.id, 'mithrilKiteshield');
  assert.equal(eq.slots.weapon, null);
  assert.equal(inv.slots[0].id, 'mithril2hSword');
});

test('thrown weapons stack in the weapon slot and ignore arrows', () => {
  const { eq } = setup([['steelDart', 40], ['steelDart', 10]], {});
  eq.slots.ammo = { id: 'mithrilArrow', qty: 100 };
  eq.equipFromInventory(0); eq.equipFromInventory(1);
  assert.equal(eq.slots.weapon.qty, 50);
  assert.equal(eq.weapon.thrown, true);
  assert.equal(eq.weapon.style, 'ranged');
  assert.equal(eq.bonuses().rangedStr, 9); // the darts' own strength, not the arrows'
});

let failed = 0;
for (const t of tests) {
  try { await t.fn(); console.log(`  ✓ ${t.name}`); } catch (err) { failed++; console.log(`  ✗ ${t.name}\n    ${err.message}`); }
}
console.log(`\n${tests.length - failed} passed, ${failed} failed`);
process.exitCode = failed ? 1 : 0;
