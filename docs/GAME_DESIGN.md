# RuneBound Chronicles — Game Design Document

*Version 2.2 · Updated 2 November 2026 · 2D pixel art; supersedes the original creature-battler concept*

## 1. Vision

RuneBound Chronicles is a browser-based, 2D pixel-art fantasy RPG that plays on desktop and iPhone.

It combines two things:

| Taken from | What we keep |
| --- | --- |
| **Pokémon Emerald** | Overworld exploration, the fixed angled top-down camera, grid-based movement, towns linked by routes, NPC dialogue, story progression that gates regions |
| **Old School RuneScape** | Real-time tick-based combat in the overworld, roaming enemies, loot drops, combat XP, skilling, equipment, banking, a 28-slot inventory, quests, long-term progression to level 99 |

### Direction change (v2.0)

The original concept had a Pokémon-style battle system. **It has been removed in full.** The game must never contain:

- Turn-based battles or a separate battle screen
- Random encounters
- Creature catching, taming or collecting
- Creature parties or companions that fight for you
- Runelings (removed entirely)

The player fights personally, in the world, with their own weapons and spells.

### Design pillars

1. **The world is the battlefield.** Combat, loot and skilling all happen on the same map you walk around.
2. **Readable at a glance.** You can see every enemy before it sees you. Health bars, hitsplats and ground loot are clear on a phone screen.
3. **Slow, steady, earned progression.** OSRS-style XP curve, gear upgrades and rare drops give long-term goals.
4. **Fair, not punishing.** Death costs something, but never wipes hours of progress.
5. **Small batches, no lost saves.** Every update keeps old saves working.

## 2. Core gameplay loop

1. Explore the world.
2. Find enemies and resources.
3. Kill monsters for XP and loot.
4. Gather resources through skilling.
5. Sell, bank or craft with collected items.
6. Upgrade weapons and armour.
7. Complete quests and unlock regions.
8. Fight stronger enemies and bosses.
9. Progress towards level 99 skills and rare endgame equipment.

Short loop (minutes): walk into an area → fight → loot → eat → repeat until inventory is full.
Medium loop (an evening): bank, sell, buy or craft an upgrade, push into the next area.
Long loop (weeks): quests, new regions, bosses, 99s, rare drops.

## 3. World and exploration

### Camera and movement (Emerald style)

- **Camera:** 2D top-down view with the 3/4 perspective of Emerald (you see the tops and fronts of things), follows the player, no rotation. The world is drawn at 16 px per tile and scaled by whole numbers so pixels stay crisp; a few zoom steps are allowed (mouse wheel, pinch, or Settings).
- **Movement:** tile grid. The player moves tile to tile with smooth interpolation, four directions with keyboard/D-pad, eight-direction pathing when clicking/tapping a destination.
- **Click/tap to move:** A* pathfinding over the tile grid; a marker shows the destination.
- **Run toggle:** walking is 1 tile per tick, running is 2 tiles per tick, using a run-energy bar that refills while walking or standing.
- **Collision:** buildings, trees, water, fences and NPCs block tiles. Doors and ledges are special tiles.
- **Map transitions:** walking off a route edge or through a door loads the connected area with a short fade (no separate screen for anything else).

### Region structure

The world is a graph of connected areas, each a hand-built tile map.

| Area type | Purpose | Examples |
| --- | --- | --- |
| Town / village | Safe zone: bank, shops, NPCs, quests, respawn point | Starting village (Brambleford — working name) |
| Route | Paths between towns, low–mid enemies, trees, rocks, fishing spots | Thornwood |
| Forest | Dense woodland, wolves, woodcutting | Thornwood |
| Mine | Ore rocks, dwarves, low light | Copperdeep Mine |
| Cave | Linked tunnels, darkness, stronger enemies | — |
| Dungeon | Multi-floor, bosses, rare drops, quest-locked | — |
| Wilderness | High-risk area with harsher death rules and best rewards | The Ashlands (endgame) |

Regions unlock through quests, skill or combat level requirements, or key items (Emerald-style "HM" gates are replaced by quest and skill requirements, e.g. "Woodcutting 15 to clear the fallen log").

### NPCs and story

- NPCs stand or wander on set paths. Tap/click to talk.
- Dialogue boxes in the Emerald style at the bottom of the screen, with choice options.
- A main story questline drives you from region to region; side quests reward XP, items and access.

## 4. Combat system

All combat happens directly in the overworld. There is no battle screen.

### The game tick

