// Achievement tasks (v0.58.0): goals in three tiers, ticked off as you play,
// shown in the Tasks panel (the scroll button at the top right) alongside
// your Slayer task.
//
// Each task has a `check(c)` that's true once it's done. `c` gives:
//   c.count('kill:cow' | 'get:willowLogs' | 'visit:vale' | 'slayer:done')
//     how many times that has happened since v0.58.0 (kills, items you
//     gathered or made, areas you've been to, Slayer tasks finished);
//   c.level(skill), c.total (total level), c.combat (combat level);
//   c.quest(id) true once that quest is complete;
//   c.wearing(id) true if you have that item equipped.
// `progress(c)` (optional) returns [have, need] for a progress count.
//
// Each task pays coins when you complete it, and finishing a whole tier pays
// a bonus. Completed tasks are remembered by id, so don't rename ids.

export const TASK_TIERS = [
  { id: 'easy', name: 'Easy', coins: 150, bonus: 2000 },
  { id: 'medium', name: 'Medium', coins: 600, bonus: 10000 },
  { id: 'hard', name: 'Hard', coins: 2500, bonus: 40000 },
];

const get = (id, n = 1) => ({ check: (c) => c.count(`get:${id}`) >= n, progress: (c) => [Math.min(n, c.count(`get:${id}`)), n] });
const kill = (id, n = 1) => ({ check: (c) => c.count(`kill:${id}`) >= n, progress: (c) => [Math.min(n, c.count(`kill:${id}`)), n] });
const visit = (id) => ({ check: (c) => c.count(`visit:${id}`) >= 1 });
const level = (sk, n) => ({ check: (c) => c.level(sk) >= n, progress: (c) => [Math.min(n, c.level(sk)), n] });
const quest = (id) => ({ check: (c) => c.quest(id) });

