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
  cook('rawAnchovies', 'anchovies', 'burntFish', 'Anchovies', 1, 30, 34),
  cook('rawSardine', 'sardine', 'burntFish', 'Sardine', 1, 40, 38),
  cook('rawHerring', 'herring', 'burntFish', 'Herring', 5, 50, 41),
  cook('rawTrout', 'cookedTrout', 'burntFish', 'Trout', 15, 70, 50),
  cook('rawSalmon', 'salmon', 'burntFish', 'Salmon', 25, 90, 58),
];
