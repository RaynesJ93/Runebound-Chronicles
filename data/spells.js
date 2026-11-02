// Combat spells. Choose one in the Combat tab while wielding a staff; it's
// cast automatically every attack, using up its runes from your bag.
//
// maxHit: the spell's damage cap (magic damage bonuses add to it later)
// xp: Magic XP for every cast, even a miss (plus 2 per damage dealt)

export const SPELLS = [
  { id: 'windStrike', name: 'Wind Strike', level: 1, maxHit: 2, xp: 5.5, runes: { airRune: 1, mindRune: 1 }, colour: 'wind' },
  { id: 'waterStrike', name: 'Water Strike', level: 5, maxHit: 4, xp: 7.5, runes: { waterRune: 1, airRune: 1, mindRune: 1 }, colour: 'water' },
];

export const spellById = (id) => SPELLS.find((s) => s.id === id) || SPELLS[0];
