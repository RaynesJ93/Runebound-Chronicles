import { GROUND } from '../world/area.js';
import { TILE, Bitmap, rnd, dither, hex } from './pixel.js';

// Pre-renders the whole ground of an area into big canvases, once.
// Two frames are made so water can shimmer.

const P = {
  grass: [hex('#4b9533'), hex('#5aa63b'), hex('#68b444'), hex('#7ac450')],
  tuftDark: hex('#3c7f2a'),
  tuftLight: hex('#8ccf5c'),
  path: [hex('#c98f55'), hex('#d69d62'), hex('#e0ab70')],
  pathDark: hex('#ad7845'),
  pebble: hex('#efc58f'),
  stone: [hex('#9b958c'), hex('#aaa49a'), hex('#b7b1a6')],
  stoneHi: hex('#cdc7bb'),
  mortar: hex('#6d6860'),
  sand: [hex('#e2cc8f'), hex('#ead69c'), hex('#f2e2b0')],
  dirt: [hex('#7f522f'), hex('#8c5c36'), hex('#9a6840')],
  furrow: hex('#5f3c22'),
  water: [hex('#2f73b5'), hex('#3a82c4'), hex('#4b93d2')],
  waterHi: hex('#9fd3f5'),
  foam: hex('#d9f0ff'),
  shore: hex('#c7b278'),
};

const isSoft = (g) => g === GROUND.GRASS;

export function buildGround(area) {
  const W = area.W * TILE;
  const H = area.H * TILE;
  const frames = [new Bitmap(W, H), new Bitmap(W, H)];
  const g = (tx, ty) => (area.inBounds(tx, ty) ? area.groundAt(tx, ty) : GROUND.GRASS);

  // Smooth value noise for big grass colour patches.
  const vn = (x, y, s, seed) => {
    const x0 = Math.floor(x / s), y0 = Math.floor(y / s);
    const fx = x / s - x0, fy = y / s - y0;
    const sm = (t) => t * t * (3 - 2 * t);
    const a = rnd(x0, y0, seed), b = rnd(x0 + 1, y0, seed), c = rnd(x0, y0 + 1, seed), d = rnd(x0 + 1, y0 + 1, seed);
    const u = sm(fx), v = sm(fy);
    return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
  };

  const grassPixel = (x, y) => {
    const n = vn(x, y, 22, 11) * 0.7 + vn(x, y, 7, 12) * 0.3 + (dither(x, y) - 0.4) * 0.12 + (rnd(x, y, 13) - 0.5) * 0.18;
    return P.grass[n < 0.3 ? 0 : n < 0.5 ? 1 : n < 0.7 ? 2 : 3];
  };

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const tx = x >> 4, ty = y >> 4, lx = x & 15, ly = y & 15;
      let t = g(tx, ty);

      // Ragged edges where a path, square, sand or soil meets grass.
      if (t !== GROUND.GRASS && t !== GROUND.WATER) {
        const e = 1 + (rnd(x, y, 21) < 0.5 ? 1 : 0) + (rnd(x >> 1, y >> 1, 22) < 0.3 ? 1 : 0);
        if ((lx < e && isSoft(g(tx - 1, ty))) || (lx > 15 - e && isSoft(g(tx + 1, ty))) ||
            (ly < e && isSoft(g(tx, ty - 1))) || (ly > 15 - e && isSoft(g(tx, ty + 1)))) t = GROUND.GRASS;
      }

      let c;
      switch (t) {
        case GROUND.GRASS: c = grassPixel(x, y); break;
        case GROUND.PATH: {
          const n = rnd(x, y, 31);
          const k = Math.max(0, Math.min(2, Math.floor(vn(x, y, 6, 32) * 3 + (dither(x, y) - 0.5) * 0.6)));
          c = n < 0.07 ? P.pathDark : n > 0.97 ? P.pebble : P.path[k];
          break;
        }
        case GROUND.PLAZA: {
          const row = Math.floor(y / 6);
          const bx = (x + (row % 2) * 4) % 8;
          const by = y % 6;
          if (bx === 0 || by === 0) c = P.mortar;
          else {
            const brick = rnd(Math.floor((x + (row % 2) * 4) / 8), row, 41);
            c = by === 1 && bx < 6 ? P.stoneHi : P.stone[Math.floor(brick * 3)];
            if (rnd(x, y, 42) < 0.05) c = P.stone[0];
          }
          break;
        }
        case GROUND.SAND: {
          const n = rnd(x, y, 51) + (dither(x, y) - 0.5) * 0.3;
          c = P.sand[n < 0.3 ? 0 : n < 0.85 ? 1 : 2];
          break;
        }
        case GROUND.DIRT: {
          c = (y % 4 === 3) ? P.furrow : P.dirt[Math.floor(rnd(x, y, 61) * 2.2 + (y % 4 === 0 ? 0.9 : 0)) % 3];
          break;
        }
        default: c = P.water[1];
      }
      frames[0].set(x, y, c);
      frames[1].set(x, y, c);
    }
  }

  // Grass tufts: little "v" shapes scattered over grass tiles.
  for (let ty = 0; ty < area.H; ty++) {
    for (let tx = 0; tx < area.W; tx++) {
      if (g(tx, ty) !== GROUND.GRASS) continue;
      const n = Math.floor(rnd(tx, ty, 71) * 4);
      for (let k = 0; k < n; k++) {
        const x = tx * TILE + 2 + Math.floor(rnd(tx, ty, 72 + k) * 11);
        const y = ty * TILE + 3 + Math.floor(rnd(tx, ty, 75 + k) * 10);
        for (const f of frames) {
          f.set(x, y, P.tuftDark); f.set(x + 2, y, P.tuftDark); f.set(x + 4, y, P.tuftDark);
          f.set(x + 1, y + 1, P.tuftDark); f.set(x + 3, y + 1, P.tuftDark);
          f.set(x + 2, y - 1, P.tuftLight);
          f.set(x, y - 1, P.tuftLight);
        }
      }
    }
  }

  // Water: depth shading, foam at the shore, and moving glints.
  const waterDist = (x, y) => {
    let best = 9;
    for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
      const gx = (x + dx) >> 4, gy = (y + dy) >> 4;
      if (g(gx, gy) !== GROUND.WATER) best = Math.min(best, Math.max(Math.abs(dx), Math.abs(dy)));
    }
    return best;
  };
  for (let ty = 0; ty < area.H; ty++) {
    for (let tx = 0; tx < area.W; tx++) {
      if (g(tx, ty) !== GROUND.WATER) continue;
      for (let ly = 0; ly < TILE; ly++) {
        for (let lx = 0; lx < TILE; lx++) {
          const x = tx * TILE + lx, y = ty * TILE + ly;
          const d = waterDist(x, y);
          for (let f = 0; f < 2; f++) {
            let c;
            if (d <= 1) c = rnd(x, y, 81) < 0.75 ? P.shore : P.sand[0];
            else if (d === 2) c = P.foam;
            else if (d === 3) c = P.water[2];
            else c = (rnd(x >> 2, y >> 1, 82) + dither(x, y) * 0.3) < 0.55 ? P.water[1] : P.water[0];
            // glints: short horizontal lines that drift between frames
            const gx = x - f * 3;
            if (d > 3 && rnd(Math.floor(gx / 5), y, 83 + (y % 2)) < 0.06 && y % 3 === 0) c = P.waterHi;
            frames[f].set(x, y, c);
          }
        }
      }
    }
  }

  return frames.map((b) => b.toCanvas());
}
