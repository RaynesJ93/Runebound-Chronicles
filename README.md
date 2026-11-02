# RuneBound Chronicles

A browser-based 2D pixel-art fantasy RPG for desktop and iPhone.

It pairs **Pokémon Emerald-style exploration** (top-down 3/4 view, grid movement, towns, routes, NPC dialogue, story progression) with **Old School RuneScape-style gameplay** (real-time overworld combat, roaming enemies, loot drops, skills to level 99, equipment, banking, a 28-slot inventory and quests).

There are no turn-based battles, no battle screens and no creature catching. You fight in the world, with your own weapons and spells.

## Documents

- [Game design](docs/GAME_DESIGN.md) — the full design: combat, skills, XP curve, loot, items, death rules, controls, architecture and saving
- [Roadmap](docs/ROADMAP.md) — the build plan in small batches, starting with the first playable version

## Play

**https://raynesj93.github.io/Runebound-Chronicles/**

- **Desktop:** click to walk, or use WASD / arrow keys. R toggles run. Mouse wheel or + / − zooms.
- **iPhone:** tap to walk, or use the on-screen joystick. Pinch to zoom. For full-screen play, open the link in Safari, tap Share, then **Add to Home Screen**.
- Tap or click people to talk to them, and signs, doors and other objects to look at them. Number keys pick answers on desktop.
- Head north out of the village to reach Route 1 — Thornwood Forest.
- Open **Skills** (sword button, or K) to see your levels. The **Combat** tab chooses your attack style: Accurate trains Attack, Aggressive trains Strength, Defensive trains Defence, Controlled trains all three.
- Tap or click a goblin to attack it. Your character walks up and fights automatically. Tap the ground or move to stop. Beware the Goblin Brute by the tents: it attacks on sight.
- Tap loot on the ground to walk over and pick it up (a pile gives you a choice). Open your **Inventory** (bag button, or I) and tap an item to examine or drop it; drag items to rearrange them. Tap a weapon or armour piece and choose **Wield** or **Wear**; the **Equipment** tab shows what you're wearing and your total bonuses.
- Ask **Bram** (the woodcutter) for a bow and **Wren** (on the north road) about her staff. Put arrows in your ammo slot to shoot; with the staff, pick a spell in the **Combat** tab. Watch out for the wolf den to the north-east.
- Walk into the **General Store** and **Bank** in Brambleford. Talk to Pell to trade, and Edda or any booth to bank. Pick 1 / 5 / 10 / All, then tap items to move them. Tap food to **Eat** and potions to **Drink**.
- If you die you keep your 3 most valuable items; the rest wait in a gravestone where you fell for 15 minutes (free to reclaim for the first 5).

## Status

**v0.9.0 — Batches 0–8 done:** the village of Brambleford and Route 1 (Thornwood Forest), 8 villagers with branching conversations, real-time overworld combat against goblins, combat skills that level to 99 on the OSRS XP curve, loot: goblins drop items (with rare drops) that you pick up into a 28-slot inventory, equipment with bonuses that feed the combat formulas, Ranged and Magic with bows, staves, spells and wolves, and the full trading loop: walk-in bank and General Store, food, potions, and gravestones when you die. Plus Emerald-style movement, run energy, and local saving with backup codes.

Next: **Batch 9** — the v0.1 polish pass that completes the first playable version (see the [roadmap](docs/ROADMAP.md)).

## Running it locally

There is no build step. Serve the folder with any static web server and open it in a browser, for example:

```
python3 -m http.server 8000
```

then visit http://localhost:8000.

## Code layout

| Folder | What's in it |
| --- | --- |
| `src/core` | Game tick (0.6 s), game state, saving with versions and migrations |
| `src/world` | Tile grid, collision and pathfinding |
| `src/render` | Pixel-art sprites drawn in code, ground, buildings, camera and depth sorting |
| `src/entities` | The player's movement, villagers (NPCs) and enemies |
| `src/combat` | Combat formulas and the tick-based fighting system |
| `src/skills` | XP curve, levels, attack styles |
| `src/items` | Inventory, equipment, bank, shop, loot rolls, ground items, death and gravestones |
| `src/input` | Keyboard, mouse, touch, pinch and D-pad |
| `src/ui` | On-screen interface: banner, messages, run orb, dialogue, settings |
| `data/areas` | Map data for each area |
| `data/npcs.js` | Villagers: where they live, how they look, what they say |
| `data/enemies.js` | Monster stats and loot tables |
| `data/items.js` | Every item: name, stacking, value, examine text, equipment stats |
| `data/spells.js` | Combat spells: level, max hit, runes, XP |
| `data/shops.js` | Shop stock lists |

## Stack

HTML canvas and plain JavaScript modules — no libraries — hosted on GitHub Pages. All art is drawn in code. Saves are stored locally in the browser, with export/import for backups.

All art, names and content are original. This project is not affiliated with Nintendo, Game Freak, The Pokémon Company or Jagex.
