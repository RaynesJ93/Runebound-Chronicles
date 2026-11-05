// Enemy types. Stats follow the design doc; tune freely.
//
// speed: ticks between attacks (1 tick = 0.6 s)
// attackType: stab, slash or crush — which of your defence bonuses applies
// aggressive: attacks players whose combat level is below 2 x its level,
//             if they come within aggroRange tiles
// wander: how far it strolls from its spawn when idle
// leash: how far from spawn it will chase before giving up and walking home
// respawn: ticks after death before it comes back
// sprite: 'wolf' draws a four-legged animal, 'chicken' a hen, 'cow' a cow, 'golem' an essence golem, instead of a person
// loot: always   -> dropped every kill
//       main     -> one roll; each entry has a chance (e.g. 1/16); otherwise nothing
//       each     -> every entry rolls separately (so you can get several, or none)
//       rare     -> a separate roll at `chance`; hits drop with a light beam

export const ENEMIES = {
  essenceGolem: {
    id: 'essenceGolem', name: 'Essence golem', level: 12, hp: 24, sprite: 'golem',
    attack: 8, strength: 8, defence: 10,
    attackBonus: 0, strengthBonus: 0, defenceBonus: 10, maxHit: 3,
    speed: 6, attackType: 'crush', aggressive: false, wander: 4, leash: 7, respawn: 60,
    look: {},
    examine: 'Living stone, held together by rune essence. It hums as it walks.',
    loot: {
      always: [{ item: 'runeEssence', min: 4, max: 12 }],
      each: [
        { item: 'airRune', min: 8, max: 20, chance: 1 / 2 },
        { item: 'mindRune', min: 5, max: 15, chance: 1 / 3 },
        { item: 'waterRune', min: 4, max: 12, chance: 1 / 3 },
      ],
    },
  },
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
  goblinChief: {
    id: 'goblinChief', name: 'Goblin Chief', level: 16, hp: 45, boss: true,
    attack: 12, strength: 12, defence: 10,
    attackBonus: 8, strengthBonus: 6, defenceBonus: 8, maxHit: 4,
    speed: 5, attackType: 'crush', aggressive: true, aggroRange: 4, wander: 2, leash: 6, respawn: 300,
    look: { skin: '#5a8a34', hair: '#2a1e12', tunic: '#6a1e1a', pants: '#3a2a1a', belt: '#c8a030', ears: true, eyes: '#ff3a1a', hat: 'helmet', hatColor: '#c8a030' },
    examine: 'The biggest goblin you have ever seen, in a crown of bent iron. He does not look pleased to be awake.',
    loot: {
      always: [{ item: 'bones', qty: 1 }, { item: 'coins', min: 60, max: 150 }],
      main: [
        { item: 'ironSword', qty: 1, chance: 1 / 4 },
        { item: 'goblinMail', qty: 1, chance: 1 / 4 },
        { item: 'ironMedHelm', qty: 1, chance: 1 / 5 },
        { item: 'steelSword', qty: 1, chance: 1 / 12 },
        { item: 'meatPie', qty: 2, chance: 1 / 4 },
      ],
      rare: { chance: 1 / 16, table: [{ item: 'warCharm', qty: 1 }] },
    },
  },
  // ---- The Goblin Warrens (The Runebound, chapter 5) ----
  warrenGoblin: {
    id: 'warrenGoblin', name: 'Warren goblin', level: 20, hp: 30,
    attack: 16, strength: 15, defence: 14,
    attackBonus: 8, strengthBonus: 6, defenceBonus: 10, maxHit: 3,
    speed: 5, attackType: 'slash', aggressive: true, aggroRange: 3, wander: 2, leash: 6, respawn: 40,
    look: { skin: '#8a9a80', hair: '#1a1a14', tunic: '#5a2a24', pants: '#3a3028', belt: '#1a1a14', ears: true, eyes: '#e8e0a0', hat: 'helmet', hatColor: '#5a5650' },
    examine: 'A pale goblin with huge eyes. It has never seen the sun, and it does not want to.',
    loot: {
      always: [{ item: 'bones', qty: 1 }],
      main: [
        { item: 'coins', min: 20, max: 80, chance: 1 / 2 },
        { item: 'coal', qty: 1, chance: 1 / 6 },
        { item: 'mithrilOre', qty: 1, chance: 1 / 12 },
        { item: 'mindRune', min: 10, max: 25, chance: 1 / 8 },
        { item: 'waterRune', min: 10, max: 25, chance: 1 / 8 },
        { item: 'steelMedHelm', qty: 1, chance: 1 / 20 },
        { item: 'steelSword', qty: 1, chance: 1 / 24 },
        { item: 'meatPie', qty: 1, chance: 1 / 10 },
      ],
      rare: { chance: 1 / 128, table: [{ item: 'warCharm', qty: 1 }] },
    },
  },
  goblinDigmaster: {
    id: 'goblinDigmaster', name: 'Goblin Digmaster', level: 26, hp: 60, boss: true,
    attack: 22, strength: 22, defence: 20,
    attackBonus: 12, strengthBonus: 10, defenceBonus: 14, maxHit: 5,
    speed: 5, attackType: 'crush', aggressive: true, aggroRange: 4, wander: 2, leash: 5, respawn: 180,
    look: { skin: '#8a9a80', hair: '#1a1a14', tunic: '#6a4a2a', pants: '#3a2a1a', belt: '#c8a030', ears: true, eyes: '#ffe080', hat: 'helmet', hatColor: '#c8a030' },
    examine: 'The goblin in charge of the dig. He carries a huge pick and a scroll of orders.',
    loot: {
      always: [{ item: 'bones', qty: 1 }, { item: 'coins', min: 100, max: 250 }],
      main: [
        { item: 'steelChainbody', qty: 1, chance: 1 / 6 },
        { item: 'mithrilOre', min: 2, max: 4, chance: 1 / 4 },
        { item: 'mithrilMedHelm', qty: 1, chance: 1 / 12 },
        { item: 'mithrilSword', qty: 1, chance: 1 / 16 },
        { item: 'meatPie', qty: 2, chance: 1 / 4 },
      ],
      rare: { chance: 1 / 12, table: [{ item: 'warCharm', qty: 1 }] },
    },
  },
  // ---- The Runebound, chapter 6: the warlord himself ----
  grubnak: {
    id: 'grubnak', name: 'Grubnak', level: 40, hp: 90, boss: true,
    attack: 30, strength: 28, defence: 16,
    attackBonus: 16, strengthBonus: 12, defenceBonus: 4, maxHit: 6,
    speed: 5, attackType: 'crush', aggressive: true, aggroRange: 7, wander: 0, leash: 14, respawn: 1e9,
    look: { skin: '#5a6460', hair: '#1a1a14', tunic: '#561420', pants: '#2a1a14', belt: '#c8a030', ears: true, eyes: '#80e8ff', hat: 'helmet', hatColor: '#c8a030' },
    examine: 'The goblin warlord of forty years ago. His skin has turned the grey of the rock he slept in, and runes still glow on it.',
    defeatFlag: 'grubnakDown',
    defeatText: ['Grubnak staggers. The runes on his skin flare white, and he drops to one knee with a crash that shakes the whole chamber.',
      'The chains go slack. For the first time in forty years, the warlord is still.', 'Tobin will want to see this.'],
    // Boss mechanics (bossTick in src/combat/combat.js)
    mechanics: {
      chained: true,                 // chains are drawn from the rune pillars to him
      slamEvery: 10, slamEvery2: 8,  // ticks between ground slams (phase 1, phase 2)
      slamWindup: 4,                 // ticks of red warning before it lands
      slamShape: 'plus',             // your tile and the four next to it: step diagonally to get clear
      slamDmg: [3, 7], slamDmg2: [5, 9],
      slamText: 'Grubnak raises both fists over his head. The ground glows red under you: MOVE!',
      warCry: [0.75, 0.4], adds: 'warrenGoblin', addCount: 2,
      warCryText: 'Grubnak bellows a war cry, and warren goblins come pouring out of the tunnels!',
      phase2At: 0.5,
      phase2: { maxHit: 8, speed: 4 },
      phase2Text: 'With a scream of iron, one of the chains SNAPS! Grubnak is enraged!',
    },
    loot: { always: [{ item: 'bones', qty: 1 }], main: [] },
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
  caveBeast: {
    id: 'caveBeast', name: 'Cave beast', level: 20, hp: 30, sprite: 'wolf',
    attack: 16, strength: 16, defence: 14,
    attackBonus: 5, strengthBonus: 5, defenceBonus: 10, maxHit: 4,
    speed: 5, attackType: 'crush', aggressive: true, aggroRange: 2, wander: 3, leash: 7, respawn: 40,
    look: { fur: '#5e3b2e', dark: '#3a2418', light: '#a8786a', eyes: '#ffcf3a', big: true },
    examine: 'A huge, shaggy beast that lives in the dark. It does not like visitors.',
    loot: {
      always: [{ item: 'bones', qty: 1 }],
      main: [
        { item: 'coins', min: 20, max: 80, chance: 1 / 3 },
        { item: 'coal', min: 1, max: 3, chance: 1 / 4 },
        { item: 'ironOre', min: 1, max: 2, chance: 1 / 6 },
        { item: 'steelBar', qty: 1, chance: 1 / 12 },
        { item: 'steelArrowtips', min: 5, max: 15, chance: 1 / 16 },
        { item: 'steelMedHelm', qty: 1, chance: 1 / 40 },
        { item: 'steelMace', qty: 1, chance: 1 / 48 },
        { item: 'uncutSapphire', qty: 1, chance: 1 / 32 },
        { item: 'uncutEmerald', qty: 1, chance: 1 / 64 },
      ],
      rare: { chance: 1 / 128, table: [{ item: 'warCharm', qty: 1 }, { item: 'uncutRuby', qty: 1 }, { item: 'uncutDiamond', qty: 1 }] },
    },
  },  forgeGolem: {
    id: 'forgeGolem', name: 'Forge golem', level: 48, hp: 70, sprite: 'golem', glow: '#ff8a3a',
    attack: 40, strength: 44, defence: 40,
    attackBonus: 15, strengthBonus: 15, defenceBonus: 40, maxHit: 8,
    speed: 6, attackType: 'crush', aggressive: true, aggroRange: 3, wander: 3, leash: 7, respawn: 50,
    look: {},
    examine: 'Iron and slag, still hot from the forge. The dwarves built it to guard their work.',
    loot: {
      always: [{ item: 'bones', qty: 1 }],
      main: [
        { item: 'coins', min: 60, max: 220, chance: 1 / 3 },
        { item: 'coal', min: 3, max: 6, chance: 1 / 4 },
        { item: 'adamantiteOre', qty: 1, chance: 1 / 8 },
        { item: 'adamantBar', qty: 1, chance: 1 / 16 },
        { item: 'mithrilBar', min: 1, max: 2, chance: 1 / 10 },
        { item: 'adamantArrowtips', min: 5, max: 15, chance: 1 / 16 },
        { item: 'uncutEmerald', qty: 1, chance: 1 / 24 },
        { item: 'adamantMedHelm', qty: 1, chance: 1 / 48 },
      ],
      rare: { chance: 1 / 128, table: [{ item: 'runiteOre', qty: 1 }, { item: 'uncutRuby', qty: 1 }, { item: 'adamantKiteshield', qty: 1 }] },
    },
  },
  moltenBeast: {
    id: 'moltenBeast', name: 'Molten beast', level: 70, hp: 160, sprite: 'wolf', boss: true, glow: '#ff6a2a',
    attack: 62, strength: 64, defence: 55,
    attackBonus: 25, strengthBonus: 25, defenceBonus: 45, maxHit: 13,
    speed: 5, attackType: 'slash', aggressive: true, aggroRange: 4, wander: 2, leash: 6, respawn: 300,
    look: { fur: '#2a1a14', dark: '#120a08', light: '#ff8a3a', eyes: '#ffd23a', big: true },
    examine: 'A great beast with a hide like cooling lava. The heat coming off it is unbearable.',
    loot: {
      always: [{ item: 'bones', qty: 1 }, { item: 'coins', min: 400, max: 1200 }, { item: 'coal', min: 8, max: 16 }],
      main: [
        { item: 'runiteOre', min: 1, max: 3, chance: 1 / 3 },
        { item: 'adamantBar', min: 2, max: 4, chance: 1 / 3 },
        { item: 'runeBar', qty: 1, chance: 1 / 6 },
        { item: 'runeArrowtips', min: 10, max: 30, chance: 1 / 8 },
      ],
      each: [
        { item: 'uncutRuby', qty: 1, chance: 1 / 6 },
        { item: 'uncutDiamond', qty: 1, chance: 1 / 12 },
      ],
      rare: { chance: 1 / 16, table: [{ item: 'runeFullHelm', qty: 1 }, { item: 'runeScimitar', qty: 1 }, { item: 'runeKiteshield', qty: 1 }, { item: 'rune2hSword', qty: 1 }] },
    },
  },
  nightStalker: {
    id: 'nightStalker', name: 'Night stalker', level: 35, hp: 45,
    attack: 30, strength: 28, defence: 24,
    attackBonus: 10, strengthBonus: 8, defenceBonus: 12, maxHit: 6,
    speed: 4, attackType: 'slash', aggressive: true, aggroRange: 3, wander: 4, leash: 8, respawn: 45,
    look: { skin: '#3a2a5a', hair: '#1a1028', tunic: '#2a1e40', pants: '#1a1028', belt: '#1a1028', eyes: '#5ff0ff' },
    examine: 'A thing made of shadow, with eyes like cold fire. It moves too quickly.',
    loot: {
      always: [{ item: 'bones', qty: 1 }],
      main: [
        { item: 'coins', min: 40, max: 150, chance: 1 / 3 },
        { item: 'coal', min: 2, max: 4, chance: 1 / 4 },
        { item: 'mithrilOre', qty: 1, chance: 1 / 8 },
        { item: 'mithrilBar', qty: 1, chance: 1 / 14 },
        { item: 'mithrilArrowtips', min: 5, max: 15, chance: 1 / 16 },
        { item: 'uncutSapphire', qty: 1, chance: 1 / 20 },
        { item: 'uncutEmerald', qty: 1, chance: 1 / 40 },
        { item: 'mithrilMedHelm', qty: 1, chance: 1 / 50 },
        { item: 'mithrilScimitar', qty: 1, chance: 1 / 64 },
      ],
      rare: { chance: 1 / 96, table: [{ item: 'uncutRuby', qty: 1 }, { item: 'uncutDiamond', qty: 1 }, { item: 'mithrilKiteshield', qty: 1 }] },
    },
  },
};
