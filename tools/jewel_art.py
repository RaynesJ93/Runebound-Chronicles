"""Pixel art drawn in code for jewellery, gems and crafting tools (no sheets
yet), in the same style as the painted icons: soft ramps and a dark outline.
Used by derived.py."""
import numpy as np
from PIL import Image

OUT = (24, 16, 20)
GEM = {
    'sapphire': ['#14205e', '#2a48b8', '#5f8cf4', '#cfe0ff'],
    'emerald': ['#0b3f22', '#1c8a4c', '#52d483', '#dcffe8'],
    'ruby': ['#4e0814', '#a8182e', '#ec4a60', '#ffdde2'],
    'diamond': ['#5e6e80', '#a9c2d6', '#e4f2fc', '#ffffff'],
}
METAL = {
    'silver': ['#4e545c', '#8e98a2', '#cdd5dc', '#fbfdff'],
    'gold': ['#6e420c', '#bf8a22', '#efc444', '#fff3b8'],
}
hx = lambda h: np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], float)


def ramp(cols, t):
    """t in 0..1 -> colour along a 4-step palette."""
    c = [hx(x) for x in cols]
    t = np.clip(t, 0, 1) * 3
    i = np.minimum(t.astype(int), 2)
    f = (t - i)[..., None]
    a = np.stack(c)[i]; b = np.stack(c)[i + 1]
    return a * (1 - f) + b * f


def outline(rgb, alpha):
    """Grow a 1 px dark outline around the sprite, like the painted icons."""
    a = alpha > 0
    p = np.pad(a, 1)
    nb = p[:-2, 1:-1] | p[2:, 1:-1] | p[1:-1, :-2] | p[1:-1, 2:]
    edge = nb & ~a
    out = np.zeros(rgb.shape[:2] + (4,), np.uint8)
    out[a, :3] = np.clip(rgb[a], 0, 255); out[a, 3] = 255
    out[edge, :3] = OUT; out[edge, 3] = 255
    return Image.fromarray(out, 'RGBA')


def gem_pixels(cx, cy, w, h, cols, size):
    """A brilliant-cut gem: crown above the girdle, pavilion to a point below.
    Returns (rgb, mask) on a size x size grid."""
    yy, xx = np.mgrid[0:size, 0:size] + 0.5
    top, gird, bot = cy - h * 0.42, cy - h * 0.06, cy + h * 0.58
    half = w / 2
    dx = xx - cx
    crown = (yy >= top) & (yy < gird) & (np.abs(dx) <= half * (0.62 + 0.38 * (yy - top) / max(1e-3, gird - top)))
    pav = (yy >= gird) & (yy <= bot) & (np.abs(dx) <= half * (1 - (yy - gird) / max(1e-3, bot - gird)))
    m = crown | pav
    t = np.zeros_like(xx)
    table = crown & (np.abs(dx) < half * 0.38) & (yy < top + (gird - top) * 0.6)
    t[crown] = 0.62 - 0.25 * (dx[crown] / half)
    t[table] = 0.85
    # pavilion facets: alternate bands fanning to the point
    ang = np.arctan2(yy - bot, dx + 1e-6)
    band = (np.floor((ang + np.pi) / (np.pi / 5)) % 2)
    t[pav] = 0.18 + 0.32 * band[pav] - 0.12 * (dx[pav] / half)
    rgb = ramp(cols, t)
    # sparkle
    sx, sy = int(cx - half * 0.3), int(top + 1)
    if 0 <= sy < size and 0 <= sx < size and m[sy, sx]: rgb[sy, sx] = 255
    return rgb, m


def cut_gem(name, size=32):
    rgb, m = gem_pixels(16, 16, 24, 22, GEM[name], size)
    return outline(rgb, m)


def uncut_gem(name, lump):
    """A rough gem: the ore lump's shape and shading in the gem's colours."""
    a = np.array(lump.convert('RGBA')).astype(float)
    m = a[..., 3] > 0
    l = (a[..., 0] * 0.3 + a[..., 1] * 0.59 + a[..., 2] * 0.11) / 255
    lo, hi = np.percentile(l[m], 5), np.percentile(l[m], 97)
    t = np.clip((l - lo) / max(1e-3, hi - lo), 0, 1) * 0.85
    out = a.copy()
    out[m, :3] = ramp(GEM[name], t)[m]
    # keep the dark outline
    dark = m & (l < lo + 0.02)
    out[dark, :3] = OUT
    return Image.fromarray(out.clip(0, 255).astype(np.uint8), 'RGBA')


def ring(metal, gem=None, size=32):
    yy, xx = np.mgrid[0:size, 0:size] + 0.5
    cx, cy, rx, ry = 16, 20, 10, 7
    d_out = ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2
    d_in = ((xx - cx) / (rx - 3.4)) ** 2 + ((yy - cy) / (ry - 3)) ** 2
    m = (d_out <= 1) & (d_in > 1)
    # light from the top-left; the back of the band is in shade
    t = 0.55 - 0.35 * (xx - cx) / rx - 0.15 * (yy - cy) / ry
    t = np.where(yy < cy - 1, t - 0.22, t)
    rgb = ramp(METAL[metal], t)
    if gem:
        # a little setting and the stone on top of the band
        st = ((xx - cx) ** 2 / 4.2 ** 2 + (yy - (cy - ry + 1)) ** 2 / 3.0 ** 2) <= 1
        m = m | st
        rgb[st] = ramp(METAL[metal], np.full(st.sum(), 0.3))
        g, gm = gem_pixels(cx, cy - ry - 1.5, 9, 9, GEM[gem], size)
        m = m | gm; rgb[gm] = g[gm]
    return outline(rgb, m)


