"""Turns ChatGPT art sheets into game-size sprites in tools/sprites/, where
tools/derived.py adds them to the atlas.

    python3 tools/cut_sheets.py  <sheets>  <cut>     # only for the 'images01-09' set
    python3 tools/new_art.py     <set>  <cut or sheets folder>
    python3 tools/derived.py

Sets:
  images01-09   (7 Nov 2026) Lyra, the story items, held weapons, the rune door,
                Grubnak, Tobin, the warren goblin and the Digmaster. Reads the
                output of cut_sheets.py (sheet files renamed new01_... so they
                don't clash with the old 07_-09_ grids).
  monsters01-12 (15 Nov 2026) Kesta and eleven monsters. Reads the sheets
                themselves (grid_cells): 12 frames each, loose bits (a leaf,
                smoke) kept with their frame.
  slayergear    (15 Nov 2026) One 3 x 2 sheet: the superior slayer helmet's
                icon, the slayer ring's icon, then the helmet worn facing down,
                up, left and right (sized and placed like the rune full helm).
  overgrowth    (16 Nov 2026) The Overgrowth (the Slayer Caverns' fifth
                section): A_ textures, B_ decorations, like slayercaves.
  vinegrasp-art (16 Nov 2026) The vinegrasp horror (1_), the six slayer gear
                icons (2_, 3 x 2) and the whip, staff and two boots worn or
                held facing down/up/left/right (3_, 4 x 4).
  lumenhaven    (17 Nov 2026) Lumenhaven (01_-07_): four ground textures, eight
                decorations, the eight new altars (two frames: the second
                glows brighter), eight rune icons and three monsters.
  batch1        (16 Nov 2026) Skill review batch 1: five trees (1_, a row),
                item icons (2_, 3 x 3: logs, lobster pot, harpoon, stew,
                burnt pie), bows (3_, 5 x 2: shortbows, longbows) and fish
                (4_, 5 x 2: raw, cooked). Held bows stay derived.
  bessie        (17 Nov 2026) Old Bessie (1_, the usual 4 x 3 monster sheet;
                rows: down, up, left, right) and Bessie's cowbell (2_, 1 x 3:
                icon, worn facing down, worn facing up; tops lined up with the
                gold amulet's). Left/right worn stay derived from the amulet.
  batch3        (17 Nov 2026) Skill review batch 3: item icons (1_, rows of
                5/5/3/3: dragonstone gems and jewellery, hides, leathers,
                stalkerhide and wyrmhide armour) and worn views (2_, 5 x 4:
                the two bodies and chaps facing down/up/left/right, then the
                gold and silver dragonstone amulets facing down and up).
  gems          (27 Nov 2026) Gems: one 5 x 2 sheet, uncut on top, cut below;
                sapphire, emerald, ruby, diamond, dragonstone. Keyed strictly
                (ruby and dragonstone sit close to magenta).
  bones         (26 Nov 2026) Bones and bone ammo: one 5 x 4 sheet, a row per
                bone (bones, big, cursed, wyrm); columns: bones, arrowtips,
                dart tips, arrows, darts.
  slayercaves   (15 Nov 2026) The Slayer Caverns' four sections: for each,
                a sheet of floor + wall textures (1A, 2A...) and a 3 x 2
                sheet of decorations (1B, 2B...).

File names in tools/sprites/ are atlas keys with ':' written as '__'. A folder
holds the frames of one key (0.png, 1.png, ...). tools/sprites/anchors.json
gives anchors that aren't the default (see derived.py).
"""
import glob
import json
import os
import sys

import numpy as np
from PIL import Image, ImageOps

sys.path.insert(0, os.path.dirname(__file__))
from shrink import shrink  # noqa: E402
from cut_sheets import key_magenta  # noqa: E402

SET, SRC = sys.argv[1], sys.argv[2]
OUT = os.path.join(os.path.dirname(__file__), 'sprites')
ROOT = os.path.join(os.path.dirname(__file__), '..')
DIRS = ('down', 'up', 'left', 'right')


def save_frames(key, frames):
    d = os.path.join(OUT, key.replace(':', '__'))
    os.makedirs(d, exist_ok=True)
    for f in os.listdir(d):
        os.remove(os.path.join(d, f))
    for k, im in enumerate(frames):
        im.save(os.path.join(d, f'{k}.png'))


def scaled(im, k):
    return shrink(im, w=max(1, round(im.width * k)), h=max(1, round(im.height * k)))


