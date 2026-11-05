import { GROUND } from '../world/area.js';
import { TILE, Bitmap, rnd, dither, hex } from './pixel.js';
import { texture } from './art.js';

// Pre-renders the whole ground of an area into big canvases, once.
// Two frames are made so water can shimmer.

const BASE = {
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
  plank: [hex('#9a6a3c'), hex('#a87644'), hex('#b5844f')],
  plankDark: hex('#5e3b1f'),
  rail: hex('#7a4f2a'),
  floor: [hex('#8a5a32'), hex('#9a6a3c'), hex('#a8774a')],
  floorLine: hex('#5e3b1f'),
  wall: [hex('#4a3020'), hex('#5e3e28'), hex('#6e4a30')],
  wallTop: hex('#2b1d16'),
  skirting: hex('#3a2416'),
  cave: [hex('#4a423a'), hex('#544b42'), hex('#5f554a')],
  caveDark: hex('#3a332d'),
  caveHi: hex('#76695b'),
  rockwall: [hex('#2e2925'), hex('#3a342e'), hex('#463f37')],
  rockwallHi: hex('#5c5349'),
  rockwallTop: hex('#1c1815'),
};

// Whispering Vale: dead blue-green grass, grey-violet earth, cold stone, murky water.
const VALE = {
  ...BASE,
  grass: [hex('#1f2c2a'), hex('#253430'), hex('#2b3c37'), hex('#33463f')],
  tuftDark: hex('#17221f'),
  tuftLight: hex('#40584f'),
  path: [hex('#3e3946'), hex('#46404e'), hex('#4e4757')],
  pathDark: hex('#2f2b36'),
  pebble: hex('#625a6e'),
  stone: [hex('#454a58'), hex('#4f5462'), hex('#595e6c')],
  stoneHi: hex('#6a7080'),
  mortar: hex('#2c2e36'),
  sand: [hex('#4a4740'), hex('#524f46'), hex('#5a564c')],
  water: [hex('#141f30'), hex('#18263a'), hex('#1d2d44')],
  waterHi: hex('#4a6e90'),
  foam: hex('#7a9ab8'),
  shore: hex('#3a3a34'),
};

let P = BASE;

// Painted ground textures from the art atlas (64 x 64, repeating). Any that
// are missing fall back to the code-drawn ground below.
const TEX = {};
function textures(theme) {
  if (TEX[theme]) return TEX[theme];
  const t = (n) => texture(n);
  TEX[theme] = theme === 'vale'
    ? { flowers: flowerMasks([t('valeBlue'), t('valePurple')]), grass: t('valeGrass'), path: t('valePath'), sand: t('valePath'), water: [t('valeWater0'), t('valeWater1')], cave: t('cave'), rockwall: t('rockwall'), bridge: t('bridge'), floor: t('floor') }
    : { flowers: flowerMasks([t('grassPink'), t('grassYellow')]), wall: t('wall'), grass: t('grass'), path: t('path'), plaza: t('plaza'), sand: t('sand'), dirt: t('dirt'), water: [t('water0'), t('water1')], bridge: t('bridge'), floor: t('floor'), cave: t('cave'), rockwall: t('rockwall') };
  return TEX[theme];
}
// From a flowery grass texture, keep just the flowers: pixels much brighter
// than the texture's average and a different colour from it.
function flowerMasks(list) {
  return list.filter(Boolean).map((tx) => {
    const n = tx.w * tx.h;
    let r = 0, g = 0, b = 0;
    for (let k = 0; k < n; k++) { r += tx.data[k * 4]; g += tx.data[k * 4 + 1]; b += tx.data[k * 4 + 2]; }
    r /= n; g /= n; b /= n;
    const lum0 = (r + g + b) / 3;
    const mask = new Uint8Array(n);
    for (let k = 0; k < n; k++) {
      const R = tx.data[k * 4], G = tx.data[k * 4 + 1], B = tx.data[k * 4 + 2];
      const d = Math.abs(R - r) + Math.abs(G - g) + Math.abs(B - b);
      if ((R + G + B) / 3 - lum0 > 30 && d > 110 && !(G > R + 15 && G > B + 15)) mask[k] = 1;
    }
    return { tx, mask };
  });
}
const px = (tx, x, y) => { const i = (((y % tx.h) * tx.w) + (x % tx.w)) * 4; return [tx.data[i], tx.data[i + 1], tx.data[i + 2]]; };

