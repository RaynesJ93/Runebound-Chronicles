"""Builds the game's art atlas from the cut-out sprite sheets.

    python3 tools/cut_sheets.py  SHEETS_DIR CUT_DIR     # once, cuts the sheets up
    python3 tools/build_art.py   CUT_DIR                # makes assets/art.png + art.json

Each entry below names a sprite in the game, says which cut-out it comes
from (sheet, number) and how big it should be in game pixels (16 px = 1 tile).
Sprites the game doesn't find in the atlas are drawn in code as before.
"""
import sys, os, json
import numpy as np
from PIL import Image, ImageOps, ImageEnhance

sys.path.insert(0, os.path.dirname(__file__))
from shrink import shrink
from seamless import seamless

CUT = sys.argv[1]
ROOT = os.path.join(os.path.dirname(__file__), '..')

def src(sheet, n, box=None):
    im = Image.open(f'{CUT}/{sheet}/{n}.png').convert('RGBA')
    if box:  # (x0, y0, x1, y1) as fractions of the cut-out
        w, h = im.size
        im = im.crop((int(box[0] * w), int(box[1] * h), int(box[2] * w), int(box[3] * h)))
        im = im.crop(im.getbbox())
    return im

def tint(im, bright=1.0, sat=1.0):
    a = im.getchannel('A')
    rgb = ImageEnhance.Color(ImageEnhance.Brightness(im.convert('RGB')).enhance(bright)).enhance(sat)
    out = rgb.convert('RGBA'); out.putalpha(a); return out

NAT, PROPS, GROUND = '01_nature', '05_village_props', '16_ground_tiles'

# name: list of (image, size) variants. size = dict(w=.. or h=..), and 'box' to pad into a fixed box.
SPRITES = {}
def add(name, im, **size):
    SPRITES.setdefault(name, []).append((im, size))

# ---- Nature -------------------------------------------------------------------
oak, pine = src(NAT, 0), src(NAT, 2)
add('oak', oak, h=56); add('oak', ImageOps.mirror(oak), h=54)
add('oak', tint(oak, 0.9, 0.95), h=52); add('oak', tint(ImageOps.mirror(oak), 1.06), h=58)
add('pine', pine, h=58); add('pine', ImageOps.mirror(pine), h=54)
add('pine', tint(pine, 0.88), h=60); add('pine', tint(ImageOps.mirror(pine), 1.05), h=52)
add('birch', src(NAT, 3), h=56); add('oldOak', src(NAT, 1), h=72); add('sapling', src(NAT, 19), h=22)
bush, berry = src(NAT, 4), src(NAT, 5)
add('bush', bush, w=22); add('bush', ImageOps.mirror(bush), w=20); add('bush', berry, w=20); add('bush', tint(bush, 0.9), w=21)
grass = src(NAT, 6)
for k in range(4): add('tallGrass', ImageOps.mirror(grass) if k % 2 else grass, w=15 - k % 2, box=(16, 14))
for n in (7, 8, 9, 10):
    f = src(NAT, n)
    add('flowers', f, w=13, box=(16, 16)); add('flowers', ImageOps.mirror(f), w=12, box=(16, 16))
mush = src(NAT, 11)
add('mushrooms', mush, w=13, box=(16, 16)); add('mushrooms', ImageOps.mirror(mush), w=11, box=(16, 16)); add('mushrooms', mush, w=9, box=(16, 16))
big, small = src(NAT, 12), src(NAT, 13)
add('rock', big, w=20); add('rock', ImageOps.mirror(big), w=19); add('rock', small, w=15); add('rock', ImageOps.mirror(small), w=14)
stump = src(NAT, 14)
add('stump', stump, w=18); add('stump', ImageOps.mirror(stump), w=17)
add('logPile', src(NAT, 16), w=30)
add('reeds', src(NAT, 18), h=20); add('lilyPads', src(NAT, 17), w=16)

