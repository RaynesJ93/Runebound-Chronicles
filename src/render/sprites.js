import { Bitmap, shadedBlobs, hex, shade, rnd } from './pixel.js';

// Every sprite is { img, ax, ay }: a canvas plus its anchor (the pixel that
// sits on the ground — usually the bottom-centre of the object's base).

const sprite = (bmp, ax, ay) => ({ img: bmp.toCanvas(), ax, ay, w: bmp.w, h: bmp.h });

const C = {
  leaf: [hex('#2a5f2a'), hex('#3f8a35'), hex('#5ead44'), hex('#94d462')],
  leafAlt: [hex('#2f6a2c'), hex('#4a9638'), hex('#6cb84a'), hex('#a5dc6c')],
  pine: [hex('#1d4d3a'), hex('#2b6b47'), hex('#3d8a55'), hex('#62ab6b')],
  bush: [hex('#2e6a2a'), hex('#46913a'), hex('#66b24a'), hex('#9bd66a')],
  trunk: [hex('#5b3419'), hex('#7a4a26'), hex('#9a6234')],
  rock: [hex('#5e5d5a'), hex('#83817c'), hex('#a7a49d'), hex('#cbc7bd')],
  wood: [hex('#5e3b1f'), hex('#7d5230'), hex('#a0703f'), hex('#c08c55')],
  iron: hex('#3c3632'),
  glow: hex('#ffe08a'),
  glowHi: hex('#fff6cf'),
  stone: [hex('#6f6a63'), hex('#8f8a80'), hex('#aba59a'), hex('#c6c0b4')],
  waterDark: hex('#25507e'),
  red: hex('#c4402f'),
  cream: hex('#f1e6c8'),
  green: hex('#4f9a35'),
  greenHi: hex('#7cc152'),
};

// ---- Trees -------------------------------------------------------------------

function trunk(b, x0, y0, w, h) {
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      const k = (x - x0) / (w - 1);
      let c = k < 0.3 ? C.trunk[2] : k < 0.75 ? C.trunk[1] : C.trunk[0];
      if (rnd(x, y, 5) < 0.12 && k > 0.2 && k < 0.8) c = C.trunk[0];
      b.set(x, y, c);
    }
  }
}

export function oakTree(seed) {
  const b = new Bitmap(48, 58);
  const j = (k) => (rnd(seed, k, 3) - 0.5) * 3;
  trunk(b, 20, 34, 8, 18);
  // roots
  for (const [x, y, w] of [[17, 49, 4], [27, 49, 4], [16, 51, 5], [27, 51, 5]]) b.rect(x, y, w, 2, C.trunk[1]);
  b.rect(19, 50, 10, 3, C.trunk[1]);
  const circles = [
    [24 + j(1), 13 + j(2), 11], [13 + j(3), 21 + j(4), 10], [35 + j(5), 21 + j(6), 10],
    [24, 23, 13], [11 + j(7), 31, 9], [37 + j(8), 31, 9],
    [17 + j(9), 36, 8.5], [31 + j(10), 36, 8.5], [24, 31, 10],
  ];
  shadedBlobs(b, circles, rnd(seed, 0, 9) < 0.5 ? C.leaf : C.leafAlt, seed);
  b.outline();
  return sprite(b, 24, 53);
}

export function pineTree(seed) {
  const b = new Bitmap(32, 60);
  trunk(b, 13, 44, 6, 11);
  const tiers = [[3, 24, 8], [12, 36, 11.5], [22, 48, 14.5]];
  for (let t = 0; t < tiers.length; t++) {
    const [apex, base, hw] = tiers[t];
    for (let y = apex; y <= base; y++) {
      const half = hw * (y - apex) / (base - apex);
      for (let x = 0; x < 32; x++) {
        const dx = (x + 0.5 - 16) / Math.max(1, half);
        if (Math.abs(dx) > 1) continue;
        // jagged bottom edge
        if (y >= base - 2 && ((x + t) % 4 < 2) && y > base - 1) continue;
        let l = -dx * 0.8 + (rnd(x, y, seed) - 0.5) * 0.4;
        if (y < apex + 3 && t > 0) l -= 0.6; // shade under the tier above
        const k = l > 0.55 ? 3 : l > 0.0 ? 2 : l > -0.5 ? 1 : 0;
        b.set(x, y, C.pine[k]);
      }
    }
  }
  b.outline();
  return sprite(b, 16, 54);
}

export function bush(seed) {
  const b = new Bitmap(24, 20);
  shadedBlobs(b, [[7, 12, 6], [17, 12, 6], [12, 8, 7], [12, 13, 6]], C.bush, seed);
  if (rnd(seed, 1, 4) < 0.5) for (const [x, y] of [[8, 9], [15, 11], [11, 14], [17, 7]]) { b.set(x, y, hex('#d8434a')); b.set(x + 1, y, hex('#f07a6f')); }
  b.outline();
  return sprite(b, 12, 18);
}

export function rock(seed) {
  const b = new Bitmap(20, 16);
  shadedBlobs(b, [[8, 10, 6], [12, 9, 6.5], [10, 7, 5]], C.rock, seed);
  b.set(9, 8, C.rock[0]); b.set(10, 9, C.rock[0]); b.set(10, 10, C.rock[0]);
  b.outline();
  return sprite(b, 10, 15);
}

// ---- Ground decorations --------------------------------------------------------

const PETALS = ['#f6e05e', '#f28cb3', '#ffffff', '#b79cf2', '#f5a04d'].map(hex);

export function flowers(seed) {
  const b = new Bitmap(16, 16);
  const col = PETALS[Math.floor(rnd(seed, 2, 1) * PETALS.length)];
  for (let k = 0; k < 3; k++) {
    const x = 3 + Math.floor(rnd(seed, k, 2) * 10);
    const y = 4 + Math.floor(rnd(seed, k, 3) * 8);
    b.set(x, y + 2, C.green); b.set(x, y + 3, C.green);
    b.set(x - 1, y, col); b.set(x + 1, y, col); b.set(x, y - 1, col); b.set(x, y + 1, col);
    b.set(x, y, hex('#f9c23c'));
  }
  return sprite(b, 8, 14);
}

export function crop(ripe, seed) {
  const b = new Bitmap(16, 16);
  for (const cx of [4, 11]) {
    if (ripe) {
      shadedBlobs(b, [[cx + 0.5, 10.5, 3.6]], [hex('#a2481b'), hex('#d4702a'), hex('#ef9640'), hex('#ffc070')], seed + cx);
      b.set(cx, 6, hex('#3f7a2a')); b.set(cx + 1, 6, hex('#3f7a2a')); b.set(cx + 1, 5, hex('#5ea33a'));
    } else {
      b.rect(cx, 8, 1, 6, hex('#3f7a2a'));
      for (const [dx, dy] of [[-2, 8], [-1, 9], [-3, 7], [2, 7], [1, 8], [3, 6], [-1, 6], [1, 5]]) b.set(cx + dx, dy + 1, dy < 7 ? C.greenHi : hex('#5ea33a'));
    }
  }
  b.outline();
  return sprite(b, 8, 14);
}