- The game runs on a **0.6 second tick**, like OSRS. Movement, attacks, regeneration, enemy AI decisions and respawns all happen on ticks.
- Rendering runs at full frame rate and interpolates between ticks, so it still looks smooth.

### Starting a fight

1. Enemies roam visibly within their spawn area.
2. The player clicks or taps an enemy (desktop also gets a right-click menu: Attack / Examine).
3. The character paths to attack range automatically: adjacent for melee, the weapon's range for ranged and magic.
4. Once in range, the character attacks automatically on every attack cycle until the target dies, the player moves away, or the player clicks something else.

### Attack speed

Each weapon has an attack speed in ticks.

| Weapon type | Speed (ticks) | Seconds |
| --- | --- | --- |
| Dagger / scimitar | 4 | 2.4 |
| Sword / mace | 5 | 3.0 |
| Two-handed sword / battleaxe | 6–7 | 3.6–4.2 |
| Shortbow | 4 | 2.4 |
| Longbow | 6 | 3.6 |
| Spells | 5 | 3.0 |

### Combat styles

The player switches between **melee, ranged and magic** by equipping the right weapon (and ammo or runes). Each weapon then offers styles:

| Style | XP goes to | Effect |
| --- | --- | --- |
| Accurate | Attack (melee) / Ranged / Magic | +3 effective attack level |
| Aggressive | Strength (melee) | +3 effective strength level |
| Defensive | Defence | +3 effective defence level |
| Controlled | Attack, Strength, Defence split | +1 to each |
| Rapid (ranged) | Ranged | Attack speed −1 tick |
| Longrange (ranged/magic) | Ranged or Magic + Defence | +2 range |

Every damaging hit also gives Hitpoints XP.

### Ranged and magic (first release)

