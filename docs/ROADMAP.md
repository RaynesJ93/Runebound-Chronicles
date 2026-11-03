# RuneBound Chronicles — Roadmap

*Updated 2 November 2026 · matches [GAME_DESIGN.md](GAME_DESIGN.md) v2.2*

The game is built in small batches. Each batch must:

- leave the game playable,
- keep every existing feature working,
- keep every existing save loading (bump the save version and add a migration when the save format changes),
- be tested on desktop **and** iPhone before the next batch starts.

Out of scope, permanently: turn-based battles, battle screens, random encounters, creature catching, creature parties, Runelings.

## Phase 1 — First playable version (v0.1) ✅

Released 2 November 2026 as game version 0.10.0 (the version numbers in Settings counted up one per batch, so the first playable release is 0.10.0).

| Batch | Name | What's in it | Done when |
| --- | --- | --- | --- |
| 0 ✅ | Project foundation | `index.html`, renderer, game loop, 0.6 s tick, game-state object, save system v1 (versioned, autosave, two slots, export/import), GitHub Pages deploy | Page loads on desktop and iPhone; a save survives a reload |
| 1 ✅ | Starting village + Emerald camera | Tile-map village, top-down follow camera, grid movement (WASD/arrows), tap/click-to-move with A* pathfinding, collision, run toggle and energy | You can walk around the village on both devices |
| 2 ✅ | NPCs and the forest route | Wandering NPCs, Emerald-style dialogue box with choices, inspectable doors, Route 1 (Thornwood) connected to the village with area transitions. Building interiors move to Batch 8 with the bank and shop | You can talk to NPCs and walk to the forest and back |
| 3 ✅ | Overworld combat core | Roaming goblins, tap/click to attack, auto-move into range, timed attack cycles, hit chance and damage formulas, hitsplats, health bars, enemy retaliation, chasing, leashing back to spawn, enemy respawn, player death and respawn | You can fight and kill goblins without any battle screen |
| 4 ✅ | Combat skills and XP | Attack, Strength, Defence, Hitpoints (starts at 10), XP curve to 99, combat styles, XP drops, level-up messages, combat level, skills panel | Killing goblins levels you up and your combat level changes |
| 5 ✅ | Loot and inventory | Loot tables in data, ground items, manual pickup, 28-slot inventory, drop, examine, despawn timers | Goblins drop items you can pick up and manage |
| 6 ✅ | Equipment | 11 equipment slots, wield/wear, stat bonuses feeding the combat formulas, level requirements, equipment panel | Equipping a bronze sword makes you visibly stronger |
| 7 ✅ | Ranged, magic and wolves | Shortbow + arrows, staff + runes + basic strike spells, projectiles, style switching, Ranged and Magic skills, wolves (aggressive), Alpha Wolf mini-boss | You can kill wolves with melee, ranged or magic |
| 8 ✅ | Food, potions, bank and shop | Eating (3-tick delay), potions with timed boosts, building interiors, village bank (deposit/withdraw), general store (buy/sell, coins), death gravestone rules | Full loop works: fight → loot → bank/sell → buy upgrade |
| 9 ✅ | v0.1 polish | Mobile UI pass (safe areas, 44 pt targets, long-press menus), settings, performance pass on iPhone, save migration tests, bug fixes | v0.1 released on GitHub Pages |

## Phase 2 — Skilling (v0.2)

1. ✅ Woodcutting (trees on the forest route) and Fletching (bows, arrows) — v0.11.0
2. ✅ Mining (a small mine area) and Smithing (bars, bronze/iron gear) — v0.12.0
3. ✅ Fishing and Cooking (food you make yourself) — v0.13.0
4. Crafting and Runecrafting (leather armour, runes for magic)
5. Bank tabs and search

## Phase 3 — Quests and new regions (v0.3)

1. Quest journal and quest system (stages, flags, rewards)
2. First main-story quest that unlocks the second town
3. Second town, two more routes, a cave
4. New enemy families and gear tiers (steel, mithril)
5. Specialist shops in the new town