// Fence piece for one tile. east/south: whether a rail runs to the neighbour.
export function fence(east, south) {
  const b = new Bitmap(28, 32);
  const [d, m, l, h] = C.wood;
  if (east) for (const y of [7, 12]) { b.rect(9, y, 18, 2, m); b.rect(9, y, 18, 1, h); }
  if (south) { b.rect(7, 10, 2, 18, m); b.rect(7, 10, 1, 18, l); }
  b.rect(6, 4, 4, 14, l);
  b.rect(9, 4, 1, 14, d);
  b.rect(6, 3, 4, 1, h);
  b.outline();
  return sprite(b, 8, 17);
}

// ---- Props -----------------------------------------------------------------------

export function lamp() {
  const b = new Bitmap(14, 36);
  b.rect(6, 9, 2, 24, C.iron);
  b.rect(4, 31, 6, 3, C.iron);
  b.rect(3, 1, 8, 2, C.iron);
  b.rect(3, 3, 8, 7, C.iron);
  b.rect(4, 4, 6, 5, C.glow);
  b.rect(5, 5, 2, 2, C.glowHi);
  b.set(7, 0, C.iron);
  b.outline();
  return sprite(b, 7, 33);
}

export function sign() {
  const b = new Bitmap(20, 24);
  const [d, m, l, h] = C.wood;
  b.rect(9, 10, 2, 12, m);
  b.rect(1, 2, 18, 10, l);
  b.rect(1, 2, 18, 1, h);
  b.rect(1, 11, 18, 1, d);
  for (const [x, w, y] of [[4, 12, 5], [4, 9, 8]]) b.rect(x, y, w, 1, d);
  b.outline();
  return sprite(b, 10, 22);
}

export function well() {
  const b = new Bitmap(36, 44);
  const [sd, sm, sl, sh] = C.stone;
  // stone ring
  b.ellipse(18, 33, 15, 8, sm);
  for (let y = 28; y < 42; y++) for (let x = 3; x < 33; x++) {
    if (b.alpha(x, y) && y > 31 && ((y - 32) % 4 === 0 || ((x + Math.floor((y - 32) / 4) * 3) % 7 === 0))) b.set(x, y, sd);
  }
  b.ellipse(18, 30, 12, 5, sl);
  b.ellipse(18, 30, 9.5, 3.5, C.waterDark);
  // posts, crossbar, rope and bucket
  const [d, m, l, h] = C.wood;
  b.rect(5, 9, 3, 22, m); b.rect(5, 9, 1, 22, l);
  b.rect(28, 9, 3, 22, m); b.rect(28, 9, 1, 22, l);
  b.rect(7, 14, 22, 2, d);
  b.rect(17, 16, 1, 6, hex('#d8c08a'));
  b.rect(15, 22, 5, 4, m); b.rect(15, 22, 5, 1, h);
  // little roof
  for (let y = 2; y < 11; y++) {
    const inset = Math.max(0, 8 - y);
    for (let x = 1 + inset; x < 35 - inset; x++) b.set(x, y, (y % 3 === 0) ? shade(hex('#a8432f'), 0.75) : x < 18 ? hex('#b94e36') : hex('#a8432f'));
  }
  b.outline();
  return sprite(b, 18, 41);
}

export function stall() {
  const b = new Bitmap(36, 36);
  const [d, m, l, h] = C.wood;
  b.rect(2, 4, 2, 30, m);
  b.rect(32, 4, 2, 30, m);
  // table
  b.rect(3, 20, 30, 13, m);
  for (let y = 23; y < 33; y += 4) b.rect(3, y, 30, 1, d);
  b.rect(2, 18, 32, 3, l); b.rect(2, 18, 32, 1, h);
  // produce
  for (const [x, c] of [[6, '#d23c35'], [10, '#d23c35'], [8, '#e9573f']]) b.ellipse(x, 16, 2.2, 2.2, hex(c));
  for (const x of [19, 24]) { b.ellipse(x, 15.5, 3, 2.6, hex('#69b24a')); b.set(x - 1, 14, hex('#9bd66a')); }
  b.rect(27, 12, 5, 6, hex('#a3784a')); b.rect(27, 12, 5, 1, hex('#c69a62'));
  // striped canopy with scalloped edge
  for (let y = 0; y < 9; y++) for (let x = 0; x < 36; x++) {
    const stripe = Math.floor(x / 4) % 2 ? C.cream : C.red;
    if (y === 8 && x % 4 === 3) continue;
    b.set(x, y, y === 0 ? shade(stripe, 1.08) : y > 6 ? shade(stripe, 0.85) : stripe);
  }
  b.outline();
  return sprite(b, 18, 34);
}

export function fallenTree() {
  const b = new Bitmap(102, 34);
  // leafy crown at the west end
  shadedBlobs(b, [[10, 14, 9], [18, 9, 7], [16, 22, 8], [6, 23, 6]], C.leaf, 77);
  // log body
  for (let y = 10; y < 26; y++) for (let x = 14; x < 94; x++) {
    let c = y < 13 ? C.trunk[2] : y < 21 ? C.trunk[1] : C.trunk[0];
    if ((y === 15 || y === 19) && rnd(x >> 2, y, 3) < 0.7) c = C.trunk[0];
    if (rnd(x, y, 4) < 0.05) c = C.trunk[0];
    b.set(x, y, c);
  }
  // cut end with rings
  b.ellipse(94, 18, 5, 8, hex('#d8b07a'));
  b.ellipse(94, 18, 3, 5, hex('#c4955c'));
  b.ellipse(94, 18, 1.2, 2, hex('#a77a45'));
  // broken branches
  b.rect(40, 5, 2, 6, C.trunk[1]); b.rect(38, 3, 2, 3, C.trunk[1]);
  b.rect(66, 6, 2, 5, C.trunk[1]); b.rect(68, 4, 2, 3, C.trunk[1]);
  b.outline();
  return sprite(b, 52, 28);
}

export function scarecrow() {
  const b = new Bitmap(20, 34);
  const [d, m] = C.wood;
  b.rect(9, 9, 2, 24, m);
  b.rect(1, 13, 18, 2, d);
  const shirt = hex('#7a4f96');
  b.rect(5, 12, 10, 10, shirt);
  b.rect(11, 15, 3, 3, hex('#c9a64a'));
  b.rect(1, 12, 2, 3, hex('#e6c35a')); b.rect(17, 12, 2, 3, hex('#e6c35a'));
  b.rect(6, 4, 8, 8, hex('#e2c98f'));
  b.set(8, 7, C.iron); b.set(11, 7, C.iron);
  b.rect(8, 9, 4, 1, C.iron);
  b.rect(3, 4, 14, 1, hex('#5a3d22'));
  b.rect(6, 0, 8, 4, hex('#6e4a2a'));
  b.outline();
  return sprite(b, 10, 32);
}

