"""Cuts sheet 21 (gear worn on the player) into <cut>/21_gear/<item>-<dir>.png.

    python3 tools/cut_gear.py path/to/21_armour_and_weapons.png CUT_DIR
"""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from PIL import Image
from scipy import ndimage
from cut_sheets import key_magenta, clusters
im = np.array(Image.open(sys.argv[1]).convert('RGB'))
rgb, alpha = key_magenta(im)
solid = ndimage.binary_opening(alpha > 0, iterations=1)
grown = ndimage.binary_dilation(solid, iterations=2)
lab, n = ndimage.label(grown)
objs = ndimage.find_objects(lab)
items = []
for k, sl in enumerate(objs):
    h = sl[0].stop - sl[0].start; w = sl[1].stop - sl[1].start
    if h * w < 120: continue
    items.append(((sl[0].start + sl[0].stop) / 2, (sl[1].start + sl[1].stop) / 2, k + 1, sl))
ys = [56, 128, 200, 270, 373, 448, 521, 596, 696, 765, 831, 896, 1000, 1071, 1142, 1211]
print('rows', len(ys), [round(y) for y in ys])
BANDS = [['bronzeMedHelm', 'ironMedHelm', 'leatherCowl', 'bronzeChainbody', 'ironChainbody', 'leatherBody', 'hardLeatherBody'],
         ['goblinMail', 'leatherChaps', 'leatherVambraces', 'leatherGloves', 'leatherBoots', 'wolfCloak', 'warCharm'],
         ['bronzeDagger', 'ironDagger', 'bronzeSword', 'ironSword', 'bronzeAxe', 'ironAxe', 'shortbow'],
         ['longbow', 'oakShortbow', 'oakLongbow', 'apprenticeStaff', 'woodenShield', 'bronzeSqShield', 'ironSqShield']]
DIRS = ['down', 'up', 'left', 'right']
out = f'{sys.argv[2]}/21_gear'; os.makedirs(out, exist_ok=True)
rgba = np.dstack([rgb, np.zeros(im.shape[:2], np.uint8)])
for b, names in enumerate(BANDS):
    band_rows = ys[b * 4:(b + 1) * 4]
    for r, ry in enumerate(band_rows):
        row = sorted([c for c in items if min(range(16), key=lambda q: abs(ys[q] - c[0])) == b * 4 + r], key=lambda c: c[1])
        # group the row's pieces into items by gaps along x
        xs = [c[1] for c in row]
        gaps = sorted(range(1, len(xs)), key=lambda i: -(xs[i] - xs[i - 1]))[:len(names) - 1]
        groups, cur = [], [row[0]]
        for i in range(1, len(row)):
            if i in gaps: groups.append(cur); cur = []
            cur.append(row[i])
        groups.append(cur)
        if len(groups) != len(names): print('band', b, 'row', r, 'groups', len(groups), [len(g) for g in groups])
        for name, g in zip(names, groups):
            c = g[len(g) // 2]  # the middle (standing) frame
            sl = c[3]; m = (lab[sl] == c[2]) & solid[sl]
            crop = rgba[sl].copy(); crop[..., 3] = np.where(m, 255, 0)
            Image.fromarray(crop).save(f'{out}/{name}-{DIRS[r]}.png')
print('done')
