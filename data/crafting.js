// Crafting: tanning hides at a tanning rack, then sewing leather with a needle
// and thread. Same recipe shape as fletching.js. Each sewn item uses 1 thread.

const tan = (id, name, level, xp) => ({
  id, name, level, xp, uses: { cowhide: 1 }, gives: { [id]: 1 }, ticks: 2, skill: 'crafting', station: 'tan',
});
const sew = (id, name, level, xp, leather = 'leather') => ({
  id, name, level, xp, uses: { [leather]: 1, thread: 1 }, gives: { [id]: 1 }, tool: 'needle', ticks: 3, skill: 'crafting',
  group: leather === 'leather' ? 'leather' : 'hardLeather',
});

export const TANNING = [
  tan('leather', 'Leather', 1, 2),
  tan('hardLeather', 'Hard leather', 10, 4),
];

export const SEWING = [
  sew('leatherGloves', 'Leather gloves', 1, 13.8),
  sew('leatherBoots', 'Leather boots', 7, 16.25),
  sew('leatherCowl', 'Leather cowl', 9, 18.5),
  sew('leatherVambraces', 'Leather vambraces', 11, 22),
  sew('leatherBody', 'Leather body', 14, 25),
  sew('leatherChaps', 'Leather chaps', 18, 27),
  sew('hardLeatherBody', 'Hard leather body', 28, 35, 'hardLeather'),
];

// Tapping one of these items opens the sewing menu for that leather.
export const CRAFT_GROUP = { leather: 'leather', hardLeather: 'hardLeather', needle: null, thread: null };
