"""Painted art made from other painted art, for items that have no sheet of
their own yet: recoloured or reshaped copies of existing sprites.

build_art.py adds these at the end of every build. To add them to an atlas
that is already built (no sheets needed), run:

    python3 tools/derived.py

It appends any missing derived sprites to assets/art.png and art.json and
leaves everything else exactly where it was.
"""
import json, os, sys
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
from shrink import shrink

ROOT = os.path.join(os.path.dirname(__file__), '..')
DIRS = ['down', 'up', 'left', 'right']


def lum(a):
    return a[..., 0] * 0.3 + a[..., 1] * 0.59 + a[..., 2] * 0.11


# ---- Recolours -------------------------------------------------------------------

def hard_leather(im, get=None):
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


def metal_of(ref_key):
    """Recolour to the metal of an existing sprite: each pixel's brightness
    rank picks the colour at the same rank in the reference."""
    def fn(im, get):
        ref = get(ref_key)[0][1]
        s = np.array(im.convert('RGBA')).astype(np.float32)
        r = np.array(ref).astype(np.float32)
        rc = r[r[..., 3] > 0][:, :3]
        rc = rc[np.argsort(lum(rc))]
        sm = s[..., 3] > 0
        vals = lum(s[..., :3])[sm]
        ranks = np.argsort(np.argsort(vals)) / max(1, len(vals) - 1)
        out = s.copy()
        out[sm, :3] = rc[(ranks * (len(rc) - 1)).round().astype(int)]
        return Image.fromarray(out.clip(0, 255).astype(np.uint8), 'RGBA')
    return fn


# ---- Reshapes (icons lie diagonally: grip bottom-left, tip top-right) -------------

def _axis(w, h):
    yy, xx = np.mgrid[0:h, 0:w]
    return (xx + (h - 1 - yy)) / (w + h - 2)   # 0 at the grip corner, 1 at the tip


def kite(im, get=None):
    """Square shield -> kiteshield: the lower half tapers to a point."""
    w, h = im.size
    s = np.array(im.convert('RGBA'))
    out = np.zeros_like(s)
    ys = np.where(s[..., 3].any(1))[0]
    y0, y1 = ys.min(), ys.max()
    cx = (w - 1) / 2
    for y in range(h):
        t = (y - y0) / max(1, y1 - y0)
        f = 1.0 if t < 0.45 else max(0.1, 1 - (t - 0.45) / 0.55 * 0.9)
        for x in range(w):
            sx = cx + (x - cx) / f
            if 0 <= sx <= w - 1: out[y, x] = s[y, int(round(sx))]
    return Image.fromarray(out, 'RGBA')


def full_helm(im, get=None):
    """Med helm -> full helm: close the face with metal, leaving an eye slit,
    a centre ridge and breathing holes."""
    s = np.array(im.convert('RGBA')).astype(np.float32)
    l = lum(s[..., :3]); m = s[..., 3] > 0
    ys, xs = np.where(m)
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    hh = max(1, y1 - y0)
    thr = np.percentile(l[m], 18)
    metal = s[m & (l > np.percentile(l[m], 35)) & (l < np.percentile(l[m], 80))][:, :3]
    ml = lum(metal)
    dk = metal[ml <= np.percentile(ml, 20)].mean(0)
    lt = metal[ml >= np.percentile(ml, 80)].mean(0)
    md = metal.mean(0)
    out = s.copy()
    cx = (x0 + x1) / 2
    small = hh < 14
    for y in range(y0 + int(hh * 0.35), y1 - (0 if small else 1)):
        for x in range(x0 + 1, x1):
            if not (m[y, x] and l[y, x] < thr): continue
            ty = (y - y0) / hh
            if 0.44 <= ty <= 0.52 and abs(x - cx) > 1.2: out[y, x, :3] = s[y, x, :3] * 0.6   # eye slit
            elif ty > 0.52 and abs(x - cx) < 1 and not small: out[y, x, :3] = dk              # centre ridge
            else:
                u = (x - x0) / max(1, x1 - x0)
                out[y, x, :3] = lt if u < 0.4 else md if u < 0.7 else dk
                if not small and 0.62 < ty < 0.85 and (x + y) % 5 == 0: out[y, x, :3] = dk  # breathing holes
    return Image.fromarray(out.clip(0, 255).astype(np.uint8), 'RGBA')


