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
import jewel_art as J

ROOT = os.path.join(os.path.dirname(__file__), '..')
SPRITE_DIR = os.path.join(os.path.dirname(__file__), 'sprites')
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


def steel(im, get=None):
    """Iron -> steel: the grey metal gets lighter and cleaner. Wood, leather
    and anything else with real colour is left alone."""
    rgba = np.array(im.convert('RGBA'))
    hsv = np.array(im.convert('RGB').convert('HSV')).astype(np.float32)
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    metal = (rgba[..., 3] > 0) & ((s < 70) | ((h > 120) & (h < 190) & (s < 110)))
    v2 = np.where(metal, np.clip(v * 1.16 + 14, 0, 255), v)
    s2 = np.where(metal, s * 0.55, s)
    out = np.array(Image.fromarray(np.stack([h, s2, v2], -1).astype(np.uint8), 'HSV').convert('RGBA'))
    out[..., 3] = rgba[..., 3]
    return Image.fromarray(out, 'RGBA')


def coal(im, get=None):
    """Copper's orange veins -> seams of glossy black coal; the grey rock stays."""
    rgba = np.array(im.convert('RGBA')).astype(np.float32)
    hsv = np.array(im.convert('RGB').convert('HSV')).astype(np.float32)
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    vein = (rgba[..., 3] > 0) & (s > 90) & ((h < 34) | (h > 235))
    l = v / 255
    shade = np.stack([12 + 90 * l ** 2.6, 11 + 88 * l ** 2.6, 16 + 104 * l ** 2.6], -1)
    out = rgba.copy()
    out[vein, :3] = shade[vein]
    return Image.fromarray(out.clip(0, 255).astype(np.uint8), 'RGBA')


def coal_lump(im, get=None):
    """Any ore lump -> a lump of coal: black all over, with a cool glossy sheen."""
    rgba = np.array(im.convert('RGBA')).astype(np.float32)
    l = lum(rgba[..., :3]) / 255
    m = rgba[..., 3] > 0
    lo, hi = np.percentile(l[m], 5), np.percentile(l[m], 98)
    t = np.clip((l - lo) / max(1e-3, hi - lo), 0, 1)
    shade = np.stack([14 + 96 * t ** 2.4, 13 + 94 * t ** 2.4, 18 + 112 * t ** 2.4], -1)
    out = rgba.copy()
    out[m, :3] = shade[m]
    return Image.fromarray(out.clip(0, 255).astype(np.uint8), 'RGBA')


def lum_to(palette):
    """Recolour the whole sprite along a 4-step palette by brightness."""
    def fn(im, get=None):
        a = np.array(im.convert('RGBA')).astype(np.float32)
        m = a[..., 3] > 0
        l = lum(a[..., :3]) / 255
        lo, hi = np.percentile(l[m], 4), np.percentile(l[m], 98)
        t = np.clip((l - lo) / max(1e-3, hi - lo), 0, 1)
        out = a.copy()
        out[m, :3] = J.ramp(palette, t)[m]
        out[m & (l <= lo + 0.01), :3] = J.OUT
        return Image.fromarray(out.clip(0, 255).astype(np.uint8), 'RGBA')
    return fn


def veins_to(palette):
    """Copper's orange veins -> another metal's colours; the grey rock stays."""
    def fn(im, get=None):
        rgba = np.array(im.convert('RGBA')).astype(np.float32)
        hsv = np.array(im.convert('RGB').convert('HSV')).astype(np.float32)
        h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
        vein = (rgba[..., 3] > 0) & (s > 90) & ((h < 34) | (h > 235))
        out = rgba.copy()
        out[vein, :3] = J.ramp(palette, np.clip((v / 255 - 0.25) / 0.75, 0, 1) * 1.05)[vein]
        return Image.fromarray(out.clip(0, 255).astype(np.uint8), 'RGBA')
    return fn


def drawn(make):
    """A sprite drawn from scratch (the source only gives its anchor)."""
    return lambda im, get=None: make()


MITHRIL = ['#1a2250', '#34428a', '#6676c8', '#c4d0ff']


def mithril(im, get=None):
    """Steel -> mithril: the grey metal takes a dark-blue ramp by brightness.
    Wood, leather and anything else with real colour is left alone."""
    rgba = np.array(im.convert('RGBA')).astype(np.float32)
    hsv = np.array(im.convert('RGB').convert('HSV')).astype(np.float32)
    h, s = hsv[..., 0], hsv[..., 1]
    m = rgba[..., 3] > 0
    metal = m & ((s < 70) | ((h > 120) & (h < 190) & (s < 110)))
    if not metal.any(): return im.copy()
    l = lum(rgba[..., :3]) / 255
    lo, hi = np.percentile(l[metal], 3), np.percentile(l[metal], 99)
    t = np.clip((l - lo) / max(1e-3, hi - lo), 0, 1)
    out = rgba.copy()
    out[metal, :3] = J.ramp(MITHRIL, t)[metal]
    return Image.fromarray(out.clip(0, 255).astype(np.uint8), 'RGBA')


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


# ---- Batch F shapes (boots, gauntlets, spears, warhammers, 2h swords, thrown
# weapons, studs and studded leather) --------------------------------------------

def _ramp_of(ref):
    r = np.array(ref.convert('RGBA')).astype(float)
    rc = r[r[..., 3] > 0][:, :3]
    return rc[np.argsort(lum(rc))]


def _axis2(w, h):
    yy, xx = np.mgrid[0:h, 0:w]
    return (xx + (h - 1 - yy)) / (w + h - 2), np.abs(xx - (h - 1 - yy)) / np.sqrt(2)


def metal_parts(ref_key):
    """Recolour only the grey (metal) parts to a metal's colours; wood stays."""
    def fn(im, get):
        rc = _ramp_of(get(ref_key)[0][1])
        h = np.array(im.convert('RGBA')).astype(float)
        hsv = np.array(im.convert('RGB').convert('HSV')).astype(float)
        metal = (h[..., 3] > 0) & (hsv[..., 1] < 70)
        v = lum(h[..., :3])[metal]
        ranks = np.argsort(np.argsort(v)) / max(1, len(v) - 1)
        out = h.copy()
        out[metal, :3] = rc[(ranks * (len(rc) - 1)).round().astype(int)]
        return Image.fromarray(out.clip(0, 255).astype(np.uint8), 'RGBA')
    return fn


