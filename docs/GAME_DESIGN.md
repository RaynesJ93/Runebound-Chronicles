# RuneBound Chronicles — Game Design Document

*Version 2.3 · Updated 2 November 2026 · 2D pixel art; supersedes the original creature-battler concept*

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
| Route | Paths between towns, low–mid enemies, trees, rocks, fishing spots | Forest route (Route 1) |
| Forest | Dense woodland, wolves, woodcutting | Thornwood |
| Mine | Ore rocks, dwarves, low light | Copperdeep Mine |
| Cave | Linked tunnels, darkness, stronger enemies | — |
| Dungeon | Multi-floor, bosses, rare drops, quest-locked | — |
| Danger zone | High-risk area with harsher death rules and best rewards | The Ashlands (endgame) |

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
| Precise | Attack | +3 effective attack level |
| Forceful | Strength | +3 effective strength level |
| Guarded | Defence | +3 effective defence level |
| Balanced | Attack, Strength, Defence split | +1 to each |
| Steady (bows) | Ranged | +3 effective ranged level |
| Quickshot (bows) | Ranged | Attack speed −1 tick |
| Farshot (bows) | Ranged + Defence | +2 range |

Every damaging hit also gives Vitality XP. *(Until the names batch ships, the game still shows the older names Accurate, Aggressive, Defensive, Controlled, Rapid, Longrange and Hitpoints.)*

### Ranged and magic (first release)

