# RuneBound Chronicles

A browser-based 2D pixel-art fantasy RPG for desktop and iPhone.

It pairs **Pokémon Emerald-style exploration** (top-down 3/4 view, grid movement, towns, routes, NPC dialogue, story progression) with **Old School RuneScape-style gameplay** (real-time overworld combat, roaming enemies, loot drops, skills to level 99, equipment, banking, a 28-slot inventory and quests).

There are no turn-based battles, no battle screens and no creature catching. You fight in the world, with your own weapons and spells.

## Documents

- [Game design](docs/GAME_DESIGN.md) — the full design: combat, skills, XP curve, loot, items, death rules, controls, architecture and saving
- [Roadmap](docs/ROADMAP.md) — the build plan in small batches, starting with the first playable version

## Play

**https://raynesj93.github.io/Runebound-Chronicles/**

- **Desktop:** click to walk, or use WASD / arrow keys. R toggles run and walk (running never runs out). Mouse wheel or + / − zooms.
- **iPhone:** tap to walk, or use the on-screen joystick. Pinch to zoom. For full-screen play, open the link in Safari, tap Share, then **Add to Home Screen**.
- Tap or click people to talk to them, and signs, doors and other objects to look at them. Number keys pick answers on desktop.
- **Long-press** (iPhone) or **right-click** (desktop) anything — monsters, people, loot, doors, your items — for all its options: attack, talk, examine, take, walk here, drop.
- Brambleford's **east end** has an orchard to chop and a **cow field** down the south road (cows drop cowhide and raw beef), plus a river with more fishing spots.
- South of the lower lane is **Wyn's chicken pen**: an easy first fight. Chickens always drop bones, and sometimes raw chicken and feathers.
- Head north out of the village into **Thornwood**, a big open wilds (112 × 96 tiles) where roads meet at a crossroads. The goblins hold a palisaded camp to the west, wolves roam the rocky hills to the north-east around the alpha's den, and Bram's cabin, the oak grove, the stream, and a lake with a hunters' camp lie in between. Copperdeep Mine is up the north-west road and Whispering Vale is at the end of the east road. Look out for the ruined watchtower, the hermit's hut, a sealed cave, the old graveyard, an abandoned farmstead, a stone shrine, a wrecked merchant's cart and a fairy ring: stories for later.
- Open **Skills** (sword button, or K) to see your levels. The **Combat** tab chooses your attack style: Accurate trains Attack, Aggressive trains Strength, Defensive trains Defence, Controlled trains all three.
- Tap or click a goblin to attack it. Your character walks up and fights automatically. Tap the ground or move to stop. Beware the Goblin Brute by the tents: it attacks on sight.
- Tap loot on the ground to walk over and pick it up (a pile gives you a choice). Open your **Inventory** (bag button, or I) and tap an item to examine or drop it; drag items to rearrange them. Tap a weapon or armour piece and choose **Wield** or **Wear**; the **Equipment** tab shows what you're wearing and your total bonuses.
- Ask **Bram** (the woodcutter) for a bow and **Wren** (on the north road) about her staff. Put arrows in your ammo slot to shoot; with the staff, pick a spell in the **Combat** tab. Watch out for the wolf den to the north-east.
- Walk into the **General Store** and **Bank** in Brambleford. Talk to Pell to trade, and Edda or any booth to bank. Pick 1 / 5 / 10 / All, then tap items to move them. Tap food to eat it, potions to drink them, and weapons or armour to put them on (Settings can make taps open the menu instead).
- Ask **Bram** to teach you woodcutting: he'll give you an axe and a knife. Tap a pine tree to chop it (oaks need Woodcutting 15), then tap your logs to carve arrow shafts and bows. Add feathers and bronze arrowtips (from Pell) to make arrows.
- Take Thornwood's north-west road to **Copperdeep Mine**. Ask **Dorrin** to teach you: he'll give you a pickaxe and a hammer. Mine copper and tin, smelt them into bronze bars at the furnace, then hammer bars into daggers, swords, helmets, shields, chainbodies and arrowtips at the anvil. Iron needs Mining 15 and Smithing 15.
- Ask **Old Finn** by Brambleford's pond to teach you fishing: he'll give you a net, a rod and some bait. Tap the ripples to fish, then cook your catch (and Wyn's chickens) on the cooking pit. Trout and salmon live in the Thornwood stream: you'll need a fly fishing rod and feathers.
- By the cow field, **Hilda the Tanner** teaches crafting: tan cowhides into leather at her rack, then tap the leather to sew gloves, boots, a cowl, vambraces, a body and chaps (a ranged armour set you make yourself).
- Follow the trail east along Thornwood's east road to **Whispering Vale**: mine rune essence in the quarry, then take it to the **Air**, **Mind** or **Water** altar to turn it into runes. Aldric the Runekeeper explains it all, and the camp's supply chest opens your bank. Essence golems roam the vale: they drop runes and essence.
- If you die you keep your 3 most valuable items; the rest wait in a gravestone where you fell for 15 minutes (free to reclaim for the first 5).

## Status

**v0.21.1 — Phase 2 in progress.** The first playable version (Brambleford, Thornwood, real-time combat with melee, bows and magic, six combat skills to 99, loot, inventory, equipment, bank, shop, food, potions and gravestones) plus **Woodcutting**, **Fletching**, **Mining**, **Smithing**, **Fishing**, **Cooking**, **Crafting** and **Runecrafting**, Copperdeep Mine, Whispering Vale and Wyn's chicken pen. All XP is 5× the base rates.

Next: bank tabs and search, then Phase 3 (quests and new regions) (see the [roadmap](docs/ROADMAP.md)).

## Running it locally

There is no build step. Serve the folder with any static web server and open it in a browser, for example:

```
python3 -m http.server 8000
```

then visit http://localhost:8000.

To check that saves from every earlier version still load:

```
node tests/save.test.mjs
node tests/inventory.test.mjs
```

## Code layout

| Folder | What's in it |
| --- | --- |
| `src/core` | Game tick (0.6 s), game state, saving with versions, migrations and repair |
| `src/world` | Tile grid, collision and pathfinding |
| `src/render` | Pixel-art sprites (painted atlas + code-drawn fallbacks), ground, buildings, camera and depth sorting |
| `src/entities` | The player's movement, villagers (NPCs) and enemies |
| `src/combat` | Combat formulas and the tick-based fighting system |
| `src/skills` | XP curve, levels, attack styles, skill list |
| `src/items` | Inventory, equipment, bank, shop, loot rolls, ground items, death and gravestones |
| `src/input` | Keyboard, mouse, touch, pinch and D-pad |
| `src/ui` | On-screen interface: banner, messages, run orb, dialogue, settings |
| `data/areas` | Map data for each area |
| `data/npcs.js` | Villagers: where they live, how they look, what they say |
| `data/enemies.js` | Monster stats and loot tables |
| `data/items.js` | Every item: name, stacking, value, examine text, equipment stats |
| `data/spells.js` | Combat spells: level, max hit, runes, XP |
| `data/shops.js` | Shop stock lists |
| `data/woodcutting.js` | Trees and axes |
| `data/fletching.js` | Fletching recipes |
| `data/mining.js` | Ore rocks and pickaxes |
| `data/smithing.js` | Smelting and smithing recipes |
| `data/fishing.js` | Fishing spots and what they catch |
| `data/cooking.js` | Cooking recipes and burn rates |
| `data/crafting.js` | Tanning and sewing recipes |
| `data/runecrafting.js` | Runecrafting altars |
| `tests` | Save-loading tests (run with Node) |

## Stack

HTML canvas and plain JavaScript modules — no libraries — hosted on GitHub Pages. Art is a painted pixel-art atlas (`assets/art.png`, built from sprite sheets by `tools/build_art.py`), with code-drawn fallbacks. Saves are stored locally in the browser, with export/import for backups.

All art, names and content are original. This project is not affiliated with Nintendo, Game Freak, The Pokémon Company or Jagex.
