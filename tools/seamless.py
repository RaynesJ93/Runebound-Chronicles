import numpy as np
from PIL import Image
def seamless(im, trim=12):
    """Makes a texture tile without seams: crossfades it with a half-offset copy near the edges."""
    a = np.array(im.convert('RGB').crop((trim, trim, im.width - trim, im.height - trim))).astype(np.float32)
    h, w = a.shape[:2]
    b = np.roll(np.roll(a, h // 2, 0), w // 2, 1)
    y = np.abs(np.arange(h) - (h - 1) / 2) / (h / 2)
    x = np.abs(np.arange(w) - (w - 1) / 2) / (w / 2)
    wgt = np.clip((np.maximum(y[:, None], x[None, :]) - 0.55) / 0.4, 0, 1)[..., None]
    return Image.fromarray((a * (1 - wgt) + b * wgt).astype(np.uint8))
