// Skills and the OSRS-style XP curve.
//
//   XP(L) = floor( 1/4 * sum_{n=1}^{L-1} floor(n + 300 * 2^(n/7)) )
//
// Level 2 needs 83 XP, level 92 about 6.5 million (half of 99), level 99
// about 13.03 million. XP is capped at 200 million per skill.

export const MAX_LEVEL = 99;
export const MAX_XP = 200_000_000;

export const XP_TABLE = (() => {
  const t = [0, 0]; // t[L] = XP needed for level L (index 0 unused)
  let points = 0;
  for (let L = 1; L < MAX_LEVEL; L++) {
    points += Math.floor(L + 300 * 2 ** (L / 7));
    t.push(Math.floor(points / 4));
  }
  return t;
})();

export const xpForLevel = (level) => XP_TABLE[Math.max(1, Math.min(MAX_LEVEL, level))];

export function levelForXp(xp) {
  let lo = 1;
  let hi = MAX_LEVEL;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (XP_TABLE[mid] <= xp) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

export const SKILLS = [
  { id: 'attack', name: 'Attack', about: 'Melee accuracy. Higher levels let you wield better weapons.' },
  { id: 'strength', name: 'Strength', about: 'Melee damage: raises your max hit.' },
  { id: 'defence', name: 'Defence', about: 'Makes you harder to hit. Higher levels let you wear better armour.' },
  { id: 'hitpoints', name: 'Hitpoints', about: 'Your health. Every point of damage you deal trains it.' },
  { id: 'ranged', name: 'Ranged', about: 'Bows and arrows. (Arrives in Batch 7.)' },
  { id: 'magic', name: 'Magic', about: 'Combat spells. (Arrives in Batch 7.)' },
];

export const SKILL_NAME = Object.fromEntries(SKILLS.map((s) => [s.id, s.name]));

// Starting XP for each skill: Hitpoints begins at level 10.
export function defaultSkills() {
  return Object.fromEntries(SKILLS.map((s) => [s.id, { xp: s.id === 'hitpoints' ? XP_TABLE[10] : 0 }]));
}

// Melee attack styles (Batch 7 adds ranged and magic ones).
// bonus: invisible level boosts used in the combat formulas.
// xp: how the 4 XP per damage is shared out.
export const MELEE_STYLES = [
  { id: 'accurate', name: 'Accurate', trains: 'Attack', bonus: { attack: 3 }, xp: { attack: 1 } },
  { id: 'aggressive', name: 'Aggressive', trains: 'Strength', bonus: { strength: 3 }, xp: { strength: 1 } },
  { id: 'defensive', name: 'Defensive', trains: 'Defence', bonus: { defence: 3 }, xp: { defence: 1 } },
  { id: 'controlled', name: 'Controlled', trains: 'Attack, Strength and Defence', bonus: { attack: 1, strength: 1, defence: 1 }, xp: { attack: 1 / 3, strength: 1 / 3, defence: 1 / 3 } },
];

export const styleById = (id) => MELEE_STYLES.find((s) => s.id === id) || MELEE_STYLES[0];

// Reads and grows the player's skills (kept in state.skills).
export class SkillBook {
  constructor(state, on = {}) {
    this.state = state;
    this.on = on; // { xp(skill, amount), levelUp(skill, level) }
  }

  xp(id) {
    return this.state.skills[id]?.xp ?? 0;
  }

  level(id) {
    return levelForXp(this.xp(id));
  }

  levels() {
    return Object.fromEntries(SKILLS.map((s) => [s.id, this.level(s.id)]));
  }

  total() {
    return SKILLS.reduce((sum, s) => sum + this.level(s.id), 0);
  }

  // Adds XP (kept to one decimal place). Returns levels gained.
  add(id, amount) {
    if (!(amount > 0)) return 0;
    const rec = this.state.skills[id] || (this.state.skills[id] = { xp: 0 });
    const before = levelForXp(rec.xp);
    rec.xp = Math.min(MAX_XP, Math.round((rec.xp + amount) * 10) / 10);
    const after = levelForXp(rec.xp);
    this.on.xp?.(id, amount);
    if (after > before) this.on.levelUp?.(id, after, before);
    return after - before;
  }
}
