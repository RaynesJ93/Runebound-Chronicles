# RuneBound Chronicles — Game Design Document

*Version 2.1 · Updated 2 November 2026 · 2D pixel art; supersedes the original creature-battler concept*

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
| Goblin | 2 | 5 | Passive, roams in groups of 3–5 | Village outskirts, Route 1 |
| Goblin Brute | 5 | 12 | Aggressive to low levels | Route 1 goblin camp |
| Wolf | 7 | 14 | Aggressive, fast, chases further | Forest route |
| Alpha Wolf (mini-boss) | 14 | 40 | Aggressive, rare spawn, always drops something good | Deep forest clearing |

### Loot tables

Each enemy has its own loot table, defined in data files:

- **Always:** guaranteed drops (e.g. bones on every kill).
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
- Stackable items (coins, runes, arrows) use one slot.
- Actions: Use, Equip/Wield, Eat/Drink, Drop, Examine. Drag to reorder.

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
- Shops buy and sell; prices shift slightly with stock levels, like OSRS.
- Coins are the currency.

## 8. Death and its consequences

Death should sting without ruining a session.

**Normal areas:**
1. You respawn at the last town you visited, at full health.
2. You **keep your 3 most valuable items** automatically.
3. Everything else is left at the place you died in a **gravestone** that lasts **15 minutes** of play time.
4. Return to the gravestone to reclaim everything for free in the first 5 minutes, or for a small coin fee after that.
5. If the timer runs out, the items are lost.
6. XP and levels are never lost.

**Wilderness (endgame):** you keep only 3 items, and there is no gravestone. The risk is shown clearly before you enter, with a warning screen.

Dying in tutorial or story-critical fights never costs items.

## 9. Skilling, crafting, quests and long-term progression

These come after the first playable version. They are listed so the systems built now leave room for them.

### Gathering skills
- **Woodcutting** — trees on routes and in forests
- **Mining** — ore rocks in mines and caves
- **Fishing** — spots on rivers, lakes and the coast

### Production skills
- **Cooking** — raw fish and meat into food (can burn)
- **Smithing** — ore into bars, bars into weapons and armour
- **Fletching** — logs into bows and arrows
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

Touch targets are at least 44 × 44 points. The layout respects the iPhone notch and home bar (safe areas) and works in landscape and portrait. The game should run as a Home Screen web app.

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
