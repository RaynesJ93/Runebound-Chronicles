import { TILE, Bitmap, hex, shade, rnd } from './pixel.js';

// Draws a building as one pixel-art sprite in a 3/4 top-down view:
// a big shingled roof on top and the front wall (with door and windows) below.
// The sprite sits over the building's footprint and extends one tile above it
// (plus a little extra for the chimney).

const STYLES = {
  bank: { roof: '#34507a', wall: 'stone', wallH: 34 },
  store: { roof: '#a8432f', wall: 'plaster', wallH: 32, awning: true },
  house: { roof: '#8a4b2a', wall: 'timber', wallH: 30 },
  cabin: { roof: '#5d6b3a', wall: 'logs', wallH: 30 },
};

const OVER = 3; // roof overhang in pixels on each side
const TOP = 8; // extra room above the roof for chimneys

export function buildingSprite(b) {
  const style = { ...STYLES[b.kind] };
  const roofRGB = hex(b.roof ?? style.roof);
  const W = b.w * TILE + OVER * 2;
  const H = (b.h + 1) * TILE + TOP;
  const bmp = new Bitmap(W, H);
  const wallTop = H - style.wallH;
  const roofBottom = wallTop + 3;
  const x0 = OVER;
  const x1 = OVER + b.w * TILE; // wall spans x0..x1-1

  // ---- Front wall ------------------------------------------------------------
  const plaster = hex('#ece0c0');
  const timber = hex('#6e4424');
  const timberHi = hex('#8a5a32');
  for (let y = wallTop; y < H; y++) {
    for (let x = x0; x < x1; x++) {
      let c;
      if (style.wall === 'stone') {
        const row = Math.floor((y - wallTop) / 5);
        const bx = (x - x0 + (row % 2) * 5) % 10;
        const tone = rnd(Math.floor((x - x0 + (row % 2) * 5) / 10), row, 3);
        c = (bx === 0 || (y - wallTop) % 5 === 0) ? hex('#7d776d') : tone < 0.33 ? hex('#a9a297') : tone < 0.66 ? hex('#b8b1a5') : hex('#c4bdb0');
      } else if (style.wall === 'logs') {
        // stacked round logs
        const ly = (y - wallTop) % 6;
        c = ly === 0 ? hex('#4a2c16') : ly === 1 ? hex('#a0703f') : ly < 4 ? hex('#8a5a32') : hex('#6e4424');
        if (rnd(x >> 2, Math.floor((y - wallTop) / 6), 6) < 0.08 && ly > 1) c = hex('#5e3b1f');
      } else if (style.wall === 'plaster') {
        c = rnd(x, y, 4) < 0.06 ? hex('#e0d2ad') : hex('#efe2bd');
      } else {
        // horizontal planks
        c = (y - wallTop) % 5 === 4 ? hex('#c9b48a') : rnd(x >> 3, Math.floor((y - wallTop) / 5), 5) < 0.5 ? hex('#e8d8b0') : plaster;
      }
      bmp.set(x, y, c);
    }
  }
  // timber frame (corners and a top beam) for plaster and timber walls
  if (style.wall === 'plaster' || style.wall === 'timber') {
    for (const x of [x0, x0 + 1, x1 - 2, x1 - 1]) for (let y = wallTop; y < H - 3; y++) bmp.set(x, y, x === x0 || x === x1 - 2 ? timberHi : timber);
    bmp.rect(x0, wallTop + 2, b.w * TILE, 2, timber);
  } else if (style.wall === 'stone') {
    // pillars either side of the bank door
    const dc = doorCenter(b);
    for (const px of [dc - 17, dc + 13]) {
      bmp.rect(px, wallTop + 4, 4, style.wallH - 7, hex('#d6d0c4'));
      bmp.rect(px + 3, wallTop + 4, 1, style.wallH - 7, hex('#9d968a'));
      bmp.rect(px - 1, wallTop + 3, 6, 2, hex('#e4ded2'));
    }
  }
  // stone foundation
  for (let x = x0; x < x1; x++) for (let y = H - 3; y < H; y++) bmp.set(x, y, (x + y) % 5 === 0 ? hex('#6c675f') : hex('#8b857b'));

  // ---- Windows -----------------------------------------------------------------
  const dc = doorCenter(b);
  const winY = wallTop + 9;
  for (const off of [-2, 2]) {
    const cx = Math.round(dc + off * TILE);
    if (cx - 7 < x0 + 3 || cx + 7 > x1 - 3) continue;
    bmp.rect(cx - 7, winY - 1, 14, 12, timber);
    bmp.rect(cx - 6, winY, 12, 10, hex('#9cc8e6'));
    bmp.rect(cx - 6, winY, 12, 3, hex('#cbe6f7'));
    bmp.rect(cx - 1, winY, 2, 10, timber);
    bmp.rect(cx - 6, winY + 4, 12, 1, timber);
    if (style.wall === 'timber') {
      bmp.rect(cx - 8, winY + 11, 16, 3, hex('#7a4a26'));
      for (let k = 0; k < 6; k++) bmp.set(cx - 7 + k * 3, winY + 10, [hex('#e0475f'), hex('#f7d14a'), hex('#f28cb3')][k % 3]);
    }
  }

  // ---- Door --------------------------------------------------------------------
  const dw = b.doorTiles.length === 2 ? 22 : 12;
  const dh = 20;
  const dx = Math.round(dc - dw / 2);
  const dy = H - 3 - dh;
  bmp.rect(dx - 2, dy - 2, dw + 4, dh + 2, timber);
  for (let y = dy; y < dy + dh; y++) for (let x = dx; x < dx + dw; x++) {
    const plank = (x - dx) % 4 === 3;
    bmp.set(x, y, plank ? hex('#4a2c16') : (x - dx) < 2 ? hex('#7d4e2a') : hex('#64391c'));
  }
  if (b.doorTiles.length === 2) bmp.rect(dx + dw / 2 - 1, dy, 2, dh, hex('#3d2412'));
  bmp.rect(dx + dw - 4, dy + 10, 2, 2, hex('#e8c040'));
  if (b.doorTiles.length === 2) bmp.rect(dx + 2, dy + 10, 2, 2, hex('#e8c040'));
  // step
  bmp.rect(dx - 3, H - 3, dw + 6, 3, hex('#a59e92'));

  // ---- Shop signs ------------------------------------------------------------------
  if (b.kind === 'bank') {
    const sx = Math.round(dc - 7);
    const sy = wallTop + 4;
    bmp.rect(sx, sy, 14, 9, hex('#2f4a73'));
    bmp.rect(sx, sy, 14, 1, hex('#4a6a9a'));
    bmp.ellipse(sx + 7, sy + 4.5, 3.2, 3.2, hex('#e8c040'));
    bmp.rect(sx + 6, sy + 3, 2, 3, hex('#b8901f'));
  }
  if (b.kind === 'store') {
    const sx = Math.round(dc + 9);
    const sy = wallTop + 5;
    bmp.rect(sx + 2, sy - 2, 1, 3, timber);
    bmp.rect(sx + 8, sy - 2, 1, 3, timber);
    bmp.rect(sx, sy, 11, 10, hex('#9a6234'));
    bmp.rect(sx, sy, 11, 1, hex('#c08c55'));
    // a little sack of goods
    bmp.ellipse(sx + 5.5, sy + 6, 3, 2.6, hex('#e3c68a'));
    bmp.rect(sx + 4, sy + 2, 3, 2, hex('#e3c68a'));
    bmp.rect(sx + 4, sy + 3, 3, 1, hex('#8a5a32'));
  }

  // ---- Roof ----------------------------------------------------------------------
  for (let y = TOP; y < roofBottom; y++) {
    for (let x = 0; x < W; x++) {
      const ry = y - TOP;
      const row = Math.floor(ry / 5);
      const seam = (x + (row % 2) * 3) % 6 === 0;
      let f = 1.06 - (x / W) * 0.18; // lighter on the left
      if (ry % 5 === 0) f *= 1.12; // top edge of each shingle row
      if (ry % 5 === 4) f *= 0.82; // shadow line under each row
      if (seam && ry % 5 !== 0) f *= 0.88;
      if (ry < 4) f *= 1.15; // ridge cap
      if (y >= roofBottom - 2) f *= 0.7; // eaves
      bmp.set(x, y, shade(roofRGB, f));
    }
  }
  // shadow cast by the eaves onto the wall
  for (let x = x0; x < x1; x++) for (const y of [roofBottom, roofBottom + 1]) {
    const i = (y * W + x) * 4;
    for (let k = 0; k < 3; k++) bmp.data[i + k] = Math.round(bmp.data[i + k] * (y === roofBottom ? 0.7 : 0.85));
  }

  // Store awning under the eaves
  if (style.awning) {
    for (let y = roofBottom; y < roofBottom + 5; y++) for (let x = x0 + 2; x < x1 - 2; x++) {
      if (y === roofBottom + 4 && x % 4 === 3) continue;
      const red = Math.floor((x - x0) / 4) % 2 === 0;
      bmp.set(x, y, shade(red ? hex('#c4402f') : hex('#f1e6c8'), y === roofBottom + 4 ? 0.85 : 1));
    }
  }

  // Chimney on houses
  if (b.kind === 'house' || b.kind === 'cabin') {
    const cx = W - 22;
    for (let y = 1; y < TOP + 12; y++) for (let x = cx; x < cx + 8; x++) {
      const brick = ((y + (Math.floor(x / 4) % 2) * 2) % 4 === 0) || x === cx + 7;
      bmp.set(x, y, brick ? hex('#6c4033') : hex('#9b5b45'));
    }
    bmp.rect(cx - 1, 0, 10, 2, hex('#5a5550'));
  }

  bmp.outline();
  return {
    img: bmp.toCanvas(),
    x: b.x * TILE - OVER,
    y: (b.y - 1) * TILE - TOP,
    sortY: (b.y + b.h) * TILE,
  };
}

function doorCenter(b) {
  const avg = b.doorTiles.reduce((s, t) => s + t.x, 0) / b.doorTiles.length;
  return OVER + (avg + 0.5 - b.x) * TILE;
}
