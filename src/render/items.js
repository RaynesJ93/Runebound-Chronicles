import { art } from './art.js';
import { Bitmap, hex, rnd } from './pixel.js';
import { ITEMS } from '../../data/items.js';

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

// A pickaxe: handle from bottom-left, a curved double-pointed head across the top.
function pickaxe(b, metal) {
  const [d, m, l, h] = METAL[metal];
  line(b, 3, 14, 10, 7, WOOD[1]);
  line(b, 4, 14, 10, 8, WOOD[0]);
  for (let t = -6; t <= 6; t++) {
    const bend = Math.round((36 - t * t) * 0.09);
    const x = 10 + t, y = 6 + t - bend;
    b.set(x, y, Math.abs(t) > 4 ? h : l);
    b.set(x, y + 1, Math.abs(t) > 4 ? l : m);
    if (Math.abs(t) < 3) b.set(x + 1, y + 1, d);
  }
}

// A lump of rock with coloured flecks of ore.
function oreLump(b, fleck) {
  const st = [hex('#5e5a54'), hex('#7d7870'), hex('#9e988e')];
  b.ellipse(8, 9, 6, 4.6, st[0]);
  b.ellipse(7.5, 8.4, 5.2, 3.8, st[1]);
  b.ellipse(6.5, 7.4, 2.6, 1.8, st[2]);
  for (const [x, y] of [[5, 8], [9, 7], [10, 10], [7, 11], [11, 8], [4, 10]]) { b.set(x, y, fleck[1]); b.set(x + 1, y, fleck[0]); }
  b.set(9, 7, fleck[2]);
}

// A metal bar (ingot), seen from the side and a little above.
function ingot(b, metal) {
  const [d, m, l, h] = METAL[metal];
  for (let y = 6; y < 12; y++) {
    const inset = y < 8 ? 8 - y : 0;
    for (let x = 2 + inset; x < 14 - inset; x++) b.set(x, y, y < 8 ? l : y === 11 ? d : m);
  }
  line(b, 5, 6, 10, 6, h);
}

// A square shield with a rim and a boss in the middle.
function sqShield(b, metal) {
  const [d, m, l, h] = METAL[metal];
  for (let y = 2; y < 14; y++) for (let x = 3; x < 13; x++) {
    const rim = x === 3 || x === 12 || y === 2 || y === 13;
    b.set(x, y, rim ? d : (x + y) % 7 === 0 ? l : m);
  }
  b.ellipse(8, 8, 1.8, 1.8, l);
  b.set(7, 7, h);
  line(b, 4, 3, 11, 3, h);
}

// A chainmail shirt: little rings in a checker pattern.
function chainbody(b, metal) {
  const [d, m, l] = METAL[metal];
  for (let y = 3; y < 14; y++) for (let x = 2; x < 14; x++) {
    const torso = x >= 4 && x <= 11;
    const sleeve = y < 8 && (x < 4 || x > 11);
    if (!torso && !sleeve) continue;
    if (y === 3 && x > 6 && x < 9) continue;
    b.set(x, y, (x + y) % 2 === 0 ? l : y % 3 === 0 ? d : m);
  }
}

// A metal helmet with a nose guard.
function medHelm(b, metal) {
  const [d, m, l, h] = METAL[metal];
  for (let y = 3; y < 13; y++) for (let x = 2; x < 14; x++) {
    const dx = (x + 0.5 - 8) / 6, dy = (y + 0.5 - 10) / 7;
    if (dx * dx + dy * dy > 1 || y > 11) continue;
    const k = -dx * 0.7 - dy * 0.7;
    b.set(x, y, k > 0.5 ? h : k > 0 ? l : k > -0.5 ? m : d);
  }
  b.rect(7, 9, 2, 4, m);
  b.set(7, 9, l);
}

// A fish lying on its side, head to the left. len: 6-12. col: [dark, body, belly].
function fish(b, col, len, cooked = false) {
  const [d, m, l] = col.map(hex);
  const cx = 8, cy = 8, rx = len / 2, ry = Math.max(2, len / 4.2);
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
    if (dx * dx + dy * dy > 1) continue;
    b.set(x, y, dy > 0.35 ? l : dy < -0.5 ? d : m);
  }
  // tail
  const tx = Math.round(cx + rx);
  for (let k = 0; k < 3; k++) { b.set(tx + k, cy - 1 - k, d); b.set(tx + k, cy + k, d); b.set(tx + k, cy, m); }
  // eye, or grill marks once cooked
  b.set(Math.round(cx - rx + 2), cy - 1, cooked ? d : hex('#1d1410'));
  if (cooked) for (const x of [cx - 1, cx + 2]) { b.set(x, cy - 1, d); b.set(x + 1, cy, d); }
}

