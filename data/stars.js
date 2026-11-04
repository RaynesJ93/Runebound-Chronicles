// Shooting stars: every so often one crashes somewhere in the world and can be
// mined for stardust. Stardust is traded with Lyra the Stargazer (see shops.js).
//
// A star has a size from 1 to 5. Each size needs a Mining level (the rocks are
// star1..star5 in mining.js) and holds DUST_PER_SIZE stardust; when that runs
// out the star shrinks a size, and size 1 crumbles away.

export const DUST_PER_SIZE = 25;
export const SIZE_WEIGHTS = { 1: 15, 2: 25, 3: 25, 4: 20, 5: 15 };

// Seconds of play time.
export const FIRST_STAR = [120, 300]; // after a session starts with no star
export const NEXT_STAR = [600, 1200]; // after a star is gone
export const STAR_LIFETIME = 1800; // an unmined star fades after this long

// Where stars can land: open ground, checked to be walkable with room around it.
export const STAR_SITES = [
  { area: 'brambleford', x: 25, y: 13, near: 'the village square' },
  { area: 'brambleford', x: 51, y: 30, near: 'the orchard' },
  { area: 'brambleford', x: 20, y: 39, near: 'the south meadow' },
  { area: 'brambleford', x: 50, y: 17, near: 'the east end' },
  { area: 'brambleford', x: 10, y: 34, near: 'the fishing pond' },
  { area: 'brambleford', x: 32, y: 47, near: 'the river' },
  { area: 'route1', x: 62, y: 50, near: 'the crossroads' },
  { area: 'route1', x: 80, y: 58, near: 'the oak grove' },
  { area: 'route1', x: 26, y: 86, near: 'the lake' },
  { area: 'route1', x: 84, y: 22, near: 'the wolf hills' },
  { area: 'route1', x: 87, y: 85, near: 'the old farmstead' },
  { area: 'route1', x: 96, y: 44, near: 'the stone shrine' },
  { area: 'route1', x: 47, y: 26, near: 'the old watchtower' },
  { area: 'route1', x: 72, y: 86, near: 'the fairy ring' },
  { area: 'route1', x: 30, y: 76, near: "the hunters' camp" },
  { area: 'vale', x: 18, y: 12, near: 'the essence quarry' },
  { area: 'vale', x: 33, y: 28, near: "the runekeepers' camp" },
  { area: 'vale', x: 59, y: 11, near: 'the air altar' },
  { area: 'vale', x: 58, y: 46, near: 'the mind altar' },
  { area: 'vale', x: 20, y: 50, near: 'the water altar' },
];

export function rollSize(rnd) {
  const total = Object.values(SIZE_WEIGHTS).reduce((a, b) => a + b, 0);
  let r = rnd() * total;
  for (const [size, w] of Object.entries(SIZE_WEIGHTS)) if ((r -= w) < 0) return Number(size);
  return 3;
}
