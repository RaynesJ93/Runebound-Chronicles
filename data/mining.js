// Rocks you can mine, and the pickaxes that mine them. Same rules as trees
// (see woodcutting.js): a swing every few ticks, a chance per swing that rises
// with your level and a better pickaxe, and the rock refills after a while.
//   deplete: chance the rock empties after each ore (1 = after every ore), or
//   lasts: [min, max] — a full rock gives a random number of ores in that
//          range before it empties, rolled again each time it refills.

export const ROCKS = {
  copper: { name: 'Copper rock', level: 1, xp: 17.5, ore: 'copperOre', chance: 0.38, deplete: 1, respawn: [4, 7],
    examine: 'A rock with veins of copper.' },
  tin: { name: 'Tin rock', level: 1, xp: 17.5, ore: 'tinOre', chance: 0.38, deplete: 1, respawn: [4, 7],
    examine: 'A rock with flecks of tin.' },
  essence: { name: 'Essence crystal', level: 1, xp: 5, ore: 'runeEssence', chance: 0.6, deplete: 0, respawn: [1, 1],
    examine: 'A crystal of pure rune essence, humming faintly. It never runs dry.' },
  iron: { name: 'Iron rock', level: 15, xp: 35, ore: 'ironOre', chance: 0.3, lasts: [1, 5], respawn: [9, 15],
    examine: 'A rock streaked with rusty iron.' },
  coal: { name: 'Coal rock', level: 30, xp: 50, ore: 'coal', chance: 0.25, lasts: [2, 8], respawn: [20, 35],
    examine: 'A rock seamed with black, shiny coal.' },
  silver: { name: 'Silver rock', level: 20, xp: 40, ore: 'silverOre', chance: 0.22, deplete: 1, respawn: [40, 70],
    examine: 'A rock with bright streaks of silver.' },
  gold: { name: 'Gold rock', level: 40, xp: 65, ore: 'goldOre', chance: 0.18, deplete: 1, respawn: [60, 100],
    examine: 'A rock glinting with veins of gold.' },
  mithril: { name: 'Mithril rock', level: 55, xp: 80, ore: 'mithrilOre', chance: 0.16, lasts: [2, 8], respawn: [80, 130],
    examine: 'A rock shot through with faintly glowing blue mithril.' },
  adamantite: { name: 'Adamantite rock', level: 70, xp: 95, ore: 'adamantiteOre', chance: 0.12, lasts: [2, 6], respawn: [150, 240],
    examine: 'A rock veined with dark green adamantite.' },
  runite: { name: 'Runite rock', level: 85, xp: 125, ore: 'runiteOre', chance: 0.08, lasts: [1, 3], respawn: [300, 500],
    examine: 'A rock with seams of glowing blue runite. Very rare.' },
  // Gem rocks give an uncut gem every time (rolled like the gems you find while mining).
  gem: { name: 'Gem rock', level: 40, xp: 65, ore: 'uncutSapphire', gems: true, chance: 0.2, deplete: 1, respawn: [60, 100],
    examine: 'A rock studded with glittering crystals of every colour.' },
};

// Shooting stars (see stars.js): one rock per size. They never empty on their
// own; the game shrinks them as their stardust runs out.
for (const [size, level, xp] of [[1, 10, 12], [2, 20, 22], [3, 30, 26], [4, 40, 32], [5, 50, 47]]) {
  ROCKS[`star${size}`] = { name: `Shooting star (size ${size})`, level, xp, ore: 'stardust', chance: 0.32, deplete: 0, respawn: [1, 1], star: size,
    examine: 'A star that fell from the sky. It glitters with stardust.' };
}

// Best first. A pickaxe works from your bag or in your hand.
export const PICKAXES = [
  { id: 'runePickaxe', level: 40, bonus: 0.5 },
  { id: 'adamantPickaxe', level: 30, bonus: 0.4 },
  { id: 'mithrilPickaxe', level: 20, bonus: 0.3 },
  { id: 'steelPickaxe', level: 10, bonus: 0.2 },
  { id: 'ironPickaxe', level: 5, bonus: 0.1 },
  { id: 'bronzePickaxe', level: 1, bonus: 0 },
];

export const MINE_TICKS = 4;

// Every ore you mine (not essence) has a small chance of turning up an uncut
// gem as well: 1 in 80 at level 1, rising to about 1 in 40 at 99.
export const GEMS = [
  { item: 'uncutSapphire', weight: 55 },
  { item: 'uncutEmerald', weight: 28 },
  { item: 'uncutRuby', weight: 13 },
  { item: 'uncutDiamond', weight: 4 },
];
export const gemChance = (level) => 1 / 80 + level * 0.000127;
export function rollGem(rnd) {
  let r = rnd() * GEMS.reduce((t, g) => t + g.weight, 0);
  for (const g of GEMS) if ((r -= g.weight) < 0) return g.item;
  return GEMS[0].item;
}