// A tanned hide, stretched flat: the classic hide shape, a body with four
// leg flaps and a neck flap, so it can't be mistaken for anything else.
function hideSheet(b, c) {
  const [d, m, l] = c;
  // body
  for (let y = 4; y < 12; y++) for (let x = 4; x < 12; x++) b.set(x, y, (x + y) % 6 === 0 ? l : m);
  // leg flaps at the corners, angled outwards
  for (const [x0, y0, dx, dy] of [[4, 4, -1, -1], [11, 4, 1, -1], [4, 11, -1, 1], [11, 11, 1, 1]]) {
    for (let k = 1; k <= 3; k++) { b.set(x0 + dx * k, y0 + dy * k, m); b.set(x0 + dx * (k - 1), y0 + dy * k, m); }
    b.set(x0 + dx * 3, y0 + dy * 3, d);
  }
  // neck and tail flaps
  b.rect(7, 2, 2, 2, m); b.rect(7, 12, 2, 2, d);
  // a lighter sheen and the stitched edge
  b.rect(5, 5, 4, 1, l);
  for (const [x, y] of [[4, 7], [4, 9], [11, 7], [11, 9]]) b.set(x, y, d);
}

// Two logs lying side by side, ends showing their rings.
function logPair(b, bark, ring) {
  for (const [y0, x0] of [[9, 2], [5, 4]]) {
    for (let x = x0; x < x0 + 10; x++) for (let y = y0; y < y0 + 4; y++) b.set(x, y, y === y0 ? bark[2] : y === y0 + 3 ? bark[0] : bark[1]);
    b.ellipse(x0 + 10, y0 + 1.5, 1.6, 2.1, ring[0]);
    b.set(x0 + 10, y0 + 1, ring[1]);
  }
}

