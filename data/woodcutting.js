// Trees you can chop, and the axes that chop them.
//
// level:   Woodcutting level needed
// xp:      XP for each log
// chance:  base chance per swing at the tree's own level (a swing every 4 ticks).
//          Each level above it adds 1.2%, and a better axe adds its bonus.
// deplete: chance the tree falls after each log (1 = always after one log)
// respawn: ticks [min, max] before the stump grows back (1 tick = 0.6 s)

export const TREES = {
  pine: { name: 'Pine tree', level: 1, xp: 25, log: 'logs', chance: 0.34, deplete: 1, respawn: [25, 45],
    examine: 'A tall pine. Good for logs.' },
  oak: { name: 'Oak tree', level: 15, xp: 37.5, log: 'oakLogs', chance: 0.2, deplete: 1 / 8, respawn: [40, 70],
    examine: 'A sturdy old oak. Its wood is strong.' },
  // v0.50.0 (skill review batch 1)
  willow: { name: 'Willow tree', level: 30, xp: 67.5, log: 'willowLogs', chance: 0.17, deplete: 1 / 8, respawn: [45, 75],
    examine: 'A willow, trailing its branches in the water.' },
  maple: { name: 'Maple tree', level: 45, xp: 100, log: 'mapleLogs', chance: 0.12, deplete: 1 / 10, respawn: [60, 90],
    examine: 'A maple, its leaves turning red and gold.' },
  yew: { name: 'Yew tree', level: 60, xp: 175, log: 'yewLogs', chance: 0.09, deplete: 1 / 12, respawn: [80, 120],
    examine: 'An ancient, dark yew. Bowyers prize its wood.' },
  magic: { name: 'Magic tree', level: 75, xp: 250, log: 'magicLogs', chance: 0.06, deplete: 1 / 14, respawn: [100, 150],
    examine: 'A tree that glows faintly blue. The air around it hums.' },
  elder: { name: 'Elder tree', level: 90, xp: 325, log: 'elderLogs', chance: 0.05, deplete: 1 / 16, respawn: [120, 180],
    examine: 'An elder tree, older than the caverns around it. Its roots go down forever.' },
};

// Best first. An axe works from your bag or in your hand.
export const AXES = [
  { id: 'runeAxe', level: 40, bonus: 0.5 },
  { id: 'adamantAxe', level: 30, bonus: 0.4 },
  { id: 'mithrilAxe', level: 20, bonus: 0.3 },
  { id: 'steelAxe', level: 10, bonus: 0.2 },
  { id: 'ironAxe', level: 5, bonus: 0.1 },
  { id: 'bronzeAxe', level: 1, bonus: 0 },
];

export const SWING_TICKS = 4;

export function chopChance(tree, wcLevel, axe) {
  return Math.min(0.9, tree.chance + (wcLevel - tree.level) * 0.012 + axe.bonus);
}
