import { TILE } from './pixel.js';
import { buildGround } from './ground.js';
import { buildingSprite } from './buildings.js';
import * as S from './sprites.js';
import { art } from './art.js';
import { itemIcon } from './items.js';
import { drawSkilling, skillLean } from './skilling.js';

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
    oak: art('oak') || Array.from({ length: VARIANTS }, (_, i) => S.oakTree(i + 1)),
    pine: art('pine') || Array.from({ length: VARIANTS }, (_, i) => S.pineTree(i + 11)),
    bush: art('bush') || Array.from({ length: VARIANTS }, (_, i) => S.bush(i + 21)),
    rock: art('rock') || Array.from({ length: VARIANTS }, (_, i) => S.rock(i + 31)),
    flowers: art('flowers') || Array.from({ length: 8 }, (_, i) => S.flowers(i + 41)),
    tallGrass: art('tallGrass') || Array.from({ length: VARIANTS }, (_, i) => S.tallGrass(i + 61)),
    stump: art('stump') || Array.from({ length: 2 }, (_, i) => S.stump(i + 71)),
    mushrooms: art('mushrooms') || Array.from({ length: 3 }, (_, i) => S.mushrooms(i + 81)),
    tent: art('tent') || [S.tent(1), S.tent(2)],
    campfire: art('campfire') || [S.campfire(0), S.campfire(1)],
    crop: art('crop') || [S.crop(false, 51), S.crop(true, 52)],
    lamp: art('lamp')?.[0] || S.lamp(),
    sign: art('sign')?.[0] || S.sign(),
    well: art('well')?.[0] || S.well(),
    stall: art('stall')?.[0] || S.stall(),
    fallenTree: S.fallenTree(),
    scarecrow: art('scarecrow')?.[0] || S.scarecrow(),
    logPile: art('logPile')?.[0] || S.logPile(),
    crate: art('crate')?.[0] || S.crate(),
    bones: S.bones(),
    shelf: [S.shelf(1), S.shelf(2), S.shelf(3)],
    barrel: art('barrel')?.[0] || S.barrel(),
    chest: art('chest')?.[0] || S.chest(),
    rug: S.rug(),
    plant: S.plant(),
    gravestone: S.gravestone(),
    ore: { ...Object.fromEntries(['copper', 'tin', 'iron'].map((v, k) => [v, [S.oreRock(v, 101 + k * 3), S.oreRock(v, 102 + k * 3)]])),
      essence: [S.essenceRock(1), S.essenceRock(2)] },
    // painted ore rocks replace the drawn ones where the atlas has them
    altar: Object.fromEntries(['air', 'mind', 'water'].map((v) => [v, art('altar:' + v) || [S.altar(v, 0), S.altar(v, 1)]])),
    standingStone: art('standingStone') || [S.standingStone(1), S.standingStone(2.5), S.standingStone(4)],
    campChest: art('campChest')?.[0] || S.campChest(),
    ruinWall: [S.ruinWall(1), S.ruinWall(2), S.ruinWall(3), S.ruinWall(4)],
    caveMouth: art('caveMouth') || [S.caveMouth(false), S.caveMouth(true)],
    tombstone: [S.tombstone(1), S.tombstone(2), S.tombstone(3)],
    deadTree: art('deadTree') || Array.from({ length: VARIANTS }, (_, i) => S.deadTree(i + 151)),
    gloomTree: art('gloomTree') || Array.from({ length: VARIANTS }, (_, i) => S.gloomTree(i + 161)),
    thornBush: art('thornBush') || [S.thornBush(171), S.thornBush(172), S.thornBush(173)],
    glowShrooms: art('glowShrooms') || [S.glowShrooms(181), S.glowShrooms(182), S.glowShrooms(183)],
    glowFlowers: art('glowFlowers') || Array.from({ length: VARIANTS }, (_, i) => S.glowFlowers(i + 191)),
    crystalShard: art('crystalShard') || [S.crystalShard(201), S.crystalShard(202), S.crystalShard(203)],
    deadGrass: art('deadGrass') || Array.from({ length: VARIANTS }, (_, i) => S.deadGrass(i + 211)),
    oreEmpty: art('oreEmpty') || [S.oreRock(null, 131), S.oreRock(null, 132)],
    furnace: art('furnace')?.[0] || S.furnace(),
    mineLamp: art('mineLamp')?.[0] || null,
    tanningRack: art('tanningRack')?.[0] || S.tanningRack(),
    fishingSpot: [S.fishingSpot(0), S.fishingSpot(1)],
    cookingPit: art('cookingPit') || [S.cookingPit(0), S.cookingPit(1)],
    anvil: art('anvil')?.[0] || S.anvil(),
    rubble: [S.rubble(141), S.rubble(142), S.rubble(143)],
    treeShadow: S.shadow(15, 4),
    smallShadow: S.shadow(6, 2),
    player: S.playerFrames(),
    people: new Map(),
  };
  for (const v of ['copper', 'tin', 'iron']) if (art('ore:' + v)) LIB.ore[v] = art('ore:' + v);
  if (art('oreEssence')) LIB.ore.essence = art('oreEssence');
  return LIB;
}

