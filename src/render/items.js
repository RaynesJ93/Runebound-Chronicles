import { Bitmap, hex, rnd } from './pixel.js';

// 16 x 16 item icons, drawn in code, outlined like everything else.
// Used both in the inventory and lying on the ground.

const METAL = {
  bronze: [hex('#6e4320'), hex('#a8692e'), hex('#d4934f'), hex('#f2c48a')],
  iron: [hex('#4a4f56'), hex('#7a828b'), hex('#a8b0b8'), hex('#dfe5ea')],
};
const WOOD = [hex('#4a2c16'), hex('#7a4a26'), hex('#a0703f')];

function line(b, x0, y0, x1, y1, c) {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let i = 0; i <= n; i++) b.set(Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), c);
}

// A blade running from bottom-left (hilt) to top-right (tip).
function blade(b, metal, length) {
  const [d, m, l, h] = METAL[metal];
  const x0 = 4, y0 = 11;
  const x1 = x0 + length, y1 = y0 - length;
  line(b, x0 + 1, y0 - 1, x1, y1, l);
  line(b, x0 + 2, y0 - 1, x1, y1 + 1, m);
  line(b, x0 + 1, y0, x1 - 1, y1 + 1, d);
  b.set(x1, y1, h);
  // crossguard, grip and pommel
  line(b, x0 - 1, y0 - 2, x0 + 2, y0 + 1, metal === 'bronze' ? hex('#e8c040') : METAL.iron[2]);
  line(b, x0 - 1, y0 + 1, x0 - 3, y0 + 3, WOOD[1]);
  line(b, x0, y0 + 1, x0 - 2, y0 + 3, WOOD[0]);
  b.set(x0 - 4, y0 + 4, METAL[metal][1]);
}

