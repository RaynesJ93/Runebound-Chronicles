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

## Status

**v0.3.0 — Batches 0–2 done:** the village of Brambleford and Route 1 (Thornwood Forest), 8 villagers to talk to with branching conversations, Emerald-style top-down movement, tap-to-move pathfinding, run energy, and local saving with backup codes.

Next: **Batch 3** — real-time overworld combat with roaming goblins (see the [roadmap](docs/ROADMAP.md)).

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
| `src/entities` | The player's movement and villagers (NPCs) |
| `src/input` | Keyboard, mouse, touch, pinch and D-pad |
| `src/ui` | On-screen interface: banner, messages, run orb, dialogue, settings |
| `data/areas` | Map data for each area |
| `data/npcs.js` | Villagers: where they live, how they look, what they say |

## Stack

HTML canvas and plain JavaScript modules — no libraries — hosted on GitHub Pages. All art is drawn in code. Saves are stored locally in the browser, with export/import for backups.

All art, names and content are original. This project is not affiliated with Nintendo, Game Freak, The Pokémon Company or Jagex.