// Walking frames for a villager, drawn the first time they're needed.
function paintedFrames(key) {
  const a = art('chars:' + key);
  if (!a || a.length < 12) return null;
  return { down: a.slice(0, 3), up: a.slice(3, 6), left: a.slice(6, 9), right: a.slice(9, 12) };
}

function framesFor(lib, look, key, kind = 'person') {
  if (!lib.people.has(key) && paintedFrames(key)) lib.people.set(key, paintedFrames(key));
  if (!lib.people.has(key)) lib.people.set(key, kind === 'wolf' ? S.wolfFrames(look) : kind === 'chicken' ? S.chickenFrames(look) : kind === 'cow' ? S.cowFrames(look) : kind === 'golem' ? S.golemFrames(look) : S.characterFrames(look));
  return lib.people.get(key);
}

// A fence piece from the painted art: a post, rails to the east, and (drawn in
// code, as the art has no side-on fence) rails running south.
function paintedFence(east, south) {
  const post = art('fencePost')?.[0], rail = art('fenceRail')?.[0];
  if (!post || !rail) return null;
  const base = S.fence(false, south); // 28 x 32, post at x 6-9, anchor (8, 17)
  const c = document.createElement('canvas');
  c.width = base.w; c.height = base.h;
  const g = c.getContext('2d');
  if (south) g.drawImage(base.img, 0, 0);
  if (east) g.drawImage(rail.img, 9, 18 - rail.h - 2);
  g.drawImage(post.img, 8 - post.ax, 18 - post.ay);
  return { img: c, ax: base.ax, ay: base.ay, w: base.w, h: base.h };
}

