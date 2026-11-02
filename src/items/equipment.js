// What you're wearing and wielding, saved in state.equipment as
// { slot: { id, qty } | null }. Bonuses from every worn item are added up and
// used by the combat formulas.

import { ITEMS } from '../../data/items.js';
import { SKILL_NAME } from '../skills/skills.js';

export const SLOTS = ['head', 'cape', 'neck', 'ammo', 'weapon', 'body', 'shield', 'legs', 'hands', 'feet', 'ring'];
export const SLOT_NAME = {
  head: 'Head', cape: 'Cape', neck: 'Neck', ammo: 'Ammo', weapon: 'Weapon', body: 'Body',
  shield: 'Shield', legs: 'Legs', hands: 'Hands', feet: 'Feet', ring: 'Ring',
};
export const TYPES = ['stab', 'slash', 'crush', 'ranged', 'magic'];

const UNARMED = { type: 'crush', speed: 4 };

export function defaultEquipment() {
  return Object.fromEntries(SLOTS.map((s) => [s, null]));
}

export class Equipment {
  // book: SkillBook (for level requirements); inventory: Inventory
  constructor(state, book, inventory) {
    this.state = state;
    this.book = book;
    this.inv = inventory;
    const eq = { ...defaultEquipment(), ...(state.equipment || {}) };
    for (const s of SLOTS) if (eq[s] && ITEMS[eq[s].id]?.equip?.slot !== s) eq[s] = null;
    state.equipment = eq;
  }

  get slots() { return this.state.equipment; }

  item(slot) {
    const s = this.slots[slot];
    return s ? ITEMS[s.id] : null;
  }

  // Weapon info: attack type and speed (bare fists are crush, 4 ticks).
  get weapon() {
    const w = this.item('weapon')?.equip;
    return {
      type: w?.type ?? UNARMED.type,
      speed: w?.speed ?? UNARMED.speed,
      name: this.item('weapon')?.name ?? 'Unarmed',
      style: w?.style ?? 'melee', // melee | ranged | magic
      range: w?.range ?? 1,
      ammo: w?.ammo ?? null,
    };
  }

  bonuses() {
    const b = { att: {}, def: {}, str: 0, rangedStr: 0, magicDmg: 0 };
    for (const t of TYPES) { b.att[t] = 0; b.def[t] = 0; }
    for (const slot of SLOTS) {
      const e = this.item(slot)?.equip;
      if (!e) continue;
      for (const t of TYPES) { b.att[t] += e.att?.[t] || 0; b.def[t] += e.def?.[t] || 0; }
      b.str += e.str || 0;
      b.rangedStr += e.rangedStr || 0;
      b.magicDmg += e.magicDmg || 0;
    }
    return b;
  }

  // The first level requirement you don't meet, as a message — or null.
  missingReq(id) {
    const req = ITEMS[id]?.equip?.req || {};
    for (const [skill, lvl] of Object.entries(req)) {
      if (this.book.level(skill) < lvl) {
        const name = SKILL_NAME[skill];
        return `You need ${/^[AEIOU]/.test(name) ? 'an' : 'a'} ${name} level of ${lvl} to ${verb(id)} this.`;
      }
    }
    return null;
  }

  // Equip the item in an inventory slot. Whatever was worn there goes back
  // into the inventory (into the slot that's just been emptied).
  equipFromInventory(i) {
    const s = this.inv.slots[i];
    const def = s && ITEMS[s.id];
    if (!def?.equip) return { ok: false, msg: "You can't wear that." };
    const miss = this.missingReq(s.id);
    if (miss) return { ok: false, msg: miss };
    const slot = def.equip.slot;
    const old = this.slots[slot];
    // Stackable ammo onto the same ammo: just add to the worn stack.
    if (old && old.id === s.id && def.stackable) {
      old.qty += s.qty;
      this.inv.slots[i] = null;
      return { ok: true, slot };
    }
    this.inv.slots[i] = old;
    this.slots[slot] = { id: s.id, qty: s.qty };
    return { ok: true, slot };
  }

  unequip(slot) {
    const s = this.slots[slot];
    if (!s) return { ok: false };
    if (this.inv.room(s.id, s.qty) < s.qty) return { ok: false, msg: "You don't have enough inventory space to remove that." };
    this.inv.add(s.id, s.qty);
    this.slots[slot] = null;
    return { ok: true };
  }

  // How the worn items change the player's appearance.
  look() {
    const out = {};
    for (const slot of SLOTS) Object.assign(out, this.item(slot)?.equip?.look || {});
    return out;
  }
}

export const verb = (id) => (ITEMS[id]?.equip?.slot === 'weapon' ? 'wield' : 'wear');
