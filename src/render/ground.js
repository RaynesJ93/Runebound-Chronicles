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

const BLEND = new Set([GROUND.GRASS, GROUND.PATH, GROUND.SAND, GROUND.DIRT]);
const EARTH = new Set([GROUND.PATH, GROUND.SAND, GROUND.DIRT]);

export function buildGround(area) {
  P = area.theme === 'vale' ? VALE : BASE;
  const T = textures(area.theme === 'vale' ? 'vale' : 'base');
  const W = area.W * TILE;
  const H = area.H * TILE;
  const frames = [new Bitmap(W, H), new Bitmap(W, H)];
  const g = (tx, ty) => (area.inBounds(tx, ty) ? area.groundAt(tx, ty) : GROUND.GRASS);
  const kinds = new Uint8Array(W * H); // what each pixel ended up as, for the edge shading

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

      // Natural edges: where grass, paths, sand and soil meet, the border
      // wanders a few pixels either way (the ground is looked up at a point
      // nudged by smooth noise), so there are no straight tile-edge seams and
      // the ends of paths come out rounded.
      if (BLEND.has(t)) {
        const wx = Math.floor(x + (vn(x, y, 7, 23) - 0.5) * 11 + (rnd(x, y, 25) - 0.5) * 1.5);
        const wy = Math.floor(y + (vn(x, y, 7, 24) - 0.5) * 11 + (rnd(x, y, 26) - 0.5) * 1.5);
        const t2 = g(wx >> 4, wy >> 4);
        if (BLEND.has(t2)) t = t2;
      }
      kinds[y * W + x] = t;

      let c;
      switch (t) {
        case GROUND.GRASS: {
          c = T.grass ? px(T.grass, x, y) : grassPixel(x, y);
          // flower meadows here and there
          for (let k = 0; k < T.flowers.length; k++) {
            if (vn(x, y, 56, 140 + k) < 0.72) continue;
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
          const below = g(tx, ty + 1);
          // chunky facets in staggered blocks, with the odd dark crack
          const row = Math.floor(y / 4);
          const facet = rnd(Math.floor((x + (row % 2) * 3) / 6), row, 99);
          if (below !== GROUND.ROCKWALL && ly >= 12) c = ly >= 14 ? P.rockwallTop : P.rockwallHi;
          else if (T.rockwall) c = px(T.rockwall, x, y);
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
        if (ring(1)) f = 0.5;
        else if (ring(2)) f = 0.7;
        else if (ring(3)) f = 1.15;
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
            else if (T.water[f]) c = px(T.water[f], x, y);
            else c = (rnd(x >> 2, y >> 1, 82) + dither(x, y) * 0.3) < 0.55 ? P.water[1] : P.water[0];
            // glints: short horizontal lines that drift between frames
            const gx = x - f * 3;
            if (d > 3 && !T.water[f] && rnd(Math.floor(gx / 5), y, 83 + (y % 2)) < 0.06 && y % 3 === 0) c = P.waterHi;
            frames[f].set(x, y, c);
          }
        }
      }
    }
  }

  return frames.map((b) => b.toCanvas());
}
