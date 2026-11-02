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