def by_direction(grid, sides):
    """grid: 4 rows x 3 frames (down, up, then two side rows). sides: which way
    rows 3 and 4 face. A missing direction is the other one mirrored."""
    out = {'down': grid[0], 'up': grid[1]}
    for row, side in zip(grid[2:], sides):
        out.setdefault(side, row)
    for a, b in (('left', 'right'), ('right', 'left')):
        if a not in out:
            out[a] = [ImageOps.mirror(im) for im in out[b]]
    return out


def walk_frames(grid, sides, height):
    """Game order per direction: stand, step, step. One scale for the whole
    sheet, from the standing front frame."""
    dirs = by_direction(grid, sides)
    k = height / dirs['down'][1].height
    return [scaled(dirs[d][c], k) for d in DIRS for c in (1, 0, 2)], k


def grid_cells(path, rows=4, cols=3, grow=6):
    """Cut a magenta sheet into rows x cols frames. Each frame is a blob of art
    (with nearby loose bits like a leaf or smoke joined on); the blobs are
    sorted into rows by height on the sheet, then left to right."""
    from scipy import ndimage
    rgb = np.array(Image.open(path).convert('RGB'))
    rgb, alpha = key_magenta(rgb)
    on = alpha > 0
    lab, n = ndimage.label(ndimage.binary_dilation(on, iterations=grow))
    boxes = ndimage.find_objects(lab)
    sizes = ndimage.sum(on, lab, range(1, n + 1))
    keep = sorted(range(n), key=lambda i: -sizes[i])[:rows * cols]
    blobs = []
    for i in keep:
        sy, sx = boxes[i]
        mask = (lab[sy, sx] == i + 1) & on[sy, sx]
        a = np.where(mask, alpha[sy, sx], 0)
        blobs.append(((sy.start + sy.stop) / 2, (sx.start + sx.stop) / 2,
                      Image.fromarray(np.dstack([rgb[sy, sx], a]).astype(np.uint8), 'RGBA')))
    blobs.sort(key=lambda b: b[0])
    grid = [sorted(blobs[r * cols:(r + 1) * cols], key=lambda b: b[1]) for r in range(rows)]
    return [[b[2].crop(b[2].getbbox()) for b in row] for row in grid]


if SET == 'monsters01-12':
    # key                                file prefix  height (standing, front)  sides (row 3, row 4)
    SHEETS = {
        'chars:kesta':                 ('01_', 24, ('left', 'left')),
        'chars:enemy:giantSpider':     ('02_', 15, ('left', 'right')),
        'chars:enemy:giantCrab':       ('03_', 13, ('left', 'right')),
        'chars:enemy:bandit':          ('04_', 24, ('left', 'right')),
        'chars:enemy:skeleton':        ('05_', 24, ('left', 'right')),
        'chars:enemy:restlessGhost':   ('06_', 24, ('left', 'left')),
        'chars:enemy:airElemental':    ('07_', 26, ('left', 'left')),
        'chars:enemy:fireImp':         ('08_', 18, ('left', 'right')),
        'chars:enemy:caveCrawler':     ('09_', 20, ('right', 'right')),
        'chars:enemy:bloodbat':        ('10_', 15, ('left', 'right')),
        'chars:enemy:stoneWraith':     ('11_', 30, ('left', 'left')),
        'chars:enemy:emberWyrm':       ('12_', 30, ('right', 'right')),
    }
    for key, (prefix, height, sides) in SHEETS.items():
        path = glob.glob(os.path.join(SRC, prefix + '*.png'))[0]
        frames, k = walk_frames(grid_cells(path), sides, height)
        save_frames(key, frames)
        print(key, frames[0].size, frames[6].size)

