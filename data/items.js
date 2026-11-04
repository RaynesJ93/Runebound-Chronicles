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
  ironOre: { name: 'Iron ore', value: 17, examine: 'Smelt it into an iron bar.' },
  bronzeBar: { name: 'Bronze bar', value: 8, examine: 'Hammer it into shape at an anvil.' },
  ironBar: { name: 'Iron bar', value: 28, examine: 'Hammer it into shape at an anvil.' },
  ironArrowtips: { name: 'Iron arrowtips', stackable: true, value: 2, examine: 'Fix these onto headless arrows. Needs Fletching 15.' },
  coal: { name: 'Coal', value: 45, examine: 'A lump of coal. Smelt it with iron ore to make steel.' },
  silverOre: { name: 'Silver ore', value: 75, examine: 'Smelt it into a silver bar.' },
  goldOre: { name: 'Gold ore', value: 150, examine: 'Smelt it into a gold bar.' },
  silverBar: { name: 'Silver bar', value: 100, examine: 'Cast it into rings and amulets at a furnace, with a mould.' },
  goldBar: { name: 'Gold bar', value: 300, examine: 'Cast it into rings and amulets at a furnace, with a mould.' },
  chisel: { name: 'Chisel', value: 5, examine: 'For cutting gems. Tap an uncut gem to start.' },
  ringMould: { name: 'Ring mould', value: 5, examine: 'Cast rings in it at a furnace.' },
  amuletMould: { name: 'Amulet mould', value: 5, examine: 'Cast amulets in it at a furnace.' },
  uncutSapphire: { name: 'Uncut sapphire', value: 50, examine: 'A rough sapphire. Cut it with a chisel.' },
  sapphire: { name: 'Sapphire', value: 75, examine: 'A cut sapphire. Set it in a ring or amulet at a furnace.' },
  uncutEmerald: { name: 'Uncut emerald', value: 100, examine: 'A rough emerald. Cut it with a chisel.' },
  emerald: { name: 'Emerald', value: 150, examine: 'A cut emerald. Set it in a ring or amulet at a furnace.' },
  uncutRuby: { name: 'Uncut ruby', value: 250, examine: 'A rough ruby. Cut it with a chisel.' },
  ruby: { name: 'Ruby', value: 375, examine: 'A cut ruby. Set it in a ring or amulet at a furnace.' },
  uncutDiamond: { name: 'Uncut diamond', value: 800, examine: 'A rough diamond. Cut it with a chisel.' },
  diamond: { name: 'Diamond', value: 1200, examine: 'A cut diamond. Set it in a ring or amulet at a furnace.' },
  steelBar: { name: 'Steel bar', value: 60, examine: 'Hammer it into shape at an anvil. Tougher than iron.' },
  mithrilOre: { name: 'Mithril ore', value: 160, examine: 'A light, blue-tinged ore. Smelt it with a lump of coal.' },
  mithrilBar: { name: 'Mithril bar', value: 300, examine: 'Hammer it into shape at an anvil. Light and very strong.' },
  mithrilArrowtips: { name: 'Mithril arrowtips', stackable: true, value: 10, examine: 'Fix these onto headless arrows. Needs Fletching 45.' },
  mithrilArrow: {
    name: 'Mithril arrow', stackable: true, value: 14, examine: 'Arrows with mithril heads. They hit harder than steel.',
    equip: { slot: 'ammo', req: {}, rangedStr: 22, ammo: 'arrow' },
  },
  steelArrowtips: { name: 'Steel arrowtips', stackable: true, value: 4, examine: 'Fix these onto headless arrows. Needs Fletching 30.' },
  steelArrow: {
    name: 'Steel arrow', stackable: true, value: 6, examine: 'Arrows with steel heads. They hit harder than iron.',
    equip: { slot: 'ammo', req: {}, rangedStr: 16, ammo: 'arrow' },
  },
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
  // ---- Runecrafting ----------------------------------------------------------------
  runeEssence: { name: 'Rune essence', value: 4, examine: 'Pure magical essence. Take it to an altar to bind it into runes.' },
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
  hardLeatherGloves: {
    name: 'Hard leather gloves', value: 40, examine: 'Stiff leather gloves. A sure grip on the bowstring.',
    equip: { slot: 'hands', req: {}, att: { ranged: 2 }, def: { stab: 2, slash: 2, crush: 2, ranged: 1 } },
  },
  hardLeatherBoots: {
    name: 'Hard leather boots', value: 40, examine: 'Hardened leather boots with thick soles.',
    equip: { slot: 'feet', req: {}, att: { ranged: 1 }, def: { stab: 2, slash: 2, crush: 2, ranged: 1 } },
  },
  hardLeatherCowl: {
    name: 'Hard leather cowl', value: 60, examine: 'A hood of hardened leather. Needs Defence 5.',
    equip: { slot: 'head', req: { defence: 5 }, att: { ranged: 2, magic: -1 }, def: { stab: 3, slash: 4, crush: 4, ranged: 4, magic: 2 }, look: { hat: 'hood', hatColor: '#5e3b1f' } },
  },
  hardLeatherChaps: {
    name: 'Hard leather chaps', value: 90, examine: 'Hardened leather leggings. Needs Defence 5.',
    equip: { slot: 'legs', req: { defence: 5 }, att: { ranged: 6, magic: -2 }, def: { stab: 4, slash: 4, crush: 4, ranged: 6, magic: 2 }, look: { pants: '#5e3b1f' } },
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
  bronzeFullHelm: {
    name: 'Bronze full helm', value: 44, examine: 'A full-face bronze helmet.',
    equip: { slot: 'head', req: { defence: 1 }, att: { magic: -3, ranged: -1 }, def: { stab: 4, slash: 5, crush: 3, ranged: 4, magic: -1 }, look: { hat: 'helmet', hatColor: '#b07a3a' } },
  },
  bronzePlatebody: {
    name: 'Bronze platebody', value: 160, examine: 'Solid bronze plates. Heavy, but very tough.',
    equip: { slot: 'body', req: { defence: 1 }, att: { magic: -15, ranged: -7 }, def: { stab: 15, slash: 14, crush: 9, ranged: 14, magic: -6 }, look: { tunic: '#b07a3a' } },
  },
  bronzePlatelegs: {
    name: 'Bronze platelegs', value: 80, examine: 'Leg armour of bronze plates.',
    equip: { slot: 'legs', req: { defence: 1 }, att: { magic: -10, ranged: -4 }, def: { stab: 8, slash: 7, crush: 6, ranged: 7, magic: -4 }, look: { pants: '#b07a3a' } },
  },
  bronzeKiteshield: {
    name: 'Bronze kiteshield', value: 68, examine: 'A large bronze shield, pointed at the bottom.',
    equip: { slot: 'shield', req: { defence: 1 }, att: { magic: -8, ranged: -2 }, def: { stab: 6, slash: 8, crush: 7, ranged: 7, magic: -1 }, look: { shield: 'bronze' } },
  },
  bronzeScimitar: {
    name: 'Bronze scimitar', value: 32, examine: 'A curved bronze sword. Fast and slashing.',
    equip: { slot: 'weapon', req: { attack: 1 }, type: 'slash', speed: 4, att: { stab: 1, slash: 7, crush: -2 }, def: { slash: 1 }, str: 6, look: { weapon: 'bronze', blade: 7 } },
  },
  bronzeLongsword: {
    name: 'Bronze longsword', value: 40, examine: 'A long bronze blade. Slower, but hits harder.',
    equip: { slot: 'weapon', req: { attack: 1 }, type: 'slash', speed: 5, att: { stab: 4, slash: 8, crush: -2 }, def: { stab: 1, slash: 3 }, str: 8, look: { weapon: 'bronze', blade: 9 } },
  },
  bronzeMace: {
    name: 'Bronze mace', value: 18, examine: 'A flanged bronze mace. Good against armour.',
    equip: { slot: 'weapon', req: { attack: 1 }, type: 'crush', speed: 4, att: { stab: 2, slash: -2, crush: 6 }, def: { crush: 1 }, str: 5, look: { weapon: 'bronze', blade: 5 } },
  },
  bronzeBattleaxe: {
    name: 'Bronze battleaxe', value: 52, examine: 'A heavy double-headed bronze axe.',
    equip: { slot: 'weapon', req: { attack: 1 }, type: 'slash', speed: 6, att: { stab: -2, slash: 8, crush: 6 }, def: { slash: 1 }, str: 10, look: { weapon: 'bronze', blade: 6 } },
  },
  ironFullHelm: {
    name: 'Iron full helm', value: 154, examine: 'A full-face iron helmet.',
    equip: { slot: 'head', req: { defence: 5 }, att: { magic: -3, ranged: -1 }, def: { stab: 6, slash: 7, crush: 5, ranged: 6, magic: -1 }, look: { hat: 'helmet', hatColor: '#8a9098' } },
  },
  ironPlatebody: {
    name: 'Iron platebody', value: 560, examine: 'Solid iron plates. Heavy, but very tough.',
    equip: { slot: 'body', req: { defence: 5 }, att: { magic: -15, ranged: -7 }, def: { stab: 21, slash: 20, crush: 12, ranged: 20, magic: -6 }, look: { tunic: '#8a9098' } },
  },
  ironPlatelegs: {
    name: 'Iron platelegs', value: 280, examine: 'Leg armour of iron plates.',
    equip: { slot: 'legs', req: { defence: 5 }, att: { magic: -10, ranged: -4 }, def: { stab: 11, slash: 10, crush: 9, ranged: 10, magic: -4 }, look: { pants: '#8a9098' } },
  },
  ironKiteshield: {
    name: 'Iron kiteshield', value: 238, examine: 'A large iron shield, pointed at the bottom.',
    equip: { slot: 'shield', req: { defence: 5 }, att: { magic: -8, ranged: -2 }, def: { stab: 9, slash: 11, crush: 10, ranged: 10, magic: -1 }, look: { shield: 'iron' } },
  },
  ironScimitar: {
    name: 'Iron scimitar', value: 112, examine: 'A curved iron sword. Fast and slashing.',
    equip: { slot: 'weapon', req: { attack: 5 }, type: 'slash', speed: 4, att: { stab: 2, slash: 10, crush: -2 }, def: { slash: 1 }, str: 9, look: { weapon: 'iron', blade: 7 } },
  },
  ironLongsword: {
    name: 'Iron longsword', value: 140, examine: 'A long iron blade. Slower, but hits harder.',
    equip: { slot: 'weapon', req: { attack: 5 }, type: 'slash', speed: 5, att: { stab: 6, slash: 11, crush: -2 }, def: { stab: 1, slash: 3 }, str: 11, look: { weapon: 'iron', blade: 9 } },
  },
  ironMace: {
    name: 'Iron mace', value: 63, examine: 'A flanged iron mace. Good against armour.',
    equip: { slot: 'weapon', req: { attack: 5 }, type: 'crush', speed: 4, att: { stab: 3, slash: -2, crush: 9 }, def: { crush: 1 }, str: 7, look: { weapon: 'iron', blade: 5 } },
  },
  ironBattleaxe: {
    name: 'Iron battleaxe', value: 182, examine: 'A heavy double-headed iron axe.',
    equip: { slot: 'weapon', req: { attack: 5 }, type: 'slash', speed: 6, att: { stab: -2, slash: 11, crush: 8 }, def: { slash: 1 }, str: 14, look: { weapon: 'iron', blade: 6 } },
  },
  steelDagger: {
    name: 'Steel dagger', value: 125, examine: 'A sturdy steel dagger.',
    equip: { slot: 'weapon', req: { attack: 10 }, type: 'stab', speed: 4, att: { stab: 9, slash: 4, crush: -4, magic: 1 }, def: { magic: 1 }, str: 7, look: { weapon: 'steel', blade: 4 } },
  },
  steelAxe: {
    name: 'Steel axe', value: 200, tool: { woodcutting: 10 }, examine: 'A steel axe. Chops faster still. Needs Woodcutting 10.',
    equip: { slot: 'weapon', req: { attack: 1 }, type: 'slash', speed: 5, att: { stab: -2, slash: 9, crush: 4 }, str: 7, look: { weapon: 'steel', blade: 5 } },
  },
  steelPickaxe: {
    name: 'Steel pickaxe', value: 200, tool: { mining: 10 }, examine: 'A steel pickaxe. Mines faster still. Needs Mining 10.',
    equip: { slot: 'weapon', req: { attack: 1 }, type: 'stab', speed: 5, att: { stab: 9, slash: -2, crush: 4 }, str: 7, look: { weapon: 'steel', blade: 5 } },
  },
  steelMace: {
    name: 'Steel mace', value: 225, examine: 'A flanged steel mace. Good against armour.',
    equip: { slot: 'weapon', req: { attack: 10 }, type: 'crush', speed: 4, att: { stab: 4, slash: -2, crush: 13 }, def: { crush: 1 }, str: 10, look: { weapon: 'steel', blade: 5 } },
  },
  steelMedHelm: {
    name: 'Steel med helm', value: 300, examine: 'A medium-sized steel helmet.',
    equip: { slot: 'head', req: { defence: 10 }, att: { magic: -1 }, def: { stab: 6, slash: 7, crush: 4, magic: -1, ranged: 6 }, look: { hat: 'helmet', hatColor: '#aab2ba' } },
  },
  steelSword: {
    name: 'Steel sword', value: 325, examine: 'A well-made steel sword.',
    equip: { slot: 'weapon', req: { attack: 10 }, type: 'slash', speed: 4, att: { stab: 9, slash: 12, crush: -2 }, def: { slash: 3, stab: 1 }, str: 10, look: { weapon: 'steel', blade: 7 } },
  },
  steelScimitar: {
    name: 'Steel scimitar', value: 400, examine: 'A curved steel sword. Fast and slashing.',
    equip: { slot: 'weapon', req: { attack: 10 }, type: 'slash', speed: 4, att: { stab: 3, slash: 15, crush: -2 }, def: { slash: 1 }, str: 13, look: { weapon: 'steel', blade: 7 } },
  },
  steelLongsword: {
    name: 'Steel longsword', value: 500, examine: 'A long steel blade. Slower, but hits harder.',
    equip: { slot: 'weapon', req: { attack: 10 }, type: 'slash', speed: 5, att: { stab: 9, slash: 16, crush: -2 }, def: { stab: 1, slash: 4 }, str: 16, look: { weapon: 'steel', blade: 9 } },
  },
  steelFullHelm: {
    name: 'Steel full helm', value: 550, examine: 'A full-face steel helmet.',
    equip: { slot: 'head', req: { defence: 10 }, att: { magic: -3, ranged: -1 }, def: { stab: 9, slash: 10, crush: 7, ranged: 9, magic: -1 }, look: { hat: 'helmet', hatColor: '#aab2ba' } },
  },
  steelSqShield: {
    name: 'Steel sq shield', value: 600, examine: 'A square steel shield.',
    equip: { slot: 'shield', req: { defence: 10 }, att: { magic: -1 }, def: { stab: 12, slash: 13, crush: 10, ranged: 12, magic: -1 }, look: { shield: 'steel' } },
  },
  steelBattleaxe: {
    name: 'Steel battleaxe', value: 650, examine: 'A heavy double-headed steel axe.',
    equip: { slot: 'weapon', req: { attack: 10 }, type: 'slash', speed: 6, att: { stab: -2, slash: 16, crush: 12 }, def: { slash: 1 }, str: 20, look: { weapon: 'steel', blade: 6 } },
  },
  steelChainbody: {
    name: 'Steel chainbody', value: 750, examine: 'A shirt of steel rings.',
    equip: { slot: 'body', req: { defence: 10 }, att: { magic: -4 }, def: { stab: 16, slash: 23, crush: 26, ranged: 19, magic: -1 }, look: { tunic: '#9aa2aa' } },
  },
  steelKiteshield: {
    name: 'Steel kiteshield', value: 850, examine: 'A large steel shield, pointed at the bottom.',
    equip: { slot: 'shield', req: { defence: 10 }, att: { magic: -8, ranged: -2 }, def: { stab: 13, slash: 16, crush: 15, ranged: 15, magic: -1 }, look: { shield: 'steel' } },
  },
  steelPlatelegs: {
    name: 'Steel platelegs', value: 1000, examine: 'Leg armour of steel plates.',
    equip: { slot: 'legs', req: { defence: 10 }, att: { magic: -10, ranged: -4 }, def: { stab: 16, slash: 15, crush: 13, ranged: 15, magic: -4 }, look: { pants: '#9aa2aa' } },
  },
  steelPlatebody: {
    name: 'Steel platebody', value: 2000, examine: 'Solid steel plates. Heavy, but very tough.',
    equip: { slot: 'body', req: { defence: 10 }, att: { magic: -15, ranged: -7 }, def: { stab: 30, slash: 29, crush: 17, ranged: 29, magic: -6 }, look: { tunic: '#9aa2aa' } },
  },
  mithrilDagger: {
    name: 'Mithril dagger', value: 325, examine: 'A sturdy mithril dagger.',
    equip: { slot: 'weapon', req: { attack: 20 }, type: 'stab', speed: 4, att: { stab: 12, slash: 5, crush: -4, magic: 1 }, def: { magic: 1 }, str: 9, look: { weapon: 'mithril', blade: 4 } },
  },
  mithrilAxe: {
    name: 'Mithril axe', value: 520, tool: { woodcutting: 20 }, examine: 'A light mithril axe. Chops fast. Needs Woodcutting 20.',
    equip: { slot: 'weapon', req: { attack: 1 }, type: 'slash', speed: 5, att: { stab: -2, slash: 12, crush: 5 }, str: 9, look: { weapon: 'mithril', blade: 5 } },
  },
  mithrilPickaxe: {
    name: 'Mithril pickaxe', value: 520, tool: { mining: 20 }, examine: 'A light mithril pickaxe. Mines fast. Needs Mining 20.',
    equip: { slot: 'weapon', req: { attack: 1 }, type: 'stab', speed: 5, att: { stab: 12, slash: -2, crush: 5 }, str: 9, look: { weapon: 'mithril', blade: 5 } },
  },
  mithrilMace: {
    name: 'Mithril mace', value: 585, examine: 'A flanged mithril mace. Good against armour.',
    equip: { slot: 'weapon', req: { attack: 20 }, type: 'crush', speed: 4, att: { stab: 5, slash: -2, crush: 18 }, def: { crush: 1 }, str: 14, look: { weapon: 'mithril', blade: 5 } },
  },
  mithrilMedHelm: {
    name: 'Mithril med helm', value: 780, examine: 'A medium-sized mithril helmet.',
    equip: { slot: 'head', req: { defence: 20 }, att: { magic: -1 }, def: { stab: 8, slash: 9, crush: 5, magic: -1, ranged: 8 }, look: { hat: 'helmet', hatColor: '#4a5a9a' } },
  },
  mithrilSword: {
    name: 'Mithril sword', value: 845, examine: 'A well-made mithril sword.',
    equip: { slot: 'weapon', req: { attack: 20 }, type: 'slash', speed: 4, att: { stab: 12, slash: 16, crush: -2 }, def: { slash: 4, stab: 1 }, str: 14, look: { weapon: 'mithril', blade: 7 } },
  },
  mithrilScimitar: {
    name: 'Mithril scimitar', value: 1040, examine: 'A curved mithril sword. Fast and slashing.',
    equip: { slot: 'weapon', req: { attack: 20 }, type: 'slash', speed: 4, att: { stab: 4, slash: 20, crush: -2 }, def: { slash: 1 }, str: 18, look: { weapon: 'mithril', blade: 7 } },
  },
  mithrilLongsword: {
    name: 'Mithril longsword', value: 1300, examine: 'A long mithril blade. Slower, but hits harder.',
    equip: { slot: 'weapon', req: { attack: 20 }, type: 'slash', speed: 5, att: { stab: 12, slash: 22, crush: -2 }, def: { stab: 1, slash: 5 }, str: 22, look: { weapon: 'mithril', blade: 9 } },
  },
  mithrilFullHelm: {
    name: 'Mithril full helm', value: 1430, examine: 'A full-face mithril helmet.',
    equip: { slot: 'head', req: { defence: 20 }, att: { magic: -3, ranged: -1 }, def: { stab: 12, slash: 14, crush: 9, ranged: 12, magic: -1 }, look: { hat: 'helmet', hatColor: '#4a5a9a' } },
  },
  mithrilSqShield: {
    name: 'Mithril sq shield', value: 1560, examine: 'A square mithril shield.',
    equip: { slot: 'shield', req: { defence: 20 }, att: { magic: -1 }, def: { stab: 16, slash: 18, crush: 14, ranged: 16, magic: -1 }, look: { shield: 'mithril' } },
  },
  mithrilBattleaxe: {
    name: 'Mithril battleaxe', value: 1690, examine: 'A heavy double-headed mithril axe.',
    equip: { slot: 'weapon', req: { attack: 20 }, type: 'slash', speed: 6, att: { stab: -2, slash: 22, crush: 16 }, def: { slash: 1 }, str: 27, look: { weapon: 'mithril', blade: 6 } },
  },
  mithrilChainbody: {
    name: 'Mithril chainbody', value: 1950, examine: 'A shirt of mithril rings.',
    equip: { slot: 'body', req: { defence: 20 }, att: { magic: -4 }, def: { stab: 22, slash: 31, crush: 35, ranged: 26, magic: -1 }, look: { tunic: '#4a5a9a' } },
  },
  mithrilKiteshield: {
    name: 'Mithril kiteshield', value: 2210, examine: 'A large mithril shield, pointed at the bottom.',
    equip: { slot: 'shield', req: { defence: 20 }, att: { magic: -8, ranged: -2 }, def: { stab: 18, slash: 22, crush: 20, ranged: 20, magic: -1 }, look: { shield: 'mithril' } },
  },
  mithrilPlatelegs: {
    name: 'Mithril platelegs', value: 2600, examine: 'Leg armour of mithril plates.',
    equip: { slot: 'legs', req: { defence: 20 }, att: { magic: -10, ranged: -4 }, def: { stab: 22, slash: 20, crush: 18, ranged: 20, magic: -4 }, look: { pants: '#4a5a9a' } },
  },
  mithrilPlatebody: {
    name: 'Mithril platebody', value: 5200, examine: 'Solid mithril plates. Heavy, but very tough.',
    equip: { slot: 'body', req: { defence: 20 }, att: { magic: -15, ranged: -7 }, def: { stab: 41, slash: 39, crush: 23, ranged: 39, magic: -6 }, look: { tunic: '#4a5a9a' } },
  },
  bronzeBoots: {
    name: 'Bronze boots', value: 17, examine: 'Sturdy bronze boots.',
    equip: { slot: 'feet', req: { defence: 1 }, att: { magic: -2 }, def: { stab: 2, slash: 2, crush: 2, ranged: 1, magic: -1 } },
  },
  bronzeGauntlets: {
    name: 'Bronze gauntlets', value: 14, examine: 'Armoured bronze gloves.',
    equip: { slot: 'hands', req: { defence: 1 }, att: { stab: 1, slash: 1, crush: 1, magic: -2 }, def: { stab: 1, slash: 1, crush: 1, ranged: 1 } },
  },
  bronzeSpear: {
    name: 'Bronze spear', value: 23, examine: 'A long bronze-headed spear. Good at stabbing, slashing and smashing alike.',
    equip: { slot: 'weapon', req: { attack: 1 }, type: 'stab', speed: 5, att: { stab: 6, slash: 6, crush: 6 }, def: { stab: 1, slash: 1, crush: 1 }, str: 6, look: { weapon: 'bronze', blade: 8 } },
  },
  bronzeWarhammer: {
    name: 'Bronze warhammer', value: 57, examine: 'A heavy bronze warhammer. Slow, but it hits like a falling rock.',
    equip: { slot: 'weapon', req: { attack: 1 }, type: 'crush', speed: 6, att: { stab: -4, slash: -4, crush: 8 }, str: 10, look: { weapon: 'bronze', blade: 5 } },
  },
  bronze2hSword: {
    name: 'Bronze 2h sword', value: 69, examine: 'A huge bronze sword, wielded with both hands.',
    equip: { slot: 'weapon', req: { attack: 1 }, twoHanded: true, type: 'slash', speed: 7, att: { stab: -4, slash: 10, crush: 8 }, str: 12, look: { weapon: 'bronze', blade: 10 } },
  },
  bronzeDart: {
    name: 'Bronze dart', stackable: true, value: 1, examine: 'A small bronze dart. Throw it from your weapon slot.',
    equip: { slot: 'weapon', req: { ranged: 1 }, style: 'ranged', thrown: true, range: 4, type: 'ranged', speed: 3, att: { ranged: 4 }, rangedStr: 4, look: {} },
  },
  bronzeThrowingKnife: {
    name: 'Bronze throwing knife', stackable: true, value: 2, examine: 'A balanced bronze knife, made for throwing.',
    equip: { slot: 'weapon', req: { ranged: 1 }, style: 'ranged', thrown: true, range: 4, type: 'ranged', speed: 3, att: { ranged: 5 }, rangedStr: 5, look: {} },
  },
  bronzeJavelin: {
    name: 'Bronze javelin', stackable: true, value: 3, examine: 'A bronze-tipped javelin. Slow to throw, but it hits hard.',
    equip: { slot: 'weapon', req: { ranged: 1 }, style: 'ranged', thrown: true, range: 6, type: 'ranged', speed: 5, att: { ranged: 6 }, rangedStr: 9, look: {} },
  },
  bronzeDartTip: { name: 'Bronze dart tip', stackable: true, value: 1, examine: 'Fletch it with a feather to make a dart.' },
  bronzeJavelinHeads: { name: 'Bronze javelin heads', stackable: true, value: 1, examine: 'Fletch them onto arrow shafts to make javelins.' },
  ironBoots: {
    name: 'Iron boots', value: 60, examine: 'Sturdy iron boots.',
    equip: { slot: 'feet', req: { defence: 5 }, att: { magic: -2 }, def: { stab: 3, slash: 3, crush: 3, ranged: 2, magic: -1 } },
  },
  ironGauntlets: {
    name: 'Iron gauntlets', value: 50, examine: 'Armoured iron gloves.',
    equip: { slot: 'hands', req: { defence: 5 }, att: { stab: 1, slash: 1, crush: 1, magic: -2 }, def: { stab: 2, slash: 2, crush: 2, ranged: 2 } },
  },
  ironSpear: {
    name: 'Iron spear', value: 80, examine: 'A long iron-headed spear. Good at stabbing, slashing and smashing alike.',
    equip: { slot: 'weapon', req: { attack: 5 }, type: 'stab', speed: 5, att: { stab: 9, slash: 9, crush: 9 }, def: { stab: 1, slash: 1, crush: 1 }, str: 9, look: { weapon: 'iron', blade: 8 } },
  },
  ironWarhammer: {
    name: 'Iron warhammer', value: 200, examine: 'A heavy iron warhammer. Slow, but it hits like a falling rock.',
    equip: { slot: 'weapon', req: { attack: 5 }, type: 'crush', speed: 6, att: { stab: -4, slash: -4, crush: 13 }, str: 16, look: { weapon: 'iron', blade: 5 } },
  },
  iron2hSword: {
    name: 'Iron 2h sword', value: 240, examine: 'A huge iron sword, wielded with both hands.',
    equip: { slot: 'weapon', req: { attack: 5 }, twoHanded: true, type: 'slash', speed: 7, att: { stab: -4, slash: 16, crush: 12 }, str: 18, look: { weapon: 'iron', blade: 10 } },
  },
  ironDart: {
    name: 'Iron dart', stackable: true, value: 4, examine: 'A small iron dart. Throw it from your weapon slot.',
    equip: { slot: 'weapon', req: { ranged: 5 }, style: 'ranged', thrown: true, range: 4, type: 'ranged', speed: 3, att: { ranged: 6 }, rangedStr: 6, look: {} },
  },
  ironThrowingKnife: {
    name: 'Iron throwing knife', stackable: true, value: 6, examine: 'A balanced iron knife, made for throwing.',
    equip: { slot: 'weapon', req: { ranged: 5 }, style: 'ranged', thrown: true, range: 4, type: 'ranged', speed: 3, att: { ranged: 8 }, rangedStr: 8, look: {} },
  },
  ironJavelin: {
    name: 'Iron javelin', stackable: true, value: 9, examine: 'A iron-tipped javelin. Slow to throw, but it hits hard.',
    equip: { slot: 'weapon', req: { ranged: 5 }, style: 'ranged', thrown: true, range: 6, type: 'ranged', speed: 5, att: { ranged: 10 }, rangedStr: 14, look: {} },
  },
  ironDartTip: { name: 'Iron dart tip', stackable: true, value: 2, examine: 'Fletch it with a feather to make a dart.' },
  ironJavelinHeads: { name: 'Iron javelin heads', stackable: true, value: 4, examine: 'Fletch them onto arrow shafts to make javelins.' },
  steelBoots: {
    name: 'Steel boots', value: 210, examine: 'Sturdy steel boots.',
    equip: { slot: 'feet', req: { defence: 10 }, att: { magic: -2 }, def: { stab: 4, slash: 4, crush: 4, ranged: 3, magic: -1 } },
  },
  steelGauntlets: {
    name: 'Steel gauntlets', value: 175, examine: 'Armoured steel gloves.',
    equip: { slot: 'hands', req: { defence: 10 }, att: { stab: 1, slash: 1, crush: 1, magic: -2 }, def: { stab: 3, slash: 3, crush: 3, ranged: 3 } },
  },
  steelSpear: {
    name: 'Steel spear', value: 280, examine: 'A long steel-headed spear. Good at stabbing, slashing and smashing alike.',
    equip: { slot: 'weapon', req: { attack: 10 }, type: 'stab', speed: 5, att: { stab: 13, slash: 13, crush: 13 }, def: { stab: 1, slash: 1, crush: 1 }, str: 13, look: { weapon: 'steel', blade: 8 } },
  },
  steelWarhammer: {
    name: 'Steel warhammer', value: 700, examine: 'A heavy steel warhammer. Slow, but it hits like a falling rock.',
    equip: { slot: 'weapon', req: { attack: 10 }, type: 'crush', speed: 6, att: { stab: -4, slash: -4, crush: 19 }, str: 23, look: { weapon: 'steel', blade: 5 } },
  },
  steel2hSword: {
    name: 'Steel 2h sword', value: 840, examine: 'A huge steel sword, wielded with both hands.',
    equip: { slot: 'weapon', req: { attack: 10 }, twoHanded: true, type: 'slash', speed: 7, att: { stab: -4, slash: 23, crush: 17 }, str: 26, look: { weapon: 'steel', blade: 10 } },
  },
  steelDart: {
    name: 'Steel dart', stackable: true, value: 14, examine: 'A small steel dart. Throw it from your weapon slot.',
    equip: { slot: 'weapon', req: { ranged: 10 }, style: 'ranged', thrown: true, range: 4, type: 'ranged', speed: 3, att: { ranged: 9 }, rangedStr: 9, look: {} },
  },
  steelThrowingKnife: {
    name: 'Steel throwing knife', stackable: true, value: 21, examine: 'A balanced steel knife, made for throwing.',
    equip: { slot: 'weapon', req: { ranged: 10 }, style: 'ranged', thrown: true, range: 4, type: 'ranged', speed: 3, att: { ranged: 12 }, rangedStr: 12, look: {} },
  },
  steelJavelin: {
    name: 'Steel javelin', stackable: true, value: 32, examine: 'A steel-tipped javelin. Slow to throw, but it hits hard.',
    equip: { slot: 'weapon', req: { ranged: 10 }, style: 'ranged', thrown: true, range: 6, type: 'ranged', speed: 5, att: { ranged: 14 }, rangedStr: 20, look: {} },
  },
  steelDartTip: { name: 'Steel dart tip', stackable: true, value: 7, examine: 'Fletch it with a feather to make a dart.' },
  steelJavelinHeads: { name: 'Steel javelin heads', stackable: true, value: 14, examine: 'Fletch them onto arrow shafts to make javelins.' },
  mithrilBoots: {
    name: 'Mithril boots', value: 546, examine: 'Sturdy mithril boots.',
    equip: { slot: 'feet', req: { defence: 20 }, att: { magic: -2 }, def: { stab: 6, slash: 6, crush: 6, ranged: 4, magic: -1 } },
  },
  mithrilGauntlets: {
    name: 'Mithril gauntlets', value: 455, examine: 'Armoured mithril gloves.',
    equip: { slot: 'hands', req: { defence: 20 }, att: { stab: 2, slash: 2, crush: 2, magic: -2 }, def: { stab: 4, slash: 4, crush: 4, ranged: 4 } },
  },
  mithrilSpear: {
    name: 'Mithril spear', value: 728, examine: 'A long mithril-headed spear. Good at stabbing, slashing and smashing alike.',
    equip: { slot: 'weapon', req: { attack: 20 }, type: 'stab', speed: 5, att: { stab: 18, slash: 18, crush: 18 }, def: { stab: 2, slash: 2, crush: 2 }, str: 18, look: { weapon: 'mithril', blade: 8 } },
  },
  mithrilWarhammer: {
    name: 'Mithril warhammer', value: 1820, examine: 'A heavy mithril warhammer. Slow, but it hits like a falling rock.',
    equip: { slot: 'weapon', req: { attack: 20 }, type: 'crush', speed: 6, att: { stab: -4, slash: -4, crush: 25 }, str: 31, look: { weapon: 'mithril', blade: 5 } },
  },
  mithril2hSword: {
    name: 'Mithril 2h sword', value: 2184, examine: 'A huge mithril sword, wielded with both hands.',
    equip: { slot: 'weapon', req: { attack: 20 }, twoHanded: true, type: 'slash', speed: 7, att: { stab: -4, slash: 31, crush: 24 }, str: 35, look: { weapon: 'mithril', blade: 10 } },
  },
  mithrilDart: {
    name: 'Mithril dart', stackable: true, value: 36, examine: 'A small mithril dart. Throw it from your weapon slot.',
    equip: { slot: 'weapon', req: { ranged: 20 }, style: 'ranged', thrown: true, range: 4, type: 'ranged', speed: 3, att: { ranged: 12 }, rangedStr: 12, look: {} },
  },
  mithrilThrowingKnife: {
    name: 'Mithril throwing knife', stackable: true, value: 55, examine: 'A balanced mithril knife, made for throwing.',
    equip: { slot: 'weapon', req: { ranged: 20 }, style: 'ranged', thrown: true, range: 4, type: 'ranged', speed: 3, att: { ranged: 16 }, rangedStr: 16, look: {} },
  },
  mithrilJavelin: {
    name: 'Mithril javelin', stackable: true, value: 82, examine: 'A mithril-tipped javelin. Slow to throw, but it hits hard.',
    equip: { slot: 'weapon', req: { ranged: 20 }, style: 'ranged', thrown: true, range: 6, type: 'ranged', speed: 5, att: { ranged: 20 }, rangedStr: 27, look: {} },
  },
  mithrilDartTip: { name: 'Mithril dart tip', stackable: true, value: 18, examine: 'Fletch it with a feather to make a dart.' },
  mithrilJavelinHeads: { name: 'Mithril javelin heads', stackable: true, value: 36, examine: 'Fletch them onto arrow shafts to make javelins.' },
  steelStuds: { name: 'Steel studs', stackable: true, value: 12, examine: 'Tap them with a leather body or chaps in your bag to stud the leather.' },
  studdedBody: {
    name: 'Studded body', value: 850, examine: 'Leather armour reinforced with steel studs. Needs Ranged 15 and Defence 15.',
    equip: { slot: 'body', req: { ranged: 15, defence: 15 }, att: { ranged: 8, magic: -4 }, def: { stab: 18, slash: 25, crush: 22, ranged: 26, magic: 8 }, look: { tunic: '#6a4a2e' } },
  },
  studdedChaps: {
    name: 'Studded chaps', value: 750, examine: 'Leather chaps reinforced with steel studs. Needs Ranged 15 and Defence 15.',
    equip: { slot: 'legs', req: { ranged: 15, defence: 15 }, att: { ranged: 8, magic: -5 }, def: { stab: 7, slash: 7, crush: 7, ranged: 10, magic: 3 }, look: { pants: '#6a4a2e' } },
  },
  silverRing: {
    name: 'Silver ring', value: 130, examine: 'A silver ring. Plain, but it helps a little.',
    equip: { slot: 'ring', req: {}, def: { stab: 1, slash: 1, crush: 1 } },
  },
  silverAmulet: {
    name: 'Silver amulet', value: 130, examine: 'A silver amulet. Plain, but it helps a little.',
    equip: { slot: 'neck', req: {}, def: { stab: 2, slash: 2, crush: 2 } },
  },
  silverSapphireRing: {
    name: 'Silver sapphire ring', value: 227, examine: 'A silver sapphire ring. The sapphire sharpens your magic.',
    equip: { slot: 'ring', req: {}, att: { magic: 2 }, def: { magic: 1 } },
  },
  silverSapphireAmulet: {
    name: 'Silver sapphire amulet', value: 227, examine: 'A silver sapphire amulet. The sapphire sharpens your magic.',
    equip: { slot: 'neck', req: {}, att: { magic: 4 }, def: { magic: 2 } },
  },
  silverEmeraldRing: {
    name: 'Silver emerald ring', value: 325, examine: 'A silver emerald ring. The emerald steadies your aim.',
    equip: { slot: 'ring', req: {}, att: { ranged: 2 }, def: { ranged: 1 } },
  },
  silverEmeraldAmulet: {
    name: 'Silver emerald amulet', value: 325, examine: 'A silver emerald amulet. The emerald steadies your aim.',
    equip: { slot: 'neck', req: {}, att: { ranged: 4 }, def: { ranged: 2 } },
  },
  silverRubyRing: {
    name: 'Silver ruby ring', value: 617, examine: 'A silver ruby ring. The ruby lends you strength.',
    equip: { slot: 'ring', req: {}, str: 1 },
  },
  silverRubyAmulet: {
    name: 'Silver ruby amulet', value: 617, examine: 'A silver ruby amulet. The ruby lends you strength.',
    equip: { slot: 'neck', req: {}, str: 2 },
  },
  silverDiamondRing: {
    name: 'Silver diamond ring', value: 1690, examine: 'A silver diamond ring. The diamond makes you better at everything.',
    equip: { slot: 'ring', req: {}, att: { stab: 1, slash: 1, crush: 1, ranged: 1, magic: 1 }, def: { stab: 1, slash: 1, crush: 1, ranged: 1, magic: 1 }, str: 1 },
  },
  silverDiamondAmulet: {
    name: 'Silver diamond amulet', value: 1690, examine: 'A silver diamond amulet. The diamond makes you better at everything.',
    equip: { slot: 'neck', req: {}, att: { stab: 2, slash: 2, crush: 2, ranged: 2, magic: 2 }, def: { stab: 2, slash: 2, crush: 2, ranged: 2, magic: 2 }, str: 1 },
  },
  goldRing: {
    name: 'Gold ring', value: 390, examine: 'A gold ring. Plain, but it helps a little.',
    equip: { slot: 'ring', req: {}, def: { stab: 2, slash: 2, crush: 2 } },
  },
  goldAmulet: {
    name: 'Gold amulet', value: 390, examine: 'A gold amulet. Plain, but it helps a little.',
    equip: { slot: 'neck', req: {}, def: { stab: 4, slash: 4, crush: 4 } },
  },
  goldSapphireRing: {
    name: 'Gold sapphire ring', value: 487, examine: 'A gold sapphire ring. The sapphire sharpens your magic.',
    equip: { slot: 'ring', req: {}, att: { magic: 4 }, def: { magic: 2 } },
  },
  goldSapphireAmulet: {
    name: 'Gold sapphire amulet', value: 487, examine: 'A gold sapphire amulet. The sapphire sharpens your magic.',
    equip: { slot: 'neck', req: {}, att: { magic: 8 }, def: { magic: 4 } },
  },
  goldEmeraldRing: {
    name: 'Gold emerald ring', value: 585, examine: 'A gold emerald ring. The emerald steadies your aim.',
    equip: { slot: 'ring', req: {}, att: { ranged: 4 }, def: { ranged: 2 } },
  },
  goldEmeraldAmulet: {
    name: 'Gold emerald amulet', value: 585, examine: 'A gold emerald amulet. The emerald steadies your aim.',
    equip: { slot: 'neck', req: {}, att: { ranged: 8 }, def: { ranged: 4 } },
  },
  goldRubyRing: {
    name: 'Gold ruby ring', value: 877, examine: 'A gold ruby ring. The ruby lends you strength.',
    equip: { slot: 'ring', req: {}, str: 2 },
  },
  goldRubyAmulet: {
    name: 'Gold ruby amulet', value: 877, examine: 'A gold ruby amulet. The ruby lends you strength.',
    equip: { slot: 'neck', req: {}, str: 4 },
  },
  goldDiamondRing: {
    name: 'Gold diamond ring', value: 1950, examine: 'A gold diamond ring. The diamond makes you better at everything.',
    equip: { slot: 'ring', req: {}, att: { stab: 2, slash: 2, crush: 2, ranged: 2, magic: 2 }, def: { stab: 2, slash: 2, crush: 2, ranged: 2, magic: 2 }, str: 1 },
  },
  goldDiamondAmulet: {
    name: 'Gold diamond amulet', value: 1950, examine: 'A gold diamond amulet. The diamond makes you better at everything.',
    equip: { slot: 'neck', req: {}, att: { stab: 4, slash: 4, crush: 4, ranged: 4, magic: 4 }, def: { stab: 4, slash: 4, crush: 4, ranged: 4, magic: 4 }, str: 2 },
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

// ---- Stacks ------------------------------------------------------------------
// How many fit in one bag slot:
// - skilling materials, food, hides and leather: 20
// - arrows, runes and other small things that already stack: 999
// - coins: no limit
// - weapons, armour, tools and potions: 1 (they don't stack)
// The bank stacks everything without limit.
const STACK_20 = /^(logs|oakLogs|copperOre|tinOre|ironOre|coal|silverOre|goldOre|mithrilOre|bronzeBar|ironBar|steelBar|mithrilBar|silverBar|goldBar|uncut[A-Z]\w*|sapphire|emerald|ruby|diamond|runeEssence|cowhide|wolfPelt|leather|hardLeather|raw[A-Z]\w*|burnt[A-Z]\w*)$/;
for (const [id, it] of Object.entries(ITEMS)) {
  if (STACK_20.test(id) || it.food) { it.stackable = true; it.stack = 20; }
  else if (it.stackable) it.stack = id === 'coins' ? Infinity : 999;
}

export const maxStack = (id) => (ITEMS[id]?.stackable ? ITEMS[id].stack ?? 999 : 1);

export const itemName = (id) => ITEMS[id]?.name ?? id;
