# RuneBound Chronicles — Roadmap

*Updated 2 November 2026 · matches [GAME_DESIGN.md](GAME_DESIGN.md) v2.0*

The game is built in small batches. Each batch must:

- leave the game playable,
- keep every existing feature working,
- keep every existing save loading (bump the save version and add a migration when the save format changes),
- be tested on desktop **and** iPhone before the next batch starts.

Out of scope, permanently: turn-based battles, battle screens, random encounters, creature catching, creature parties, Runelings.

## Phase 1 — First playable version (v0.1)

| Batch | Name | What's in it | Done when |
| --- | --- | --- | --- |
| 0 ✅ | Project foundation | `index.html`, renderer, game loop, 0.6 s tick, game-state object, save system v1 (versioned, autosave, two slots, export/import), GitHub Pages deploy | Page loads on desktop and iPhone; a save survives a reload |
| 1 ✅ | Starting village + Emerald camera | Tile-map village, top-down follow camera, grid movement (WASD/arrows), tap/click-to-move with A* pathfinding, collision, run toggle and energy | You can walk around the village on both devices |
| 2 ✅ | NPCs and the forest route | Wandering NPCs, Emerald-style dialogue box with choices, inspectable doors, Route 1 (Thornwood) connected to the village with area transitions. Building interiors move to Batch 8 with the bank and shop | You can talk to NPCs and walk to the forest and back |
| 3 ✅ | Overworld combat core | Roaming goblins, tap/click to attack, auto-move into range, timed attack cycles, hit chance and damage formulas, hitsplats, health bars, enemy retaliation, chasing, leashing back to spawn, enemy respawn, player death and respawn | You can fight and kill goblins without any battle screen |
| 4 ✅ | Combat skills and XP | Attack, Strength, Defence, Hitpoints (starts at 10), XP curve to 99, combat styles, XP drops, level-up messages, combat level, skills panel | Killing goblins levels you up and your combat level changes |
| 5 ✅ | Loot and inventory | Loot tables in data, ground items, manual pickup, 28-slot inventory, drop, examine, despawn timers | Goblins drop items you can pick up and manage |
| 6 ✅ | Equipment | 11 equipment slots, wield/wear, stat bonuses feeding the combat formulas, level requirements, equipment panel | Equipping a bronze sword makes you visibly stronger |
| 7 | Ranged, magic and wolves | Shortbow + arrows, staff + runes + basic strike spells, projectiles, style switching, Ranged and Magic skills, wolves (aggressive), Alpha Wolf mini-boss | You can kill wolves with melee, ranged or magic |
| 8 | Food, potions, bank and shop | Eating (3-tick delay), potions with timed boosts, building interiors, village bank (deposit/withdraw), general store (buy/sell, coins), death gravestone rules | Full loop works: fight → loot → bank/sell → buy upgrade |
| 9 | v0.1 polish | Mobile UI pass (safe areas, 44 pt targets, long-press menus), settings, performance pass on iPhone, save migration tests, bug fixes | v0.1 released on GitHub Pages |

## Phase 2 — Skilling (v0.2)

1. Woodcutting (trees on the forest route) and Fletching (bows, arrows)
2. Mining (a small mine area) and Smithing (bars, bronze/iron gear)
3. Fishing and Cooking (food you make yourself)
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
| 2 Nov 2026 | v0.7.0: Batch 6 shipped — 11 equipment slots, wield/wear/remove with swapping, level requirements, attack/defence bonuses by type (stab, slash, crush, ranged, magic), melee strength, weapon speed and attack type feeding the combat formulas, enemies' attack types, equipment tab with bonus table, gear drawn on the character. |
| 2 Nov 2026 | v0.6.1: health now regenerates only out of combat, at 1 hitpoint every 6 seconds (was 1 per minute, even mid-fight). |
| 2 Nov 2026 | v0.6.0: Batch 5 shipped — 11 items with code-drawn icons, goblin and Goblin Brute loot tables with a rare table, loot on the ground (2 min; 3 min for your own drops) with a gold beam for rare drops, tap-to-pick-up with a chooser for piles, 28-slot inventory with stacking, OSRS-style stack counts, examine, drop and drag-to-rearrange. Ground items are not saved. |
| 2 Nov 2026 | v0.5.0: Batch 4 shipped — Attack, Strength, Defence, Hitpoints, Ranged and Magic on the OSRS XP curve to 99; 4 XP per damage plus 1.33 Hitpoints; Accurate, Aggressive, Defensive and Controlled styles; XP drops, level-up popup and sparkles, combat level, skills panel with pixel icons, enemy names coloured by difficulty. |
| 2 Nov 2026 | v0.4.0: Batch 3 shipped — real-time overworld combat on the 0.6 s tick: tap to attack, auto-approach, hit chance and max hit formulas, damage splats, health bars, target panel, auto-retaliate, goblins and an aggressive Goblin Brute that chase, give up, heal and respawn, player death and respawn at home, hitpoint regeneration. Skills stay at level 1 until Batch 4. |
| 2 Nov 2026 | v0.3.0: Batch 2 shipped — 8 villagers with branching dialogue and saved story flags, Route 1 (Thornwood Forest) with stream, bridge, goblin camp, wolf den and Bram's cabin, fade transitions between areas. |
| 2 Nov 2026 | v0.2.0: switched from low-poly 3D to 2D pixel art (canvas renderer, sprites drawn in code, wood-and-parchment UI, joystick). Saves upgrade automatically. |
| 2 Nov 2026 | v0.1.0: Batches 0 and 1 shipped — Brambleford village, camera, movement, run energy, saving with backup codes. Live on GitHub Pages. |
| 2 Nov 2026 | Design v2.0: removed Pokémon-style battles, catching, creature parties and Runelings. Game now uses OSRS-style real-time overworld combat with Emerald-style exploration. Roadmap rebuilt around this. |
