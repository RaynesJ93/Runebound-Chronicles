# RuneBound Chronicles — Game Design Document

*Version 2.4 · Updated 5 November 2026 · 2D pixel art; supersedes the original creature-battler concept*

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
- **Running:** you always run, 2 tiles per tick. Run energy was removed in v0.17.0 and the run/walk button in v0.35.1.
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
- A main story questline drives you from region to region; side quests reward XP, items and access. The main story is **The Runebound** (see section 9, Quests).

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

### XP rate: 12×

*Changed 4 Nov 2026 (was 5× from 2 Nov):* all XP in the game is multiplied by **12** (`XP_RATE` in `src/skills/skills.js`). The XP figures in this document and in the data files are the base rates before the multiplier; for example a pine log gives 25 × 12 = 300 Woodcutting XP, and each point of melee damage gives 4 × 12 = 48 XP. The skill guides show XP with the multiplier applied.

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
- **Stacks** (changed in v0.17.0): logs, ores, bars, essence, raw and cooked food, burnt food, hides and leather stack to **20** per slot (every kind of log, ore and bar, matched by name; v0.51.6 fixed willow–elder logs, and partly filled stacks in the bag merge on load); arrows, runes, arrowtips, arrow shafts, feathers, bait and thread stack to **999** per slot; coins stack without limit. Weapons, armour, tools, bones and potions don't stack. More than a stack's worth starts a new slot. Eating takes one item from a stack. The bank stacks everything without limit.
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
- **Tabs (v0.34.0):** items sort themselves into tabs automatically — All, Weapons, Armour, Ammo & runes, Tools, Ores & bars, Materials, Food & potions, Jewellery & gems (`data/bankTabs.js`). Each tab shows how many kinds of item it holds; empty tabs are greyed. Nothing to set up or drag.
- **Search:** type part of a name to find it anywhere in the bank (search covers every tab). Tabs and search work at the bank and at every supply chest.

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

### Skill review, batch 2: Magic, Runecrafting and Lumenhaven (v0.51.0)

The review found Runecrafting had only three runes and Magic only two spells. Batch 2 adds eight runes, sixteen combat spells, teleports and alchemy, and a new area for the higher altars.

**Runes and altars** (essence → runes; more runes per essence at the listed levels):

| Rune | Runecrafting | XP | Extra rune at | Altar |
| --- | --- | --- | --- | --- |
| Earth | 9 | 6.5 | 26, 52, 78 | Greenmire Rainforest, west clearing (Copperdeep Mine until v0.56.0) |
| Fire | 14 | 7 | 35, 70 | Greenmire Rainforest, east vents (the Sunken Forge until v0.56.0) |
| Body | 20 | 7.5 | 46, 92 | Greenmire Rainforest, the ruin over the stream (Thornwood until v0.56.0) |
| Cosmic | 27 | 8 | 59 | Lumenhaven: an island in the starlit pool |
| Chaos | 35 | 8.5 | 74 | Lumenhaven: the broken temple (west) |
| Nature | 44 | 9 | 91 | Lumenhaven: the great tree glade (north-west) |
| Law | 54 | 9.5 | — | Lumenhaven: the crystal shrine (east) |
| Death | 65 | 10 | — | Lumenhaven: the shadow hollow (far north, deepest) |

**Lumenhaven, the hidden fae city** (inspired by OSRS's Zanaris). Step into the fairy ring in south-east Thornwood (just south of the road; v0.51.5 cleared the trees below it so the whole ring shows) and you're pulled into a hidden realm: always night, lit by glowing toadstools, crystals and fae lanterns; winding paths between still dark pools; a market square of stalls at the centre where you arrive. The five high altars are spread around it, the deadliest furthest in. It's dangerous: three fae monsters roam it, and their drops are the way to get high runes (and extra essence) before you can craft them yourself.

| Monster | Level | HP | Max hit | Attack | Where | Drops (highlights) |
| --- | --- | --- | --- | --- | --- | --- |
| Glimmerwisp | 44 | 48 | 6 | magic | The market and pools | Rune essence (2–5), cosmic, chaos, earth and fire runes, a little nature |
| Fae sentinel | 58 | 70 | 8 | slash | The glade and crystal shrine | Rune essence (3–5), nature, law and cosmic runes, coins, gems |
| Hollow shade | 70 | 90 | 9 | magic | The shadow hollow | Rune essence (3–5), death, law, chaos and nature runes, uncut diamonds |

*v0.51.1:* half as many trees are scattered through the city as at first, so it's more open. All three are aggressive (until you're twice their level, as usual). Placeholder art: recolours of the air elemental, bandit and restless ghost.

**Combat spells** (choose one in the Combat tab while holding a staff):

| Tier | Wind | Water | Earth | Fire | Runes (each) |
| --- | --- | --- | --- | --- | --- |
| Strike | 1 (2) | 5 (4) | 9 (6) | 13 (8) | 1 mind + element |
| Bolt | 17 (9) | 23 (10) | 29 (11) | 35 (12) | 1 chaos + element |
| Blast | 41 (13) | 47 (14) | 53 (15) | 59 (16) | 1 death + element |
| Wave | 62 (17) | 65 (18) | 70 (19) | 75 (20) | 1 death + 1 body + element |

(Magic level, then max hit in brackets.) The element costs grow with the tier, and every spell also needs air runes, as in OSRS.

**Other spells**, in a new "Spellbook" list in the Combat tab (any weapon):

| Spell | Magic | Runes | Does |
| --- | --- | --- | --- |
| Low alchemy | 21 | 1 nature, 3 fire | Turns an item into coins (40% of its value) |
| Brambleford teleport | 25 | 1 law, 3 air, 1 fire | Teleports you to Brambleford square |
| Thornwood teleport | 31 | 1 law, 3 air, 1 water | To the Thornwood crossroads |
| Copperdeep teleport | 37 | 1 law, 1 air, 3 earth | To the mine entrance |
| Vale teleport | 45 | 2 law, 2 air, 2 water | To the Whispering Vale |
| High alchemy | 55 | 1 nature, 5 fire | Turns an item into coins (60% of its value) |

Teleports don't work mid-fight. Alchemy: cast it, then tap the item in your bag. (Jewellery enchanting is left for a later batch.)

Earth and fire runes are also sold in the magic shop.

*v0.51.3, painted art* (the "Lumenhaven Images 01–07" sheets): Lumenhaven has its own ground (`theme: 'fae'`: fae grass, violet paths, moonstone market paving and a starlit pool); painted fae stalls, a well of starlight, fae lanterns, giant toadstools and crystal clusters, all glowing in the dark (decor props can have `light`); the fairy ring you arrive by (v0.51.4: moved up into the open, clear of the edge trees); and a straight bridge of glowing moonstone across the pool to the cosmic island (it replaces the wooden causeway). The eight new altars (two frames: the second glows brighter), the eight new rune icons (spells use them too) and the glimmerwisp, fae sentinel and hollow shade are all painted.

### Animated scenery stays put (v0.57.2)

Animated props (campfires, cooking pits, fishing spots...) used to draw every frame from the first frame's top-left corner. The painted campfire's frames differ in height (taller and shorter flames), so the whole fire hopped up and down. Each frame now lines up by its own anchor (the foot point), so the stones stay still and only the flames move.

### Gear walks with you (v0.57.0)

Painted gear is drawn once per facing, over the standing pose, but the painted player has two walking frames per facing (legs spread, arms swing, the body sways). So gear used to stay still while the body walked under it, with bare legs and arms poking out.

`src/render/gearWalk.js` now bends each gear sprite to the walking frame the body is on, by comparing the body's outline in that frame with the standing one, row by row:

- **Body armour** is stretched from where the body is when standing to where it is in the step.
- **Legs and boots:** each half follows its own leg, so boots step apart instead of stretching into a bar.
- Both are trimmed to the walking body's outline, so leg armour doesn't fill the gap between the legs.
- **Helmets and amulets** move with the head; **weapons, shields and capes** move as one piece with the torso.

Attack and hit poses use the gear as painted. Each bent piece is made once and cached. Tested in tests/gear_walk.test.mjs.

**Covering what's underneath (v0.57.1).** The painted gear doesn't quite cover the painted player (spiky hair poked out round helmets, tunic sleeves showed beside platebodies). With a helmet, body armour, leg armour or boots on, the body's pixels on the rows that piece covers but outside its outline are hidden (a helmet also hides the hair above it). Bare skin (face, hands) and small details set in skin (eyes) stay. `coverBody` in gearWalk.js, cached per body frame and gear combination.

### Greenmire Rainforest (v0.56.0)

A new area south of Brambleford: carry on down the south road over the river bridge and through the tree line (exit at x 40–41, y 53; v0.56.1 cleared the trees there and added a GREENMIRE RAINFOREST signpost). 64 × 56, `data/areas/rainforest.js`, theme `'jungle'`: Brambleford's painted ground recoloured darker and lusher (deep green grass, dark mud paths, mossy paving, green-teal water; `JUNGLE_TEX` in tools/derived.py).

- **Layout:** you arrive in a clearing at the top (sign: GREENMIRE RAINFOREST). A path runs south to a crossroads. West is the **Earth altar** (Runecrafting 9) in a muddy clearing ringed by mossy boulders. East is the **Fire altar** (14) among steaming vents, a lava pool and obsidian. South, over a bridge across the winding stream, is the **Body altar** (20) in an overgrown stone ruin with mossy statues.
- These three altars moved here from Copperdeep Mine, the Sunken Forge and Thornwood. The air, mind and water altars stay in the Vale, and the cosmic and higher ones in Lumenhaven.
- Dense willow, old oak, yew and oak trees (choppable as usual), bushes, tall grass, mushrooms, flowers, mossy boulders and hanging vines. Reeds and lily pads along the stream.
- No monsters yet. On the map as "Greenmire Rainforest" (tab "Rainforest") with the three altars labelled.

