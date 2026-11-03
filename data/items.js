// Every item in the game.
//
// stackable: many of them share one inventory slot (coins, runes, arrows)
// value: base price in coins (shops arrive in Batch 8)
// rare: shows a light beam when it drops
// equip: makes it wieldable / wearable —
//   slot:  head, cape, neck, ammo, weapon, body, shield, legs, hands, feet, ring
//   req:   levels needed, e.g. { attack: 5 }
//   type:  weapons only — stab, slash or crush (which defence the enemy uses)
//   speed: weapons only — ticks between attacks (1 tick = 0.6 s)
//   att / def: bonuses by type { stab, slash, crush, ranged, magic }
//   str:   melee strength bonus (raises max hit)
//   look:  how it shows on your character
//   style: weapons only — 'melee' (default), 'ranged' (needs ammo) or 'magic' (casts spells)
//   range: ranged/magic weapons — how many tiles away you can attack from
// food: { heal } — eat to restore hitpoints (takes 3 ticks, delays your next attack)
// potion: { boost, doses, next } — drink a dose to boost a combat skill; next = what's left
// tool:  { skill: level } — a tool for a gathering skill (works from the bag or worn)

export const ITEMS = {
  coins: { name: 'Coins', stackable: true, value: 1, examine: 'Lovely money!' },
  bones: { name: 'Bones', value: 1, examine: 'Bones are for burying. (Prayer arrives in a later update.)' },
  bread: { name: 'Bread', value: 12, examine: 'Nice crusty bread.', food: { heal: 4 } },
  cookedTrout: { name: 'Trout', value: 30, examine: 'Some nicely cooked trout.', food: { heal: 7 } },
  // ---- Fishing and Cooking -----------------------------------------------------------
  smallNet: { name: 'Small fishing net', value: 5, examine: 'For catching shrimps and anchovies in the shallows.' },
  fishingRod: { name: 'Fishing rod', value: 5, examine: 'Use it with fishing bait to catch sardines and herring.' },
  flyFishingRod: { name: 'Fly fishing rod', value: 5, examine: 'Use it with feathers to lure trout and salmon.' },
  fishingBait: { name: 'Fishing bait', stackable: true, value: 3, examine: 'Wriggly worms. Fish love them.' },
  rawShrimps: { name: 'Raw shrimps', value: 5, examine: 'I should cook these on a fire.' },
  rawAnchovies: { name: 'Raw anchovies', value: 15, examine: 'I should cook these on a fire.' },
  rawSardine: { name: 'Raw sardine', value: 10, examine: 'I should cook this on a fire.' },
  rawHerring: { name: 'Raw herring', value: 15, examine: 'I should cook this on a fire.' },
  rawTrout: { name: 'Raw trout', value: 20, examine: 'I should cook this on a fire.' },
  rawSalmon: { name: 'Raw salmon', value: 30, examine: 'I should cook this on a fire.' },
  rawBeef: { name: 'Raw beef', value: 4, examine: 'I should cook this on a fire.' },
  cookedMeat: { name: 'Cooked meat', value: 6, examine: 'A juicy slab of cooked beef.', food: { heal: 3 } },
  burntMeat: { name: 'Burnt meat', value: 1, examine: 'Charred right through.' },
  cowhide: { name: 'Cowhide', value: 10, examine: 'A thick hide. Crafters turn it into leather.' },
  rawChicken: { name: 'Raw chicken', value: 4, examine: 'I should cook this on a fire.' },
  shrimps: { name: 'Shrimps', value: 8, examine: 'Some nicely cooked shrimps.', food: { heal: 3 } },
  anchovies: { name: 'Anchovies', value: 20, examine: 'A handful of cooked anchovies. Salty.', food: { heal: 1 } },
  sardine: { name: 'Sardine', value: 14, examine: 'A cooked sardine.', food: { heal: 4 } },
  herring: { name: 'Herring', value: 20, examine: 'A tasty cooked herring.', food: { heal: 5 } },
  salmon: { name: 'Salmon', value: 45, examine: 'A beautifully cooked salmon.', food: { heal: 9 } },
  cookedChicken: { name: 'Cooked chicken', value: 6, examine: 'Mmm, roast chicken.', food: { heal: 3 } },
  burntFish: { name: 'Burnt fish', value: 1, examine: 'Oops. This is charcoal now.' },
  burntChicken: { name: 'Burnt chicken', value: 1, examine: 'Very, very well done.' },
  meatPie: { name: 'Meat pie', value: 22, examine: 'A hearty pie. Still warm.', food: { heal: 6 } },
  vial: { name: 'Vial', value: 1, examine: 'An empty glass vial.' },
  airRune: { name: 'Air rune', stackable: true, value: 4, examine: 'One of the four basic elemental runes.' },
  waterRune: { name: 'Water rune', stackable: true, value: 4, examine: 'One of the four basic elemental runes.' },
  mindRune: { name: 'Mind rune', stackable: true, value: 3, examine: 'Used for basic missile spells.' },
  bronzeArrow: {
    name: 'Bronze arrow', stackable: true, value: 1, examine: 'Arrows with bronze heads. Wear them in your ammo slot to fire them from a bow.',
    equip: { slot: 'ammo', req: {}, rangedStr: 7, ammo: 'arrow' },
  },
  bronzeDagger: {
    name: 'Bronze dagger', value: 10, examine: 'Short and sharp. Quick to strike.',
    equip: { slot: 'weapon', req: { attack: 1 }, type: 'stab', speed: 4, att: { stab: 4, slash: 2, crush: -4, magic: 1 }, def: { magic: 1 }, str: 3, look: { weapon: 'bronze', blade: 4 } },
  },
  ironDagger: {
    name: 'Iron dagger', value: 35, examine: 'A sturdy iron dagger.',
    equip: { slot: 'weapon', req: { attack: 5 }, type: 'stab', speed: 4, att: { stab: 6, slash: 3, crush: -4, magic: 1 }, def: { magic: 1 }, str: 5, look: { weapon: 'iron', blade: 4 } },
  },
  bronzeSword: {
    name: 'Bronze sword', value: 26, examine: 'A razor-sharp sword. Well, sharp-ish.',
    equip: { slot: 'weapon', req: { attack: 1 }, type: 'slash', speed: 4, att: { stab: 4, slash: 5, crush: -2 }, def: { slash: 2, stab: 1 }, str: 5, look: { weapon: 'bronze', blade: 7 } },
  },
  shortbow: {
    name: 'Shortbow', value: 50, examine: 'A short, quick bow made from yew. Fires arrows from your ammo slot.',
    equip: { slot: 'weapon', req: { ranged: 1 }, style: 'ranged', ammo: 'arrow', range: 7, type: 'ranged', speed: 4, att: { ranged: 8 }, look: { weaponKind: 'bow' } },
  },
  apprenticeStaff: {
    name: 'Apprentice staff', value: 40, examine: 'A plain wooden staff. It hums faintly with magic.',
    equip: { slot: 'weapon', req: { magic: 1 }, style: 'magic', range: 8, type: 'crush', speed: 5, att: { magic: 6, crush: 3 }, def: { magic: 4, crush: 2 }, str: 2, look: { weaponKind: 'staff' } },
  },
  longbow: {
    name: 'Longbow', value: 80, examine: 'A tall bow. Slow to draw, but it shoots a long way.',
    equip: { slot: 'weapon', req: { ranged: 1 }, style: 'ranged', ammo: 'arrow', range: 9, type: 'ranged', speed: 6, att: { ranged: 8 }, look: { weaponKind: 'bow' } },
  },
  oakShortbow: {
    name: 'Oak shortbow', value: 100, examine: 'A short bow made from oak. Quick and strong.',
    equip: { slot: 'weapon', req: { ranged: 5 }, style: 'ranged', ammo: 'arrow', range: 7, type: 'ranged', speed: 4, att: { ranged: 14 }, look: { weaponKind: 'bow' } },
  },
  oakLongbow: {
    name: 'Oak longbow', value: 160, examine: 'A tall oak bow with a long reach.',
    equip: { slot: 'weapon', req: { ranged: 5 }, style: 'ranged', ammo: 'arrow', range: 9, type: 'ranged', speed: 6, att: { ranged: 14 }, look: { weaponKind: 'bow' } },
  },
  // ---- Woodcutting and Fletching -------------------------------------------------------
  bronzeAxe: {
    name: 'Bronze axe', value: 16, tool: { woodcutting: 1 }, examine: 'A woodcutter\'s axe. Works from your bag or in your hand.',
    equip: { slot: 'weapon', req: { attack: 1 }, type: 'slash', speed: 5, att: { stab: -2, slash: 4, crush: 2 }, str: 3, look: { weapon: 'bronze', blade: 5 } },
  },
  ironAxe: {
    name: 'Iron axe', value: 56, tool: { woodcutting: 5 }, examine: 'A sharper axe. Chops faster. Needs Woodcutting 5.',
    equip: { slot: 'weapon', req: { attack: 1 }, type: 'slash', speed: 5, att: { stab: -2, slash: 6, crush: 3 }, str: 5, look: { weapon: 'iron', blade: 5 } },
  },
  // ---- Mining and Smithing -----------------------------------------------------------
  bronzePickaxe: {
    name: 'Bronze pickaxe', value: 16, tool: { mining: 1 }, examine: 'For mining ore. Works from your bag or in your hand.',
    equip: { slot: 'weapon', req: { attack: 1 }, type: 'stab', speed: 5, att: { stab: 4, slash: -2, crush: 2 }, str: 3, look: { weapon: 'bronze', blade: 5 } },
  },
  ironPickaxe: {
    name: 'Iron pickaxe', value: 56, tool: { mining: 5 }, examine: 'A tougher pickaxe. Mines faster. Needs Mining 5.',
    equip: { slot: 'weapon', req: { attack: 1 }, type: 'stab', speed: 5, att: { stab: 6, slash: -2, crush: 3 }, str: 5, look: { weapon: 'iron', blade: 5 } },
  },
  hammer: { name: 'Hammer', value: 1, examine: 'For smithing at an anvil.' },
  copperOre: { name: 'Copper ore', value: 5, examine: 'Smelt it with tin ore to make bronze.' },
  tinOre: { name: 'Tin ore', value: 5, examine: 'Smelt it with copper ore to make bronze.' },
  ironOre: { name: 'Iron ore', value: 17, examine: 'Smelt it into an iron bar. (Not every bit is pure enough.)' },
  bronzeBar: { name: 'Bronze bar', value: 8, examine: 'Hammer it into shape at an anvil.' },
  ironBar: { name: 'Iron bar', value: 28, examine: 'Hammer it into shape at an anvil.' },
  ironArrowtips: { name: 'Iron arrowtips', stackable: true, value: 2, examine: 'Fix these onto headless arrows. Needs Fletching 15.' },
  ironArrow: {
    name: 'Iron arrow', stackable: true, value: 3, examine: 'Arrows with iron heads. They hit harder than bronze.',
    equip: { slot: 'ammo', req: {}, rangedStr: 10, ammo: 'arrow' },
  },
  ironSword: {
    name: 'Iron sword', value: 91, examine: 'A well-made iron sword.',
    equip: { slot: 'weapon', req: { attack: 5 }, type: 'slash', speed: 4, att: { stab: 6, slash: 8, crush: -2 }, def: { slash: 2, stab: 1 }, str: 7, look: { weapon: 'iron', blade: 7 } },
  },
  ironMedHelm: {
    name: 'Iron med helm', value: 84, examine: 'A medium-sized iron helmet.',
    equip: { slot: 'head', req: { defence: 5 }, att: { magic: -1 }, def: { stab: 4, slash: 5, crush: 3, magic: -1, ranged: 4 }, look: { hat: 'helmet', hatColor: '#8a9098' } },
  },
  bronzeSqShield: {
    name: 'Bronze sq shield', value: 48, examine: 'A square bronze shield.',
    equip: { slot: 'shield', req: { defence: 1 }, att: { magic: -1 }, def: { stab: 5, slash: 7, crush: 6, ranged: 6, magic: -1 }, look: { shield: 'bronze' } },
  },
  ironSqShield: {
    name: 'Iron sq shield', value: 168, examine: 'A square iron shield.',
    equip: { slot: 'shield', req: { defence: 5 }, att: { magic: -1 }, def: { stab: 8, slash: 9, crush: 7, ranged: 8, magic: -1 }, look: { shield: 'iron' } },
  },
  bronzeChainbody: {
    name: 'Bronze chainbody', value: 60, examine: 'A shirt of bronze rings.',
    equip: { slot: 'body', req: { defence: 1 }, att: { magic: -3 }, def: { stab: 7, slash: 11, crush: 13, ranged: 9, magic: -1 }, look: { tunic: '#a8692e' } },
  },
  ironChainbody: {
    name: 'Iron chainbody', value: 210, examine: 'A shirt of iron rings.',
    equip: { slot: 'body', req: { defence: 5 }, att: { magic: -4 }, def: { stab: 11, slash: 16, crush: 18, ranged: 13, magic: -1 }, look: { tunic: '#7a828b' } },
  },
  // ---- Crafting --------------------------------------------------------------------
  leather: { name: 'Leather', value: 15, examine: 'Soft tanned leather. Sew it with a needle and thread.' },
  hardLeather: { name: 'Hard leather', value: 30, examine: 'Stiff, tough leather. Good for armour.' },
  needle: { name: 'Needle', value: 1, examine: 'For sewing leather. Tap your leather to start.' },
  thread: { name: 'Thread', stackable: true, value: 2, examine: 'Strong thread. Each leather item uses one.' },
  knife: { name: 'Knife', value: 6, examine: 'Sharp enough to carve wood. Tap your logs to fletch them.' },
  logs: { name: 'Logs', value: 4, examine: 'Freshly cut pine logs.' },
  oakLogs: { name: 'Oak logs', value: 20, examine: 'Heavy logs from an oak tree.' },
  arrowShaft: { name: 'Arrow shaft', stackable: true, value: 1, examine: 'A wooden shaft. Add feathers to make headless arrows.' },
  feather: { name: 'Feather', stackable: true, value: 2, examine: 'Used to fletch arrows.' },
  headlessArrow: { name: 'Headless arrow', stackable: true, value: 1, examine: 'Needs some arrowtips to be useful.' },
  bronzeArrowtips: { name: 'Bronze arrowtips', stackable: true, value: 1, examine: 'Fix these onto headless arrows.' },
  wolfPelt: { name: 'Wolf pelt', value: 15, examine: 'Thick grey fur. Crafters will want this one day.' },
  wolfCloak: {
    name: 'Wolf-pelt cloak', value: 400, rare: true, examine: "A cloak of alpha wolf fur. Its old owner won't be needing it.",
    equip: { slot: 'cape', req: { defence: 5 }, att: { stab: 2, slash: 2, crush: 2, ranged: 2 }, def: { stab: 3, slash: 3, crush: 3, ranged: 3, magic: 2 }, str: 2, look: {} },
  },
  woodenShield: {
    name: 'Wooden shield', value: 20, examine: 'A solid wooden shield.',
    equip: { slot: 'shield', req: { defence: 1 }, def: { stab: 4, slash: 5, crush: 3, ranged: 4 }, look: { shield: 'wood' } },
  },
  leatherBody: {
    name: 'Leather body', value: 21, examine: 'Better than nothing. Good for archers.',
    equip: { slot: 'body', req: { defence: 1 }, def: { stab: 2, slash: 4, crush: 3, ranged: 3, magic: 1 }, att: { ranged: 2 }, look: { tunic: '#8a5a32' } },
  },
  leatherCowl: {
    name: 'Leather cowl', value: 24, examine: 'A leather hood. Popular with archers.',
    equip: { slot: 'head', req: { defence: 1 }, att: { ranged: 1 }, def: { stab: 1, slash: 2, crush: 2, ranged: 2, magic: 1 }, look: { hat: 'hood', hatColor: '#7a4a26' } },
  },
  leatherVambraces: {
    name: 'Leather vambraces', value: 18, examine: 'Leather arm guards. They steady your aim.',
    equip: { slot: 'hands', req: { ranged: 1 }, att: { ranged: 4 }, def: { stab: 2, slash: 2, crush: 2, ranged: 1 } },
  },
  leatherChaps: {
    name: 'Leather chaps', value: 20, examine: 'Tough leather leggings.',
    equip: { slot: 'legs', req: { defence: 1 }, att: { ranged: 4 }, def: { stab: 2, slash: 2, crush: 2, ranged: 4, magic: 1 }, look: { pants: '#7a4a26' } },
  },
  hardLeatherBody: {
    name: 'Hard leather body', value: 170, examine: 'Boiled and hardened leather. Needs Defence 10.',
    equip: { slot: 'body', req: { defence: 10 }, att: { ranged: 8, magic: -6 }, def: { stab: 12, slash: 15, crush: 18, ranged: 20, magic: 6 }, look: { tunic: '#5e3b1f' } },
  },
  leatherGloves: {
    name: 'Leather gloves', value: 6, examine: 'Keeps your hands warm and your grip firm.',
    equip: { slot: 'hands', req: {}, def: { stab: 1, slash: 1, crush: 1 }, att: { ranged: 1 } },
  },
  leatherBoots: {
    name: 'Leather boots', value: 6, examine: 'Comfortable leather boots.',
    equip: { slot: 'feet', req: {}, def: { stab: 1, slash: 1, crush: 1 } },
  },
  bronzeMedHelm: {
    name: 'Bronze med helm', value: 24, examine: 'A medium-sized bronze helmet.',
    equip: { slot: 'head', req: { defence: 1 }, att: { magic: -1 }, def: { stab: 3, slash: 4, crush: 2, magic: -1, ranged: 3 }, look: { hat: 'helmet', hatColor: '#b07a3a' } },
  },
  goblinMail: {
    name: 'Goblin mail', value: 5, examine: 'Armour made to fit a goblin. It might fit you if you squeeze.',
    equip: { slot: 'body', req: { defence: 1 }, def: { stab: 2, slash: 2, crush: 2, ranged: 1 }, look: { tunic: '#6f7a52' } },
  },
  warCharm: {
    name: 'Goblin war-charm', value: 250, rare: true, examine: 'A tooth-and-bead charm. Goblins swear it brings luck in battle.',
    equip: { slot: 'neck', req: {}, att: { stab: 3, slash: 3, crush: 3 }, def: { stab: 1, slash: 1, crush: 1 }, str: 2 },
  },
};

// Potions: 4, 3, 2 and 1 dose versions. Each dose boosts one skill by
// 3 + 10% of its level; the boost wears off by 1 level a minute.
for (const [skill, name, value] of [['attack', 'Attack', 60], ['strength', 'Strength', 75], ['defence', 'Defence', 60]]) {
  for (let d = 4; d >= 1; d--) {
    ITEMS[`${skill}Potion${d}`] = {
      name: `${name} potion (${d})`,
      value: Math.round((value * d) / 4),
      examine: `${d} dose${d > 1 ? 's' : ''} of ${name.toLowerCase()} potion.`,
      potion: { boost: skill, doses: d, next: d > 1 ? `${skill}Potion${d - 1}` : 'vial' },
    };
  }
}

export const itemName = (id) => ITEMS[id]?.name ?? id;
