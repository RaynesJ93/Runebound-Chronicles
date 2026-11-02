// Fishing spots. Each spot is fished one way, with one tool, and may need
// bait that's used up on every catch. Spots never run out.
//
// catches: best first. On each attempt the best fish you're high enough for
// is tried first (chance rises 1% a level above it), then the next one down.

export const SPOTS = {
  net: {
    name: 'Fishing spot', verb: 'Net', tool: 'smallNet', toolName: 'small fishing net',
    start: 'You cast out your net...',
    catches: [
      { item: 'rawAnchovies', level: 15, xp: 40, chance: 0.25 },
      { item: 'rawShrimps', level: 1, xp: 10, chance: 0.38 },
    ],
    examine: 'Little fish dart about in the shallows. (Small net: shrimps, and anchovies at Fishing 15.)',
  },
  bait: {
    name: 'Fishing spot', verb: 'Bait', tool: 'fishingRod', toolName: 'fishing rod', bait: 'fishingBait',
    start: 'You cast out your line...',
    catches: [
      { item: 'rawHerring', level: 10, xp: 30, chance: 0.25 },
      { item: 'rawSardine', level: 5, xp: 20, chance: 0.33 },
    ],
    examine: 'Fish rise to the surface here. (Fishing rod and bait: sardines from level 5, herring at 10.)',
  },
  lure: {
    name: 'Fishing spot', verb: 'Lure', tool: 'flyFishingRod', toolName: 'fly fishing rod', bait: 'feather',
    start: 'You cast out your line...',
    catches: [
      { item: 'rawSalmon', level: 30, xp: 70, chance: 0.2 },
      { item: 'rawTrout', level: 20, xp: 50, chance: 0.28 },
    ],
    examine: 'Fast water where trout and salmon swim. (Fly fishing rod and feathers: trout from 20, salmon at 30.)',
  },
};

export const FISH_TICKS = 5;

// The lowest level that catches anything at a spot.
export const spotLevel = (spot) => Math.min(...spot.catches.map((c) => c.level));
