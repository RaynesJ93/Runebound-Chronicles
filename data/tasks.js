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
//   c.wearing(id) true if you have that item equipped;
//   c.have(id) true if it's in your bag, bank or worn; c.best = your highest skill level.
// `progress(c)` (optional) returns [have, need] for a progress count.
//
// Each task pays coins when you complete it, and finishing a whole tier pays
// a bonus. Completed tasks are remembered by id, so don't rename ids unless
// the task itself changes (v0.58.1 gave the counted tasks new ids when their
// amounts went up, so they count again from where your counter is).

export const TASK_TIERS = [
  { id: 'easy', name: 'Easy', coins: 150, bonus: 3000 },
  { id: 'medium', name: 'Medium', coins: 600, bonus: 15000 },
  { id: 'hard', name: 'Hard', coins: 2500, bonus: 60000 },
];

const get = (id, n = 1) => ({ check: (c) => c.count(`get:${id}`) >= n, progress: (c) => [Math.min(n, c.count(`get:${id}`)), n] });
const kill = (id, n = 1) => ({ check: (c) => c.count(`kill:${id}`) >= n, progress: (c) => [Math.min(n, c.count(`kill:${id}`)), n] });
const visit = (id) => ({ check: (c) => c.count(`visit:${id}`) >= 1 });
const level = (sk, n) => ({ check: (c) => c.level(sk) >= n, progress: (c) => [Math.min(n, c.level(sk)), n] });
const quest = (id) => ({ check: (c) => c.quest(id) });
const cast = (id, n) => ({ check: (c) => c.count(`cast:${id}`) >= n, progress: (c) => [Math.min(n, c.count(`cast:${id}`)), n] });

