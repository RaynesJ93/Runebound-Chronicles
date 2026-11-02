// Save tests: every older save format must still load.
//
// Run with:  node tests/save.test.mjs
//
// Each fixture below is a save as it was written by an earlier version of the
// game (shapes taken from the git history). They're loaded through the real
// loading code, which upgrades them and repairs anything broken.

import assert from 'node:assert/strict';

// ---- A pretend browser storage --------------------------------------------------
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};

const { loadGame, saveGame, exportSave, importSave, migrate, SAVE_VERSION } = await import('../src/core/save.js');
const { defaultState } = await import('../src/core/state.js');

// Writes a save envelope exactly as the game does (same checksum).
function fnv(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(16);
}
function putSave(slot, version, data, savedAt = Date.now()) {
  const json = JSON.stringify(data);
  store.set(`rbc.save.${slot}`, JSON.stringify({ version, savedAt, sum: fnv(json), data: json }));
}

// ---- Fixtures --------------------------------------------------------------------
// v0.1.0 (Batches 0–1, the 3D version): save version 1.
const V1_3D = {
  player: { area: 'brambleford', x: 20, y: 18, facing: 1.57 },
  run: { on: false, energy: 63.5 },
  settings: { dpad: 'on', shadows: false, zoom: 22 },
  stats: { playTimeSec: 410.4, tilesWalked: 288 },
  flags: { seenMoveHint: true },
  createdAt: 1762000000000,
};

// v0.3.0 (Batch 2): pixel art, story flags, no combat yet. Save version 2.
const V2_BATCH2 = {
  player: { area: 'route1', x: 17, y: 50, facing: 3.14 },
  run: { on: true, energy: 100 },
  settings: { dpad: 'auto', zoomStep: 1 },
  stats: { playTimeSec: 900, tilesWalked: 700 },
  flags: { seenMoveHint: true, metElder: true, visitedRoute1: true },
  createdAt: 1762000000000,
};

// v0.5.0 (Batch 4): combat skills, no items yet.
const V2_BATCH4 = {
  ...V2_BATCH2,
  player: { area: 'route1', x: 7, y: 45, facing: 0, hp: 12 },
  settings: { dpad: 'auto', zoomStep: 0, autoRetaliate: false, attackStyle: 'aggressive' },
  skills: { attack: { xp: 1200 }, strength: { xp: 3400 }, defence: { xp: 0 }, hitpoints: { xp: 2300 } },
};

// v0.9.0 (Batch 8): everything — items, gear, bank, potion boost, gravestone.
const V2_BATCH8 = {
  ...V2_BATCH4,
  player: { area: 'store', x: 5, y: 6, facing: 0, hp: 9 },
  settings: { dpad: 'auto', zoomStep: -1, autoRetaliate: true, attackStyle: 'controlled', rangedStyle: 'rapid', spell: 'waterStrike' },
  skills: { ...V2_BATCH4.skills, ranged: { xp: 500 }, magic: { xp: 800 } },
  inventory: [{ id: 'coins', qty: 193 }, { id: 'bread', qty: 1 }, { id: 'strengthPotion3', qty: 1 }, ...Array(25).fill(null)],
  equipment: { head: null, cape: null, neck: { id: 'warCharm', qty: 1 }, ammo: { id: 'bronzeArrow', qty: 37 }, weapon: { id: 'bronzeSword', qty: 1 }, body: { id: 'leatherBody', qty: 1 }, shield: null, legs: null, hands: null, feet: null, ring: null },
  bank: [{ id: 'bones', qty: 14 }, { id: 'goblinMail', qty: 2 }],
  boosts: { strength: 2 },
  grave: { area: 'route1', x: 9, y: 46, items: [{ id: 'woodenShield', qty: 1, slot: 'shield' }, { id: 'airRune', qty: 40 }], createdAt: 850 },
  stats: { playTimeSec: 1000, tilesWalked: 1500, deaths: 1 },
};

// ---- Tests -------------------------------------------------------------------------
const tests = [];
const test = (name, fn) => tests.push({ name, fn });

const checkComplete = (s) => {
  const d = defaultState();
  for (const k of Object.keys(d)) assert.ok(k in s, `missing ${k}`);
  for (const k of Object.keys(d.settings)) assert.ok(k in s.settings, `missing settings.${k}`);
  assert.equal(s.inventory.length, 28);
  assert.equal(Object.keys(s.equipment).length, 11);
  for (const sk of ['attack', 'strength', 'defence', 'hitpoints', 'ranged', 'magic', 'woodcutting', 'fletching', 'mining', 'smithing', 'fishing', 'cooking']) assert.equal(typeof s.skills[sk].xp, 'number');
};

test('a 3D-era save (version 1) upgrades', () => {
  const s = migrate(1, structuredClone(V1_3D));
  checkComplete(s);
  assert.equal(s.settings.zoomStep, 0);
  assert.ok(!('zoom' in s.settings) && !('shadows' in s.settings));
  assert.equal(s.settings.dpad, 'on');
  assert.deepEqual([s.player.x, s.player.y], [20, 18]);
  assert.equal(s.run.energy, 63.5);
  assert.equal(s.skills.hitpoints.xp, 1154); // starts at level 10
  assert.equal(s.player.hp, 10);
});

test('a Batch 2 save keeps its story flags and position', () => {
  const s = migrate(2, structuredClone(V2_BATCH2));
  checkComplete(s);
  assert.equal(s.player.area, 'route1');
  assert.equal(s.flags.metElder, true);
  assert.equal(s.settings.zoomStep, 1);
});