// A broken piece of grey runestone (outline points), with glowing rune marks.
function shard(b, pts, runes) {
  const [d, m, l] = [hex('#4a4e58'), hex('#727885'), hex('#9ea4b0')];
  const inside = (x, y) => {
    let c = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
    }
    return c;
  };
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    if (!inside(x + 0.5, y + 0.5)) continue;
    b.set(x, y, !inside(x + 0.5, y - 0.5) ? l : !inside(x + 0.5, y + 1.5) ? d : (x + y) % 5 === 0 ? d : m);
  }
  for (const [x, y] of runes) { b.set(x, y, hex('#7ff0e0')); if (inside(x + 1.5, y + 0.5)) b.set(x + 1, y, hex('#2fb0a8')); }
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
  // The Runebound, chapter 3: the three pieces of the broken runestone.
  runeKey(b) {
    const [d, m, l, g] = [hex('#3e424c'), hex('#6a707c'), hex('#9aa0ac'), hex('#7ff0e0')];
    b.ellipse(5, 5, 3.6, 3.6, d); b.ellipse(5, 4.6, 3, 3, m); b.ellipse(5, 5, 1.4, 1.4, [0, 0, 0]);
    for (let k = 0; k < 9; k++) { b.set(7 + k, 7 + k, m); b.set(8 + k, 7 + k, d); b.set(7 + k, 6 + k, l); }
    for (const [x, y] of [[11, 13], [12, 14], [13, 12], [14, 13]]) b.set(x, y, m); // the bit
    for (const [x, y] of [[9, 9], [11, 11], [13, 13], [4, 3], [6, 3]]) b.set(x, y, g);   // runes
  },
  bindingStone(b) {
    shard(b, [[8, 0], [12, 3], [13, 9], [12, 15], [4, 15], [3, 9], [4, 3]], [[8, 3], [8, 4], [7, 5], [9, 5], [6, 8], [10, 8], [8, 9], [8, 10], [7, 12], [9, 12]]);
    for (const [x, y] of [[3, 7], [3, 11], [12, 7], [12, 11]]) b.set(x, y, hex('#9aa0aa')); // the steel band
    for (let x = 4; x <= 11; x++) { b.set(x, 13, hex('#5a5e68')); b.set(x, 14, x % 3 ? hex('#8a909c') : hex('#e8ecf0')); }
  },
  runestoneSetting(b) {
    const [d, m, l, sv] = [hex('#3a3e46'), hex('#6e747e'), hex('#a4aab4'), hex('#eef2f6')];
    b.ellipse(8, 9, 6.5, 5, d);
    b.ellipse(8, 8.6, 5.6, 4.2, m);
    for (let a = 0; a < 24; a++) { const t = (a / 24) * Math.PI * 2; const x = Math.round(8 + Math.cos(t) * 4.8), y = Math.round(8.8 + Math.sin(t) * 3.4); b.set(x, y, a % 2 ? sv : l); }
    // the hole in the middle
    for (let y = 5; y <= 13; y++) for (let x = 3; x <= 13; x++) if (((x + 0.5 - 8) / 3.2) ** 2 + ((y + 0.5 - 9.4) / 2.1) ** 2 <= 1) b.set(x, y, [0, 0, 0], 0);
  },
  runestoneBase(b) { shard(b, [[2, 14], [14, 14], [13, 9], [10, 7], [7, 9], [3, 8]], [[5, 12], [6, 11], [7, 12], [9, 11], [10, 12], [11, 11]]); },
  runestoneCrown(b) { shard(b, [[8, 1], [12, 7], [13, 12], [6, 13], [3, 9]], [[8, 5], [8, 6], [7, 7], [9, 7], [8, 9], [8, 10]]); },
  runestoneHeart(b) { shard(b, [[4, 3], [11, 2], [14, 8], [11, 14], [4, 13], [2, 8]], [[6, 6], [7, 7], [8, 8], [9, 7], [10, 6], [8, 10], [8, 11]]); },
  // The Runebound: Pell's strongbox, the goblin token and Holt's journal.
  pellsStrongbox(b) {
    const [d, m, l] = [hex('#3a3a40'), hex('#62626c'), hex('#8e8e98')];
    b.rect(2, 6, 12, 8, m);
    b.rect(2, 4, 12, 3, l);          // the lid
    b.rect(2, 7, 12, 1, d);
    b.rect(2, 13, 12, 1, d);
    for (const x of [4, 11]) b.rect(x, 4, 1, 10, d); // straps
    b.rect(7, 8, 2, 3, hex('#d4a020')); // the lock
    b.set(7, 9, hex('#5a3a10'));
  },
  goblinToken(b) {
    const cord = hex('#6e4424');
    line(b, 5, 5, 6, 2, cord); line(b, 6, 1, 10, 1, cord); line(b, 10, 2, 11, 5, cord); // a loop of cord
    b.ellipse(8, 10, 5, 5, hex('#b8ac8a'));
    b.ellipse(8, 9.6, 4.4, 4.4, hex('#e4dac0'));
    const cut = hex('#5a4a30');
    for (const [x, y] of [[5, 7], [8, 7], [11, 7], [5, 8], [6, 8], [8, 8], [10, 8], [11, 8]]) b.set(x, y, cut); // a crude crown...
    b.rect(5, 9, 7, 1, cut);
    for (const x of [6, 8, 10]) line(b, x, 11, x + 1, 13, hex('#8a2a1a')); // three slashes
  },
  holtsJournal(b) {
    b.rect(3, 2, 10, 13, hex('#5a3420'));
    b.rect(4, 2, 9, 12, hex('#7a4a2c'));
    b.rect(12, 3, 1, 11, hex('#efe6cf')); // page edges
    b.rect(3, 2, 1, 13, hex('#3e2414'));  // spine
    b.rect(6, 5, 5, 1, hex('#c8a040'));
    b.rect(6, 7, 4, 1, hex('#c8a040'));
    line(b, 9, 14, 10, 16, hex('#8c2f2f')); // ribbon
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
  smallNet(b) {
    const rope = hex('#d8c08a'), dark = hex('#a8905a');
    for (let y = 3; y < 14; y++) for (let x = 3; x < 13; x++) if ((x + y) % 3 === 0 || (x - y + 30) % 3 === 0) b.set(x, y, (x + y) % 2 ? rope : dark);
    line(b, 3, 3, 12, 3, WOOD[1]);
    line(b, 12, 3, 14, 1, WOOD[0]);
  },
  fishingRod(b) {
    line(b, 2, 14, 13, 2, WOOD[1]);
    line(b, 3, 14, 13, 3, WOOD[0]);
    line(b, 13, 2, 13, 11, hex('#e8e8e8'));
    b.set(13, 12, hex('#c0392b')); b.set(12, 12, hex('#e8e8e8'));
    b.rect(4, 11, 2, 2, hex('#7a828b'));
  },
  flyFishingRod(b) {
    line(b, 2, 14, 13, 2, hex('#5e3b1f'));
    line(b, 3, 14, 13, 3, hex('#8a5a32'));
    line(b, 13, 2, 14, 10, hex('#e8e8e8'));
    b.set(14, 11, hex('#f2c94a')); b.set(13, 11, hex('#e05a3a')); // the fly
    b.rect(4, 11, 2, 2, hex('#c8a030'));
  },
  fishingBait(b) {
    const w = [hex('#b05a5a'), hex('#d88080')];
    b.ellipse(8, 11, 5.5, 2.8, hex('#6e4a2a'));
    b.ellipse(8, 10.5, 4.6, 2, hex('#8a6a42'));
    for (let k = 0; k < 7; k++) { b.set(4 + k, 9 - Math.round(Math.sin(k) * 1.5), w[k % 2]); b.set(5 + k, 7 + Math.round(Math.cos(k * 1.3)), w[(k + 1) % 2]); }
  },
  rawShrimps(b) { for (const [x, y] of [[4, 7], [9, 10]]) { b.ellipse(x + 2, y, 3, 1.8, hex('#d88c80')); b.ellipse(x + 2, y - 0.5, 2.4, 1.1, hex('#f2b4a8')); b.set(x - 1, y + 1, hex('#c06a5a')); } },
  shrimps(b) { for (const [x, y] of [[4, 7], [9, 10]]) { b.ellipse(x + 2, y, 3, 1.8, hex('#d8582e')); b.ellipse(x + 2, y - 0.5, 2.4, 1.1, hex('#f2905a')); b.set(x - 1, y + 1, hex('#b0401e')); } },
  rawAnchovies(b) { for (const y of [5, 9, 12]) { b.ellipse(8, y, 4.5, 1.2, hex('#8aa0b0')); b.set(4, y, hex('#1d1410')); b.set(13, y, hex('#5a6e7e')); } },
  anchovies(b) { for (const y of [5, 9, 12]) { b.ellipse(8, y, 4.5, 1.2, hex('#a8844e')); b.set(13, y, hex('#6e5030')); } },
  rawSardine(b) { fish(b, ['#4a6a8a', '#7fa0bf', '#d0dce8'], 9); },
  sardine(b) { fish(b, ['#6e4a26', '#a8743e', '#d4a46a'], 9, true); },
  rawHerring(b) { fish(b, ['#4e5e6e', '#8a9aaa', '#dfe5ea'], 10); },
  herring(b) { fish(b, ['#6e4a26', '#a87a46', '#d8b07a'], 10, true); },
  rawTrout(b) { fish(b, ['#4a6a3a', '#7f9a5a', '#e8c8b0'], 11); },
  rawSalmon(b) { fish(b, ['#6a7a8a', '#d88a70', '#f4c8b0'], 12); },
  salmon(b) { fish(b, ['#8a4a22', '#d0703a', '#f0a870'], 12, true); },
  burntFish(b) { fish(b, ['#141010', '#2a2220', '#4a3e38'], 10, true); },
  cookedChicken(b) {
    b.ellipse(6.5, 9.5, 4.6, 3.8, hex('#8a4a1e'));
    b.ellipse(6, 9, 3.6, 2.8, hex('#c07a3a'));
    b.ellipse(5, 8, 1.6, 1.1, hex('#e8a860'));
    line(b, 9, 7, 12, 4, hex('#efe6cf'));
    line(b, 10, 7, 12, 5, hex('#c9bd9c'));
    b.set(13, 3, hex('#efe6cf')); b.set(12, 3, hex('#efe6cf')); b.set(13, 4, hex('#efe6cf'));
  },
  burntChicken(b) {
    b.ellipse(6.5, 9.5, 4.6, 3.8, hex('#141010'));
    b.ellipse(6, 9, 3.6, 2.8, hex('#2e2420'));
    line(b, 9, 7, 12, 4, hex('#8a8478'));
    b.set(13, 3, hex('#8a8478')); b.set(12, 3, hex('#8a8478'));
  },
  bronzePickaxe(b) { pickaxe(b, 'bronze'); },
  ironPickaxe(b) { pickaxe(b, 'iron'); },
  hammer(b) {
    line(b, 3, 14, 10, 7, WOOD[1]);
    line(b, 4, 14, 10, 8, WOOD[0]);
    const [d, m, l, h] = METAL.iron;
    // a solid head across the top of the handle
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const u = x - y, v = x + y;
      if (u >= 2 && u <= 5 && v >= 12 && v <= 22) b.set(x, y, u === 5 ? h : u === 4 ? l : u === 2 ? d : m);
    }
  },
  copperOre(b) { oreLump(b, [hex('#b8642a'), hex('#e08a44'), hex('#ffc07a')]); },
  tinOre(b) { oreLump(b, [hex('#9aa0a4'), hex('#d4dade'), hex('#ffffff')]); },
  ironOre(b) { oreLump(b, [hex('#6e3a26'), hex('#a85a3a'), hex('#d0886a')]); },
  bronzeBar(b) { ingot(b, 'bronze'); },
  ironBar(b) { ingot(b, 'iron'); },
  ironSword(b) { blade(b, 'iron', 9); },
  ironMedHelm(b) { medHelm(b, 'iron'); },
  bronzeSqShield(b) { sqShield(b, 'bronze'); },
  ironSqShield(b) { sqShield(b, 'iron'); },
  bronzeChainbody(b) { chainbody(b, 'bronze'); },
  ironChainbody(b) { chainbody(b, 'iron'); },
  ironArrow(b) {
    for (const off of [0, 3]) {
      line(b, 3 + off, 13, 11 + off, 5, WOOD[2]);
      const [, m, l] = METAL.iron;
      b.set(12 + off, 4, l); b.set(11 + off, 4, m); b.set(12 + off, 5, m);
      b.set(2 + off, 13, hex('#f4f2e6')); b.set(3 + off, 14, hex('#f4f2e6')); b.set(2 + off, 12, hex('#d8d4c6'));
    }
  },
  ironArrowtips(b) {
    const [d, m, l] = METAL.iron;
    for (const [x, y] of [[4, 10], [9, 11], [7, 6], [11, 5]]) {
      b.set(x, y, l); b.set(x + 1, y, m); b.set(x, y + 1, m); b.set(x + 1, y + 1, d); b.set(x + 2, y - 1, l);
    }
  },
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
  rawBeef(b) {
    b.ellipse(8, 9, 6, 4.2, hex('#b8403a'));
    b.ellipse(7.5, 8.4, 5, 3.2, hex('#d8605a'));
    b.ellipse(10, 8, 2, 1.4, hex('#f4e8e0'));
    b.set(5, 9, hex('#f0a0a0')); b.set(7, 10, hex('#f0a0a0'));
  },
  cookedMeat(b) {
    b.ellipse(8, 9, 6, 4.2, hex('#5e3218'));
    b.ellipse(7.5, 8.4, 5, 3.2, hex('#8a4a22'));
    for (const x of [5, 8, 11]) { b.set(x, 7, hex('#3a1e0e')); b.set(x + 1, 8, hex('#3a1e0e')); }
  },
  burntMeat(b) {
    b.ellipse(8, 9, 6, 4.2, hex('#141010'));
    b.ellipse(7.5, 8.4, 5, 3.2, hex('#2e2420'));
  },
  cowhide(b) {
    const w = hex('#efe8dc'), s = hex('#cfc4b2'), k = hex('#2b2622');
    for (let y = 3; y < 14; y++) for (let x = 2; x < 14; x++) {
      const edge = (x === 2 || x === 13) && (y < 5 || y > 11);
      if (edge) continue;
      const patch = ((x - 5) ** 2 + (y - 6) ** 2 < 5) || ((x - 10) ** 2 + (y - 10) ** 2 < 4);
      b.set(x, y, patch ? k : (x + y) % 5 === 0 ? s : w);
    }
  },
  rawChicken(b) {
    // a raw drumstick: pink meat, a pale bone end
    b.ellipse(6.5, 9.5, 4.6, 3.8, hex('#d77a7a'));
    b.ellipse(6, 9, 3.6, 2.8, hex('#f0a0a0'));
    b.ellipse(5, 8, 1.6, 1.1, hex('#ffd0cc'));
    line(b, 9, 7, 12, 4, hex('#efe6cf'));
    line(b, 10, 7, 12, 5, hex('#c9bd9c'));
    b.set(13, 3, hex('#efe6cf')); b.set(12, 3, hex('#efe6cf')); b.set(13, 4, hex('#efe6cf'));
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
  runeEssence(b) {
    const c = [hex('#6a8aa8'), hex('#a8c8e0'), hex('#d8ecfa'), hex('#ffffff')];
    for (let y = 2; y < 15; y++) for (let x = 3; x < 13; x++) {
      const dx = Math.abs(x + 0.5 - 8), top = 2 + dx * 0.9;
      if (y < top || y > 14 - dx * 0.4) continue;
      b.set(x, y, x < 7 ? c[2] : x > 9 ? c[0] : c[1]);
    }
    b.set(8, 2, c[3]); b.set(6, 6, c[3]); b.set(7, 10, c[3]);
  },
  leather(b) { hideSheet(b, [hex('#7a4a26'), hex('#a8703c'), hex('#c8925a')]); },
  hardLeather(b) { hideSheet(b, [hex('#4a2c16'), hex('#6e4422'), hex('#8a5a32')]); b.set(5, 6, hex('#d8b07a')); b.set(10, 10, hex('#d8b07a')); },
  needle(b) {
    line(b, 3, 13, 12, 3, hex('#c0c8d0'));
    line(b, 4, 13, 12, 4, hex('#7a828b'));
    b.set(12, 2, hex('#7a828b')); b.set(13, 2, hex('#7a828b')); b.set(13, 3, hex('#7a828b'));
    // a loop of thread through the eye
    for (const [x, y] of [[13, 4], [14, 5], [14, 7], [13, 9], [11, 10], [10, 12]]) b.set(x, y, hex('#e8d8b0'));
  },
  thread(b) {
    b.rect(5, 2, 6, 2, WOOD[1]); b.rect(5, 12, 6, 2, WOOD[1]);
    for (let y = 4; y < 12; y++) b.rect(5, y, 6, 1, y % 2 ? hex('#e8d8b0') : hex('#cbb88a'));
    line(b, 11, 6, 14, 10, hex('#e8d8b0'));
  },
  leatherCowl(b) {
    const c = [hex('#4a2c16'), hex('#7a4a26'), hex('#a0703f')];
    b.ellipse(8, 8, 5.5, 6, c[1]);
    b.ellipse(7, 6, 3, 3, c[2]);
    b.ellipse(8, 10, 3, 3.2, hex('#2b1d16'));
    b.rect(3, 12, 10, 2, c[0]);
  },
  leatherVambraces(b) {
    const c = [hex('#4a2c16'), hex('#7a4a26'), hex('#a0703f')];
    for (const ox of [2, 9]) {
      b.rect(ox, 3, 5, 10, c[1]);
      b.rect(ox, 3, 5, 1, c[2]);
      for (const y of [6, 9]) b.rect(ox, y, 5, 1, c[0]);
    }
  },
  leatherChaps(b) {
    const c = [hex('#4a2c16'), hex('#7a4a26'), hex('#a0703f')];
    b.rect(3, 2, 10, 3, c[1]);
    b.rect(3, 2, 10, 1, c[2]);
    b.rect(3, 5, 4, 9, c[1]); b.rect(9, 5, 4, 9, c[1]);
    b.rect(3, 13, 4, 1, c[0]); b.rect(9, 13, 4, 1, c[0]);
    b.rect(7, 2, 2, 1, hex('#c8a030'));
  },
  hardLeatherBody(b) {
    const c = [hex('#2e1a0c'), hex('#5e3b1f'), hex('#7a4f2a')];
    for (let y = 3; y < 14; y++) for (let x = 2; x < 14; x++) {
      const torso = x >= 4 && x <= 11;
      const sleeve = y < 8 && (x < 4 || x > 11);
      if (!torso && !sleeve) continue;
      if (y === 3 && x > 6 && x < 9) continue;
      b.set(x, y, x === 8 || y === 7 || y === 11 ? c[0] : (x + y) % 4 === 0 ? c[2] : c[1]);
    }
    for (const [x, y] of [[5, 5], [10, 5], [5, 9], [10, 9]]) b.set(x, y, hex('#c8a030'));
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

// New metal pieces without a drawing of their own fall back to the nearest one.
for (const m of ['bronze', 'iron']) {
  const like = { FullHelm: 'MedHelm', Platebody: 'Chainbody', Kiteshield: 'SqShield', Scimitar: 'Sword', Longsword: 'Sword', Mace: 'Pickaxe', Battleaxe: 'Axe' };
  for (const [part, base] of Object.entries(like)) DRAW[`${m}${part}`] ||= (b) => DRAW[`${m}${base}`](b);
  DRAW[`${m}Platelegs`] ||= (b) => {
    DRAW.leatherChaps(b);
    const tint = m === 'iron' ? [0.62, 0.68, 0.78] : [1.25, 0.95, 0.6];
    for (let i = 0; i < b.data.length; i += 4) if (b.data[i + 3]) for (let c = 0; c < 3; c++) b.data[i + c] = Math.min(255, b.data[i + c] * tint[c] + (m === 'iron' ? 40 : 10));
  };
}

// Steel: the iron drawing, lighter. Coal: the iron ore drawing, in black.
const recolour = (base, fn) => (b) => {
  DRAW[base](b);
  for (let i = 0; i < b.data.length; i += 4) if (b.data[i + 3]) fn(b.data, i);
};
for (const part of ['Dagger', 'Axe', 'Pickaxe', 'Mace', 'MedHelm', 'Sword', 'Scimitar', 'Longsword', 'FullHelm', 'SqShield',
  'Battleaxe', 'Chainbody', 'Kiteshield', 'Platelegs', 'Platebody', 'Arrowtips', 'Arrow', 'Bar']) {
  DRAW[`steel${part}`] ||= recolour(`iron${part}`, (d, i) => {
    const grey = Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]) < 40;
    if (grey) for (let c = 0; c < 3; c++) d[i + c] = Math.min(255, d[i + c] * 1.15 + 18);
  });
}
for (const part of ['Dagger', 'Axe', 'Pickaxe', 'Mace', 'MedHelm', 'Sword', 'Scimitar', 'Longsword', 'FullHelm', 'SqShield',
  'Battleaxe', 'Chainbody', 'Kiteshield', 'Platelegs', 'Platebody', 'Arrowtips', 'Arrow', 'Bar', 'Ore']) {
  DRAW[`mithril${part}`] ||= recolour(`iron${part}`, (d, i) => {
    const grey = Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]) < 40 || part === 'Ore';
    if (grey) { const l = (d[i] + d[i + 1] + d[i + 2]) / 765; d[i] = 26 + 150 * l; d[i + 1] = 34 + 170 * l; d[i + 2] = 80 + 175 * l; }
  });
}
for (const [metal, [r0, g0, b0, kr, kg, kb]] of Object.entries({ adamant: [18, 48, 24, 140, 190, 140], rune: [14, 42, 58, 160, 220, 200] })) {
  for (const part of ['Dagger', 'Axe', 'Pickaxe', 'Mace', 'MedHelm', 'Sword', 'Scimitar', 'Longsword', 'FullHelm', 'SqShield',
    'Battleaxe', 'Chainbody', 'Kiteshield', 'Platelegs', 'Platebody', 'Arrowtips', 'Arrow', 'Bar']) {
    DRAW[`${metal}${part}`] ||= recolour(`iron${part}`, (d, i) => {
      if (Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]) >= 40) return;
      const l = (d[i] + d[i + 1] + d[i + 2]) / 765; d[i] = r0 + kr * l; d[i + 1] = g0 + kg * l; d[i + 2] = b0 + kb * l;
    });
  }
}
DRAW.adamantiteOre ||= (b) => DRAW.adamantBar(b);
DRAW.runiteOre ||= (b) => DRAW.runeBar(b);
DRAW.coal ||= recolour('ironOre', (d, i) => { const l = (d[i] + d[i + 1] + d[i + 2]) / 3; d[i] = d[i + 1] = l * 0.3; d[i + 2] = l * 0.36; });