const BLEND = new Set([GROUND.GRASS, GROUND.PATH, GROUND.SAND, GROUND.DIRT, GROUND.PLAZA]);
const EARTH = new Set([GROUND.PATH, GROUND.SAND, GROUND.DIRT]);

function roundPaving(kinds, W, H, vn, isNeat) {
  const R = 10;
  const sum = new Float32Array((W + 1) * (H + 1)); // summed-area table of the paving
  for (let y = 0; y < H; y++) {
    let row = 0;
    for (let x = 0; x < W; x++) {
      row += kinds[y * W + x] === GROUND.PLAZA ? 1 : 0;
      sum[(y + 1) * (W + 1) + x + 1] = sum[y * (W + 1) + x + 1] + row;
    }
  }
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const k = kinds[y * W + x];
      if (!BLEND.has(k) || isNeat(x, y)) continue;
      const x0 = Math.max(0, x - R), y0 = Math.max(0, y - R), x1 = Math.min(W, x + R + 1), y1 = Math.min(H, y + R + 1);
      const n = (x1 - x0) * (y1 - y0);
      if (n === 0) continue;
      const a = (sum[y1 * (W + 1) + x1] - sum[y0 * (W + 1) + x1] - sum[y1 * (W + 1) + x0] + sum[y0 * (W + 1) + x0]) / n;
      if (a === 0 || a === 1) continue;
      const paved = a + (vn(x, y, 9, 151) - 0.5) * 0.35 > 0.5;
      if (paved && k !== GROUND.PLAZA && a > 0.3) kinds[y * W + x] = GROUND.PLAZA;
      else if (!paved && k === GROUND.PLAZA) kinds[y * W + x] = GROUND.GRASS;
    }
  }
}

// Ground a rock wall can round off into: cave floor, and outdoors grass, paths,
// soil and sand (paving and floors keep their straight, built edges).
const OPEN = new Set([GROUND.CAVE, GROUND.GRASS, GROUND.PATH, GROUND.DIRT, GROUND.SAND]);

function roundRock(kinds, W, H, vn, area, g) {
  const R = 6;
  const RW = GROUND.ROCKWALL;
  const rockish = (t) => t === RW || OPEN.has(t);
  // only tiles where rock meets open ground can change
  const near = new Uint8Array(area.W * area.H);
  let any = false;
  for (let ty = 0; ty < area.H; ty++) for (let tx = 0; tx < area.W; tx++) {
    const t = g(tx, ty);
    if (!rockish(t)) continue;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!area.inBounds(tx + dx, ty + dy)) continue;
      const n = g(tx + dx, ty + dy);
      if (rockish(n) && (n === RW) !== (t === RW)) { near[ty * area.W + tx] = 1; any = true; }
    }
  }
  // What a pixel of trimmed-off rock becomes: the open ground of the nearest
  // neighbouring tile.
  const openNear = (x, y) => {
    const tx = x >> 4, ty = y >> 4;
    let best = null, bd = Infinity;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const n = g(tx + dx, ty + dy);
      if (!OPEN.has(n) || !area.inBounds(tx + dx, ty + dy)) continue;
      const cx = (tx + dx) * 16 + 8, cy = (ty + dy) * 16 + 8, d = (cx - x) ** 2 + (cy - y) ** 2;
      if (d < bd) { bd = d; best = n; }
    }
    return best;
  };
  if (!any) return;
  const sum = new Float32Array((W + 1) * (H + 1));
  for (let y = 0; y < H; y++) {
    let row = 0;
    for (let x = 0; x < W; x++) {
      row += g(x >> 4, y >> 4) === RW ? 1 : 0;
      sum[(y + 1) * (W + 1) + x + 1] = sum[y * (W + 1) + x + 1] + row;
    }
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!near[(y >> 4) * area.W + (x >> 4)]) continue;
    const k = kinds[y * W + x];
    if (!rockish(k)) continue;
    const x0 = Math.max(0, x - R), y0 = Math.max(0, y - R), x1 = Math.min(W, x + R + 1), y1 = Math.min(H, y + R + 1);
    const a = (sum[y1 * (W + 1) + x1] - sum[y0 * (W + 1) + x1] - sum[y1 * (W + 1) + x0] + sum[y0 * (W + 1) + x0]) / ((x1 - x0) * (y1 - y0));
    if (a === 0 || a === 1) continue;
    const rock = a + (vn(x, y, 6, 171) - 0.5) * 0.5 + (vn(x, y, 2.5, 172) - 0.5) * 0.12 > 0.5;
    if (rock && k !== RW) {
      // keep the middle of an open tile clear, where you stand
      const lx = x & 15, ly = y & 15;
      if (lx >= 3 && lx <= 12 && ly >= 3 && ly <= 12) continue;
      kinds[y * W + x] = RW;
    } else if (!rock && k === RW) {
      const o = openNear(x, y);
      if (o != null) kinds[y * W + x] = o;
    }
  }
}

