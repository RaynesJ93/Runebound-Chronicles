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
  tan('hardLeather', 'Hard leather', 6, 4),
];

export const SEWING = [
  sew('leatherGloves', 'Leather gloves', 1, 13.8),
  sew('leatherBoots', 'Leather boots', 4, 16.25),
  sew('leatherCowl', 'Leather cowl', 6, 18.5),
  sew('leatherVambraces', 'Leather vambraces', 8, 22),
  sew('leatherBody', 'Leather body', 10, 25),
  sew('leatherChaps', 'Leather chaps', 13, 27),
  sew('hardLeatherGloves', 'Hard leather gloves', 15, 28, 'hardLeather'),
  sew('hardLeatherBoots', 'Hard leather boots', 16, 29.5, 'hardLeather'),
  sew('hardLeatherCowl', 'Hard leather cowl', 18, 31, 'hardLeather'),
  sew('hardLeatherBody', 'Hard leather body', 20, 35, 'hardLeather'),
  sew('hardLeatherChaps', 'Hard leather chaps', 22, 36, 'hardLeather'),
];

// Tapping one of these items opens the sewing menu for that leather.
export const CRAFT_GROUP = { leather: 'leather', hardLeather: 'hardLeather', needle: null, thread: null };
