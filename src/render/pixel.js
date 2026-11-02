// Pixel-art toolkit. All game art is drawn in code at 16 px per tile, then
// scaled up with nearest-neighbour filtering so every pixel stays crisp.
//
// The main tricks:
//  - shadedBlobs(): clusters of circles lit from the top-left, quantised to
//    4 tones with a little dithering — gives chunky, bumpy tree canopies.
//  - outline(): adds a 1 px dark outline around every opaque pixel, which is
//    what makes sprites read clearly on busy grass.

export const TILE = 16;
export const OUTLINE = [43, 29, 22];

export function hex(c) {
  const n = typeof c === 'number' ? c : parseInt(String(c).replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function shade(rgb, f) {
  return rgb.map((v) => Math.max(0, Math.min(255, Math.round(v * f))));
}

export function css(rgb, a = 1) {
  return a === 1 ? `rgb(${rgb[0]},${rgb[1]},${rgb[2]})` : `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;
}

export function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.imageSmoothingEnabled = false;
  return { c, g, w, h };
}

// Deterministic per-pixel noise in [0, 1).
export function rnd(x, y, seed = 0) {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(seed | 0, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

const BAYER = [0, 0.5, 0.75, 0.25];
export const dither = (x, y) => BAYER[(x & 1) + ((y & 1) << 1)];

// A plain bitmap you can poke pixels into, then turn into a canvas.
export class Bitmap {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.data = new Uint8ClampedArray(w * h * 4);
  }

  set(x, y, rgb, a = 255) {
    x |= 0; y |= 0;
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 4;
    this.data[i] = rgb[0];
    this.data[i + 1] = rgb[1];
    this.data[i + 2] = rgb[2];
    this.data[i + 3] = a;
  }

  alpha(x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return 0;
    return this.data[(y * this.w + x) * 4 + 3];
  }

  rect(x, y, w, h, rgb) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, rgb);
  }

  ellipse(cx, cy, rx, ry, rgb) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        if (((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1) this.set(x, y, rgb);
      }
    }
  }

  // Outline every opaque pixel with a 1 px border (4-neighbour).
  outline(rgb = OUTLINE) {
    const out = [];
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (this.alpha(x, y) > 128) continue;
        if (this.alpha(x - 1, y) > 128 || this.alpha(x + 1, y) > 128 || this.alpha(x, y - 1) > 128 || this.alpha(x, y + 1) > 128) out.push([x, y]);
      }
    }
    for (const [x, y] of out) this.set(x, y, rgb);
    return this;
  }

  toCanvas() {
    const { c, g } = canvas(this.w, this.h);
    g.putImageData(new ImageData(this.data, this.w, this.h), 0, 0);
    return c;
  }
}

// Circles shaded as little spheres lit from the top-left. Later circles in
// the list are "in front". tones = [dark, mid, light, highlight].
export function shadedBlobs(bmp, circles, tones, seed = 1) {
  for (let y = 0; y < bmp.h; y++) {
    for (let x = 0; x < bmp.w; x++) {
      let hit = null;
      for (let k = circles.length - 1; k >= 0; k--) {
        const [cx, cy, r] = circles[k];
        const dx = (x + 0.5 - cx) / r;
        const dy = (y + 0.5 - cy) / r;
        if (dx * dx + dy * dy <= 1) { hit = [dx, dy]; break; }
      }
      if (!hit) continue;
      const [dx, dy] = hit;
      let l = -(dx * 0.62 + dy * 0.78) + (rnd(x, y, seed) - 0.5) * 0.25 + (dither(x, y) - 0.4) * 0.22;
      // darker rim towards the bottom-right edge of each cluster
      if (dx * dx + dy * dy > 0.72 && dx + dy > 0.2) l -= 0.35;
      const t = l > 0.62 ? 3 : l > 0.12 ? 2 : l > -0.4 ? 1 : 0;
      bmp.set(x, y, tones[t]);
    }
  }
}

// Soft dark ellipse used under trees and characters.
export function shadowSprite(rx, ry) {
  const { c, g } = canvas(rx * 2, ry * 2);
  g.fillStyle = 'rgba(20, 30, 10, 0.28)';
  g.beginPath();
  g.ellipse(rx, ry, rx, ry, 0, 0, Math.PI * 2);
  g.fill();
  return c;
}