// Rock walls: a dark outline where they meet the floor, a lit lip along the
// bottom edge, and a soft shadow on the floor at their foot.
function shadeRock(kinds, W, H, frames, P) {
  const RW = GROUND.ROCKWALL;
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? -1 : kinds[y * W + x]);
  const open = (x, y) => OPEN.has(at(x, y));
  const mul = (x, y, f) => {
    const i = (y * W + x) * 4;
    for (const fr of frames) for (let c = 0; c < 3; c++) fr.data[i + c] = Math.max(0, Math.min(255, fr.data[i + c] * f));
  };
  const lip = P.rockwallHi;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const k = kinds[y * W + x];
    if (k === RW) {
      // floor just below: dark edge, then a lit lip above it
      let d = 0;
      for (let j = 1; j <= 4; j++) if (open(x, y + j)) { d = j; break; }
      if (d === 1) { mul(x, y, 0.42); continue; }
      if (d >= 2 && d <= 3) {
        const i = (y * W + x) * 4;
        for (const fr of frames) for (let c = 0; c < 3; c++) fr.data[i + c] = Math.round(fr.data[i + c] * 0.45 + lip[c] * 0.65);
        continue;
      }
      // floor beside or above: a thin dark outline
      if (open(x - 1, y) || open(x + 1, y) || open(x, y - 1)) mul(x, y, 0.6);
    } else if (OPEN.has(k)) {
      // shadow under the wall above, fading over a few pixels; less from the sides
      let f = 1;
      for (let j = 1; j <= 6; j++) if (at(x, y - j) === RW) { f = Math.min(f, 0.5 + 0.5 * (j - 1) / 6); break; }
      for (let j = 1; j <= 3; j++) if (at(x - j, y) === RW || at(x + j, y) === RW) { f = Math.min(f, 0.72 + 0.28 * (j - 1) / 3); break; }
      if (f < 1) mul(x, y, f);
    }
  }
}