// A soft pixel ellipse for shadows under things.
export function shadow(rx, ry) {
  const b = new Bitmap(rx * 2, ry * 2);
  for (let y = 0; y < ry * 2; y++) for (let x = 0; x < rx * 2; x++) {
    if (((x + 0.5 - rx) / rx) ** 2 + ((y + 0.5 - ry) / ry) ** 2 <= 1) b.set(x, y, [24, 40, 16], 70);
  }
  return sprite(b, rx, ry);
}

// ---- Forest and camp props --------------------------------------------------------

export function tallGrass(seed) {
  const b = new Bitmap(16, 14);
  const cols = [hex('#3c8a2c'), hex('#4fa338'), hex('#6cbf48'), hex('#8fd662')];
  for (let k = 0; k < 9; k++) {
    const x = 1 + Math.floor(rnd(seed, k, 1) * 14);
    const h = 5 + Math.floor(rnd(seed, k, 2) * 6);
    const lean = rnd(seed, k, 3) < 0.5 ? -1 : 1;
    for (let j = 0; j < h; j++) {
      const c = cols[Math.min(3, Math.floor((j / h) * 3 + rnd(seed, k, 4)))];
      b.set(x + (j > h * 0.6 ? lean : 0), 13 - j, c);
      if (j < h * 0.5) b.set(x + 1, 13 - j, cols[0]);
    }
  }
  return sprite(b, 8, 14);
}

export function tent(seed) {
  const b = new Bitmap(36, 30);
  const cloth = rnd(seed, 1, 1) < 0.5 ? [hex('#6d5a3a'), hex('#8a744b'), hex('#a68e5e')] : [hex('#5d6b3a'), hex('#77874a'), hex('#93a35d')];
  for (let y = 4; y < 28; y++) {
    const half = ((y - 4) / 24) * 17;
    for (let x = 0; x < 36; x++) {
      const d = x + 0.5 - 18;
      if (Math.abs(d) > half) continue;
      let c = d < -half * 0.35 ? cloth[2] : d < half * 0.35 ? cloth[1] : cloth[0];
      if ((y + Math.floor(x / 6)) % 7 === 0) c = cloth[0];
      b.set(x, y, c);
    }
  }
  // dark doorway
  for (let y = 14; y < 28; y++) {
    const half = ((y - 14) / 14) * 5;
    for (let x = 0; x < 36; x++) if (Math.abs(x + 0.5 - 18) <= half) b.set(x, y, hex('#2a2016'));
  }
  b.rect(17, 0, 2, 6, hex('#5a3a20'));
  b.rect(19, 0, 5, 3, hex('#b0302a'));
  b.outline();
  return sprite(b, 18, 28);
}

export function campfire(frame) {
  const b = new Bitmap(18, 20);
  for (const [x, y] of [[2, 15], [5, 16], [9, 16], [13, 15], [3, 17], [12, 17]]) b.rect(x, y, 3, 2, C.stone[1 + (x % 2)]);
  b.rect(4, 14, 10, 2, C.trunk[1]);
  b.rect(6, 13, 6, 1, C.trunk[0]);
  const flame = [hex('#c8361d'), hex('#f07a22'), hex('#f9c23c'), hex('#fff2b0')];
  const sway = frame ? 1 : 0;
  const rows = [[6, 12, 6], [5, 11, 8], [4, 10, 8], [4, 9, 7], [3, 9, 5], [2, 8 + sway, 3], [1, 9 - sway, 2]];
  for (const [y, x, w] of rows) for (let k = 0; k < w; k++) {
    const t = Math.abs(k - (w - 1) / 2) / ((w + 1) / 2);
    b.set(x - w / 2 + k + 0.5, y + 4, flame[t > 0.7 ? 0 : t > 0.4 ? 1 : y < 4 ? 3 : 2]);
  }
  return sprite(b, 9, 18);
}

export function logPile() {
  const b = new Bitmap(34, 22);
  const end = [hex('#d8b07a'), hex('#c4955c')];
  for (const [cx, cy] of [[7, 16], [17, 16], [27, 16], [12, 8], [22, 8]]) {
    b.ellipse(cx, cy, 5.5, 5.5, C.trunk[0]);
    b.ellipse(cx, cy, 4.5, 4.5, end[0]);
    b.ellipse(cx, cy, 2.4, 2.4, end[1]);
    b.set(Math.floor(cx), Math.floor(cy), C.trunk[1]);
  }
  b.outline();
  return sprite(b, 17, 21);
}

export function stump(seed) {
  const b = new Bitmap(18, 16);
  trunk(b, 4, 6, 10, 8);
  b.rect(2, 12, 3, 2, C.trunk[1]); b.rect(13, 12, 3, 2, C.trunk[1]);
  b.ellipse(9, 6, 5, 2.6, hex('#d8b07a'));
  b.ellipse(9, 6, 2.6, 1.3, hex('#c4955c'));
  if (rnd(seed, 1, 1) < 0.5) { b.rect(14, 9, 2, 1, hex('#e04a3a')); b.set(14, 10, hex('#f3e6d0')); }
  b.outline();
  return sprite(b, 9, 14);
}

export function crate() {
  const b = new Bitmap(16, 16);
  const [d, m, l, h] = C.wood;
  b.rect(1, 3, 14, 12, m);
  b.rect(1, 3, 14, 2, h);
  for (const y of [8, 12]) b.rect(1, y, 14, 1, d);
  b.rect(1, 5, 2, 10, l); b.rect(13, 5, 2, 10, d);
  b.outline();
  return sprite(b, 8, 15);
}

export function bones() {
  const b = new Bitmap(16, 10);
  const bone = hex('#efe6cf');
  b.rect(3, 4, 9, 2, bone);
  for (const [x, y] of [[2, 3], [2, 6], [12, 3], [12, 6]]) b.rect(x, y, 2, 2, bone);
  b.rect(9, 7, 5, 1, bone);
  b.outline();
  return sprite(b, 8, 9);
}

export function mushrooms(seed) {
  const b = new Bitmap(16, 16);
  for (let k = 0; k < 3; k++) {
    const x = 3 + Math.floor(rnd(seed, k, 5) * 9);
    const y = 7 + Math.floor(rnd(seed, k, 6) * 6);
    b.rect(x, y, 1, 2, hex('#efe2c4'));
    b.rect(x - 1, y - 1, 3, 1, hex('#c8452f'));
    b.set(x, y - 2, hex('#c8452f'));
    b.set(x - 1, y - 1, hex('#f3e6d0'));
  }
  return sprite(b, 8, 14);
}