- **Bows** fire arrows from the ammo slot, up to 7 tiles (9 on Longrange), and need a clear line of sight (trees, rocks and walls block shots; water doesn't). About 60% of arrows land under the target and can be picked up again.
- **Staves** cast the spell chosen in the Combat tab on every attack, using its runes from the bag. Range 8 tiles.

| Spell | Magic level | Max hit | Runes | Base XP |
| --- | --- | --- | --- | --- |
| Gale Dart | 1 | 2 | 1 Gale, 1 Focus | 5.5 |
| Tide Dart | 5 | 4 | 1 Tide, 1 Gale, 1 Focus | 7.5 |

The full spell list (Darts, Lances, Surges and Cataclysms) is in section 7, *Runes and spells*.

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
| Vitality | Health pool (1 hitpoint per level) | Any damage dealt; starts at level 10 |
| Ranged | Ranged accuracy and damage; unlocks bows and ranged armour | Ranged weapons |
| Magic | Magic accuracy; unlocks spells and staves | Casting combat spells |

All skills go to **level 99**. Non-combat skills arrive later (see section 9).

### XP curve

The XP needed for level *L* is:

```
XP(L) = floor( (1/4) × Σ from n=1 to L−1 of floor( n + 300 × 2^(n/7) ) )
```

This is the OSRS curve: level 2 needs 83 XP, level 50 needs about 101,000, level 92 needs about 6.5 million (half of 99), and level 99 needs about 13.03 million. Max XP per skill is capped at 200 million.

### Combat XP rates

- Melee, ranged and magic: **4 XP per damage dealt** to the chosen skill(s).
- Vitality: **1.33 XP per damage dealt**.
- Magic also gives a small base XP per cast, even on a miss.
- Defensive/longrange styles split XP as shown in the styles table.

### Combat level

```
base   = 0.25 × (Defence + Vitality)
melee  = 0.325 × (Attack + Strength)
ranged = 0.325 × floor(1.5 × Ranged)
magic  = 0.325 × floor(1.5 × Magic)
combat level = floor( base + max(melee, ranged, magic) )
```

A new character (all 1s, Vitality 10) is combat level 3. A maxed character is level 113 (there is no Devotion skill yet, so it tops out lower than OSRS's 126).

Enemy names show their combat level, coloured green (weaker), yellow (similar) or red (stronger) relative to the player.

## 6. Enemies and loot

### First-release enemies

| Enemy | Level | HP | Behaviour | Where |
| --- | --- | --- | --- | --- |
| Goblin | 2 | 5 | Passive, roams in groups of 3–5 | Village outskirts, Route 1 |
| Goblin Brute | 5 | 12 | Aggressive to low levels | Route 1 goblin camp |
| Wolf | 7 | 14 | Aggressive, fast, chases further | Forest route |
| Alpha Wolf (mini-boss) | 14 | 40 | Aggressive, rare spawn, always drops something good | Deep forest clearing |

### Loot tables

Each enemy has its own loot table, defined in data files:

- **Always:** guaranteed drops (e.g. bones on every kill).
- **Main table:** one roll per kill, weighted (coins, low-tier weapons, runes, arrows, food, crafting materials).
- **Rare table:** separate small chance (e.g. 1/128), rare items and higher-tier gear.
- **Trophies:** per-enemy signature rare drops (e.g. the Wolf-pelt cloak from the Alpha Wolf at 1/32), recorded in the Trophy ledger.

Example — Goblin:

| Item | Quantity | Chance |
| --- | --- | --- |
| Bones | 1 | Always |
| Coins | 1–15 | 1/3 |
| Copper dagger | 1 | 1/16 |
| Goblin mail | 1 | 1/32 |
| Gale runes | 4–8 | 1/12 |
| Copper arrows | 3–10 | 1/10 |
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
- Stackable items (coins, runes, arrows) use one slot.
- Actions: Use, Equip/Wield, Eat/Drink, Drop, Examine. Drag to reorder.
- Tapping (or left-clicking) an item does its main action: eat, drink, wield or wear. Long-press (or right-click) shows every option. A setting makes every tap open the menu instead.

### Equipment slots

Head, Cape, Neck, Ammo, Weapon, Body, Shield, Legs, Hands, Feet, Ring.

Each item has stats in data: attack bonuses (stab, slash, crush, ranged, magic), defence bonuses for each, melee strength, ranged strength, magic damage, attack speed, and level requirements. The equipment screen shows totals.

### Gear and progression

*Added 2 Nov 2026 (design v2.3). The structure follows OSRS — tiers unlocked by level, three combat styles that counter each other, gear that comes from drops, shops and your own crafting — but every name, material and tier is RuneBound's own. See section 14 for the full list of names.*

#### The three gear families

Each combat style has its own gear family, and they counter each other in a triangle:

| Family | For | Made from | Strong against | Weak against |
| --- | --- | --- | --- | --- |
| **Metal** (weapons and plate) | Melee | Ore smelted into bars (Smithing) | Arrows | Spells |
| **Hide** (bows, arrows, hide armour) | Ranged | Wood (Fletching) and animal hides (Crafting) | Spells | Metal |
| **Cloth** (staves, robes) | Magic | Wood, gems and woven cloth (Crafting) | Metal | Arrows |

Metal armour has big defences against stab, slash, crush and arrows but negative magic defence. Hide armour defends well against magic and arrows but poorly against melee. Robes give magic accuracy and magic defence but almost nothing against arrows. Picking the right style for a monster (and the right armour for what it hits with) is the core of gear choice.

#### Metal tiers (melee)

Nine metals, each tied to a place in the world. You need **Attack** to wield a weapon and **Defence** to wear armour at the tier's level. Making it needs the same level in **Smithing**.

| Tier | Level | Colour | Ore and where it's found | Arrives |
| --- | --- | --- | --- | --- |
| **Copper** | 1 | Warm orange | Copper ore — Copperdeep Mine, north of Thornwood | Now (shop and drops); smithing in Phase 2 |
| **Greyiron** | 5 | Dull grey | Greyiron ore — Copperdeep Mine | Now (rare drops); smithing in Phase 2 |
| **Hearthsteel** | 10 | Bright steel with a red sheen | Greyiron ore + cinderstone (coal) | Phase 2–3 |
| **Dusksteel** | 20 | Blue-black | Duskite ore — caves under the second town | Phase 3 |
| **Moonsilver** | 30 | Pale silver-blue | Moonsilver ore — moonlit caverns | Phase 3 |
| **Verdite** | 40 | Deep green | Verdite ore — the Fen marshes | Phase 4 |
| **Emberite** | 50 | Red-gold, glowing seams | Emberite ore — volcanic mountain | Phase 4 |
| **Stormsteel** | 60 | Violet, crackling | Stormsteel ore — high peaks | Phase 5 |
| **Starmetal** | 70 | Near-white with sparkles | Fallen-star rocks (random events) | Phase 5 |

Beyond the metals there are **boss-only tiers** that can't be smithed: **Wyrmscale** (level 75, from wyrm bosses) and **Ashforged** (level 80, very rare, from the Ashlands).

**Melee weapons** — every metal comes in these shapes:

| Weapon | Hits with | Speed | Character |
| --- | --- | --- | --- |
| Dagger | Stab | 4 ticks (2.4 s) | Very accurate, low damage |
| Sabre | Slash | 4 ticks | Best all-round training weapon |
| Longsword | Slash/stab | 5 ticks | Hits harder than a sabre, slower |
| Mace | Crush | 5 ticks | For armoured enemies (skeletons, golems) |
| Spear | Stab | 5 ticks | Balanced stats; also boosts Defence slightly |
| War axe | Slash | 6 ticks | Big hits, low accuracy |
| Maul | Crush | 6 ticks | Big crush hits |
| Greatsword | Slash | 7 ticks, two-handed | The biggest hits; no shield |

**Metal armour**:

| Piece | Slot | Notes |
| --- | --- | --- |
| Helm | Head | Light, cheap |
| Greathelm | Head | Full face; more defence |
| Mail shirt | Body | Light |
| Cuirass | Body | Heaviest defence; the most expensive piece |
| Greaves | Legs | |
| Buckler | Shield | Light shield |
| Heater shield | Shield | Big defence |
| Gauntlets | Hands | |
| Sabatons | Feet | |

Example stats (Sabre and Cuirass at each tier) — the full tables live in `data/items.js`:

| Tier | Sabre slash attack | Sabre strength | Cuirass slash defence | Cuirass magic defence |
| --- | --- | --- | --- | --- |
| Copper | +8 | +7 | +16 | −15 |
| Greyiron | +11 | +10 | +22 | −15 |
| Hearthsteel | +16 | +15 | +32 | −16 |
| Dusksteel | +22 | +21 | +45 | −17 |
| Moonsilver | +30 | +28 | +58 | −18 |
| Verdite | +38 | +36 | +70 | −19 |
| Emberite | +46 | +44 | +82 | −20 |
| Stormsteel | +56 | +54 | +94 | −22 |
| Starmetal | +67 | +65 | +106 | −24 |

Each tier is a clear step up: at low levels a new tier is worth roughly one extra damage per hit, so upgrades are noticeable from the very first one.

#### Wood tiers (bows and staves)

| Wood | Level | Where it grows |
| --- | --- | --- |
| **Pine** | 1 | Everywhere in Thornwood |
| **Ashwood** | 10 | Thornwood clearings |
| **Thornwood** | 20 | Deep in the old forest |
| **Elderwood** | 30 | Around the second town |
| **Ironbark** | 40 | Fen islands |
| **Duskwood** | 50 | Shadow valleys |
| **Moonbark** | 60 | Moonlit groves |
| **Starwood** | 70 | Where stars have fallen |

- **Shortbow** — fast (4 ticks), range 7. **Warbow** — slower (5 ticks), range 9, stronger. Both need **Ranged** at the wood's level; making them needs **Fletching**.
- A bow can fire arrows up to its own tier: a Pine bow fires Copper arrows; an Elderwood bow fires up to Moonsilver arrows (the metal of the same tier number).
- **Arrows** are tipped with metal: Copper arrows, Greyiron arrows … Starmetal arrows. They need Ranged at the metal's level.
- **Staves** are wood plus a gem focus (see Jewellery). They need **Magic** at the wood's level. **Attuned staves** (e.g. a Gale-attuned staff) save one elemental rune of their element on every cast.

#### Hide armour (ranged)

Needs **Ranged** and **Defence** at the hide's level. Pieces: Hood, Vest, Leggings, Bracers, Boots.

| Hide | Level | From |
| --- | --- | --- |
| Rawhide | 1 | Shop; cows and deer |
| Wolfhide | 10 | Wolf pelts (Thornwood) |
| Boarhide | 20 | Bristleboars |
| Fenhide | 30 | Fen lizards |
| Cinderhide | 40 | Salamanders on the volcano |
| Frosthide | 50 | Ice drakes |
| Stormhide | 60 | Thunder drakes |
| Wyrmhide | 70 | Wyrm bosses |

#### Cloth (magic)

Needs **Magic** (and Defence from Mooncloth up). Pieces: Hat, Robe top, Robe skirt, Gloves, Boots.

| Cloth | Level |
| --- | --- |
| Linen | 1 |
| Woolweave | 10 |
| Silkweave | 20 |
| Mooncloth | 30 |
| Emberweave | 40 |
| Stormweave | 50 |
| Starcloth | 60 |
| Voidsilk | 70 |

#### Runes and spells

Runes come in four **elements** and four **power runes**:

- Elements: **Gale** (wind), **Tide** (water), **Stone** (earth), **Ember** (fire)
- Power: **Focus** (Dart spells), **Fury** (Lance), **Ruin** (Surge), **Doom** (Cataclysm)

Each spell family has one spell per element, getting stronger from Gale to Ember:

| Family | Power rune | Gale | Tide | Stone | Ember | Max hits |
| --- | --- | --- | --- | --- | --- | --- |
| **Dart** | Focus | 1 | 5 | 9 | 13 | 2 / 4 / 6 / 8 |
| **Lance** | Fury | 18 | 24 | 30 | 36 | 9 / 10 / 11 / 12 |
| **Surge** | Ruin | 42 | 48 | 54 | 60 | 13 / 14 / 15 / 16 |
| **Cataclysm** | Doom | 63 | 67 | 71 | 75 | 17 / 18 / 19 / 20 |

A spell costs its power rune plus elemental runes (e.g. Tide Dart: 1 Focus, 1 Tide, 1 Gale). Runes are made with **Runebinding** (Phase 2) from **blank runestones**, at elemental altars.

#### Jewellery (neck and ring)

Gems, cut with Crafting and set into silver or gold: **Amber** (5), **Jade** (20), **Garnet** (35), **Moonstone** (50), **Starstone** (70). Each gem gives an amulet and a ring with a small bonus (accuracy, strength, magic damage or defence), and enchanted versions with special effects later. Gems are also the focus in staves.

#### RuneBound's own systems

These are what make our gear different from OSRS:

1. **Craft quality.** Items you make yourself can come out **Standard**, **Fine** (+10% to every bonus) or **Masterwork** (+20%), with better odds the higher your skill is above the item's level. Drops and shop items are always Standard, so crafting skills give the best gear at every tier. Fine and Masterwork items show a small silver or gold star on their icon and sell for more.
2. **Matched sets.** Wearing 4 or more pieces of the same tier (helm, body, legs, shield, gauntlets, sabatons — or the hide/cloth equivalents) gives a **set bonus**: +5% accuracy with that family's style. The Equipment tab shows "Matched set (4/6)".
3. **Trophies.** Rare monster drops are wearable **trophies** with their own small bonus or effect (the Goblin war-charm, the Wolf-pelt cloak). Every trophy you've ever found is recorded in the **Trophy ledger**.
4. **Fervour.** Rare and boss weapons have a **Fervour strike**: a special attack powered by a Fervour bar that fills as you fight. (Later phase.)
5. **Gear guide.** The Equipment tab suggests your next upgrade for each slot and where it comes from, so progression is always clear.

#### Progression at a glance

| Combat level | Where | Melee | Ranged | Magic |
| --- | --- | --- | --- | --- |
| 3–15 | Brambleford, Thornwood | Copper → Greyiron | Pine bow, Rawhide → Wolfhide | Pine staff, Linen, Darts |
| 15–35 | Copperdeep Mine, second town | Hearthsteel → Dusksteel | Ashwood → Thornwood bows, Boarhide | Woolweave, Silkweave, Lances |
| 35–60 | Moon caverns, the Fen | Moonsilver → Verdite | Elderwood → Ironbark, Fenhide | Mooncloth, Emberweave |
| 60–85 | Volcano, high peaks | Emberite → Stormsteel | Duskwood → Moonbark, Cinderhide → Stormhide | Stormweave, Starcloth, Surges |
| 85+ | Fallen stars, wyrm lairs, the Ashlands | Starmetal, Wyrmscale, Ashforged | Starwood, Wyrmhide | Voidsilk, Cataclysms |

#### Renaming the items already in the game

When this ships, existing items are renamed and old saves are upgraded automatically (save version 3):

| Now | Becomes |
| --- | --- |
| Bronze dagger / sword / med helm / arrows | Copper dagger / sabre / helm / arrows |
| Iron dagger | Greyiron dagger |
| Shortbow | Pine shortbow |
| Apprentice staff | Pine staff |
| Leather body / gloves / boots | Rawhide vest / bracers / boots |
| Air / Water / Mind runes | Gale / Tide / Focus runes |
| Wind Strike / Water Strike | Gale Dart / Tide Dart |

Wooden shield, Goblin mail, the Goblin war-charm and the Wolf-pelt cloak keep their names; they are already our own.

### Food and potions

- **Natural healing:** out of combat (6 seconds after your last hit), you regain 1 hitpoint every 6 seconds. There is no healing during a fight, so food matters.
- **Food** heals a set amount and takes 3 ticks to eat (it delays your next attack). Examples: Bread (3), Shrimp (3), Trout (7), Salmon (9).
- **Potions** give temporary effects, with 4 doses per potion:
  - Attack/Strength/Defence potion: boosts the level by 3 + 10%, then wears off 1 level per minute
  - Ranging/Magic potion: same for ranged/magic
  - Antipoison: cures poison and gives immunity for a while (poison arrives with later enemies)

### Bank

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

**The Ashlands (endgame):** you keep only 3 items, and there is no gravestone. The risk is shown clearly before you enter, with a warning screen.

Dying in tutorial or story-critical fights never costs items.

## 9. Skilling, crafting, quests and long-term progression

These come after the first playable version. They are listed so the systems built now leave room for them.

### Gathering skills
- **Woodcutting** — trees on routes and in forests
- **Mining** — ore rocks in mines and caves
- **Fishing** — spots on rivers, lakes and the coast

### Production skills
- **Cooking** — raw fish and meat into food (can burn)
- **Smithing** — ore into bars, bars into metal weapons and armour (Copper to Starmetal)
- **Fletching** — logs into bows, staves and arrows (Pine to Starwood)
- **Crafting** — hide armour, woven robes, cut gems and jewellery
- **Runebinding** — blank runestones into runes at elemental altars

### Support skills (later)
- **Devotion** — offer bones at shrines for XP; temporary blessings in combat
- **Athletics** — shortcuts and faster run-energy regen

Every skill uses the same XP curve and goes to 99. Resources respawn after a timer, with chances to succeed improving with level and tools. Crafted gear can come out Fine or Masterwork (section 7).

### Quests
- A quest journal lists quests as not started / in progress / complete.
- Quests use NPC dialogue, item delivery, kill tasks, simple puzzles and story bosses.
- Rewards: XP lamps, items, coins, and **new region access**.
- Quests earn **Renown**, which unlocks late-game content.

### Endgame goals
- Level 99 in every skill (**Mastery mantles**)
- Rare boss drops and the boss-only tiers (Wyrmscale, Ashforged)
- Dungeon bosses with mechanics (telegraphed attacks, phases)
- The **Trophy ledger** of every rare drop you've found

## 10. Art direction and controls

### Art direction

*Changed 2 Nov 2026: the game moved from low-poly 3D to 2D pixel art.*

- **Original 2D pixel art** in a cosy farming-RPG style: 16 × 16 px tiles, a 3/4 top-down view, warm saturated colours, and a 1 px dark outline around every sprite so things read clearly on grass.
- Trees, bushes and rocks are built from clusters of shaded blobs lit from the top-left; ground has textured grass with tufts, ragged path edges, cobbled squares and shimmering water.
- Characters are small chibi sprites (16 × 24 px) with 4-direction walking animations.
- All art is drawn in code, in one consistent style. No assets, names or designs are copied from OSRS, Pokémon or any other game.
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
  render/            — pixel-art sprites drawn in code, ground, buildings, camera, depth sorting, hitsplats, health bars
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

## 14. Our names

RuneBound borrows the *shape* of Old School RuneScape's progression, never its names. When a new system arrives, it gets a name from this list (or a new one added here).

| Idea | RuneBound name |
| --- | --- |
| Metal tiers | Copper, Greyiron, Hearthsteel, Dusksteel, Moonsilver, Verdite, Emberite, Stormsteel, Starmetal; boss tiers Wyrmscale and Ashforged |
| Wood tiers | Pine, Ashwood, Thornwood, Elderwood, Ironbark, Duskwood, Moonbark, Starwood |
| Hides | Rawhide, Wolfhide, Boarhide, Fenhide, Cinderhide, Frosthide, Stormhide, Wyrmhide |
| Cloth | Linen, Woolweave, Silkweave, Mooncloth, Emberweave, Stormweave, Starcloth, Voidsilk |
| Gems | Amber, Jade, Garnet, Moonstone, Starstone |
| Melee weapons | Dagger, Sabre, Longsword, Mace, Spear, War axe, Maul, Greatsword |
| Metal armour | Helm, Greathelm, Mail shirt, Cuirass, Greaves, Buckler, Heater shield, Gauntlets, Sabatons |
| Bows | Shortbow, Warbow |
| Elemental runes | Gale, Tide, Stone, Ember |
| Power runes | Focus, Fury, Ruin, Doom |
| Spell families | Dart, Lance, Surge, Cataclysm |
| Rune blanks / making runes | Blank runestone / Runebinding |
| Coal | Cinderstone |
| Melee styles | Precise (Attack), Forceful (Strength), Guarded (Defence), Balanced (all three) |
| Bow styles | Steady, Quickshot, Farshot |
| Health skill | Vitality |
| Prayer-like skill | Devotion (offer bones at shrines; blessings) |
| Agility-like skill | Athletics |
| Special attack | Fervour strike (Fervour bar) |
| Rare monster drops | Trophies; the Trophy ledger |
| Level-99 cape | Mastery mantle |
| Quest points | Renown |
| XP reward item | Tome of insight |
| High-risk endgame zone | The Ashlands |
| Craft quality | Standard, Fine, Masterwork |
| Set bonus | Matched set |

Words that are just ordinary English (coins, bones, bread, dagger, helm, Attack, Strength, Defence, Ranged, Magic, Mining, Smithing, Woodcutting, Fishing, Cooking, Fletching, Crafting) stay as they are.
