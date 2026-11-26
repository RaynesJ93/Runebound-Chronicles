"""Cut the ChatGPT UI kit (v0.60.0) into assets/ui/*.png.

    python3 tools/ui_kit.py <folder with 01_*.png 02_*.png 03_*.png>

Sheets: 01 frames (dark frame, parchment frame / dialog frame, card frame /
scroll banner, slot, divider), 02 buttons (square x2 / wide x2 / tab x3 /
close x2 / choice x2 / qty x2), 03 icons (3 rows of 4). Magenta is keyed out
strictly, pieces are found as blobs, grouped into rows, and scaled to half
size (the sheets come about 3x pixel size; the CSS draws them at about a
third, so they stay sharp on phone screens).
"""
import glob, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

SRC = sys.argv[1]
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'ui')
os.makedirs(OUT, exist_ok=True)

def key(rgb):
    r, g, b = [rgb[..., k].astype(np.int32) for k in range(3)]
    m = np.minimum(r, b) - g - np.abs(r - b) // 2
    bg = m > 150
    edge = ndimage.binary_dilation(bg, iterations=1) & ~bg & (m > 40)
    out = rgb.copy()
    out[..., 0][edge] = np.minimum(r[edge], g[edge] + 40)
    out[..., 2][edge] = np.minimum(b[edge], g[edge] + 40)
    return out, np.where(bg, 0, 255).astype(np.uint8)

def rows(path, grow=6):
    rgb, alpha = key(np.array(Image.open(path).convert('RGB')))
    on = alpha > 0
    lab, m = ndimage.label(ndimage.binary_dilation(on, iterations=grow))
    sizes = ndimage.sum(on, lab, range(1, m + 1))
    blobs = []
    for i, sl in enumerate(ndimage.find_objects(lab)):
        if sizes[i] < 400: continue  # specks
        sy, sx = sl
        a = np.where((lab[sy, sx] == i + 1) & on[sy, sx], alpha[sy, sx], 0)
        im = Image.fromarray(np.dstack([rgb[sy, sx], a]).astype(np.uint8), 'RGBA')
        blobs.append(((sy.start + sy.stop) / 2, (sx.start + sx.stop) / 2, im.crop(im.getbbox())))
    blobs.sort(key=lambda b: b[0])
    out, gap = [], on.shape[0] / 14
    for b in blobs:
        if out and b[0] - out[-1][-1][0] < gap: out[-1].append(b)
        else: out.append([b])
    return [[b[2] for b in sorted(r, key=lambda b: b[1])] for r in out]

def save(im, name, scale=0.5):
    w, h = max(1, round(im.width * scale)), max(1, round(im.height * scale))
    im.resize((w, h), Image.LANCZOS).save(os.path.join(OUT, name + '.png'), optimize=True)
    print(f'  {name}: {w}x{h}')

sheet = lambda p: glob.glob(os.path.join(SRC, p + '*.png'))[0]
NAMES = {
    '01': [['frameDark', 'frameParch'], ['frameDialog', 'frameCard'], ['scroll', 'slot', 'divider']],
    '02': [['btnSquare', 'btnSquareDown'], ['btnWide', 'btnWideDown'], ['tab', 'tabOn', 'tabDown'], ['close', 'closeDown'], ['choice', 'choiceOn'], ['qty', 'qtyOn']],
    '03': [['icBag', 'icTasks', 'icMap', 'icCombat'], ['icSettings', 'icGuide', 'icQuests', 'icHeart'], ['icStar', 'icGem', 'icQuestDone', 'icTick']],
}
for k, names in NAMES.items():
    rs = rows(sheet(k), grow=3 if k == '02' else 6)
    assert [len(r) for r in rs] == [len(n) for n in names], (k, [len(r) for r in rs])
    for r, ns in zip(rs, names):
        for im, n in zip(r, ns):
            # icons: fit in 64 px; everything else: half size
            save(im, n, 64 / max(im.size) if n.startswith('ic') else 0.5)
