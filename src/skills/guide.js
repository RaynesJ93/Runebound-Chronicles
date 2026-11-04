// Skill guides: everything a skill unlocks, by level, built straight from the
// data files so it never goes out of date. Tap a skill in the skills panel to
// see its guide.
//
// guide(skillId) -> { about, sections: [{ title, rows: [{ level, icon, name, sub }] }] }
// `icon` is an item id (drawn with itemIcon). XP shown is what the player
// actually gets (base XP x XP_RATE).

import { ITEMS } from '../../data/items.js';
import { TREES, AXES } from '../../data/woodcutting.js';
import { RECIPES as FLETCHING } from '../../data/fletching.js';
import { ROCKS, PICKAXES } from '../../data/mining.js';
import { SMELTING, SMITHING } from '../../data/smithing.js';
import { SPOTS } from '../../data/fishing.js';
import { COOKING } from '../../data/cooking.js';
import { TANNING, SEWING, CUTTING, JEWELLERY, STUDDING } from '../../data/crafting.js';
import { ALTARS } from '../../data/runecrafting.js';
import { SPELLS } from '../../data/spells.js';
import { SKILLS, XP_RATE } from './skills.js';

const name = (id) => ITEMS[id]?.name || id;
const xp = (n) => `${+(n * XP_RATE).toFixed(1)} XP`;
const byLevel = (rows) => rows.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
const firstOf = (obj) => Object.keys(obj)[0];
const list = (ids, qty = {}) => {
  const names = ids.map((id) => {
    const n = name(id).toLowerCase();
    return qty[id] > 1 ? `${qty[id]} ${n.endsWith('s') ? n : `${n}s`}` : n;
  });
  return names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : names[0] || '';
};

// Gear that needs this skill to wield or wear, with the slot as the sub line.
function gear(skill, skip = () => false) {
  const rows = [];
  for (const [id, it] of Object.entries(ITEMS)) {
    const lv = it.equip?.req?.[skill];
    if (lv == null || skip(id, it)) continue;
    const others = Object.entries(it.equip.req).filter(([k]) => k !== skill).map(([k, v]) => `${SKILLS.find((s) => s.id === k)?.name} ${v}`);
    rows.push({ level: lv, icon: id, name: it.name, sub: [slotName(it.equip.slot), others.length ? `also needs ${others.join(', ')}` : ''].filter(Boolean).join(' · ') });
  }
  return byLevel(rows);
}
const slotName = (s) => ({ weapon: 'Weapon', shield: 'Shield', head: 'Head', body: 'Body', legs: 'Legs', hands: 'Hands', feet: 'Feet', cape: 'Cape', neck: 'Neck', ring: 'Ring', ammo: 'Ammo' }[s] || s);

// Recipes (fletching, smithing, cooking, crafting) as rows.
const recipes = (rs, extra = () => '') => byLevel(rs.map((r) => ({
  level: r.level, icon: firstOf(r.gives), name: r.name,
  sub: [list(Object.keys(r.uses), r.uses), xp(r.xp), extra(r)].filter(Boolean).join(' · '),
})));

const tools = (ts, verb) => byLevel(ts.map((t) => ({ level: t.level, icon: t.id, name: name(t.id), sub: `${verb}${t.bonus ? ` ${Math.round(t.bonus * 100)}% faster` : ''}` })));