### Fishing spots as ripples (v0.55.0)

The painted fishing spots were solid discs with a dark outline, so they sat on the water like a blob. They are now drawn in code (`fishingRipples` in src/render/sprites.js): three rings of foam spread out and fade, bubbles rise at the centre, and a fish tail flicks up now and then (12 frames at 6 a second). No fill or outline, so the water shows through. Each spot is clipped to the water tiles (2 px in from the bank), so the rings never spill onto sand, grass or rock, even in the small slayer cave pool. The Vale gets a teal tint. The painted `fishingSpot` art is no longer used.

### Art loading retries (v0.54.1)

The painted art is one 2–3 MB atlas (`assets/art.png` + `art.json`). If it fails to download, the game falls back to code-drawn placeholder art. Before v0.54.1 one failed download (weak phone signal, or a page opened while an update was going live) meant placeholder art until a reload. Now `loadArt` tries 4 times (waiting 0.8 s, 1.6 s, 2.4 s, bypassing the cache on retries), and if all fail the game says so and asks the player to reload.

### Softer joins between paths and paving (v0.54.0)

Where ground types meet, the edges are built in `src/render/ground.js` (not painted), so this is all code:

- **Paving meets a path:** the outer rows of cobbles break into irregular stone-sized chunks with dirt between them, a few chunks lie loose out in the dirt, and small pebbles are scattered around the entrance, thinning out with distance (`breakPaving`). The road also flares out a little as it reaches the square, like a worn entrance.
- **Paving meets grass:** a lighter version, with grass creeping into the gaps.
- **Path corners:** crossroads and bends get rounded corners instead of square notches (`roundEarth`, a blur of the path, like the paving rounding).
- **Neat (built) squares** such as the Thornwood shrine keep their straight edges against grass, but paths still wear into them where they meet.
- Works in every area and theme (the pebbles take the paving's own colour). Cost: building an area's ground takes about 25% longer (only the boxes around paving are processed).

### Old Bessie, the starter boss (v0.53.0)

Old Bessie lives in her own pen at the east end of Brambleford's cow field (fenced off at x 53, gate in the middle; sign "OLD BESSIE'S PEN"). She's a big toffee-brown cow with horns, a nose ring and a brass bell (painted in v0.53.2, set `bessie` in tools/new_art.py; the cowbell worn facing down is hand-pixelled in tools/sprites).

- **Level 18, 30 HP, needs Slayer 20.** Max hit 3 (crush), slow (6 ticks), not aggressive, respawns in 30 seconds (v0.53.1; was 2 minutes). Shows as a boss on the map and gets the gold boss health bar.
- **Stomp:** every 10 ticks she moos and the ground goes red under you and the four tiles next to you (2 ticks of warning). Step diagonally away; if it lands it hits 0–2. Uses the Grubnak slam code (`mechanics` in data/enemies.js).
- **Balance:** sim: a level 20 with a steel scimitar always wins, losing about a quarter of their HP; level 15 with iron wins 19 in 20. In game, a level 20 in steel who never eats or dodges a stomp ends on 1–13 of 20 HP. Easier than the Alpha Wolf.
- **Drops.** Always bones, **2–5 cowhides** and 2–3 raw beef. Main table (one roll): coins 80–250 (1/5), steel bars 2–4 (1/8), steel med helm and scimitar (1/10 each), steel chainbody (1/12), steel platelegs and kiteshield (1/14 each), steel platebody (1/18), mithril arrowtips 10–25 (1/20), mithril med helm and dagger (1/28 each). Rare roll 1 in 24: **15 cowhides**, a **mithril scimitar** or a mithril sq shield. Unique 1 in 128: **Bessie's cowbell** (neck: +3 all defences, +1 Strength).
- **Slayer task:** Kesta can give "Old Bessies" (3–6 kills) from Slayer 20 and combat 15.

### Skill review, batch 3: dragonstone and ranged hide armour (v0.52.0)

**Dragonstone.** The top gem. Uncut dragonstones drop from ember wyrms (1 in 64) and vinegrasp horrors (1 in 48). Cut with a chisel at **Crafting 55** (137.5 XP). Cast at a furnace with a mould, like the other gems:

| Item | Crafting | XP | Bonus |
| --- | --- | --- | --- |
| Silver dragonstone ring | 70 | 90 | +2 all attack and defence, +1 Strength |
| Silver dragonstone amulet | 72 | 95 | +4 all, +2 Strength |
| Gold dragonstone ring | 76 | 100 | +4 all, +2 Strength |
| Gold dragonstone amulet | 80 | 105 | +8 all, +4 Strength |

**Ranged hide armour, two new tiers** (filling the gap between studded at Ranged 15 and the top bows). Both tan at Hilda's tanning rack; the rack menu only shows the special hides when you carry them. Chaps take 2 leather and bodies 3 (one thread each). Leather and hides stack to 20.

| Tier | Hide from | Tan | Vambraces | Chaps | Body | Wear |
| --- | --- | --- | --- | --- | --- | --- |
| Stalkerhide | Night stalkers (lvl 35, the Hollow), always 1 | Crafting 38 | 40 | 44 | 48 | Ranged 30 (body also Defence 25) |
| Wyrmhide | Ember wyrms (lvl 72, Slayer 60), always 1 | Crafting 57 | 60 | 65 | 72 | Ranged 50 (body also Defence 40) |

Stats: stalkerhide vambraces Ranged +6; chaps Ranged +8, ranged def 12; body Ranged +11, ranged def 32. Wyrmhide vambraces Ranged +9; chaps Ranged +10, ranged def 18; body Ranged +15, ranged def 40. (Studded body: Ranged +8, ranged def 26.)

Art: painted sheets (v0.52.1, set `batch3` in tools/new_art.py, which keys magenta strictly so the violet gems survive). Amulets facing left/right stay recoloured from the ruby amulet.

### Skill review, batch 1: trees, bows, fish and food (v0.50.0)

The skill review (16 Nov 2026) found Woodcutting stopped at 15, bows at Fletching 25, Fishing at 30 and Cooking at 25 (the best food healed 9). Batch 1 takes all four to the high levels. (Batch 2: Magic and Runecrafting; batch 3: Crafting and ranged armour; batch 4: polish.)

**Trees** (any axe; a better axe chops faster):

| Tree | Woodcutting | XP per log | Where |
| --- | --- | --- | --- |
| Willow | 30 | 67.5 | By the river and the lake in Thornwood |
| Maple | 45 | 100 | South-west of the Whispering Vale |
| Yew | 60 | 175 | East of the oak grove in Thornwood |
| Magic | 75 | 250 | By the air altar in the Whispering Vale |
| Elder (rare: one tree) | 90 | 325 | Deep in the Overgrowth, Slayer Caverns |

Higher trees give logs more slowly, last longer before they fall, and take longer to grow back.

**Fletching** (knife), from the new logs:

| Logs | Arrow shafts | Shortbow | Longbow | Bows need Ranged | Bow accuracy |
| --- | --- | --- | --- | --- | --- |
| Willow | 30 (45 shafts) | 35 | 40 | 20 | +20 |
| Maple | 45 (60) | 50 | 55 | 30 | +29 |
| Yew | 60 (75) | 65 | 70 | 40 | +47 |
| Magic | 75 (90) | 80 | 85 | 50 | +69 |
| Elder | 90 (105) | 92 | 95 | 60 | +85 |

As before, shortbows are quick (4 ticks, range 7) and longbows reach further (6 ticks, range 9).

**Fishing**: new spots and two new tools (the lobster pot and harpoon, from the general store):

| Fish | Fishing | XP | Spot (tool) | Where |
| --- | --- | --- | --- | --- |
| Lobster | 40 | 90 | Cage (lobster pot) | The lake by the Hunters' camp |
| Swordfish | 50 | 100 | Harpoon (harpoon) | The lake, and Brambleford's pond |
| Monkfish | 62 | 120 | Deep net (small fishing net) | Brambleford's pond |
| Shark | 76 | 110 | Harpoon (harpoon) | Same harpoon spots (sharks from 76) |
| Cave eel | 85 | 130 | Cave pool (fishing rod and bait) | A pool in the Overgrowth, Slayer Caverns |

**Cooking**:

| Food | Cooking | Heals | XP | Stops burning |
| --- | --- | --- | --- | --- |
| Meat pie (raw beef + bread) | 20 | 6 | 110 | 54 |
| Hunter's stew (raw beef + raw chicken) | 35 | 11 | 117 | 68 |
| Lobster | 40 | 12 | 120 | 74 |
| Swordfish | 45 | 14 | 140 | 86 |
| Monkfish | 62 | 16 | 150 | 92 |
| Shark | 80 | 20 | 210 | 99 |
| Cave eel | 88 | 22 | 230 | 99 |

Art: *v0.50.1*, painted (the "RPG Trees Items Bows Fish" sheets): the five trees, the logs, lobster pot, harpoon, hunter's stew, burnt pie (and stew), all ten bow icons and all ten fish (raw and cooked). Bows in your hand are still recoloured oak bows. tools/derived.py now skips its recoloured icon when a painted one is in tools/sprites, but still derives the held art.

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

### Axes and pickaxes as weapons (v0.37.1)

Axes and pickaxes work from your bag (or in your hand) for Woodcutting and Mining, needing only that skill's level. Wielding one as a weapon needs the same Attack level as other weapons of its metal: bronze 1, iron 5, steel 10, mithril 20, adamant 30, rune 40. The skill guides for Woodcutting and Mining show this, and the Attack guide lists them with the other weapons.

### Mining and Smithing (shipped in v0.12.0)

**Copperdeep Mine** opens at the end of Thornwood's north-west road now the rockslide is cleared. It has three parts:
- an entrance hall with the miners' furnace and anvil, a supply chest linked to the bank (v0.29.1), and Dorrin the Miner
- a west gallery of copper and tin
- an east gallery of iron, where tunnel goblins (level 4) have moved in

Dorrin gives you a bronze pickaxe and a hammer when you ask him to teach you; Pell sells both, plus an iron pickaxe.

**Mining** works like woodcutting: tap a rock, swing every 4 ticks, and the chance per swing rises with level (+1.2% a level) and pickaxe (iron +10%, needs Mining 5). Copper and tin empty after every ore; iron, coal and mithril give a random number of ores before they empty (rolled again each time they refill, v0.29.2), so you can mine them for longer. Every rock refills after a while.

| Rock | Level | XP | Base chance | Ores before it empties | Refills in |
| --- | --- | --- | --- | --- | --- |
| Copper | 1 | 17.5 | 38% | 1 | 2.4–4.2 s |
| Tin | 1 | 17.5 | 38% | 1 | 2.4–4.2 s |
| Iron | 15 | 35 | 30% | 1–5 (random) | 5.4–9 s |

**Smelting** at the furnace (4 ticks each, keeps going until you run out):

| Bar | Level | Ore | XP |
| --- | --- | --- | --- |
| Bronze | 1 | 1 copper + 1 tin | 6.2 |
| Iron | 15 | 1 iron | 12.5 — always works (it could fail until v0.29.3) |

**Smithing** at the anvil needs a hammer. With both kinds of bar, the anvil asks which metal first.

| Item | Bronze level | Iron level | Bars | XP (bronze / iron) |
| --- | --- | --- | --- | --- |
| Dagger | 1 | 15 | 1 | 12.5 / 25 |
| Axe | 1 | 16 | 1 | 12.5 / 25 |
| Pickaxe | 2 | 17 | 1 | 12.5 / 25 |
| Med helm | 3 | 18 | 1 | 12.5 / 25 |
| Mace | 2 | 17 | 1 | 12.5 / 25 |
| Sword | 4 | 19 | 1 | 12.5 / 25 |
| 15 arrowtips | 5 | 20 | 1 | 12.5 / 25 |
| Scimitar | 5 | 20 | 2 | 25 / 50 |
| Longsword | 6 | 21 | 2 | 25 / 50 |
| Full helm | 7 | 22 | 2 | 25 / 50 |
| Sq shield | 8 | 23 | 2 | 25 / 50 |
| Battleaxe | 10 | 25 | 3 | 37.5 / 75 |
| Chainbody | 11 | 26 | 3 | 37.5 / 75 |
| Kiteshield | 12 | 27 | 3 | 37.5 / 75 |
| Platelegs | 16 | 31 | 3 | 37.5 / 75 |
| Platebody | 18 | 33 | 5 | 62.5 / 125 |

**Full bronze and iron sets (v0.26.0).** The mace, scimitar, longsword, battleaxe, full helm, kiteshield, platelegs and platebody complete each metal. Iron pieces need Attack or Defence 5, like the rest of the iron gear.

| Weapon | Type | Speed | Bronze: slash/crush att · str | Iron: slash/crush att · str |
| --- | --- | --- | --- | --- |
| Mace | crush | 4 ticks | crush +6 · str 5 | crush +9 · str 7 |
| Scimitar | slash | 4 ticks | slash +7 · str 6 | slash +10 · str 9 |
| Longsword | slash | 5 ticks | slash +8 · str 8 | slash +11 · str 11 |
| Battleaxe | slash | 6 ticks | slash +8 · str 10 | slash +11 · str 14 |

| Armour | Bronze defence (stab/slash/crush/ranged) | Iron |
| --- | --- | --- |
| Full helm | 4/5/3/4 | 6/7/5/6 |
| Kiteshield | 6/8/7/7 | 9/11/10/10 |
| Platelegs | 8/7/6/7 | 11/10/9/10 |
| Platebody | 15/14/9/14 | 21/20/12/20 |

Plate armour costs a lot of magic and some ranged attack. The new pieces' painted art is made from existing art in `tools/derived.py` (platebody and platelegs from the leather body and chaps in metal colours, the kiteshield and full helm reshaped from the sq shield and med helm, the scimitar and longsword from the sword, the battleaxe from the axe, the mace from the pickaxe's haft and a helm), until they get sheets of their own. The mace, scimitar, longsword and battleaxe use the sword and axe sprites in your hand. Long menus (like the anvil's) now scroll.

**Copperdeep Depths, coal and steel (v0.27.0).** A tunnel at the back of the iron gallery leads down to **Copperdeep Depths**, a deeper cave with coal rocks, more iron, and **cave beasts** (level 20, hard-hitting, attack if you get close). A tunnel leads back up.

| Rock | Level | XP | Base chance | Ores before it empties | Refills in |
| --- | --- | --- | --- | --- | --- |
| Coal | 30 | 50 | 25% | 2–8 (random) | 12–21 s |

**Steel bars** (furnace, Smithing 30): 1 iron ore + 1 coal, 17.5 XP, never fail. **Steel items** (anvil, 37.5 XP a bar; steel gear needs Attack or Defence 10):

| Item | Level | Bars | | Item | Level | Bars |
| --- | --- | --- | --- | --- | --- | --- |
| Dagger | 30 | 1 | | Full helm | 37 | 2 |
| Axe | 31 | 1 | | Sq shield | 38 | 2 |
| Mace | 32 | 1 | | Battleaxe | 40 | 3 |
| Pickaxe | 32 | 1 | | Chainbody | 41 | 3 |
| Med helm | 33 | 1 | | Kiteshield | 42 | 3 |
| Sword | 34 | 1 | | Platelegs | 46 | 3 |
| 15 arrowtips | 35 | 1 | | Platebody | 48 | 5 |
| Scimitar | 35 | 2 | | | | |
| Longsword | 36 | 2 | | | | |

The **steel pickaxe** (Mining 10) and **steel axe** (Woodcutting 10) work 20% faster than bronze; Pell stocks a couple of each. **Steel arrows** (Fletching 30, ranged strength 16) are made from steel arrowtips like the others. Cave beasts drop coal, iron ore, steel bars and the odd piece of steel gear. Coal and steel art is recoloured from the existing art (`tools/derived.py`: steel from iron, coal rocks from copper rocks); cave beasts use their painted sheet.

**Silver, gold and gems (v0.28.0).** Copperdeep Depths also has silver rocks (Mining 20, 40 XP) and gold rocks (Mining 40, 65 XP). Smelt silver bars at Smithing 20 and gold bars at Smithing 40 (one ore each, never fail). Every ore you mine (not essence) has a small chance of an uncut gem as well: about 1 in 80, rising to 1 in 40 at level 99 (sapphire 55%, emerald 28%, ruby 13%, diamond 4%). Cave beasts drop uncut gems too.

**Copperdeep Hollow and mithril (v0.29.0).** A tunnel at the top of the Depths' north cavern leads down to **Copperdeep Hollow**: pitch dark except for lamps and the faint blue glow of mithril. Night stalkers (level 35, fast, aggressive) hunt there. It has mithril rocks, coal and a little gold.

| Rock | Level | XP | Base chance | Ores before it empties | Refills in |
| --- | --- | --- | --- | --- | --- |
| Mithril | 55 | 80 | 16% | 2–8 (random) | 48–78 s |

**Mithril bars** (furnace, Smithing 50): 1 mithril ore + 1 coal (2 coal until v0.29.5), 30 XP, never fail. **Mithril items** (anvil, 50 XP a bar; mithril gear needs Attack or Defence 20): dagger 50, axe 51, mace 52, pickaxe 52, med helm 53, sword 54, 15 arrowtips 55, scimitar 55, longsword 56, full helm 57, sq shield 58, battleaxe 60, chainbody 61, kiteshield 62, platelegs 66, platebody 68 (same bar counts as the other metals).

The **mithril pickaxe** (Mining 20) and **mithril axe** (Woodcutting 20) work 30% faster than bronze. **Mithril arrows**: Fletching 45, ranged strength 22. Night stalkers drop mithril ore, coal, mithril bars and arrowtips, gems and the odd piece of mithril gear. Mithril art is recoloured from the steel art in a dark blue; night stalkers use their painted sheet.

### Mining and Smithing, part 2 (planned)

Rules for everything below: **every bar that needs coal takes exactly one** (iron ore + 1 coal = steel, mithril ore + 1 coal = mithril, adamantite ore + 1 coal = adamant, runite ore + 1 coal = rune). **No golden nuggets** and **no blast furnace**. The prospector outfit can **only** be bought with stardust.

- **Batch E — adamant, rune and the Sunken Forge (v0.32.0).**
  - **The Sunken Forge** lies down a tunnel at the top of Copperdeep Hollow's north-east cavern: an old dwarven forge hall, pitch dark but for braziers and the glow of the ore. It has a supply chest (your bank), adamantite, runite and coal rocks, and the dwarves' great furnace, which has gone cold (fixing it is Dorrin's quest in Batch H).
  - **Forge golems** (level 48, slow, hit hard, aggressive) guard the halls. The **Molten beast** (level 70 mini-boss, respawns after 3 minutes) lairs in the deepest hall.
  - **Rocks:** adamantite (Mining 70, 95 XP, 2–6 ores before it empties) and runite (Mining 85, 125 XP, 1–3 ores, slow to refill).
  - **Bars:** adamant (Smithing 70) and rune (Smithing 85), each **1 ore + 1 coal**, never fail (XP 37.5 and 50).
  - **Items:** everything bronze to mithril has, in adamant (bronze level + 70) and rune (bronze level + 85, capped at 99): weapons, armour, boots, gauntlets, 2h swords, warhammers, spears, arrowtips, dart tips, javelin heads and throwing knives. XP per bar 62.5 (adamant) and 75 (rune). Adamant gear needs Attack/Defence/Ranged 30, rune 40.
  - **Tools:** adamant pickaxe and axe (level 30, 40% faster than bronze), rune pickaxe and axe (level 40, 50% faster). Not sold anywhere: smith them or find them.
  - **Fletching:** adamant arrows 60 and rune arrows 75 (ranged strength 31 and 49); adamant / rune darts 67 / 81, javelins 62 / 77.
  - **Art:** adamant is the steel art recoloured dark green, rune a deep cyan; forge golems are the essence golem in dark iron with molten cracks; the Molten beast is the cave beast in charcoal and lava.
- **Batch F — more to smith (v0.30.0).** For bronze, iron, steel and mithril. Levels below are bronze; iron is +15, steel +30, mithril +50. XP per bar as for the other anvil items (12.5 / 25 / 37.5 / 50).

  | Item | Bronze level | Bars | Makes | Notes |
  | --- | --- | --- | --- | --- |
  | Gauntlets | 3 | 1 | 1 | Hands. Small melee attack and defence |
  | Dart tips | 4 | 1 | 10 | Fletch with feathers into darts |
  | Spear | 5 | 1 | 1 | Stab, 5 ticks, equal stab/slash/crush attack |
  | Javelin heads | 6 | 1 | 5 | Fletch with arrow shafts into javelins |
  | Boots | 6 | 1 | 1 | Feet. Melee defence |
  | Throwing knives | 7 | 1 | 5 | Thrown weapon, ready to use |
  | Warhammer | 9 | 3 | 1 | Crush, 6 ticks, hits hard |
  | 2h sword | 14 | 3 | 1 | Slash, 7 ticks, hits hardest; **two-handed** (no shield) |

  **Thrown weapons** go in the weapon slot as a stack and are their own ammo: each throw uses one, and most can be picked up where they land, like arrows. Darts: range 4, 3 ticks. Throwing knives: range 4, 3 ticks, a bit stronger. Javelins: range 6, 5 ticks, strongest. They need Ranged 1 / 5 / 10 / 20 by metal, and any arrows in your ammo slot don't add to them.

  **Fletching:** darts (dart tip + feather, up to 10 at once) at Fletching 10 / 22 / 37 / 52; javelins (javelin heads + arrow shaft, up to 5 at once) at 3 / 17 / 32 / 47.

  **Steel studs** (Smithing 36, 1 steel bar makes 5) and **studded leather** (Crafting): tap the studs with a leather body (Crafting 26) or leather chaps (Crafting 29) in your bag. Studded body and chaps need Ranged 15 and Defence 15 and sit between hard leather and the next tier.

  A wielded two-handed sword takes your shield off (it goes to your bag); wearing a shield takes a 2h sword off.
- **Batch G — shooting stars and stardust (v0.31.0).**
  - **Shooting stars.** The first star crashes 2–5 minutes into a session; after one is gone, the next comes 10–20 minutes of play later. It lands at one of 20 spots across Brambleford, Thornwood and Whispering Vale, and a message says where ("A shooting star has crashed in Thornwood, near the oak grove!"). It shows on the map and glows in the dark. A star left unmined fades after 30 minutes.
  - **Mining a star.** Stars come in sizes 1–5 (size 3 most often). Each size needs a Mining level and gives stardust and XP per swing; after 25 stardust it shrinks a size, and size 1 crumbles away. You can only mine a star once it is down to a size you can handle.

    | Size | Mining | XP per stardust |
    | --- | --- | --- |
    | 1 | 10 | 12 |
    | 2 | 20 | 22 |
    | 3 | 30 | 26 |
    | 4 | 40 | 32 |
    | 5 | 50 | 47 |

  - **Lyra the Stargazer** stands by Brambleford's square. She tells you where the current star is, and runs a shop that takes **only stardust** (she doesn't buy anything):

    | Reward | Stardust |
    | --- | --- |
    | Prospector helmet (+1% Mining XP) | 240 |
    | Prospector jacket (+2%) | 360 |
    | Prospector legs (+1.5%) | 300 |
    | Prospector boots (+0.5%) | 180 |
    | Coal bag — open for a random 20–60 coal | 15 |
    | Gem bag — open for 3–10 uncut gems at the usual rarities | 40 |

    The full prospector outfit gives +1% more, 6% in all. The outfit is only available from Lyra, and costs 1,080 stardust in all (tripled in v0.40.1). Bags are used up when opened; coal or gems that don't fit in your bag go on the ground.
  - **Gem rocks** (Mining 40, 65 XP) give an uncut gem every time you mine them (sapphire most often, diamond rarely). Two in Copperdeep Depths, two in Copperdeep Hollow.
- **Batch H — saving bars and the Cold Forge (v0.33.0).**
  - **Saving bars:** from Smithing 40, every anvil make has a chance to give one bar back: 2% at 40, rising evenly to 10% at 99. (Smelting is unchanged.)
  - **Quest: The Cold Forge** (needs Smithing 40 and Mining 40 to start). Ask Dorrin if he needs help: the Sunken Forge's great furnace has gone cold. He needs **25 coal**, **5 steel bars** and an **ember core**, which the Molten beast carries; it drops one, guaranteed, while you're on the quest and don't already have one. Hand them in to Dorrin to finish.
  - **Rewards:** the great furnace burns again and works like any furnace (smelt right next to the adamantite and runite); Dorrin's **smith's outfit** — tunic (+2% Smithing XP), trousers (+1.5%), gloves (+1%), boots (+0.5%), and +1% more for the full set, 6% in all; and 1,000 Smithing XP and 500 Mining XP (before the 12× rate).
  - Dorrin's menu tracks the quest: what he still needs, and a reminder once it's done.

Suggested order: F, G, E, H.

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

### Crafting (shipped in v0.15.0; levels lowered and hard leather set added in v0.23.0)

**Hilda the Tanner**, by the cow field in Brambleford, gives you a needle and 20 thread when you ask her to teach you. Pell sells more of both.

**Tanning.** Tap Hilda's tanning rack with cowhides in your bag (every cow drops one):

| Makes | Level | From | XP |
| --- | --- | --- | --- |
| Leather | 1 | 1 cowhide | 2 |
| Hard leather | 6 | 1 cowhide | 4 |

**Sewing.** Tap leather (or the needle) to choose what to sew. Each piece uses 1 leather and 1 thread, needs a needle, and keeps going until you run out.

| Item | Level | XP | Notes |
| --- | --- | --- | --- |
| Leather gloves | 1 | 13.8 | +1 ranged attack |
| Leather boots | 4 | 16.25 | |
| Leather cowl | 6 | 18.5 | Head; +1 ranged attack |
| Leather vambraces | 8 | 22 | Hands; +4 ranged attack |
| Leather body | 10 | 25 | |
| Leather chaps | 13 | 27 | Legs; +4 ranged attack |
| Hard leather gloves | 15 | 28 | From hard leather; +2 ranged attack |
| Hard leather boots | 16 | 29.5 | From hard leather; +1 ranged attack |
| Hard leather cowl | 18 | 31 | From hard leather; needs Defence 5; +2 ranged attack |
| Hard leather body | 20 | 35 | From hard leather; needs Defence 10; +8 ranged attack, ranged defence +20 |
| Hard leather chaps | 22 | 36 | From hard leather; needs Defence 5; +6 ranged attack, ranged defence +6 |

The hard leather gloves, boots, cowl and chaps use the leather pieces' painted art recoloured to hard leather (`tools/derived.py`) until they get sheets of their own.

**Jewellery (v0.28.0).** Pell sells a chisel, a ring mould and an amulet mould.

*Gem cutting* — tap an uncut gem (or the chisel): sapphire 20 (50 XP), emerald 27 (67.5), ruby 34 (85), diamond 43 (107.5).

*Casting* — at a furnace, with a silver or gold bar and a mould in your bag, the furnace offers "Cast jewellery". Silver and gold both make plain rings and amulets and ones set with any of the four gems; silver is easier, gold gives twice the bonus. Rings go in the ring slot and amulets in the neck slot.

| Piece | Silver ring / amulet | Gold ring / amulet | Bonus (silver amulet → gold amulet; rings half) |
| --- | --- | --- | --- |
| Plain | 8 / 12 | 20 / 24 | stab/slash/crush defence +2 → +4 |
| Sapphire | 22 / 24 | 26 / 29 | magic attack +4 → +8, magic defence +2 → +4 |
| Emerald | 28 / 30 | 32 / 35 | ranged attack +4 → +8, ranged defence +2 → +4 |
| Ruby | 35 / 37 | 38 / 42 | melee strength +2 → +4 |
| Diamond | 44 / 46 | 47 / 50 | every attack and defence +2 → +4, strength +1 → +2 |

XP: silver ring 15, amulet 20; gold ring 25, amulet 30; plus 25 / 35 / 45 / 60 for a sapphire / emerald / ruby / diamond. Ores, bars and gems are recoloured from existing art; gems, rings, amulets, moulds and the chisel are drawn in code in the painted style (`tools/jewel_art.py`). Amulets show round your neck.

**Planned expansions** (in order): spinning (flax into bowstrings, sheep's wool into thread), robes for mages (wool woven into cloth), wolf leather; later, silver tiaras and holy symbols once Prayer arrives. Ideas for later: studded leather (with Smithing), pottery.

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

### Map (v0.25.0)

A map button (top right, or M on a keyboard) opens the map of the area you're in, with a pulsing marker for where you are. Tabs along the top (Brambleford, Thornwood, Mine, Vale) show the other areas; inside the shop or bank the map shows Brambleford with you at the door. Zoom in up to 4x with + and − and scroll around; zoomed in, villagers' names show.

The map shows the ground, trees, water and buildings drawn small, and on top: place names (from `data/mapLabels.js`), villagers (yellow dots) and monsters (red; the Alpha Wolf ringed in gold) where they are right now, the ways out to other areas, and icons for the bank and shop, fishing, mining, smithing, cooking, tanning and runecrafting altars. Tap any marker to see what it is. Everything except the place names is read from the area data, so new areas and skilling spots show up by themselves; a new area only needs adding to `MAP_AREAS` and its labels.


*v0.48.3, no overlapping names:* names on the map never overlap. Each is tried where it belongs, then nudged up, down or sideways into free space; if there's no room at that zoom it's hidden until you zoom in. Place names get first pick, then the "To ..." exit names (an exit's arrow always shows, and tapping it gives the name), then people's names (zoomed in). Names can sit partly over icons but never over each other or your marker. Zoomed-out names are a little smaller (`declutterMap` in src/ui/hud.js).
### Slayer (v0.45.0)

A new skill, **Slayer** (1–99), trained only by killing monsters on a task.

**The slayer master: Kesta the Huntress**, at the Hunters' camp by the lake in south-west Thornwood. Ask her for a task and she picks one that suits your combat level (and, later, your Slayer level): "Kill 23 wolves". She also gives you a **slayer gem** the first time, which tells you your task anywhere (tap it in your bag). Kills of the task's monsters count down; each kill gives Slayer XP equal to the monster's hitpoints (base, x12 like all XP). When the task is done you get **slayer points**: 10 per task, 50 for every 10th in a row, 150 for every 50th. Then go back to Kesta for a new one.

| Task | Monsters | Needs Slayer | Needs combat | Kills |
| --- | --- | --- | --- | --- |
| Chickens and cows | chicken, cow | 1 | 1 (not after combat 20) | 10–20 |
| Goblins | goblin, goblin brute, tunnel goblin | 1 | 3 | 15–30 |
| Giant spiders | giant spider | 1 | 6 | 15–30 |
| Wolves | wolf | 5 | 10 | 15–30 |
| Giant crabs | giant crab | 8 | 8 | 15–30 |
| Bandits | bandit | 10 | 10 | 15–30 |
| Cave crawlers | cave crawler (Slayer 10) | 10 | 15 | 20–40 |
| Essence golems | essence golem | 12 | 15 | 15–30 |
| Skeletons and ghosts | skeleton, restless ghost | 15 | 13 | 20–40 |
| Cave beasts | cave beast | 18 | 20 | 20–40 |
| Warren goblins | warren goblin (once the sealed cave is open) | 20 | 22 | 20–40 |
| Air elementals | air elemental | 25 | 24 | 20–40 |
| Bloodbats | bloodbat (Slayer 25) | 25 | 30 | 20–40 |
| Fire imps | fire imp | 30 | 28 | 20–40 |
| Night stalkers | night stalker | 35 | 32 | 20–40 |
| Forge golems | forge golem | 40 | 45 | 20–40 |
| Stone wraiths | stone wraith (Slayer 45) | 45 | 45 | 20–40 |
| Ember wyrms | ember wyrm (Slayer 60) | 60 | 60 | 15–30 |

*v0.49.3:* the health box of the monster you're fighting (name, level colour and health bar; bosses too) sits in the top-left column under the slayer counter, instead of top-centre where it covered the XP drops.

*v0.48.4, task counter:* while you have a task, a small counter sits under the Quests button: the slayer gem, the kills left in big gold numbers and the monster ("12 giant spiders left"). It counts down with a little bump on every task kill, says "Task done!" for a few seconds when you finish, then hides. Tap it to see your task. (Skipping or blocking a task just hides it.)

*v0.48.2:* every task has a Slayer level, rising with its monsters' level, so new tasks open steadily as you level (before, everything but the slayer monsters was Slayer 1). It only decides what Kesta gives you: you can fight regular monsters at any Slayer level. With high combat but a low Slayer level she gives the toughest tasks your Slayer level allows; a task you already have stays yours.

You never get the same task twice in a row, a blocked one, or one more than 25 combat levels below you (unless nothing else is left). Bosses aren't tasks. New monsters add more tasks; slayer-only monsters (v0.47.0) also need a Slayer level.

**Spending points** (talk to Kesta):
- **Skip** your task: 30 points.
- **Block** your task, so she never gives it again: 100 points, up to 4 blocks. You can unblock for free.
- **Kesta's shop:** the **slayer helmet** (300 points; head slot, needs Defence 20; armour like an iron full helm, and **+15% accuracy and max hit against monsters on your task**, with melee, ranged or magic), and a spare **slayer gem** (1 point).
- *v0.48.5:* two more in Kesta's shop:
  - **Superior slayer helmet**: 800 points **plus your slayer helmet** (in your bag; Kesta takes it in part exchange). Head slot, needs **Defence 60**. Stab +25, slash +28, crush +19, ranged +25, magic +1 defence; strength +1; magic −3 and ranged −1 attack; **+20% accuracy and max hit on task**. Better than a rune full helm even off task. Dark rune-blue with the red eye-slit.
  - **Slayer ring**: 150 points. Ring slot, no level needed; +2 stab, slash and crush defence. Tap it (in the bag, or worn) to **check your task** or **teleport** to Kesta's camp or the Slayer Caverns entrance, as often as you like (not mid-fight).
  - *v0.48.6:* both have painted art (the "Slayer Gear" sheet): the helmet is dark rune-blue with a red eye-slit and a crest of fangs, in the bag and worn (all four directions); the ring is green with a claw-set purple slayer gem.
  - *v0.48.7:* the **Hunter's scroll**: 150 points. Read it (tap it) once and every finished task gives **50% more slayer points**, for good: 15 instead of 10, 75 instead of 50 (every 10th), 225 instead of 150 (every 50th). The scroll is used up, and leaves the shop once read (flag `huntersScroll`; stock `hideFlag`). You can only hold one unread.
  - Shop stock can have `needs: <item id>`: that item must be in your bag and is taken when you buy (one at a time).

State: `state.slayer = { task: { id, left, total }, streak, points, blocked: [] }`.

### New monsters (v0.46.0)

Seven monsters fill the gaps between the old ones' levels, each with painted art from the "monsters 01-12" sheets (tools/new_art.py), drops from existing items, and a slayer task with Kesta. Monsters that live where beginners train or quest are not aggressive. Balance check: simulated duels against a player 3 levels higher in an iron helm and shield cost about half to two-thirds of the player's hitpoints, in line with wolves, cave beasts and night stalkers (magic attackers hit a little harder through melee armour).

| Monster | Level | HP | Max hit | Attack | Where | Aggressive | Notable drops |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Giant spider | 9 | 16 | 2 | stab | The ruins round the old watchtower, Thornwood | yes | arrowtips, feathers |
| Giant crab | 11 | 20 | 3 | crush, high defence | The lake shore by the Hunters' camp | no (beginners fish there) | raw shrimps, sardines, trout |
| Bandit | 13 | 22 | 3 | slash | The old farmstead, south-east Thornwood | yes | coins, daggers, hard leather |
| Skeleton | 16 | 26 | 3 | slash | The old graveyard (west side, away from the memorial) | yes | iron arrows, iron shield and sword |
| Restless ghost | 24 | 32 | 4 | magic | The old graveyard | yes | mind, air and water runes |
| Air elemental | 28 | 36 | 4 | magic | Round the air altar, Whispering Vale | no (low-level runecrafters go there) | air runes, rune essence |
| Fire imp | 32 | 38 | 5 | magic | The Sunken Forge | yes | coal, steel bars, mithril ore |

New slayer tasks: giant spiders (combat 6+), giant crabs (8+), bandits (10+), skeletons and ghosts (13+), air elementals (24+), fire imps (28+). Kesta has painted art now too.

### Slayer monsters (v0.47.0)

Four monsters you can only fight with a high enough **Slayer level**. Below it, attacking one says "You need a Slayer level of N to fight the cave crawler", and they leave you alone (they're only aggressive to players who could fight back). Each has a trick of its own and a unique drop. Painted art from the "monsters 01-12" sheets.

| Monster | Slayer | Level | HP | Max hit | Attack | Where | Its trick | Unique drop |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Cave crawler | 10 | 23 | 34 | 3 | stab | Copperdeep Depths (the side caverns) | **Regenerates**: heals 1 HP every 6 ticks, even mid-fight, so hit it hard | none; good for ores and uncut gems |
| Bloodbat | 25 | 38 | 44 | 7 | slash, fast | Copperdeep Hollow | **Drinks blood**: heals by half of every hit it lands on you | **Bloodfang amulet** (1/128): +5 stab/slash/crush accuracy, +6 strength |
| Stone wraith | 45 | 55 | 60 | 7 | magic | Goblin Warrens (the deep side tunnels) | **Stone skin**: stab, slash and ranged hits do half damage; crush and magic do full | **Wraithstone ring** (1/128): +8 magic, +3 to every defence |
| Ember wyrm | 60 | 72 | 90 | 10 | slash | The Sunken Forge (the east hall) | **Fire breath**: every 4th attack is a blast of fire, up to 15, that your magic defence blocks | **Ember scimitar** (1/200): needs Attack 50; better than a rune scimitar (+42 slash, +38 strength) |

Balance check (simulated duels, player 3 levels higher in the best armour they can wear): about half to two-thirds of your hitpoints per kill, like the other monsters — but a stone wraith fought with a scimitar wins most of the time; take crush or magic. Their other drops are better versions of their area's loot (ores, bars, gems, coins, runes). New slayer tasks, which Kesta only gives once you have the Slayer level: cave crawlers (combat 15, Slayer 10), bloodbats (30, 25), stone wraiths (45, 45), ember wyrms (60, 60). Kills give Slayer XP like any monster (its hitpoints), so these are the best Slayer XP at their level.

### The Slayer Caverns (v0.48.0)

A cave system behind Kesta's camp in south-west Thornwood: the mouth is in a rock outcrop just north-east of the Hunters' camp. Inside, one long winding way leads through four sections, one slayer monster each, tougher the deeper you go. Corridors join the sections, and a sign at each section's entrance says what lives there and the Slayer level it needs.

| Section | Monster | Slayer | Feel |
| --- | --- | --- | --- |
| Entrance hall | — | — | Lamps, Kesta's supply crates, a sign: "THE SLAYER CAVERNS. Deeper is deadlier." |
| 1. The Crawling Pit (west) | 6 cave crawlers | 10 | Rubble and old bones |
| 2. The Roost (north-west) | 6 bloodbats | 25 | A high cavern strewn with bones |
| 3. The Wraith Gallery (north-east) | 5 stone wraiths | 45 | Broken pillars and old rune stones |
| 4. The Wyrm's Hearth (east, the deepest) | 4 ember wyrms | 60 | Braziers you can cook on, scorched bones, a gem rock |

- *v0.48.1, painted art:* each section has its own floor and wall textures and six painted decorations (from the "Slayer Caverns 1A–4B" sheets): the Crawling Pit is wet green slate with crawler eggs, shed shells, slime and glowing moss; the Roost is dark guano-streaked rock with bone nests, skull piles and blood pools; the Wraith Gallery is carved grey flagstones with hooded statues, grave slabs, glowing rune pillars and ghost candles; the Wyrm's Hearth is black basalt with glowing cracks, lava pools, ember vents, a scorched egg and a fused hoard. Where two sections meet, the look fades raggedly from one to the other. Puddles, moss, candles and the like can be walked over; lava pools, statues, nests and eggs block the way. Tech: an area can have `zones` (a section number per tile) and `zoneTex` (texture name suffixes, `tex:cave<suffix>` and `tex:rockwall<suffix>`); decorations are `decor` props with `art` (`decor:<key>`), `name`, and `flat` (drawn on the ground).
- You can walk through any section; its monsters only attack you if you have the Slayer level to fight them (below it they ignore you, and you can't attack them).
- The caverns are on the map ("Slayer Caverns" tab). The monsters' old spots (Depths, Hollow, Warrens, Forge) stay too.
- Kesta's tips for these tasks mention the caverns.

### Item pop-ups (v0.51.2)

Gathering and making no longer print a line each time ("You swing your pickaxe at the rock.", "You manage to mine some iron.", "You smelt the ore into a bar."): the animation already shows what you're doing. Instead, what you get pops up as "+1 Iron ore" with its icon, just under its XP drop, top right (`hud.itemDrop`). It covers mining (and gems), woodcutting, fishing, runecrafting ("+20 Cosmic rune"), smelting, smithing (and saved bars), cooking (a burn shows as "+1 Burnt fish"), fletching and crafting. Messages you need to read stay: a full bag, a level or tool you're missing, a rock or tree running out. Hidden with the XP drops if you turn those off.

### Walking through monsters (v0.49.4)

You can walk through monsters (tapping or holding a direction), so a crowd can't corner you. Monsters still don't overlap each other, and villagers still block you (you wait, then go round). Tech: `area.isFree`/`canStep` take `who`; `'player'` ignores monsters in `dynamicBlock` (player moves and the player's pathfinding).

### Slayer gear and the Overgrowth (v0.49.0)

Six new pieces of high-end gear, mostly from slayer monsters, plus a fifth and deepest section of the Slayer Caverns for the best of them.

| Item | Needs | Stats | From |
| --- | --- | --- | --- |
| Crawler-shell boots | Defence 30 | +9 stab/slash/crush, +6 ranged defence | Cave crawler (1/64) |
| Bloodbat gloves | Attack 35 | +6 stab/slash/crush accuracy, +3 strength, +3 stab/slash/crush defence | Kesta's shop, 400 points |
| Wraithbone staff | Magic 45 | Magic weapon: +14 magic accuracy, +5 magic defence, +3 crush | Stone wraith (1/128) |
| Wyrmscale boots | Defence 60 | +13 stab/slash/crush, +10 ranged, +2 magic defence; +2 strength | Ember wyrm (1/128) |
| Hunter's gauntlets | Attack 60 and Defence 60 | +9 stab/slash/crush accuracy, +7 strength, +8 stab/slash/crush and +6 ranged defence | Kesta's shop, 1,500 points |
| **Vine whip** | **Attack 70** | Slash weapon, **speed 3 ticks (1.8 s; a scimitar is 4)**, +62 slash, +12 stab, +40 strength; about 55% more damage than a rune scimitar | Vinegrasp horror (1/256) |

**The vinegrasp horror** (Slayer 70, level 85, 110 HP, max hit 10, slash, an attack every 4 ticks). A knot of thorny vines with a maw. Its trick: **rooting**. Every 5th attack, vines burst from the floor and hold your legs for 3 seconds: you can still fight (and eat), but you can't walk away. Drops: coins, rune bars, runite ore, uncut rubies and diamonds, coal, cooked salmon (2–4; v0.49.5, was oak logs); rare: the vine whip.

**The Overgrowth**: the fifth section of the Slayer Caverns, past the Wyrm's Hearth (a corridor leads on from the hearth's north-east). A cavern choked with roots, moss and thorns, with its own floor and wall look (recoloured for now). 5 vinegrasp horrors. Sign: "THE OVERGROWTH — SLAYER 70". New slayer task: vinegrasp horrors (Slayer 70, combat 70, 15–30 kills).

*v0.49.1, painted art* (the "Vinegrasp RPG Art" sheets): the vinegrasp horror walks in all four directions (a knot of thorny vines with a toothed maw and yellow eyes); all six items have painted icons; the whip and staff are drawn in the hand and both boots on the feet in all four directions (sized like the rune scimitar, apprentice staff and rune boots). *v0.49.2:* the Overgrowth has painted art too (the "Overgrowth Cavern Art" sheets): a floor of dark earth, moss and tangled roots, walls smothered in thorny roots, and six decorations: root arches (2 tiles), thorny tendrils, glowing pods, glowing teal fungus and vine-wrapped bones (walk over), and vine-wrapped boulders.

Enemy field `root: { every, ticks, text }` (every Nth attack holds you in place for that many ticks). Loot `each` entries can be `rare: true` (shown as a rare drop). Placeholder art: recolours of existing gear (and of the stone wraith for the horror) until painted art arrives.

Enemy fields: `slayer` (level needed), `regen: [hp, ticks]`, `drain` (share of damage healed), `resist: { stab, slash, ranged }` (damage multipliers), `breath: { every, maxHit, text }`.

### Lodestones (v0.44.0)

Ancient standing stones the runekeepers raised long ago, one in each main area, that let you teleport between them. They have been dormant since the Goblin War. A short side quest from Aldric, **The Sleeping Stones** (needs Runecrafting 5), wakes them: bring him **20 air runes and 10 rune essence**, and he wakes the Vale's stone and sends you to wake the one in Brambleford's square. Waking it finishes the quest (Runecrafting and Magic XP) and switches the network on.

| Lodestone | Where |
| --- | --- |
| Brambleford | The village square, north of the well |
| Thornwood | By the crossroads |
| Copperdeep Mine | Beside the furnace and anvil |
| The Sunken Forge | The landing at the bottom of the stairs |
| Whispering Vale | By the runekeepers' camp |
| Goblin Warrens | The landing (once the sealed cave is open) |

- *v0.47.2:* finishing the quest opens **every** lodestone at once (it used to be one at a time, by walking to each and touching it). The Goblin Warrens stone joins the list once the sealed cave is open (`needs: 'caveOpen'`).
- Touch any awake lodestone to open the list of the others and pick one. You arrive standing just south of it, with the usual fade.
- Teleporting is free and works any time you're not in a fight.
- Dormant stones (quest not done) are drawn dull grey; awake ones glow blue. Lodestones you can travel to show on the map.
- Flags: `lodeQuest` ('started'/'done') and `lodeOn` (the network is awake). Old saves may still have `lodestones` (stones attuned one by one); it's no longer used.

### Quest journal (v0.36.0)

A **Quests** button under the Guide (or Q on a keyboard) lists every quest in `data/quests.js`, so a new quest appears there as soon as it's added to that list (with its dialogue in `npcs.js`). Each quest shows its status (not available yet / available / in progress / complete), what it's about, who starts it (with a map pin), its skill requirements with a tick or cross against your levels, a live checklist while it's in progress (e.g. "Bring Dorrin 25 coal (you have 12)"), and its rewards. In-progress quests come first, then available, then locked, then complete. The button glows while there's a quest you can start that you haven't looked at yet.

### The Guide (v0.35.0)

A **Guide** button at the top left (or G on a keyboard) opens a short guide for new players: how to play; the free starter tools and who gives them (Dorrin: pickaxe and hammer; Bram: axe, knife, shortbow and arrows; Wren: staff and runes; Old Finn: net, rod and bait; Hilda: needle and thread; Pell's store for everything else); where to train each gathering and production skill; where to fight by level; and banks, shooting stars and the Cold Forge quest. Rows with a map pin open the map on that area. The button glows until a player first opens it. The content lives in `data/startGuide.js`; keep it up to date as the world grows.

### Skill guides (v0.24.0)

Tap any skill in the skills panel to open its guide: everything the skill unlocks, in level order, with an icon, what it needs and the XP it gives. Rows you can already do are bright; locked rows are greyed with the level in red. The header shows your level and the next unlock. Guides are built from the data files (`src/skills/guide.js`), so new items, recipes, trees, rocks, fish, spells and altars appear automatically. Combat skills list the gear that needs them (Attack: weapons; Defence: armour; Ranged: bows and gear; Magic: spells and staffs); Strength and Hitpoints explain what they do.

*v0.47.1:* each section of a guide (Smithing's bronze, iron, steel… items, say) is a dropdown: tap its title to open or close it. The title shows how many of its rows you've unlocked (e.g. 12/18). When you open a guide, only the section with your next unlock is open; once you open or close one yourself, it stays that way while the game is running.

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
- A quest journal lists quests as not started / in progress / complete (done in v0.36.0: the Quests button).
- Quests use NPC dialogue, item delivery, kill tasks, simple puzzles and story bosses.
- Rewards: XP lamps, items, coins, and **new region access**.
- Quest points unlock late-game content.

### Main story: The Runebound (chapters 1–2 shipped in v0.37.0, chapter 3 in v0.38.0, chapter 4 in v0.39.0, chapter 5 in v0.40.0, chapter 6 in v0.41.0 and v0.42.0: the story is complete)

**Backstory.** Forty years ago the goblin warlord **Grubnak** marched on Brambleford. The village held the Thornwood crossroads, and Captain **Holt** of the Watch led the last stand. Grubnak couldn't be killed, so the runekeepers of Whispering Vale *bound* him with runes, deep under the stones of the old cave north-west of the goblin camp, and set a runestone in the stone shrine to hold the binding. That's why the cave mouth is sealed, and why something deep inside is breathing. The village remembers a war it "won"; almost nobody alive knows the warlord was never killed. Now the goblins are bold again, a cart has been raided, and the binding is weakening.

The story runs through places already in the world (the wrecked cart by Brambleford's bridge, the graveyard memorial, the old watchtower, the hermit's hut, the shrine with its empty hollow, the sealed cave) and gives each one a reason to exist. Each chapter is a quest in the journal; a chapter needs the one before it.

| Chapter | Name | Giver | Summary | Status |
| --- | --- | --- | --- | --- |
| 1 | The Overturned Cart | Pell (General Store) | Pell's supply cart was raided on the south road, by the bridge. Look at the cart, follow the goblin tracks, take back his strongbox from the goblin brutes. Inside is a goblin token that isn't his. | v0.37.0 |
| 2 | Echoes of the War | Elder Maren | Maren recognises Grubnak's mark on the token. Read the war memorial, find Captain Holt's journal in the old watchtower, and hear the truth from Tobin, the hermit who once served under Holt. | v0.37.0 |
| 3 | The Empty Hollow | Tobin | The runestone that held the binding has been stolen from the shrine and broken in three. Find one shard at the shrine, wake the Goblin Chief for the second, take the third from the tunnel goblins in Copperdeep Mine, and bring them to Aldric in Whispering Vale. | v0.38.0 |
| 4 | Stone and Rune | Aldric | Remaking the runestone needs essence and runes (Runecrafting) and a steel-and-silver setting that Dorrin forges from your bars (Smithing, Mining). Set the remade Binding Stone in the shrine; far away, something roars. | v0.39.0 |
| 5 | The Sealed Cave | Tobin | Break open the sealed cave (Mining 30) and go down into the Goblin Warrens, a new area. Goblins are digging at the rune-sealed door of Grubnak's chamber; defeat their Digmaster and take his orders back to Tobin. | v0.40.0 |
| 6 | The Runebound | Tobin | Get a rune key from Aldric, open the door of Grubnak's chamber and face him: the game's first story boss. When he falls he turns to stone; lay your hand on him to bind him for ever. Tobin gives you Holt's sword and the Runebound cape, and Maren rewards you. | v0.41.0 (part 1), v0.42.0 (part 2) |

**Chapter 1: The Overturned Cart** (flag `cartQuest`; recommended combat level 5+). Ask Pell "You look worried." He says his supply cart was raided on the south road and his strongbox taken. Look at the wrecked cart in Brambleford (on the south road, just before the bridge): you find goblin tracks heading north-west into Thornwood, to the goblin camp. While you're on the quest, the first **goblin brute** you kill always drops **Pell's strongbox** (if you don't already have it). Bring it back to Pell for **300 coins, 3 meat pies**, a little Attack and Strength XP, and the **goblin token** that was in the box: a carved bone disc that isn't his. He tells you to show it to Elder Maren.

**Chapter 2: Echoes of the War** (flag `warQuest`; needs chapter 1). Show Maren the token. She goes pale: it's the mark of Grubnak, the warlord of the Goblin War, and she sends you to learn what you can. Read the **war memorial** in the old graveyard (it ends "Here lies no warlord. He sleeps beneath the stones."). Search the **old watchtower** for **Captain Holt's journal** (a book you can read: the last days of the war, the binding by the shrine's stones, and two names left to keep watch: Holt and a young soldier called Tobin). Find **Tobin the Hermit** at the hermit's hut in north-west Thornwood, now an old man, who tells you the truth about the binding. (The journal's last page says where Tobin went; once you have it, the quest step and Maren both name him and his hut.) Go back to Maren for **600 coins** and Attack, Strength and Defence XP. The journal then says the story continues in the next chapter.

**Chapter 3: The Empty Hollow** (flag `stoneQuest`; needs chapter 2; recommended combat level 15+). Ask Tobin what's next: he went to the shrine and the runestone is gone. Look at the shrine on the eastern hill: the stone has been prised out and smashed, one shard (the **runestone base**) is lying in the grass, and goblin tracks split two ways: west to the goblin camp and north-west towards Copperdeep Mine. In the goblin camp, bang on the chief's hut door to wake the **Goblin Chief** (level 16 boss, new): he comes storming out wearing the **runestone crown** shard and stays awake from then on, respawning like the Alpha Wolf. The **tunnel goblins** in Copperdeep Mine carry the third shard, the **runestone heart** (one always drops while you need it). Take all three to **Aldric** in Whispering Vale: his order made the stone, and he can remake it, but not without help (chapter 4). Reward: 800 coins, Runecrafting XP and Attack, Strength and Defence XP.

The Goblin Chief: level 16, 45 hitpoints, max hit 4, aggressive; drops coins (60–150) and bones always, sometimes iron or steel weapons and goblin mail, and a war charm 1 in 16.

**Chapter 4: Stone and Rune** (flag `remakeQuest`; needs chapter 3, Runecrafting 10 and Smithing 30). Ask Aldric how the runestone is. To remake it he needs **20 rune essence**, **30 water runes**, **30 mind runes**, and a **runestone setting** to hold the pieces together. Dorrin forges the setting if you bring him **2 steel bars and a silver bar**. Hand everything to Aldric: he remakes the stone and gives you the **Binding Stone**. Set it into the hollow of the stone shrine: the runes blaze, the ground shakes, and far to the north-west something roars. Tell Tobin, who realises the binding is back but Grubnak is half awake, and the sealed cave's boulders have shifted. Reward: 1,000 coins and Runecrafting, Smithing and Magic XP. If you lose the setting or the Binding Stone before it's placed, Dorrin or Aldric will make another.

Story places can now also take an item from you (`take` in `QUEST_HOOKS`), as the shrine does with the Binding Stone.

**Chapter 5: The Sealed Cave** (flag `caveQuest`; needs chapter 4 and Mining 30; recommended combat level 25+). Ask Tobin what happens now: the goblins are digging for their warlord, and someone has to see what's down there. Break the boulders at the sealed cave in north-west Thornwood (needs Mining 30 and a pickaxe, in your bag or hand): the cave opens for good and leads down into the **Goblin Warrens**. The warrens are a new area of tunnels and dens, home to **warren goblins** (level 20, pale cave goblins). In the great dig at the north end, goblins have been chipping at the rune-sealed door of Grubnak's chamber; look at the door, then defeat the **Goblin Digmaster** (level 26 mini-boss) who runs the dig. He drops his **orders**, which you can read: they are digging Grubnak free. Take them to Tobin. Reward: 1,500 coins and Attack, Strength, Defence and Mining XP.

Warren goblins: level 20, 30 hitpoints, max hit 3, aggressive; drop coins, iron and steel gear, mithril ore, runes and coal. Goblin Digmaster: level 26, 60 hitpoints, max hit 5, respawns every 3 minutes; drops coins, steel and mithril gear, a war charm 1 in 12.

**Other engine changes (v0.40.0).** Exits can have `when(flags)` (the sealed cave only leads anywhere once it's open), a cave mouth marked `openable` is drawn sealed or open from the `caveOpen` flag, and quest hook conditions can check whether you're holding an item.

**Chapter 6: The Runebound, part 1** (flag `finalQuest`; needs chapter 5; recommended combat level 35+). Ask Tobin what now: it's time to go through the door. Aldric gives you a **rune key**, which opens the door from your side without breaking the binding. Use it on the rune door in the Goblin Warrens: the door grinds open (drawn open from then on) and leads into **Grubnak's chamber**, a new small area: a round cavern with four glowing **rune pillars**, each holding a binding chain that runs to Grubnak. Tobin is waiting just inside the entrance with advice.

**Grubnak** (level 40, 90 hitpoints, max hit 6, attacks every 3 seconds) is the first boss with mechanics of his own:
- **Ground slam:** every 10 ticks (8 in phase 2) he raises his fists and your tile and the four next to it glow red (one diagonal step gets you clear). About 2.4 seconds later the slam lands: 3–7 damage (5–9 in phase 2) if you're still on a red tile. While winding up he doesn't swing.
- **War cry:** at 75% and 40% health he roars and two warren goblins rush in. They don't respawn, drop nothing and vanish if the fight resets.
- **Phase 2:** at half health one chain snaps (its pillar goes dark). He hits harder (max 8) and faster (every 2.4 seconds), and slams more often.
- **Rune pillars:** during the fight, tap a pillar with 10 mind runes in your bag: the runes pour into it, its chain blazes and tightens, Grubnak takes 5 damage and is pinned for 4 ticks (no swings, no slams). Each pillar works once per fight (not the one whose chain snapped).
- Balance (tested with a simulated level-35 player in mithril with 20 salmon and 30 mind runes): dodging the slams and using the pillars, the fight takes about 3 minutes and half the food; ignoring the slams, the player runs out of food with Grubnak nearly dead.
- If you die or leave, he goes back to his place, heals and the pillars reset. Defeating him sets `grubnakDown`; he doesn't come back. The boss health bar at the top of the screen is bigger, gold-edged and says when he's enraged; it stays on the boss while you fight his adds. On phones, health bars now sit below the Guide and Quests buttons instead of over them.

Part 1 ends with Grubnak down and Tobin at your side; part 2 adds the ending scene, the rewards and what lies beyond.

**Chapter 6: The Runebound, part 2 — the ending** (v0.42.0). When Grubnak falls, his body turns to grey stone where he stood, the runes on it still glowing faintly (a statue in the chamber, there for good). Tobin says the binding isn't finished. Lay your hand on the statue: the runes flare white, sink into the stone and go still. Grubnak is runebound, stone for ever. Tobin's forty-year watch is over; he gives you **Holt's sword** (Captain Holt's old blade, which he has kept all these years) and the **Runebound cape**, and tells you to take the news to Maren. Maren rewards you with **5,000 coins** and a large Attack, Strength, Defence and Hitpoints XP reward, and mentions that the old road east of Whispering Vale, closed since the war, can be opened again: the way to the next region.

| Reward | Stats |
| --- | --- |
| Holt's sword (weapon, Attack 35) | Slash 28, stab 10, crush 2; strength 26; speed 4. Between adamant and rune. |
| Runebound cape (cape, Defence 30) | +3 to every attack, +5 to every defence (magic +4), strength 3. A blue cloak with a glowing rune. |
| From Maren | 5,000 coins; 800 base XP (9,600 at x12) each in Attack, Strength, Defence and Hitpoints. |

Afterwards, both Tobins (at the hut and in the chamber) and Maren have new lines, and the statue can still be looked at.

**Art (v0.43.0).** Lyra, Tobin, the warren goblins, the Digmaster and Grubnak (with a three-frame club attack) are painted from their own sheets; warren goblins and the Digmaster lunge instead of using an attack animation. The story items and the rune door are painted too. Wielded pickaxes, darts, throwing knives and javelins are drawn in your hand: painted in bronze and recoloured for the other metals.

**Boss engine (v0.41.0).** An enemy's `mechanics` (in `data/enemies.js`) can give it telegraphed slams (warning tiles that land a few ticks later), war cries that summon temporary adds, a phase 2 at a share of its health with stat changes, and chains to pillars that the player can use to stun it. Doors other than the sealed cave can open with the story (`openable` with `openFlag`).

**Quest spawns (v0.38.0).** An enemy in an area's spawn list can have `when(flags)`: it only appears once that's true (the Goblin Chief appears when `chiefAwake` is set), including straight away if you're standing in the area when it happens.

**Quest engine (v0.37.0).** Quests can now need earlier quests (`requiresQuests`) and show a recommended level. Story places can react to a quest (`QUEST_HOOKS` in `data/quests.js`: tap the cart, the memorial or the watchtower while on a quest to find a clue or an item). Monsters can drop quest items while you need them (`QUEST_DROPS`; the Cold Forge's ember core moved here too). Some items can be read (a `read` list of pages), by tapping them in the bag.

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
- Art is moving to a painted pixel-art set (v0.19+): original sprite sheets made for this game, on magenta backgrounds, which `tools/cut_sheets.py` cuts into separate sprites and `tools/build_art.py` shrinks to game scale (16 px tiles, limited palette, dark outline) and packs into one atlas, `assets/art.png` + `art.json` (about 1.35 MB). The game loads it before it starts; anything not in the atlas, or everything if the atlas fails to load, is still drawn in code. No assets, names or designs are copied from OSRS, Pokémon or any other game.
- Painted so far: trees (oak, pine), bushes, flowers, tall grass, mushrooms, rocks, stumps, log piles, well, market stall, lamps, signposts, scarecrows, crops, tanning rack, cooking pot, campfires, tents, crates, barrels, chests, fence posts and rails; ground textures for grass, paths, cobbles, sand, farm soil, water (two frames), bridges, floors, cave floor and rock walls, with darker ones for Whispering Vale. Ground textures are made seamless and toned down so sprites stand out. Where grass, paths, sand and soil meet, the border wanders a few pixels either way (the ground is looked up at a point nudged by smooth noise) with a soft shadow along it, so there are no straight tile seams and path ends come out rounded; paved squares are blurred into rounded, uneven shapes with a soft dark edge instead of hard rectangles, and water outlines are smoothed the same way so ponds and streams have curved banks (kept straight only against bridges). Cave walls are rounded the same way (v0.37.2): the rock's outline is blurred and nudged by noise (the middle of every floor tile stays clear, where you stand), the rock gets a dark edge and a lit lip where it meets the floor below, and the floor has a soft shadow at the foot of each wall, so caverns look carved rather than built from square blocks. Since v0.37.4 the same applies wherever rock meets grass, paths, soil or sand outdoors (the Alpha's den, the sealed cave, the mine entrance's rock face, the essence quarry's rim), and the Alpha's den and the sealed cave are uneven outcrops rather than rectangles. Bridges (v0.37.5) are drawn as one piece over the water: a plank deck that runs a little onto each bank, railings with posts, big end posts and a shadow on the water; Thornwood's stream runs level for a few tiles either side of the road so its bridge crosses straight. Tall grass, flowers, mushrooms and bones sit slightly off the tile grid. v0.20 added: every villager (walking in four directions, three frames each, scaled once so they don't wobble), goblins, brutes, tunnel goblins, essence golems, wolves, the alpha wolf, chickens and cows; houses (nearest of four roof colours), cabins, the General Store and the Bank, lined up on their real door tiles, with the "free bows" board on Bram's cabin; the three altars (pulsing), standing stones, copper/tin/iron/essence rocks and mined-out rubble, the furnace, anvil and mine lamps, the wolf den and the sealed cave; the vale's dead and blossom/crystal trees, thorn bushes, glowing mushrooms, ghost-flowers, crystals and dead grass; and item icons (a 32 px picture in the bag and menus, 16 px on the ground; potions show a dot per dose). v0.21 added the rest of the sheets: the player is now the painted adventurer (worn gear no longer shows on the character; tools still appear while skilling); birches, old oaks, saplings, hollow logs, reeds along the water and lily pads; cabbages; stacked crates and open barrels at the camps; Wyn's chicken coop; the timbered mine entrance at the end of Thornwood's north-west road; the praying-statue shrine; a glowing rune stone in the fairy ring; skeletons in the wolf hills and the vale; picket fencing round Brambleford's farm; flower meadows mixed into the grass (pink and yellow in daylight areas, blue and purple in the vale); and painted wooden walls indoors. Still drawn in code: interiors (counters, shelves, rugs), fishing spots, fallen tree, bones, ruined walls and headstones.
- Readable silhouettes: each enemy type is recognisable at the default zoom.
- UI: wood-framed parchment panels with a pixel font (Pixelify Sans), a virtual joystick on touch screens, and an Emerald-style dialogue box.

### Desktop controls

| Action | Input |
| --- | --- |
| Move | Click a tile, or WASD / arrow keys |
| Attack / interact | Left-click enemy, NPC, item or object |
| Options menu | Right-click (Attack, Examine, Take, Talk-to) |
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
