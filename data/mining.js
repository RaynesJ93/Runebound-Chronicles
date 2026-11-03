// Rocks you can mine, and the pickaxes that mine them. Same rules as trees
// (see woodcutting.js): a swing every few ticks, a chance per swing that rises
// with your level and a better pickaxe, and the rock refills after a while.

export const ROCKS = {
  copper: { name: 'Copper rock', level: 1, xp: 17.5, ore: 'copperOre', chance: 0.38, deplete: 1, respawn: [4, 7],
    examine: 'A rock with veins of copper.' },
  tin: { name: 'Tin rock', level: 1, xp: 17.5, ore: 'tinOre', chance: 0.38, deplete: 1, respawn: [4, 7],
    examine: 'A rock with flecks of tin.' },
  essence: { name: 'Essence crystal', level: 1, xp: 5, ore: 'runeEssence', chance: 0.6, deplete: 0, respawn: [1, 1],
    examine: 'A crystal of pure rune essence, humming faintly. It never runs dry.' },
  iron: { name: 'Iron rock', level: 15, xp: 35, ore: 'ironOre', chance: 0.3, deplete: 1, respawn: [9, 15],
    examine: 'A rock streaked with rusty iron.' },
  coal: { name: 'Coal rock', level: 30, xp: 50, ore: 'coal', chance: 0.25, deplete: 1, respawn: [20, 35],
    examine: 'A rock seamed with black, shiny coal.' },
};

// Best first. A pickaxe works from your bag or in your hand.
export const PICKAXES = [
  { id: 'steelPickaxe', level: 10, bonus: 0.2 },
  { id: 'ironPickaxe', level: 5, bonus: 0.1 },
  { id: 'bronzePickaxe', level: 1, bonus: 0 },
];

export const MINE_TICKS = 4;
