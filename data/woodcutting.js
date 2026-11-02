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
};

// Best first. An axe works from your bag or in your hand.
export const AXES = [
  { id: 'ironAxe', level: 5, bonus: 0.1 },
  { id: 'bronzeAxe', level: 1, bonus: 0 },
];

export const SWING_TICKS = 4;

export function chopChance(tree, wcLevel, axe) {
  return Math.min(0.9, tree.chance + (wcLevel - tree.level) * 0.012 + axe.bonus);
}