// Silver, gold, gems and jewellery, drawn simply (the painted art covers them normally).
const GEM_COL = { sapphire: ['#14205e', '#2a48b8', '#8fb4ff'], emerald: ['#0b3f22', '#1c8a4c', '#7ef0a8'], ruby: ['#4e0814', '#a8182e', '#ff8a9a'], diamond: ['#5e6e80', '#c4dcee', '#ffffff'] };
const METAL_COL = { silver: ['#4e545c', '#b4bec8', '#ffffff'], gold: ['#6e420c', '#e0ac34', '#fff3b8'] };
const gemAt = (b, cx, cy, r, gem) => {
  const [d, m, l] = GEM_COL[gem].map(hex);
  for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (Math.abs(x) + Math.abs(y) <= r) b.set(cx + x, cy + y, y < 0 ? (x < 0 ? l : m) : d);
};
const toMetal = (base, metal) => recolour(base, (d, i) => {
  const l = (d[i] + d[i + 1] + d[i + 2]) / 765; const [a, m, h] = METAL_COL[metal].map(hex);
  const c = l < 0.35 ? a : l < 0.7 ? m : h; d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2];
});
DRAW.silverOre ||= toMetal('tinOre', 'silver');
DRAW.goldOre ||= toMetal('copperOre', 'gold');
DRAW.silverBar ||= toMetal('ironBar', 'silver');
DRAW.goldBar ||= toMetal('bronzeBar', 'gold');
DRAW.chisel ||= (b) => { line(b, 3, 13, 8, 8, WOOD[1]); line(b, 4, 13, 8, 9, WOOD[0]); line(b, 9, 7, 13, 3, hex('#c0c8d0')); b.set(13, 2, hex('#ffffff')); };
DRAW.ringMould ||= (b) => { b.rect(2, 4, 12, 9, hex('#c8a878')); b.ellipse(8, 8.5, 3, 3, hex('#6a5232')); b.ellipse(8, 8.5, 1.4, 1.4, hex('#c8a878')); };
DRAW.amuletMould ||= (b) => { b.rect(2, 4, 12, 9, hex('#c8a878')); b.ellipse(8, 9.5, 2.6, 2.6, hex('#6a5232')); line(b, 5, 5, 8, 8, hex('#6a5232')); line(b, 11, 5, 8, 8, hex('#6a5232')); };
for (const gem of Object.keys(GEM_COL)) {
  const cap = gem[0].toUpperCase() + gem.slice(1);
  DRAW[gem] ||= (b) => gemAt(b, 8, 8, 5, gem);
  DRAW[`uncut${cap}`] ||= recolour('tinOre', (d, i) => { const l = (d[i] + d[i + 1] + d[i + 2]) / 765; const [a, m, h] = GEM_COL[gem].map(hex); const c = l < 0.4 ? a : l < 0.7 ? m : h; d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; });
}
for (const metal of ['silver', 'gold']) {
  const [a, m, h] = METAL_COL[metal].map(hex);
  for (const gem of [null, ...Object.keys(GEM_COL)]) {
    const cap = gem ? gem[0].toUpperCase() + gem.slice(1) : '';
    DRAW[`${metal}${cap}Ring`] ||= (b) => { b.ellipse(8, 10, 5, 3.6, m); b.ellipse(8, 10, 3, 1.8, [0, 0, 0]); for (let i = 0; i < b.data.length; i += 4) if (!b.data[i] && !b.data[i + 1] && !b.data[i + 2]) b.data[i + 3] = 0; b.set(5, 8, h); if (gem) gemAt(b, 8, 5, 2, gem); };
    DRAW[`${metal}${cap}Amulet`] ||= (b) => { line(b, 3, 2, 8, 8, a); line(b, 13, 2, 8, 8, a); b.ellipse(8, 11, 3.4, 3.4, m); b.set(7, 10, h); if (gem) gemAt(b, 8, 11, 2, gem); };
  }
}