export const ACHIEVEMENTS = [
  // ---- Easy ----
  { id: 'e_logs25', tier: 'easy', name: 'Chop 25 logs', hint: 'Any tree in Brambleford or Thornwood, with an axe.', ...get('logs', 25) },
  { id: 'e_shrimp20', tier: 'easy', name: 'Catch 20 shrimps', hint: "With a small net at a fishing spot on Brambleford's river.", ...get('rawShrimps', 20) },
  { id: 'e_copper25', tier: 'easy', name: 'Mine 25 copper ore', hint: 'Copperdeep Mine, north of Thornwood. Bring a pickaxe.', ...get('copperOre', 25) },
  { id: 'e_bronze10', tier: 'easy', name: 'Smelt 10 bronze bars', hint: 'Copper and tin ore at a furnace.', ...get('bronzeBar', 10) },
  { id: 'e_cook20', tier: 'easy', name: 'Cook 20 shrimps', hint: 'Use raw shrimps on a fire or range.', ...get('shrimps', 20) },
  { id: 'e_leather10', tier: 'easy', name: 'Tan 10 cowhides', hint: "Hilda's tanning rack, by Brambleford's cow field.", ...get('leather', 10) },
  { id: 'e_cows10', tier: 'easy', name: 'Kill 10 cows', hint: "Brambleford's cow field.", ...kill('cow', 10) },
  { id: 'e_goblins20', tier: 'easy', name: 'Kill 20 goblins', hint: 'Goblins roam Thornwood.', ...kill('goblin', 20) },
  { id: 'e_air100', tier: 'easy', name: 'Craft 100 air runes', hint: 'Rune essence at the air altar, north-east of the Whispering Vale.', ...get('airRune', 100) },
  { id: 'e_vale', tier: 'easy', name: 'Visit the Whispering Vale', hint: 'Off the east edge of Thornwood.', ...visit('vale') },
  { id: 'e_lodestones', tier: 'easy', name: 'Finish The Sleeping Stones', hint: 'The lodestone quest.', ...quest('lodestones') },
  // (v0.58.2)
  { id: 'e_anchovies20', tier: 'easy', name: 'Catch 20 anchovies', hint: "Small net on Brambleford's river (Fishing 15).", ...get('rawAnchovies', 20) },
  { id: 'e_tin25', tier: 'easy', name: 'Mine 25 tin ore', hint: 'Copperdeep Mine, the west gallery.', ...get('tinOre', 25) },
  { id: 'e_shortbow15', tier: 'easy', name: 'Fletch 15 shortbows', hint: 'A knife on normal logs (Fletching 5).', ...get('shortbow', 15) },
  { id: 'e_chickens15', tier: 'easy', name: 'Kill 15 chickens', hint: "The chicken pen in Brambleford.", ...kill('chicken', 15) },
  { id: 'e_spiders10', tier: 'easy', name: 'Kill 10 giant spiders', hint: 'They lurk in Thornwood.', ...kill('giantSpider', 10) },
  { id: 'e_water100', tier: 'easy', name: 'Craft 100 water runes', hint: 'The water altar, south-west of the Whispering Vale (Runecrafting 5).', ...get('waterRune', 100) },
  { id: 'e_mine', tier: 'easy', name: 'Visit Copperdeep Mine', hint: 'North of Thornwood.', ...visit('mine') },
  { id: 'e_wind25', tier: 'easy', name: 'Cast Wind Strike 25 times', hint: 'Your first combat spell: an air and a mind rune each.', ...cast('windStrike', 25) },
  { id: 'e_total', tier: 'easy', name: 'Reach total level 75', hint: 'Every level in every skill counts.', check: (c) => c.total >= 75, progress: (c) => [Math.min(75, c.total), 75] },

  // ---- Medium ----
  { id: 'm_willow100', tier: 'medium', name: 'Chop 100 willow logs', hint: 'Willows grow in Thornwood (Woodcutting 30).', ...get('willowLogs', 100) },
  { id: 'm_lobster50', tier: 'medium', name: 'Catch 50 lobsters', hint: 'With a lobster pot (Fishing 40).', ...get('rawLobster', 50) },
  { id: 'm_mithril50', tier: 'medium', name: 'Mine 50 mithril ore', hint: 'Copperdeep Hollow, below the mine (Mining 55).', ...get('mithrilOre', 50) },
  { id: 'm_steel50', tier: 'medium', name: 'Smelt 50 steel bars', hint: 'Iron ore and coal at a furnace (Smithing 30).', ...get('steelBar', 50) },
  { id: 'm_bow25', tier: 'medium', name: 'Fletch 25 willow shortbows', hint: 'A knife on willow logs.', ...get('willowShortbow', 25) },
  { id: 'm_bessie10', tier: 'medium', name: 'Defeat Old Bessie 10 times', hint: "Her pen in Brambleford's cow field (Slayer 20).", ...kill('oldBessie', 10) },
  { id: 'm_alpha5', tier: 'medium', name: 'Defeat the Alpha Wolf 5 times', hint: 'The leader of the Thornwood wolves.', ...kill('alphaWolf', 5) },
  { id: 'm_slayer5', tier: 'medium', name: 'Finish 5 Slayer tasks', hint: "Kesta at the Hunters' camp hands them out.", check: (c) => c.count('slayer:done') >= 5, progress: (c) => [Math.min(5, c.count('slayer:done')), 5] },
  { id: 'm_cosmic200', tier: 'medium', name: 'Craft 200 cosmic runes', hint: 'The island altar in Lumenhaven (Runecrafting 27).', ...get('cosmicRune', 200) },
  { id: 'm_greenmire', tier: 'medium', name: 'Visit Greenmire Rainforest', hint: "South of Brambleford, over the river bridge.", ...visit('rainforest') },
  { id: 'm_ruby10', tier: 'medium', name: 'Cut 10 rubies', hint: 'A chisel on an uncut ruby (Crafting 34).', ...get('ruby', 10) },
  // (v0.58.2)
  { id: 'm_salmon50', tier: 'medium', name: 'Catch 50 salmon', hint: 'A fly rod at a lure spot (Fishing 30).', ...get('rawSalmon', 50) },
  { id: 'm_gold25', tier: 'medium', name: 'Smelt 25 gold bars', hint: 'Gold ore at a furnace (Smithing 40).', ...get('goldBar', 25) },
  { id: 'm_stardust200', tier: 'medium', name: 'Mine 200 stardust', hint: 'From the shooting stars that fall around the world. Lyra trades for it.', ...get('stardust', 200) },
  { id: 'm_chief', tier: 'medium', name: 'Defeat the Goblin Chief', hint: "The goblin camp in west Thornwood.", ...kill('goblinChief') },
  { id: 'm_bloodbats30', tier: 'medium', name: 'Kill 30 bloodbats', hint: 'The Slayer Caverns or Copperdeep Hollow (Slayer 25).', ...kill('bloodbat', 30) },
  { id: 'm_war', tier: 'medium', name: 'Finish Echoes of the War', hint: 'A quest.', ...quest('war') },
  { id: 'm_alch50', tier: 'medium', name: 'Cast High Alchemy 50 times', hint: 'Turns an item into coins: 1 nature and 5 fire runes (Magic 55).', ...cast('highAlch', 50) },
  { id: 'm_cart', tier: 'medium', name: 'Finish The Overturned Cart', hint: 'A quest.', ...quest('cart') },

  // ---- Hard ----
  { id: 'h_yew250', tier: 'hard', name: 'Chop 250 yew logs', hint: 'Yew trees in Thornwood (Woodcutting 60).', ...get('yewLogs', 250) },
  { id: 'h_shark100', tier: 'hard', name: 'Catch 100 sharks', hint: 'With a harpoon at a harpoon spot (Fishing 76).', ...get('rawShark', 100) },
  { id: 'h_runite25', tier: 'hard', name: 'Mine 25 runite ore', hint: 'The Sunken Forge (Mining 85).', ...get('runiteOre', 25) },
  { id: 'h_runeBar25', tier: 'hard', name: 'Smelt 25 rune bars', hint: 'Runite ore and coal (Smithing 85).', ...get('runeBar', 25) },
  { id: 'h_wyrm50', tier: 'hard', name: 'Slay 50 ember wyrms', hint: 'The Slayer Caverns or the Sunken Forge (Slayer 60).', ...kill('emberWyrm', 50) },
  { id: 'h_vinegrasp50', tier: 'hard', name: 'Slay 50 vinegrasp horrors', hint: 'The deepest cavern (Slayer 70).', ...kill('vinegraspHorror', 50) },
  { id: 'h_dragonstone5', tier: 'hard', name: 'Cut 5 dragonstones', hint: 'From ember wyrms and vinegrasp horrors (Crafting 55).', ...get('dragonstone', 5) },
  { id: 'h_death500', tier: 'hard', name: 'Craft 500 death runes', hint: 'The shadow hollow in Lumenhaven (Runecrafting 65).', ...get('deathRune', 500) },
  { id: 'h_wyrmhide', tier: 'hard', name: 'Wear a wyrmhide body', hint: 'Sewn from ember wyrm hides (Crafting 72, Ranged 50).', check: (c) => c.wearing('wyrmhideBody') },
  { id: 'h_slayer25', tier: 'hard', name: 'Finish 25 Slayer tasks', hint: 'Any tasks from Kesta.', check: (c) => c.count('slayer:done') >= 25, progress: (c) => [Math.min(25, c.count('slayer:done')), 25] },
  { id: 'h_story', tier: 'hard', name: 'Finish The Runebound', hint: 'The end of the story.', ...quest('final') },
  // (v0.58.2)
  { id: 'h_magic50', tier: 'hard', name: 'Chop 50 magic logs', hint: 'Magic trees glow all over Lumenhaven (Woodcutting 75).', ...get('magicLogs', 50) },
  { id: 'h_adamant100', tier: 'hard', name: 'Mine 100 adamantite ore', hint: 'The west gallery of the Sunken Forge (Mining 70).', ...get('adamantiteOre', 100) },
  { id: 'h_runePlate', tier: 'hard', name: 'Smith a rune platebody', hint: 'Five rune bars at an anvil (Smithing 99).', ...get('runePlatebody') },
  { id: 'h_molten5', tier: 'hard', name: 'Defeat the Molten Beast 5 times', hint: 'The far hall of the Sunken Forge.', ...kill('moltenBeast', 5) },
  { id: 'h_whip', tier: 'hard', name: 'Get a vine whip', hint: 'A rare drop from vinegrasp horrors (Slayer 70).', check: (c) => c.have('vineWhip') },
  { id: 'h_superior', tier: 'hard', name: 'Wear a superior slayer helmet', hint: "From Kesta's Slayer shop (Defence 60).", check: (c) => c.wearing('superiorSlayerHelmet') },
  { id: 'h_coldForge', tier: 'hard', name: 'Finish The Cold Forge', hint: 'A quest.', ...quest('coldForge') },
  { id: 'h_99', tier: 'hard', name: 'Reach level 99 in any skill', hint: 'The top of any skill.', check: (c) => c.best >= 99, progress: (c) => [Math.min(99, c.best), 99] },
  { id: 'h_combat', tier: 'hard', name: 'Reach combat level 80', hint: 'Attack, Strength, Defence, Hitpoints, Ranged and Magic all count.', check: (c) => c.combat >= 80, progress: (c) => [Math.min(80, c.combat), 80] },
];

export const achievementById = (id) => ACHIEVEMENTS.find((a) => a.id === id);
