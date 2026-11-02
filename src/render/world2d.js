import { TILE } from './pixel.js';
import { buildGround } from './ground.js';
import { buildingSprite } from './buildings.js';
import * as S from './sprites.js';
import { itemIcon } from './items.js';

// Draws an area in 2D pixel art.
//
// - The world is drawn at 16 px per tile and scaled by a whole number, so
//   pixels stay perfectly square and crisp on every screen.
// - Objects are sorted by the y of their base so you can walk behind trees
//   and buildings. Trees you're standing behind turn see-through.

const VARIANTS = 4;

// Sprites are shared by every area, so they're only drawn once.
let LIB = null;
function getLib() {
  if (LIB) return LIB;
  LIB = {
    oak: Array.from({ length: VARIANTS }, (_, i) => S.oakTree(i + 1)),
    pine: Array.from({ length: VARIANTS }, (_, i) => S.pineTree(i + 11)),
    bush: Array.from({ length: VARIANTS }, (_, i) => S.bush(i + 21)),
    rock: Array.from({ length: VARIANTS }, (_, i) => S.rock(i + 31)),
    flowers: Array.from({ length: 8 }, (_, i) => S.flowers(i + 41)),
    tallGrass: Array.from({ length: VARIANTS }, (_, i) => S.tallGrass(i + 61)),
    stump: Array.from({ length: 2 }, (_, i) => S.stump(i + 71)),
    mushrooms: Array.from({ length: 3 }, (_, i) => S.mushrooms(i + 81)),
    tent: [S.tent(1), S.tent(2)],
    campfire: [S.campfire(0), S.campfire(1)],
    crop: [S.crop(false, 51), S.crop(true, 52)],
    lamp: S.lamp(),
    sign: S.sign(),
    well: S.well(),
    stall: S.stall(),
    fallenTree: S.fallenTree(),
    scarecrow: S.scarecrow(),
    logPile: S.logPile(),
    crate: S.crate(),
    bones: S.bones(),
    shelf: [S.shelf(1), S.shelf(2), S.shelf(3)],
    barrel: S.barrel(),
    chest: S.chest(),
    rug: S.rug(),
    plant: S.plant(),
    gravestone: S.gravestone(),
    treeShadow: S.shadow(15, 4),
    smallShadow: S.shadow(6, 2),
    player: S.playerFrames(),
    people: new Map(),
  };
  return LIB;
}

// Walking frames for a villager, drawn the first time they're needed.
function framesFor(lib, look, key, kind = 'person') {
  if (!lib.people.has(key)) lib.people.set(key, kind === 'wolf' ? S.wolfFrames(look) : S.characterFrames(look));
  return lib.people.get(key);
}