def amulet(metal, gem=None, size=32):
    yy, xx = np.mgrid[0:size, 0:size] + 0.5
    m = np.zeros((size, size), bool); rgb = np.zeros((size, size, 3))
    # the chain: two arcs of beads meeting above the pendant
    for k in range(13):
        u = k / 12
        for side in (-1, 1):
            x = 16 + side * (11 - 10 * u) ; y = 3 + 13 * u ** 1.4 + 2 * np.sin(u * np.pi)
            bead = (xx - x) ** 2 + (yy - y) ** 2 <= 1.3 ** 2
            m |= bead; rgb[bead] = ramp(METAL[metal], np.array([0.75 if k % 2 else 0.45]))
    # the pendant
    pcx, pcy, pr = 16, 22.5, 6.3
    disc = (xx - pcx) ** 2 + (yy - pcy) ** 2 <= pr ** 2
    t = 0.6 - 0.3 * (xx - pcx) / pr - 0.25 * (yy - pcy) / pr
    rgb[disc] = ramp(METAL[metal], t)[disc]; m |= disc
    bail = ((xx - 16) ** 2 / 1.6 ** 2 + (yy - 15.5) ** 2 / 1.8 ** 2) <= 1
    rgb[bail] = ramp(METAL[metal], np.full(bail.sum(), 0.55)); m |= bail
    if gem:
        g, gm = gem_pixels(pcx, pcy + 0.5, 8.5, 8.5, GEM[gem], size)
        rgb[gm] = g[gm]
    else:
        ring_ = disc & ((xx - pcx) ** 2 + (yy - pcy) ** 2 >= (pr - 1.6) ** 2)
        rgb[disc & ~ring_] = ramp(METAL[metal], (0.4 + 0.3 * (pcx - xx) / pr)[disc & ~ring_])
    return outline(rgb, m)


def chisel(size=32):
    yy, xx = np.mgrid[0:size, 0:size] + 0.5
    # along the diagonal from bottom-left (handle) to top-right (blade)
    u = (xx - 5 + (26 - yy)) / 2 / 21          # 0 at the handle end, 1 at the tip
    v = (xx - 5 - (26 - yy)) / 2               # across the tool
    rgb = np.zeros((size, size, 3)); m = np.zeros((size, size), bool)
    handle = (u >= 0) & (u < 0.45) & (np.abs(v) <= 2.2)
    ferrule = (u >= 0.45) & (u < 0.52) & (np.abs(v) <= 2.4)
    blade = (u >= 0.52) & (u <= 1.0) & (np.abs(v) <= 1.5 + 0.6 * (u - 0.52) / 0.48)
    wood = ['#3a220e', '#6e4220', '#9a6232', '#c08a52']
    steelc = ['#4e565e', '#8e98a2', '#c8d0d6', '#f4f8fa']
    rgb[handle] = ramp(wood, 0.5 - 0.18 * v[handle])[...]
    rgb[ferrule] = ramp(METAL['gold'], 0.55 - 0.15 * v[ferrule])
    rgb[blade] = ramp(steelc, 0.6 - 0.2 * v[blade] + 0.25 * (u[blade] > 0.94))
    m = handle | ferrule | blade
    return outline(rgb, m)


def mould(kind, size=32):
    yy, xx = np.mgrid[0:size, 0:size] + 0.5
    x0, x1, y0, y1, r = 4, 28, 7, 27, 3.5
    cx = np.clip(xx, x0 + r, x1 - r); cy = np.clip(yy, y0 + r, y1 - r)
    m = (xx - cx) ** 2 + (yy - cy) ** 2 <= r ** 2
    sand = ['#6a5232', '#a8865a', '#d2b486', '#f0dcb4']
    t = 0.62 - 0.2 * (xx - 16) / 12 - 0.15 * (yy - 17) / 10
    rgb = ramp(sand, t)
    if kind == 'ring':
        d = ((xx - 16) / 6.5) ** 2 + ((yy - 17) / 6.5) ** 2
        hole = (d <= 1) & (d >= 0.42)
    else:
        d = ((xx - 16) / 5) ** 2 + ((yy - 20) / 5) ** 2
        groove = (np.abs(np.abs(xx - 16) - (20 - yy) * 0.75) < 0.9) & (yy < 16) & (yy > 9)
        hole = (d <= 1) | groove
    # the recess: dark, lit on its lower-right edge
    rgb[hole] = ramp(sand, 0.08 + 0.18 * ((xx - 16) / 8 + (yy - 17) / 8))[hole]
    return outline(rgb, m)
