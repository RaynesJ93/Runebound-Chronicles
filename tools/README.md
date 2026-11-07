# Art tools

The painted art comes from sprite sheets on magenta backgrounds (kept outside
the repo). To rebuild the atlas after changing `build_art.py`:

    python3 tools/cut_sheets.py  path/to/sheets  /tmp/cut     # cut every sheet into numbered sprites
    python3 tools/build_art.py   /tmp/cut                     # writes assets/art.png + assets/art.json

`cut_sheets.py` also writes `<sheet>__index.png` contact sheets showing each
sprite's number, which is how `build_art.py` refers to them. Needs Python 3
with Pillow, NumPy and SciPy.

There are two sets of sheets (01–16 and 17–31). Cut both into the same folder
before building. Sheet 21 (worn gear) is cut by its own script into
`<cut>/21_gear/<item>-<direction>.png` (one standing frame per direction).

## Ready-made sprites

Sprites that are already cut from a magenta sheet and shrunk to game size live
in `tools/sprites/`. `python3 tools/derived.py` adds any that aren't in the
atlas yet. A file is one sprite and a folder holds the frames of one (0.png,
1.png, ...); names are atlas keys with `:` written as `__` (so
`chars__lyra/` is `chars:lyra`). Anchors come from `tools/sprites/anchors.json`
when listed; otherwise characters and animations are centred on their feet,
icons sit on their bottom row, and anything else is anchored at its bottom
middle.

What's there:
- Pell's wrecked cart and three broken barrels (`brokenCart`, `brokenBarrel`,
  `toppledBarrel`, `smashedBarrel`).
- From the "images 01-09" sheets (Nov 2026), made by `tools/new_art.py`:
  - Lyra, Tobin, the warren goblin, the Goblin Digmaster and Grubnak, with
    walking frames.
  - Grubnak's attack animation.
  - The ten Runebound story item icons.
  - The rune door, shut and open.
  - Bronze held pickaxe, darts, throwing knife and javelin.

  `derived.py` recolours the held weapons into iron, steel, mithril, adamant
  and rune, and makes Grubnak's statue from his frames.

To redo them from the sheets: rename the sheet files `new01_...` to `new09_...`
(the cutter treats `07_`, `08_` and `09_` as the old character sheets), then:

    python3 tools/cut_sheets.py  <sheets>  <cut>
    python3 tools/new_art.py     <cut>
    python3 tools/derived.py

Sprites already in the atlas aren't replaced, so remove their keys from
`assets/art.json` first when redoing one.