// ---- Characters --------------------------------------------------------------------
//
// One drawing routine for everyone. A look sets colours plus optional extras:
//   hat: 'straw' | 'helmet' | 'hood' | 'bun'   beard: colour   robe: true (long tunic)

const BASE_LOOK = {
  skin: '#f2c393', hair: '#6b3f1f', tunic: '#3f6fb0', pants: '#6b5137', boots: '#3a2a1c', belt: '#5a3a1e',
};

function palette(look) {
  const L = { ...BASE_LOOK, ...look };
  const skin = hex(L.skin);
  const hair = hex(L.hair);
  const tunic = hex(L.tunic);
  const pants = hex(L.pants);
  return {
    skin, skinS: shade(skin, 0.86), blush: hex('#ef9a8c'),
    hair, hairHi: shade(hair, 1.35),
    tunic, tunicS: shade(tunic, 0.72), tunicHi: shade(tunic, 1.25),
    belt: hex(L.belt), gold: hex('#e8c040'),
    pants, pantsS: shade(pants, 0.78),
    boots: hex(L.boots), eye: hex(L.eyes || '#2b1d16'),
    ears: !!L.ears,
    weapon: L.weapon ? (L.weapon === 'iron' ? [hex('#7a828b'), hex('#c0c8d0'), hex('#eef2f5')] : [hex('#a8692e'), hex('#d4934f'), hex('#f2c48a')]) : null,
    blade: L.blade || 4,
    weaponKind: L.weaponKind || (L.weapon ? 'blade' : null),
    shield: L.shield || null,
    beard: L.beard ? hex(L.beard) : null,
    hat: L.hat || null, robe: !!L.robe,
    hatCol: L.hatColor ? hex(L.hatColor) : null,
  };
}

function drawHat(b, L, bob, view) {
  if (L.hat === 'straw') {
    const straw = L.hatCol || hex('#e6c35a');
    b.rect(1, 3 + bob, 14, 2, straw);
    b.rect(4, 0 + bob, 8, 3, straw);
    b.rect(4, 2 + bob, 8, 1, view === 'back' ? straw : hex('#b0302a'));
    b.rect(2, 4 + bob, 12, 1, shade(straw, 0.8));
  } else if (L.hat === 'helmet') {
    const steel = L.hatCol || hex('#9aa3ab');
    b.rect(3, 0 + bob, 10, 5, steel);
    b.rect(4, 0 + bob, 3, 1, shade(steel, 1.25));
    b.rect(2, 4 + bob, 12, 1, shade(steel, 0.75));
    if (view === 'front') b.rect(7, 5 + bob, 2, 2, shade(steel, 0.85));
  } else if (L.hat === 'hood') {
    const cloth = L.hatCol || hex('#4a6b3a');
    b.rect(2, 0 + bob, 12, 4, cloth);
    b.rect(2, 4 + bob, 2, 5, cloth);
    b.rect(12, 4 + bob, 2, 5, cloth);
    if (view === 'back') b.rect(3, 0 + bob, 10, 9, cloth);
  } else if (L.hat === 'bun') {
    b.rect(6, -1 + bob + 1, 4, 2, L.hair);
  }
}

// frame: 0 standing, 1 left foot forward, 2 right foot forward
function drawFront(L, back, frame) {
  const b = new Bitmap(16, 24);
  const bob = frame ? -1 : 0;
  const legY = (side) => (frame === 1 && side === 0) || (frame === 2 && side === 1) ? -1 : 0;
  for (const [side, x] of [[0, 5], [1, 8]]) {
    const o = legY(side);
    b.rect(x, 17 + o, 3, 3, side ? L.pantsS : L.pants);
    b.rect(x, 20 + o, 3, 2, L.boots);
  }
  b.rect(4, 10 + bob, 8, 7 - bob, L.tunic);
  if (L.robe) b.rect(4, 16, 8, 4, L.tunic), b.rect(4, 19, 8, 1, L.tunicS);
  b.rect(11, 10 + bob, 1, L.robe ? 10 - bob : 7 - bob, L.tunicS);
  b.rect(5, 10 + bob, 1, 5, L.tunicHi);
  b.rect(4, 15 + bob, 8, 1, L.belt);
  if (!back) b.rect(7, 15 + bob, 2, 1, L.gold);
  const armO = (side) => (frame === 1 && side === 1) || (frame === 2 && side === 0) ? 1 : 0;
  for (const [side, x] of [[0, 2], [1, 12]]) {
    const o = armO(side) + bob;
    b.rect(x, 11 + o, 2, 4, side ? L.tunicS : L.tunic);
    b.rect(x, 15 + o, 2, 1, L.skin);
  }
  if (L.shield && !back) shieldOn(b, 2.5, 13 + bob, L.shield);
  if (L.shield && back) shieldOn(b, 13.5, 13 + bob, L.shield);
  if (L.weaponKind === 'bow' || L.weaponKind === 'staff') {
    const hx = back ? 1 : 14;
    const hy = 15 + armO(back ? 0 : 1) + bob;
    const wood = [hex('#5e3b1f'), hex('#8a5a32'), hex('#b07a48')];
    if (L.weaponKind === 'bow') {
      for (let k = -6; k <= 4; k++) b.set(hx + (Math.abs(k) < 4 ? (back ? -1 : 1) : 0), hy + k, wood[Math.abs(k) < 2 ? 2 : 1]);
      for (let k = -5; k <= 3; k++) b.set(hx, hy + k, hex('#e8e0c8'));
    } else {
      for (let y = hy - 12; y <= hy + 5; y++) b.set(hx, y, y < hy - 9 ? wood[2] : wood[1]);
      b.rect(hx - 1, hy - 14, 3, 2, hex('#5fd0c8'));
      b.set(hx, hy - 15, hex('#c8fff8'));
    }
  }
  if (L.weaponKind === 'blade') {
    // held upright in the right hand (your right = picture left when seen from behind)
    const hx = back ? 1 : 14;
    const hy = 15 + armO(back ? 0 : 1) + bob;
    const [d, m, l] = L.weapon;
    for (let k = 1; k <= L.blade; k++) b.set(hx, hy - k, k === L.blade ? l : m);
    b.set(hx + (back ? -1 : 1), hy - 1, d);
    b.rect(hx - 1, hy, 3, 1, hex('#e8c040'));
    b.set(hx, hy + 1, hex('#5e3b1f'));
  }
  b.rect(7, 9 + bob, 2, 1, L.skinS);
  b.rect(3, 1 + bob, 10, 8, L.skin);
  if (back) {
    b.rect(3, 0 + bob, 10, 9, L.hair);
    b.rect(4, 0 + bob, 8, 1, L.hair);
    b.rect(5, 2 + bob, 2, 4, L.hairHi);
    b.rect(9, 1 + bob, 1, 5, L.hairHi);
  } else {
    b.rect(3, 0 + bob, 10, 4, L.hair);
    b.rect(3, 4 + bob, 1, 4, L.hair);
    b.rect(12, 4 + bob, 1, 4, L.hair);
    b.rect(4, 4 + bob, 3, 1, L.hair);
    b.rect(9, 4 + bob, 3, 1, L.hair);
    b.rect(5, 1 + bob, 3, 1, L.hairHi);
    b.rect(6, 6 + bob, 1, 2, L.eye);
    b.rect(9, 6 + bob, 1, 2, L.eye);
    if (L.beard) {
      b.rect(4, 8 + bob, 8, 2, L.beard);
      b.rect(5, 10 + bob, 6, 1, L.beard);
      b.rect(6, 11 + bob, 4, 1, L.beard);
    } else {
      b.set(5, 8 + bob, L.blush);
      b.set(10, 8 + bob, L.blush);
    }
  }
  if (L.ears) {
    // pointy goblin ears sticking out either side of the head
    for (const [x, dir] of [[2, -1], [13, 1]]) {
      b.rect(x, 4 + bob, 1, 3, L.skin);
      b.set(x + dir, 3 + bob, L.skin);
      b.set(x + dir, 4 + bob, L.skinS);
    }
  }
  drawHat(b, L, bob, back ? 'back' : 'front');
  b.outline();
  return b;
}

