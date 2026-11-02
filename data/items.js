// Every item in the game.
//
// stackable: many of them share one inventory slot (coins, runes, arrows)
// value: base price in coins (shops arrive in Batch 8)
// rare: shows a light beam when it drops
// Equipment stats are added in Batch 6; eating in Batch 8.

export const ITEMS = {
  coins: { name: 'Coins', stackable: true, value: 1, examine: 'Lovely money!' },
  bones: { name: 'Bones', value: 1, examine: 'Bones are for burying. (Prayer arrives in a later update.)' },
  bread: { name: 'Bread', value: 12, examine: 'Nice crusty bread. (Eating arrives in Batch 8.)' },
  airRune: { name: 'Air rune', stackable: true, value: 4, examine: 'One of the four basic elemental runes.' },
  bronzeArrow: { name: 'Bronze arrow', stackable: true, value: 1, examine: 'Arrows with bronze heads. (Bows arrive in Batch 7.)' },
  bronzeDagger: { name: 'Bronze dagger', value: 10, examine: 'Short and sharp. (Equipment arrives in Batch 6.)' },
  bronzeSword: { name: 'Bronze sword', value: 26, examine: 'A razor-sharp sword. Well, sharp-ish.' },
  ironDagger: { name: 'Iron dagger', value: 35, examine: 'A sturdy iron dagger.' },
  bronzeMedHelm: { name: 'Bronze med helm', value: 24, examine: 'A medium-sized bronze helmet.' },
  goblinMail: { name: 'Goblin mail', value: 5, examine: 'Armour made to fit a goblin. It might fit you if you squeeze.' },
  warCharm: { name: 'Goblin war-charm', value: 250, rare: true, examine: 'A tooth-and-bead charm. Goblins swear it brings luck in battle.' },
};

export const itemName = (id) => ITEMS[id]?.name ?? id;
