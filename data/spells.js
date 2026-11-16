// Combat spells. Choose one in the Combat tab while wielding a staff; it's
// cast automatically every attack, using up its runes from your bag.
//
// maxHit: the spell's damage cap (magic damage bonuses add to it later)
// xp: Magic XP for every cast, even a miss (plus 2 per damage dealt)

export const SPELLS = [
  { id: 'windStrike', name: 'Wind Strike', level: 1, maxHit: 2, xp: 5.5, runes: { airRune: 1, mindRune: 1 }, colour: 'wind' },
  { id: 'waterStrike', name: 'Water Strike', level: 5, maxHit: 4, xp: 7.5, runes: { waterRune: 1, airRune: 1, mindRune: 1 }, colour: 'water' },
  // v0.51.0 (skill review batch 2): strike, bolt (chaos), blast (death) and wave (death + body)
  { id: 'earthStrike', name: 'Earth Strike', level: 9, maxHit: 6, xp: 9.5, runes: { earthRune: 2, airRune: 1, mindRune: 1 }, colour: 'earth' },
  { id: 'fireStrike', name: 'Fire Strike', level: 13, maxHit: 8, xp: 11.5, runes: { fireRune: 3, airRune: 2, mindRune: 1 }, colour: 'fire' },
  { id: 'windBolt', name: 'Wind Bolt', level: 17, maxHit: 9, xp: 13.5, runes: { airRune: 2, chaosRune: 1 }, colour: 'wind' },
  { id: 'waterBolt', name: 'Water Bolt', level: 23, maxHit: 10, xp: 16.5, runes: { waterRune: 2, airRune: 2, chaosRune: 1 }, colour: 'water' },
  { id: 'earthBolt', name: 'Earth Bolt', level: 29, maxHit: 11, xp: 19.5, runes: { earthRune: 3, airRune: 2, chaosRune: 1 }, colour: 'earth' },
  { id: 'fireBolt', name: 'Fire Bolt', level: 35, maxHit: 12, xp: 22.5, runes: { fireRune: 4, airRune: 3, chaosRune: 1 }, colour: 'fire' },
  { id: 'windBlast', name: 'Wind Blast', level: 41, maxHit: 13, xp: 25.5, runes: { airRune: 3, deathRune: 1 }, colour: 'wind' },
  { id: 'waterBlast', name: 'Water Blast', level: 47, maxHit: 14, xp: 28.5, runes: { waterRune: 3, airRune: 3, deathRune: 1 }, colour: 'water' },
  { id: 'earthBlast', name: 'Earth Blast', level: 53, maxHit: 15, xp: 31.5, runes: { earthRune: 4, airRune: 3, deathRune: 1 }, colour: 'earth' },
  { id: 'fireBlast', name: 'Fire Blast', level: 59, maxHit: 16, xp: 34.5, runes: { fireRune: 5, airRune: 4, deathRune: 1 }, colour: 'fire' },
  { id: 'windWave', name: 'Wind Wave', level: 62, maxHit: 17, xp: 36, runes: { airRune: 5, deathRune: 1, bodyRune: 1 }, colour: 'wind' },
  { id: 'waterWave', name: 'Water Wave', level: 65, maxHit: 18, xp: 37.5, runes: { waterRune: 7, airRune: 5, deathRune: 1, bodyRune: 1 }, colour: 'water' },
  { id: 'earthWave', name: 'Earth Wave', level: 70, maxHit: 19, xp: 40, runes: { earthRune: 7, airRune: 5, deathRune: 1, bodyRune: 1 }, colour: 'earth' },
  { id: 'fireWave', name: 'Fire Wave', level: 75, maxHit: 20, xp: 42.5, runes: { fireRune: 7, airRune: 5, deathRune: 1, bodyRune: 1 }, colour: 'fire' },
].sort((a, b) => a.level - b.level);

// Other spells (v0.51.0), cast from the Spellbook list in the Combat tab with
// any weapon. teleport: where to; alch: share of the item's value in coins.
export const UTILITY = [
  { id: 'lowAlch', name: 'Low Alchemy', level: 21, xp: 31, runes: { natureRune: 1, fireRune: 3 }, alch: 0.4 },
  { id: 'teleBrambleford', name: 'Brambleford Teleport', level: 25, xp: 35, runes: { lawRune: 1, airRune: 3, fireRune: 1 }, teleport: { to: 'brambleford', x: 24, y: 11, name: 'Brambleford' } },
  { id: 'teleThornwood', name: 'Thornwood Teleport', level: 31, xp: 41, runes: { lawRune: 1, airRune: 3, waterRune: 1 }, teleport: { to: 'route1', x: 62, y: 43, name: 'the Thornwood crossroads' } },
  { id: 'teleCopperdeep', name: 'Copperdeep Teleport', level: 37, xp: 48, runes: { lawRune: 1, airRune: 1, earthRune: 3 }, teleport: { to: 'mine', x: 17, y: 20, name: 'Copperdeep Mine' } },
  { id: 'teleVale', name: 'Vale Teleport', level: 45, xp: 55.5, runes: { lawRune: 2, airRune: 2, waterRune: 2 }, teleport: { to: 'vale', x: 24, y: 24, name: 'the Whispering Vale' } },
  { id: 'highAlch', name: 'High Alchemy', level: 55, xp: 65, runes: { natureRune: 1, fireRune: 5 }, alch: 0.6 },
];

export const spellById = (id) => SPELLS.find((s) => s.id === id) || SPELLS[0];