export const ACHIEVEMENTS = [
  // ---- Easy ----
  { id: 'e_logs', tier: 'easy', name: 'Chop some logs', hint: 'Any tree in Brambleford or Thornwood, with an axe.', ...get('logs') },
  { id: 'e_shrimp', tier: 'easy', name: 'Catch a shrimp', hint: "With a small net at a fishing spot on Brambleford's river.", ...get('rawShrimps') },
  { id: 'e_copper', tier: 'easy', name: 'Mine copper ore', hint: 'Copperdeep Mine, north of Thornwood. Bring a pickaxe.', ...get('copperOre') },
  { id: 'e_bronze', tier: 'easy', name: 'Smelt a bronze bar', hint: 'Copper and tin ore at a furnace.', ...get('bronzeBar') },
  { id: 'e_cook', tier: 'easy', name: 'Cook some shrimps', hint: 'Use raw shrimps on a fire or range.', ...get('shrimps') },
  { id: 'e_leather', tier: 'easy', name: 'Tan a cowhide', hint: "Hilda's tanning rack, by Brambleford's cow field.", ...get('leather') },
  { id: 'e_cows', tier: 'easy', name: 'Kill 5 cows', hint: "Brambleford's cow field.", ...kill('cow', 5) },
  { id: 'e_goblins', tier: 'easy', name: 'Kill 10 goblins', hint: 'Goblins roam Thornwood.', ...kill('goblin', 10) },
  { id: 'e_air', tier: 'easy', name: 'Craft air runes', hint: 'Rune essence at the air altar, north-east of the Whispering Vale.', ...get('airRune') },
  { id: 'e_vale', tier: 'easy', name: 'Visit the Whispering Vale', hint: 'Off the east edge of Thornwood.', ...visit('vale') },
  { id: 'e_lodestones', tier: 'easy', name: 'Finish The Sleeping Stones', hint: 'The lodestone quest.', ...quest('lodestones') },
  { id: 'e_total', tier: 'easy', name: 'Reach total level 75', hint: 'Every level in every skill counts.', check: (c) => c.total >= 75, progress: (c) => [Math.min(75, c.total), 75] },

  // ---- Medium ----
  { id: 'm_willow', tier: 'medium', name: 'Chop willow logs', hint: 'Willows grow in Thornwood (Woodcutting 30).', ...get('willowLogs') },
  { id: 'm_lobster', tier: 'medium', name: 'Catch a lobster', hint: 'With a lobster pot (Fishing 40).', ...get('rawLobster') },
  { id: 'm_mithril', tier: 'medium', name: 'Mine mithril ore', hint: 'Copperdeep Hollow, below the mine (Mining 55).', ...get('mithrilOre') },
  { id: 'm_steel', tier: 'medium', name: 'Smelt a steel bar', hint: 'Iron ore and coal at a furnace (Smithing 30).', ...get('steelBar') },
  { id: 'm_bow', tier: 'medium', name: 'Fletch a willow shortbow', hint: 'A knife on willow logs.', ...get('willowShortbow') },
  { id: 'm_bessie', tier: 'medium', name: 'Defeat Old Bessie', hint: "Her pen in Brambleford's cow field (Slayer 20).", ...kill('oldBessie') },
  { id: 'm_alpha', tier: 'medium', name: 'Defeat the Alpha Wolf', hint: 'The leader of the Thornwood wolves.', ...kill('alphaWolf') },
  { id: 'm_slayer', tier: 'medium', name: 'Finish a Slayer task', hint: "Kesta at the Hunters' camp hands them out.", check: (c) => c.count('slayer:done') >= 1 },
  { id: 'm_cosmic', tier: 'medium', name: 'Craft cosmic runes', hint: 'The island altar in Lumenhaven (Runecrafting 27).', ...get('cosmicRune') },
  { id: 'm_greenmire', tier: 'medium', name: 'Visit Greenmire Rainforest', hint: "South of Brambleford, over the river bridge.", ...visit('rainforest') },
  { id: 'm_ruby', tier: 'medium', name: 'Cut a ruby', hint: 'A chisel on an uncut ruby (Crafting 34).', ...get('ruby') },
  { id: 'm_cart', tier: 'medium', name: 'Finish The Overturned Cart', hint: 'A quest.', ...quest('cart') },

  // ---- Hard ----
  { id: 'h_yew', tier: 'hard', name: 'Chop yew logs', hint: 'Yew trees in Thornwood (Woodcutting 60).', ...get('yewLogs') },
  { id: 'h_shark', tier: 'hard', name: 'Catch a shark', hint: 'With a harpoon at a harpoon spot (Fishing 76).', ...get('rawShark') },
  { id: 'h_runite', tier: 'hard', name: 'Mine runite ore', hint: 'The Sunken Forge (Mining 85).', ...get('runiteOre') },
  { id: 'h_runeBar', tier: 'hard', name: 'Smelt a rune bar', hint: 'Runite ore and coal (Smithing 85).', ...get('runeBar') },
  { id: 'h_wyrm', tier: 'hard', name: 'Slay an ember wyrm', hint: 'The Slayer Caverns or the Sunken Forge (Slayer 60).', ...kill('emberWyrm') },
  { id: 'h_vinegrasp', tier: 'hard', name: 'Slay a vinegrasp horror', hint: 'The deepest cavern (Slayer 70).', ...kill('vinegraspHorror') },
  { id: 'h_dragonstone', tier: 'hard', name: 'Cut a dragonstone', hint: 'From ember wyrms and vinegrasp horrors (Crafting 55).', ...get('dragonstone') },
  { id: 'h_death', tier: 'hard', name: 'Craft death runes', hint: 'The shadow hollow in Lumenhaven (Runecrafting 65).', ...get('deathRune') },
  { id: 'h_wyrmhide', tier: 'hard', name: 'Wear a wyrmhide body', hint: 'Sewn from ember wyrm hides (Crafting 72, Ranged 50).', check: (c) => c.wearing('wyrmhideBody') },
  { id: 'h_slayer10', tier: 'hard', name: 'Finish 10 Slayer tasks', hint: 'Any tasks from Kesta.', check: (c) => c.count('slayer:done') >= 10, progress: (c) => [Math.min(10, c.count('slayer:done')), 10] },
  { id: 'h_story', tier: 'hard', name: 'Finish The Runebound', hint: 'The end of the story.', ...quest('final') },
  { id: 'h_combat', tier: 'hard', name: 'Reach combat level 80', hint: 'Attack, Strength, Defence, Hitpoints, Ranged and Magic all count.', check: (c) => c.combat >= 80, progress: (c) => [Math.min(80, c.combat), 80] },
];

export const achievementById = (id) => ACHIEVEMENTS.find((a) => a.id === id);
