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
  // ---- New monsters (v0.46.0): filling the gaps between the old levels ----
  giantSpider: {
    id: 'giantSpider', name: 'Giant spider', level: 9, hp: 16,
    attack: 7, strength: 6, defence: 5, attackBonus: 4, strengthBonus: 2, defenceBonus: 2, maxHit: 2,
    speed: 4, attackType: 'stab', aggressive: true, aggroRange: 3, wander: 3, leash: 7, respawn: 35,
    look: { skin: '#5a3a24', hair: '#2a1a10', tunic: '#5a3a24', pants: '#5a3a24', eyes: '#e83020' },
    examine: 'A spider the size of a dog. It has far too many eyes, and all of them are looking at you.',
    loot: {
      always: [],
      main: [{ item: 'coins', min: 2, max: 15, chance: 1 / 4 }, { item: 'bronzeArrowtips', min: 5, max: 12, chance: 1 / 8 }, { item: 'feather', min: 5, max: 15, chance: 1 / 8 }, { item: 'uncutSapphire', qty: 1, chance: 1 / 64 }],
      rare: { chance: 1 / 128, table: [{ item: 'warCharm', qty: 1 }] },
    },
  },
  giantCrab: {
    id: 'giantCrab', name: 'Giant crab', level: 11, hp: 20,
    attack: 7, strength: 8, defence: 12, attackBonus: 2, strengthBonus: 4, defenceBonus: 15, maxHit: 3,
    speed: 5, attackType: 'crush', aggressive: false, wander: 2, leash: 5, respawn: 35, // not aggressive: beginners fish at this lake
    look: { skin: '#d8603a', hair: '#a83a20', tunic: '#d8603a', pants: '#d8603a', eyes: '#1a1a1a' },
    examine: 'A huge shore crab. Its shell is covered in barnacles, and one claw is as big as your head.',
    loot: {
      always: [],
      main: [{ item: 'rawShrimps', min: 1, max: 2, chance: 1 / 3 }, { item: 'rawSardine', qty: 1, chance: 1 / 5 }, { item: 'rawTrout', qty: 1, chance: 1 / 8 }, { item: 'coins', min: 5, max: 20, chance: 1 / 4 }, { item: 'uncutSapphire', qty: 1, chance: 1 / 50 }],
      rare: { chance: 1 / 128, table: [{ item: 'warCharm', qty: 1 }] },
    },
  },
  bandit: {
    id: 'bandit', name: 'Bandit', level: 13, hp: 22,
    attack: 9, strength: 10, defence: 8, attackBonus: 6, strengthBonus: 4, defenceBonus: 6, maxHit: 3,
    speed: 4, attackType: 'slash', aggressive: true, aggroRange: 4, wander: 3, leash: 7, respawn: 40,
    look: { skin: '#c99a72', hair: '#2a1a10', tunic: '#2e4a2a', pants: '#4a3a28', hat: 'hood', hatColor: '#2e4a2a' },
    examine: 'A highway robber in a green hood. He looks at your purse, not your face.',
    loot: {
      always: [{ item: 'bones', qty: 1 }],
      main: [{ item: 'coins', min: 10, max: 50, chance: 1 / 2 }, { item: 'bronzeDagger', qty: 1, chance: 1 / 12 }, { item: 'ironDagger', qty: 1, chance: 1 / 20 }, { item: 'hardLeather', qty: 1, chance: 1 / 10 }, { item: 'meatPie', qty: 1, chance: 1 / 8 }, { item: 'ironScimitar', qty: 1, chance: 1 / 40 }],
      rare: { chance: 1 / 96, table: [{ item: 'warCharm', qty: 1 }, { item: 'uncutEmerald', qty: 1 }] },
    },
  },
  skeleton: {
    id: 'skeleton', name: 'Skeleton', level: 16, hp: 26,
    attack: 13, strength: 12, defence: 12, attackBonus: 6, strengthBonus: 4, defenceBonus: 12, maxHit: 3,
    speed: 5, attackType: 'slash', aggressive: true, aggroRange: 4, wander: 2, leash: 6, respawn: 40,
    look: { skin: '#e8dcb8', hair: '#e8dcb8', tunic: '#8a5a32', pants: '#e8dcb8', hat: 'helmet', hatColor: '#8a5a32', eyes: '#60e060' },
    examine: 'An old soldier of the Goblin War, still wearing his helmet. He never got the message that it ended.',
    loot: {
      always: [{ item: 'bones', qty: 1 }],
      main: [{ item: 'coins', min: 8, max: 40, chance: 1 / 3 }, { item: 'ironArrow', min: 5, max: 15, chance: 1 / 8 }, { item: 'ironSqShield', qty: 1, chance: 1 / 20 }, { item: 'ironSword', qty: 1, chance: 1 / 24 }, { item: 'steelArrowtips', min: 5, max: 10, chance: 1 / 16 }, { item: 'uncutSapphire', qty: 1, chance: 1 / 40 }],
      rare: { chance: 1 / 96, table: [{ item: 'warCharm', qty: 1 }] },
    },
  },
  restlessGhost: {
    id: 'restlessGhost', name: 'Restless ghost', level: 24, hp: 32,
    attack: 20, strength: 18, defence: 16, attackBonus: 10, strengthBonus: 6, defenceBonus: 20, maxHit: 4,
    speed: 5, attackType: 'magic', aggressive: true, aggroRange: 4, wander: 3, leash: 6, respawn: 45,
    look: { skin: '#c8d8f0', hair: '#c8d8f0', tunic: '#c8d8f0', pants: '#c8d8f0', robe: true, eyes: '#1a1a2a' },
    examine: 'A pale spirit drifting between the graves. Its touch is cold enough to burn.',
    loot: {
      always: [],
      main: [{ item: 'coins', min: 20, max: 80, chance: 1 / 3 }, { item: 'mindRune', min: 5, max: 15, chance: 1 / 3 }, { item: 'airRune', min: 10, max: 25, chance: 1 / 4 }, { item: 'waterRune', min: 5, max: 15, chance: 1 / 5 }, { item: 'uncutEmerald', qty: 1, chance: 1 / 40 }],
      rare: { chance: 1 / 96, table: [{ item: 'warCharm', qty: 1 }, { item: 'uncutRuby', qty: 1 }] },
    },
  },
  airElemental: {
    id: 'airElemental', name: 'Air elemental', level: 28, hp: 36,
    attack: 18, strength: 20, defence: 18, attackBonus: 6, strengthBonus: 6, defenceBonus: 15, maxHit: 4,
    speed: 4, attackType: 'magic', aggressive: false, wander: 3, leash: 6, respawn: 45, // not aggressive: low-level runecrafters use the air altar
    look: { skin: '#dce4ec', hair: '#dce4ec', tunic: '#dce4ec', pants: '#dce4ec', robe: true, eyes: '#a8e8ff' },
    examine: 'A living whirlwind, drawn to the air altar. Leaves and grit spin round its glowing heart.',
    loot: {
      always: [],
      main: [{ item: 'airRune', min: 15, max: 40, chance: 1 / 2 }, { item: 'runeEssence', min: 1, max: 4, chance: 1 / 4 }, { item: 'mindRune', min: 5, max: 15, chance: 1 / 6 }, { item: 'feather', min: 10, max: 30, chance: 1 / 6 }, { item: 'uncutSapphire', qty: 1, chance: 1 / 32 }],
      rare: { chance: 1 / 96, table: [{ item: 'warCharm', qty: 1 }, { item: 'uncutDiamond', qty: 1 }] },
    },
  },
  fireImp: {
    id: 'fireImp', name: 'Fire imp', level: 32, hp: 38,
    attack: 24, strength: 24, defence: 18, attackBonus: 10, strengthBonus: 8, defenceBonus: 12, maxHit: 5,
    speed: 4, attackType: 'magic', aggressive: true, aggroRange: 4, wander: 3, leash: 6, respawn: 45,
    look: { skin: '#d84a20', hair: '#f8a020', tunic: '#d84a20', pants: '#a83010', eyes: '#f8e040' },
    examine: 'A little demon of the forge, all horns and flames. It giggles when it burns you.',
    loot: {
      always: [],
      main: [{ item: 'coins', min: 30, max: 100, chance: 1 / 3 }, { item: 'coal', min: 2, max: 5, chance: 1 / 3 }, { item: 'steelBar', qty: 1, chance: 1 / 12 }, { item: 'mithrilOre', qty: 1, chance: 1 / 16 }, { item: 'uncutRuby', qty: 1, chance: 1 / 48 }],
      rare: { chance: 1 / 96, table: [{ item: 'warCharm', qty: 1 }, { item: 'uncutDiamond', qty: 1 }] },
    },
  },
  // ---- Slayer monsters (v0.47.0): need a Slayer level to fight (slayer) --------------
  // regen: [hp, ticks] heals itself; drain: heals that share of the damage it deals;
  // resist: damage multipliers for your attack type; breath: every Nth attack is fire.
  caveCrawler: {
    id: 'caveCrawler', name: 'Cave crawler', level: 23, hp: 34, slayer: 10,
    attack: 16, strength: 16, defence: 14, attackBonus: 8, strengthBonus: 6, defenceBonus: 10, maxHit: 3,
    speed: 5, attackType: 'stab', aggressive: true, aggroRange: 2, wander: 3, leash: 7, respawn: 40,
    regen: [1, 6],
    look: { skin: '#6a7a3a', hair: '#3a4a1a', tunic: '#6a7a3a', pants: '#6a7a3a', eyes: '#f0e040' },
    examine: 'A many-legged cave thing with a shell like wet slate. Its wounds close as you watch.',
    loot: {
      always: [{ item: 'bones', qty: 1 }],
      main: [
        { item: 'coins', min: 20, max: 90, chance: 1 / 3 },
        { item: 'coal', min: 2, max: 4, chance: 1 / 4 },
        { item: 'ironOre', min: 2, max: 3, chance: 1 / 6 },
        { item: 'silverOre', min: 1, max: 2, chance: 1 / 8 },
        { item: 'goldOre', qty: 1, chance: 1 / 12 },
        { item: 'uncutSapphire', qty: 1, chance: 1 / 12 },
        { item: 'uncutEmerald', qty: 1, chance: 1 / 24 },
        { item: 'uncutRuby', qty: 1, chance: 1 / 64 },
      ],
      each: [{ item: 'crawlerShellBoots', qty: 1, chance: 1 / 64, rare: true }],
      rare: { chance: 1 / 128, table: [{ item: 'uncutDiamond', qty: 1 }, { item: 'warCharm', qty: 1 }] },
    },
  },
  bloodbat: {
    id: 'bloodbat', name: 'Bloodbat', level: 38, hp: 44, slayer: 25,
    attack: 36, strength: 30, defence: 26, attackBonus: 18, strengthBonus: 10, defenceBonus: 18, maxHit: 7,
    speed: 4, attackType: 'slash', aggressive: true, aggroRange: 3, wander: 4, leash: 8, respawn: 45,
    drain: 0.5,
    look: { skin: '#5a1a22', hair: '#2a0a10', tunic: '#5a1a22', pants: '#5a1a22', eyes: '#ff3030' },
    examine: 'A bat with a wingspan wider than you are tall. It drinks from whatever it bites.',
    loot: {
      always: [{ item: 'bones', qty: 1 }],
      main: [
        { item: 'coins', min: 50, max: 180, chance: 1 / 3 },
        { item: 'mithrilOre', min: 1, max: 2, chance: 1 / 6 },
        { item: 'mithrilBar', qty: 1, chance: 1 / 10 },
        { item: 'mithrilArrowtips', min: 10, max: 25, chance: 1 / 12 },
        { item: 'meatPie', min: 1, max: 2, chance: 1 / 10 },
        { item: 'uncutEmerald', qty: 1, chance: 1 / 20 },
        { item: 'uncutRuby', qty: 1, chance: 1 / 40 },
      ],
      rare: { chance: 1 / 128, table: [{ item: 'bloodfangAmulet', qty: 1 }] },
    },
  },
  stoneWraith: {
    id: 'stoneWraith', name: 'Stone wraith', level: 55, hp: 60, slayer: 45,
    attack: 42, strength: 40, defence: 50, attackBonus: 20, strengthBonus: 15, defenceBonus: 40, maxHit: 7,
    speed: 5, attackType: 'magic', aggressive: true, aggroRange: 3, wander: 3, leash: 8, respawn: 50,
    resist: { stab: 0.5, slash: 0.5, ranged: 0.5 },
    resistText: 'Your hit glances off its stone skin. Crush weapons and magic work better.',
    look: { skin: '#8a8a90', hair: '#4a4a52', tunic: '#6a6a72', pants: '#4a4a52', eyes: '#80f0ff' },
    examine: 'A ghost that took a body of rock. Blades skitter off it; it fears the hammer.',
    loot: {
      always: [{ item: 'bones', qty: 1 }],
      main: [
        { item: 'coins', min: 80, max: 260, chance: 1 / 3 },
        { item: 'mindRune', min: 20, max: 50, chance: 1 / 5 },
        { item: 'airRune', min: 30, max: 80, chance: 1 / 6 },
        { item: 'waterRune', min: 20, max: 60, chance: 1 / 6 },
        { item: 'adamantiteOre', min: 1, max: 2, chance: 1 / 8 },
        { item: 'adamantBar', qty: 1, chance: 1 / 14 },
        { item: 'uncutRuby', qty: 1, chance: 1 / 30 },
        { item: 'uncutDiamond', qty: 1, chance: 1 / 80 },
      ],
      each: [{ item: 'wraithboneStaff', qty: 1, chance: 1 / 128, rare: true }],
      rare: { chance: 1 / 128, table: [{ item: 'wraithstoneRing', qty: 1 }] },
    },
  },
  emberWyrm: {
    id: 'emberWyrm', name: 'Ember wyrm', level: 72, hp: 90, slayer: 60, glow: '#ff7a2a',
    attack: 60, strength: 62, defence: 55, attackBonus: 30, strengthBonus: 25, defenceBonus: 45, maxHit: 10,
    speed: 5, attackType: 'slash', aggressive: true, aggroRange: 3, wander: 2, leash: 7, respawn: 60,
    breath: { every: 4, maxHit: 15, text: 'The ember wyrm breathes fire!' },
    look: { skin: '#a83a1a', hair: '#5a1a0a', tunic: '#a83a1a', pants: '#5a1a0a', eyes: '#ffd040' },
    examine: 'A wingless dragon, long as a cart, with coals for scales. The forge never cooled because of it.',
    loot: {
      always: [{ item: 'bones', qty: 1 }],
      main: [
        { item: 'coins', min: 150, max: 450, chance: 1 / 3 },
        { item: 'coal', min: 5, max: 10, chance: 1 / 4 },
        { item: 'adamantBar', min: 1, max: 2, chance: 1 / 8 },
        { item: 'runiteOre', qty: 1, chance: 1 / 16 },
        { item: 'runeBar', qty: 1, chance: 1 / 32 },
        { item: 'uncutRuby', qty: 1, chance: 1 / 16 },
        { item: 'uncutDiamond', qty: 1, chance: 1 / 40 },
      ],
      each: [{ item: 'wyrmscaleBoots', qty: 1, chance: 1 / 128, rare: true }],
      rare: { chance: 1 / 200, table: [{ item: 'emberScimitar', qty: 1 }] },
    },
  },
  // v0.49.0: the deepest section of the Slayer Caverns, the Overgrowth.
  // root: every Nth attack holds you in place for some ticks.
  vinegraspHorror: {
    id: 'vinegraspHorror', name: 'Vinegrasp horror', level: 85, hp: 110, slayer: 70,
    attack: 66, strength: 66, defence: 56, attackBonus: 30, strengthBonus: 25, defenceBonus: 40, maxHit: 10,
    speed: 4, attackType: 'slash', aggressive: true, aggroRange: 3, wander: 2, leash: 7, respawn: 60,
    root: { every: 5, ticks: 5, text: 'Vines burst from the floor and wrap around your legs!' },
    look: { skin: '#2a5a1a', hair: '#123a0a', tunic: '#2a5a1a', pants: '#123a0a', eyes: '#f0dc50' },
    examine: 'A knot of thorny vines around a hungry maw. The roots under your feet move when it does.',
    loot: {
      always: [{ item: 'bones', qty: 1 }],
      main: [
        { item: 'coins', min: 200, max: 600, chance: 1 / 3 },
        { item: 'coal', min: 6, max: 12, chance: 1 / 5 },
        { item: 'runiteOre', min: 1, max: 2, chance: 1 / 10 },
        { item: 'runeBar', qty: 1, chance: 1 / 16 },
        { item: 'uncutRuby', qty: 1, chance: 1 / 16 },
        { item: 'uncutDiamond', min: 1, max: 2, chance: 1 / 30 },
        { item: 'salmon', min: 2, max: 4, chance: 1 / 8 }, // food for a fight that holds you in place
      ],
      rare: { chance: 1 / 256, table: [{ item: 'vineWhip', qty: 1 }] },
    },
  },
  // ---- Lumenhaven, the hidden fae city (v0.51.0) -----------------------------------------
  // Their drops are where high runes and extra essence come from before you can craft them.
  glimmerwisp: {
    id: 'glimmerwisp', name: 'Glimmerwisp', level: 44, hp: 48, glow: '#b8f0ff',
    attack: 36, strength: 30, defence: 30, attackBonus: 20, strengthBonus: 10, defenceBonus: 25, maxHit: 6,
    speed: 4, attackType: 'magic', aggressive: true, aggroRange: 3, wander: 4, leash: 8, respawn: 35,
    look: { skin: '#b8f0ff', hair: '#e8fbff', tunic: '#7ac8e8', pants: '#7ac8e8', eyes: '#ffffff' },
    examine: 'A drifting light with a face in it, if you look too long. It does not like visitors.',
    loot: {
      main: [
        { item: 'runeEssence', min: 2, max: 5, chance: 1 / 3 },
        { item: 'cosmicRune', min: 3, max: 8, chance: 1 / 5 },
        { item: 'chaosRune', min: 3, max: 8, chance: 1 / 5 },
        { item: 'earthRune', min: 10, max: 25, chance: 1 / 6 },
        { item: 'fireRune', min: 10, max: 25, chance: 1 / 6 },
        { item: 'natureRune', min: 1, max: 4, chance: 1 / 16 },
        { item: 'coins', min: 30, max: 120, chance: 1 / 8 },
      ],
      rare: { chance: 1 / 128, table: [{ item: 'uncutRuby', qty: 1 }, { item: 'uncutDiamond', qty: 1 }] },
    },
  },
  faeSentinel: {
    id: 'faeSentinel', name: 'Fae sentinel', level: 58, hp: 70,
    attack: 52, strength: 50, defence: 55, attackBonus: 25, strengthBonus: 20, defenceBonus: 40, maxHit: 8,
    speed: 4, attackType: 'slash', aggressive: true, aggroRange: 3, wander: 3, leash: 7, respawn: 45,
    look: { skin: '#d8f0d0', hair: '#e8d878', tunic: '#3a7a5a', pants: '#2a4a3a', eyes: '#a8ffd0' },
    examine: 'A fae knight in leaf-green armour, guarding the altars of the hidden city.',
    loot: {
      always: [{ item: 'bones', qty: 1 }],
      main: [
        { item: 'runeEssence', min: 3, max: 5, chance: 1 / 3 },
        { item: 'natureRune', min: 3, max: 8, chance: 1 / 5 },
        { item: 'lawRune', min: 2, max: 6, chance: 1 / 6 },
        { item: 'cosmicRune', min: 5, max: 10, chance: 1 / 6 },
        { item: 'coins', min: 100, max: 300, chance: 1 / 4 },
        { item: 'uncutEmerald', qty: 1, chance: 1 / 20 },
        { item: 'uncutRuby', qty: 1, chance: 1 / 40 },
      ],
      rare: { chance: 1 / 128, table: [{ item: 'uncutDiamond', qty: 1 }, { item: 'warCharm', qty: 1 }] },
    },
  },
  hollowShade: {
    id: 'hollowShade', name: 'Hollow shade', level: 70, hp: 90,
    attack: 46, strength: 48, defence: 55, attackBonus: 18, strengthBonus: 20, defenceBonus: 45, maxHit: 9,
    speed: 4, attackType: 'magic', aggressive: true, aggroRange: 3, wander: 3, leash: 7, respawn: 50,
    look: { skin: '#2a2438', hair: '#141020', tunic: '#2a2438', pants: '#141020', eyes: '#c8a8ff' },
    examine: 'A shadow with nothing to cast it. The death altar\'s cold has soaked into it.',
    loot: {
      main: [
        { item: 'runeEssence', min: 3, max: 5, chance: 1 / 3 },
        { item: 'deathRune', min: 3, max: 8, chance: 1 / 5 },
        { item: 'lawRune', min: 3, max: 8, chance: 1 / 6 },
        { item: 'chaosRune', min: 10, max: 20, chance: 1 / 6 },
        { item: 'natureRune', min: 5, max: 10, chance: 1 / 8 },
        { item: 'coins', min: 150, max: 400, chance: 1 / 5 },
        { item: 'uncutDiamond', qty: 1, chance: 1 / 40 },
      ],
      rare: { chance: 1 / 128, table: [{ item: 'uncutDiamond', min: 1, max: 2 }] },
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