# ---- Village props -------------------------------------------------------------
add('well', src(PROPS, 0), h=42)
add('stall', src(PROPS, 1), w=38)
add('lamp', src(PROPS, 2), h=36)
add('sign', src(PROPS, 3), w=20)
add('scarecrow', src(PROPS, 6), h=34)
add('crop', src(PROPS, 7, (0, 0, 0.34, 0.5)), w=12, box=(16, 16))      # young turnip leaves
add('crop', src(PROPS, 8, (0, 0.5, 0.34, 1)), w=14, box=(16, 16))      # a ripe pumpkin
add('tanningRack', src(PROPS, 9), h=28)
pit = src(PROPS, 10)
add('cookingPit', pit, w=24); add('cookingPit', tint(pit, 1.12), w=24)
fire = src(PROPS, 11)
add('campfire', fire, w=18); add('campfire', tint(ImageOps.mirror(fire), 1.1), w=18)
tent = src(PROPS, 12)
add('tent', tent, w=36); add('tent', ImageOps.mirror(tent), w=36)
add('crate', src(PROPS, 13), w=16)
add('barrel', src(PROPS, 14), w=15)
add('chest', src(PROPS, 15), w=18)
add('campChest', src(PROPS, 15), w=22)
add('crateStack', src(PROPS, 18), w=26)
add('openBarrel', src(PROPS, 19), w=15)
# fence: one post, and the rails between two posts (taken from the straight fence)
add('fencePost', src(PROPS, 4, (0, 0, 0.17, 1)), h=20)
add('fenceRail', src(PROPS, 4, (0.12, 0.08, 0.88, 0.85)), w=18, outline=False)

# ---- Ground textures (64 x 64, repeat every 4 tiles) --------------------------------
# name: (cut-out number, size in pixels, calm) — calm pulls colours toward the
# average so busy textures don't fight the sprites drawn on top of them.
TEXTURES = {'grass': (0, 64, 0.45), 'path': (3, 32, 0.25), 'plaza': (4, 32, 0.15), 'sand': (5, 48, 0.2), 'dirt': (6, 48, 0.1),
            'water0': (7, 64, 0.25), 'water1': (8, 64, 0.25), 'bridge': (9, 32, 0), 'floor': (10, 32, 0.1), 'cave': (12, 32, 0.2),
            'rockwall': (13, 32, 0.1), 'valeGrass': (14, 64, 0.4), 'valePath': (15, 32, 0.25), 'valeWater0': (16, 64, 0.2), 'valeWater1': (17, 64, 0.2)}

def calm(im, k):
    a = np.array(im).astype(np.float32)
    mean = a[..., :3].reshape(-1, 3).mean(0)
    a[..., :3] = a[..., :3] * (1 - k) + mean * k
    return Image.fromarray(a.astype(np.uint8))

def build():
    tiles = []  # (name, k, Image, ax, ay)
    for name, vs in SPRITES.items():
        for k, (im, size) in enumerate(vs):
            size = dict(size)
            box = size.pop('box', None)
            outline = size.pop('outline', True)
            s = shrink(im, outline=outline, **size)
            if box:
                bw, bh = box
                s = s.crop((0, 0, min(s.width, bw), min(s.height, bh))) if (s.width > bw or s.height > bh) else s
                c = Image.new('RGBA', (bw, bh)); c.alpha_composite(s, ((bw - s.width) // 2, bh - s.height)); s = c
            a = np.array(s.getchannel('A'))
            rows = np.where(a.max(1) > 0)[0]
            ay = int(rows[-1]) if len(rows) else s.height - 1
            tiles.append((name, k, s, s.width // 2, ay))
    for name, (n, size, k) in TEXTURES.items():
        t = calm(shrink(seamless(src(GROUND, n)).convert('RGBA'), w=size, h=size, outline=False, colors=32), k)
        tiles.append(('tex:' + name, 0, t, 0, 0))
    # pack into rows, tallest first
    tiles.sort(key=lambda t: -t[2].height)
    W, x, y, rowh, placed = 512, 0, 0, 0, []
    for t in tiles:
        im = t[2]
        if x + im.width > W: x, y, rowh = 0, y + rowh + 1, 0
        placed.append((t, x, y)); x += im.width + 1; rowh = max(rowh, im.height)
    atlas = Image.new('RGBA', (W, y + rowh))
    meta = {}
    for (name, k, im, ax, ay), px, py in placed:
        atlas.alpha_composite(im, (px, py))
        meta.setdefault(name, []).append((k, [px, py, im.width, im.height, ax, ay]))
    meta = {n: [v for _, v in sorted(vs)] for n, vs in meta.items()}
    os.makedirs(f'{ROOT}/assets', exist_ok=True)
    atlas.save(f'{ROOT}/assets/art.png', optimize=True)
    with open(f'{ROOT}/assets/art.json', 'w') as f: json.dump(meta, f, separators=(',', ':'))
    print('atlas', atlas.size, len(placed), 'images', os.path.getsize(f'{ROOT}/assets/art.png') // 1024, 'KB')

build()