def spear_of(dagger_key):
    """A long haft corner to corner (in the pickaxe's wood), with the dagger's blade for a point."""
    def fn(pick, get):
        dagger = get(dagger_key)[0][1]
        w, h = pick.size
        p = np.array(pick.convert('RGBA'))
        al, off = _axis2(w, h)
        hsv = np.array(pick.convert('RGB').convert('HSV')).astype(float)
        wood = (p[..., 3] > 0) & (hsv[..., 1] > 80) & (hsv[..., 0] < 40)
        cols = p[wood][:, :3]
        cols = cols[np.argsort(lum(cols.astype(float)))]
        out = np.zeros_like(p)
        m = (off < 1.25) & (al < 0.74) & (al > 0.04)
        yy, xx = np.mgrid[0:h, 0:w]
        t = np.clip(0.5 - (xx - (h - 1 - yy)) * 0.35, 0, 1)
        out[m, :3] = cols[(t[m] * (len(cols) - 1)).astype(int)]
        out[m, 3] = 255
        o = Image.fromarray(out, 'RGBA')
        d = np.array(dagger.convert('RGBA'))
        dal, _ = _axis2(*dagger.size)
        d[dal < 0.5] = 0
        b = Image.fromarray(d, 'RGBA')
        b = b.crop(b.getbbox())
        b = b.resize((round(b.width * 0.78), round(b.height * 0.78)), Image.NEAREST)
        o.alpha_composite(b, (w - b.width - 1, 1))
        return o
    return fn


def two_hander(sword, get=None):
    """Sword -> 2h sword: bigger and broader, with a longer blade."""
    w, h = sword.size
    big = sword.resize((round(w * 1.3), round(h * 1.3)), Image.NEAREST)
    big = big.crop((0, big.height - h, w, big.height))  # keep the grip corner
    return longsword(big, k=1.35, fit=0.86)


def _fan(im, n, scale, step):
    w, h = im.size
    c = im.crop(im.getbbox())
    c = c.resize((max(1, round(c.width * scale)), max(1, round(c.height * scale))), Image.NEAREST)
    o = Image.new('RGBA', (w, h))
    x0 = (w - c.width - abs(step[0]) * (n - 1)) // 2
    y0 = (h - c.height - abs(step[1]) * (n - 1)) // 2
    for k in range(n): o.alpha_composite(c, (x0 + step[0] * k, y0 + step[1] * k))
    return o


def knives(dagger, get=None):
    """Three small daggers side by side."""
    return _fan(dagger, 3, 0.56, (7, 7))


def javelins_of(dagger_key):
    def fn(pick, get):
        one = spear_of(dagger_key)(pick, get)
        w, h = pick.size
        small = one.resize((round(w * 0.85), round(h * 0.85)), Image.NEAREST)
        o = Image.new('RGBA', (w, h))
        o.alpha_composite(small, (0, h - small.height - 4))
        o.alpha_composite(small, (4, h - small.height))
        return o
    return fn


def small_heads(im, get=None):
    """Arrowtips -> a smaller handful (dart tips)."""
    return _fan(im, 1, 0.72, (0, 0))


def blade_tips(dagger, get=None):
    """Two loose spear points (javelin heads)."""
    d = np.array(dagger.convert('RGBA'))
    dal, _ = _axis2(*dagger.size)
    d[dal < 0.62] = 0
    b = Image.fromarray(d, 'RGBA')
    b = b.crop(b.getbbox())
    o = Image.new('RGBA', dagger.size)
    for k in range(2): o.alpha_composite(b, (6 + k * 7, 12 + k * 4))
    return o


def darts_of(ref_key):
    """Little darts, drawn big and shrunk like the painted icons: a metal point
    and barrel with feather fins at the back; tips to the top-right."""
    from PIL import ImageDraw
    def fn(im, get):
        mc = _ramp_of(get(ref_key)[0][1])
        fc = _ramp_of(get('icon:feather')[0][1])
        pick = lambda cs, t: tuple(int(v) for v in cs[int((len(cs) - 1) * t)])
        S = 128
        big = Image.new('RGBA', (S, S))
        d = ImageDraw.Draw(big)
        u = np.array([1, -1]) / np.sqrt(2)   # back -> tip
        n = np.array([1, 1]) / np.sqrt(2)    # across the dart
        P = lambda c: tuple(float(v) for v in c)
        for k in range(3):
            back = np.array([18.0, 96.0]) + n * (k * 26 - 22) + u * (k * 6)
            L = 74
            tip = back + u * L
            # fins: a V-shaped tail, one fin each side of the barrel
            fin = lambda side, t: d.polygon([P(back + u * 20), P(back + n * side * 15 - u * 2), P(back + u * 2)], fill=pick(fc, t))
            fin(-1, 0.55); fin(1, 0.25)
            d.line([P(back - u * 2), P(back + u * 20)], fill=pick(fc, 0.1), width=4)
            # barrel and point
            b0, b1 = back + u * 14, back + u * 52
            d.polygon([P(b0 - n * 7), P(b1 - n * 8), P(b1 + n * 8), P(b0 + n * 7)], fill=pick(mc, 0.4))
            d.polygon([P(b0 - n * 7), P(b1 - n * 8), P(b1), P(b0)], fill=pick(mc, 0.78))
            d.polygon([P(b1 - n * 8), P(tip), P(b1 + n * 8)], fill=pick(mc, 0.6))
            d.polygon([P(b1 - n * 8), P(tip), P(b1)], fill=pick(mc, 0.95))
        return shrink(big, w=30, h=30)
    return fn