// Batch F pieces, drawn from the nearest existing drawing.
{
  const TONES = { bronze: ['#6e4320', '#c07a38', '#f2c48a'], iron: ['#4a4f56', '#9aa2aa', '#e2e8ec'], steel: ['#5e666e', '#c4ccd2', '#ffffff'], mithril: ['#1e2850', '#4a5a9a', '#a8b8f4'], adamant: ['#123018', '#4e8a50', '#a8d8a0'], rune: ['#0e2a3a', '#3aa0c0', '#b0f0ff'] };
  for (const [m, tones] of Object.entries(TONES)) {
    const [d0, m0, l0] = tones.map(hex);
    const inMetal = (base) => recolour(base, (d, i) => { const l = (d[i] + d[i + 1] + d[i + 2]) / 765; const c = l < 0.35 ? d0 : l < 0.65 ? m0 : l0; d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; });
    DRAW[`${m}Boots`] ||= inMetal('leatherBoots');
    DRAW[`${m}Gauntlets`] ||= inMetal('leatherGloves');
    const like = { Spear: 'Sword', Warhammer: 'Mace', '2hSword': 'Sword', Dart: 'Arrowtips', DartTip: 'Arrowtips', JavelinHeads: 'Arrowtips', ThrowingKnife: 'Dagger', Javelin: 'Arrow' };
    for (const [part, base] of Object.entries(like)) DRAW[`${m}${part}`] ||= (b) => (DRAW[`${m}${base}`] || DRAW[`iron${base}`])(b);
  }
  DRAW.steelStuds ||= (b) => { for (const [x, y] of [[5, 5], [10, 4], [6, 10], [11, 10], [8, 7]]) { b.ellipse(x, y, 1.8, 1.8, hex('#9aa2aa')); b.set(x - 1, y - 1, hex('#ffffff')); } };
  DRAW.studdedBody ||= (b) => { DRAW.leatherBody(b); for (let y = 5; y < 13; y += 3) for (let x = 5; x < 12; x += 3) if (b.alpha(x, y)) b.set(x, y, hex('#e2e8ec')); };
  DRAW.studdedChaps ||= (b) => { DRAW.leatherChaps(b); for (let y = 4; y < 13; y += 3) for (const x of [5, 10]) if (b.alpha(x, y)) b.set(x, y, hex('#e2e8ec')); };
}

