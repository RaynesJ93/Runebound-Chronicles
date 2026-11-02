# RuneBound Chronicles — Roadmap

*Updated 2 November 2026 · matches [GAME_DESIGN.md](GAME_DESIGN.md) v2.3*

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

## Phase 1.5 — Gear and progression (v0.11)

The full gear ladder from [design section 7](GAME_DESIGN.md#gear-and-progression), with RuneBound's own names ([section 14](GAME_DESIGN.md#14-our-names)). Done before skilling, because skilling makes this gear.

| Batch | Name | What's in it | Done when |
| --- | --- | --- | --- |
| G1 | Our names | Rename existing items (Copper, Greyiron, Pine, Rawhide, Gale/Tide/Focus runes), spells (Gale Dart, Tide Dart), styles (Precise, Forceful, Guarded, Balanced; Steady, Quickshot, Farshot) and Hitpoints → Vitality. Save version 3 with a migration, and new save tests | Every name in the game is our own and old saves load with items renamed |
| G2 | The gear ladder | Every tier generated from data: 9 metals × 8 weapons and 9 armour pieces, arrows, 8 woods × shortbow/warbow/staff, 8 hides and 8 cloths × 5 pieces, gem jewellery. Icons and character sprites tinted per tier. Copper and Greyiron available now from Brambleford's new smith and Thornwood drops; Stone and Ember Darts unlocked; early gear rebalanced so each upgrade is felt | You can wear a full Copper or Greyiron set and see it on your character; higher tiers exist in data for later regions |
| G3 | Sets, triangle and guide | Matched-set bonus, combat triangle tuning (monsters with weaknesses shown on examine), Gear guide in the Equipment tab, Trophy ledger | Choosing gear for a monster matters and the next upgrade is always clear |

## Phase 2 — Skilling (v0.2)

1. Woodcutting (Pine and Ashwood in Thornwood) and Fletching (shortbows, warbows, staves, arrows)
2. Mining (Copperdeep Mine: copper, greyiron, cinderstone) and Smithing (bars, then every Copper–Hearthsteel item), with Fine and Masterwork quality
3. Fishing and Cooking (food you make yourself)
4. Crafting (Rawhide/Wolfhide armour, Linen/Woolweave robes, Amber jewellery) and Runebinding (Gale, Tide, Stone, Ember and Focus runes)
5. Bank tabs and search

## Phase 3 — Quests and new regions (v0.3)

1. Quest journal and quest system (stages, flags, rewards)
2. First main-story quest that unlocks the second town
3. Second town, two more routes, a cave
4. New enemy families and the Hearthsteel, Dusksteel and Moonsilver tiers; Lance spells
5. Specialist shops in the new town

## Phase 4 — Dungeons and bosses (v0.4)

1. First multi-floor dungeon
2. Boss fight with telegraphed attacks and phases
3. Rare-drop table expansion and the Trophy ledger
4. Devotion and Athletics skills; Fervour strikes on rare weapons

## Phase 5 — Endgame (v1.0)

1. Wilderness area with harsher death rules
2. Endgame tiers (Emberite to Starmetal, Wyrmscale, Ashforged), Surge and Cataclysm spells, and bosses
3. Mastery mantles at 99
4. Balance pass across all skills, XP rates and drop rates

## Changelog

| Date | Change |
| --- | --- |
| 2 Nov 2026 | Design v2.3: gear and progression system — three gear families with a combat triangle, 9 metal tiers (Copper to Starmetal) plus boss tiers, 8 woods, hides and cloths, our own runes and spells (Dart, Lance, Surge, Cataclysm), craft quality, matched sets, trophies, and a names list (section 14). New Phase 1.5 with batches G1–G3. |
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