export function buildGround(area) {
  P = area.theme === 'vale' ? VALE : BASE;
  const T = textures(area.theme === 'vale' ? 'vale' : 'base');
  const W = area.W * TILE;
  const H = area.H * TILE;
  const frames = [new Bitmap(W, H), new Bitmap(W, H)];
  const g = (tx, ty) => (area.inBounds(tx, ty) ? area.groundAt(tx, ty) : GROUND.GRASS);
  const kinds = new Uint8Array(W * H); // what each pixel ended up as, for the edge shading
  // Tiles in and around a "neat" square keep straight edges (no wobble or rounding).
  const neat = new Uint8Array(area.W * area.H);
  for (const [x0, y0, x1, y1] of area.neat) for (let y = y0 - 1; y <= y1 + 1; y++) for (let x = x0 - 1; x <= x1 + 1; x++) if (area.inBounds(x, y)) neat[y * area.W + x] = 1;
  const isNeat = (x, y) => neat[(y >> 4) * area.W + (x >> 4)] === 1;

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

  // Smooth noise doesn't change much from pixel to pixel, so it's worked out
  // once per small block and looked up (much faster to build big maps).
  const blockNoise = (shift, scale, seed) => {
    const bw = (W >> shift) + 2, bh = (H >> shift) + 2;
    const out = new Float32Array(bw * bh);
    for (let by = 0; by < bh; by++) for (let bx = 0; bx < bw; bx++) out[by * bw + bx] = vn(bx << shift, by << shift, scale, seed);
    return (x, y) => out[(y >> shift) * bw + (x >> shift)];
  };
  const wobX = blockNoise(1, 7, 23), wobY = blockNoise(1, 7, 24);
  const meadow = [blockNoise(3, 56, 140), blockNoise(3, 56, 141)];

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const tx = x >> 4, ty = y >> 4;
      let t = g(tx, ty);

      // Natural edges: where grass, paths, sand and soil meet, the border
      // wanders a few pixels either way (the ground is looked up at a point
      // nudged by smooth noise), so there are no straight tile-edge seams and
      // the ends of paths come out rounded.
      if (BLEND.has(t) && !isNeat(x, y)) {
        const wx = Math.floor(x + (wobX(x, y) - 0.5) * 11 + (rnd(x, y, 25) - 0.5) * 1.5);
        const wy = Math.floor(y + (wobY(x, y) - 0.5) * 11 + (rnd(x, y, 26) - 0.5) * 1.5);
        const t2 = g(wx >> 4, wy >> 4);
        if (BLEND.has(t2) && !isNeat(wx, wy)) t = t2;
      }
      kinds[y * W + x] = t;
    }
  }

  // Paved squares get rounded, uneven outlines instead of hard rectangles:
  // the paving is smoothed with a wide blur (which rounds the corners) and
  // its edge nudged by noise, and anything trimmed off becomes grass.
  roundPaving(kinds, W, H, vn, isNeat);

  // Cave walls get rounded, rocky outlines instead of tile-sized steps (the
  // same trick as the ponds): blur the rock, nudge the edge with noise.
  roundRock(kinds, W, H, vn, area, g);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const tx = x >> 4, ty = y >> 4, lx = x & 15, ly = y & 15;
      const t = kinds[y * W + x];

      let c;
      switch (t) {
        case GROUND.GRASS: {
          c = T.grass ? px(T.grass, x, y) : grassPixel(x, y);
          // flower meadows here and there
          for (let k = 0; k < T.flowers.length; k++) {
            if (meadow[k](x, y) < 0.72) continue;
            const F = T.flowers[k];
            const fx = (x + 17 * k) % F.tx.w, fy = (y + 29 * k) % F.tx.h;
            if (F.mask[fy * F.tx.w + fx]) { c = px(F.tx, fx, fy); break; }
          }
          break;
        }
        case GROUND.PATH: {
          if (T.path) { c = px(T.path, x, y); break; }
          const n = rnd(x, y, 31);
          const k = Math.max(0, Math.min(2, Math.floor(vn(x, y, 6, 32) * 3 + (dither(x, y) - 0.5) * 0.6)));
          c = n < 0.07 ? P.pathDark : n > 0.97 ? P.pebble : P.path[k];
          break;
        }
        case GROUND.PLAZA: {
          if (T.plaza) { c = px(T.plaza, x, y); break; }
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
          if (T.sand) { c = px(T.sand, x, y); break; }
          const n = rnd(x, y, 51) + (dither(x, y) - 0.5) * 0.3;
          c = P.sand[n < 0.3 ? 0 : n < 0.85 ? 1 : 2];
          break;
        }
        case GROUND.DIRT: {
          if (T.dirt) { c = px(T.dirt, x, y); break; }
          c = (y % 4 === 3) ? P.furrow : P.dirt[Math.floor(rnd(x, y, 61) * 2.2 + (y % 4 === 0 ? 0.9 : 0)) % 3];
          break;
        }
        case GROUND.BRIDGE: {
          // planks across the bridge, rails along the sides that face water
          const railL = g(tx - 1, ty) === GROUND.WATER && lx < 2;
          const railR = g(tx + 1, ty) === GROUND.WATER && lx > 13;
          if (railL || railR) c = (lx === 0 || lx === 15) ? P.plankDark : P.rail;
          else if (T.bridge) c = px(T.bridge, x, y);
          else if (y % 4 === 3) c = P.plankDark;
          else c = P.plank[Math.floor(rnd(Math.floor((x + (Math.floor(y / 4) % 2) * 5) / 9), Math.floor(y / 4), 91) * 3)];
          break;
        }
        case GROUND.FLOOR: {
          if (T.floor) { c = px(T.floor, x, y); break; }
          // floorboards running across the room
          const board = Math.floor(y / 5);
          const seam = (x + board * 7) % 23 === 0;
          c = y % 5 === 4 || seam ? P.floorLine : P.floor[Math.floor(rnd(Math.floor((x + board * 7) / 23), board, 95) * 3)];
          break;
        }
        case GROUND.WALL: {
          // wood-panelled wall; a dark cap where it meets the floor below
          const below = g(tx, ty + 1);
          if (below !== GROUND.WALL && ly >= 13) c = P.skirting;
          else if (ly < 2 && g(tx, ty - 1) !== GROUND.WALL) c = P.wallTop;
          else if (T.wall) c = px(T.wall, x, y);
          else c = (lx % 8 === 0) ? P.wall[0] : P.wall[1 + (rnd(tx * 2 + (lx >> 3), ty, 96) < 0.5 ? 0 : 1)];
          break;
        }
        case GROUND.CAVE: {
          if (T.cave) { c = px(T.cave, x, y); break; }
          // packed earth and grit on the mine floor
          const r = rnd(x, y, 97);
          c = r < 0.05 ? P.caveDark : r > 0.97 ? P.caveHi : P.cave[Math.floor(rnd(x >> 2, y >> 2, 98) * 3)];
          break;
        }
        case GROUND.ROCKWALL: {
          // rough rock: chunky facets, a lit lip where it meets the floor below
          // chunky facets in staggered blocks, with the odd dark crack
          // (the lit lip and shadow at its edge are added after, per pixel)
          const row = Math.floor(y / 4);
          const facet = rnd(Math.floor((x + (row % 2) * 3) / 6), row, 99);
          if (T.rockwall) c = px(T.rockwall, x, y);
          else if (rnd(x, y, 100) < 0.035 || y % 4 === 3 && rnd(x >> 1, row, 101) < 0.5) c = P.rockwallTop;
          else c = P.rockwall[Math.floor(facet * 3)];
          break;
        }
        default: c = P.water[1];
      }
      frames[0].set(x, y, c);
      frames[1].set(x, y, c);
    }
  }

  shadeRock(kinds, W, H, frames, P);

  // A soft shadow where grass meets bare ground: the earth darkens along the
  // edge and the grass next to it is a little darker too, so the two blend.
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const k = kinds[y * W + x];
      const grassNear = (kinds[y * W + x - 1] === GROUND.GRASS) + (kinds[y * W + x + 1] === GROUND.GRASS) + (kinds[(y - 1) * W + x] === GROUND.GRASS) + (kinds[(y + 1) * W + x] === GROUND.GRASS);
      let f = 1;
      const P2 = GROUND.PLAZA;
      const at = (dx, dy) => kinds[(y + dy) * W + x + dx];
      if (k === P2) {
        // paved squares get a kerb: a dark edge stone, a lighter one inside it
        const ring = (d) => x >= d && y >= d && x < W - d && y < H - d && (at(-d, 0) !== P2 || at(d, 0) !== P2 || at(0, -d) !== P2 || at(0, d) !== P2);
        if (ring(1)) f = 0.62;
        else if (ring(2)) f = 0.85;
      } else if (k !== P2 && BLEND.has(k) && (at(-1, 0) === P2 || at(1, 0) === P2 || at(0, -1) === P2 || at(0, 1) === P2)) f = 0.8;
      else if (EARTH.has(k) && grassNear) f = 0.8;
      else if (k === GROUND.GRASS) {
        const earthNear = EARTH.has(kinds[y * W + x - 1]) || EARTH.has(kinds[y * W + x + 1]) || EARTH.has(kinds[(y - 1) * W + x]) || EARTH.has(kinds[(y + 1) * W + x]);
        if (earthNear) f = 0.85;
      }
      if (f === 1) continue;
      const i = (y * W + x) * 4;
      for (const fr of frames) for (let c = 0; c < 3; c++) fr.data[i + c] = Math.min(255, fr.data[i + c] * f);
    }
  }

  // Grass tufts: little "v" shapes scattered over grass tiles.
  for (let ty = 0; ty < area.H; ty++) {
    for (let tx = 0; tx < area.W; tx++) {
      if (g(tx, ty) !== GROUND.GRASS || T.grass) continue;
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

  // Water: depth shading, foam at the shore, and moving glints. The water's
  // outline is smoothed (a wide blur of the water tiles, nudged by noise), so
  // ponds and streams have rounded banks instead of stair-step tile corners.
  const wet = new Uint8Array(W * H);
  {
    const R = 13;
    const sum = new Float32Array((W + 1) * (H + 1));
    for (let y = 0; y < H; y++) {
      let row = 0;
      for (let x = 0; x < W; x++) {
        row += g(x >> 4, y >> 4) === GROUND.WATER ? 1 : 0;
        sum[(y + 1) * (W + 1) + x + 1] = sum[y * (W + 1) + x + 1] + row;
      }
    }
    // only pixels within a tile of some water can change
    const nearW = new Uint8Array(area.W * area.H);
    for (let ty = 0; ty < area.H; ty++) for (let tx = 0; tx < area.W; tx++) {
      if (g(tx, ty) !== GROUND.WATER) continue;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (area.inBounds(tx + dx, ty + dy)) nearW[(ty + dy) * area.W + tx + dx] = 1;
    }
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (!nearW[(y >> 4) * area.W + (x >> 4)]) continue;
      const tile = g(x >> 4, y >> 4);
      const k = kinds[y * W + x];
      const x0 = Math.max(0, x - R), y0 = Math.max(0, y - R), x1 = Math.min(W, x + R + 1), y1 = Math.min(H, y + R + 1);
      const a = (sum[y1 * (W + 1) + x1] - sum[y0 * (W + 1) + x1] - sum[y1 * (W + 1) + x0] + sum[y0 * (W + 1) + x0]) / ((x1 - x0) * (y1 - y0));
      if (a === 0) continue;
      const v = a + (vn(x, y, 10, 161) - 0.5) * 0.25;
      if (tile === GROUND.WATER) {
        // keep water straight where it meets a bridge or a wall
        const hard = [[-1, 0], [1, 0], [0, -1], [0, 1]].some(([dx, dy]) => { const n = g((x >> 4) + dx, (y >> 4) + dy); return n !== GROUND.WATER && !BLEND.has(n); });
        if (v > 0.45 || hard || a === 1) wet[y * W + x] = 1;
      } else if (v > 0.52 && (k === GROUND.GRASS || k === GROUND.SAND || k === GROUND.DIRT)) wet[y * W + x] = 1;
    }
  }
  // Distance from each water pixel to the bank (0-3, or 9 for open water),
  // worked out in three passes instead of searching around every pixel.
  const dist = new Uint8Array(W * H);
  for (let k = 0; k < W * H; k++) dist[k] = wet[k] ? 9 : 0;
  for (let step = 1; step <= 3; step++) {
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const k = y * W + x;
      if (dist[k] !== 9) continue;
      let near = x === 0 || y === 0 || x === W - 1 || y === H - 1 ? g(x >> 4, y >> 4) !== GROUND.WATER : false;
      for (let dy = -1; dy <= 1 && !near; dy++) for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx, yy = y + dy;
        if (xx >= 0 && yy >= 0 && xx < W && yy < H && dist[yy * W + xx] === step - 1 && (step > 1 || !wet[yy * W + xx])) { near = true; break; }
      }
      if (near) dist[k] = 100 + step; // marked; fixed up below so this pass doesn't chain
    }
    for (let k = 0; k < W * H; k++) if (dist[k] > 100) dist[k] -= 100;
  }
  const waterDist = (x, y) => dist[y * W + x];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const tileWater = g(x >> 4, y >> 4) === GROUND.WATER;
      if (!wet[y * W + x]) {
        // a water tile's corner that was rounded off becomes shore
        if (tileWater) {
          const tx = x >> 4, ty = y >> 4;
          const sandy = [[-1, 0], [1, 0], [0, -1], [0, 1]].some(([dx, dy]) => g(tx + dx, ty + dy) === GROUND.SAND);
          const c = sandy ? (T.sand ? px(T.sand, x, y) : P.sand[1]) : (T.grass ? px(T.grass, x, y) : grassPixel(x, y));
          for (const fr of frames) fr.set(x, y, c);
        }
        continue;
      }
      const d = waterDist(x, y);
      for (let f = 0; f < 2; f++) {
        let c;
        if (d <= 1) c = rnd(x, y, 81) < 0.75 ? P.shore : P.sand[0];
        else if (d === 2) c = P.foam;
        else if (d === 3) c = P.water[2];
        else if (T.water[f]) c = px(T.water[f], x, y);
        else c = (rnd(x >> 2, y >> 1, 82) + dither(x, y) * 0.3) < 0.55 ? P.water[1] : P.water[0];
        // glints: short horizontal lines that drift between frames
        const gx = x - f * 3;
        if (d > 3 && !T.water[f] && rnd(Math.floor(gx / 5), y, 83 + (y % 2)) < 0.06 && y % 3 === 0) c = P.waterHi;
        frames[f].set(x, y, c);
      }
    }
  }

  return frames.map((b) => b.toCanvas());
}