function drawSide(L, frame) {
  const b = new Bitmap(16, 24);
  const bob = frame ? -1 : 0;
  if (frame === 0) {
    b.rect(6, 17, 4, 3, L.pants); b.rect(9, 17, 1, 3, L.pantsS);
    b.rect(6, 20, 4, 2, L.boots); b.set(5, 21, L.boots);
  } else {
    const front = frame === 1 ? 4 : 5;
    const backX = frame === 1 ? 9 : 8;
    b.rect(backX, 17, 3, 3, L.pantsS); b.rect(backX, 20, 3, 2, L.boots);
    b.rect(front, 17, 3, 3, L.pants); b.rect(front - 1, 20, 4, 2, L.boots);
  }
  b.rect(5, 10 + bob, 6, 7 - bob, L.tunic);
  if (L.robe) b.rect(5, 16, 6, 4, L.tunic);
  b.rect(10, 10 + bob, 1, 7 - bob, L.tunicS);
  b.rect(5, 15 + bob, 6, 1, L.belt);
  const armX = frame === 1 ? 8 : frame === 2 ? 6 : 7;
  b.rect(armX, 11 + bob, 2, 4, L.tunicS);
  b.rect(armX, 15 + bob, 2, 1, L.skin);
  if (L.weaponKind === 'bow') {
    const wood = [hex('#8a5a32'), hex('#b07a48')];
    const y = 15 + bob;
    for (let k = -6; k <= 5; k++) b.set(armX - 2 - (Math.abs(k) < 4 ? 1 : 0), y + k, wood[Math.abs(k) < 2 ? 1 : 0]);
    for (let k = -5; k <= 4; k++) b.set(armX - 1, y + k, hex('#e8e0c8'));
  } else if (L.weaponKind === 'staff') {
    const y = 15 + bob;
    for (let k = -12; k <= 5; k++) b.set(armX - 1, y + k, hex(k < -9 ? '#b07a48' : '#8a5a32'));
    b.rect(armX - 2, y - 14, 3, 2, hex('#5fd0c8'));
  } else if (L.weaponKind === 'blade') {
    // pointing forward (left) from the hand
    const [d, m, l] = L.weapon;
    const y = 15 + bob;
    for (let k = 1; k <= L.blade; k++) b.set(armX - k, y, k === L.blade ? l : m);
    b.set(armX - 1, y + 1, d);
    b.rect(armX - 1, y - 1, 1, 3, hex('#e8c040'));
  }
  b.rect(7, 9 + bob, 2, 1, L.skinS);
  b.rect(4, 1 + bob, 8, 8, L.skin);
  b.set(3, 6 + bob, L.skin);
  b.rect(4, 0 + bob, 8, 3, L.hair);
  b.rect(8, 3 + bob, 4, 5, L.hair);
  b.rect(5, 3 + bob, 3, 1, L.hair);
  b.rect(6, 1 + bob, 3, 1, L.hairHi);
  b.rect(5, 5 + bob, 1, 2, L.eye);
  if (L.beard) { b.rect(4, 8 + bob, 5, 2, L.beard); b.rect(5, 10 + bob, 3, 1, L.beard); }
  else b.set(5, 8 + bob, L.blush);
  if (L.ears) { b.rect(12, 4 + bob, 1, 3, L.skin); b.set(13, 3 + bob, L.skin); b.set(13, 4 + bob, L.skinS); }
  drawHat(b, L, bob, 'side');
  b.outline();
  return b;
}

export function characterFrames(look = {}) {
  const L = palette(look);
  const frames = { down: [], up: [], left: [], right: [] };
  for (let f = 0; f < 3; f++) {
    frames.down.push(sprite(drawFront(L, false, f), 8, 22));
    frames.up.push(sprite(drawFront(L, true, f), 8, 22));
    const side = drawSide(L, f);
    frames.left.push(sprite(side, 8, 22));
    frames.right.push(sprite(mirror(side), 8, 22));
  }
  return frames;
}

export const playerFrames = () => characterFrames({});

function mirror(b) {
  const m = new Bitmap(b.w, b.h);
  for (let y = 0; y < b.h; y++) for (let x = 0; x < b.w; x++) {
    const i = (y * b.w + x) * 4;
    const k = (y * b.w + (b.w - 1 - x)) * 4;
    for (let c = 0; c < 4; c++) m.data[k + c] = b.data[i + c];
  }
  return m;
}

// ---- Damage splats ---------------------------------------------------------------
// A tiny 3x5 pixel font for the numbers.
const DIGITS = {
  0: ['111', '101', '101', '101', '111'], 1: ['010', '110', '010', '010', '111'],
  2: ['111', '001', '111', '100', '111'], 3: ['111', '001', '011', '001', '111'],
  4: ['101', '101', '111', '001', '001'], 5: ['111', '100', '111', '001', '111'],
  6: ['111', '100', '111', '101', '111'], 7: ['111', '001', '010', '010', '010'],
  8: ['111', '101', '111', '101', '111'], 9: ['111', '101', '111', '001', '111'],
};

const splatCache = new Map();