def studs_of(ref_key):
    def fn(im, get):
        mc = _ramp_of(get(ref_key)[0][1])
        size = 32
        yy, xx = np.mgrid[0:size, 0:size] + 0.5
        rgb = np.zeros((size, size, 3)); a = np.zeros((size, size), np.uint8)
        for cx, cy in ((10, 11), (21, 9), (12, 22), (23, 21), (16.5, 16)):
            m = np.hypot(xx - cx, yy - cy) < 4.2
            t = np.clip(0.85 - ((xx - cx + 1.6) ** 2 + (yy - cy + 1.6) ** 2) / 30, 0, 1)
            rgb[m] = mc[(t[m] * (len(mc) - 1)).astype(int)]; a[m] = 255
        return J.outline(rgb, a)
    return fn


def studded_with(ref_key):
    """Leather with a grid of steel studs."""
    def fn(im, get):
        mc = _ramp_of(get(ref_key)[0][1])
        s = np.array(im.convert('RGBA')).copy()
        h, w = s.shape[:2]
        m = s[..., 3] > 0
        inner = m.copy()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)): inner &= np.roll(np.roll(m, dy, 0), dx, 1)
        step = 4 if w > 20 else 3
        for y in range(1, h - 1, step):
            for x in range(1 + (y // step % 2) * (step // 2), w - 1, step):
                if inner[y, x]:
                    s[y, x, :3] = mc[-2]
                    if y + 1 < h: s[y + 1, x, :3] = mc[len(mc) // 3]
        return Image.fromarray(s, 'RGBA')
    return fn


# ---- Batch G: shooting stars, stardust, bags, prospector outfit, gem rocks --------

STAR = ['#5e4a1a', '#c8a040', '#ffe890', '#ffffff']


def gem_veins(im, get=None):
    """Copper's orange veins -> glittering gems of every colour; the grey rock stays."""
    rgba = np.array(im.convert('RGBA')).astype(np.float32)
    hsv = np.array(im.convert('RGB').convert('HSV')).astype(np.float32)
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    vein = (rgba[..., 3] > 0) & (s > 90) & ((h < 34) | (h > 235))
    out = rgba.copy()
    names = list(J.GEM)
    yy, xx = np.mgrid[0:vein.shape[0], 0:vein.shape[1]]
    pick = ((xx // 3) * 7 + (yy // 3) * 3) % len(names)
    t = np.clip((v / 255 - 0.2) / 0.8, 0, 1)
    for k, g in enumerate(names):
        m = vein & (pick == k)
        out[m, :3] = J.ramp(J.GEM[g], t * 1.05)[m]
    return Image.fromarray(out.clip(0, 255).astype(np.uint8), 'RGBA')


def star_rock(scale, bright=1.0):
    """The glowing essence crystal, in star colours, at a size."""
    def fn(im, get=None):
        st = lum_to(STAR)(im)
        if bright != 1.0:
            a = np.array(st).astype(np.float32)
            a[..., :3] = np.clip(a[..., :3] * bright + 18, 0, 255)
            st = Image.fromarray(a.astype(np.uint8), 'RGBA')
        w, h = st.size
        return st.resize((max(1, round(w * scale)), max(1, round(h * scale))), Image.NEAREST)
    return fn


def stardust_icon(im=None, get=None):
    """A little heap of glittering dust, drawn big and shrunk."""
    from PIL import ImageDraw
    S = 128
    big = Image.new('RGBA', (S, S))
    d = ImageDraw.Draw(big)
    col = lambda t: tuple(int(c) for c in J.ramp(STAR, np.array(t)))
    d.ellipse((18, 64, 110, 112), fill=col(0.35))
    d.ellipse((26, 58, 100, 100), fill=col(0.55))
    d.ellipse((40, 52, 86, 86), fill=col(0.75))
    rnd = np.random.default_rng(7)
    for _ in range(70):
        x, y = rnd.uniform(24, 104), rnd.uniform(54, 106)
        r = rnd.uniform(1.5, 4)
        d.ellipse((x - r, y - r, x + r, y + r), fill=col(rnd.uniform(0.7, 1.0)))
    for cx, cy, r in ((40, 34, 22), (92, 26, 16), (72, 50, 12)):  # sparkles
        d.polygon([(cx, cy - r), (cx + r * 0.25, cy - r * 0.25), (cx + r, cy), (cx + r * 0.25, cy + r * 0.25),
                   (cx, cy + r), (cx - r * 0.25, cy + r * 0.25), (cx - r, cy), (cx - r * 0.25, cy - r * 0.25)], fill=col(1.0))
    return shrink(big, w=28, h=28)


def bag_of(colours, inner_key):
    """Pell's bag icon recoloured, with a little of what's inside peeking out."""
    def fn(im, get):
        bag = lum_to(colours)(im)
        inner = get(inner_key)[0][1]
        c = inner.crop(inner.getbbox())
        c = c.resize((max(1, round(c.width * 0.5)), max(1, round(c.height * 0.5))), Image.NEAREST)
        o = bag.copy()
        o.alpha_composite(c, (o.width - c.width - 2, 1))
        return o
    return fn


def hard_hat(im, get=None):
    """A med helm as a yellow miner's hard hat with a lamp on the front."""
    out = lum_to(['#4a2a08', '#9a6410', '#d89a20', '#f8d878'])(im)
    a = np.array(out)
    ys, xs = np.where(a[..., 3] > 0)
    cx, cy = int((xs.min() + xs.max()) / 2), int(ys.min() + (ys.max() - ys.min()) * 0.38)
    r = max(1, (xs.max() - xs.min()) // 6)
    for y in range(cy - r, cy + r + 1):
        for x in range(cx - r, cx + r + 1):
            if (x - cx) ** 2 + (y - cy) ** 2 <= r * r + 0.5 and 0 <= y < a.shape[0] and 0 <= x < a.shape[1]:
                a[y, x, :3] = (255, 255, 230) if (x - cx) <= 0 and (y - cy) <= 0 else (255, 220, 120)
                a[y, x, 3] = 255
    return Image.fromarray(a, 'RGBA')


CANVAS = ['#3a2a14', '#7a5a30', '#b08a50', '#ead4a4']
CANVAS_DARK = ['#2a2014', '#5a4630', '#86704e', '#bca880']
BOOT_LEATHER = ['#1e1410', '#4a3022', '#74503a', '#a8805e']


# ---- Batch E: adamant, rune and the Sunken Forge's monsters ----------------------

ADAMANT = ['#0e2614', '#24502a', '#4a8a4e', '#b0e0a8']
RUNE = ['#0a2232', '#18546e', '#34a0c4', '#b8f4ff']


def metal_ramp(pal):
    """Like mithril(): the grey metal takes a ramp by brightness; wood and leather stay."""
    def fn(im, get=None):
        rgba = np.array(im.convert('RGBA')).astype(np.float32)
        hsv = np.array(im.convert('RGB').convert('HSV')).astype(np.float32)
        h, s = hsv[..., 0], hsv[..., 1]
        m = rgba[..., 3] > 0
        metal = m & ((s < 70) | ((h > 120) & (h < 190) & (s < 110)))
        if not metal.any(): return im.copy()
        l = lum(rgba[..., :3]) / 255
        lo, hi = np.percentile(l[metal], 3), np.percentile(l[metal], 99)
        t = np.clip((l - lo) / max(1e-3, hi - lo), 0, 1)
        out = rgba.copy()
        out[metal, :3] = J.ramp(pal, t)[metal]
        return Image.fromarray(out.clip(0, 255).astype(np.uint8), 'RGBA')
    return fn


def molten(body, glow, glow_test, lo_t=0.45, span=0.6):
    """Recolour a creature: its glowing parts (picked by glow_test on HSV) take
    the glow ramp, everything else the body ramp."""
    def fn(im, get=None):
        rgba = np.array(im.convert('RGBA')).astype(np.float32)
        hsv = np.array(im.convert('RGB').convert('HSV')).astype(np.float32)
        m = rgba[..., 3] > 0
        g = m & glow_test(hsv)
        l = lum(rgba[..., :3]) / 255
        lo, hi = np.percentile(l[m], 3), np.percentile(l[m], 99)
        t = np.clip((l - lo) / max(1e-3, hi - lo), 0, 1)
        out = rgba.copy()
        out[m, :3] = J.ramp(body, t)[m]
        out[g, :3] = J.ramp(glow, np.clip(lo_t + t * span, 0, 1))[g]
        return Image.fromarray(out.clip(0, 255).astype(np.uint8), 'RGBA')
    return fn


IRON_BODY = ['#141214', '#2e2a2c', '#58504c', '#8a7c70']
LAVA = ['#6a1a06', '#d4501a', '#ff9a3a', '#fff0a0']
CHARCOAL = ['#060404', '#16100e', '#2c201c', '#4a342c']
# the essence golem's blue crystal glow; the cave beast's lightest fur (muzzle, claws, belly)
golem_glow = lambda hsv: (hsv[..., 0] > 110) & (hsv[..., 0] < 190) & (hsv[..., 1] > 60) & (hsv[..., 2] > 120)
beast_glow = lambda hsv: hsv[..., 2] > 135


# ---- Batch H: the cold great furnace, the ember core, the smith's outfit ----------

def cold(im, get=None):
    """A furnace with its fire out: the warm glowing parts go to dead grey ash."""
    rgba = np.array(im.convert('RGBA')).astype(np.float32)
    hsv = np.array(im.convert('RGB').convert('HSV')).astype(np.float32)
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    fire = (rgba[..., 3] > 0) & (s > 70) & (v > 100) & ((h < 62) | (h > 235))
    l = lum(rgba[..., :3]) / 255
    out = rgba.copy()
    out[fire, :3] = (np.stack([30 + 50 * l, 28 + 46 * l, 28 + 44 * l], -1))[fire]
    return Image.fromarray(out.clip(0, 255).astype(np.uint8), 'RGBA')


SOOT = ['#120e0c', '#2e221a', '#54402e', '#8a6c4e']
SOOT_GREY = ['#0e0e10', '#26262a', '#46464c', '#76767e']


# ---- The Runebound: Tobin the Hermit (Old Finn in a faded Watch coat) -------------

WATCH_COAT = ['#1e2416', '#3a4628', '#5a6a3a', '#86945a']
OLD_HAT = ['#1a120c', '#3a2a1a', '#5a4228', '#7a5c3a']


def tobin_garb(im, get=None):
    """Finn's blue coat -> a faded olive Watch coat; his straw hat -> worn brown."""
    rgba = np.array(im.convert('RGBA')).astype(np.float32)
    hsv = np.array(im.convert('RGB').convert('HSV')).astype(np.float32)
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    m = rgba[..., 3] > 0
    rows = np.arange(h.shape[0])[:, None] * np.ones_like(h)
    coat = m & (h > 130) & (h < 215) & (s > 35)
    hat = m & (h >= 8) & (h < 48) & (s > 70) & (v > 70) & ((rows <= 7) | ((rows <= 9) & (s > 150)))
    l = lum(rgba[..., :3]) / 255
    out = rgba.copy()
    for mask, pal in ((coat, WATCH_COAT), (hat, OLD_HAT)):
        if mask.any():
            lo, hi = np.percentile(l[mask], 3), np.percentile(l[mask], 99)
            t = np.clip((l - lo) / max(1e-3, hi - lo), 0, 1)
            out[mask, :3] = J.ramp(pal, t)[mask]
    return Image.fromarray(out.clip(0, 255).astype(np.uint8), 'RGBA')


# ---- The Runebound, chapter 5: pale cave goblins (warren goblins, the Digmaster) --

CAVE_SKIN = ['#262c24', '#4a5646', '#76866e', '#a6b69c']


def cave_goblin(im, get=None):
    """Green goblin skin -> the pale grey-green of goblins that never see the sun."""
    rgba = np.array(im.convert('RGBA')).astype(np.float32)
    hsv = np.array(im.convert('RGB').convert('HSV')).astype(np.float32)
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    skin = (rgba[..., 3] > 0) & (h > 40) & (h < 115) & (s > 60)
    if not skin.any():
        return im
    l = lum(rgba[..., :3]) / 255
    lo, hi = np.percentile(l[skin], 3), np.percentile(l[skin], 99)
    t = np.clip((l - lo) / max(1e-3, hi - lo), 0, 1)
    out = rgba.copy()
    out[skin, :3] = J.ramp(CAVE_SKIN, t)[skin]
    return Image.fromarray(out.clip(0, 255).astype(np.uint8), 'RGBA')


DIG_APRON = ['#20160e', '#4a3420', '#7a5832', '#a8804a']


def digmaster(im, get=None):
    """The Goblin Chief as the Digmaster: pale cave skin (the chief's is a
    darker olive) and a dusty leather apron instead of his red cape."""
    rgba = np.array(im.convert('RGBA')).astype(np.float32)
    hsv = np.array(im.convert('RGB').convert('HSV')).astype(np.float32)
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    m = rgba[..., 3] > 0
    l = lum(rgba[..., :3]) / 255
    out = rgba.copy()
    for mask, pal in ((m & (h >= 28) & (h < 115) & (s > 60), CAVE_SKIN), (m & ((h >= 200) | (h < 6)) & (s > 90), DIG_APRON)):
        if mask.any():
            lo, hi = np.percentile(l[mask], 3), np.percentile(l[mask], 99)
            t = np.clip((l - lo) / max(1e-3, hi - lo), 0, 1)
            out[mask, :3] = J.ramp(pal, t)[mask]
    return Image.fromarray(out.clip(0, 255).astype(np.uint8), 'RGBA')


# ---- The Runebound, chapter 6: Grubnak (the Goblin Chief, twice the size, with
# stone-grey skin from forty years bound in the rock and glowing rune marks) ----

GRUB_STONE = ['#1a1e1c', '#363e3a', '#5a6460', '#8e9a94']
GRUB_CAPE = ['#100406', '#300a10', '#561420', '#7e2230']


def grubnak(im, get=None):
    rgba = np.array(im.convert('RGBA')).astype(np.float32)
    hsv = np.array(im.convert('RGB').convert('HSV')).astype(np.float32)
    h, s = hsv[..., 0], hsv[..., 1]
    m = rgba[..., 3] > 0
    skin = m & (h >= 28) & (h < 80) & (s > 50)
    cape = m & ((h >= 200) | (h < 6)) & (s > 90)
    l = lum(rgba[..., :3]) / 255
    out = rgba.copy()
    for mask, pal in ((skin, GRUB_STONE), (cape, GRUB_CAPE)):
        if mask.any():
            lo, hi = np.percentile(l[mask], 3), np.percentile(l[mask], 99)
            t = np.clip((l - lo) / max(1e-3, hi - lo), 0, 1)
            out[mask, :3] = J.ramp(pal, t)[mask]
    img = Image.fromarray(out.clip(0, 255).astype(np.uint8), 'RGBA')
    big = img.resize((img.width * 2, img.height * 2), Image.NEAREST)
    sk = np.array(Image.fromarray((skin * 255).astype(np.uint8)).resize(big.size, Image.NEAREST)) > 0
    b = np.array(big)
    ys, xs = np.nonzero(sk)
    if len(xs):
        rng = np.random.default_rng(1)  # the same marks on every frame
        for i in rng.choice(len(xs), size=min(len(xs) // 40 + 1, 14), replace=False):
            x, y = xs[i], ys[i]
            for d in range(3):
                if y + d < b.shape[0] and sk[y + d, x]: b[y + d, x, :3] = (190, 245, 255) if d == 1 else (110, 225, 255)
    return Image.fromarray(b, 'RGBA')


# ---- The Runebound, the ending: Grubnak turned to stone, Holt's sword and the
# Runebound cape ----

STATUE = ['#2a2c2c', '#4a4e4c', '#6e7270', '#9a9e9a', '#bcc0ba']


def stone_statue(im, get=None):
    """Grubnak as a statue: every colour turned to weathered grey stone, his
    rune marks still glowing faintly blue."""
    rgba = np.array(im.convert('RGBA')).astype(np.float32)
    m = rgba[..., 3] > 0
    glow = m & (rgba[..., 2] > 200) & (rgba[..., 1] > 180) & (rgba[..., 0] < 200)
    l = lum(rgba[..., :3]) / 255
    lo, hi = np.percentile(l[m], 2), np.percentile(l[m], 99)
    t = np.clip((l - lo) / max(1e-3, hi - lo), 0, 1)
    out = rgba.copy()
    out[m, :3] = J.ramp(STATUE, t)[m]
    out[glow, :3] = (70, 150, 190)
    return Image.fromarray(out.clip(0, 255).astype(np.uint8), 'RGBA')


def holts_blade(im, get=None):
    """Steel longsword -> Captain Holt's old sword: a darker, older blade and a
    worn gold hilt."""
    rgba = np.array(im.convert('RGBA')).astype(np.float32)
    hsv = np.array(im.convert('RGB').convert('HSV')).astype(np.float32)
    h, s = hsv[..., 0], hsv[..., 1]
    m = rgba[..., 3] > 0
    warm = m & ((h < 45) | (h > 215)) & (s > 60)  # the hilt and grip (red-brown wraps round the hue wheel)
    metal = m & ~warm
    l = lum(rgba[..., :3]) / 255
    out = rgba.copy()
    out[metal, :3] = out[metal, :3] * 0.9 + np.array([4, 2, -4])
    if warm.any():
        lo, hi = np.percentile(l[warm], 3), np.percentile(l[warm], 99)
        t = np.clip((l - lo) / max(1e-3, hi - lo), 0, 1)
        out[warm, :3] = J.ramp(['#4a3208', '#8a6418', '#c89a30', '#f0d070'], t)[warm]
    return Image.fromarray(out.clip(0, 255).astype(np.uint8), 'RGBA')


def runebound_cape(im, get=None):
    """The wolf-pelt cloak, dyed deep midnight blue, with a glowing rune."""
    rgba = np.array(im.convert('RGBA')).astype(np.float32)
    m = rgba[..., 3] > 0
    l = lum(rgba[..., :3]) / 255
    lo, hi = np.percentile(l[m], 3), np.percentile(l[m], 99)
    t = np.clip((l - lo) / max(1e-3, hi - lo), 0, 1)
    out = rgba.copy()
    out[m, :3] = J.ramp(['#0c1020', '#1a2444', '#2c3c6a', '#4a5e96'], t)[m]
    ys, xs = np.nonzero(m)
    if len(xs):  # a small rune in the middle of the cloak
        cy, cx = int(ys.mean()), int(xs.mean())
        for dy, dx in ((-2, 0), (-1, 0), (0, 0), (1, 0), (2, 0), (-1, -1), (-1, 1), (1, -1), (1, 1)):
            y, x = cy + dy, cx + dx
            if 0 <= y < out.shape[0] and 0 <= x < out.shape[1] and m[y, x]:
                out[y, x, :3] = (190, 245, 255) if dx == 0 else (110, 225, 255)
    return Image.fromarray(out.clip(0, 255).astype(np.uint8), 'RGBA')


# Sprites made at a different size: new key <- source key, every frame, scale.
SCALED = [('chars:enemy:grubnak', 'chars:enemy:goblinChief', grubnak, 2)] + [
    (f'anim:grubnak:attack:{d}', f'anim:goblinChief:attack:{d}', grubnak, 2) for d in DIRS]


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
# Batch F: new pieces for bronze and iron (steel and mithril follow below).
for metal in ('bronze', 'iron'):
    ref = f'icon:{metal}SqShield'
    tint = metal_of(ref)
    DERIVED.update({
        f'{metal}Boots': dict(icon=('leatherBoots', tint), small=('leatherBoots', tint), gear=('leatherBoots', tint)),
        f'{metal}Gauntlets': dict(icon=('leatherGloves', tint), small=('leatherGloves', tint)),
        f'{metal}Spear': dict(icon=(f'{metal}Pickaxe', spear_of(f'icon:{metal}Dagger')), gear=(f'{metal}Sword', same)),
        f'{metal}Warhammer': dict(icon=('hammer', metal_parts(ref)), gear=(f'{metal}Axe', same)),
        f'{metal}2hSword': dict(icon=(f'{metal}Sword', two_hander), gear=(f'{metal}Sword', same)),
        f'{metal}Dart': dict(icon=(f'{metal}Dagger', darts_of(ref))),
        f'{metal}DartTip': dict(icon=(f'{metal}Arrowtips', small_heads)),
        f'{metal}ThrowingKnife': dict(icon=(f'{metal}Dagger', knives)),
        f'{metal}Javelin': dict(icon=(f'{metal}Pickaxe', javelins_of(f'icon:{metal}Dagger'))),
        f'{metal}JavelinHeads': dict(icon=(f'{metal}Dagger', blade_tips)),
    })

# Steel: every iron item, recoloured (made after the iron ones above, so the
# new iron pieces are included).
STEEL = ['Dagger', 'Axe', 'Pickaxe', 'Mace', 'MedHelm', 'Sword', 'Scimitar', 'Longsword', 'FullHelm', 'SqShield',
         'Battleaxe', 'Chainbody', 'Kiteshield', 'Platelegs', 'Platebody', 'Arrowtips', 'Arrow', 'Bar',
         'Boots', 'Gauntlets', 'Spear', 'Warhammer', '2hSword', 'Dart', 'DartTip', 'ThrowingKnife', 'Javelin', 'JavelinHeads']
for part in STEEL:
    DERIVED[f'steel{part}'] = dict(icon=(f'iron{part}', steel), small=(f'iron{part}', steel), gear=(f'iron{part}', steel))
DERIVED['holtsSword'] = dict(icon=('steelLongsword', holts_blade), small=('steelLongsword', holts_blade), gear=('steelLongsword', holts_blade))
DERIVED['runeboundCape'] = dict(icon=('wolfCloak', runebound_cape), small=('wolfCloak', runebound_cape), gear=('wolfCloak', runebound_cape))
DERIVED['coal'] = dict(icon=('ironOre', coal_lump), small=('ironOre', coal_lump))

# Silver, gold and gems. Jewellery is drawn in code (tools/jewel_art.py).
S_, G_ = J.METAL['silver'], J.METAL['gold']
DERIVED.update({
    'silverOre': dict(icon=('tinOre', lum_to(S_)), small=('tinOre', lum_to(S_))),
    'goldOre': dict(icon=('copperOre', veins_to(G_)), small=('copperOre', veins_to(G_))),
    'silverBar': dict(icon=('ironBar', lum_to(S_)), small=('ironBar', lum_to(S_))),
    'goldBar': dict(icon=('bronzeBar', lum_to(G_)), small=('bronzeBar', lum_to(G_))),
    'chisel': dict(icon=('knife', drawn(J.chisel))),
    'ringMould': dict(icon=('warCharm', drawn(lambda: J.mould('ring')))),
    'amuletMould': dict(icon=('warCharm', drawn(lambda: J.mould('amulet')))),
})
for gem in J.GEM:
    cap = gem[0].upper() + gem[1:]
    DERIVED[f'uncut{cap}'] = dict(icon=('tinOre', lambda im, get=None, g=gem: J.uncut_gem(g, im)), small=('tinOre', lambda im, get=None, g=gem: J.uncut_gem(g, im)))
    DERIVED[gem] = dict(icon=('warCharm', drawn(lambda g=gem: J.cut_gem(g))))
for metal in ('silver', 'gold'):
    M = metal[0].upper() + metal[1:]
    neck = dict(gear=('warCharm', lum_to(J.METAL[metal])))
    DERIVED[f'{metal}Ring'] = dict(icon=('warCharm', drawn(lambda m=metal: J.ring(m))))
    DERIVED[f'{metal}Amulet'] = dict(icon=('warCharm', drawn(lambda m=metal: J.amulet(m))), **neck)
    for gem in J.GEM:
        cap = gem[0].upper() + gem[1:]
        DERIVED[f'{metal}{cap}Ring'] = dict(icon=('warCharm', drawn(lambda m=metal, g=gem: J.ring(m, g))))
        DERIVED[f'{metal}{cap}Amulet'] = dict(icon=('warCharm', drawn(lambda m=metal, g=gem: J.amulet(m, g))), **neck)

# Mithril: every steel item, recoloured, plus the ore and bar.
for part in STEEL:
    DERIVED[f'mithril{part}'] = dict(icon=(f'steel{part}', mithril), small=(f'steel{part}', mithril), gear=(f'steel{part}', mithril))
DERIVED['mithrilOre'] = dict(icon=('ironOre', lum_to(MITHRIL)), small=('ironOre', lum_to(MITHRIL)))

# Adamant and rune: every steel item, recoloured, plus the ores.
for part in STEEL:
    DERIVED[f'adamant{part}'] = dict(icon=(f'steel{part}', metal_ramp(ADAMANT)), small=(f'steel{part}', metal_ramp(ADAMANT)), gear=(f'steel{part}', metal_ramp(ADAMANT)))
    DERIVED[f'rune{part}'] = dict(icon=(f'steel{part}', metal_ramp(RUNE)), small=(f'steel{part}', metal_ramp(RUNE)), gear=(f'steel{part}', metal_ramp(RUNE)))
DERIVED['adamantiteOre'] = dict(icon=('ironOre', lum_to(ADAMANT)), small=('ironOre', lum_to(ADAMANT)))
DERIVED['runiteOre'] = dict(icon=('ironOre', lum_to(RUNE)), small=('ironOre', lum_to(RUNE)))

# Batch H
DERIVED['emberCore'] = dict(icon=('ironOre', lum_to(LAVA)), small=('ironOre', lum_to(LAVA)))
DERIVED['smithsTunic'] = dict(icon=('leatherBody', lum_to(SOOT)), small=('leatherBody', lum_to(SOOT)), gear=('leatherBody', lum_to(SOOT)))
DERIVED['smithsTrousers'] = dict(icon=('leatherChaps', lum_to(SOOT_GREY)), small=('leatherChaps', lum_to(SOOT_GREY)), gear=('leatherChaps', lum_to(SOOT_GREY)))
DERIVED['smithsGloves'] = dict(icon=('leatherGloves', lum_to(SOOT)), small=('leatherGloves', lum_to(SOOT)))
DERIVED['smithsBoots'] = dict(icon=('leatherBoots', lum_to(SOOT_GREY)), small=('leatherBoots', lum_to(SOOT_GREY)), gear=('leatherBoots', lum_to(SOOT_GREY)))

# Steel studs and studded leather (after steel, so the studs are steel-coloured).
DERIVED['steelStuds'] = dict(icon=('ironArrowtips', studs_of('icon:steelSqShield')))
DERIVED['studdedBody'] = dict(icon=('leatherBody', studded_with('icon:steelSqShield')), small=('leatherBody', studded_with('icon:steelSqShield')), gear=('leatherBody', studded_with('icon:steelSqShield')))
DERIVED['studdedChaps'] = dict(icon=('leatherChaps', studded_with('icon:steelSqShield')), small=('leatherChaps', studded_with('icon:steelSqShield')), gear=('leatherChaps', studded_with('icon:steelSqShield')))

# Batch G
DERIVED['stardust'] = dict(icon=('runeEssence', stardust_icon))
DERIVED['coalBag'] = dict(icon=('bag', bag_of(['#141216', '#36343c', '#5a5862', '#8a8894'], 'icon:coal')))
DERIVED['gemBag'] = dict(icon=('bag', bag_of(['#2a1240', '#5a2a8a', '#8a54c0', '#c8a0f0'], 'icon:sapphire')))
DERIVED['prospectorHelmet'] = dict(icon=('bronzeMedHelm', hard_hat), small=('bronzeMedHelm', hard_hat), gear=('bronzeMedHelm', hard_hat))
DERIVED['prospectorJacket'] = dict(icon=('leatherBody', lum_to(CANVAS)), small=('leatherBody', lum_to(CANVAS)), gear=('leatherBody', lum_to(CANVAS)))
DERIVED['prospectorLegs'] = dict(icon=('leatherChaps', lum_to(CANVAS_DARK)), small=('leatherChaps', lum_to(CANVAS_DARK)), gear=('leatherChaps', lum_to(CANVAS_DARK)))
DERIVED['prospectorBoots'] = dict(icon=('leatherBoots', lum_to(BOOT_LEATHER)), small=('leatherBoots', lum_to(BOOT_LEATHER)), gear=('leatherBoots', lum_to(BOOT_LEATHER)))

# Other sprites: new key <- source key, every frame.
EXTRA = [
    ('ore:coal', 'ore:copper', coal),
    ('ore:silver', 'ore:copper', veins_to(J.METAL['silver'])),
    ('ore:gold', 'ore:copper', veins_to(J.METAL['gold'])),
    ('tool:steelAxe', 'tool:ironAxe', steel),
    ('tool:steelPickaxe', 'tool:ironPickaxe', steel),
    ('ore:mithril', 'ore:copper', veins_to(MITHRIL)),
    ('tool:mithrilAxe', 'tool:steelAxe', mithril),
    ('tool:mithrilPickaxe', 'tool:steelPickaxe', mithril),
    ('ore:gem', 'ore:copper', gem_veins),
    ('ore:adamantite', 'ore:copper', veins_to(ADAMANT)),
    ('furnaceCold', 'furnace', cold),
    ('ore:runite', 'ore:copper', veins_to(RUNE)),
    ('tool:adamantAxe', 'tool:steelAxe', metal_ramp(ADAMANT)),
    ('tool:adamantPickaxe', 'tool:steelPickaxe', metal_ramp(ADAMANT)),
    ('tool:runeAxe', 'tool:steelAxe', metal_ramp(RUNE)),
    ('tool:runePickaxe', 'tool:steelPickaxe', metal_ramp(RUNE)),
    ('chars:enemy:forgeGolem', 'chars:enemy:essenceGolem', molten(IRON_BODY, LAVA, golem_glow)),
    ('chars:enemy:moltenBeast', 'chars:enemy:caveBeast', molten(CHARCOAL, LAVA, beast_glow, 0.2, 0.55)),
    ('anim:forgeGolem:attack:down', 'anim:essenceGolem:attack:down', molten(IRON_BODY, LAVA, golem_glow)),
    ('anim:moltenBeast:attack:down', 'anim:caveBeast:attack:down', molten(CHARCOAL, LAVA, beast_glow, 0.2, 0.55)),
    ('anim:forgeGolem:attack:up', 'anim:essenceGolem:attack:up', molten(IRON_BODY, LAVA, golem_glow)),
    ('anim:moltenBeast:attack:up', 'anim:caveBeast:attack:up', molten(CHARCOAL, LAVA, beast_glow, 0.2, 0.55)),
    ('anim:forgeGolem:attack:left', 'anim:essenceGolem:attack:left', molten(IRON_BODY, LAVA, golem_glow)),
    ('anim:moltenBeast:attack:left', 'anim:caveBeast:attack:left', molten(CHARCOAL, LAVA, beast_glow, 0.2, 0.55)),
    ('anim:forgeGolem:attack:right', 'anim:essenceGolem:attack:right', molten(IRON_BODY, LAVA, golem_glow)),
    ('anim:moltenBeast:attack:right', 'anim:caveBeast:attack:right', molten(CHARCOAL, LAVA, beast_glow, 0.2, 0.55)),
    ('anim:forgeGolem:fall', 'anim:essenceGolem:fall', molten(IRON_BODY, LAVA, golem_glow)),
    ('anim:forgeGolem:hit', 'anim:essenceGolem:hit', molten(IRON_BODY, LAVA, golem_glow)),
    ('chars:tobin', 'chars:finn', tobin_garb),
    ('grubnakStatue', 'chars:enemy:grubnak', stone_statue),
    ('chars:enemy:warrenGoblin', 'chars:enemy:goblinBrute', cave_goblin),
    ('chars:enemy:goblinDigmaster', 'chars:enemy:goblinChief', digmaster),
    ('anim:warrenGoblin:attack:up', 'anim:goblinBrute:attack:up', cave_goblin),
    ('anim:goblinDigmaster:attack:up', 'anim:goblinChief:attack:up', digmaster),
    ('anim:warrenGoblin:attack:down', 'anim:goblinBrute:attack:down', cave_goblin),
    ('anim:goblinDigmaster:attack:down', 'anim:goblinChief:attack:down', digmaster),
    ('anim:warrenGoblin:attack:left', 'anim:goblinBrute:attack:left', cave_goblin),
    ('anim:goblinDigmaster:attack:left', 'anim:goblinChief:attack:left', digmaster),
    ('anim:warrenGoblin:attack:right', 'anim:goblinBrute:attack:right', cave_goblin),
    ('anim:goblinDigmaster:attack:right', 'anim:goblinChief:attack:right', digmaster),
    ('anim:warrenGoblin:hit', 'anim:goblinBrute:hit', cave_goblin),
    ('anim:warrenGoblin:fall', 'anim:goblinBrute:fall', cave_goblin),
]

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


def derive(get0):
    """get(name) -> list of (k, image, ax, ay) for an existing sprite, or [].
    Returns new (name, k, image, ax, ay) tiles. Later items can be made from
    earlier derived ones (steel from the derived iron pieces)."""
    out = []
    made = {}
    def get(name):
        return get0(name) or made.get(name, [])
    def emit(t):
        out.append(t)
        made.setdefault(t[0], []).append((t[1], t[2], t[3], t[4]))
    for new, spec in DERIVED.items():
        src, fn = spec['icon']
        icons = get(f'icon:{src}')
        if not icons: continue
        k, im, ax, ay = icons[0]
        icon = fn(im, get)
        emit((f'icon:{new}', 0, icon, ax, ay))
        if spec.get('small'):
            s2, f2 = spec['small']
            for k, im, ax, ay in get(f'iconS:{s2}'):
                emit((f'iconS:{new}', k, f2(im, get), ax, ay))
        else:
            srcS = get(f'iconS:{src}')
            ax, ay = (srcS[0][2], srcS[0][3]) if srcS else (8, 13)
            emit((f'iconS:{new}', 0, _small_from(icon, srcS[0][1] if srcS else None), ax, ay))
        if spec.get('gear'):
            gs, gf = spec['gear']
            for d in DIRS:
                f = same if (d in ('left', 'right') and gf is kite) else gf
                for k, im, ax, ay in get(f'gear:{gs}:{d}'):
                    emit((f'gear:{new}:{d}', k, f(im, get), ax, ay))
    for new, src, fn in EXTRA:
        for k, im, ax, ay in get(src):
            emit((new, k, fn(im, get), ax, ay))
    for new, src, fn, k2 in SCALED:
        for k, im, ax, ay in get(src):
            emit((new, k, fn(im, get), ax * k2, ay * k2))
    # Ready-made sprites (cut from a magenta sheet and shrunk to game size),
    # kept in tools/sprites/<name>.png; anchored at the bottom middle.
    for f in sorted(os.listdir(SPRITE_DIR)) if os.path.isdir(SPRITE_DIR) else []:
        if not f.endswith('.png'): continue
        im = Image.open(os.path.join(SPRITE_DIR, f)).convert('RGBA')
        emit((f[:-4], 0, im, im.width // 2, im.height - 2))
    for size, scale in ((1, 0.62), (2, 0.78), (3, 0.95), (4, 1.12), (5, 1.3)):
        src = get('oreEssence')
        if not src: break
        k0, im, ax, ay = src[0]
        for k, bright in ((0, 1.0), (1, 1.18)):
            emit((f'star:{size}', k, star_rock(scale, bright)(im), round(ax * scale), round(ay * scale)))
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