def scimitar(im, get=None, k=0.27):
    """Straight sword -> curved scimitar: the blade bends more towards the tip."""
    w, h = im.size
    s = np.array(im.convert('RGBA'))
    out = np.zeros_like(s)
    n = np.array([1, 1]) / np.sqrt(2)
    axis = np.array([1, -1]) / np.sqrt(2)
    o = np.array([0, h - 1], float)
    L = np.hypot(w, h)
    for y in range(h):
        for x in range(w):
            p = np.array([x + 0.5, y + 0.5])
            t = max(0, ((p - o) @ axis) / L - 0.38) / 0.62
            sp = p - n * k * w * t * t
            sx, sy = int(sp[0]), int(sp[1])
            if 0 <= sx < w and 0 <= sy < h: out[y, x] = s[sy, sx]
    # close single-pixel gaps the bend leaves in the blade
    a = out[..., 3] > 0
    for y in range(1, h - 1):
        for x in range(1, w - 1):
            if a[y, x]: continue
            if (a[y - 1, x] and a[y + 1, x]) or (a[y, x - 1] and a[y, x + 1]):
                nb = [out[y + dy, x + dx] for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)) if a[y + dy, x + dx]]
                out[y, x] = np.mean(nb, 0).astype(np.uint8); out[y, x, 3] = 255
    return Image.fromarray(out, 'RGBA')


def longsword(im, get=None, k=1.3, fit=0.82):
    """Sword -> longsword: a longer, slimmer blade past the guard."""
    w, h = im.size
    s = np.array(im.convert('RGBA'))
    out = np.zeros_like(s)
    axis = np.array([1, -1]) / np.sqrt(2)
    o = np.array([0, h - 1], float)
    g = 0.42 * np.hypot(w, h)
    for y in range(h):
        for x in range(w):
            q = o + (np.array([x, y], float) - o) / fit
            t = (q - o) @ axis
            if t > g: q = q - axis * (t - g) * (1 - 1 / k)
            sx, sy = int(round(q[0])), int(round(q[1]))
            if 0 <= sx < w and 0 <= sy < h: out[y, x] = s[sy, sx]
    return Image.fromarray(out, 'RGBA')


def battleaxe(im, get=None):
    """Axe -> double-headed battleaxe: the head mirrored across the haft."""
    s = np.array(im.convert('RGBA'))
    h, w = s.shape[:2]
    r = s.transpose(1, 0, 2)[::-1, ::-1]
    out = s.copy()
    m = (out[..., 3] == 0) & (r[..., 3] > 0) & (_axis(w, h) > 0.55)
    out[m] = r[m]
    return Image.fromarray(out, 'RGBA')


def mace_of(helm_key):
    """Pickaxe -> flanged mace: the pickaxe's haft with a helmet dome for a head."""
    def fn(im, get):
        s = np.array(im.convert('RGBA'))
        h, w = s.shape[:2]
        yy, xx = np.mgrid[0:h, 0:w]
        haft = (_axis(w, h) < 0.62) & (np.abs(xx - (h - 1 - yy)) / np.sqrt(2) < 2.6)
        out = np.zeros_like(s)
        out[haft] = s[haft]
        helm = get(helm_key)[0][1]
        size = round(w * 0.53)
        hd = np.array(helm.resize((size, size), Image.LANCZOS).rotate(-45, resample=Image.NEAREST, expand=True))
        hd[..., 3] = np.where(hd[..., 3] > 110, 255, 0)
        o = Image.fromarray(out, 'RGBA')
        hd = Image.fromarray(hd, 'RGBA')
        o.alpha_composite(hd, (max(0, w - hd.width - 1), 0))
        return o
    return fn


def same(im, get=None):
    return im.copy()


# ---- What to make ------------------------------------------------------------------
# new item: icon=(source item, fn), gear=(source item, fn) or None,
#           small=(source item, fn), or None to shrink the new 32 px icon down.
DERIVED = {
    'hardLeatherGloves': dict(icon=('leatherGloves', hard_leather), small=('leatherGloves', hard_leather), gear=('leatherGloves', hard_leather)),
    'hardLeatherBoots': dict(icon=('leatherBoots', hard_leather), small=('leatherBoots', hard_leather), gear=('leatherBoots', hard_leather)),
    'hardLeatherCowl': dict(icon=('leatherCowl', hard_leather), small=('leatherCowl', hard_leather), gear=('leatherCowl', hard_leather)),
    'hardLeatherChaps': dict(icon=('leatherChaps', hard_leather), small=('leatherChaps', hard_leather), gear=('leatherChaps', hard_leather)),
}
for metal in ('bronze', 'iron'):
    tint = metal_of(f'icon:{metal}SqShield')
    DERIVED.update({
        f'{metal}FullHelm': dict(icon=(f'{metal}MedHelm', full_helm), gear=(f'{metal}MedHelm', full_helm)),
        f'{metal}Platebody': dict(icon=('hardLeatherBody', tint), small=('hardLeatherBody', tint), gear=('hardLeatherBody', tint)),
        f'{metal}Platelegs': dict(icon=('leatherChaps', tint), small=('leatherChaps', tint), gear=('leatherChaps', tint)),
        f'{metal}Kiteshield': dict(icon=(f'{metal}SqShield', kite), gear=(f'{metal}SqShield', kite)),
        f'{metal}Scimitar': dict(icon=(f'{metal}Sword', scimitar), gear=(f'{metal}Sword', same)),
        f'{metal}Longsword': dict(icon=(f'{metal}Sword', longsword), gear=(f'{metal}Sword', same)),
        f'{metal}Battleaxe': dict(icon=(f'{metal}Axe', battleaxe), gear=(f'{metal}Axe', same)),
        f'{metal}Mace': dict(icon=(f'{metal}Pickaxe', mace_of(f'icon:{metal}MedHelm')), gear=(f'{metal}Axe', same)),
    })