// Batch G items, from the nearest drawing (the painted art covers them normally).
DRAW.stardust ||= (b) => { b.ellipse(8, 11, 5.5, 3, hex('#c8a040')); b.ellipse(8, 10, 3.5, 2, hex('#ffe890')); b.set(5, 5, hex('#ffffff')); b.set(11, 4, hex('#ffffff')); };
DRAW.coalBag ||= (b) => { DRAW.bag(b); b.ellipse(11, 4, 2.5, 2, hex('#2a2830')); };
DRAW.gemBag ||= (b) => { DRAW.bag(b); b.ellipse(11, 4, 2, 2, hex('#5f8cf4')); };
DRAW.prospectorHelmet ||= (b) => DRAW.bronzeMedHelm(b);
DRAW.prospectorJacket ||= (b) => DRAW.leatherBody(b);
DRAW.prospectorLegs ||= (b) => DRAW.leatherChaps(b);
DRAW.prospectorBoots ||= (b) => DRAW.leatherBoots(b);

// Batch H items, from the nearest drawing.
DRAW.emberCore ||= (b) => { DRAW.ironOre(b); for (let i = 0; i < b.data.length; i += 4) if (b.data[i + 3]) { const l = (b.data[i] + b.data[i + 1] + b.data[i + 2]) / 765; b.data[i] = 120 + 135 * l; b.data[i + 1] = 40 + 160 * l; b.data[i + 2] = 10 + 60 * l; } };
DRAW.smithsTunic ||= (b) => DRAW.leatherBody(b);
DRAW.smithsTrousers ||= (b) => DRAW.leatherChaps(b);
DRAW.smithsGloves ||= (b) => DRAW.leatherGloves(b);
DRAW.smithsBoots ||= (b) => DRAW.leatherBoots(b);

