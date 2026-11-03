// Smelting (at a furnace) and smithing (at an anvil, with a hammer).
// Same recipe shape as fletching.js, plus:
//   skill:   which skill gets the XP
//   station: 'furnace' or 'anvil' — opened by tapping one
//   bar:     which bar this anvil recipe is made from (groups the anvil menu)
//   success: (level) => chance the make works; on a failure the materials are used up

export const SMELTING = [
  { id: 'bronzeBar', name: 'Bronze bar', level: 1, xp: 6.2, uses: { copperOre: 1, tinOre: 1 }, gives: { bronzeBar: 1 }, ticks: 4, skill: 'smithing', station: 'furnace' },
  { id: 'ironBar', name: 'Iron bar', level: 15, xp: 12.5, uses: { ironOre: 1 }, gives: { ironBar: 1 }, ticks: 4, skill: 'smithing', station: 'furnace',
    success: (lvl) => Math.min(0.8, 0.5 + (lvl - 15) * 0.01), fail: 'The iron is too impure, and crumbles away.' },
  // Coal burns the impurities out, so steel never fails.
  { id: 'steelBar', name: 'Steel bar', level: 30, xp: 17.5, uses: { ironOre: 1, coal: 1 }, gives: { steelBar: 1 }, ticks: 4, skill: 'smithing', station: 'furnace' },
  { id: 'silverBar', name: 'Silver bar', level: 20, xp: 13.7, uses: { silverOre: 1 }, gives: { silverBar: 1 }, ticks: 4, skill: 'smithing', station: 'furnace' },
  { id: 'goldBar', name: 'Gold bar', level: 40, xp: 22.5, uses: { goldOre: 1 }, gives: { goldBar: 1 }, ticks: 4, skill: 'smithing', station: 'furnace' },
];

const anvil = (bar, list) => list.map(([item, name, level, bars, xp, qty = 1]) => ({
  id: item, name, level, xp, uses: { [bar]: bars }, gives: { [item]: qty }, tool: 'hammer', ticks: 4, skill: 'smithing', station: 'anvil', bar,
}));

export const SMITHING = [
  ...anvil('bronzeBar', [
    ['bronzeDagger', 'Bronze dagger', 1, 1, 12.5],
    ['bronzeAxe', 'Bronze axe', 1, 1, 12.5],
    ['bronzePickaxe', 'Bronze pickaxe', 2, 1, 12.5],
    ['bronzeMedHelm', 'Bronze med helm', 3, 1, 12.5],
    ['bronzeSword', 'Bronze sword', 4, 1, 12.5],
    ['bronzeMace', 'Bronze mace', 2, 1, 12.5],
    ['bronzeArrowtips', 'Bronze arrowtips', 5, 1, 12.5, 15],
    ['bronzeScimitar', 'Bronze scimitar', 5, 2, 25],
    ['bronzeLongsword', 'Bronze longsword', 6, 2, 25],
    ['bronzeFullHelm', 'Bronze full helm', 7, 2, 25],
    ['bronzeSqShield', 'Bronze sq shield', 8, 2, 25],
    ['bronzeBattleaxe', 'Bronze battleaxe', 10, 3, 37.5],
    ['bronzeChainbody', 'Bronze chainbody', 11, 3, 37.5],
    ['bronzeKiteshield', 'Bronze kiteshield', 12, 3, 37.5],
    ['bronzePlatelegs', 'Bronze platelegs', 16, 3, 37.5],
    ['bronzePlatebody', 'Bronze platebody', 18, 5, 62.5],
  ]),
  ...anvil('ironBar', [
    ['ironDagger', 'Iron dagger', 15, 1, 25],
    ['ironAxe', 'Iron axe', 16, 1, 25],
    ['ironPickaxe', 'Iron pickaxe', 17, 1, 25],
    ['ironMedHelm', 'Iron med helm', 18, 1, 25],
    ['ironSword', 'Iron sword', 19, 1, 25],
    ['ironMace', 'Iron mace', 17, 1, 25],
    ['ironArrowtips', 'Iron arrowtips', 20, 1, 25, 15],
    ['ironScimitar', 'Iron scimitar', 20, 2, 50],
    ['ironLongsword', 'Iron longsword', 21, 2, 50],
    ['ironFullHelm', 'Iron full helm', 22, 2, 50],
    ['ironSqShield', 'Iron sq shield', 23, 2, 50],
    ['ironBattleaxe', 'Iron battleaxe', 25, 3, 75],
    ['ironChainbody', 'Iron chainbody', 26, 3, 75],
    ['ironKiteshield', 'Iron kiteshield', 27, 3, 75],
    ['ironPlatelegs', 'Iron platelegs', 31, 3, 75],
    ['ironPlatebody', 'Iron platebody', 33, 5, 125],
  ]),
  ...anvil('steelBar', [
    ['steelDagger', 'Steel dagger', 30, 1, 37.5],
    ['steelAxe', 'Steel axe', 31, 1, 37.5],
    ['steelMace', 'Steel mace', 32, 1, 37.5],
    ['steelPickaxe', 'Steel pickaxe', 32, 1, 37.5],
    ['steelMedHelm', 'Steel med helm', 33, 1, 37.5],
    ['steelSword', 'Steel sword', 34, 1, 37.5],
    ['steelArrowtips', 'Steel arrowtips', 35, 1, 37.5, 15],
    ['steelScimitar', 'Steel scimitar', 35, 2, 75],
    ['steelLongsword', 'Steel longsword', 36, 2, 75],
    ['steelFullHelm', 'Steel full helm', 37, 2, 75],
    ['steelSqShield', 'Steel sq shield', 38, 2, 75],
    ['steelBattleaxe', 'Steel battleaxe', 40, 3, 112.5],
    ['steelChainbody', 'Steel chainbody', 41, 3, 112.5],
    ['steelKiteshield', 'Steel kiteshield', 42, 3, 112.5],
    ['steelPlatelegs', 'Steel platelegs', 46, 3, 112.5],
    ['steelPlatebody', 'Steel platebody', 48, 5, 187.5],
  ]),
];