// Red splat for damage, blue for a miss (0).
export function splat(n) {
  if (splatCache.has(n)) return splatCache.get(n);
  const b = new Bitmap(15, 13);
  const miss = n === 0;
  const tones = miss ? [hex('#1f4f9a'), hex('#2f6fd0'), hex('#4f8fe8'), hex('#8fbdf5')] : [hex('#8a1a14'), hex('#c4281d'), hex('#e3412f'), hex('#f47a5a')];
  shadedBlobs(b, [[7.5, 6.5, 6], [4, 4, 3], [11, 4, 3], [4, 9.5, 3], [11, 9.5, 3]], tones, n + 3);
  b.outline();
  const str = String(n);
  const w = str.length * 4 - 1;
  let x = Math.round((15 - w) / 2);
  for (const ch of str) {
    const g = DIGITS[ch];
    for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) if (g[r][c] === '1') b.set(x + c, 4 + r, [255, 255, 255]);
    x += 4;
  }
  const spr = sprite(b, 7, 6);
  splatCache.set(n, spr);
  return spr;
}

// ---- Wolves ---------------------------------------------------------------------
// A four-legged side view, facing left. frame 0 stands, 1 and 2 are strides.
// big: the Alpha is drawn about a third larger.
function drawWolf(look, frame) {
  const k = look.big ? 1.35 : 1;
  const W = Math.round(26 * k), H = Math.round(20 * k);
  const b = new Bitmap(W, H);
  const fur = hex(look.fur), dark = hex(look.dark), light = hex(look.light), eye = hex(look.eyes || '#f2c23a');
  const R = (x, y, w, h, c) => b.rect(Math.round(x * k), Math.round(y * k), Math.max(1, Math.round(w * k)), Math.max(1, Math.round(h * k)), c);
  const bob = frame ? -1 : 0;
  // legs: front pair and back pair, swapping on strides
  const legs = frame === 0 ? [[6, 0], [9, 0], [17, 0], [20, 0]] : frame === 1 ? [[4, 0], [10, -1], [16, -1], [21, 0]] : [[7, -1], [8, 0], [18, 0], [19, -1]];
  legs.forEach(([x, lift], i) => { R(x, 12 + lift, 2, 6 - lift, i % 2 ? dark : fur); R(x - (i < 2 ? 1 : 0), 17 + lift, 3, 1, dark); });
  // body
  b.ellipse(14 * k, (9 + bob) * k, 9 * k, 4.6 * k, fur);
  b.ellipse(14 * k, (11 + bob) * k, 7 * k, 2.2 * k, light);
  b.ellipse(15 * k, (7 + bob) * k, 7 * k, 2 * k, dark);
  // tail, curving up behind
  R(22, 6 + bob, 2, 2, fur); R(23, 4 + bob, 2, 3, fur); R(24, 3 + bob, 2, 2, light);
  // head, snout and ears
  R(2, 4 + bob, 7, 6, fur);
  R(0, 7 + bob, 3, 3, fur);
  R(0, 9 + bob, 3, 1, light);
  b.set(0, Math.round((7 + bob) * k), hex('#1d1d1d'));
  R(4, 1 + bob, 2, 3, dark); R(7, 2 + bob, 2, 2, dark);
  R(3, 6 + bob, 1, 1, eye);
  if (look.big) { R(8, 4 + bob, 3, 5, light); R(6, 9 + bob, 2, 1, hex('#b0302a')); } // white mane, scar
  b.outline();
  return b;
}

export function wolfFrames(look) {
  const frames = { down: [], up: [], left: [], right: [] };
  for (let f = 0; f < 3; f++) {
    const w = drawWolf(look, f);
    const left = sprite(w, Math.floor(w.w / 2), w.h - 2);
    const right = sprite(mirror(w), Math.floor(w.w / 2), w.h - 2);
    frames.left.push(left); frames.up.push(left);
    frames.right.push(right); frames.down.push(right);
  }
  return frames;
}

// ---- Interiors ---------------------------------------------------------------------

const counterCache = new Map();
// A wooden counter `tiles` wide; grille: true adds a bank booth's brass bars.
export function counter(tiles, grille = false) {
  const key = `${tiles}${grille}`;
  if (counterCache.has(key)) return counterCache.get(key);
  const W = tiles * 16;
  const b = new Bitmap(W, grille ? 34 : 22);
  const top = grille ? 16 : 4;
  const [d, m, l, h] = C.wood;
  b.rect(0, top, W, 5, l);
  b.rect(0, top, W, 1, h);
  b.rect(0, top + 5, W, 13, m);
  for (let x = 4; x < W; x += 8) b.rect(x, top + 6, 1, 12, d);
  b.rect(0, top + 17, W, 1, d);
  if (grille) {
    const brass = [hex('#8a6410'), hex('#d4a020'), hex('#f2c94a')];
    b.rect(1, 2, W - 2, 2, brass[1]); b.rect(1, 2, W - 2, 1, brass[2]);
    for (let x = 3; x < W - 2; x += 4) b.rect(x, 4, 1, top - 4, brass[x % 8 === 3 ? 1 : 0]);
    b.rect(W / 2 - 4, top - 1, 8, 1, hex('#f4ecd6')); // paper on the ledge
  }
  b.outline();
  const spr = sprite(b, W / 2, b.h - 2);
  counterCache.set(key, spr);
  return spr;
}

export function shelf(seed) {
  const b = new Bitmap(16, 30);
  const [d, m, l] = C.wood;
  b.rect(1, 2, 14, 26, m);
  b.rect(2, 3, 12, 24, d);
  for (const y of [9, 17, 25]) b.rect(1, y, 14, 2, l);
  const goods = ['#c0392b', '#2f6fd0', '#e8c040', '#4f9a35', '#f4ecd6', '#8a5a32', '#b79cf2'];
  for (const y of [4, 12, 20]) for (let x = 3; x < 13; x += 3) {
    const c = hex(goods[Math.floor(rnd(seed + x, y, 7) * goods.length)]);
    const h = 3 + Math.floor(rnd(seed, x + y, 8) * 3);
    b.rect(x, y + 5 - h, 2, h, c);
  }
  b.outline();
  return sprite(b, 8, 29);
}

export function barrel() {
  const b = new Bitmap(16, 18);
  const [d, m, l] = C.wood;
  b.ellipse(8, 9, 6.5, 8, m);
  for (let y = 2; y < 17; y++) for (let x = 2; x < 15; x++) if (b.alpha(x, y) && x < 6) b.set(x, y, l);
  for (const y of [4, 13]) b.rect(2, y, 13, 1, hex('#5a5550'));
  b.ellipse(8, 2.5, 5, 1.6, d);
  b.outline();
  return sprite(b, 8, 16);
}

export function chest() {
  const b = new Bitmap(18, 16);
  const [d, m, l] = C.wood;
  b.rect(1, 6, 16, 9, m);
  b.rect(1, 2, 16, 5, l);
  b.rect(1, 6, 16, 1, d);
  for (const x of [1, 15]) b.rect(x, 2, 2, 13, hex('#b8901f'));
  b.rect(8, 6, 2, 3, hex('#e8c040'));
  b.outline();
  return sprite(b, 9, 15);
}

