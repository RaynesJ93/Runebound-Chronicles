// Gear that walks with you (v0.57.0).
//
// Painted gear (helmets, armour, weapons...) is drawn once per facing, over
// the standing pose. The painted player has two walking frames per facing
// where the legs spread, the arms swing and the body sways, so gear drawn in
// the standing pose stayed still while the body moved under it.
//
// This bends each gear sprite to fit a walking frame, by comparing the body's
// outline in that frame with the standing one, row by row:
// - body armour is stretched row by row from where the body is in the
//   standing pose to where it is in the walking frame; on the legs and feet
//   each half follows its own leg instead; both are trimmed to the walking
//   body's outline (so chaps don't fill the gap between legs);
// - helmets and amulets move with the head;
// - weapons, shields and capes move as one piece with the torso.
// The results are cached, so each gear piece is bent once per frame.
//
// The pixel work is in plain functions over { w, h, ax, ay, data } images so
// it can be tested without a browser (tests/gear_walk.test.mjs).

const WARP = new Set(['body', 'legs', 'feet']);
const WITH_HEAD = new Set(['head', 'neck']);
// Rows are measured from the feet (anchor) upwards: -1 is the bottom row.
const LEG_TOP = -5;        // rows -5..-1 are the legs and feet
const TORSO = [-14, -7];   // the torso, for rigid gear
const HEAD = [-21, -16];   // the head, for helmets

const alphaAt = (im, x, y) => (x < 0 || y < 0 || x >= im.w || y >= im.h ? 0 : im.data[(y * im.w + x) * 4 + 3]);

// The body's left and right edge on each row, keyed by row-from-feet.
export function outline(im) {
  const rows = new Map();
  for (let y = 0; y < im.h; y++) {
    let L = null, R = null;
    for (let x = 0; x < im.w; x++) if (alphaAt(im, x, y) > 0) { if (L === null) L = x; R = x; }
    if (L !== null) rows.set(y - im.ay, [L - im.ax, R - im.ax]);
  }
  return rows;
}

const mid = (o, r) => { const e = o.get(r); return e ? (e[0] + e[1]) / 2 : null; };
function shiftOver(o0, o1, [a, b]) {
  let sum = 0, n = 0;
  for (let r = a; r <= b; r++) { const m0 = mid(o0, r), m1 = mid(o1, r); if (m0 !== null && m1 !== null) { sum += m1 - m0; n++; } }
  return n ? Math.round(sum / n) : 0;
}
const topRow = (o) => Math.min(...o.keys());

// Bend one gear image (same anchor as the body) from the standing body
// `stand` to the walking body `step`. Returns a new image, 4px wider each side.
export function bendGear(gear, slot, stand, step) {
  const o0 = outline(stand), o1 = outline(step);
  const dy = topRow(o1) - topRow(o0); // the head bobbing up or down
  const PAD = 4;
  const out = { w: gear.w + PAD * 2, h: gear.h + 2, ax: gear.ax + PAD, ay: gear.ay + 1, data: new Uint8ClampedArray((gear.w + PAD * 2) * (gear.h + 2) * 4) };
  const put = (x, y, sx, sy) => {
    if (alphaAt(gear, sx, sy) === 0) return;
    const s = (sy * gear.w + sx) * 4, d = (y * out.w + x) * 4;
    for (let c = 0; c < 4; c++) out.data[d + c] = gear.data[s + c];
  };
  const rigid = !WARP.has(slot);
  const dx = rigid ? shiftOver(o0, o1, WITH_HEAD.has(slot) ? HEAD : TORSO) : 0;
  for (let y = 0; y < out.h; y++) {
    const r = y - out.ay;                 // row from the feet, in the walking frame
    const lifted = r < LEG_TOP;           // above the legs, the body bobs
    const rs = lifted ? r - dy : r;       // the matching row in the standing frame
    const sy = rs + gear.ay;
    if (sy < 0 || sy >= gear.h) continue;
    if (rigid) {
      for (let x = 0; x < out.w; x++) { const sx = x - out.ax - dx + gear.ax; if (sx >= 0 && sx < gear.w) put(x, y, sx, sy); }
      continue;
    }
    const e0 = o0.get(rs), e1 = o1.get(r);
    for (let x = 0; x < out.w; x++) {
      const bx = x - out.ax; // x from the feet, in the walking frame
      let src;
      if (!e0 || !e1) src = bx;
      else if (bx < e1[0]) src = bx - (e1[0] - e0[0]);           // left of the body: follow its left edge
      else if (bx > e1[1]) src = bx - (e1[1] - e0[1]);           // right of it: follow the right edge
      else {
        // on the body: stretch from the walking row to the standing row,
        // and only where the walking body actually is (with a 1px margin)
        const near = [-1, 0, 1].some((k) => alphaAt(step, bx + k + step.ax, r + step.ay) > 0);
        if (!near) continue;
        if (!lifted) {
          // legs and feet: each half follows its own leg, keeping its shape
          // (stretching them across spread legs made boots look like skis)
          const c1 = (e1[0] + e1[1]) / 2;
          src = bx <= c1 ? bx - (e1[0] - e0[0]) : bx - (e1[1] - e0[1]);
        } else src = e1[1] === e1[0] ? e0[0] : e0[0] + Math.round(((bx - e1[0]) * (e0[1] - e0[0])) / (e1[1] - e1[0]));
      }
      const sx = src + gear.ax;
      if (sx >= 0 && sx < gear.w) put(x, y, sx, sy);
    }
  }
  return out;
}

// ---- Browser side: canvases in, canvases out, cached ----
const pixels = new WeakMap();
function imageOf(spr) {
  if (!pixels.has(spr)) {
    const c = spr.img;
    const g = c.getContext('2d', { willReadFrequently: true });
    pixels.set(spr, { w: spr.w, h: spr.h, ax: spr.ax, ay: spr.ay, data: g.getImageData(0, 0, spr.w, spr.h).data });
  }
  return pixels.get(spr);
}
const bent = new Map();

// `body` is the painted player's frames for this facing ([stand, step, step]).
export function walkingGear(gearSpr, slot, body, frame) {
  if (!frame || !body?.[frame] || !gearSpr) return gearSpr;
  let byFrame = bent.get(gearSpr);
  if (!byFrame) bent.set(gearSpr, (byFrame = new Map()));
  const key = `${slot}|${frame}|${body[frame].ax},${body[frame].ay}`;
  if (!byFrame.has(key)) {
    const im = bendGear(imageOf(gearSpr), slot, imageOf(body[0]), imageOf(body[frame]));
    const c = document.createElement('canvas');
    c.width = im.w; c.height = im.h;
    c.getContext('2d').putImageData(new ImageData(im.data, im.w, im.h), 0, 0);
    byFrame.set(key, { img: c, w: im.w, h: im.h, ax: im.ax, ay: im.ay });
  }
  return byFrame.get(key);
}