- **Bows** fire arrows from the ammo slot, up to 7 tiles (9 on Longrange), and need a clear line of sight (trees, rocks and walls block shots; water doesn't). About 60% of arrows land under the target and can be picked up again.
- **Staves** cast the spell chosen in the Combat tab on every attack, using its runes from the bag. Range 8 tiles.

| Spell | Magic level | Max hit | Runes | Base XP |
| --- | --- | --- | --- | --- |
| Wind Strike | 1 | 2 | 1 air, 1 mind | 5.5 |
| Water Strike | 5 | 4 | 1 water, 1 air, 1 mind | 7.5 |

Magic gives the base XP per cast plus 2 per damage. Arrows and spells take a moment to fly; damage lands when they arrive.

### Feedback

- **Hitsplats:** a red splat with the number for damage, a blue splat with 0 for a miss. Up to 4 stack on one target.
- **Health bars:** green over red, shown above anyone who has been hit, hidden after ~6 seconds out of combat.
- **XP drops:** small "+12 Strength" text floats up near the top right of the screen.
- **Projectiles:** arrows and spells travel visibly from caster to target; damage lands on impact.

### Enemy behaviour

| Behaviour | Rule |
| --- | --- |
| Roaming | Wander randomly within a set radius of their spawn point |
| Aggression | Aggressive enemies attack players whose combat level is below roughly twice the enemy's level, if the player comes within their aggro radius. Passive enemies only fight back |
| Retaliation | Any attacked enemy fights back. The player auto-retaliates too (toggle in settings) |
| Chasing | Enemies follow the player while in combat |
| Disengaging | If the player gets more than a set number of tiles away from the enemy's spawn area (leash range), the enemy gives up, walks home and heals to full |
| Respawn | Dead enemies respawn at their spawn point after a set number of ticks |

### Hit chance and damage (OSRS-inspired formulas)

These keep combat consistent and let equipment matter. All values are rounded down.

**Effective level** = (skill level × potion/boost multiplier) + style bonus + 8

**Attack roll** = effective attack level × (equipment attack bonus + 64)

**Defence roll** = effective defence level × (equipment defence bonus vs that style + 64)

**Hit chance:**
- If attack roll > defence roll: 1 − (defence roll + 2) / (2 × (attack roll + 1))
- Otherwise: attack roll / (2 × (defence roll + 1))

**Max hit (melee)** = 0.5 + effective strength × (strength bonus + 64) / 640

**Max hit (ranged)** uses Ranged level and ranged strength bonus the same way. **Magic** max hits are set per spell, boosted by magic damage bonus on gear.

A failed roll is a miss (blue 0 splat). A successful hit does a random 1 to max hit damage, so every hit that lands counts.

Enemies use the same formulas, with their own stats defined in data.

## 5. Combat skills and progression

### Skills (first release)

| Skill | What it does | How you train it |
| --- | --- | --- |
| Attack | Melee accuracy; unlocks weapons | Melee on Accurate or Controlled |
| Strength | Melee max hit | Melee on Aggressive or Controlled |
| Defence | Reduces chance to be hit; unlocks armour | Defensive style |
| Hitpoints | Health pool (1 HP per level) | Any damage dealt; starts at level 10 |
| Ranged | Ranged accuracy and damage; unlocks bows and ranged armour | Ranged weapons |
| Magic | Magic accuracy; unlocks spells and staves | Casting combat spells |

All skills go to **level 99**. Non-combat skills arrive later (see section 9).

### XP curve

The XP needed for level *L* is:

```
XP(L) = floor( (1/4) × Σ from n=1 to L−1 of floor( n + 300 × 2^(n/7) ) )
```

This is the OSRS curve: level 2 needs 83 XP, level 50 needs about 101,000, level 92 needs about 6.5 million (half of 99), and level 99 needs about 13.03 million. Max XP per skill is capped at 200 million.

### XP rate: 5×

*Changed 2 Nov 2026:* all XP in the game is multiplied by **5** (`XP_RATE` in `src/skills/skills.js`). The XP figures in this document and in the data files are the base rates before the multiplier; for example a pine log gives 25 × 5 = 125 Woodcutting XP, and each point of melee damage gives 4 × 5 = 20 XP.

### Combat XP rates

- Melee, ranged and magic: **4 XP per damage dealt** to the chosen skill(s).
- Hitpoints: **1.33 XP per damage dealt**.
- Magic also gives a small base XP per cast, even on a miss.
- Defensive/longrange styles split XP as shown in the styles table.

### Combat level

```
base   = 0.25 × (Defence + Hitpoints)
melee  = 0.325 × (Attack + Strength)
ranged = 0.325 × floor(1.5 × Ranged)
magic  = 0.325 × floor(1.5 × Magic)
combat level = floor( base + max(melee, ranged, magic) )
```

A new character (all 1s, Hitpoints 10) is combat level 3. A maxed character is level 113 (there is no Prayer skill yet, so it tops out lower than OSRS's 126).

Enemy names show their combat level, coloured green (weaker), yellow (similar) or red (stronger) relative to the player.

## 6. Enemies and loot

### First-release enemies

| Enemy | Level | HP | Behaviour | Where |
| --- | --- | --- | --- | --- |
| Essence golem | 12 | 24 | Passive; six spread thinly across Whispering Vale; 4–12 rune essence every kill, air runes (8–20) 1/2, mind runes (5–15) 1/3, water runes (4–12) 1/3, rolled separately | Whispering Vale |
| Cow | 2 | 8 | Passive, stays in its field; bones and cowhide every kill, raw beef 1/2 | Cow field, Brambleford |
| Chicken | 1 | 3 | Passive, stays in its pen; bones every kill, raw chicken 1/2 and 5–15 feathers 1/2, rolled separately | Wyn's chicken pen, Brambleford |
| Goblin | 2 | 5 | Passive, roams in groups of 3–5 | Thornwood goblin camp |
| Goblin Brute | 5 | 12 | Aggressive to low levels | Thornwood goblin camp |
| Wolf | 7 | 14 | Aggressive, fast, chases further | Forest route |
| Alpha Wolf (mini-boss) | 14 | 40 | Aggressive, rare spawn, always drops something good | Deep forest clearing |

### Loot tables

Each enemy has its own loot table, defined in data files:

- **Always:** guaranteed drops (e.g. bones on every kill).
- **Each table:** every entry rolls on its own, so a kill can give several of them or none (chickens use this).
- **Main table:** one roll per kill, weighted (coins, low-tier weapons, runes, arrows, food, crafting materials).
- **Rare table:** separate small chance (e.g. 1/128), rare items and higher-tier gear.
- **Unique rares:** per-enemy signature drops (e.g. Wolf Pelt Cloak from Alpha Wolf at 1/64).

Example — Goblin:

| Item | Quantity | Chance |
| --- | --- | --- |
| Bones | 1 | Always |
| Coins | 1–15 | 1/3 |
| Bronze dagger | 1 | 1/16 |
| Goblin mail | 1 | 1/32 |
| Air runes | 4–8 | 1/12 |
| Bronze arrows | 3–10 | 1/10 |
| Goblin war-charm (rare) | 1 | 1/256 |

### Ground items

- Drops appear on the tile where the enemy died as small item sprites with a name label.
- **Players must pick loot up manually** (tap the item, or right-click > Take on desktop).
- Several items on one tile open a small list to choose from.
- Drops stay for 2 minutes, then disappear. Items the player drops stay for 3 minutes.
- A "loot beam" effect marks rare drops.

## 7. Items, inventory, equipment and economy

### Inventory

- **28 slots** in a 4 × 7 grid.
- **Stacks** (changed in v0.17.0): logs, ores, bars, essence, raw and cooked food, burnt food, hides and leather stack to **20** per slot; arrows, runes, arrowtips, arrow shafts, feathers, bait and thread stack to **999** per slot; coins stack without limit. Weapons, armour, tools, bones and potions don't stack. More than a stack's worth starts a new slot. Eating takes one item from a stack. The bank stacks everything without limit.
- Actions: Use, Equip/Wield, Eat/Drink, Drop, Examine. Drag to reorder.
- Tapping (or left-clicking) an item does its main action: eat, drink, wield or wear. Long-press (or right-click) shows every option. A setting makes every tap open the menu instead.

### Equipment slots

Head, Cape, Neck, Ammo, Weapon, Body, Shield, Legs, Hands, Feet, Ring.

Each item has stats in data: attack bonuses (stab, slash, crush, ranged, magic), defence bonuses for each, melee strength, ranged strength, magic damage, attack speed, and level requirements. The equipment screen shows totals.

### Gear tiers (combat)

| Tier | Requirement | First source |
| --- | --- | --- |
| Bronze | 1 | Shop, goblin drops |
| Iron | 5 | Shop, drops |
| Steel | 10 | Later shops, smithing |
| Mithril → Adamant → Rune | 20 / 30 / 40 | Later regions |
| Endgame tiers | 60+ | Bosses, rare drops |

Ranged gear follows the same idea (leather → hide armour, shortbow → oak → willow …). Magic uses staves and robes.

### Food and potions

- **Natural healing:** out of combat (6 seconds after your last hit), you regain 1 hitpoint every 6 seconds. There is no healing during a fight, so food matters.
- **Food** heals a set amount and takes 3 ticks to eat (it delays your next attack). Examples: Bread (3), Shrimp (3), Trout (7), Salmon (9).
- **Potions** give temporary effects, with 4 doses per potion:
  - Attack/Strength/Defence potion: boosts the level by 3 + 10%, then wears off 1 level per minute
  - Ranging/Magic potion: same for ranged/magic
  - Antipoison: cures poison and gives immunity for a while (poison arrives with later enemies)

### Bank

- **Bank notes** were removed in v0.17.0, replaced by stacks: essence golems drop normal essence, and any notes in old saves turned into real essence (anything that didn't fit went to the bank).

- Found in every town. Opened by talking to the banker or clicking the bank booth.
- Hundreds of slots, every item stacks in the bank.
- Deposit all / deposit inventory / deposit equipment / withdraw 1, 5, 10, X, All.
- Tabs and search arrive in a later batch.

### Shops

- Each town has a general store plus specialist shops (weapons, armour, magic, food).
- Shops buy and sell; prices shift slightly with stock levels, like OSRS. At normal stock you pay the item's value and the shop pays about 35% of it; every item above or below normal stock moves the price 3%. Stock drifts back to normal every 15 seconds.
- Coins are the currency.

## 8. Death and its consequences

Death should sting without ruining a session.

**Normal areas:**
1. You respawn at the last town you visited, at full health.
2. You **keep your 3 most valuable items** automatically.
3. Everything else is left at the place you died in a **gravestone** that lasts **15 minutes** of play time.
4. Return to the gravestone to reclaim everything for free in the first 5 minutes, or for a small coin fee after that (10% of the items' value, at least 10 and at most 1,000 coins). Worn items go back on if the slot is empty. A new death replaces an older gravestone.
5. If the timer runs out, the items are lost.
6. XP and levels are never lost.

**Wilderness (endgame):** you keep only 3 items, and there is no gravestone. The risk is shown clearly before you enter, with a warning screen.

Dying in tutorial or story-critical fights never costs items.

## 9. Skilling, crafting, quests and long-term progression

Woodcutting, Fletching, Mining, Smithing, Fishing and Cooking are in the game (v0.13.0). The rest are planned, and listed so the systems built now leave room for them.

### Woodcutting and Fletching (shipped in v0.11.0)

**Woodcutting.** Tap a tree to walk up and chop it. You swing every 4 ticks (2.4 s); each swing has a chance to give a log, which rises with your level and a better axe. An axe works from your bag or in your hand.

| Tree | Level | XP per log | Base chance per swing | Falls |
| --- | --- | --- | --- | --- |
| Pine tree | 1 | 25 | 34% | After 1 log; grows back in 15–27 s |
| Oak tree | 15 | 37.5 | 20% | 1 in 8 chance per log; grows back in 24–42 s |

Each level above the tree adds 1.2% to the chance per swing. Axes: bronze (Woodcutting 1) and iron (Woodcutting 5, +10%). Bram gives you a bronze axe and a knife when you ask him to teach you; Pell sells both axes. A fallen tree shows as a stump until it grows back. Moving, fighting or tapping elsewhere stops you chopping; a full bag stops you too.

**Fletching.** Tap logs (or the knife) to open the fletching menu, then pick what to make. It keeps going until you run out of materials.

| Make | Level | From | XP |
| --- | --- | --- | --- |
| 15 arrow shafts | 1 | Logs + knife | 5 |
| Shortbow | 5 | Logs + knife | 10 |
| Longbow | 10 | Logs + knife | 20 |
| 30 arrow shafts | 15 | Oak logs + knife | 10 |
| Oak shortbow | 20 | Oak logs + knife | 33 |
| Oak longbow | 25 | Oak logs + knife | 50 |
| Headless arrows (up to 15 at a time) | 1 | Arrow shafts + feathers | 1 each |
| Bronze arrows (up to 15 at a time) | 1 | Headless arrows + bronze arrowtips | 1.3 each |

Feathers and bronze arrowtips come from Pell; goblins also drop feathers. Longbows shoot 9 tiles but take 6 ticks per shot; oak bows need Ranged 5 and have +14 ranged attack (normal bows +8). Bows are ready to use straight away (bowstrings arrive with Crafting).

### Mining and Smithing (shipped in v0.12.0)

**Copperdeep Mine** opens at the end of Thornwood's north-west road now the rockslide is cleared. It has three parts:
- an entrance hall with the miners' furnace and anvil, and Dorrin the Miner
- a west gallery of copper and tin
- an east gallery of iron, where tunnel goblins (level 4) have moved in

Dorrin gives you a bronze pickaxe and a hammer when you ask him to teach you; Pell sells both, plus an iron pickaxe.

**Mining** works like woodcutting: tap a rock, swing every 4 ticks, and the chance per swing rises with level (+1.2% a level) and pickaxe (iron +10%, needs Mining 5). A rock empties after every ore and refills shortly after.

| Rock | Level | XP | Base chance | Refills in |
| --- | --- | --- | --- | --- |
| Copper | 1 | 17.5 | 38% | 2.4–4.2 s |
| Tin | 1 | 17.5 | 38% | 2.4–4.2 s |
| Iron | 15 | 35 | 30% | 5.4–9 s |

**Smelting** at the furnace (4 ticks each, keeps going until you run out):

| Bar | Level | Ore | XP |
| --- | --- | --- | --- |
| Bronze | 1 | 1 copper + 1 tin | 6.2 |
| Iron | 15 | 1 iron | 12.5 — succeeds 50% of the time at level 15, +1% a level, up to 80%; the ore is lost on a failure |

**Smithing** at the anvil needs a hammer. With both kinds of bar, the anvil asks which metal first.

| Item | Bronze level | Iron level | Bars | XP (bronze / iron) |
| --- | --- | --- | --- | --- |
| Dagger | 1 | 15 | 1 | 12.5 / 25 |
| Axe | 1 | 16 | 1 | 12.5 / 25 |
| Pickaxe | 2 | 17 | 1 | 12.5 / 25 |
| Med helm | 3 | 18 | 1 | 12.5 / 25 |
| Sword | 4 | 19 | 1 | 12.5 / 25 |
| 15 arrowtips | 5 | 20 | 1 | 12.5 / 25 |
| Sq shield | 8 | 23 | 2 | 25 / 50 |
| Chainbody | 11 | 26 | 3 | 37.5 / 75 |

New gear: iron sword, iron med helm, bronze and iron sq shields, bronze and iron chainbodies (iron needs Attack/Defence 5), and iron arrows (ranged strength 10; Fletching 15 from iron arrowtips). Shields show their metal on your character.

### Runecrafting and Whispering Vale (shipped in v0.16.0)

**Thornwood** (112 × 96 tiles, v0.18) replaced the old Route 1: one big open zone instead of a corridor, in daylight. Roads meet at a stone crossroads with a well: south to Brambleford, north-west to Copperdeep Mine, east to Whispering Vale, west to the goblin camp. A stream with fishing spots winds across the south, with a bridge on the road.

- **Goblin territory** (west): a palisaded camp with tents, a cooking campfire, a war totem and the goblin chief's hut (locked for now). 8 goblins and 2 brutes.
- **Wolf hills** (north-east): open rocky ground scattered with bones, 6 wolves, and the alpha wolf at the mouth of its den in a rock face.
- **Bram's cabin** south-east of the bridge, with practice pines; the **oak grove** to the east; the **lake** and **hunters' camp** (fire, three fishing spots) to the south-west.
- **Points of interest for later quests**: the ruined watchtower, the hermit's hut, a sealed cave (boulders, something breathing inside), the old graveyard, an abandoned farmstead ("they came at night"), a stone shrine with an empty altar, a wrecked merchant's cart with goblin footprints, and a fairy ring.

Saves from before v0.18 that were standing in the old Route 1 (or left a gravestone there) are moved to the south road by Brambleford, since the old positions don't match the new map.

**Whispering Vale** (72 × 60 tiles) lies east of Thornwood. It looks like nowhere else: it is always night there, and only glowing things give light: the altars cast pools of coloured light, the campfire and lanterns flicker, the essence crystals, glowing mushrooms and ghost-flowers glow faintly blue, and a small circle of light follows you. The grass is dead blue-green, the earth grey-violet, the water murky; twisted dead trees and purple gloom trees replace the forest, with thorny black shrubs, crystal shards in the ground and wisps of light drifting through the air. (The light map is worked out at a quarter of the screen's resolution so it stays cheap on phones.) To get there, follow Thornwood's east road from the crossroads to the map's east edge. It's quiet: six essence golems wander its meadows, but they never attack first.
- **Essence quarry** (north-west): a rocky pit of essence crystals. Mine them with any pickaxe for rune essence (Mining 1, 5 XP, 60% a swing); they never run dry.
- **Runekeeper's camp** (middle): Aldric the Runekeeper, a tent, a cooking fire, and the runekeepers' **supply chest**, an iron-banded camp trunk that opens your bank.
- **Air altar** (north-east): a pale pedestal on a windswept stone dais, with a great swirl of wind above it.
- **Mind altar** (south-east): a dark stone with a burning orange eye, on a ring of glowing runes, inside a circle of standing stones.
- **Water altar** (south-west): a blue stone fountain on a platform by a lake.

**Runecrafting.** Tap an altar with essence in your bag: after a moment, every piece of essence becomes runes at once (an animation shows streams of rune-coloured light flowing into the altar).

| Altar | Level | XP per essence | Extra rune per essence at |
| --- | --- | --- | --- |
| Air | 1 | 5 | 11, 22, 33, 44, 55, 66, 77, 88, 99 |
| Mind | 2 | 5.5 | 14, 28, 42, 56, 70, 84, 98 |
| Water | 5 | 6 | 19, 38, 57, 76, 95 |

### Crafting (shipped in v0.15.0)

**Hilda the Tanner**, by the cow field in Brambleford, gives you a needle and 20 thread when you ask her to teach you. Pell sells more of both.

**Tanning.** Tap Hilda's tanning rack with cowhides in your bag (every cow drops one):

| Makes | Level | From | XP |
| --- | --- | --- | --- |
| Leather | 1 | 1 cowhide | 2 |
| Hard leather | 10 | 1 cowhide | 4 |

**Sewing.** Tap leather (or the needle) to choose what to sew. Each piece uses 1 leather and 1 thread, needs a needle, and keeps going until you run out.

| Item | Level | XP | Notes |
| --- | --- | --- | --- |
| Leather gloves | 1 | 13.8 | +1 ranged attack |
| Leather boots | 7 | 16.25 | |
| Leather cowl | 9 | 18.5 | Head; +1 ranged attack |
| Leather vambraces | 11 | 22 | Hands; +4 ranged attack |
| Leather body | 14 | 25 | |
| Leather chaps | 18 | 27 | Legs; +4 ranged attack |
| Hard leather body | 28 | 35 | From hard leather; needs Defence 10; +8 ranged attack, ranged defence +20 |

Animations: scraping the hide on the rack; a needle going in and out of the leather.

### Skilling animations

While you skill, an animation loops for as long as you're working (`src/render/skilling.js`), and the skill's icon floats above your head:
- **Woodcutting / Mining:** the axe or pickaxe (in its metal's colour) swings back and strikes, with wood chips or rock chips and sparks flying.
- **Smithing:** a hammer on the anvil, with sparks.
- **Fishing:** a rod with a line and a bobbing float (yellow fly for lure fishing), or a net dipping in and out of the water; ripples spread.
- **Cooking:** a pan held over the fire, steam rising.
- **Smelting:** embers and smoke rise from the furnace; a glowing bar in your hands.
- **Fletching:** a knife whittling a stick, shavings falling.

### Fishing and Cooking (shipped in v0.13.0)

**Fishing.** Tap a fishing spot (ripples on the water) to fish from the bank until your bag is full. An attempt every 5 ticks (3 s). Each spot is fished one way:

| Spot | Where | Needs | Catches |
| --- | --- | --- | --- |
| Net | Brambleford pond | Small fishing net | Shrimps (level 1, 10 XP), anchovies (15, 40 XP) |
| Bait | Brambleford pond, Thornwood stream and lake | Fishing rod + 1 fishing bait per fish | Sardines (5, 20 XP), herring (10, 30 XP) |
| Lure | Thornwood stream and lake | Fly fishing rod + 1 feather per fish | Trout (20, 50 XP), salmon (30, 70 XP) |

Each attempt tries the best fish you can catch first (its chance rises 1% a level above it), then the next one down. **Old Finn** by the pond gives you a net, a rod and 30 bait; Pell sells all three rods and nets, and bait. Chickens are a good source of feathers for lure fishing.

**Cooking.** Tap the cooking pit by the pond, or the goblins' campfire or hunters' fire in Thornwood, and pick what to cook; it keeps going until that food runs out. At the level you can first cook something, half of it burns; that drops evenly until the "stops burning" level. Burnt food is ruined and gives no XP.

| Food | Level | XP | Heals | Stops burning |
| --- | --- | --- | --- | --- |
| Shrimps | 1 | 30 | 3 | 34 |
| Chicken | 1 | 30 | 3 | 34 |
| Anchovies | 1 | 30 | 1 | 34 |
| Sardine | 1 | 40 | 4 | 38 |
| Herring | 5 | 50 | 5 | 41 |
| Trout | 15 | 70 | 7 | 50 |
| Salmon | 25 | 90 | 9 | 58 |

### Gathering skills
- **Woodcutting** — trees on routes and in forests (see above)
- **Mining** — ore rocks in mines and caves (see above)
- **Fishing** — spots on rivers, lakes and the coast (see above)

### Production skills
- **Cooking** — raw fish and meat into food (can burn) (see above)
- **Smithing** — ore into bars, bars into weapons and armour (see above)
- **Fletching** — logs into bows and arrows (see above)
- **Crafting** — leather, jewellery, robes
- **Runecrafting** — rune essence into magic runes

### Support skills (later)
- **Prayer** — bury bones for XP, temporary combat boosts
- **Agility** — shortcuts and faster run-energy regen

Every skill uses the same XP curve and goes to 99. Resources respawn after a timer, with chances to succeed improving with level and tools.

### Quests
- A quest journal lists quests as not started / in progress / complete.
- Quests use NPC dialogue, item delivery, kill tasks, simple puzzles and story bosses.
- Rewards: XP lamps, items, coins, and **new region access**.
- Quest points unlock late-game content.

### Endgame goals
- Level 99 in every skill (skill capes)
- Rare boss drops and endgame equipment tiers
- Dungeon bosses with mechanics (telegraphed attacks, phases)
- Collection log of rare drops

## 10. Art direction and controls

### Art direction

*Changed 2 Nov 2026: the game moved from low-poly 3D to 2D pixel art.*

- **Original 2D pixel art** in a cosy farming-RPG style: 16 × 16 px tiles, a 3/4 top-down view, warm saturated colours, and a 1 px dark outline around every sprite so things read clearly on grass.
- Trees, bushes and rocks are built from clusters of shaded blobs lit from the top-left; ground has textured grass with tufts, ragged path edges, cobbled squares and shimmering water.
- Characters are small chibi sprites (16 × 24 px) with 4-direction walking animations.
- Art is moving to a painted pixel-art set (v0.19+): original sprite sheets made for this game, on magenta backgrounds, which `tools/cut_sheets.py` cuts into separate sprites and `tools/build_art.py` shrinks to game scale (16 px tiles, limited palette, dark outline) and packs into one atlas, `assets/art.png` + `art.json` (about 160 KB). The game loads it before it starts; anything not in the atlas, or everything if the atlas fails to load, is still drawn in code. No assets, names or designs are copied from OSRS, Pokémon or any other game.
- Painted so far: trees (oak, pine), bushes, flowers, tall grass, mushrooms, rocks, stumps, log piles, well, market stall, lamps, signposts, scarecrows, crops, tanning rack, cooking pot, campfires, tents, crates, barrels, chests, fence posts and rails; ground textures for grass, paths, cobbles, sand, farm soil, water (two frames), bridges, floors, cave floor and rock walls, with darker ones for Whispering Vale. Ground textures are made seamless and toned down so sprites stand out. Still drawn in code: characters, enemies, animals, buildings, altars, mine props, the vale's plants, and item icons (next batches).
- Readable silhouettes: each enemy type is recognisable at the default zoom.
- UI: wood-framed parchment panels with a pixel font (Pixelify Sans), a virtual joystick on touch screens, and an Emerald-style dialogue box.

### Desktop controls

| Action | Input |
| --- | --- |
| Move | Click a tile, or WASD / arrow keys |
| Attack / interact | Left-click enemy, NPC, item or object |
| Options menu | Right-click (Attack, Examine, Take, Talk-to) |
| Run toggle | R or the run orb |
| Panels | Tabs: Inventory, Equipment, Skills, Combat styles, Quests, Settings (keys 1–6) |
| Zoom | Mouse wheel (limited range) |

### iPhone controls

| Action | Input |
| --- | --- |
| Move | Tap a tile, or an optional on-screen D-pad |
| Attack / interact | Tap |
| Options menu | Long-press |
| Zoom | Pinch (limited range) |
| Panels | Bottom tab bar, panels slide up as sheets |

Touch targets are at least 44 × 44 points. The layout respects the iPhone notch and home bar (safe areas) and works in landscape and portrait. The game should run as a Home Screen web app. The canvas is drawn at no more than 2× pixel density (iPhones are 3×), which looks identical for pixel art and halves the work per frame; a battery saver setting caps drawing at 30 fps.

### Settings

Controls (joystick, what tapping an item does), gameplay (auto retaliate, text speed, XP drops), display (zoom, battery saver), your adventure (play time, levels, monsters defeated, deaths, tiles walked), save backup tools and starting a new game.

## 11. Technical architecture

### Stack (proposed)

- **HTML canvas (2D)** for rendering, plain JavaScript ES modules, no build step and no libraries needed.
- Hosted on **GitHub Pages** from this repository.
- Target: 60 fps on recent iPhones in Safari and as a Home Screen app; 30 fps minimum on older devices.

### Code structure

```
/index.html
/src
  main.js            — boot, game loop
  core/tick.js       — 0.6 s game tick scheduler
  core/state.js      — single game-state object
  core/save.js       — save/load, versioning, migrations
  world/             — tile maps, collision, pathfinding, area transitions
  render/            — pixel-art sprites (painted atlas in art.js, code-drawn fallbacks), ground, buildings, camera, depth sorting, hitsplats, health bars
  entities/          — player, NPCs, enemies, ground items
  combat/            — formulas, attack cycle, styles, projectiles, AI
  skills/            — XP curve, levels, combat level
  items/             — inventory, equipment, bank, shops, food, potions
  ui/                — panels, dialogue, menus, touch controls
/data
  items.json  enemies.json  loot-tables.json  areas/*.json  shops.json  dialogue/*.json
/assets               — textures, sounds
```

Rules:
- **Game logic is separate from rendering.** Combat, XP and loot run on the tick and know nothing about drawing. This keeps it testable and stops frame-rate from affecting gameplay.
- **Content lives in data files**, not code: adding an enemy or item should not need new code.
- **Seeded random numbers** for combat and loot so bugs can be reproduced.

### Saving

- Saves go to the browser's local storage (with IndexedDB as a fallback for larger saves).
- Autosave every 30 seconds, on level-up, on bank close and when the page is hidden.
- Every save has a **schema version number**. Loading an older save runs migration functions step by step, so updates never wipe progress.
- After upgrading, every save is **repaired**: unknown items are removed, broken numbers and settings are reset to defaults. `tests/save.test.mjs` loads a save from every earlier version (run with `node tests/save.test.mjs`).
- Two rotating save slots so a crash during saving cannot corrupt everything.
- **Export / import save** as a text code or file, because iPhone Home Screen apps keep their storage separate from Safari.

## 12. Development roadmap

See [ROADMAP.md](ROADMAP.md).

## 13. Open questions

- Final name of the starting village and the first forest route.
- Portrait, landscape or both on iPhone as the main layout?
- Should Prayer arrive early (it changes the combat level formula and death rules)?
- Multiplayer: single-player only for now — confirm this is the long-term plan.
- Is the proposed death rule (3 items kept + 15-minute gravestone) the right level of risk?
