import { TILE } from './pixel.js';
import { buildGround } from './ground.js';
import { buildingSprite } from './buildings.js';
import * as S from './sprites.js';

// Draws an area in 2D pixel art.
//
// - The world is drawn at 16 px per tile and scaled by a whole number, so
//   pixels stay perfectly square and crisp on every screen.
// - Objects are sorted by the y of their base so you can walk behind trees
//   and buildings. Trees you're standing behind turn see-through.

const VARIANTS = 4;

export function createWorldView(canvasEl, area) {
  const ctx = canvasEl.getContext('2d', { alpha: false });
  const grounds = buildGround(area);
  const mapW = area.W * TILE;
  const mapH = area.H * TILE;

  // ---- Sprite library ------------------------------------------------------------
  const lib = {
    oak: Array.from({ length: VARIANTS }, (_, i) => S.oakTree(i + 1)),
    pine: Array.from({ length: VARIANTS }, (_, i) => S.pineTree(i + 11)),
    bush: Array.from({ length: VARIANTS }, (_, i) => S.bush(i + 21)),
    rock: Array.from({ length: VARIANTS }, (_, i) => S.rock(i + 31)),
    flowers: Array.from({ length: 8 }, (_, i) => S.flowers(i + 41)),
    crop: [S.crop(false, 51), S.crop(true, 52)],
    lamp: S.lamp(),
    sign: S.sign(),
    well: S.well(),
    stall: S.stall(),
    fallenTree: S.fallenTree(),
    scarecrow: S.scarecrow(),
    treeShadow: S.shadow(15, 4),
    smallShadow: S.shadow(6, 2),
    player: S.playerFrames(),
  };
  const fences = {};
  const fenceSprite = (e, s) => (fences[`${e}${s}`] ||= S.fence(e, s));

  // ---- Place everything -------------------------------------------------------------
  const decals = []; // drawn flat on the ground, under everything else
  const shadows = [];
  const objects = []; // depth-sorted
  const pick = (arr, p) => arr[(p.x * 7 + p.y * 13) % arr.length];
  const footOf = (p) => {
    const xs = p.tiles.map((t) => t.x);
    const ys = p.tiles.map((t) => t.y);
    return { x: ((Math.min(...xs) + Math.max(...xs) + 1) / 2) * TILE, y: (Math.max(...ys) + 1) * TILE - 2 };
  };
  const place = (spr, fx, fy, extra = {}) => {
    objects.push({ img: spr.img, x: Math.round(fx - spr.ax), y: Math.round(fy - spr.ay), w: spr.w, h: spr.h, sortY: fy, ...extra });
  };
  const isFence = new Set(area.props.filter((p) => p.type === 'fence').map((p) => `${p.x},${p.y}`));

  for (const p of area.props) {
    const f = footOf(p);
    switch (p.type) {
      case 'tree': {
        const spr = pick(p.variant === 'oak' ? lib.oak : lib.pine, p);
        shadows.push({ spr: lib.treeShadow, x: f.x, y: f.y });
        place(spr, f.x, f.y, { fade: true });
        break;
      }
      case 'bush': place(pick(lib.bush, p), f.x, f.y); break;
      case 'rock': place(pick(lib.rock, p), f.x, f.y); break;
      case 'flowers': {
        const spr = pick(lib.flowers, p);
        decals.push({ img: spr.img, x: p.x * TILE, y: p.y * TILE });
        break;
      }
      case 'crop': place(lib.crop[p.ripe ? 1 : 0], f.x, f.y); break;
      case 'fence': place(fenceSprite(isFence.has(`${p.x + 1},${p.y}`), isFence.has(`${p.x},${p.y + 1}`)), f.x, f.y - 2); break;
      case 'lamp': place(lib.lamp, f.x, f.y); break;
      case 'sign': place(lib.sign, f.x, f.y); break;
      case 'well': place(lib.well, f.x, f.y + 1); break;
      case 'stall': place(lib.stall, f.x, f.y); break;
      case 'fallenTree': place(lib.fallenTree, f.x, f.y); break;
      case 'scarecrow': place(lib.scarecrow, f.x, f.y); break;
      default: break; // doors are drawn as part of their building
    }
  }
  for (const b of area.buildings) {
    const s = buildingSprite(b);
    objects.push({ img: s.img, x: s.x, y: s.y, w: s.img.width, h: s.img.height, sortY: s.sortY });
  }

  // ---- Camera and scale -------------------------------------------------------------
  let dpr = 1;
  let scale = 3;
  let zoomStep = 0;
  let baseScale = 3;
  const cam = { x: 0, y: 0 };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvasEl.width = Math.round(window.innerWidth * dpr);
    canvasEl.height = Math.round(window.innerHeight * dpr);
    // About 12 tiles across a phone held upright; about 20 x 12 on wide screens.
    const portrait = canvasEl.height > canvasEl.width;
    const across = canvasEl.width / (TILE * (portrait ? 12 : 20));
    const down = canvasEl.height / (TILE * (portrait ? 18 : 12));
    baseScale = Math.max(1, Math.round(Math.min(across, down)));
    applyScale();
  }

  function applyScale() {
    scale = Math.max(1, baseScale + zoomStep);
  }

  function setZoomStep(step) {
    zoomStep = Math.max(-2, Math.min(3, Math.round(step)));
    if (baseScale + zoomStep < 1) zoomStep = 1 - baseScale;
    applyScale();
    return zoomStep;
  }

  function follow(px, py) {
    const vw = canvasEl.width / scale;
    const vh = canvasEl.height / scale;
    cam.x = mapW > vw ? Math.max(0, Math.min(mapW - vw, px - vw / 2)) : (mapW - vw) / 2;
    cam.y = mapH > vh ? Math.max(0, Math.min(mapH - vh, py - vh / 2)) : (mapH - vh) / 2;
    cam.x = Math.round(cam.x);
    cam.y = Math.round(cam.y);
  }

  function screenToTile(clientX, clientY) {
    const r = canvasEl.getBoundingClientRect();
    const wx = ((clientX - r.left) * dpr) / scale + cam.x;
    const wy = ((clientY - r.top) * dpr) / scale + cam.y;
    return { x: Math.floor(wx / TILE), y: Math.floor(wy / TILE) };
  }

  // ---- Drawing ---------------------------------------------------------------------
  const DIRS = ['down', 'right', 'up', 'left'];

  function playerSprite(player, steps) {
    const a = player.facing;
    const dx = Math.sin(a);
    const dy = Math.cos(a);
    const dir = Math.abs(dx) > Math.abs(dy) + 0.01 ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    let frame = 0;
    if (player.moving) frame = player.t < 0.5 ? (steps % 2 ? 1 : 2) : 0;
    return lib.player[dir][frame] || lib.player[DIRS[0]][0];
  }

  function render(player, opts) {
    const { time, steps, marker } = opts;
    const wp = player.worldPosition();
    const footX = Math.round(wp.x * TILE);
    const footY = Math.round(wp.z * TILE + 6);
    follow(footX, footY - 8);

    const vw = canvasEl.width / scale;
    const vh = canvasEl.height / scale;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#2c5a2a';
    ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
    ctx.setTransform(scale, 0, 0, scale, -cam.x * scale, -cam.y * scale);

    // ground (water shimmers between two frames)
    const ground = grounds[Math.abs(Math.floor(time * 1.6)) % 2];
    const sx = Math.max(0, cam.x);
    const sy = Math.max(0, cam.y);
    const sw = Math.min(mapW - sx, Math.ceil(vw) + 1);
    const sh = Math.min(mapH - sy, Math.ceil(vh) + 1);
    if (sw > 0 && sh > 0) ctx.drawImage(ground, sx, sy, sw, sh, sx, sy, sw, sh);

    const inView = (x, y, w, h) => x + w >= cam.x && y + h >= cam.y && x <= cam.x + vw && y <= cam.y + vh;
    for (const d of decals) if (inView(d.x, d.y, 16, 16)) ctx.drawImage(d.img, d.x, d.y);

    // walk-target marker: a blinking tile outline
    if (marker) {
      const mx = marker.x * TILE;
      const my = marker.y * TILE;
      ctx.globalAlpha = 0.55 + Math.sin(time * 8) * 0.25;
      ctx.fillStyle = '#fff7d6';
      ctx.fillRect(mx + 1, my + 1, 14, 1); ctx.fillRect(mx + 1, my + 14, 14, 1);
      ctx.fillRect(mx + 1, my + 1, 1, 14); ctx.fillRect(mx + 14, my + 1, 1, 14);
      ctx.globalAlpha = 1;
    }

    for (const s of shadows) ctx.drawImage(s.spr.img, Math.round(s.x - s.spr.ax), Math.round(s.y - s.spr.ay));
    ctx.drawImage(lib.smallShadow.img, footX - lib.smallShadow.ax, footY - lib.smallShadow.ay);

    const ps = playerSprite(player, steps);
    const pObj = { img: ps.img, x: footX - ps.ax, y: footY - ps.ay, w: ps.w, h: ps.h, sortY: footY, player: true };
    const list = objects.filter((o) => inView(o.x, o.y, o.w, o.h));
    list.push(pObj);
    list.sort((a, b) => a.sortY - b.sortY || (a.player ? 1 : -1));

    for (const o of list) {
      const behind = o.fade && o.sortY > pObj.sortY &&
        pObj.x + 12 > o.x + 6 && pObj.x + 4 < o.x + o.w - 6 && pObj.y + 4 < o.y + o.h - 10 && pObj.y + pObj.h > o.y;
      if (behind) ctx.globalAlpha = 0.5;
      ctx.drawImage(o.img, o.x, o.y);
      if (behind) ctx.globalAlpha = 1;
    }
  }

  // Centre of a tile in page (CSS) pixels — handy for tests and future UI.
  function tileToScreen(tx, ty) {
    const r = canvasEl.getBoundingClientRect();
    return { x: r.left + (((tx + 0.5) * TILE - cam.x) * scale) / dpr, y: r.top + (((ty + 0.5) * TILE - cam.y) * scale) / dpr };
  }

  return { resize, render, screenToTile, tileToScreen, setZoomStep, get zoomStep() { return zoomStep; } };
}
