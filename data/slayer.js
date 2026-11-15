// Slayer: tasks from Kesta the Huntress (the slayer master at the Hunters' camp).
//
// A task is "kill N of these monsters". Kills of a task's monsters count down
// and give Slayer XP equal to the monster's hitpoints (base XP, x XP_RATE like
// everything else). Finishing a task gives slayer points (see pointsFor).
//
// Each task type:
//   id, name (plural, as Kesta says it), monsters (enemy ids that count),
//   combat: the combat level you need; maxCombat: she stops giving it after this,
//   slayer: the Slayer level you need (for slayer-only monsters, batch 3),
//   flag: a story flag that must be set (the monsters' area must be open),
//   amount: [min, max] kills, weight: how often she picks it.

export const TASKS = [
  { id: 'farm', name: 'chickens and cows', monsters: ['chicken', 'cow'], combat: 1, maxCombat: 20, amount: [10, 20], weight: 4 },
  { id: 'goblins', name: 'goblins', monsters: ['goblin', 'goblinBrute', 'tunnelGoblin'], combat: 3, amount: [15, 30], weight: 8 },
  { id: 'wolves', name: 'wolves', monsters: ['wolf'], combat: 10, amount: [15, 30], weight: 8 },
  { id: 'essenceGolems', name: 'essence golems', monsters: ['essenceGolem'], combat: 15, amount: [15, 30], weight: 6 },
  { id: 'caveBeasts', name: 'cave beasts', monsters: ['caveBeast'], combat: 20, amount: [20, 40], weight: 8 },
  { id: 'warrenGoblins', name: 'warren goblins', monsters: ['warrenGoblin'], combat: 22, flag: 'caveOpen', amount: [20, 40], weight: 7 },
  { id: 'nightStalkers', name: 'night stalkers', monsters: ['nightStalker'], combat: 32, amount: [20, 40], weight: 7 },
  { id: 'forgeGolems', name: 'forge golems', monsters: ['forgeGolem'], combat: 45, amount: [20, 40], weight: 6 },
  // v0.46.0
  { id: 'spiders', name: 'giant spiders', monsters: ['giantSpider'], combat: 6, amount: [15, 30], weight: 7 },
  { id: 'crabs', name: 'giant crabs', monsters: ['giantCrab'], combat: 8, amount: [15, 30], weight: 6 },
  { id: 'bandits', name: 'bandits', monsters: ['bandit'], combat: 10, amount: [15, 30], weight: 7 },
  { id: 'undead', name: 'skeletons and ghosts', monsters: ['skeleton', 'restlessGhost'], combat: 13, amount: [20, 40], weight: 8 },
  { id: 'airElementals', name: 'air elementals', monsters: ['airElemental'], combat: 24, amount: [20, 40], weight: 6 },
  { id: 'fireImps', name: 'fire imps', monsters: ['fireImp'], combat: 28, amount: [20, 40], weight: 7 },
];

export const taskById = (id) => TASKS.find((t) => t.id === id);

// Prices, in slayer points.
export const SKIP_COST = 30;
export const BLOCK_COST = 100;
export const MAX_BLOCKS = 4;

// Points for finishing a task, by how many you've done in a row.
export function pointsFor(streak) {
  if (streak % 50 === 0) return 150;
  if (streak % 10 === 0) return 50;
  return 10;
}

// How far below your combat level a task can be before it's too easy to give.
export const TOO_EASY = 25;

// The tasks Kesta could give you right now.
export function eligibleTasks({ combat, slayer, flags, blocked = [], last = null }) {
  return TASKS.filter((t) => combat >= t.combat && combat - t.combat <= TOO_EASY && (!t.maxCombat || combat <= t.maxCombat) && slayer >= (t.slayer || 1)
    && (!t.flag || flags[t.flag]) && !blocked.includes(t.id) && t.id !== last);
}

// Pick a new task (weighted), with its number of kills. rng() is 0..1.
export function pickTask(opts, rng = Math.random) {
  let pool = eligibleTasks(opts);
  if (!pool.length) pool = eligibleTasks({ ...opts, last: null });
  if (!pool.length) pool = TASKS.filter((t) => opts.combat >= t.combat && (opts.slayer || 1) >= (t.slayer || 1) && !t.maxCombat && (!t.flag || opts.flags[t.flag])).slice(-2); // the toughest few
  if (!pool.length) return null;
  let r = rng() * pool.reduce((n, t) => n + t.weight, 0);
  const t = pool.find((x) => (r -= x.weight) < 0) || pool.at(-1);
  const [lo, hi] = t.amount;
  const n = lo + Math.floor(rng() * (hi - lo + 1));
  return { id: t.id, left: n, total: n };
}
