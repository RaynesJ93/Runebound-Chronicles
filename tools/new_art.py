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


def grid_cells(path, rows=4, cols=3):
    """Cut a magenta sheet into rows x cols frames. Each frame is a blob of art
    (with nearby loose bits like a leaf or smoke joined on); the blobs are
    sorted into rows by height on the sheet, then left to right."""
    from scipy import ndimage
    rgb = np.array(Image.open(path).convert('RGB'))
    rgb, alpha = key_magenta(rgb)
    on = alpha > 0
    lab, n = ndimage.label(ndimage.binary_dilation(on, iterations=6))
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

elif SET == 'slayercaves':
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
    SECTIONS = {
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
else:
    sys.exit(f'Unknown set {SET!r}: images01-09, monsters01-12, slayercaves or slayergear')
print('done')
