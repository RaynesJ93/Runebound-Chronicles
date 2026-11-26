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
  // points: task points per task (spent with Tobin the Taskmaster); bonusPoints for a whole tier (v0.59.0)
  { id: 'easy', name: 'Easy', coins: 100, bonus: 3000, points: 10, bonusPoints: 100 },
  { id: 'medium', name: 'Medium', coins: 400, bonus: 15000, points: 30, bonusPoints: 250 },
  { id: 'hard', name: 'Hard', coins: 1500, bonus: 60000, points: 60, bonusPoints: 500 },
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
  // Fletching and Smithing (v0.58.3)
  { id: 'e_shafts150', tier: 'easy', name: 'Fletch 150 arrow shafts', hint: 'A knife on normal logs: 15 shafts a log.', ...get('arrowShaft', 150) },
  { id: 'e_bronzeArrows100', tier: 'easy', name: 'Fletch 100 bronze arrows', hint: 'Headless arrows and bronze arrowtips.', ...get('bronzeArrow', 100) },
  { id: 'e_bronzeDarts50', tier: 'easy', name: 'Fletch 50 bronze darts', hint: 'Bronze dart tips and feathers (Fletching 10).', ...get('bronzeDart', 50) },
  { id: 'e_bronzePlate5', tier: 'easy', name: 'Smith 5 bronze platebodies', hint: '5 bronze bars each, at an anvil (Smithing 18).', ...get('bronzePlatebody', 5) },
  { id: 'e_ironScim10', tier: 'easy', name: 'Smith 10 iron scimitars', hint: '2 iron bars each (Smithing 20).', ...get('ironScimitar', 10) },
  { id: 'e_ironTips150', tier: 'easy', name: 'Smith 150 iron arrowtips', hint: '15 from each iron bar (Smithing 20).', ...get('ironArrowtips', 150) },
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
  // Fletching and Smithing (v0.58.3)
  { id: 'm_steelArrows250', tier: 'medium', name: 'Fletch 250 steel arrows', hint: 'Headless arrows and steel arrowtips (Fletching 30).', ...get('steelArrow', 250) },
  { id: 'm_mapleLong25', tier: 'medium', name: 'Fletch 25 maple longbows', hint: 'A knife on maple logs (Fletching 55).', ...get('mapleLongbow', 25) },
  { id: 'm_mithDarts100', tier: 'medium', name: 'Fletch 100 mithril darts', hint: 'Mithril dart tips and feathers (Fletching 52).', ...get('mithrilDart', 100) },
  { id: 'm_mithPlate20', tier: 'medium', name: 'Smith 20 mithril platebodies', hint: '5 mithril bars each (Smithing 68).', ...get('mithrilPlatebody', 20) },
  { id: 'm_steelKite10', tier: 'medium', name: 'Smith 10 steel kiteshields', hint: '3 steel bars each (Smithing 42).', ...get('steelKiteshield', 10) },
  { id: 'm_studs100', tier: 'medium', name: 'Smith 100 steel studs', hint: '5 from each steel bar, for studded armour (Smithing 36).', ...get('steelStuds', 100) },
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
  // Fletching and Smithing (v0.58.3)
  { id: 'h_runeArrows500', tier: 'hard', name: 'Fletch 500 rune arrows', hint: 'Headless arrows and rune arrowtips (Fletching 75).', ...get('runeArrow', 500) },
  { id: 'h_magicLong50', tier: 'hard', name: 'Fletch 50 magic longbows', hint: 'A knife on magic logs (Fletching 85).', ...get('magicLongbow', 50) },
  { id: 'h_elderShort10', tier: 'hard', name: 'Fletch 10 elder shortbows', hint: 'A knife on elder logs (Fletching 92).', ...get('elderShortbow', 10) },
  { id: 'h_runeJav100', tier: 'hard', name: 'Fletch 100 rune javelins', hint: 'Rune javelin heads and arrow shafts (Fletching 77).', ...get('runeJavelin', 100) },
  { id: 'h_addyPlate10', tier: 'hard', name: 'Smith 10 adamant platebodies', hint: '5 adamant bars each (Smithing 88).', ...get('adamantPlatebody', 10) },
  { id: 'h_runeScim10', tier: 'hard', name: 'Smith 10 rune scimitars', hint: '2 rune bars each (Smithing 90).', ...get('runeScimitar', 10) },
  { id: 'h_rune2h', tier: 'hard', name: 'Smith a rune 2h sword', hint: '3 rune bars (Smithing 99).', ...get('rune2hSword') },
  { id: 'h_combat', tier: 'hard', name: 'Reach combat level 80', hint: 'Attack, Strength, Defence, Hitpoints, Ranged and Magic all count.', check: (c) => c.combat >= 80, progress: (c) => [Math.min(80, c.combat), 80] },
];

export const achievementById = (id) => ACHIEVEMENTS.find((a) => a.id === id);

// Task points earned so far: every completed task, plus each tier bonus paid.
// Worked out from what's done, so tasks finished before points existed count.
export function pointsEarned(done, bonus) {
  let n = 0;
  for (const id of done) { const a = achievementById(id); const t = a && TASK_TIERS.find((x) => x.id === a.tier); if (t) n += t.points; }
  for (const id of bonus) { const t = TASK_TIERS.find((x) => x.id === id); if (t) n += t.bonusPoints; }
  return n;
}
export const tierDone = (done, tier) => ACHIEVEMENTS.filter((a) => a.tier === tier).every((a) => done.includes(a.id));

// Permanent perks bought from Tobin (v0.59.0): the flag each sets.
export const PERKS = {
  perkLightFeet: 'lightFeet',      // walk and run 50% faster
  perkBountiful: 'bountiful',      // 10% chance of a second log, ore or fish
  perkSwiftHands: 'swiftHands',    // Smithing, Fletching, Crafting and Cooking 20% faster
  perkKeenEye: 'keenEye',          // rare drops 10% more often
  perkBankersBond: 'bankersBond',  // bank from anywhere, once every 10 minutes
  perkRuneSaver: 'runeSaver',      // 10% chance a spell costs no runes
};
export const perkOn = (flags, perk) => !!flags[`perk_${perk}`];

// XP lamps: XP = your level in the chosen skill x this.
export const LAMPS = { smallLamp: 10, mediumLamp: 35, largeLamp: 100 };
// What the bag of holding takes: logs, ores and raw fish (and essence), up to HOLD_MAX each.
export const HOLD_MAX = 100;
export const holdable = (id) => /^(logs|[a-z]+Logs|[a-z]+Ore|coal|runeEssence|raw[A-Z][A-Za-z]*)$/.test(id) && id !== 'rawBeef' && id !== 'rawChicken';
// The Taskmaster's ring: where it takes you, and charges a day.
export const RING_SPOTS = [
  { id: 'brambleford', name: 'Brambleford', to: 'brambleford', x: 24, y: 11 },
  { id: 'thornwood', name: 'Thornwood crossroads', to: 'route1', x: 62, y: 43 },
  { id: 'lumenhaven', name: 'Lumenhaven', to: 'lumenhaven', x: 36, y: 46 },
];
export const RING_CHARGES = 3;
// Tobin's spot, for the Task Master cape's teleport.
export const TOBIN_SPOT = { to: 'brambleford', x: 28, y: 20 };
