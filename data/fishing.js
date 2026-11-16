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
  // v0.50.0 (skill review batch 1)
  cage: {
    name: 'Fishing spot', verb: 'Cage', tool: 'lobsterPot', toolName: 'lobster pot',
    start: 'You lower your lobster pot into the water...',
    catches: [{ item: 'rawLobster', level: 40, xp: 90, chance: 0.18 }],
    examine: 'Deep water by the rocks, where lobsters crawl. (Lobster pot: lobsters at Fishing 40.)',
  },
  harpoon: {
    name: 'Fishing spot', verb: 'Harpoon', tool: 'harpoon', toolName: 'harpoon',
    start: 'You ready your harpoon...',
    catches: [
      { item: 'rawShark', level: 76, xp: 110, chance: 0.1 },
      { item: 'rawSwordfish', level: 50, xp: 100, chance: 0.14 },
    ],
    examine: 'Big fins cut the water here. (Harpoon: swordfish at Fishing 50, sharks at 76.)',
  },
  deepNet: {
    name: 'Fishing spot', verb: 'Net', tool: 'smallNet', toolName: 'small fishing net',
    start: 'You cast your net into the deep water...',
    catches: [{ item: 'rawMonkfish', level: 62, xp: 120, chance: 0.16 }],
    examine: 'Dark, deep water. Something ugly lurks at the bottom. (Small net: monkfish at Fishing 62.)',
  },
  cave: {
    name: 'Fishing spot', verb: 'Bait', tool: 'fishingRod', toolName: 'fishing rod', bait: 'fishingBait',
    start: 'You lower your line into the black water...',
    catches: [{ item: 'rawCaveEel', level: 85, xp: 130, chance: 0.12 }],
    examine: 'A still, black pool. Long shapes glide under the surface. (Fishing rod and bait: cave eels at Fishing 85.)',
  },
};

export const FISH_TICKS = 5;

// The lowest level that catches anything at a spot.
export const spotLevel = (spot) => Math.min(...spot.catches.map((c) => c.level));
