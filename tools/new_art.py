"""Turns the cut-up "images 01-09" art sheets (Nov 2026) into game-size sprites
in tools/sprites/, where tools/derived.py adds them to the atlas.

    python3 tools/cut_sheets.py  <sheets>  <cut>     # sheet files renamed new01_... so they
    python3 tools/new_art.py     <cut>               # don't clash with the old 07_-09_ grids
    python3 tools/derived.py

File names in tools/sprites/ are atlas keys with ':' written as '__'. A folder
holds the frames of one key (0.png, 1.png, ...). tools/sprites/anchors.json
gives anchors that aren't the default (see derived.py).
"""
import json
import os
import sys

import numpy as np
from PIL import Image, ImageOps

sys.path.insert(0, os.path.dirname(__file__))
from shrink import shrink  # noqa: E402

CUT = sys.argv[1]
OUT = os.path.join(os.path.dirname(__file__), 'sprites')
ROOT = os.path.join(os.path.dirname(__file__), '..')


def src(sheet, n):
    return Image.open(os.path.join(CUT, sheet, f'{n}.png')).convert('RGBA')


def save_frames(key, frames):
    d = os.path.join(OUT, key.replace(':', '__'))
    os.makedirs(d, exist_ok=True)
    for f in os.listdir(d):
        os.remove(os.path.join(d, f))
    for k, im in enumerate(frames):
        im.save(os.path.join(d, f'{k}.png'))


# ---- Walking characters ---------------------------------------------------------------
# Each sheet: 4 rows (down, up, then two side rows) x 3 columns (step, stand, step).
# Game order per direction is stand, step, step. `sides` says which way rows 3
# and 4 face; a missing direction is the other one mirrored.
CHARS = {
    #  key                       sheet                       height  sides (row 3, row 4)
    'chars:lyra':               ('new01_Lyra_the_Stargazer', 24, ('left', 'left')),
    'chars:enemy:grubnak':      ('new05_Grubnak_Walking', 46, ('right', 'right')),
    'chars:tobin':              ('new07_Tobin_the_Hermit', 24, ('left', 'right')),
    'chars:enemy:warrenGoblin': ('new08_Warren_Goblin', 23, ('left', 'right')),
    'chars:enemy:goblinDigmaster': ('new09_Goblin_Digmaster', 28, ('left', 'right')),
}


def rows_of(sheet):
    return [[src(sheet, r * 3 + c) for c in range(3)] for r in range(4)]


def by_direction(sheet, sides):
    g = rows_of(sheet)
    out = {'down': g[0], 'up': g[1]}
    for row, side in zip(g[2:], sides):
        out.setdefault(side, row)
    for a, b in (('left', 'right'), ('right', 'left')):
        if a not in out:
            out[a] = [ImageOps.mirror(im) for im in out[b]]
    return out


scales = {}
for key, (sheet, height, sides) in CHARS.items():
    dirs = by_direction(sheet, sides)
    scale = height / dirs['down'][1].height  # one scale for all frames, from the standing front frame
    scales[key] = (sheet, scale)
    frames = []
    for d in ('down', 'up', 'left', 'right'):
        for c in (1, 0, 2):
            im = dirs[d][c]
            frames.append(shrink(im, w=max(1, round(im.width * scale)), h=max(1, round(im.height * scale))))
    save_frames(key, frames)
    print(key, [f.size for f in frames[:3]])

# ---- Grubnak's attack: 4 rows x 3 frames (raise, swing, smash), both side rows face right
sheet = 'new06_Grubnak_Attacking'
scale = scales['chars:enemy:grubnak'][1]
atk = by_direction(sheet, ('right', 'right'))
for d in ('down', 'up', 'left', 'right'):
    frames = [shrink(im, w=max(1, round(im.width * scale)), h=max(1, round(im.height * scale))) for im in atk[d]]
    save_frames(f'anim:grubnak:attack:{d}', frames)

# ---- Story item icons: a 32 px picture for the bag and a 16 px one for the ground --------
ICONS = ['pellsStrongbox', 'goblinToken', 'holtsJournal', 'runestoneBase', 'runestoneCrown', 'runestoneHeart',
         'runestoneSetting', 'bindingStone', 'runeKey', 'digmastersOrders']


def boxed(im, size, fit):
    s = shrink(im, w=round(im.width * min(fit / im.width, fit / im.height)), h=round(im.height * min(fit / im.width, fit / im.height)))
    c = Image.new('RGBA', (size, size))
    c.alpha_composite(s, ((size - s.width) // 2, (size - s.height) // 2))
    return c


for k, item in enumerate(ICONS):
    im = src('new02_Story_Item_Icons', k)
    boxed(im, 32, 28).save(os.path.join(OUT, f'icon__{item}.png'))
    boxed(im, 16, 15).save(os.path.join(OUT, f'iconS__{item}.png'))

# ---- Held weapons: rows pickaxe, darts, throwing knife, javelin; columns down, up, left, right
# Placed in the hand like the existing axe (the same bottom-middle point relative
# to the player's feet), sized like the existing weapons.
meta = json.load(open(os.path.join(ROOT, 'assets', 'art.json')))
anchors = {}
HELD = [('Pickaxe', 12), ('Dart', 9), ('ThrowingKnife', 9), ('Javelin', 16)]  # longest side in game pixels
for r, (kind, long) in enumerate(HELD):
    for c, d in enumerate(('down', 'up', 'left', 'right')):
        im = src('new03_Held_Weapons', r * 4 + c)
        k = long / max(im.width, im.height)
        s = shrink(im, w=max(1, round(im.width * k)), h=max(1, round(im.height * k)))
        ref = meta[f'gear:bronzeAxe:{d}'][0]  # [x, y, w, h, ax, ay]
        rw, rh, rax, ray = ref[2], ref[3], ref[4], ref[5]
        ax = round(s.width / 2 + (rax - rw / 2))
        ay = s.height - rh + ray
        key = f'gear:bronze{kind}:{d}'
        s.save(os.path.join(OUT, key.replace(':', '__') + '.png'))
        anchors[key] = [ax, ay]

# ---- The rune door, shut and open (replacing the one drawn in code) ----------------------
for k, name in enumerate(('runeDoor', 'runeDoorOpen')):
    im = src('new04_Rune_Door', k)
    w = 50
    shrink(im, w=w, h=round(im.height * w / im.width)).save(os.path.join(OUT, f'{name}.png'))

old = json.load(open(os.path.join(OUT, 'anchors.json'))) if os.path.exists(os.path.join(OUT, 'anchors.json')) else {}
old.update(anchors)
json.dump(old, open(os.path.join(OUT, 'anchors.json'), 'w'), indent=1, sort_keys=True)
print('done')
