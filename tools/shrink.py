"""Shrinks a cut-out sprite to game size while keeping it crisp pixel art."""
import numpy as np
from PIL import Image

OUTLINE = (24, 16, 20)

def shrink(img, w=None, h=None, outline=True, colors=48):
    img = img.convert('RGBA')
    if w is None: w = round(img.width * h / img.height)
    if h is None: h = round(img.height * w / img.width)
    a = np.array(img).astype(np.float32)
    # premultiply so transparent pixels don't bleed dark into the edges
    a[..., :3] *= a[..., 3:4] / 255
    small = np.array(Image.fromarray(a.astype(np.uint8)).resize((w, h), Image.BOX)).astype(np.float32)
    al = np.array(img.getchannel('A').resize((w, h), Image.BOX)).astype(np.float32)
    rgb = np.where(al[..., None] > 0, small[..., :3] * 255 / np.maximum(al[..., None], 1), 0)
    keep = al > 110
    out = np.zeros((h, w, 4), np.uint8)
    out[..., :3] = np.clip(rgb, 0, 255)
    out[..., 3] = np.where(keep, 255, 0)
    im = Image.fromarray(out)
    if colors:  # a limited palette keeps it looking hand-pixelled
        q = im.convert('RGB').quantize(colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB')
        im = Image.merge('RGBA', (*q.split(), im.getchannel('A')))
    if outline:
        a2 = np.array(im)
        k = a2[..., 3] > 0
        pad = np.pad(k, 1)
        nb = pad[:-2, 1:-1] | pad[2:, 1:-1] | pad[1:-1, :-2] | pad[1:-1, 2:]
        # darken the outermost ring of the sprite rather than growing it
        edge = k & ~(pad[:-2, 1:-1] & pad[2:, 1:-1] & pad[1:-1, :-2] & pad[1:-1, 2:])
        a2[edge, :3] = (a2[edge, :3] * 0.35 + np.array(OUTLINE) * 0.65).astype(np.uint8)
        im = Image.fromarray(a2)
    return im
