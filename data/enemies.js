// Enemy types. Stats follow the design doc; tune freely.
//
// speed: ticks between attacks (1 tick = 0.6 s)
// aggressive: attacks players whose combat level is below 2 x its level,
//             if they come within aggroRange tiles
// wander: how far it strolls from its spawn when idle
// leash: how far from spawn it will chase before giving up and walking home
// respawn: ticks after death before it comes back
// loot: always   -> dropped every kill
//       main     -> one roll; each entry has a chance (e.g. 1/16); otherwise nothing
//       rare     -> a separate roll at `chance`; hits drop with a light beam

export const ENEMIES = {
  goblin: {
    id: 'goblin', name: 'Goblin', level: 2, hp: 5,
    attack: 1, strength: 1, defence: 1,
    attackBonus: -10, strengthBonus: 0, defenceBonus: -15, maxHit: 1,
    speed: 5, aggressive: false, wander: 3, leash: 7, respawn: 25,
    look: { skin: '#8bb04f', hair: '#3a2a1a', tunic: '#7a6440', pants: '#5a4a32', belt: '#3a2a1a', ears: true, eyes: '#c0392b' },
    examine: 'An ugly green creature. It smells of old cabbage.',
    loot: {
      always: [{ item: 'bones', qty: 1 }],
      main: [
        { item: 'coins', min: 1, max: 15, chance: 1 / 3 },
        { item: 'airRune', min: 4, max: 8, chance: 1 / 12 },
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
    speed: 5, aggressive: true, aggroRange: 2, wander: 2, leash: 5, respawn: 40,
    look: { skin: '#6a9a3e', hair: '#2a1e12', tunic: '#7a2f2a', pants: '#4a3a2a', belt: '#2a1e12', ears: true, eyes: '#ffcf3a', hat: 'helmet', hatColor: '#6e6257' },
    examine: 'A big goblin in a dented helmet. It looks like it wants a fight.',
    loot: {
      always: [{ item: 'bones', qty: 1 }],
      main: [
        { item: 'coins', min: 5, max: 30, chance: 1 / 2 },
        { item: 'bread', qty: 1, chance: 1 / 8 },
        { item: 'bronzeSword', qty: 1, chance: 1 / 12 },
        { item: 'bronzeMedHelm', qty: 1, chance: 1 / 16 },
        { item: 'ironDagger', qty: 1, chance: 1 / 64 },
      ],
      rare: { chance: 1 / 128, table: [{ item: 'warCharm', qty: 1 }] },
    },
  },
};