test('a Batch 4 save keeps its XP and attack style', () => {
  const s = migrate(2, structuredClone(V2_BATCH4));
  checkComplete(s);
  assert.equal(s.skills.strength.xp, 3400);
  assert.equal(s.settings.attackStyle, 'aggressive');
  assert.equal(s.settings.autoRetaliate, false);
  assert.equal(s.inventory.filter(Boolean).length, 0);
});

test('a Batch 8 save keeps items, gear, bank, boosts and gravestone', () => {
  const s = migrate(2, structuredClone(V2_BATCH8));
  checkComplete(s);
  assert.deepEqual(s.inventory[0], { id: 'coins', qty: 193 });
  assert.deepEqual(s.equipment.ammo, { id: 'bronzeArrow', qty: 37 });
  assert.equal(s.equipment.weapon.id, 'bronzeSword');
  assert.deepEqual(s.bank, V2_BATCH8.bank); // the bank stacks non-stacking items
  assert.equal(s.boosts.strength, 2);
  assert.equal(s.grave.items.length, 2);
  assert.equal(s.grave.items[0].slot, 'shield');
  assert.equal(s.stats.deaths, 1);
  assert.equal(s.stats.kills, 0); // new field gets its default
  assert.equal(s.settings.itemTap, 'use');
});

test('items that no longer exist are removed, not crashed on', () => {
  const d = structuredClone(V2_BATCH8);
  d.inventory[5] = { id: 'dragonScimitar', qty: 1 };
  d.inventory[6] = { id: 'bread', qty: -3 };
  d.equipment.weapon = { id: 'leatherBody', qty: 1 }; // wrong slot
  d.bank.push({ id: 'nope', qty: 4 });
  d.grave.items = [{ id: 'ghost', qty: 1 }];
  const s = migrate(2, d);
  assert.equal(s.inventory[5], null);
  assert.equal(s.inventory[6], null);
  assert.equal(s.equipment.weapon, null);
  assert.equal(s.bank.length, 2);
  assert.equal(s.grave, null); // empty gravestone is cleared
});

test('broken numbers and settings are repaired', () => {
  const d = structuredClone(V2_BATCH8);
  d.player.area = 'atlantis';
  d.player.hp = 'lots';
  d.run.energy = 500;
  d.settings.dpad = 'sideways';
  d.settings.zoomStep = 99;
  d.skills.attack = { xp: -5 };
  d.inventory = d.inventory.slice(0, 10);
  d.boosts = { juggling: 4, attack: 0 }; // not a real skill, and a used-up boost
  const s = migrate(2, d);
  assert.equal(s.player.area, 'brambleford');
  assert.equal(s.player.hp, 10);
  assert.equal(s.run.energy, 100);
  assert.equal(s.settings.dpad, 'auto');
  assert.equal(s.settings.zoomStep, 3);
  assert.equal(s.skills.attack.xp, 0);
  assert.equal(s.inventory.length, 28);
  assert.deepEqual(s.boosts, {});
});

test('saves from a newer game version are refused', () => {
  assert.throws(() => migrate(SAVE_VERSION + 1, {}), /newer version/);
});

test('loading picks the newest save and skips a damaged one', () => {
  store.clear();
  putSave(0, 2, V2_BATCH4, 1000);
  putSave(1, 2, V2_BATCH8, 2000);
  let r = loadGame();
  assert.equal(r.loaded, true);
  assert.equal(r.state.player.area, 'store');
  // Damage the newest one: the older one loads instead.
  const env = JSON.parse(store.get('rbc.save.1'));
  env.data = env.data.replace('193', '999999');
  store.set('rbc.save.1', JSON.stringify(env));
  r = loadGame();
  assert.equal(r.state.player.area, 'route1');
});

test('an old 3D save in storage loads', () => {
  store.clear();
  putSave(0, 1, V1_3D);
  const r = loadGame();
  assert.equal(r.loaded, true);
  assert.equal(r.state.settings.zoomStep, 0);
});

test('no save means a fresh game', () => {
  store.clear();
  const r = loadGame();
  assert.equal(r.loaded, false);
  assert.equal(r.state.player.area, 'brambleford');
});

test('saving alternates between the two slots', () => {
  store.clear();
  const s = defaultState();
  s.stats.tilesWalked = 1;
  saveGame(s);
  s.stats.tilesWalked = 2;
  saveGame(s);
  assert.ok(store.has('rbc.save.0') && store.has('rbc.save.1'));
  assert.equal(loadGame().state.stats.tilesWalked, 2);
});

test('save codes round-trip, and junk codes are rejected', () => {
  const s = migrate(2, structuredClone(V2_BATCH8));
  const code = exportSave(s);
  assert.ok(code.startsWith('RBC1:'));
  const back = importSave(`  ${code.slice(0, 40)}\n${code.slice(40)}  `); // pasted with line breaks
  assert.deepEqual(back.inventory, s.inventory);
  assert.deepEqual(back.equipment, s.equipment);
  assert.throws(() => importSave('hello'), /doesn't look like/);
  assert.throws(() => importSave(`${code.slice(0, -12)}`), /damaged/);
});

// ---- Run --------------------------------------------------------------------------
let failed = 0;
for (const t of tests) {
  try {
    await t.fn();
    console.log(`  ✓ ${t.name}`);
  } catch (err) {
    failed++;
    console.log(`  ✗ ${t.name}\n    ${err.message}`);
  }
}
console.log(`\n${tests.length - failed} passed, ${failed} failed`);
process.exitCode = failed ? 1 : 0;