// Hard leather pieces: the leather drawing in darker, redder leather.
for (const part of ['Gloves', 'Boots', 'Cowl', 'Chaps']) {
  DRAW[`hardLeather${part}`] = (b) => {
    DRAW[`leather${part}`](b);
    const d = b.data;
    for (let i = 0; i < d.length; i += 4) {
      if (!d[i + 3] || (d[i] > 180 && d[i + 1] > 140)) continue; // keep brass bright
      d[i] = d[i] * 0.78; d[i + 1] = d[i + 1] * 0.66; d[i + 2] = d[i + 2] * 0.7;
    }
  };
}

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

// Painted icon for an item, if the art atlas has one: the 32 px picture for
// menus and the bag, the 16 px one for things lying on the ground. Potions
// share one picture per kind, with a dot for each dose left.
function paintedIcon(id) {
  const pm = /^(attack|strength|defence)Potion(\d)$/.exec(id);
  const key = pm ? `${pm[1]}Potion` : id;
  const big = art('icon:' + key)?.[0], small = art('iconS:' + key)?.[0];
  if (!big || !small) return null;
  let bigImg = big.img;
  if (pm) {
    const c = document.createElement('canvas');
    c.width = big.w; c.height = big.h;
    const g = c.getContext('2d');
    g.drawImage(big.img, 0, 0);
    for (let k = 0; k < Number(pm[2]); k++) {
      g.fillStyle = '#2b1d16'; g.fillRect(2 + k * 5, big.h - 5, 4, 4);
      g.fillStyle = '#ffe9a8'; g.fillRect(3 + k * 5, big.h - 4, 2, 2);
    }
    bigImg = c;
  }
  return { img: small.img, url: bigImg.toDataURL('image/png') };
}

export function itemIcon(id) {
  if (cache.has(id)) return cache.get(id);
  const painted = ITEMS[id]?.noted ? null : paintedIcon(id);
  if (painted) { cache.set(id, painted); return painted; }
  const b = new Bitmap(16, 16);
  // Bank notes: a slip of paper with the real item drawn small on it.
  const real = ITEMS[id]?.noted;
  if (real) {
    const n = new Bitmap(16, 16);
    n.rect(2, 1, 12, 14, hex('#f4ecd6'));
    n.rect(2, 1, 12, 1, hex('#fffaf0'));
    n.rect(11, 1, 3, 3, hex('#d8ccb0')); // folded corner
    n.rect(4, 12, 6, 1, hex('#b8a888'));
    n.outline();
    const c = n.toCanvas();
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.drawImage(itemIcon(real).img, 3, 2, 10, 10);
    const out = { img: c, url: c.toDataURL('image/png') };
    cache.set(id, out);
    return out;
  }
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

