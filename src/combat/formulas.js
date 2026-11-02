// Combat maths, following the design doc (OSRS-inspired). Pure functions, no
// drawing or state, so they're easy to test and tune.

export const effectiveLevel = (level, styleBonus = 0) => Math.floor(level) + styleBonus + 8;

export const roll = (effective, bonus) => effective * (bonus + 64);

export function hitChance(attackRoll, defenceRoll) {
  return attackRoll > defenceRoll
    ? 1 - (defenceRoll + 2) / (2 * (attackRoll + 1))
    : attackRoll / (2 * (defenceRoll + 1));
}

export function maxHit(effectiveStrength, strengthBonus) {
  return Math.max(1, Math.floor(0.5 + (effectiveStrength * (strengthBonus + 64)) / 640));
}

// attacker: { attack, strength, attackBonus, strengthBonus, attackStyle, strengthStyle, maxHit? }
// defender: { defence, defenceBonus, defenceStyle }
// Returns the damage: 0 is a miss (blue splat); a successful hit does 1..max.
export function resolveAttack(rng, attacker, defender) {
  const a = roll(effectiveLevel(attacker.attack, attacker.attackStyle || 0), attacker.attackBonus || 0);
  const d = roll(effectiveLevel(defender.defence, defender.defenceStyle || 0), defender.defenceBonus || 0);
  const max = attacker.maxHit ?? maxHit(effectiveLevel(attacker.strength, attacker.strengthStyle || 0), attacker.strengthBonus || 0);
  if (rng() >= hitChance(a, d)) return 0;
  return 1 + Math.floor(rng() * max);
}

// Combat level, from the design doc. (No Prayer skill yet.)
export function combatLevel(s) {
  const base = 0.25 * (s.defence + s.hitpoints);
  const melee = 0.325 * (s.attack + s.strength);
  const ranged = 0.325 * Math.floor(1.5 * (s.ranged ?? 1));
  const magic = 0.325 * Math.floor(1.5 * (s.magic ?? 1));
  return Math.floor(base + Math.max(melee, ranged, magic));
}