export function createWorldView(canvasEl, area) {
  const ctx = canvasEl.getContext('2d', { alpha: false });
  const grounds = buildGround(area);
  const mapW = area.W * TILE;
  const mapH = area.H * TILE;

  const lib = getLib();
  const fences = {};
  const fenceSprite = (e, s) => (fences[`${e}${s}`] ||= paintedFence(e, s) || S.fence(e, s));

  // ---- Place everything -------------------------------------------------------------
  const decals = []; // drawn flat on the ground, under everything else
  const shadows = [];
  const objects = []; // depth-sorted
  const pick = (arr, p) => arr[(p.x * 7 + p.y * 13) % arr.length];
  // Small things sit a little off the tile grid so they don't line up in rows.
  const jit = (p, k) => ((p.x * 37 + p.y * 11 + k * 17) % 9) - 4;
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
        const spr = pick(p.variant === 'oak' ? lib.oak : p.variant === 'dead' ? lib.deadTree : p.variant === 'gloom' ? lib.gloomTree : lib.pine, p);
        shadows.push({ spr: lib.treeShadow, x: f.x, y: f.y, prop: p });
        place(spr, f.x, f.y, { fade: true, prop: p, fx: f.x, fy: f.y });
        break;
      }
      case 'bush': place(pick(lib.bush, p), f.x, f.y); break;
      case 'rock': place(pick(lib.rock, p), f.x, f.y); break;
      case 'flowers': {
        const spr = pick(lib.flowers, p);
        decals.push({ img: spr.img, x: p.x * TILE + jit(p, 1), y: p.y * TILE + jit(p, 2) });
        break;
      }
      case 'crop': place(lib.crop[p.ripe ? 1 : 0], f.x, f.y); break;
      case 'fence': place(fenceSprite(isFence.has(`${p.x + 1},${p.y}`), isFence.has(`${p.x},${p.y + 1}`)), f.x, f.y - 2); break;
      case 'lamp': place(area.id === 'mine' && lib.mineLamp ? lib.mineLamp : lib.lamp, f.x, f.y); break;
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
      case 'tallGrass': place(pick(area.theme === 'vale' ? lib.deadGrass : lib.tallGrass, p), f.x + jit(p, 3), f.y + jit(p, 4) / 2, { sortY: (p.y + 1) * TILE + 1 }); break;
      case 'thornBush': place(pick(lib.thornBush, p), f.x, f.y); break;
      case 'crystalShard': place(pick(lib.crystalShard, p), f.x, f.y); break;
      case 'glowShrooms': { const spr = pick(lib.glowShrooms, p); decals.push({ img: spr.img, x: p.x * TILE, y: p.y * TILE }); break; }
      case 'glowFlowers': { const spr = pick(lib.glowFlowers, p); decals.push({ img: spr.img, x: p.x * TILE, y: p.y * TILE }); break; }
      case 'counter': place(S.counter(p.tiles.length), f.x, f.y); break;
      case 'bankBooth': place(S.counter(p.tiles.length, true), f.x, f.y); break;
      case 'shelf': place(pick(lib.shelf, p), f.x, f.y + 2); break;
      case 'barrel': place(lib.barrel, f.x, f.y); break;
      case 'chest': place(lib.chest, f.x, f.y); break;
      case 'plant': place(lib.plant, f.x, f.y); break;
      case 'ore': {
        const k = (p.x + p.y) % 2;
        place(lib.ore[p.variant][k], f.x, f.y + 1, { prop: p, fx: f.x, fy: f.y + 1, alt: lib.oreEmpty[k] });
        break;
      }
      case 'furnace': place(lib.furnace, f.x, f.y + 1); break;
      case 'tanningRack': place(lib.tanningRack, f.x, f.y); break;
      case 'altar': place(lib.altar[p.variant][0], f.x, f.y + 1, { frames: lib.altar[p.variant], rate: 2.5 }); break;
      case 'standingStone': place(pick(lib.standingStone, p), f.x, f.y); break;
      case 'ruinWall': place(pick(lib.ruinWall, p), f.x, f.y); break;
      case 'caveMouth': place(lib.caveMouth[p.sealed ? 1 : 0], f.x, f.y); break;
      case 'tombstone': place(pick(lib.tombstone, p), f.x, f.y); break;
      case 'campChest': place(lib.campChest, f.x, f.y); break;
      // Ripples sit flat on the water, under anyone standing nearby.
      case 'fishingSpot': place(lib.fishingSpot[0], f.x, f.y - 2, { frames: lib.fishingSpot, rate: 1.6, sortY: p.y * TILE }); break;
      case 'cookingPit': place(lib.cookingPit[0], f.x, f.y, { frames: lib.cookingPit }); break;
      case 'anvil': place(lib.anvil, f.x, f.y); break;
      case 'rubble': { const spr = pick(lib.rubble, p); decals.push({ img: spr.img, x: p.x * TILE, y: p.y * TILE }); break; }
      case 'rug': decals.push({ img: lib.rug.img, x: (p.x + 0.5) * TILE - lib.rug.ax, y: (p.y + 0.5) * TILE - lib.rug.ay }); break;
      case 'bones': decals.push({ img: lib.bones.img, x: p.x * TILE + jit(p, 5), y: p.y * TILE + 4 + jit(p, 6) / 2 }); break;
      case 'mushrooms': { const spr = pick(lib.mushrooms, p); decals.push({ img: spr.img, x: p.x * TILE + jit(p, 7), y: p.y * TILE + jit(p, 8) / 2 }); break; }
      default: break; // doors are drawn as part of their building
    }
  }
  for (const b of area.buildings) {
    const s = buildingSprite(b);
    objects.push({ img: s.img, x: s.x, y: s.y, w: s.img.width, h: s.img.height, sortY: s.sortY });
  }

  // ---- Lights (for dark areas) ------------------------------------------------------
  // Everything outside a light is in deep shadow. Glowing things light up the
  // ground around them; altars and fires also cast coloured light.
  const LIGHT = {
    altar: { air: ['#d8ecff', 84], mind: ['#ff9a3a', 84], water: ['#6fb8ff', 84] },
    campfire: ['#ff9a3a', 64, true], cookingPit: ['#ff9a3a', 64, true], lamp: ['#ffd890', 52, true], campChest: ['#ffd890', 30, true],
    ore: ['#8ab8ff', 32], crystalShard: ['#8ab8ff', 16], glowShrooms: ['#5fd8ff', 18], glowFlowers: ['#c8b8ff', 12],
  };
  const lights = [];
  if (area.dark) {
    for (const p of area.props) {
      let def = LIGHT[p.type];
      if (p.type === 'altar') def = LIGHT.altar[p.variant];
      if (p.type === 'ore' && p.variant !== 'essence') def = null;
      if (!def) continue;
      const cxw = (p.tiles.reduce((a, t) => a + t.x, 0) / p.tiles.length + 0.5) * TILE;
      const cyw = (p.tiles[0].y + 0.3) * TILE;
      lights.push({ x: cxw, y: cyw, colour: def[0], r: def[1], flicker: !!def[2], glow: def[1] >= 30, strength: p.type === 'altar' ? 0.42 : 0.22 });
    }
  }
  // Drifting wisps of light.
  const wisps = area.dark ? Array.from({ length: Math.round((area.W * area.H) / 140) }, (_, k) => ({
    x: ((k * 7919) % (area.W * 13)) / 13 * TILE, y: ((k * 104729) % (area.H * 11)) / 11 * TILE, ph: k * 1.7,
  })) : [];
  const rgb = (hx) => [1, 3, 5].map((k) => parseInt(hx.slice(k, k + 2), 16));
  // The light map is soft, so it's worked out at a quarter of the screen's
  // resolution and stretched to fit: it looks the same and costs far less.
  const LQ = 4;
  let shade = null, shadeCtx = null, glow = null, glowCtx = null;

  function drawDarkness(time, extra) {
    const W = canvasEl.width, H = canvasEl.height;
    const w = Math.ceil(W / LQ), h = Math.ceil(H / LQ);
    if (!shade || shade.width !== w || shade.height !== h) {
      shade = document.createElement('canvas'); shade.width = w; shade.height = h; shadeCtx = shade.getContext('2d');
      glow = document.createElement('canvas'); glow.width = w; glow.height = h; glowCtx = glow.getContext('2d');
    }
    const g = shadeCtx, gl = glowCtx;
    g.globalCompositeOperation = 'source-over';
    g.clearRect(0, 0, w, h);
    g.fillStyle = 'rgba(5, 4, 14, 0.8)';
    g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'destination-out';
    gl.clearRect(0, 0, w, h);
    gl.globalCompositeOperation = 'lighter';
    const all = extra.length ? lights.concat(extra) : lights;
    const k = scale / LQ;
    for (const L of all) {
      const wob = L.flicker ? Math.sin(time * 9 + L.x) * 2 + Math.sin(time * 13 + L.y) * 1.5 : 0;
      const r = (L.r + wob) * k;
      const sx = (L.x - cam.x) * k, sy = (L.y - cam.y) * k;
      if (sx + r < 0 || sy + r < 0 || sx - r > w || sy - r > h) continue;
      const grd = g.createRadialGradient(sx, sy, 0, sx, sy, r);
      grd.addColorStop(0, 'rgba(0,0,0,0.95)');
      grd.addColorStop(0.45, 'rgba(0,0,0,0.6)');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grd;
      g.fillRect(sx - r, sy - r, r * 2, r * 2);
      if (L.glow && L.colour) {
        // coloured light from altars, fires and lamps
        const [cr, cg, cb] = rgb(L.colour);
        const cg2 = gl.createRadialGradient(sx, sy, 0, sx, sy, r * 0.75);
        cg2.addColorStop(0, `rgba(${cr},${cg},${cb},${L.strength ?? 0.22})`);
        cg2.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        gl.fillStyle = cg2;
        gl.fillRect(sx - r, sy - r, r * 2, r * 2);
      }
    }
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(shade, 0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(glow, 0, 0, W, H);
    ctx.restore();
    ctx.imageSmoothingEnabled = false;
    // wisps drifting through the dark
    for (const wsp of wisps) {
      const x = wsp.x + Math.sin(time * 0.3 + wsp.ph) * 24;
      const y = wsp.y + Math.cos(time * 0.23 + wsp.ph) * 14;
      if (x < cam.x - 4 || y < cam.y - 4 || x > cam.x + W / scale + 4 || y > cam.y + H / scale + 4) continue;
      ctx.globalAlpha = 0.35 + 0.35 * Math.sin(time * 1.3 + wsp.ph);
      ctx.fillStyle = wsp.ph % 2 > 1 ? '#bfe0ff' : '#d8c8ff';
      ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
    }
    ctx.globalAlpha = 1;
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
    // Leaning into each swing while skilling.
    const lean = skillLean(opts.skilling, time, { fx: pObj.fx, fy: pObj.fy, facing: player.facing });
    pObj.x += lean.x;
    pObj.y += lean.y;
    const footX = pObj.fx;
    const footY = pObj.fy;
    follow(footX, footY - 8);

    const vw = canvasEl.width / scale;
    const vh = canvasEl.height / scale;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = area.indoors ? '#120c08' : area.theme === 'vale' ? '#0c1012' : '#2c5a2a';
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
        const st = o.alt || lib.stump[(o.prop.x + o.prop.y) % lib.stump.length];
        ctx.drawImage(st.img, Math.round(o.fx - st.ax), Math.round(o.fy - st.ay));
        continue;
      }
      if (o.frames) o.img = o.frames[o.rate ? Math.floor(time * o.rate) % 2 : flicker].img;
      const behind = o.fade && o.sortY > pObj.sortY &&
        pObj.x + 12 > o.x + 6 && pObj.x + 4 < o.x + o.w - 6 && pObj.y + 4 < o.y + o.h - 10 && pObj.y + pObj.h > o.y;
      if (behind) ctx.globalAlpha = 0.5;
      if (o.alpha !== undefined) ctx.globalAlpha = o.alpha;
      ctx.drawImage(o.img, o.x, o.y);
      ctx.globalAlpha = 1;
    }

    // Night in dark areas: shadow everywhere except around lights.
    if (area.dark) {
      const extra = [{ x: pObj.fx, y: pObj.fy - 8, r: 50 }];
      for (const o of foes) if (!o.enemy.dead && o.enemy.def.sprite === 'golem') extra.push({ x: o.fx, y: o.fy - 12, r: 22, colour: '#a8d0ff', glow: false });
      drawDarkness(time, extra);
    }

    // Skilling: the tool in your hands, chips, sparks, steam, the float on the water.
    if (opts.skilling) drawSkilling(ctx, opts.skilling, { fx: pObj.fx + lean.x, fy: pObj.fy + lean.y, facing: player.facing }, time);

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
