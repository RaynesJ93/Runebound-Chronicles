"""Cuts the magenta-background art sheets into separate sprites.

    python3 tools/cut_sheets.py SHEET_DIR OUT_DIR

For every sheet it removes the magenta, finds each separate object, and saves
them at full size as OUT_DIR/<sheet>/<n>.png (numbered row by row), plus a
contact sheet OUT_DIR/<sheet>__index.png showing the numbers.
"""
import sys, os, glob
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

def key_magenta(rgb):
    r, g, b = [rgb[..., k].astype(np.int32) for k in range(3)]
    # how "magenta" a pixel is: red and blue high and equal, green low
    m = np.minimum(r, b) - g - np.abs(r - b) // 2
    bg = m > 90
    alpha = np.where(bg, 0, 255).astype(np.uint8)
    # despill the fringe: pixels that are a bit magenta get it pulled out
    fringe = (~bg) & (m > 30)
    out = rgb.copy()
    gg = g[fringe]
    out[..., 0][fringe] = np.minimum(r[fringe], gg + 40)
    out[..., 2][fringe] = np.minimum(b[fringe], gg + 40)
    return out, alpha

def cut(path, out_dir):
    name = os.path.splitext(os.path.basename(path))[0]
    im = np.array(Image.open(path).convert('RGB'))
    rgb, alpha = key_magenta(im)
    solid = alpha > 0
    solid = ndimage.binary_opening(solid, iterations=1)  # drop specks
    grown = ndimage.binary_dilation(solid, iterations=6)  # join loose bits of one object
    lab, n = ndimage.label(grown)
    boxes = []
    for k, sl in enumerate(ndimage.find_objects(lab), 1):
        ys, xs = sl
        if (ys.stop - ys.start) * (xs.stop - xs.start) < 400: continue
        boxes.append((ys.start, ys.stop, xs.start, xs.stop, k))
    # reading order: group into rows by vertical centre
    boxes.sort(key=lambda b: (b[0] + b[1]) / 2)
    rows, cur = [], []
    for b in boxes:
        if cur and (b[0] + b[1]) / 2 > max(c[1] for c in cur) - 10: rows.append(cur); cur = []
        cur.append(b)
    if cur: rows.append(cur)
    ordered = [b for row in rows for b in sorted(row, key=lambda b: b[2])]
    os.makedirs(f'{out_dir}/{name}', exist_ok=True)
    rgba = np.dstack([rgb, np.where(solid, 255, 0).astype(np.uint8)])
    sheet = Image.fromarray(np.dstack([im, np.full(im.shape[:2], 255, np.uint8)]))
    d = ImageDraw.Draw(sheet)
    for i, (y0, y1, x0, x1, k) in enumerate(ordered):
        crop = rgba[y0:y1, x0:x1].copy()
        crop[..., 3] = np.where((lab[y0:y1, x0:x1] == k) & solid[y0:y1, x0:x1], 255, 0)
        Image.fromarray(crop).save(f'{out_dir}/{name}/{i}.png')
        d.rectangle([x0, y0, x1, y1], outline=(0, 255, 255), width=3)
        d.text((x0 + 4, y0 + 2), str(i), fill=(255, 255, 0))
    sheet.convert('RGB').resize((sheet.width // 2, sheet.height // 2)).save(f'{out_dir}/{name}__index.png')
    print(name, len(ordered))

if __name__ == '__main__':
    for p in sorted(glob.glob(os.path.join(sys.argv[1], '*.png'))): cut(p, sys.argv[2])
