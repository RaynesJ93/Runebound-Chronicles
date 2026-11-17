// Slayer: tasks from Kesta the Huntress (the slayer master at the Hunters' camp).
//
// A task is "kill N of these monsters". Kills of a task's monsters count down
// and give Slayer XP equal to the monster's hitpoints (base XP, x XP_RATE like
// everything else). Finishing a task gives slayer points (see pointsFor).
//
// Each task type:
//   id, name (plural, as Kesta says it), monsters (enemy ids that count),
//   combat: the combat level you need; maxCombat: she stops giving it after this,
//   slayer: the Slayer level Kesta wants before she gives it (v0.48.2: every
//     task has one, rising with the monsters' level; the slayer monsters also
//     need it to fight them),
//   flag: a story flag that must be set (the monsters' area must be open),
//   amount: [min, max] kills, weight: how often she picks it.

export const TASKS = [
  { id: 'farm', name: 'chickens and cows', monsters: ['chicken', 'cow'], combat: 1, maxCombat: 20, amount: [10, 20], weight: 4 },
  { id: 'goblins', name: 'goblins', monsters: ['goblin', 'goblinBrute', 'tunnelGoblin'], combat: 3, amount: [15, 30], weight: 8 },
  { id: 'wolves', name: 'wolves', monsters: ['wolf'], combat: 10, slayer: 5, amount: [15, 30], weight: 8 },
  { id: 'essenceGolems', name: 'essence golems', monsters: ['essenceGolem'], combat: 15, slayer: 12, amount: [15, 30], weight: 6 },
  { id: 'caveBeasts', name: 'cave beasts', monsters: ['caveBeast'], combat: 20, slayer: 18, amount: [20, 40], weight: 8 },
  { id: 'warrenGoblins', name: 'warren goblins', monsters: ['warrenGoblin'], combat: 22, slayer: 20, flag: 'caveOpen', amount: [20, 40], weight: 7 },
  { id: 'nightStalkers', name: 'night stalkers', monsters: ['nightStalker'], combat: 32, slayer: 35, amount: [20, 40], weight: 7 },
  { id: 'forgeGolems', name: 'forge golems', monsters: ['forgeGolem'], combat: 45, slayer: 40, amount: [20, 40], weight: 6 },
  // v0.46.0
  { id: 'spiders', name: 'giant spiders', monsters: ['giantSpider'], combat: 6, amount: [15, 30], weight: 7 },
  { id: 'crabs', name: 'giant crabs', monsters: ['giantCrab'], combat: 8, slayer: 8, amount: [15, 30], weight: 6 },
  { id: 'bandits', name: 'bandits', monsters: ['bandit'], combat: 10, slayer: 10, amount: [15, 30], weight: 7 },
  { id: 'undead', name: 'skeletons and ghosts', monsters: ['skeleton', 'restlessGhost'], combat: 13, slayer: 15, amount: [20, 40], weight: 8 },
  { id: 'airElementals', name: 'air elementals', monsters: ['airElemental'], combat: 24, slayer: 25, amount: [20, 40], weight: 6 },
  { id: 'fireImps', name: 'fire imps', monsters: ['fireImp'], combat: 28, slayer: 30, amount: [20, 40], weight: 7 },
  // v0.47.0: slayer monsters, only once you have the Slayer level
  { id: 'caveCrawlers', name: 'cave crawlers', monsters: ['caveCrawler'], combat: 15, slayer: 10, amount: [20, 40], weight: 8 },
  { id: 'bloodbats', name: 'bloodbats', monsters: ['bloodbat'], combat: 30, slayer: 25, amount: [20, 40], weight: 8 },
  { id: 'stoneWraiths', name: 'stone wraiths', monsters: ['stoneWraith'], combat: 45, slayer: 45, amount: [20, 40], weight: 8 },
  { id: 'vinegrasp', name: 'vinegrasp horrors', monsters: ['vinegraspHorror'], combat: 70, slayer: 70, amount: [15, 30], weight: 8 },
  // v0.53.0: a boss task
  { id: 'oldBessie', name: 'Old Bessies', monsters: ['oldBessie'], combat: 15, slayer: 20, amount: [3, 6], weight: 3 },
  { id: 'emberWyrms', name: 'ember wyrms', monsters: ['emberWyrm'], combat: 60, slayer: 60, amount: [15, 30], weight: 8 },
];

export const taskById = (id) => TASKS.find((t) => t.id === id);

// Prices, in slayer points.
export const SKIP_COST = 30;
export const BLOCK_COST = 100;
export const MAX_BLOCKS = 4;

// Points for finishing a task, by how many you've done in a row; x1.5 once
// you've read the Hunter's scroll (from Kesta's shop).
export function pointsFor(streak, scroll = false) {
  const base = streak % 50 === 0 ? 150 : streak % 10 === 0 ? 50 : 10;
  return scroll ? Math.round(base * 1.5) : base;
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
  // Nothing fits (say, high combat but low Slayer): the toughest two she's allowed to give.
  if (!pool.length) pool = TASKS.filter((t) => opts.combat >= t.combat && (opts.slayer || 1) >= (t.slayer || 1) && !t.maxCombat && (!t.flag || opts.flags[t.flag]))
    .sort((a, b) => (b.slayer || 1) - (a.slayer || 1) || b.combat - a.combat).slice(0, 2);
  if (!pool.length) return null;
  let r = rng() * pool.reduce((n, t) => n + t.weight, 0);
  const t = pool.find((x) => (r -= x.weight) < 0) || pool.at(-1);
  const [lo, hi] = t.amount;
  const n = lo + Math.floor(rng() * (hi - lo + 1));
  return { id: t.id, left: n, total: n };
}
