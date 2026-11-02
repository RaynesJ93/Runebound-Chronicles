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

function bow(b, w, r) {
  for (let a = 0; a <= 24; a++) {
    const t = -1.05 + (a / 24) * 2.1;
    b.set(Math.round(5 + Math.cos(t) * r), Math.round(8 + Math.sin(t) * r), w[a % 3 === 0 ? 2 : 1]);
  }
  line(b, Math.round(5 + Math.cos(1.05) * r), 8 - Math.round(Math.sin(1.05) * r), Math.round(5 + Math.cos(1.05) * r), 8 + Math.round(Math.sin(1.05) * r), hex('#e8e0c8'));
  b.rect(Math.round(5 + r) - 1, 7, 2, 3, w[0]);
}

// An axe: handle from bottom-left to top-right, and a wedge of metal sticking
// out sideways (down-right) near the top, its sharp edge on the outside.
function axe(b, metal) {
  const [d, m, l, h] = METAL[metal];
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    const v = x + y, u = x - y;
    if (v === 15 && x >= 1 && x <= 13) b.set(x, y, WOOD[1]);
    if (v === 14 && x >= 1 && x <= 12) b.set(x, y, WOOD[0]);
    const inHead = (v >= 16 && v <= 19 && u >= 3 && u <= 7) || (v === 20 && u >= 2 && u <= 8);
    if (inHead) b.set(x, y, v === 20 ? h : v === 19 ? l : v === 16 ? d : m);
  }
}