# Side-on shields stay as they are (a kite shape only reads from the front or back).
SIDE_SAME = {'kite'}


def _small_from(icon, src_small):
    """The 16 px ground icon, shrunk from the new 32 px one into the same box."""
    a = np.array(icon)
    ys, xs = np.where(a[..., 3] > 0)
    content = icon.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    k = min(15 / content.width, 15 / content.height)
    sm = shrink(content, w=max(1, round(content.width * k)), h=max(1, round(content.height * k)))
    box = Image.new('RGBA', src_small.size if src_small else (16, 16))
    box.alpha_composite(sm, ((box.width - sm.width) // 2, box.height - sm.height - (box.height - 15) // 2 - 0))
    return box


def derive(get):
    """get(name) -> list of (k, image, ax, ay) for an existing sprite, or [].
    Returns new (name, k, image, ax, ay) tiles."""
    out = []
    for new, spec in DERIVED.items():
        src, fn = spec['icon']
        icons = get(f'icon:{src}')
        if not icons: continue
        k, im, ax, ay = icons[0]
        icon = fn(im, get)
        out.append((f'icon:{new}', 0, icon, ax, ay))
        if spec.get('small'):
            s2, f2 = spec['small']
            for k, im, ax, ay in get(f'iconS:{s2}'):
                out.append((f'iconS:{new}', k, f2(im, get), ax, ay))
        else:
            srcS = get(f'iconS:{src}')
            ax, ay = (srcS[0][2], srcS[0][3]) if srcS else (8, 13)
            out.append((f'iconS:{new}', 0, _small_from(icon, srcS[0][1] if srcS else None), ax, ay))
        if spec.get('gear'):
            gs, gf = spec['gear']
            for d in DIRS:
                f = same if (d in ('left', 'right') and gf is kite) else gf
                for k, im, ax, ay in get(f'gear:{gs}:{d}'):
                    out.append((f'gear:{new}:{d}', k, f(im, get), ax, ay))
    return out


def patch():
    png, js = f'{ROOT}/assets/art.png', f'{ROOT}/assets/art.json'
    atlas = Image.open(png).convert('RGBA')
    meta = json.load(open(js))

    def get(name):
        return [(k, atlas.crop((x, y, x + w, y + h)), ax, ay) for k, (x, y, w, h, ax, ay) in enumerate(meta.get(name, []))]

    # Derived items can build on each other (platebody from hard leather), so
    # look up earlier derived tiles too.
    made = {}
    def get2(name):
        return get(name) or made.get(name, [])
    tiles = []
    for t in derive(get2):
        made.setdefault(t[0], []).append((t[1], t[2], t[3], t[4]))
        if t[0] not in meta: tiles.append(t)
    if not tiles:
        print('nothing to add'); return
    # pack below the existing atlas, tallest first, same row packing as build_art.py
    tiles.sort(key=lambda t: -t[2].height)
    W, x, y, rowh, placed = atlas.width, 0, atlas.height + 1, 0, []
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
    if '--preview' in sys.argv:  # draw every derived icon and gear sprite to one sheet
        png, js = f'{ROOT}/assets/art.png', f'{ROOT}/assets/art.json'
        atlas = Image.open(png).convert('RGBA'); meta = json.load(open(js))
        get = lambda n: [(k, atlas.crop((x, y, x + w, y + h)), ax, ay) for k, (x, y, w, h, ax, ay) in enumerate(meta.get(n, []))]
        tiles = [t for t in derive(get) if 'hardLeather' not in t[0]]
        cols = 10; cell = 36
        sheet = Image.new('RGBA', (cols * cell, ((len(tiles) + cols - 1) // cols) * cell), (235, 225, 205, 255))
        for i, t in enumerate(tiles): sheet.alpha_composite(t[2], ((i % cols) * cell + 2, (i // cols) * cell + 2))
        out = sys.argv[sys.argv.index('--preview') + 1]
        sheet.resize((sheet.width * 3, sheet.height * 3), Image.NEAREST).save(out); print(len(tiles), 'tiles ->', out)
    else:
        patch()
