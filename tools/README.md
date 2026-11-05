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

Small one-off sprites (already cut from a magenta sheet and shrunk to game
size) live in `tools/sprites/<name>.png`. `python3 tools/derived.py` adds any
that aren't in the atlas yet, anchored at the bottom middle, under `<name>`.
So far: Pell's wrecked cart and three broken barrels (`brokenCart`,
`brokenBarrel`, `toppledBarrel`, `smashedBarrel`).
