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
// Eating arrives in Batch 8.

export const ITEMS = {
  coins: { name: 'Coins', stackable: true, value: 1, examine: 'Lovely money!' },
  bones: { name: 'Bones', value: 1, examine: 'Bones are for burying. (Prayer arrives in a later update.)' },
  bread: { name: 'Bread', value: 12, examine: 'Nice crusty bread. (Eating arrives in Batch 8.)' },
  airRune: { name: 'Air rune', stackable: true, value: 4, examine: 'One of the four basic elemental runes.' },
  bronzeArrow: {
    name: 'Bronze arrow', stackable: true, value: 1, examine: 'Arrows with bronze heads. (Bows arrive in Batch 7.)',
    equip: { slot: 'ammo', req: {}, rangedStr: 7 },
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

export const itemName = (id) => ITEMS[id]?.name ?? id;
