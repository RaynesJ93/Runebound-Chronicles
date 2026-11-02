# RuneBound Chronicles

A browser-based low-poly fantasy RPG for desktop and iPhone.

It pairs **Pokémon Emerald-style exploration** (angled top-down camera, grid movement, towns, routes, NPC dialogue, story progression) with **Old School RuneScape-style gameplay** (real-time overworld combat, roaming enemies, loot drops, skills to level 99, equipment, banking, a 28-slot inventory and quests).

There are no turn-based battles, no battle screens and no creature catching. You fight in the world, with your own weapons and spells.

## Documents

- [Game design](docs/GAME_DESIGN.md) — the full design: combat, skills, XP curve, loot, items, death rules, controls, architecture and saving
- [Roadmap](docs/ROADMAP.md) — the build plan in small batches, starting with the first playable version

## Play

**https://raynesj93.github.io/Runebound-Chronicles/**

- **Desktop:** click to walk, or use WASD / arrow keys. R toggles run. Mouse wheel zooms.
- **iPhone:** tap to walk, or use the on-screen D-pad. Pinch to zoom. For full-screen play, open the link in Safari, tap Share, then **Add to Home Screen**.
- Tap or click signs, doors, the well and the market stall to look at them.

## Status

**v0.1.0 — Batches 0 and 1 done:** the starting village of Brambleford, Emerald-style camera and movement, tap-to-move pathfinding, run energy, and local saving with backup codes.

Next: **Batch 2** — NPCs, dialogue and the first forest route (see the [roadmap](docs/ROADMAP.md)).

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
| `src/render` | Three.js scene, camera, terrain, props, buildings, characters |
| `src/entities` | The player's movement |
| `src/input` | Keyboard, mouse, touch, pinch and D-pad |
| `src/ui` | On-screen interface: banner, messages, run orb, dialogue, settings |
| `data/areas` | Map data for each area |
| `vendor/three` | Three.js r160 (MIT licence), bundled so the game works without other sites |

## Stack

Three.js and plain JavaScript modules, hosted on GitHub Pages. Saves are stored locally in the browser, with export/import for backups.

All art, names and content are original. This project is not affiliated with Nintendo, Game Freak, The Pokémon Company or Jagex.
