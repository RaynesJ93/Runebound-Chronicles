"""Painted art made from other painted art, for items that have no sheet of
their own yet: a recoloured copy of an existing sprite.

build_art.py adds these at the end of every build. To add them to an atlas
that is already built (no sheets needed), run:

    python3 tools/derived.py

It appends any missing derived sprites to assets/art.png and art.json and
leaves everything else exactly where it was.
"""
import json, os, sys
import numpy as np
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..')


def hard_leather(im):
    """Leather browns -> the darker, redder brown of hard leather. Brass
    buckles and studs (bright yellow) are left alone."""
    rgba = np.array(im.convert('RGBA'))
    hsv = np.array(im.convert('RGB').convert('HSV')).astype(np.float32)
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    brass = (h > 24) & (h < 50) & (s > 110) & (v > 150)
    leather = (rgba[..., 3] > 0) & ~brass
    h2 = np.where(leather, np.clip(h - 6, 0, 255), h)       # a touch redder
    s2 = np.where(leather, s * 0.85, s)                      # a little duller
    v2 = np.where(leather, v * 0.78, v)                      # darker
    out = Image.fromarray(np.stack([h2, s2, v2], -1).clip(0, 255).astype(np.uint8), 'HSV').convert('RGBA')
    o = np.array(out)
    o[..., 3] = rgba[..., 3]
    return Image.fromarray(o, 'RGBA')


# new name: (copied from, recolour). Every prefix that exists for the source is copied.
DERIVED = {
    'hardLeatherGloves': ('leatherGloves', hard_leather),
    'hardLeatherBoots': ('leatherBoots', hard_leather),
    'hardLeatherCowl': ('leatherCowl', hard_leather),
    'hardLeatherChaps': ('leatherChaps', hard_leather),
}
PREFIXES = ['icon:{}', 'iconS:{}', 'gear:{}:down', 'gear:{}:up', 'gear:{}:left', 'gear:{}:right']


def derive(get):
    """get(name) -> list of (k, image, ax, ay) for an existing sprite, or [].
    Returns new (name, k, image, ax, ay) tiles."""
    out = []
    for new, (old, fn) in DERIVED.items():
        for p in PREFIXES:
            for k, im, ax, ay in get(p.format(old)):
                out.append((p.format(new), k, fn(im), ax, ay))
    return out


def patch():
    png, js = f'{ROOT}/assets/art.png', f'{ROOT}/assets/art.json'
    atlas = Image.open(png).convert('RGBA')
    meta = json.load(open(js))

    def get(name):
        return [(k, atlas.crop((x, y, x + w, y + h)), ax, ay) for k, (x, y, w, h, ax, ay) in enumerate(meta.get(name, []))]

    tiles = [t for t in derive(get) if t[0] not in meta]
    if not tiles:
        print('nothing to add'); return
    # pack below the existing atlas, tallest first, same row packing as build_art.py
    tiles.sort(key=lambda t: -t[2].height)
    W, x, y0, rowh, placed = atlas.width, 0, atlas.height + 1, 0, []
    y = y0
    for t in tiles:
        im = t[2]
        if x + im.width > W: x, y, rowh = 0, y + rowh + 1, 0
        placed.append((t, x, y)); x += im.width + 1; rowh = max(rowh, im.height)
    big = Image.new('RGBA', (W, y + rowh))
    big.alpha_composite(atlas, (0, 0))
    for (name, k, im, ax, ay), px, py in placed:
        big.alpha_composite(im, (px, py))
        lst = meta.setdefault(name, [])
        while len(lst) <= k: lst.append(None)
        lst[k] = [px, py, im.width, im.height, ax, ay]
    big.save(png, optimize=True)
    with open(js, 'w') as f: json.dump(meta, f, separators=(',', ':'))
    print('added', len(placed), 'images; atlas', big.size, os.path.getsize(png) // 1024, 'KB')


if __name__ == '__main__':
    patch()