elif SET == 'slayergear':
    path = glob.glob(os.path.join(SRC, '*.png'))[0]
    cells = [im for row in grid_cells(path, rows=2, cols=3) for im in row]

    def boxed(im, size, fit):
        k = min(fit / im.width, fit / im.height)
        sm = scaled(im, k)
        c = Image.new('RGBA', (size, size))
        c.alpha_composite(sm, ((size - sm.width) // 2, (size - sm.height) // 2))
        return c

    for n, item in ((0, 'superiorSlayerHelmet'), (1, 'slayerRing')):
        boxed(cells[n], 32, 28).save(os.path.join(OUT, f'icon__{item}.png'))
        boxed(cells[n], 16, 15).save(os.path.join(OUT, f'iconS__{item}.png'))
    # Worn: as wide as the rune full helm in each direction, bottoms lined up
    # (the crest of spikes sticks up above it).
    meta = json.load(open(os.path.join(ROOT, 'assets', 'art.json')))
    anchors = {}
    for d, n in zip(DIRS, (2, 3, 4, 5)):
        x, y, w, h, ax, ay = meta[f'gear:runeFullHelm:{d}'][0]
        im = cells[n]
        sm = scaled(im, (w + 1) / im.width)
        key = f'gear:superiorSlayerHelmet:{d}'
        sm.save(os.path.join(OUT, key.replace(':', '__') + '.png'))
        anchors[key] = [round(sm.width / 2 + (ax - w / 2)), sm.height + (ay - h)]
    path = os.path.join(OUT, 'anchors.json')
    old = json.load(open(path)) if os.path.exists(path) else {}
    old.update(anchors)
    json.dump(old, open(path, 'w'), indent=1, sort_keys=True)

elif SET == 'vinegrasp-art':
    path = lambda p: glob.glob(os.path.join(SRC, p + '*.png'))[0]
    frames, _ = walk_frames(grid_cells(path('1_')), ('left', 'right'), 30)
    save_frames('chars:enemy:vinegraspHorror', frames)

    def boxed(im, size, fit):
        k = min(fit / im.width, fit / im.height)
        sm = scaled(im, k)
        c = Image.new('RGBA', (size, size))
        c.alpha_composite(sm, ((size - sm.width) // 2, (size - sm.height) // 2))
        return c

    icons = [im for row in grid_cells(path('2_'), rows=2, cols=3, grow=14) for im in row]
    for im, item in zip(icons, ('vineWhip', 'wraithboneStaff', 'crawlerShellBoots', 'wyrmscaleBoots', 'bloodbatGloves', 'huntersGauntlets')):
        boxed(im, 32, 28).save(os.path.join(OUT, f'icon__{item}.png'))
        boxed(im, 16, 15).save(os.path.join(OUT, f'iconS__{item}.png'))

    # Worn/held: each sized like the item it's modelled on, bottoms lined up with it.
    meta = json.load(open(os.path.join(ROOT, 'assets', 'art.json')))
    anchors = {}
    views = grid_cells(path('3_'), rows=4, cols=4, grow=14)
    for row, (item, ref, fit) in zip(views, (('vineWhip', 'runeScimitar', 'long'), ('wraithboneStaff', 'apprenticeStaff', 'long'),
                                             ('crawlerShellBoots', 'runeBoots', 'wide'), ('wyrmscaleBoots', 'runeBoots', 'wide'))):
        for im, d in zip(row, DIRS):
            x, y, w, h, ax, ay = meta[f'gear:{ref}:{d}'][0]
            # long things (whip, staff) as long as the reference; boots fit inside its box
            k = (max(w, h) + 1) / max(im.width, im.height) if fit == 'long' else min((w + 1) / im.width, (h + 1) / im.height)
            sm = scaled(im, k)
            key = f'gear:{item}:{d}'
            sm.save(os.path.join(OUT, key.replace(':', '__') + '.png'))
            anchors[key] = [round(sm.width / 2 + (ax - w / 2)), sm.height + (ay - h)]
    p = os.path.join(OUT, 'anchors.json')
    old = json.load(open(p)) if os.path.exists(p) else {}
    old.update(anchors)
    json.dump(old, open(p, 'w'), indent=1, sort_keys=True)

elif SET == 'lumenhaven':
    from seamless import seamless
    from scipy import ndimage
    path = lambda p: glob.glob(os.path.join(SRC, p + '*.png'))[0]

    def boxed(im, size, fit):
        k = min(fit / im.width, fit / im.height)
        sm = scaled(im, k)
        c = Image.new('RGBA', (size, size))
        c.alpha_composite(sm, ((size - sm.width) // 2, (size - sm.height) // 2))
        return c

    # 01: four textures, 2 x 2 (grass, path, market paving, starlit water)
    rgb, alpha = key_magenta(np.array(Image.open(path('01_')).convert('RGB')))
    lab, n = ndimage.label(alpha > 0)
    boxes = sorted(ndimage.find_objects(lab), key=lambda b: -(b[0].stop - b[0].start) * (b[1].stop - b[1].start))[:4]
    boxes.sort(key=lambda b: (round(b[0].start / 200), b[1].start))
    for (sy, sx), name in zip(boxes, ('faeGrass', 'faePath', 'faePlaza', 'faeWater0')):
        im = Image.fromarray(rgb[sy.start + 6:sy.stop - 6, sx.start + 6:sx.stop - 6].astype(np.uint8))
        t = shrink(seamless(im).convert('RGBA'), w=64, h=64, outline=False, colors=40)
        t.save(os.path.join(OUT, f'tex__{name}.png'))
        if name == 'faeWater0':
            # the second water frame: shifted a little, with the sparkles brighter
            a = np.roll(np.array(t).astype(np.float32), (2, 3), axis=(0, 1))
            lum = a[..., :3].mean(2)
            a[lum > np.percentile(lum, 94), :3] *= 1.25
            Image.fromarray(a.clip(0, 255).astype(np.uint8), 'RGBA').save(os.path.join(OUT, 'tex__faeWater1.png'))
    # 02: eight decorations, 4 x 2 (game-pixel widths)
    decor = [im for row in grid_cells(path('02_'), rows=2, cols=4, grow=10) for im in row]
    for im, (key, w) in zip(decor, (('faeStallLeaf', 30), ('faeStallSilk', 30), ('starWell', 22), ('faeLantern', 17),
                                    ('giantToadstool', 22), ('crystalCluster', 16), ('fairyRing', 32), ('faeBridge', 32))):
        scaled(im, w / im.width).save(os.path.join(OUT, f'decor__{key}.png'))
    # 03: eight altars, 4 x 2, as wide as the air altar; frame 2 glows brighter
    altars = [im for row in grid_cells(path('03_'), rows=2, cols=4, grow=10) for im in row]
    for im, v in zip(altars, ('earth', 'fire', 'body', 'cosmic', 'chaos', 'nature', 'law', 'death')):
        a = scaled(im, 48 / im.width)
        d = os.path.join(OUT, f'altar__{v}')
        os.makedirs(d, exist_ok=True)
        a.save(os.path.join(d, '0.png'))
        b = np.array(a).astype(np.float32)
        lum = b[..., :3].max(2)
        glow = (b[..., 3] > 0) & (lum > np.percentile(lum[b[..., 3] > 0], 85))
        b[glow, :3] = b[glow, :3] * 1.18 + 18
        Image.fromarray(b.clip(0, 255).astype(np.uint8), 'RGBA').save(os.path.join(d, '1.png'))
    # 04: eight rune icons, 4 x 2
    runes = [im for row in grid_cells(path('04_'), rows=2, cols=4, grow=6) for im in row]
    for im, r in zip(runes, ('earth', 'fire', 'body', 'cosmic', 'chaos', 'nature', 'law', 'death')):
        boxed(im, 32, 28).save(os.path.join(OUT, f'icon__{r}Rune.png'))
        boxed(im, 16, 15).save(os.path.join(OUT, f'iconS__{r}Rune.png'))
    # 05-07: the three monsters (side rows: left, then right)
    for prefix, key, height in (('05_', 'glimmerwisp', 20), ('06_', 'faeSentinel', 28), ('07_', 'hollowShade', 30)):
        frames, _ = walk_frames(grid_cells(path(prefix), grow=10), ('left', 'right'), height)
        save_frames(f'chars:enemy:{key}', frames)

elif SET == 'batch1':
    path = lambda p: glob.glob(os.path.join(SRC, p + '*.png'))[0]

    def boxed(im, size, fit):
        k = min(fit / im.width, fit / im.height)
        sm = scaled(im, k)
        c = Image.new('RGBA', (size, size))
        c.alpha_composite(sm, ((size - sm.width) // 2, (size - sm.height) // 2))
        return c

    def icon(im, item):
        boxed(im, 32, 28).save(os.path.join(OUT, f'icon__{item}.png'))
        boxed(im, 16, 15).save(os.path.join(OUT, f'iconS__{item}.png'))

    # Trees: about the oak's size (52 wide); the elder is bigger
    trees = grid_cells(path('1_'), rows=1, cols=5, grow=2)[0]
    for im, (name, width) in zip(trees, (('willow', 50), ('maple', 50), ('yew', 50), ('magic', 48), ('elder', 66))):
        scaled(im, width / im.width).save(os.path.join(OUT, f'{name}Tree.png'))
    items = [im for row in grid_cells(path('2_'), rows=3, cols=3, grow=10) for im in row]
    for im, item in zip(items, ('willowLogs', 'mapleLogs', 'yewLogs', 'magicLogs', 'elderLogs', 'lobsterPot', 'harpoon', 'huntersStew', 'burntPie')):
        icon(im, item)
    icon(items[8], 'burntStew')
    bows = grid_cells(path('3_'), rows=2, cols=5, grow=8)
    for row, kind in zip(bows, ('Shortbow', 'Longbow')):
        for im, wood in zip(row, ('willow', 'maple', 'yew', 'magic', 'elder')):
            icon(im, f'{wood}{kind}')
    fish = grid_cells(path('4_'), rows=2, cols=5, grow=8)
    for row, raw in zip(fish, (True, False)):
        for im, f in zip(row, ('Lobster', 'Swordfish', 'Monkfish', 'Shark', 'CaveEel')):
            icon(im, f'raw{f}' if raw else f[0].lower() + f[1:])

elif SET == 'bessie':
    path = lambda p: glob.glob(os.path.join(SRC, p + '*.png'))[0]
    frames, k = walk_frames(grid_cells(path('1_')), ('left', 'right'), 31)
    save_frames('chars:enemy:oldBessie', frames)
    print('oldBessie', frames[0].size, frames[6].size)

    cells = grid_cells(path('2_'), rows=1, cols=3, grow=14)[0]
    k = min(28 / cells[0].width, 28 / cells[0].height)
    for size, fit in ((32, 28), (16, 15)):
        sm = scaled(cells[0], min(fit / cells[0].width, fit / cells[0].height))
        c = Image.new('RGBA', (size, size)); c.alpha_composite(sm, ((size - sm.width) // 2, (size - sm.height) // 2))
        c.save(os.path.join(OUT, f'{"icon" if size == 32 else "iconS"}__bessiesCowbell.png'))
    meta = json.load(open(os.path.join(ROOT, 'assets', 'art.json')))
    anchors = {}
    # (facing down is hand-pixelled in tools/sprites: shrunk from the sheet the bell went muddy)
    for im, d, box in ((cells[2], 'up', (8, 4)),):
        x, y, w, h, ax, ay = meta[f'gear:goldAmulet:{d}'][0]
        sm = scaled(im, min(box[0] / im.width, box[1] / im.height))
        key = f'gear:bessiesCowbell:{d}'
        sm.save(os.path.join(OUT, key.replace(':', '__') + '.png'))
        anchors[key] = [round(sm.width / 2 + (ax - w / 2)), ay]   # tops lined up with the amulet
    p = os.path.join(OUT, 'anchors.json')
    old = json.load(open(p)) if os.path.exists(p) else {}
    old.update(anchors)
    json.dump(old, open(p, 'w'), indent=1, sort_keys=True)

elif SET == 'batch3':
    from scipy import ndimage
    path = lambda p: glob.glob(os.path.join(SRC, p + '*.png'))[0]

    def boxed(im, size, fit):
        k = min(fit / im.width, fit / im.height)
        sm = scaled(im, k)
        c = Image.new('RGBA', (size, size))
        c.alpha_composite(sm, ((size - sm.width) // 2, (size - sm.height) // 2))
        return c

    def strict_key(rgb):
        """Violet gems sit close to magenta, so only near-pure magenta is keyed
        out, and only pixels touching the background are despilled."""
        r, g, b = [rgb[..., k].astype(np.int32) for k in range(3)]
        m = np.minimum(r, b) - g - np.abs(r - b) // 2
        bg = m > 170
        edge = ndimage.binary_dilation(bg, iterations=1) & ~bg & (m > 40)
        out = rgb.copy()
        out[..., 0][edge] = np.minimum(r[edge], g[edge] + 40)
        out[..., 2][edge] = np.minimum(b[edge], g[edge] + 40)
        return out, np.where(bg, 0, 255).astype(np.uint8)

    def rows_of(p, n, grow):
        """Blobs grouped into rows by height on the sheet (rows can differ in length)."""
        rgb, alpha = strict_key(np.array(Image.open(p).convert('RGB')))
        on = alpha > 0
        lab, m = ndimage.label(ndimage.binary_dilation(on, iterations=grow))
        boxes = ndimage.find_objects(lab)
        sizes = ndimage.sum(on, lab, range(1, m + 1))
        blobs = []
        for i in sorted(range(m), key=lambda i: -sizes[i])[:n]:
            sy, sx = boxes[i]
            a = np.where((lab[sy, sx] == i + 1) & on[sy, sx], alpha[sy, sx], 0)
            im = Image.fromarray(np.dstack([rgb[sy, sx], a]).astype(np.uint8), 'RGBA')
            blobs.append(((sy.start + sy.stop) / 2, (sx.start + sx.stop) / 2, im.crop(im.getbbox())))
        blobs.sort(key=lambda b: b[0])
        rows, gap = [], on.shape[0] / 12
        for b in blobs:
            if rows and b[0] - rows[-1][-1][0] < gap: rows[-1].append(b)
            else: rows.append([b])
        return [[b[2] for b in sorted(r, key=lambda b: b[1])] for r in rows]

    names = [['uncutDragonstone', 'dragonstone', 'silverDragonstoneRing', 'goldDragonstoneRing', 'goldDragonstoneAmulet'],
             ['silverDragonstoneAmulet', 'stalkerHide', 'wyrmHide', 'stalkerLeather', 'wyrmhideLeather'],
             ['stalkerhideVambraces', 'stalkerhideChaps', 'stalkerhideBody'],
             ['wyrmhideVambraces', 'wyrmhideChaps', 'wyrmhideBody']]
    rows = rows_of(path('1_'), 16, 10)
    assert [len(r) for r in rows] == [5, 5, 3, 3], [len(r) for r in rows]
    for row, ns in zip(rows, names):
        for im, item in zip(row, ns):
            boxed(im, 32, 28).save(os.path.join(OUT, f'icon__{item}.png'))
            boxed(im, 16, 15).save(os.path.join(OUT, f'iconS__{item}.png'))

    # Worn: each fits inside the box of the studded / gold amulet art it replaces, bottoms lined up.
    meta = json.load(open(os.path.join(ROOT, 'assets', 'art.json')))
    anchors = {}
    views = rows_of(path('2_'), 20, 10)
    assert [len(r) for r in views] == [4, 4, 4, 4, 4], [len(r) for r in views]
    jobs = []
    for row, item, ref in zip(views[:4], ('stalkerhideBody', 'stalkerhideChaps', 'wyrmhideBody', 'wyrmhideChaps'),
                              ('studdedBody', 'studdedChaps', 'studdedBody', 'studdedChaps')):
        jobs += [(im, item, ref, d) for im, d in zip(row, DIRS)]
    am = views[4]
    jobs += [(am[0], 'goldDragonstoneAmulet', 'goldRubyAmulet', 'down'), (am[1], 'goldDragonstoneAmulet', 'goldRubyAmulet', 'up'),
             (am[2], 'silverDragonstoneAmulet', 'silverRubyAmulet', 'down'), (am[3], 'silverDragonstoneAmulet', 'silverRubyAmulet', 'up')]
    for im, item, ref, d in jobs:
        x, y, w, h, ax, ay = meta[f'gear:{ref}:{d}'][0]
        sm = scaled(im, min((w + 1) / im.width, (h + 1) / im.height))
        key = f'gear:{item}:{d}'
        sm.save(os.path.join(OUT, key.replace(':', '__') + '.png'))
        anchors[key] = [round(sm.width / 2 + (ax - w / 2)), sm.height + (ay - h)]
    p = os.path.join(OUT, 'anchors.json')
    old = json.load(open(p)) if os.path.exists(p) else {}
    old.update(anchors)
    json.dump(old, open(p, 'w'), indent=1, sort_keys=True)

elif SET in ('slayercaves', 'overgrowth'):
    from seamless import seamless
    from scipy import ndimage

    def calm(im, k, sat=1.0):
        a = np.array(im).astype(np.float32)
        if sat != 1:
            g = a[..., :3].mean(2, keepdims=True)
            a[..., :3] = g + (a[..., :3] - g) * sat
        mean = a[..., :3].reshape(-1, 3).mean(0)
        a[..., :3] = a[..., :3] * (1 - k) + mean * k
        return Image.fromarray(a.clip(0, 255).astype(np.uint8))

    # Each section: (sheet number, texture name, decorations as (key, width in game px, flat?))
    SECTIONS = {'': ('Vine', [('rootArch', 30), ('thornTendrils', 14), ('glowPod', 12), ('glowFungus', 18), ('vineBones', 20), ('vineBoulder', 17)])} if SET == 'overgrowth' else {
        1: ('Crawl', [('crawlerEggs', 18), ('crawlerHusk', 20), ('slimePuddle', 20), ('dripStalagmite', 13), ('glowMoss', 20), ('gnawedRocks', 18)]),
        2: ('Roost', [('boneNest', 20), ('skullPile', 18), ('bloodPool', 20), ('clawedStalagmite', 15), ('roostRock', 18), ('featherHeap', 20)]),
        3: ('Wraith', [('hoodedStatue', 30), ('graveSlab', 13), ('runePillar', 11), ('ghostCandles', 14), ('masonryRubble', 20), ('spiritUrn', 13)]),
        4: ('Wyrm', [('lavaPool', 30), ('emberVent', 14), ('charredSkeleton', 22), ('dragonEgg', 15), ('scorchedHoard', 17), ('obsidianCluster', 17)]),
    }
    for n, (tex, decor) in SECTIONS.items():
        # A: two squares (floor left, wall right); trim a few px off each edge
        path = glob.glob(os.path.join(SRC, f'{n}A_*.png'))[0]
        rgb, alpha = key_magenta(np.array(Image.open(path).convert('RGB')))
        lab, k = ndimage.label(alpha > 0)
        boxes = sorted(ndimage.find_objects(lab), key=lambda b: -(b[0].stop - b[0].start) * (b[1].stop - b[1].start))[:2]
        boxes.sort(key=lambda b: b[1].start)
        for (sy, sx), name, (kk, sat) in zip(boxes, (f'cave{tex}', f'rockwall{tex}'), ((0.12, 0.9), (0.08, 0.9))):
            im = Image.fromarray(rgb[sy.start + 6:sy.stop - 6, sx.start + 6:sx.stop - 6].astype(np.uint8))
            t = calm(shrink(seamless(im).convert('RGBA'), w=64, h=64, outline=False, colors=32), kk, sat)
            t.save(os.path.join(OUT, f'tex__{name}.png'))
        # B: six decorations, 2 rows x 3
        path = glob.glob(os.path.join(SRC, f'{n}B_*.png'))[0]
        cells = [im for row in grid_cells(path, rows=2, cols=3) for im in row]
        for im, (key, w) in zip(cells, decor):
            scaled(im, w / im.width).save(os.path.join(OUT, f'decor__{key}.png'))
            print(key, scaled(im, w / im.width).size)

elif SET == 'images01-09':
    def src(sheet, n):
        return Image.open(os.path.join(SRC, sheet, f'{n}.png')).convert('RGBA')

    def rows_of(sheet):
        return [[src(sheet, r * 3 + c) for c in range(3)] for r in range(4)]

    CHARS = {
        'chars:lyra':               ('new01_Lyra_the_Stargazer', 24, ('left', 'left')),
        'chars:enemy:grubnak':      ('new05_Grubnak_Walking', 46, ('right', 'right')),
        'chars:tobin':              ('new07_Tobin_the_Hermit', 24, ('left', 'right')),
        'chars:enemy:warrenGoblin': ('new08_Warren_Goblin', 23, ('left', 'right')),
        'chars:enemy:goblinDigmaster': ('new09_Goblin_Digmaster', 28, ('left', 'right')),
    }
    scales = {}
    for key, (sheet, height, sides) in CHARS.items():
        frames, scales[key] = walk_frames(rows_of(sheet), sides, height)
        save_frames(key, frames)

    # Grubnak's attack: 4 rows x 3 frames (raise, swing, smash), both side rows face right
    atk = by_direction(rows_of('new06_Grubnak_Attacking'), ('right', 'right'))
    for d in DIRS:
        save_frames(f'anim:grubnak:attack:{d}', [scaled(im, scales['chars:enemy:grubnak']) for im in atk[d]])

    # Story item icons: a 32 px picture for the bag and a 16 px one for the ground
    ICONS = ['pellsStrongbox', 'goblinToken', 'holtsJournal', 'runestoneBase', 'runestoneCrown', 'runestoneHeart',
             'runestoneSetting', 'bindingStone', 'runeKey', 'digmastersOrders']

    def boxed(im, size, fit):
        k = min(fit / im.width, fit / im.height)
        s = scaled(im, k)
        c = Image.new('RGBA', (size, size))
        c.alpha_composite(s, ((size - s.width) // 2, (size - s.height) // 2))
        return c

    for n, item in enumerate(ICONS):
        im = src('new02_Story_Item_Icons', n)
        boxed(im, 32, 28).save(os.path.join(OUT, f'icon__{item}.png'))
        boxed(im, 16, 15).save(os.path.join(OUT, f'iconS__{item}.png'))

    # Held weapons: rows pickaxe, darts, throwing knife, javelin; columns down, up, left, right.
    # Placed in the hand like the existing axe, sized like the existing weapons.
    meta = json.load(open(os.path.join(ROOT, 'assets', 'art.json')))
    anchors = {}
    for r, (kind, long) in enumerate([('Pickaxe', 12), ('Dart', 9), ('ThrowingKnife', 9), ('Javelin', 16)]):
        for c, d in enumerate(DIRS):
            im = src('new03_Held_Weapons', r * 4 + c)
            s = scaled(im, long / max(im.width, im.height))
            ref = meta[f'gear:bronzeAxe:{d}'][0]  # [x, y, w, h, ax, ay]
            key = f'gear:bronze{kind}:{d}'
            s.save(os.path.join(OUT, key.replace(':', '__') + '.png'))
            anchors[key] = [round(s.width / 2 + (ref[4] - ref[2] / 2)), s.height - ref[3] + ref[5]]

    # The rune door, shut and open
    for n, name in enumerate(('runeDoor', 'runeDoorOpen')):
        im = src('new04_Rune_Door', n)
        shrink(im, w=50, h=round(im.height * 50 / im.width)).save(os.path.join(OUT, f'{name}.png'))

    path = os.path.join(OUT, 'anchors.json')
    old = json.load(open(path)) if os.path.exists(path) else {}
    old.update(anchors)
    json.dump(old, open(path, 'w'), indent=1, sort_keys=True)
elif SET == 'bones':
    sheet = glob.glob(os.path.join(SRC, '*.png'))[0]
    grid = grid_cells(sheet, rows=4, cols=5, grow=14)

    def boxed(im, size, fit):
        sm = scaled(im, min(fit / im.width, fit / im.height))
        c = Image.new('RGBA', (size, size))
        c.alpha_composite(sm, ((size - sm.width) // 2, (size - sm.height) // 2))
        return c

    for row, (bone, pre) in zip(grid, (('bones', 'bone'), ('bigBones', 'bigBone'), ('cursedBones', 'cursedBone'), ('wyrmBones', 'wyrmBone'))):
        for im, item in zip(row, (bone, f'{pre}Arrowtips', f'{pre}DartTip', f'{pre}Arrow', f'{pre}Dart')):
            boxed(im, 32, 28).save(os.path.join(OUT, f'icon__{item}.png'))
            boxed(im, 16, 15).save(os.path.join(OUT, f'iconS__{item}.png'))

elif SET == 'gems':
    from scipy import ndimage
    sheet = glob.glob(os.path.join(SRC, '*.png'))[0]
    rgb = np.array(Image.open(sheet).convert('RGB'))
    r, g, b = [rgb[..., k].astype(np.int32) for k in range(3)]
    m = np.minimum(r, b) - g - np.abs(r - b) // 2
    bg = m > 170                     # only near-pure magenta is background
    edge = ndimage.binary_dilation(bg, iterations=1) & ~bg & (m > 40)
    rgb[..., 0][edge] = np.minimum(r[edge], g[edge] + 40)
    rgb[..., 2][edge] = np.minimum(b[edge], g[edge] + 40)
    on = ~bg
    lab, n = ndimage.label(ndimage.binary_dilation(on, iterations=24))  # joins each gem's sparkle on
    boxes = ndimage.find_objects(lab)
    sizes = ndimage.sum(on, lab, range(1, n + 1))
    blobs = []
    for i in sorted(range(n), key=lambda i: -sizes[i])[:10]:
        sy, sx = boxes[i]
        a = np.where((lab[sy, sx] == i + 1) & on[sy, sx], 255, 0)
        im = Image.fromarray(np.dstack([rgb[sy, sx], a]).astype(np.uint8), 'RGBA')
        blobs.append(((sy.start + sy.stop) / 2, (sx.start + sx.stop) / 2, im.crop(im.getbbox())))
    blobs.sort(key=lambda t: t[0])
    rows = [sorted(blobs[k * 5:(k + 1) * 5], key=lambda t: t[1]) for k in range(2)]

    def boxed(im, size, fit):
        sm = scaled(im, min(fit / im.width, fit / im.height))
        c = Image.new('RGBA', (size, size))
        c.alpha_composite(sm, ((size - sm.width) // 2, (size - sm.height) // 2))
        return c

    GEMS = ['sapphire', 'emerald', 'ruby', 'diamond', 'dragonstone']
    for row, ids in zip(rows, ([f'uncut{g[0].upper()}{g[1:]}' for g in GEMS], GEMS)):
        for (_, _, im), item in zip(row, ids):
            boxed(im, 32, 26).save(os.path.join(OUT, f'icon__{item}.png'))
            boxed(im, 16, 14).save(os.path.join(OUT, f'iconS__{item}.png'))

else:
    sys.exit(f'Unknown set {SET!r}: images01-09, monsters01-12, slayercaves, overgrowth, slayergear, vinegrasp-art, batch1, lumenhaven, batch3, bessie, bones or gems')
print('done')
