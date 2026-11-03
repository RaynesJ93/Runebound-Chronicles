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

def cut(path, out_dir, join=6):
    name = os.path.splitext(os.path.basename(path))[0]
    im = np.array(Image.open(path).convert('RGB'))
    rgb, alpha = key_magenta(im)
    solid = alpha > 0
    solid = ndimage.binary_opening(solid, iterations=1)  # drop specks
    grown = ndimage.binary_dilation(solid, iterations=join)  # join loose bits of one object
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
    # character and creature sheets are packed tightly: join less so frames stay apart
    TIGHT = ('07_', '11_', '12_')
    for p in sorted(glob.glob(os.path.join(sys.argv[1], '*.png'))):
        cut(p, sys.argv[2], 2 if os.path.basename(p).startswith(TIGHT) else 6)

def clusters(vals, gap):
    """Groups sorted numbers into runs separated by more than `gap`; returns run centres."""
    vals = sorted(vals); out = [[vals[0]]]
    for v in vals[1:]:
        if v - out[-1][-1] > gap: out.append([v])
        else: out[-1].append(v)
    return [sum(c) / len(c) for c in out]

def cut_grid(path, out_dir, cols, rows):
    """For frame sheets: every object goes into the grid cell nearest its centre,
    so frames that touch, or bits that came apart, still come out one per cell.
    Saves OUT/<sheet>/<row*cols+col>.png."""
    name = os.path.splitext(os.path.basename(path))[0]
    im = np.array(Image.open(path).convert('RGB'))
    rgb, alpha = key_magenta(im)
    solid = ndimage.binary_opening(alpha > 0, iterations=1)
    lab, n = ndimage.label(solid)
    objs = ndimage.find_objects(lab)
    sizes = ndimage.sum(solid, lab, range(1, n + 1))
    big = [k for k in range(n) if sizes[k] > 300]
    cx = [(objs[k][1].start + objs[k][1].stop) / 2 for k in big]
    cy = [(objs[k][0].start + objs[k][0].stop) / 2 for k in big]
    gx = clusters(cx, 30); gy = clusters(cy, 25)
    if len(gx) != cols or len(gy) != rows:
        # fall back to evenly spaced cells over the content
        ys, xs = np.where(solid)
        gx = [xs.min() + (i + 0.5) * (xs.max() - xs.min()) / cols for i in range(cols)]
        gy = [ys.min() + (i + 0.5) * (ys.max() - ys.min()) / rows for i in range(rows)]
        print('  (even grid)', name)
    near = lambda g, v: min(range(len(g)), key=lambda i: abs(g[i] - v))
    sx = (gx[-1] - gx[0]) / max(1, cols - 1); sy = (gy[-1] - gy[0]) / max(1, rows - 1)
    owner = np.full(lab.shape, -1, np.int32)  # which cell each pixel belongs to
    for k in range(n):
        if sizes[k] < 6: continue
        sl = objs[k]
        m = lab[sl] == k + 1
        if (sl[0].stop - sl[0].start) > 1.4 * sy or (sl[1].stop - sl[1].start) > 1.4 * sx:
            # several frames touching: split them pixel by pixel at the cell borders
            yy, xx = np.nonzero(m)
            ry = np.array([near(gy, v + sl[0].start) for v in range(sl[0].stop - sl[0].start)])
            rx = np.array([near(gx, v + sl[1].start) for v in range(sl[1].stop - sl[1].start)])
            owner[yy + sl[0].start, xx + sl[1].start] = ry[yy] * cols + rx[xx]
        else:
            x = (sl[1].start + sl[1].stop) / 2; y = (sl[0].start + sl[0].stop) / 2
            owner[sl][m] = near(gy, y) * cols + near(gx, x)
    cell = {(int(v) // cols, int(v) % cols): v for v in np.unique(owner) if v >= 0}
    import shutil; shutil.rmtree(f'{out_dir}/{name}', ignore_errors=True)
    os.makedirs(f'{out_dir}/{name}', exist_ok=True)
    rgba = np.dstack([rgb, np.zeros(im.shape[:2], np.uint8)])
    for (r, c), v in cell.items():
        m = owner == v
        ys, xs = np.where(m)
        y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        crop = rgba[y0:y1, x0:x1].copy(); crop[..., 3] = np.where(m[y0:y1, x0:x1], 255, 0)
        Image.fromarray(crop).save(f'{out_dir}/{name}/{r * cols + c}.png')
    print(name, 'grid', len(cell), 'of', cols * rows, 'missing', sorted(set(range(cols * rows)) - {r * cols + c for r, c in cell}))

GRIDS = {'07_': (6, 8), '08_': (9, 4), '09_': (9, 4), '10_': (9, 4), '11_': (6, 8), '12_': (6, 8)}
if __name__ == '__main__':
    for p in sorted(glob.glob(os.path.join(sys.argv[1], '*.png'))):
        g = GRIDS.get(os.path.basename(p)[:3])
        if g: cut_grid(p, sys.argv[2], *g)