const DRAW = {
  coins(b) {
    const gold = [hex('#8a6410'), hex('#d4a020'), hex('#f2c94a'), hex('#fff0a0')];
    for (const [cx, cy] of [[6, 11], [10, 11], [8, 8]]) {
      b.ellipse(cx, cy, 3.6, 2.2, gold[0]);
      b.ellipse(cx, cy - 0.6, 3.2, 1.7, gold[2]);
      b.set(Math.round(cx - 1), Math.round(cy - 1), gold[3]);
    }
  },
  bones(b) {
    const bone = hex('#efe6cf');
    const sh = hex('#c9bd9c');
    line(b, 3, 12, 12, 3, bone);
    line(b, 4, 12, 12, 4, sh);
    for (const [x, y] of [[2, 11], [3, 13], [11, 2], [13, 4]]) { b.set(x, y, bone); b.set(x + 1, y, bone); b.set(x, y + 1, bone); }
  },
  bread(b) {
    b.ellipse(8, 9, 6.5, 4, hex('#8a5022'));
    b.ellipse(8, 8.5, 6, 3.4, hex('#c27a36'));
    b.ellipse(7, 7.6, 4, 1.6, hex('#e0a25c'));
    for (const x of [5, 8, 11]) line(b, x, 7, x + 1, 9, hex('#8a5022'));
  },
  airRune(b) {
    b.ellipse(8, 8, 6, 6, hex('#7d7d78'));
    b.ellipse(8, 7.5, 5.2, 5.2, hex('#a9a79f'));
    b.ellipse(7, 6.5, 2.5, 2, hex('#c9c7bd'));
    const w = hex('#f4fbff');
    for (const [x, y] of [[6, 6], [7, 5], [9, 5], [10, 6], [10, 7], [9, 8], [8, 8], [7, 9], [6, 10], [8, 10], [9, 10], [10, 10]]) b.set(x, y, w);
  },
  bronzeArrow(b) {
    for (const off of [0, 3]) {
      line(b, 3 + off, 13, 11 + off, 5, WOOD[2]);
      const [, m, l] = METAL.bronze;
      b.set(12 + off, 4, l); b.set(11 + off, 4, m); b.set(12 + off, 5, m);
      b.set(2 + off, 13, hex('#f4f2e6')); b.set(3 + off, 14, hex('#f4f2e6')); b.set(2 + off, 12, hex('#d8d4c6'));
    }
  },
  bronzeDagger(b) { blade(b, 'bronze', 6); },
  ironDagger(b) { blade(b, 'iron', 6); },
  bronzeSword(b) { blade(b, 'bronze', 9); },
  bronzeMedHelm(b) {
    const [d, m, l, h] = METAL.bronze;
    for (let y = 3; y < 13; y++) for (let x = 2; x < 14; x++) {
      const dx = (x + 0.5 - 8) / 6, dy = (y + 0.5 - 10) / 7;
      if (dx * dx + dy * dy > 1 || y > 11) continue;
      const k = -dx * 0.7 - dy * 0.7;
      b.set(x, y, k > 0.5 ? h : k > 0 ? l : k > -0.5 ? m : d);
    }
    b.rect(2, 11, 12, 2, d);
    b.rect(7, 9, 2, 5, m);
  },
  goblinMail(b) {
    const c = [hex('#4f5a3a'), hex('#6f7a52'), hex('#8f9a6a')];
    for (let y = 3; y < 14; y++) for (let x = 2; x < 14; x++) {
      const torso = x >= 4 && x <= 11;
      const sleeve = y < 8 && (x < 4 || x > 11);
      if (!torso && !sleeve) continue;
      if (y === 3 && x > 6 && x < 9) continue; // neck
      b.set(x, y, c[(x + y) % 2 === 0 ? 2 : rnd(x, y, 4) < 0.5 ? 1 : 0]);
    }
    b.rect(4, 10, 8, 1, hex('#5a3a1e'));
  },
  warCharm(b) {
    const cord = hex('#6e4424');
    for (let a = 0; a < 18; a++) {
      const t = (a / 18) * Math.PI;
      b.set(Math.round(8 + Math.cos(t) * 5.5), Math.round(6 - Math.sin(t) * 4), cord);
    }
    line(b, 2, 6, 6, 11, cord);
    line(b, 13, 6, 10, 11, cord);
    for (const [x, y, c] of [[4, 8, '#c0392b'], [12, 8, '#2f6fd0'], [5, 10, '#e8c040']]) b.set(x, y, hex(c));
    // the tooth
    const tooth = hex('#f4ecd6');
    b.rect(7, 10, 3, 2, tooth); b.rect(7, 12, 2, 2, tooth); b.set(7, 14, tooth);
    b.set(9, 10, hex('#c9bd9c'));
  },
  bag(b) {
    const c = [hex('#6e4424'), hex('#9a6234'), hex('#c08c55')];
    b.ellipse(8, 10, 6, 5, c[0]);
    b.ellipse(7.5, 9.5, 5.2, 4.2, c[1]);
    b.ellipse(6.5, 8.5, 2.6, 2, c[2]);
    b.rect(6, 3, 4, 3, c[1]);
    b.rect(5, 5, 6, 1, hex('#e8c040'));
    b.rect(5, 2, 2, 1, c[0]); b.rect(9, 2, 2, 1, c[0]);
  },
};

const cache = new Map();

// { img: canvas, url: data URL } for an item id.
export function itemIcon(id) {
  if (cache.has(id)) return cache.get(id);
  const b = new Bitmap(16, 16);
  (DRAW[id] || DRAW.bag)(b);
  b.outline();
  const img = b.toCanvas();
  const out = { img, url: img.toDataURL('image/png') };
  cache.set(id, out);
  return out;
}

// Stack counts in OSRS style: 99,999 then 100K then 10M.
export function stackLabel(n) {
  if (n >= 10_000_000) return { text: `${Math.floor(n / 1_000_000)}M`, cls: 'm' };
  if (n >= 100_000) return { text: `${Math.floor(n / 1000)}K`, cls: 'k' };
  return { text: String(n), cls: '' };
}