export function rug() {
  const b = new Bitmap(48, 28);
  b.ellipse(24, 14, 23, 13, hex('#7a2f2a'));
  b.ellipse(24, 14, 19, 10, hex('#a8432f'));
  b.ellipse(24, 14, 13, 6.5, hex('#e8c040'));
  b.ellipse(24, 14, 10, 4.5, hex('#a8432f'));
  return sprite(b, 24, 14);
}

export function plant() {
  const b = new Bitmap(16, 24);
  shadedBlobs(b, [[5, 9, 4], [11, 9, 4], [8, 5, 4.5], [8, 11, 4]], C.bush, 9);
  b.rect(4, 15, 8, 7, hex('#a8432f'));
  b.rect(3, 14, 10, 2, hex('#c45a3a'));
  b.outline();
  return sprite(b, 8, 22);
}

export function gravestone() {
  const b = new Bitmap(16, 20);
  const st = C.stone;
  b.rect(3, 6, 10, 12, st[1]);
  b.ellipse(8, 6, 5, 5, st[1]);
  b.rect(3, 6, 2, 12, st[2]);
  b.rect(7, 5, 2, 8, st[0]); b.rect(5, 7, 6, 2, st[0]);
  b.rect(1, 17, 14, 2, hex('#6e4a2c'));
  b.outline();
  return sprite(b, 8, 18);
}

// A round wooden shield on the arm, for the character drawing.
const SHIELD_COLOUR = {
  wood: ['#5e3b1f', '#9a6234', '#a8a39a'],
  bronze: ['#6e4320', '#c07a38', '#f2c48a'],
  iron: ['#4a4f56', '#9aa2aa', '#e2e8ec'],
};
export function shieldOn(b, x, y, kind = 'wood') {
  const [rim, face, boss] = (SHIELD_COLOUR[kind] || SHIELD_COLOUR.wood).map(hex);
  if (kind === 'wood') {
    b.ellipse(x, y, 3, 3.5, rim);
    b.ellipse(x, y, 2.2, 2.7, face);
  } else {
    b.rect(Math.round(x) - 3, Math.round(y) - 3, 6, 7, rim);
    b.rect(Math.round(x) - 2, Math.round(y) - 2, 4, 5, face);
  }
  b.set(Math.round(x), Math.round(y), boss);
}

// ---- Mining and smithing ------------------------------------------------------------

const ORE_COLOUR = {
  copper: [hex('#b8642a'), hex('#e08a44'), hex('#ffc07a')],
  tin: [hex('#9aa0a4'), hex('#c8ced2'), hex('#f2f6f8')],
  iron: [hex('#6e3a26'), hex('#9a5236'), hex('#c87a56')],
};

// A rock with veins of ore. With no `variant` it's a mined-out rock.
export function oreRock(variant, seed) {
  const b = new Bitmap(20, 18);
  shadedBlobs(b, [[8, 11, 6.5], [12, 10, 6.5], [10, 7.5, 5.5]], C.stone, seed);
  const col = ORE_COLOUR[variant];
  if (col) {
    for (let k = 0; k < 7; k++) {
      const x = 4 + Math.floor(rnd(seed, k, 5) * 12);
      const y = 5 + Math.floor(rnd(seed, k, 6) * 9);
      if (!b.alpha(x, y)) continue;
      b.set(x, y, col[1]); b.set(x + 1, y, col[0]);
      if (b.alpha(x, y - 1)) b.set(x, y - 1, col[2]);
    }
  } else {
    for (const [x, y] of [[7, 9], [11, 8], [9, 12]]) b.set(x, y, C.stone[0]);
  }
  b.outline();
  return sprite(b, 10, 17);
}

// The miners' furnace: a stone kiln with a glowing mouth and a chimney.
export function furnace() {
  const b = new Bitmap(18, 30);
  const st = C.stone;
  for (let y = 4; y < 30; y++) for (let x = 1; x < 17; x++) {
    const chimney = y < 12 && (x < 6 || x > 11);
    if (chimney) continue;
    const brick = (y % 4 === 0) || ((x + (Math.floor(y / 4) % 2) * 3) % 6 === 0);
    b.set(x, y, brick ? st[0] : st[(x + y) % 3 === 0 ? 2 : 1]);
  }
  b.rect(6, 4, 6, 2, st[3]);
  // the fire
  b.ellipse(9, 22, 4.5, 3.6, hex('#3a1a0c'));
  b.ellipse(9, 23, 3.4, 2.4, hex('#e0571e'));
  b.ellipse(9, 23.5, 2.2, 1.4, hex('#ffb347'));
  b.set(9, 23, hex('#fff1b0'));
  b.rect(3, 28, 12, 2, st[0]);
  b.outline();
  return sprite(b, 9, 29);
}

// An anvil on a wooden block.
export function anvil() {
  const b = new Bitmap(18, 16);
  const ir = [hex('#2e3236'), hex('#4c5258'), hex('#6e767e'), hex('#a3acb4')];
  b.rect(3, 3, 12, 3, ir[1]);
  b.rect(3, 3, 12, 1, ir[3]);
  b.rect(0, 3, 4, 2, ir[2]); // horn
  b.rect(6, 6, 6, 3, ir[0]);
  b.rect(5, 9, 8, 2, ir[1]);
  b.rect(4, 11, 10, 4, C.wood[1]);
  b.rect(4, 11, 10, 1, C.wood[2]);
  b.rect(4, 14, 10, 1, C.wood[0]);
  b.outline();
  return sprite(b, 9, 15);
}

// Loose stones on the floor (flat, walk over it).
export function rubble(seed) {
  const b = new Bitmap(16, 16);
  for (let k = 0; k < 5; k++) {
    const x = 2 + Math.floor(rnd(seed, k, 7) * 11);
    const y = 4 + Math.floor(rnd(seed, k, 8) * 9);
    b.set(x, y, C.stone[2]); b.set(x + 1, y, C.stone[1]); b.set(x, y + 1, C.stone[0]);
  }
  return sprite(b, 8, 8);
}

// ---- Chickens ----------------------------------------------------------------------

