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

// Gem cutting: tap an uncut gem (or the chisel). One gem per cut.
const cut = (gem, name, level, xp) => ({
  id: gem, name, level, xp, uses: { [`uncut${gem[0].toUpperCase()}${gem.slice(1)}`]: 1 }, gives: { [gem]: 1 }, tool: 'chisel', ticks: 2, skill: 'crafting',
  msg: `You cut the ${gem}.`,
});
export const CUTTING = [
  cut('sapphire', 'Sapphire', 20, 50),
  cut('emerald', 'Emerald', 27, 67.5),
  cut('ruby', 'Ruby', 34, 85),
  cut('diamond', 'Diamond', 43, 107.5),
];

// Jewellery: cast at a furnace with a ring or amulet mould. Silver or gold,
// plain or set with a cut gem. Silver is easier; gold gives twice the bonus.
const GEM_XP = { sapphire: 25, emerald: 35, ruby: 45, diamond: 60 };
const jewel = (metal, gem, kind, level, xp) => {
  const cap = (w) => w[0].toUpperCase() + w.slice(1);
  const id = `${metal}${gem ? cap(gem) : ''}${cap(kind)}`;
  return {
    id, name: `${cap(metal)} ${gem ? `${gem} ` : ''}${kind}`, level, xp: xp + (gem ? GEM_XP[gem] : 0),
    uses: { [`${metal}Bar`]: 1, ...(gem ? { [gem]: 1 } : {}) }, gives: { [id]: 1 },
    tool: `${kind}Mould`, ticks: 3, skill: 'crafting', station: 'furnace', metal: `${metal}Bar`,
    msg: `You make a ${metal} ${gem ? `${gem} ` : ''}${kind}.`,
  };
};
export const JEWELLERY = [
  jewel('silver', null, 'ring', 8, 15), jewel('silver', null, 'amulet', 12, 20),
  jewel('silver', 'sapphire', 'ring', 22, 15), jewel('silver', 'sapphire', 'amulet', 24, 20),
  jewel('silver', 'emerald', 'ring', 28, 15), jewel('silver', 'emerald', 'amulet', 30, 20),
  jewel('silver', 'ruby', 'ring', 35, 15), jewel('silver', 'ruby', 'amulet', 37, 20),
  jewel('silver', 'diamond', 'ring', 44, 15), jewel('silver', 'diamond', 'amulet', 46, 20),
  jewel('gold', null, 'ring', 20, 25), jewel('gold', null, 'amulet', 24, 30),
  jewel('gold', 'sapphire', 'ring', 26, 25), jewel('gold', 'sapphire', 'amulet', 29, 30),
  jewel('gold', 'emerald', 'ring', 32, 25), jewel('gold', 'emerald', 'amulet', 35, 30),
  jewel('gold', 'ruby', 'ring', 38, 25), jewel('gold', 'ruby', 'amulet', 42, 30),
  jewel('gold', 'diamond', 'ring', 47, 25), jewel('gold', 'diamond', 'amulet', 50, 30),
];

// Studding: tap steel studs with a leather body or chaps in your bag.
export const STUDDING = [
  { id: 'studdedBody', name: 'Studded body', level: 26, xp: 40, uses: { leatherBody: 1, steelStuds: 1 }, gives: { studdedBody: 1 }, ticks: 3, skill: 'crafting', msg: 'You fix the studs to the leather body.' },
  { id: 'studdedChaps', name: 'Studded chaps', level: 29, xp: 42, uses: { leatherChaps: 1, steelStuds: 1 }, gives: { studdedChaps: 1 }, ticks: 3, skill: 'crafting', msg: 'You fix the studs to the leather chaps.' },
];
