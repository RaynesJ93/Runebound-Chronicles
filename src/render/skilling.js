import { art } from './art.js';
import { TILE } from './pixel.js';
import { iconUrl } from './icons.js';

// Skilling animations, drawn over the player while they work: an axe or pickaxe
// swinging with chips flying, a rod and bobbing float, a net dipping in, a pan
// over the fire, a hammer on the anvil, a knife whittling. They loop for as long
// as the activity lasts, so it's always clear what you're doing.
//
// sk: { anim, skill, target: {x, y} | null, since, metal, fly }
// p:  the player's drawable ({ fx, fy } = feet, in world pixels), facing (radians)

const METAL = {
  bronze: ['#6e4320', '#a8692e', '#d4934f', '#f2c48a'],
  iron: ['#4a4f56', '#7a828b', '#a8b0b8', '#dfe5ea'],
  steel: ['#5e666e', '#959ea6', '#c4ccd2', '#f2f6f8'],
  mithril: ['#1e2850', '#3a4a8a', '#6a7ed0', '#b8c8ff'],
};
const WOOD = ['#4a2c16', '#7a4a26', '#a0703f'];

// How long one loop of each animation takes, in seconds.
const PERIOD = { runecraft: 1.2, tan: 1.1, sew: 1.2, chop: 0.9, mine: 1.0, smith: 0.8, fletch: 0.7, net: 2.2, rod: 3, cook: 1.4, smelt: 1.2 };

const ease = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;
const hash = (n) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };

function px(ctx, x, y, c, w = 1, h = 1) {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}
// A two-pixel-thick handle: a light edge and a dark edge.
function handle(ctx, x0, y0, x1, y1, light = WOOD[2], dark = WOOD[0]) {
  seg(ctx, x0, y0 + 1, x1, y1 + 1, dark);
  seg(ctx, x0, y0, x1, y1, light);
}
function seg(ctx, x0, y0, x1, y1, c) {
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
  ctx.fillStyle = c;
  for (let i = 0; i <= n; i++) ctx.fillRect(Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), 1, 1);
}

// Where the hands are and which way we're aiming.
function aim(sk, p) {
  const fx = p.fx, fy = p.fy;
  let tx, ty;
  if (sk.target) { tx = (sk.target.x + 0.5) * TILE; ty = (sk.target.y + 0.5) * TILE; }
  else { tx = fx + Math.sin(p.facing) * 12; ty = fy - 9 + Math.cos(p.facing) * 12; }
  // Working on something straight above or below: hold the tool out to the
  // side, so it swings beside you rather than across your body.
  const vertical = Math.abs(tx - fx) < 6;
  const right = vertical || tx >= fx;
  const hx = fx + (vertical ? 6 : right ? 5 : -5);
  const hy = fy - 10;
  return { hx, hy, tx, ty, ang: Math.atan2(ty - hy, tx - hx), right, above: vertical && ty < fy - 10 };
}

// The swing of a tool: raised back over the shoulder, then a quick strike.
// Returns the tool angle and whether this instant is the moment of impact.
function swing(sk, a, phase) {
  // Normally the tool comes up and back over your shoulder. For something
  // straight above you, it swings out to the side and strikes upwards.
  const raise = a.above ? 1 : a.right ? -1 : 1;
  const top = a.above ? 1.3 : 2.0;
  let off;
  if (phase < 0.6) off = lerp(0.25, top, ease(phase / 0.6));
  else if (phase < 0.72) off = lerp(top, -0.15, (phase - 0.6) / 0.12);
  else off = lerp(-0.15, 0.25, (phase - 0.72) / 0.28);
  return { angle: a.ang + raise * off, hit: phase >= 0.72 && phase < 0.95, after: (phase - 0.72) / 0.23 };
}

// Little bits flying from the point of impact, falling with gravity.
function chips(ctx, x, y, t, cycle, colours, n = 5, spread = 1) {
  for (let k = 0; k < n; k++) {
    const r1 = hash(cycle * 13 + k), r2 = hash(cycle * 7 + k * 3);
    const ang = -Math.PI / 2 + (r1 - 0.5) * 2.4 * spread;
    const v = 5 + r2 * 6;
    const cx = x + Math.cos(ang) * v * t;
    const cy = y + Math.sin(ang) * v * t + 9 * t * t;
    ctx.globalAlpha = 1 - t * 0.7;
    px(ctx, cx, cy, colours[k % colours.length]);
  }
  ctx.globalAlpha = 1;
}

