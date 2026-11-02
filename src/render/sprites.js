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

// ---- The player ------------------------------------------------------------------

const LOOK = {
  skin: hex('#f2c393'), skinS: hex('#d99c6c'), blush: hex('#ef9a8c'),
  hair: hex('#6b3f1f'), hairHi: hex('#93602f'),
  tunic: hex('#3f6fb0'), tunicS: hex('#2d5089'), tunicHi: hex('#5d8fd0'),
  belt: hex('#5a3a1e'), gold: hex('#e8c040'),
  pants: hex('#6b5137'), pantsS: hex('#523d29'),
  boots: hex('#3a2a1c'), eye: hex('#2b1d16'),
};

function mirror(b) {
  const m = new Bitmap(b.w, b.h);
  for (let y = 0; y < b.h; y++) for (let x = 0; x < b.w; x++) {
    const i = (y * b.w + x) * 4;
    const k = (y * b.w + (b.w - 1 - x)) * 4;
    for (let c = 0; c < 4; c++) m.data[k + c] = b.data[i + c];
  }
  return m;
}

// frame: 0 standing, 1 left foot forward, 2 right foot forward
function drawFront(back, frame) {
  const L = LOOK;
  const b = new Bitmap(16, 24);
  const bob = frame ? -1 : 0;
  // legs
  const legY = (side) => (frame === 1 && side === 0) || (frame === 2 && side === 1) ? -1 : 0;
  for (const [side, x] of [[0, 5], [1, 8]]) {
    const o = legY(side);
    b.rect(x, 17 + o, 3, 3, side ? L.pantsS : L.pants);
    b.rect(x, 20 + o, 3, 2, L.boots);
  }
  // torso
  b.rect(4, 10 + bob, 8, 7 - bob, L.tunic);
  b.rect(11, 10 + bob, 1, 7 - bob, L.tunicS);
  b.rect(5, 10 + bob, 1, 5, L.tunicHi);
  b.rect(4, 15 + bob, 8, 1, L.belt);
  if (!back) b.rect(7, 15 + bob, 2, 1, L.gold);
  // arms swing opposite to legs
  const armO = (side) => (frame === 1 && side === 1) || (frame === 2 && side === 0) ? 1 : 0;
  for (const [side, x] of [[0, 2], [1, 12]]) {
    const o = armO(side) + bob;
    b.rect(x, 11 + o, 2, 4, side ? L.tunicS : L.tunic);
    b.rect(x, 15 + o, 2, 1, L.skin);
  }
  // head
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
    b.set(5, 8 + bob, L.blush);
    b.set(10, 8 + bob, L.blush);
  }
  b.outline();
  return b;
}

function drawSide(frame) {
  const L = LOOK;
  const b = new Bitmap(16, 24);
  const bob = frame ? -1 : 0;
  // legs: apart when walking
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
  b.rect(10, 10 + bob, 1, 7 - bob, L.tunicS);
  b.rect(5, 15 + bob, 6, 1, L.belt);
  const armX = frame === 1 ? 8 : frame === 2 ? 6 : 7;
  b.rect(armX, 11 + bob, 2, 4, L.tunicS);
  b.rect(armX, 15 + bob, 2, 1, L.skin);
  // head facing left
  b.rect(7, 9 + bob, 2, 1, L.skinS);
  b.rect(4, 1 + bob, 8, 8, L.skin);
  b.set(3, 6 + bob, L.skin);
  b.rect(4, 0 + bob, 8, 3, L.hair);
  b.rect(8, 3 + bob, 4, 5, L.hair);
  b.rect(5, 3 + bob, 3, 1, L.hair);
  b.rect(6, 1 + bob, 3, 1, L.hairHi);
  b.rect(5, 5 + bob, 1, 2, L.eye);
  b.set(5, 8 + bob, L.blush);
  b.outline();
  return b;
}

export function playerFrames() {
  const frames = { down: [], up: [], left: [], right: [] };
  for (let f = 0; f < 3; f++) {
    frames.down.push(sprite(drawFront(false, f), 8, 22));
    frames.up.push(sprite(drawFront(true, f), 8, 22));
    const side = drawSide(f);
    frames.left.push(sprite(side, 8, 22));
    frames.right.push(sprite(mirror(side), 8, 22));
  }
  return frames;
}