export function createWorldView(canvasEl, area) {
  const ctx = canvasEl.getContext('2d', { alpha: false });
  const grounds = buildGround(area);
  const mapW = area.W * TILE;
  const mapH = area.H * TILE;

  const lib = getLib();
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
        shadows.push({ spr: lib.treeShadow, x: f.x, y: f.y, prop: p });
        place(spr, f.x, f.y, { fade: true, prop: p, fx: f.x, fy: f.y });
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
      case 'logPile': place(lib.logPile, f.x, f.y); break;
      case 'stump': place(pick(lib.stump, p), f.x, f.y); break;
      case 'crate': place(lib.crate, f.x, f.y); break;
      case 'tent': place(pick(lib.tent, p), f.x, f.y); break;
      case 'campfire': place(lib.campfire[0], f.x, f.y, { frames: lib.campfire }); break;
      // Tall grass is drawn just in front of anyone standing in it, hiding their feet.
      case 'tallGrass': place(pick(lib.tallGrass, p), f.x, f.y, { sortY: (p.y + 1) * TILE + 1 }); break;
      case 'counter': place(S.counter(p.tiles.length), f.x, f.y); break;
      case 'bankBooth': place(S.counter(p.tiles.length, true), f.x, f.y); break;
      case 'shelf': place(pick(lib.shelf, p), f.x, f.y + 2); break;
      case 'barrel': place(lib.barrel, f.x, f.y); break;
      case 'chest': place(lib.chest, f.x, f.y); break;
      case 'plant': place(lib.plant, f.x, f.y); break;
      case 'rug': decals.push({ img: lib.rug.img, x: (p.x + 0.5) * TILE - lib.rug.ax, y: (p.y + 0.5) * TILE - lib.rug.ay }); break;
      case 'bones': decals.push({ img: lib.bones.img, x: p.x * TILE, y: p.y * TILE + 4 }); break;
      case 'mushrooms': { const spr = pick(lib.mushrooms, p); decals.push({ img: spr.img, x: p.x * TILE, y: p.y * TILE }); break; }
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
    // iPhones are 3x, but pixel art looks the same at 2x and there are
    // less than half as many pixels to fill each frame.
    dpr = Math.min(window.devicePixelRatio || 1, 2);
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

  function frameOf(frames, who, steps) {
    const a = who.facing;
    const dx = Math.sin(a);
    const dy = Math.cos(a);
    const dir = Math.abs(dx) > Math.abs(dy) + 0.01 ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    let frame = 0;
    if (who.moving) frame = who.t < 0.5 ? (steps % 2 ? 1 : 2) : 0;
    return frames[dir][frame] || frames.down[0];
  }

  // A drawable for anyone walking around: the player or a villager.
  function personObj(frames, who, steps, extra, time = 0, lungeAt = -99) {
    const wp = who.worldPosition();
    let fx = Math.round(wp.x * TILE);
    let fy = Math.round(wp.z * TILE + 6);
    const sortY = fy;
    // A quick lunge towards whatever they're hitting.
    if (time - lungeAt < 0.18) {
      fx += Math.round(Math.sin(who.facing) * 3);
      fy += Math.round(Math.cos(who.facing) * 3);
    }
    const spr = frameOf(frames, who, steps);
    return { img: spr.img, x: fx - spr.ax, y: fy - spr.ay, w: spr.w, h: spr.h, sortY, fx, fy, ...extra };
  }

  function healthBar(fx, fy, hp, max) {
    const x = fx - 9;
    const y = fy - 29;
    ctx.fillStyle = '#2b1d16';
    ctx.fillRect(x, y, 18, 5);
    ctx.fillStyle = '#c4281d';
    ctx.fillRect(x + 1, y + 1, 16, 3);
    ctx.fillStyle = '#4fd04a';
    ctx.fillRect(x + 1, y + 1, Math.round((16 * Math.max(0, hp)) / max), 3);
  }

  let lastLook = null;
  let lastLookKey = null;

  function render(player, opts) {
    const { time, steps, marker, characters = [], enemies = [], combat = null, ground: groundItems = [], playerLook = null } = opts;
    // Your character, dressed in whatever you're wearing.
    if (playerLook !== lastLook) { lastLook = playerLook; lastLookKey = playerLook ? `player:${JSON.stringify(playerLook)}` : null; }
    const pFrames = lastLookKey ? framesFor(lib, playerLook, lastLookKey) : lib.player;
    const pObj = personObj(pFrames, player, steps, { player: true }, time, Math.max(combat?.playerLungeAt ?? -99, opts.skillLungeAt ?? -99));
    const footX = pObj.fx;
    const footY = pObj.fy;
    follow(footX, footY - 8);

    const vw = canvasEl.width / scale;
    const vh = canvasEl.height / scale;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = area.indoors ? '#120c08' : '#2c5a2a';
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
    for (const d of decals) if (inView(d.x, d.y, d.img.width, d.img.height)) ctx.drawImage(d.img, d.x, d.y);

    // Items on the ground: up to three per tile, fanned out a little.
    const perTile = new Map();
    const beams = [];
    for (const g of groundItems) {
      if (!inView(g.x * TILE, g.y * TILE, TILE, TILE)) continue;
      const key = g.y * 10000 + g.x;
      const k = perTile.get(key) || 0;
      perTile.set(key, k + 1);
      if (k > 2) continue;
      const ic = itemIcon(g.item);
      ctx.drawImage(ic.img, g.x * TILE + [0, 3, -3][k], g.y * TILE - 2 + [0, -2, 2][k]);
      if (g.rare) beams.push(g);
    }

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

    for (const s of shadows) if (!s.prop?.depleted) ctx.drawImage(s.spr.img, Math.round(s.x - s.spr.ax), Math.round(s.y - s.spr.ay));
    const people = [pObj];
    for (const c of characters) people.push(personObj(framesFor(lib, c.def.look, c.id), c, c.steps, { person: true }));
    const foes = [];
    for (const e of enemies) {
      const since = time - e.diedAt;
      if (e.dead && since > 0.9) continue;
      const o = personObj(framesFor(lib, e.def.look, `enemy:${e.def.id}`, e.def.sprite), e, e.steps, { person: true, enemy: e }, time, e.lungeAt);
      if (e.dead) o.alpha = Math.max(0, 1 - since / 0.9);
      people.push(o);
      foes.push(o);
    }
    for (const p of people) if (!(p.alpha < 1)) ctx.drawImage(lib.smallShadow.img, p.fx - lib.smallShadow.ax, p.fy - lib.smallShadow.ay);

    const list = objects.filter((o) => inView(o.x, o.y, o.w, o.h));
    if (opts.grave) {
      const g = lib.gravestone;
      const fx = (opts.grave.x + 0.5) * TILE, fy = (opts.grave.y + 1) * TILE - 2;
      list.push({ img: g.img, x: fx - g.ax, y: fy - g.ay, w: g.w, h: g.h, sortY: fy });
    }
    for (const p of people) if (inView(p.x, p.y, p.w, p.h)) list.push(p);
    list.sort((a, b) => a.sortY - b.sortY || ((a.player || a.person) ? 1 : -1));

    const flicker = Math.floor(time * 6) % 2;
    for (const o of list) {
      if (o.prop?.depleted) {
        // A chopped-down tree: just its stump until it grows back.
        const st = lib.stump[(o.prop.x + o.prop.y) % lib.stump.length];
        ctx.drawImage(st.img, Math.round(o.fx - st.ax), Math.round(o.fy - st.ay));
        continue;
      }
      if (o.frames) o.img = o.frames[flicker].img;
      const behind = o.fade && o.sortY > pObj.sortY &&
        pObj.x + 12 > o.x + 6 && pObj.x + 4 < o.x + o.w - 6 && pObj.y + 4 < o.y + o.h - 10 && pObj.y + pObj.h > o.y;
      if (behind) ctx.globalAlpha = 0.5;
      if (o.alpha !== undefined) ctx.globalAlpha = o.alpha;
      ctx.drawImage(o.img, o.x, o.y);
      ctx.globalAlpha = 1;
    }

    // Arrows and spells in flight.
    if (combat) {
      for (const pr of combat.projectiles) {
        const k = Math.max(0, Math.min(1, (time - pr.start) / Math.max(0.01, pr.end - pr.start)));
        const tp = pr.to.worldPosition();
        const sx0 = pr.from.x * TILE, sy0 = pr.from.y * TILE - 8;
        const tx = tp.x * TILE, ty = tp.z * TILE - 6;
        const x = sx0 + (tx - sx0) * k;
        const y = sy0 + (ty - sy0) * k - Math.sin(k * Math.PI) * (pr.kind === 'arrow' ? 6 : 2);
        const ang = Math.atan2(ty - sy0, tx - sx0);
        if (pr.kind === 'arrow') {
          const dx = Math.cos(ang), dy = Math.sin(ang);
          ctx.fillStyle = '#8a5a32';
          for (let i = 0; i < 5; i++) ctx.fillRect(Math.round(x - dx * i), Math.round(y - dy * i), 1, 1);
          ctx.fillStyle = '#d4934f';
          ctx.fillRect(Math.round(x + dx), Math.round(y + dy), 1, 1);
          ctx.fillStyle = '#f4f2e6';
          ctx.fillRect(Math.round(x - dx * 5), Math.round(y - dy * 5), 1, 1);
        } else {
          const col = pr.kind === 'water' ? ['#2f6fd0', '#8fd0ff', '#e8f8ff'] : ['#8fd06a', '#d8f5c0', '#ffffff'];
          for (let i = 3; i >= 1; i--) {
            ctx.globalAlpha = 0.25 * (4 - i);
            ctx.fillStyle = col[0];
            ctx.fillRect(Math.round(x - Math.cos(ang) * i * 3) - 1, Math.round(y - Math.sin(ang) * i * 3) - 1, 3, 3);
          }
          ctx.globalAlpha = 1;
          ctx.fillStyle = col[0]; ctx.fillRect(Math.round(x) - 2, Math.round(y) - 2, 5, 5);
          ctx.fillStyle = col[1]; ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 3, 3);
          ctx.fillStyle = col[2]; ctx.fillRect(Math.round(x), Math.round(y) - 1, 1, 1);
        }
      }
    }

    // A pulsing gold beam over rare drops, so you can't miss them.
    for (const g of beams) {
      const pulse = 0.28 + Math.sin(time * 4) * 0.12;
      ctx.globalAlpha = pulse;
      ctx.fillStyle = '#ffd84a';
      ctx.fillRect(g.x * TILE + 4, g.y * TILE - 56, 8, 66);
      ctx.globalAlpha = pulse * 1.6;
      ctx.fillStyle = '#fff6cf';
      ctx.fillRect(g.x * TILE + 7, g.y * TILE - 56, 2, 66);
      ctx.globalAlpha = 1;
    }

    // Level-up sparkles spiralling out around the player.
    const lu = opts.levelUpAt ?? -99;
    if (time - lu < 1.5) {
      const k = (time - lu) / 1.5;
      ctx.globalAlpha = 1 - k;
      for (let i = 0; i < 14; i++) {
        const ang = (i / 14) * Math.PI * 2 + k * 3;
        const r = 7 + k * 18;
        ctx.fillStyle = i % 2 ? '#ffe14a' : '#fff6cf';
        ctx.fillRect(Math.round(pObj.fx + Math.cos(ang) * r), Math.round(pObj.fy - 12 + Math.sin(ang) * r * 0.7 - k * 10), 2, 2);
      }
      ctx.globalAlpha = 1;
    }

    // Health bars (for a few seconds after being hit) and damage splats, on top.
    if (combat) {
      if (time - combat.playerLastHit < 6) healthBar(pObj.fx, pObj.fy, combat.hp, combat.maxHp);
      for (const o of foes) if (!o.enemy.dead && (time - o.enemy.lastHit < 6 || o.enemy.state === 'fight')) healthBar(o.fx, o.fy, o.enemy.hp, o.enemy.maxHp);
      const stack = new Map();
      for (const sp of combat.splats) {
        const o = sp.who === 'player' ? pObj : foes.find((f) => f.enemy === sp.who);
        if (!o) continue;
        const k = stack.get(o) || 0;
        stack.set(o, k + 1);
        const img = S.splat(Math.min(99, sp.dmg));
        ctx.drawImage(img.img, o.fx - img.ax + (k % 2 ? 7 : 0), o.fy - 16 - img.ay - Math.floor(k / 2) * 9 - (k % 2 ? 4 : 0));
      }
    }
  }

  // Centre of a tile in page (CSS) pixels — handy for tests and future UI.
  function tileToScreen(tx, ty) {
    const r = canvasEl.getBoundingClientRect();
    return { x: r.left + (((tx + 0.5) * TILE - cam.x) * scale) / dpr, y: r.top + (((ty + 0.5) * TILE - cam.y) * scale) / dpr };
  }

  return { resize, render, screenToTile, tileToScreen, setZoomStep, get zoomStep() { return zoomStep; } };
}