const TOOL = 13; // handle length in world pixels (a character is 16 x 24)

// A painted tool from the art atlas, turned to `angle` around its grip.
// Returns false if there isn't one, so the drawn tool is used instead.
function paintedTool(ctx, key, hx, hy, angle) {
  const spr = art('tool:' + key)?.[0];
  if (!spr) return false;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(Math.round(hx), Math.round(hy));
  ctx.rotate(angle);
  // keep the blade on the outside of the swing when it points left
  if (Math.cos(angle) < 0) ctx.scale(1, -1);
  ctx.drawImage(spr.img, -spr.ax, -spr.ay);
  ctx.restore();
  return true;
}

function drawAxe(ctx, hx, hy, angle, metal) {
  if ((paintedTool(ctx, `${metal}Axe`, hx, hy, angle) || paintedTool(ctx, 'bronzeAxe', hx, hy, angle))) return;
  const [d, m, l, h] = METAL[metal] || METAL.bronze;
  const cx = Math.cos(angle), cy = Math.sin(angle);
  const ex = hx + cx * TOOL, ey = hy + cy * TOOL;
  handle(ctx, hx, hy, ex, ey);
  // the blade: a wedge on one side of the handle's end, sharp edge outermost
  const nx = -cy, ny = cx;
  for (let j = 0; j < 5; j++) {          // along the handle
    for (let k = 1; k <= 5; k++) {       // out from the handle
      if (k === 5 && (j === 0 || j === 4)) continue;
      const bx = ex - cx * j + nx * k, by = ey - cy * j + ny * k;
      px(ctx, bx, by, k >= 5 ? h : k === 4 ? l : k === 1 ? d : m, 2, 2);
    }
  }
}

function drawPickaxe(ctx, hx, hy, angle, metal) {
  if ((paintedTool(ctx, `${metal}Pickaxe`, hx, hy, angle) || paintedTool(ctx, 'bronzePickaxe', hx, hy, angle))) return;
  const [d, m, l, h] = METAL[metal] || METAL.bronze;
  const cx = Math.cos(angle), cy = Math.sin(angle);
  const ex = hx + cx * TOOL, ey = hy + cy * TOOL;
  handle(ctx, hx, hy, ex, ey);
  // the head: a curved bar across the end, pointed at both tips
  const nx = -cy, ny = cx;
  for (let k = -7; k <= 7; k++) {
    const bend = (49 - k * k) * 0.06;
    const bx = ex + nx * k + cx * bend * 0.6, by = ey + ny * k + cy * bend * 0.6;
    const tip = Math.abs(k) >= 6;
    px(ctx, bx, by, tip ? h : Math.abs(k) <= 1 ? d : m, tip ? 1 : 2, tip ? 1 : 2);
  }
  px(ctx, ex, ey, l, 2, 2);
}

function drawHammer(ctx, hx, hy, angle, metal) {
  if (paintedTool(ctx, 'hammer', hx, hy, angle)) return;
  const [d, m, l, h] = METAL.iron;
  const cx = Math.cos(angle), cy = Math.sin(angle);
  const ex = hx + cx * 10, ey = hy + cy * 10;
  handle(ctx, hx, hy, ex, ey);
  // a chunky block head across the end
  const nx = -cy, ny = cx;
  for (let k = -3; k <= 3; k++) for (let j = 0; j < 3; j++) px(ctx, ex + nx * k - cx * j, ey + ny * k - cy * j, j === 0 ? h : Math.abs(k) === 3 ? d : j === 1 ? l : m, 2, 2);
}

// Expanding rings on the water.
function ripple(ctx, x, y, t) {
  const r = 1 + t * 5;
  ctx.globalAlpha = Math.max(0, 0.9 - t);
  for (let a = 0; a < 16; a++) {
    if (a % 4 === 3) continue;
    const th = (a / 16) * Math.PI * 2;
    px(ctx, x + Math.cos(th) * r, y + Math.sin(th) * r * 0.5, '#e8f6ff');
  }
  ctx.globalAlpha = 1;
}

// A puff of steam or smoke: a soft blob that rises, grows and fades.
function puff(ctx, x, y, t, colour) {
  ctx.globalAlpha = Math.max(0, 0.55 * (1 - t));
  const r = 1 + t * 2.5;
  ctx.fillStyle = colour;
  ctx.fillRect(Math.round(x - r), Math.round(y - r), Math.round(r * 2), Math.round(r * 2));
  ctx.globalAlpha = 1;
}