const BUILD = {
  attack: () => [{ title: 'Weapons', rows: gear('attack', (id, it) => it.equip.slot !== 'weapon') }],
  strength: () => [{ title: 'Damage', note: 'Strength raises your max hit with melee weapons. Your current max hit is on the Combat tab.', rows: [] }],
  defence: () => [{ title: 'Armour', rows: gear('defence') }],
  hitpoints: () => [{ title: 'Health', note: 'Every level of Hitpoints is one more point of health. You train it whenever you deal damage. Eat food to heal.', rows: [] }],
  ranged: () => [{ title: 'Bows and gear', rows: gear('ranged') }],
  magic: () => [
    { title: 'Spells', rows: byLevel(SPELLS.map((s) => ({ level: s.level, icon: firstOf(s.runes), name: s.name, sub: `Max hit ${s.maxHit} · ${list(Object.keys(s.runes))} · ${xp(s.xp)}` }))) },
    { title: 'Staffs and gear', rows: gear('magic') },
  ],
  woodcutting: () => [
    { title: 'Trees', rows: byLevel(Object.values(TREES).map((t) => ({ level: t.level, icon: t.log, name: t.name, sub: `${name(t.log)} · ${xp(t.xp)}` }))) },
    { title: 'Axes', rows: tools(AXES, 'Chops') },
  ],
  fletching: () => [{ title: 'Bows, arrows, darts and javelins', rows: recipes(FLETCHING, (r) => {
    const n = Object.values(r.gives)[0];
    return n > 1 ? `makes ${n}` : '';
  }) }],
  mining: () => [
    { title: 'Rocks', rows: byLevel(Object.values(ROCKS).map((r) => ({ level: r.level, icon: r.ore, name: r.name, sub: `${name(r.ore)} · ${xp(r.xp)}` }))) },
    { title: 'Pickaxes', rows: tools(PICKAXES, 'Mines') },
    { title: 'Gems', note: 'Every ore you mine has a small chance of an uncut gem too: about 1 in 80, rising to 1 in 40 at level 99. Sapphires are common, diamonds rare.', rows: [] },
  ],
  smithing: () => {
    const bars = [...new Set(SMITHING.map((r) => r.bar))];
    return [
      { title: 'Smelting (furnace)', rows: recipes(SMELTING) },
      ...bars.map((bar) => ({ title: `${name(bar)} items (anvil)`, rows: recipes(SMITHING.filter((r) => r.bar === bar)) })),
    ];
  },
  fishing: () => Object.values(SPOTS).map((s) => ({
    title: `${s.verb} fishing · ${name(s.tool).toLowerCase()}${s.bait ? ` and ${name(s.bait).toLowerCase()}` : ''}`,
    rows: byLevel(s.catches.map((c) => ({ level: c.level, icon: c.item, name: name(c.item), sub: xp(c.xp) }))),
  })),
  cooking: () => [{ title: 'Food', rows: recipes(COOKING) }],
  crafting: () => [
    { title: 'Tanning (tanning rack)', rows: recipes(TANNING) },
    { title: 'Leather (needle and thread)', rows: recipes(SEWING.filter((r) => r.group === 'leather')) },
    { title: 'Hard leather (needle and thread)', rows: recipes(SEWING.filter((r) => r.group === 'hardLeather')) },
    { title: 'Studded leather (steel studs)', rows: recipes(STUDDING) },
    { title: 'Gem cutting (chisel)', rows: recipes(CUTTING) },
    { title: 'Silver jewellery (furnace and mould)', rows: recipes(JEWELLERY.filter((r) => r.metal === 'silverBar')) },
    { title: 'Gold jewellery (furnace and mould)', rows: recipes(JEWELLERY.filter((r) => r.metal === 'goldBar')) },
  ],
  runecrafting: () => {
    const altars = Object.values(ALTARS);
    const multi = [];
    for (const a of altars) (a.multi || []).forEach((lv, k) => multi.push({ level: lv, icon: a.rune, name: `${k + 2} ${name(a.rune).toLowerCase()}s per essence`, sub: a.name }));
    return [
      { title: 'Altars', rows: byLevel(altars.map((a) => ({ level: a.level, icon: a.rune, name: a.name, sub: `${name(a.rune)}s · ${xp(a.xp)} per essence` }))) },
      { title: 'More runes per essence', rows: byLevel(multi) },
    ];
  },
};

export function guide(skillId) {
  const sk = SKILLS.find((s) => s.id === skillId);
  if (!sk) return null;
  const sections = (BUILD[skillId]?.() || []).filter((s) => s.rows.length || s.note);
  return { id: sk.id, name: sk.name, about: sk.about, sections };
}