// A little hen, facing left. f = walk frame (0 standing, 1 and 2 stepping).
function drawChicken(look, f) {
  const b = new Bitmap(16, 16);
  const body = [hex(look.dark || '#c9bfae'), hex(look.feather || '#ece6da'), hex(look.light || '#ffffff')];
  const bob = f === 0 ? 0 : 1;
  // tail feathers
  b.ellipse(12, 7 + bob, 2.4, 2.6, body[0]);
  b.set(13, 4 + bob, body[1]); b.set(14, 5 + bob, body[1]);
  // body
  b.ellipse(8.5, 9 + bob, 5, 3.6, body[1]);
  b.ellipse(8, 8 + bob, 3.6, 2.2, body[2]);
  b.ellipse(10, 9.5 + bob, 2.2, 1.6, body[0]); // wing
  // head
  b.ellipse(4.5, 5 + bob, 2.2, 2.2, body[1]);
  b.set(4, 4 + bob, body[2]);
  b.set(3, 4 + bob, hex('#1d1410')); // eye
  b.rect(4, 2 + bob, 2, 1, hex('#d8322a')); b.set(5, 1 + bob, hex('#d8322a')); // comb
  b.set(3, 7 + bob, hex('#d8322a')); // wattle
  b.set(1, 5 + bob, hex('#f2a72e')); b.set(2, 5 + bob, hex('#f2a72e')); // beak
  // legs
  const leg = hex('#e89a2a');
  const [l1, l2] = f === 1 ? [6, 10] : f === 2 ? [7, 9] : [7, 10];
  for (const x of [l1, l2]) { b.set(x, 13, leg); b.set(x, 14, leg); b.set(x - 1, 14, leg); }
  b.outline();
  return b;
}

export function chickenFrames(look) {
  const frames = { down: [], up: [], left: [], right: [] };
  for (let f = 0; f < 3; f++) {
    const c = drawChicken(look, f);
    const left = sprite(c, 8, 15);
    const right = sprite(mirror(c), 8, 15);
    frames.left.push(left); frames.up.push(left);
    frames.right.push(right); frames.down.push(right);
  }
  return frames;
}

// ---- Fishing and cooking ---------------------------------------------------------

// Ripples on the water where fish are. Two frames, so the rings spread.
export function fishingSpot(frame) {
  const b = new Bitmap(16, 16);
  const foam = hex('#e8f6ff');
  const soft = hex('#a8d8f5');
  const ring = (cx, cy, r, c) => {
    for (let a = 0; a < 24; a++) {
      const t = (a / 24) * Math.PI * 2;
      if (a % 4 === 3) continue; // broken rings look like moving water
      b.set(Math.round(cx + Math.cos(t) * r), Math.round(cy + Math.sin(t) * r * 0.55), c);
    }
  };
  if (frame === 0) { ring(8, 8, 2, foam); ring(8, 8, 5, soft); }
  else { ring(8, 8, 3.5, foam); ring(8, 8, 6.5, soft); b.set(8, 8, foam); }
  // a fish tail breaking the surface
  if (frame === 1) { b.set(11, 6, hex('#6f8fb0')); b.set(12, 5, hex('#6f8fb0')); b.set(12, 6, hex('#9ab4cc')); }
  return sprite(b, 8, 12);
}

// A ring of stones around a low fire with a pot hanging over it.
export function cookingPit(frame) {
  const b = new Bitmap(20, 24);
  // stone ring
  for (let a = 0; a < 10; a++) {
    const t = (a / 10) * Math.PI * 2;
    const x = Math.round(10 + Math.cos(t) * 7), y = Math.round(19 + Math.sin(t) * 3);
    b.rect(x - 1, y - 1, 3, 2, C.stone[1 + (a % 2)]);
  }
  // logs and flames
  b.rect(6, 18, 8, 2, C.trunk[1]);
  const flame = [hex('#c8361d'), hex('#f07a22'), hex('#f9c23c'), hex('#fff2b0')];
  const sway = frame ? 1 : 0;
  for (const [y, x, w] of [[17, 10, 6], [16, 10 + sway, 5], [15, 10, 4], [14, 10 - sway, 2]]) for (let k = 0; k < w; k++) {
    const t = Math.abs(k - (w - 1) / 2) / ((w + 1) / 2);
    b.set(Math.round(x - w / 2 + k), y, flame[t > 0.7 ? 0 : t > 0.4 ? 1 : y < 15 ? 3 : 2]);
  }
  // spit with a pot
  const ir = [hex('#2e3236'), hex('#4c5258'), hex('#6e767e')];
  b.rect(2, 4, 1, 15, C.wood[0]); b.rect(17, 4, 1, 15, C.wood[0]);
  b.rect(2, 4, 16, 1, C.wood[1]);
  b.rect(9, 5, 1, 3, ir[0]);
  b.ellipse(9.5, 10.5, 3.6, 3, ir[1]);
  b.rect(6, 8, 8, 1, ir[2]);
  b.set(8, 10, ir[2]);
  b.outline();
  return sprite(b, 10, 22);
}

// ---- Cows --------------------------------------------------------------------------

// A black-and-white cow, facing left. f = walk frame.
function drawCow(look, f) {
  const b = new Bitmap(26, 20);
  const white = hex(look.hide || '#f2eee6'), shadow = hex('#cfc8bc'), black = hex(look.patch || '#2b2622');
  const bob = f === 0 ? 0 : 1;
  // legs
  const legs = f === 1 ? [6, 10, 16, 20] : f === 2 ? [7, 9, 17, 19] : [6, 9, 17, 20];
  for (const x of legs) { b.rect(x, 14, 2, 5, shadow); b.rect(x, 18, 2, 1, black); }
  // body
  for (let y = 6; y < 15; y++) for (let x = 5; x < 23; x++) {
    const dx = (x + 0.5 - 14) / 9, dy = (y + 0.5 - 10.5 - bob * 0.3) / 4.6;
    if (dx * dx + dy * dy > 1.05) continue;
    const patch = (x > 15 && x < 20 && y < 11) || (x > 8 && x < 12 && y > 9 && y < 13);
    b.set(x, y + bob - (bob ? 1 : 0), patch ? black : y > 12 ? shadow : white);
  }
  // udder and tail
  b.rect(15, 14, 3, 2, hex('#f2a8a8'));
  b.set(23, 8, black); b.set(24, 9, black); b.set(24, 10, black); b.set(24, 11, hex('#5a4e44'));
  // head
  b.ellipse(4.5, 8.5 + bob, 3.6, 3.4, white);
  b.rect(1, 9 + bob, 4, 3, hex('#e8b4a8')); // muzzle
  b.set(1, 10 + bob, hex('#8a5a52'));
  b.set(4, 7 + bob, black); // eye
  b.rect(5, 5 + bob, 2, 2, black); // ear patch
  b.set(3, 4 + bob, hex('#d8d0b8')); b.set(6, 4 + bob, hex('#d8d0b8')); // horns
  b.outline();
  return b;
}

export function cowFrames(look) {
  const frames = { down: [], up: [], left: [], right: [] };
  for (let f = 0; f < 3; f++) {
    const c = drawCow(look, f);
    const left = sprite(c, 13, 19);
    const right = sprite(mirror(c), 13, 19);
    frames.left.push(left); frames.up.push(left);
    frames.right.push(right); frames.down.push(right);
  }
  return frames;
}