// A gentle lean towards what you're hitting, at the moment of impact.
export function skillLean(sk, time, p) {
  if (!sk || !['chop', 'mine', 'smith'].includes(sk.anim)) return { x: 0, y: 0 };
  const phase = ((time - sk.since) % PERIOD[sk.anim]) / PERIOD[sk.anim];
  if (phase < 0.62 || phase > 0.85) return { x: 0, y: 0 };
  const a = aim(sk, p);
  return { x: Math.round(Math.cos(a.ang)), y: Math.round(Math.sin(a.ang)) };
}

// The tool, effects and the little icon over your head.
export function drawSkilling(ctx, sk, p, time) {
  if (!sk) return;
  const T = time - sk.since;
  const period = PERIOD[sk.anim] || 1;
  const phase = (T % period) / period;
  const cycle = Math.floor(T / period);
  const a = aim(sk, p);

  switch (sk.anim) {
    case 'chop':
    case 'mine': {
      const s = swing(sk, a, phase);
      (sk.anim === 'chop' ? drawAxe : drawPickaxe)(ctx, a.hx, a.hy, s.angle, sk.metal);
      if (s.hit) {
        // where the tool meets the tree trunk or the rock
        const cx = lerp(a.hx, a.tx, 0.7), cy = lerp(a.hy, a.ty, 0.7) - 2;
        if (sk.anim === 'chop') chips(ctx, cx, cy, s.after, cycle, ['#c49a5c', '#e8c890', '#8a5a32']);
        else {
          chips(ctx, cx, cy, s.after, cycle, ['#9e988e', '#7d7870', '#cbc7bd'], 4);
          if (s.after < 0.35) { px(ctx, cx - 1, cy - 1, '#fff6cf'); px(ctx, cx + 1, cy, '#ffe08a'); }
        }
      }
      break;
    }
    case 'smith': {
      const s = swing(sk, a, phase);
      drawHammer(ctx, a.hx, a.hy, s.angle, sk.metal);
      if (s.hit) {
        const cx = lerp(a.hx, a.tx, 0.75), cy = lerp(a.hy, a.ty, 0.75) - 3;
        chips(ctx, cx, cy, s.after, cycle, ['#fff6cf', '#ffe08a', '#ffb347'], 6, 1.3);
      }
      break;
    }
    case 'rod': {
      // rod held out over the water, swaying a little; a float bobbing on the line
      const lift = -0.75 + Math.sin(T * 1.7) * 0.06;
      const ra = a.ang + (a.right ? lift : -lift);
      const rx = a.hx + Math.cos(ra) * 16, ry = a.hy + Math.sin(ra) * 16;
      const mid = 0.55;
      handle(ctx, a.hx, a.hy, lerp(a.hx, rx, mid), lerp(a.hy, ry, mid), sk.fly ? '#8a5a32' : WOOD[2], sk.fly ? '#3a2410' : WOOD[0]);
      seg(ctx, lerp(a.hx, rx, mid), lerp(a.hy, ry, mid), rx, ry, sk.fly ? '#5e3b1f' : WOOD[1]);
      px(ctx, a.hx + Math.cos(ra) * 3 - 1, a.hy + Math.sin(ra) * 3, '#7a828b', 2, 2); // the reel
      const bob = Math.sin(T * 3.2) > 0.85 ? 1 : 0; // a nibble now and then
      const fx = a.tx, fy = a.ty + bob;
      // the line sags slightly between the tip and the float
      for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        px(ctx, lerp(rx, fx, t), lerp(ry, fy, t) + Math.sin(t * Math.PI) * 2.5, 'rgba(240,240,240,0.85)');
      }
      px(ctx, fx - 1, fy - 2, sk.fly ? '#f2c94a' : '#d63a2a', 3, 2);
      px(ctx, fx - 1, fy, '#ffffff', 3, 1);
      ripple(ctx, fx, fy + 1, (T % 1.6) / 1.6);
      break;
    }
    case 'net': {
      // a net on a short pole, dipped into the water and lifted out again
      const dip = phase < 0.5 ? ease(phase / 0.5) : 1 - ease((phase - 0.5) / 0.5);
      const reach = lerp(9, 16, dip);
      const na = a.ang + (a.right ? -0.5 : 0.5) * (1 - dip);
      const ex = a.hx + Math.cos(na) * reach, ey = a.hy + Math.sin(na) * reach;
      const netArt = art('tool:net');
      if (netArt) {
        const spr = netArt[Math.min(2, Math.floor(dip * 3))];
        ctx.save(); ctx.translate(Math.round(a.hx), Math.round(a.hy)); if (!a.right) ctx.scale(-1, 1);
        ctx.drawImage(spr.img, -spr.ax, -spr.ay + Math.round(dip * 4)); ctx.restore();
        if (dip > 0.85) chips(ctx, ex, ey + 2, (phase - 0.4) * 3 % 1, cycle, ['#e8f6ff', '#a8d8f5'], 4, 0.8);
        ripple(ctx, a.tx, a.ty + 1, (T % 1.8) / 1.8);
        break;
      }
      handle(ctx, a.hx, a.hy, ex, ey);
      // the net: a hoop with a mesh bag hanging from it
      for (let k = -4; k <= 4; k++) px(ctx, ex + k, ey - 1, WOOD[0]);
      for (let j = 0; j < 5; j++) for (let k = -4 + j; k <= 4 - j; k++) if ((k + j) % 2 === 0) px(ctx, ex + k, ey + j, j % 2 ? '#a8905a' : '#e8d8a8');
      if (dip > 0.85) chips(ctx, ex, ey + 2, (phase - 0.4) * 3 % 1, cycle, ['#e8f6ff', '#a8d8f5'], 4, 0.8);
      ripple(ctx, a.tx, a.ty + 1, (T % 1.8) / 1.8);
      break;
    }
    case 'cook': {
      // a pan held over the fire, given a little shake; steam rising
      const shake = Math.sin(T * 9) * 0.6;
      const ex = lerp(a.hx, a.tx, 0.55) + shake, ey = lerp(a.hy, a.ty, 0.55) - 4;
      const pan = art('tool:pan');
      if (pan) {
        const spr = pan[Math.floor(T * 4) % pan.length];
        ctx.save(); ctx.translate(Math.round(ex), Math.round(ey + 2)); if (!a.right) ctx.scale(-1, 1);
        ctx.drawImage(spr.img, -Math.round(spr.w / 2), -spr.h + 2); ctx.restore();
        break;
      }
      handle(ctx, a.hx, a.hy, ex, ey, '#6e767e', '#2e3236');
      ctx.fillStyle = '#2e3236'; ctx.fillRect(Math.round(ex - 5), Math.round(ey - 1), 10, 3);
      ctx.fillStyle = '#4c5258'; ctx.fillRect(Math.round(ex - 4), Math.round(ey - 1), 8, 1);
      px(ctx, ex - 2, ey - 2, '#e8a860', 2, 1); px(ctx, ex + 1, ey - 2, '#c07a3a', 2, 1);
      for (let k = 0; k < 3; k++) {
        const t = ((T + k * 0.45) % 1.4) / 1.4;
        puff(ctx, ex - 2 + k * 2 + Math.sin(T * 2 + k) * 1.5, ey - 3 - t * 10, t, '#f4f2e6');
      }
      break;
    }
    case 'smelt': {
      // working the furnace: embers and smoke rising from its mouth
      const mx = a.tx, my = a.ty - 4;
      for (let k = 0; k < 8; k++) {
        const t = ((T * 0.9 + k * 0.137) % 1);
        const x = mx + (hash(k + Math.floor(T * 0.9 + k * 0.137) * 5) - 0.5) * 8;
        ctx.globalAlpha = Math.min(1, 1.6 - t * 1.5);
        px(ctx, x + Math.sin(T * 3 + k) * 1.5, my - t * 18, k % 3 ? '#ffb347' : '#fff1b0', 2, 2);
      }
      // the fire's glow pulsing in the furnace mouth
      ctx.globalAlpha = 0.35 + Math.sin(T * 6) * 0.15;
      px(ctx, mx - 3, my + 1, '#ffd060', 6, 3);
      ctx.globalAlpha = 1;
      for (let k = 0; k < 2; k++) {
        const t = ((T + k * 0.6) % 1.2) / 1.2;
        puff(ctx, mx, my - 14 - t * 10, t, '#8a8580');
      }
      // and the bar in your hands, glowing
      px(ctx, a.hx - 1, a.hy, '#ff9a3a', 3, 2);
      px(ctx, a.hx, a.hy, '#ffe08a');
      break;
    }
    case 'runecraft': {
      // streams of rune-coloured light flow from your hands into the altar,
      // then burst upwards from it
      const [hi, mid, deep] = sk.colour || ['#ffffff', '#cfe8ff', '#9ec8f0'];
      const sx = p.fx, sy = p.fy - 12;
      const ax = a.tx, ay = a.ty - 10;
      for (let k = 0; k < 10; k++) {
        const t = ((T * 1.4 + k / 10) % 1);
        const wob = Math.sin(t * Math.PI * 2 + k) * 3;
        ctx.globalAlpha = Math.sin(t * Math.PI);
        px(ctx, lerp(sx, ax, t) + wob * 0.4, lerp(sy, ay, t) - Math.sin(t * Math.PI) * 8 + wob * 0.3, k % 3 ? mid : hi, 2, 2);
      }
      ctx.globalAlpha = 1;
      // the burst at the altar
      const b = (T % 0.6) / 0.6;
      for (let k = 0; k < 8; k++) {
        const ang = (k / 8) * Math.PI * 2 + T;
        ctx.globalAlpha = 1 - b;
        px(ctx, ax + Math.cos(ang) * b * 9, ay + Math.sin(ang) * b * 5 - b * 6, k % 2 ? deep : hi, 2, 2);
      }
      ctx.globalAlpha = 1;
      // a glow in your raised hands
      px(ctx, sx - 2, sy - 1, hi, 4, 3);
      px(ctx, sx - 1, sy, mid, 2, 1);
      break;
    }
    case 'tan': {
      // scraping the hide on the rack in long strokes; flecks fall away
      const k = Math.sin(phase * Math.PI * 2);
      const ex = lerp(a.hx, a.tx, 0.6), ey = lerp(a.hy, a.ty, 0.6) - 6 + k * 4;
      handle(ctx, a.hx, a.hy, ex, ey);
      px(ctx, ex - 2, ey - 1, '#a8b0b8', 5, 2); // the scraper's blade
      px(ctx, ex - 2, ey - 1, '#dfe5ea', 5, 1);
      const t = (phase * 2) % 1;
      chips(ctx, ex, ey + 1, t, cycle * 2 + (phase > 0.5 ? 1 : 0), ['#d0a070', '#8a5a32'], 3, 0.5);
      break;
    }
    case 'sew': {
      // a piece of leather held up; the needle goes in and out, trailing thread
      const cx = p.fx, cy = p.fy - 9;
      ctx.fillStyle = '#7a4a26'; ctx.fillRect(Math.round(cx - 5), Math.round(cy - 2), 10, 5);
      ctx.fillStyle = '#a8703c'; ctx.fillRect(Math.round(cx - 5), Math.round(cy - 2), 10, 1);
      for (let s = -4; s <= 2; s += 2) px(ctx, cx + s, cy + 1, '#e8d8b0'); // stitches so far
      const pull = Math.sin(phase * Math.PI * 2);
      const nx = cx + 3 + pull * 3, ny = cy - 3 - Math.max(0, pull) * 5;
      seg(ctx, cx + 2, cy + 1, nx, ny, '#e8d8b0'); // thread
      seg(ctx, nx, ny, nx + 2, ny - 3, '#dfe5ea'); // needle
      break;
    }
    case 'fletch': {
      // a knife whittling a stick held in front of you; shavings fall
      const k = Math.sin(phase * Math.PI * 2);
      const cx = p.fx, cy = p.fy - 8;
      handle(ctx, cx - 6, cy + 2, cx + 5, cy - 3);
      handle(ctx, cx + 1 + k * 3, cy - 3, cx + 6 + k * 3, cy - 6, '#dfe5ea', '#7a828b');
      px(ctx, cx + k * 3, cy - 2, WOOD[0], 2, 2);
      const t = (phase + 0.5) % 1;
      chips(ctx, cx + 2, cy - 1, t, cycle, ['#e8c890', '#c49a5c'], 3, 0.6);
      break;
    }
    default: break;
  }

  // The skill's icon floating over your head.
  const small = art('skillS:' + sk.skill)?.[0];
  const img = small ? small.img : icon(sk.skill);
  if (img && (small || img.complete)) {
    ctx.globalAlpha = 0.9;
    ctx.drawImage(img, Math.round(p.fx - 7), Math.round(p.fy - 42 + Math.sin(time * 3) * 1.5), 14, 14); // painted icons are bigger: keep it small
    ctx.globalAlpha = 1;
  }
}

const icons = new Map();
function icon(skill) {
  if (!icons.has(skill)) {
    const img = new Image();
    img.src = iconUrl(skill);
    icons.set(skill, img);
  }
  return icons.get(skill);
}