## Phase 4 — Dungeons and bosses (v0.4)

1. First multi-floor dungeon
2. Boss fight with telegraphed attacks and phases
3. Rare-drop table expansion and collection log
4. Prayer and Agility skills

## Phase 5 — Endgame (v1.0)

1. Wilderness area with harsher death rules
2. Endgame gear tiers and bosses
3. Skill capes at 99
4. Balance pass across all skills, XP rates and drop rates

## Changelog

| Date | Change |
| --- | --- |
| 3 Nov 2026 | v0.14.0: bigger maps. Brambleford grew from 44×36 to 64×54 tiles: an east end with three more houses, an orchard of pines and oaks, a south road to a river with a bridge and four fishing spots, and a fenced cow field (cows: bones and cowhide every kill, raw beef 1 in 2; beef cooks into cooked meat). Route 1 grew from 34×60 to 52×78: an oak grove and a wolf ridge (two more wolves) to the east, and a longer road south past a lake (three fishing spots) and a hunter's camp with a cooking fire. Nothing that was already there moved, so old saves line up. |
| 3 Nov 2026 | v0.13.1: continuous skilling animations — axe and pickaxe swings with wood chips and rock chips/sparks, a fishing rod with line and bobbing float (or a net dipping in and out), a pan over the fire with steam, furnace embers, hammer and sparks at the anvil, knife and shavings for fletching; you lean into each swing, and the skill's icon floats above your head while you work. |
| 2 Nov 2026 | v0.13.0: Phase 2.3 shipped — Fishing (net, bait and lure spots on Brambleford's pond and the Route 1 stream; shrimps, anchovies, sardines, herring, trout, salmon) and Cooking (cooking pit by the pond and the goblin campfire; food burns less as you level). Old Finn teaches fishing and gives a net, rod and bait; Pell sells rods, nets and bait. Raw chicken can now be cooked. |
| 2 Nov 2026 | v0.12.2: Wyn's chicken pen in Brambleford (south of the lower lane, west of the farm) with 5 chickens (level 1, 3 HP, respawn in 9 s). Every kill drops bones; raw chicken (1/2) and 5–15 feathers (1/2) are rolled separately. New `each` loot table type for independent drops; new raw chicken item (for Cooking). |
| 2 Nov 2026 | v0.12.1: XP rates increased 5× for every skill (combat, Hitpoints and skilling), with one multiplier, `XP_RATE`. Existing XP is kept as it is. |
| 2 Nov 2026 | v0.12.0: Phase 2.2 shipped — Copperdeep Mine opens at the top of Route 1 (rockslide cleared): entrance hall with furnace, anvil and Dorrin the Miner, copper/tin and iron galleries, tunnel goblins. Mining (copper, tin, iron; bronze and iron pickaxes), smelting (bronze bars; iron bars that can fail), smithing 16 bronze and iron items with a hammer. New iron sword, iron med helm, sq shields, chainbodies and iron arrows; Fletching makes iron arrows at 15. |
| 2 Nov 2026 | v0.11.1: clearer numbers — digits now use the Jersey 10 pixel font (Pixelify Sans's 5 looked like an S); letters are unchanged. The digit font is bundled with the game (3.8 KB). |
| 2 Nov 2026 | v0.11.0: Phase 2.1 shipped — Woodcutting (pine and oak trees, bronze and iron axes, stumps that grow back) and Fletching (arrow shafts, shortbow, longbow, oak bows, headless and bronze arrows); Bram teaches you and gives you an axe and knife; Pell sells axes, knives, feathers and arrowtips; goblins drop feathers; both skills in the skills panel. |
| 2 Nov 2026 | v0.10.0 — first playable release. Batch 9: long-press (phone) or right-click (computer) anything for its options (attack, talk, examine, take, enter, walk here); tapping an item eats, drinks, wields or wears it, long-press for the full menu; every touch button at least 44 pt; shop quantity buttons on their own row on phones; new settings (what tapping an item does, text speed, XP drops, battery saver) and an "adventure" stats section; canvas capped at 2× density and the HUD only redraws what changed; saves are repaired on load (unknown items removed, broken values reset); automated tests for loading saves from every earlier version; examine text for every villager. Fixed: two saves in the same millisecond could load the older one. |
| 2 Nov 2026 | Bram's cabin got a bow-and-arrow sign so new players know where to get a free bow. |
| 2 Nov 2026 | v0.9.0: Batch 8 shipped — walk-in interiors for the General Store and Bank, Pell's shop (buy/sell, prices shift with stock, restocking), the bank (unlimited stacking storage, deposit bag/worn items), food (bread, meat pie, trout), attack/strength/defence potions with 4 doses and decaying boosts, eating delays your next attack, death keeps your 3 most valuable items and leaves the rest in a 15-minute gravestone (free for 5 minutes, then a fee), new leather armour and wooden shield. |
| 2 Nov 2026 | v0.8.0: Batch 7 shipped — shortbow (from Bram) with arrows from the ammo slot, apprentice staff (from Wren) casting Wind Strike / Water Strike with runes, projectiles with travel time and line of sight, Accurate / Rapid / Longrange bow styles, ranged and magic accuracy, max hit and XP, 60% of arrows recoverable, wolves (aggressive pack) and the Alpha Wolf mini-boss with a 1/32 wolf-pelt cloak. New runes added to goblin drops. |
| 2 Nov 2026 | v0.7.0: Batch 6 shipped — 11 equipment slots, wield/wear/remove with swapping, level requirements, attack/defence bonuses by type (stab, slash, crush, ranged, magic), melee strength, weapon speed and attack type feeding the combat formulas, enemies' attack types, equipment tab with bonus table, gear drawn on the character. |
| 2 Nov 2026 | v0.6.1: health now regenerates only out of combat, at 1 hitpoint every 6 seconds (was 1 per minute, even mid-fight). |
| 2 Nov 2026 | v0.6.0: Batch 5 shipped — 11 items with code-drawn icons, goblin and Goblin Brute loot tables with a rare table, loot on the ground (2 min; 3 min for your own drops) with a gold beam for rare drops, tap-to-pick-up with a chooser for piles, 28-slot inventory with stacking, OSRS-style stack counts, examine, drop and drag-to-rearrange. Ground items are not saved. |
| 2 Nov 2026 | v0.5.0: Batch 4 shipped — Attack, Strength, Defence, Hitpoints, Ranged and Magic on the OSRS XP curve to 99; 4 XP per damage plus 1.33 Hitpoints; Accurate, Aggressive, Defensive and Controlled styles; XP drops, level-up popup and sparkles, combat level, skills panel with pixel icons, enemy names coloured by difficulty. |
| 2 Nov 2026 | v0.4.0: Batch 3 shipped — real-time overworld combat on the 0.6 s tick: tap to attack, auto-approach, hit chance and max hit formulas, damage splats, health bars, target panel, auto-retaliate, goblins and an aggressive Goblin Brute that chase, give up, heal and respawn, player death and respawn at home, hitpoint regeneration. Skills stay at level 1 until Batch 4. |
| 2 Nov 2026 | v0.3.0: Batch 2 shipped — 8 villagers with branching dialogue and saved story flags, Route 1 (Thornwood Forest) with stream, bridge, goblin camp, wolf den and Bram's cabin, fade transitions between areas. |
| 2 Nov 2026 | v0.2.0: switched from low-poly 3D to 2D pixel art (canvas renderer, sprites drawn in code, wood-and-parchment UI, joystick). Saves upgrade automatically. |
| 2 Nov 2026 | v0.1.0: Batches 0 and 1 shipped — Brambleford village, camera, movement, run energy, saving with backup codes. Live on GitHub Pages. |
| 2 Nov 2026 | Design v2.0: removed Pokémon-style battles, catching, creature parties and Runelings. Game now uses OSRS-style real-time overworld combat with Emerald-style exploration. Roadmap rebuilt around this. |
