// Cooking on a fire or cooking pit. Food can burn: at the level you can first
// cook it, half of it burns; that drops evenly until `stopBurn`, when it never
// burns again. Burnt food is ruined and gives no XP.

const cook = (raw, cooked, burnt, name, level, xp, stopBurn) => ({
  id: cooked, name, level, xp, uses: { [raw]: 1 }, gives: { [cooked]: 1 }, ticks: 4, skill: 'cooking', station: 'fire',
  success: (lvl) => Math.min(1, 0.5 + (0.5 * (lvl - level)) / (stopBurn - level)),
  failGives: { [burnt]: 1 }, fail: `You accidentally burn the ${name.toLowerCase()}.`, raw,
});

export const COOKING = [
  cook('rawShrimps', 'shrimps', 'burntFish', 'Shrimps', 1, 30, 34),
  cook('rawChicken', 'cookedChicken', 'burntChicken', 'Chicken', 1, 30, 34),
  cook('rawBeef', 'cookedMeat', 'burntMeat', 'Beef', 1, 30, 34),
  cook('rawAnchovies', 'anchovies', 'burntFish', 'Anchovies', 1, 30, 34),
  cook('rawSardine', 'sardine', 'burntFish', 'Sardine', 1, 40, 38),
  cook('rawHerring', 'herring', 'burntFish', 'Herring', 5, 50, 41),
  cook('rawTrout', 'cookedTrout', 'burntFish', 'Trout', 15, 70, 50),
  cook('rawSalmon', 'salmon', 'burntFish', 'Salmon', 25, 90, 58),
  // v0.50.0 (skill review batch 1)
  { ...cook('rawBeef', 'meatPie', 'burntPie', 'Meat pie', 20, 110, 54), uses: { rawBeef: 1, bread: 1 } },
  { ...cook('rawBeef', 'huntersStew', 'burntStew', "Hunter's stew", 35, 117, 68), id: 'huntersStew', uses: { rawBeef: 1, rawChicken: 1 } },
  cook('rawLobster', 'lobster', 'burntFish', 'Lobster', 40, 120, 74),
  cook('rawSwordfish', 'swordfish', 'burntFish', 'Swordfish', 45, 140, 86),
  cook('rawMonkfish', 'monkfish', 'burntFish', 'Monkfish', 62, 150, 92),
  cook('rawShark', 'shark', 'burntFish', 'Shark', 80, 210, 99),
  cook('rawCaveEel', 'caveEel', 'burntFish', 'Cave eel', 88, 230, 99),
];
