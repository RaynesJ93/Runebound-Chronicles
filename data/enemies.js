// Enemy types. Stats follow the design doc; tune freely.
//
// speed: ticks between attacks (1 tick = 0.6 s)
// attackType: stab, slash or crush — which of your defence bonuses applies
// aggressive: attacks players whose combat level is below 2 x its level,
//             if they come within aggroRange tiles
// wander: how far it strolls from its spawn when idle
// leash: how far from spawn it will chase before giving up and walking home
// respawn: ticks after death before it comes back
// sprite: 'wolf' draws a four-legged animal, 'chicken' a hen, 'cow' a cow, instead of a person
// loot: always   -> dropped every kill
//       main     -> one roll; each entry has a chance (e.g. 1/16); otherwise nothing
//       each     -> every entry rolls separately (so you can get several, or none)
//       rare     -> a separate roll at `chance`; hits drop with a light beam

export const ENEMIES = {
  cow: {
    id: 'cow', name: 'Cow', level: 2, hp: 8, sprite: 'cow',
    attack: 1, strength: 1, defence: 1,
    attackBonus: -15, strengthBonus: 0, defenceBonus: -15, maxHit: 1,
    speed: 6, attackType: 'crush', aggressive: false, wander: 3, leash: 5, respawn: 20,
    look: { hide: '#f2eee6', patch: '#2b2622' },
    examine: 'A big, calm cow. It chews and stares.',
    loot: {
      always: [{ item: 'bones', qty: 1 }, { item: 'cowhide', qty: 1 }],
      each: [{ item: 'rawBeef', qty: 1, chance: 1 / 2 }],
    },
  },
  chicken: {
    id: 'chicken', name: 'Chicken', level: 1, hp: 3, sprite: 'chicken',
    attack: 1, strength: 1, defence: 1,
    attackBonus: -20, strengthBonus: 0, defenceBonus: -20, maxHit: 1,
    speed: 5, attackType: 'stab', aggressive: false, wander: 2, leash: 4, respawn: 15,
    look: { feather: '#ece6da', dark: '#c9bfae', light: '#ffffff' },
    examine: 'A plump hen. She eyes you suspiciously.',
    loot: {
      always: [{ item: 'bones', qty: 1 }],
      each: [
        { item: 'rawChicken', qty: 1, chance: 1 / 2 },
        { item: 'feather', min: 5, max: 15, chance: 1 / 2 },
      ],
    },
  },
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
        { item: 'feather', min: 5, max: 15, chance: 1 / 10 },
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
  tunnelGoblin: {
    id: 'tunnelGoblin', name: 'Tunnel goblin', level: 4, hp: 8,
    attack: 2, strength: 2, defence: 2,
    attackBonus: -5, strengthBonus: 0, defenceBonus: -10, maxHit: 2,
    speed: 5, attackType: 'stab', aggressive: false, wander: 3, leash: 7, respawn: 30,
    look: { skin: '#7f9a4a', hair: '#2a1e12', tunic: '#5a4a3a', pants: '#3e3328', belt: '#2a1e12', ears: true, eyes: '#ffcf3a', hat: 'helmet', hatColor: '#c8a030' },
    examine: 'A goblin in a miner\'s helmet. It has been "borrowing" ore.',
    loot: {
      always: [{ item: 'bones', qty: 1 }],
      main: [
        { item: 'coins', min: 3, max: 20, chance: 1 / 3 },
        { item: 'copperOre', qty: 1, chance: 1 / 10 },
        { item: 'tinOre', qty: 1, chance: 1 / 10 },
        { item: 'ironOre', qty: 1, chance: 1 / 12 },
        { item: 'bronzePickaxe', qty: 1, chance: 1 / 24 },
        { item: 'bronzeBar', qty: 1, chance: 1 / 16 },
      ],
      rare: { chance: 1 / 200, table: [{ item: 'warCharm', qty: 1 }] },
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
