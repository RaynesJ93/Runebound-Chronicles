// Enemy types. Stats follow the design doc; tune freely.
//
// speed: ticks between attacks (1 tick = 0.6 s)
// attackType: stab, slash or crush — which of your defence bonuses applies
// aggressive: attacks players whose combat level is below 2 x its level,
//             if they come within aggroRange tiles
// wander: how far it strolls from its spawn when idle
// leash: how far from spawn it will chase before giving up and walking home
// respawn: ticks after death before it comes back
// sprite: 'wolf' draws a four-legged animal instead of a person
// loot: always   -> dropped every kill
//       main     -> one roll; each entry has a chance (e.g. 1/16); otherwise nothing
//       rare     -> a separate roll at `chance`; hits drop with a light beam

export const ENEMIES = {
  goblin: {
    id: 'goblin', name: 'Goblin', level: 2, hp: 5,
    attack: 1, strength: 1, defence: 1,
    attackBonus: -10, strengthBonus: 0, defenceBonus: -15, maxHit: 1,
    speed: 5, attackType: 'crush', aggressive: false, wander: 3, leash: 7, respawn: 25,
    look: { skin: '#8bb04f', hair: '#3a2a1a', tunic: '#7a6440', pants: '#5a4a32', belt: '#3a2a1a', ears: true, eyes: '#c0392b' },
    examine: 'An ugly green creature. It smells of old cabbage.',
    loot: {
      always: [{ item: 'bones', qty: 1 }],
      main: [
        { item: 'coins', min: 1, max: 15, chance: 1 / 3 },
        { item: 'airRune', min: 4, max: 8, chance: 1 / 12 },
        { item: 'mindRune', min: 3, max: 7, chance: 1 / 12 },
        { item: 'bronzeArrow', min: 3, max: 10, chance: 1 / 10 },
        { item: 'bronzeDagger', qty: 1, chance: 1 / 16 },
        { item: 'goblinMail', qty: 1, chance: 1 / 32 },
      ],
      rare: { chance: 1 / 256, table: [{ item: 'warCharm', qty: 1 }] },
    },
  },
  goblinBrute: {
    id: 'goblinBrute', name: 'Goblin Brute', level: 5, hp: 10,
    attack: 2, strength: 2, defence: 2,
    attackBonus: 0, strengthBonus: 0, defenceBonus: -5, maxHit: 2,
    speed: 5, attackType: 'slash', aggressive: true, aggroRange: 2, wander: 2, leash: 5, respawn: 40,
    look: { skin: '#6a9a3e', hair: '#2a1e12', tunic: '#7a2f2a', pants: '#4a3a2a', belt: '#2a1e12', ears: true, eyes: '#ffcf3a', hat: 'helmet', hatColor: '#6e6257' },
    examine: 'A big goblin in a dented helmet. It looks like it wants a fight.',
    loot: {
      always: [{ item: 'bones', qty: 1 }],
      main: [
        { item: 'coins', min: 5, max: 30, chance: 1 / 2 },
        { item: 'bread', qty: 1, chance: 1 / 8 },
        { item: 'waterRune', min: 4, max: 9, chance: 1 / 10 },
        { item: 'bronzeSword', qty: 1, chance: 1 / 12 },
        { item: 'bronzeMedHelm', qty: 1, chance: 1 / 16 },
        { item: 'ironDagger', qty: 1, chance: 1 / 64 },
      ],
      rare: { chance: 1 / 128, table: [{ item: 'warCharm', qty: 1 }] },
    },
  },
  wolf: {
    id: 'wolf', name: 'Wolf', level: 7, hp: 14, sprite: 'wolf',
    attack: 5, strength: 5, defence: 4,
    attackBonus: 0, strengthBonus: 0, defenceBonus: 0, maxHit: 2,
    speed: 4, attackType: 'stab', aggressive: true, aggroRange: 3, wander: 3, leash: 8, respawn: 35,
    look: { fur: '#8a8f94', dark: '#5e6368', light: '#c4c8cc', eyes: '#f2c23a' },
    examine: 'A hungry grey wolf. Its eyes never leave you.',
    loot: {
      always: [{ item: 'bones', qty: 1 }],
      main: [
        { item: 'wolfPelt', qty: 1, chance: 1 / 4 },
        { item: 'coins', min: 3, max: 20, chance: 1 / 4 },
        { item: 'bronzeArrow', min: 5, max: 15, chance: 1 / 8 },
      ],
      rare: { chance: 1 / 128, table: [{ item: 'warCharm', qty: 1 }] },
    },
  },
  alphaWolf: {
    id: 'alphaWolf', name: 'Alpha Wolf', level: 14, hp: 40, sprite: 'wolf', boss: true,
    attack: 10, strength: 10, defence: 8,
    attackBonus: 5, strengthBonus: 0, defenceBonus: 5, maxHit: 4,
    speed: 4, attackType: 'stab', aggressive: true, aggroRange: 4, wander: 2, leash: 7, respawn: 300,
    look: { fur: '#4e5358', dark: '#2e3236', light: '#e8e8e4', eyes: '#ff6a3a', big: true },
    examine: 'The leader of the pack: huge, scarred and very angry.',
    loot: {
      always: [{ item: 'bones', qty: 1 }, { item: 'wolfPelt', qty: 2 }, { item: 'coins', min: 40, max: 120 }],
      main: [
        { item: 'ironDagger', qty: 1, chance: 1 / 3 },
        { item: 'mindRune', min: 15, max: 30, chance: 1 / 3 },
        { item: 'bronzeArrow', min: 25, max: 50, chance: 1 / 3 },
      ],
      rare: { chance: 1 / 32, table: [{ item: 'wolfCloak', qty: 1 }] },
    },
  },
};