// Two logs lying side by side, ends showing their rings.
function logPair(b, bark, ring) {
  for (const [y0, x0] of [[9, 2], [5, 4]]) {
    for (let x = x0; x < x0 + 10; x++) for (let y = y0; y < y0 + 4; y++) b.set(x, y, y === y0 ? bark[2] : y === y0 + 3 ? bark[0] : bark[1]);
    b.ellipse(x0 + 10, y0 + 1.5, 1.6, 2.1, ring[0]);
    b.set(x0 + 10, y0 + 1, ring[1]);
  }
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
  waterRune(b) {
    b.ellipse(8, 8, 6, 6, hex('#7d7d78'));
    b.ellipse(8, 7.5, 5.2, 5.2, hex('#a9a79f'));
    const w = hex('#3f8fe0');
    for (const [x, y] of [[8, 4], [7, 5], [9, 5], [6, 6], [10, 6], [6, 7], [10, 7], [6, 8], [10, 8], [7, 9], [9, 9], [8, 10], [8, 6], [8, 7], [7, 7], [9, 7], [7, 8], [9, 8], [8, 8], [8, 9]]) b.set(x, y, w);
    b.set(7, 6, hex('#bfe3ff'));
  },
  mindRune(b) {
    b.ellipse(8, 8, 6, 6, hex('#7d7d78'));
    b.ellipse(8, 7.5, 5.2, 5.2, hex('#a9a79f'));
    const o = hex('#f07a22');
    for (const [x, y] of [[6, 5], [7, 5], [8, 5], [9, 5], [10, 6], [10, 7], [9, 8], [8, 8], [7, 9], [7, 10], [7, 7], [6, 6]]) b.set(x, y, o);
    b.set(8, 6, hex('#ffd0a0'));
  },
  shortbow(b) {
    const w = [hex('#5e3b1f'), hex('#8a5a32'), hex('#b07a48')];
    for (let a = 0; a <= 20; a++) {
      const t = -0.95 + (a / 20) * 1.9;
      b.set(Math.round(5 + Math.cos(t) * 7), Math.round(8 + Math.sin(t) * 7), w[a % 3 === 0 ? 2 : 1]);
    }
    line(b, 9, 1, 9, 14, hex('#e8e0c8'));
    b.rect(11, 7, 2, 3, w[0]);
  },
  apprenticeStaff(b) {
    line(b, 3, 14, 11, 4, hex('#8a5a32'));
    line(b, 4, 14, 12, 4, hex('#5e3b1f'));
    b.ellipse(12.5, 3.5, 2.4, 2.4, hex('#2f9a92'));
    b.set(12, 3, hex('#c8fff8'));
    b.set(13, 2, hex('#7fe8e0'));
  },
  longbow(b) { bow(b, [hex('#5e3b1f'), hex('#8a5a32'), hex('#b07a48')], 7.5); },
  oakShortbow(b) { bow(b, [hex('#6e4a22'), hex('#a8783e'), hex('#d0a060')], 7); },
  oakLongbow(b) { bow(b, [hex('#6e4a22'), hex('#a8783e'), hex('#d0a060')], 7.5); },
  bronzeAxe(b) { axe(b, 'bronze'); },
  ironAxe(b) { axe(b, 'iron'); },
  knife(b) {
    line(b, 4, 12, 7, 9, WOOD[1]);
    line(b, 5, 12, 7, 10, WOOD[0]);
    const [d, m, l] = METAL.iron;
    line(b, 8, 8, 12, 4, l);
    line(b, 8, 9, 13, 4, m);
    b.set(13, 3, l);
    b.set(8, 10, d);
  },
  logs(b) { logPair(b, [hex('#5e3b1f'), hex('#8a5a32'), hex('#b07a48')], [hex('#e8c890'), hex('#c49a5c')]); },
  oakLogs(b) { logPair(b, [hex('#4a3016'), hex('#6e4a22'), hex('#946a36')], [hex('#d8b070'), hex('#a87a3c')]); },
  arrowShaft(b) {
    for (const off of [0, 3, 6]) line(b, 2 + off, 13, 9 + off, 4, off === 3 ? WOOD[1] : WOOD[2]);
  },
  feather(b) {
    const w = hex('#f4f2e6'), g = hex('#c9c5b6');
    for (let k = 0; k < 9; k++) {
      const x = 4 + k, y = 12 - k;
      b.set(x, y, hex('#8a8578'));
      if (k > 0 && k < 8) { b.set(x - 1, y - 1, w); b.set(x - 2, y - 1, k % 2 ? g : w); b.set(x + 1, y + 1, w); b.set(x + 1, y + 2, k % 2 ? w : g); }
    }
  },
  headlessArrow(b) {
    for (const off of [0, 3]) {
      line(b, 3 + off, 13, 11 + off, 5, WOOD[2]);
      b.set(2 + off, 13, hex('#f4f2e6')); b.set(3 + off, 14, hex('#f4f2e6')); b.set(2 + off, 12, hex('#d8d4c6'));
    }
  },
  bronzeArrowtips(b) {
    const [d, m, l] = METAL.bronze;
    for (const [x, y] of [[4, 10], [9, 11], [7, 6], [11, 5]]) {
      b.set(x, y, l); b.set(x + 1, y, m); b.set(x, y + 1, m); b.set(x + 1, y + 1, d); b.set(x + 2, y - 1, l);
    }
  },
  wolfPelt(b) {
    const f = [hex('#5e6368'), hex('#8a8f94'), hex('#b4b8bc')];
    for (let y = 3; y < 14; y++) for (let x = 2; x < 14; x++) {
      const dx = (x + 0.5 - 8) / 6, dy = (y + 0.5 - 8.5) / 5;
      const legs = (y > 11 && (x < 4 || x > 11)) || (y < 5 && (x < 4 || x > 11));
      if (dx * dx + dy * dy > 1 && !legs) continue;
      b.set(x, y, f[(x * 3 + y * 5) % 7 < 2 ? 0 : (x + y) % 3 === 0 ? 2 : 1]);
    }
    b.rect(6, 2, 4, 2, f[1]);
  },
  wolfCloak(b) {
    const f = [hex('#3a3e42'), hex('#5e6368'), hex('#8a8f94'), hex('#e8e8e4')];
    for (let y = 2; y < 15; y++) {
      const half = 2 + (y - 2) * 0.45;
      for (let x = 0; x < 16; x++) if (Math.abs(x + 0.5 - 8) <= half) b.set(x, y, f[y === 14 ? 0 : (x + y) % 4 === 0 ? 2 : 1]);
    }
    b.rect(5, 2, 6, 2, f[3]);
    b.set(8, 4, hex('#e8c040'));
  },
  cookedTrout(b) {
    const c = [hex('#7a4a26'), hex('#b06a3a'), hex('#d89a5a'), hex('#f2c48a')];
    b.ellipse(7, 9, 5.5, 3, c[1]);
    b.ellipse(6.5, 8.2, 4, 1.6, c[2]);
    b.set(4, 8, c[3]);
    for (const [x, y] of [[12, 9], [13, 7], [13, 11], [14, 6], [14, 12]]) b.set(x, y, c[0]);
    b.rect(12, 8, 2, 3, c[1]);
    b.set(3, 9, hex('#1d1d1d'));
  },
  meatPie(b) {
    b.ellipse(8, 10, 6.5, 3.5, hex('#8a5022'));
    b.ellipse(8, 9, 6, 3, hex('#d8a05a'));
    b.ellipse(7, 8.4, 3.5, 1.4, hex('#f0c888'));
    for (const x of [5, 8, 11]) b.set(x, 9, hex('#8a5022'));
  },
  vial(b) {
    b.rect(6, 2, 4, 2, hex('#8a5a32'));
    b.rect(6, 4, 4, 2, hex('#cfe6ef'));
    b.ellipse(8, 10, 4.5, 4.5, hex('#cfe6ef'));
    b.ellipse(8, 10, 3.5, 3.5, hex('#eef8fc'));
    b.set(6, 8, hex('#ffffff'));
  },
  woodenShield(b) {
    b.ellipse(8, 8, 6.5, 6.5, hex('#5e3b1f'));
    b.ellipse(8, 8, 5.5, 5.5, hex('#9a6234'));
    for (const x of [5, 8, 11]) for (let y = 3; y < 14; y++) if (((x + 0.5 - 8) / 5.5) ** 2 + ((y + 0.5 - 8) / 5.5) ** 2 < 1) b.set(x, y, hex('#7a4a26'));
    b.ellipse(8, 8, 1.6, 1.6, hex('#a8a39a'));
    b.set(7, 7, hex('#e8e8e4'));
  },
  leatherBody(b) {
    const c = [hex('#5e3b1f'), hex('#8a5a32'), hex('#a8743f')];
    for (let y = 3; y < 14; y++) for (let x = 2; x < 14; x++) {
      const torso = x >= 4 && x <= 11;
      const sleeve = y < 8 && (x < 4 || x > 11);
      if (!torso && !sleeve) continue;
      if (y === 3 && x > 6 && x < 9) continue;
      b.set(x, y, x === 8 || (y === 9 && torso) ? c[0] : (x + y) % 5 === 0 ? c[2] : c[1]);
    }
  },
  leatherGloves(b) {
    const c = [hex('#5e3b1f'), hex('#8a5a32'), hex('#a8743f')];
    for (const ox of [1, 8]) {
      b.rect(ox + 1, 5, 5, 6, c[1]);
      for (let k = 0; k < 4; k++) b.rect(ox + 1 + k, 3, 1, 2, c[2]);
      b.rect(ox, 7, 1, 3, c[1]);
      b.rect(ox + 1, 11, 5, 2, c[0]);
    }
  },
  leatherBoots(b) {
    const c = [hex('#4a2c16'), hex('#7a4a26'), hex('#9a6234')];
    for (const ox of [1, 8]) {
      b.rect(ox + 1, 3, 4, 7, c[1]);
      b.rect(ox, 10, 7, 3, c[1]);
      b.rect(ox, 12, 7, 1, c[0]);
      b.rect(ox + 1, 3, 4, 1, c[2]);
    }
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
const POTION_COLOUR = { attack: ['#2f6fd0', '#7fb8f5'], strength: ['#c4281d', '#f47a5a'], defence: ['#2f9a3a', '#8fe07a'] };

// A glass vial whose liquid level shows the doses left.
function potion(b, skill, doses) {
  const [deep, light] = POTION_COLOUR[skill].map(hex);
  b.rect(6, 1, 4, 2, hex('#8a5a32'));
  b.rect(6, 3, 4, 3, hex('#cfe6ef'));
  b.ellipse(8, 10, 4.5, 4.5, hex('#cfe6ef'));
  const top = 14 - doses * 2.2;
  for (let y = 5; y < 15; y++) for (let x = 3; x < 13; x++) {
    if (((x + 0.5 - 8) / 4) ** 2 + ((y + 0.5 - 10) / 4) ** 2 > 1 || y < top) continue;
    b.set(x, y, y < top + 1.5 ? light : deep);
  }
  b.set(6, 8, hex('#ffffff'));
}

export function itemIcon(id) {
  if (cache.has(id)) return cache.get(id);
  const b = new Bitmap(16, 16);
  const pm = /^(attack|strength|defence)Potion(\d)$/.exec(id);
  if (pm) potion(b, pm[1], Number(pm[2]));
  else (DRAW[id] || DRAW.bag)(b);
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

