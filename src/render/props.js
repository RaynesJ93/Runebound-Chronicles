import * as THREE from 'three';
import { mat, textTexture } from './materials.js';
import { mulberry32 } from '../core/rng.js';

// Builds every prop and building in an area.
// Repeated small things (trees, flowers, fences, crops) use InstancedMesh so
// the whole village is only a few dozen draw calls — important on iPhone.
// Returns { group, interactables }: meshes you can tap, each with userData.prop.

const WHITE = 0xffffff;

function instanced(geo, material, items, place) {
  const mesh = new THREE.InstancedMesh(geo, material, Math.max(1, items.length));
  mesh.count = items.length;
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  let coloured = false;
  items.forEach((it, n) => {
    dummy.position.set(0, 0, 0);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    const c = place(it, dummy, n);
    dummy.updateMatrix();
    mesh.setMatrixAt(n, dummy.matrix);
    if (c !== undefined) { mesh.setColorAt(n, color.setHex(c)); coloured = true; }
  });
  mesh.instanceMatrix.needsUpdate = true;
  if (coloured && mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

const center = (p) => {
  const xs = p.tiles.map((t) => t.x);
  const ys = p.tiles.map((t) => t.y);
  return { x: (Math.min(...xs) + Math.max(...xs)) / 2 + 0.5, z: (Math.min(...ys) + Math.max(...ys)) / 2 + 0.5 };
};

function box(w, h, d, color, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function cyl(rt, rb, h, seg, color, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat(color));
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

// A gable roof (triangular prism) with its ridge running east-west.
function gableRoof(w, d, h, overhang, color) {
  const o = overhang;
  const shape = new THREE.Shape();
  shape.moveTo(-d / 2 - o, 0);
  shape.lineTo(d / 2 + o, 0);
  shape.lineTo(0, h);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: w + 2 * o, bevelEnabled: false });
  geo.rotateY(Math.PI / 2);
  geo.translate(-(w + 2 * o) / 2, 0, 0);
  const m = new THREE.Mesh(geo, mat(color));
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

const BUILDING_STYLE = {
  bank: { wall: 0xb9b4a8, trim: 0x77736a, roof: 0x34507a, wallH: 2.3 },
  store: { wall: 0xe4d6b0, trim: 0x6b4a2b, roof: 0xa8432f, wallH: 2.1 },
  house: { wall: 0xeadfc2, trim: 0x6b4a2b, roof: 0x8a4b2a, wallH: 1.8 },
};

function buildBuilding(b, interactables, doorProp) {
  const style = { ...BUILDING_STYLE[b.kind] };
  if (b.roof) style.roof = b.roof;
  const g = new THREE.Group();
  g.position.set(b.x + b.w / 2, 0, b.y + b.h / 2);
  const w = b.w - 0.2;
  const d = b.h - 0.2;
  const wh = style.wallH;

  // Foundation, walls and timber corner posts
  g.add(box(w + 0.15, 0.2, d + 0.15, 0x7a756c, 0, 0.1, 0));
  g.add(box(w, wh, d, style.wall, 0, wh / 2 + 0.1, 0));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(box(0.18, wh, 0.18, style.trim, sx * (w / 2), wh / 2 + 0.1, sz * (d / 2)));
  g.add(box(w + 0.06, 0.14, d + 0.06, style.trim, 0, wh + 0.07, 0));

  const roofH = Math.min(1.6, d * 0.42);
  const roof = gableRoof(w, d, roofH, 0.35, style.roof);
  roof.position.y = wh + 0.14;
  g.add(roof);

  if (b.kind === 'house') g.add(box(0.4, 0.9, 0.4, 0x8d8579, w * 0.28, wh + roofH * 0.75, -d * 0.15));

  // Door and windows on the south face (+z)
  const front = d / 2 + 0.03;
  const doorCenterX = b.doorTiles.reduce((s, t) => s + t.x + 0.5, 0) / b.doorTiles.length - (b.x + b.w / 2);
  const doorW = b.doorTiles.length === 2 ? 1.5 : 0.8;
  const door = box(doorW, 1.25, 0.08, 0x5a3a20, doorCenterX, 0.72, front);
  door.userData.prop = doorProp;
  interactables.push(door);
  g.add(door);
  g.add(box(doorW + 0.16, 0.12, 0.1, style.trim, doorCenterX, 1.4, front));
  g.add(box(0.07, 0.07, 0.04, 0xd4af37, doorCenterX + doorW * 0.32, 0.72, front + 0.05));

  const winY = Math.min(1.35, wh - 0.55);
  for (const wx of [-w / 2 + 0.75, w / 2 - 0.75]) {
    if (Math.abs(wx - doorCenterX) < doorW / 2 + 0.5) continue;
    g.add(box(0.6, 0.5, 0.06, 0xf3e3a0, wx, winY, front));
    g.add(box(0.7, 0.08, 0.1, style.trim, wx, winY - 0.29, front + 0.01));
    g.add(box(0.06, 0.5, 0.08, style.trim, wx, winY, front + 0.01));
  }

  if (b.label) {
    const tex = textTexture(b.label, { bg: b.kind === 'bank' ? '#2f4a73' : '#7a3b28' });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.48), new THREE.MeshLambertMaterial({ map: tex }));
    sign.position.set(doorCenterX, 1.72, front + 0.05);
    sign.userData.prop = doorProp;
    interactables.push(sign);
    g.add(sign);
  }
  return g;
}

export function buildProps(area) {
  const group = new THREE.Group();
  const interactables = [];
  const rng = mulberry32(99);
  const byType = {};
  for (const p of area.props) (byType[p.type] ||= []).push(p);
  const list = (t) => byType[t] || [];

  // ---- Trees ---------------------------------------------------------------
  const trees = list('tree').map((p) => ({
    ...p,
    jx: (rng() - 0.5) * 0.3,
    jz: (rng() - 0.5) * 0.3,
    s: 0.85 + rng() * 0.4,
    r: rng() * Math.PI * 2,
    shade: rng(),
  }));
  const oaks = trees.filter((t) => t.variant === 'oak');
  const pines = trees.filter((t) => t.variant !== 'oak');
  const trunkGeo = new THREE.CylinderGeometry(0.11, 0.17, 1, 5);
  trunkGeo.translate(0, 0.5, 0);
  group.add(instanced(trunkGeo, mat(0x6e4a2c), trees, (t, o) => {
    o.position.set(t.x + 0.5 + t.jx, 0, t.y + 0.5 + t.jz);
    o.scale.set(t.s, (t.variant === 'oak' ? 1.0 : 0.7) * t.s, t.s);
  }));
  const oakGreens = [0x4f8f34, 0x5a9b3a, 0x467f2e, 0x6aa443];
  group.add(instanced(new THREE.IcosahedronGeometry(0.78, 0), mat(WHITE), oaks, (t, o) => {
    o.position.set(t.x + 0.5 + t.jx, 1.45 * t.s, t.y + 0.5 + t.jz);
    o.rotation.set(t.r, t.r * 0.7, 0);
    o.scale.set(t.s, t.s * 0.95, t.s);
    return oakGreens[Math.floor(t.shade * oakGreens.length)];
  }));
  const pineGreens = [0x2f6b3a, 0x376f3c, 0x2a5f35, 0x3d7a43];
  const coneLow = new THREE.ConeGeometry(0.72, 1.15, 6);
  const coneHigh = new THREE.ConeGeometry(0.5, 0.95, 6);
  group.add(instanced(coneLow, mat(WHITE), pines, (t, o) => {
    o.position.set(t.x + 0.5 + t.jx, (0.7 + 0.55) * t.s, t.y + 0.5 + t.jz);
    o.rotation.y = t.r;
    o.scale.setScalar(t.s);
    return pineGreens[Math.floor(t.shade * pineGreens.length)];
  }));
  group.add(instanced(coneHigh, mat(WHITE), pines, (t, o) => {
    o.position.set(t.x + 0.5 + t.jx, (0.7 + 1.15) * t.s, t.y + 0.5 + t.jz);
    o.rotation.y = t.r + 0.5;
    o.scale.setScalar(t.s);
    return pineGreens[Math.floor(t.shade * pineGreens.length)];
  }));

  // ---- Bushes and rocks ----------------------------------------------------
  group.add(instanced(new THREE.IcosahedronGeometry(0.42, 0), mat(WHITE), list('bush'), (p, o) => {
    o.position.set(p.x + 0.5, 0.3, p.y + 0.5);
    o.rotation.set(rng(), rng() * 3, 0);
    o.scale.set(1.1, 0.8, 1.1);
    return rng() < 0.5 ? 0x3f7f30 : 0x4b8a36;
  }));
  group.add(instanced(new THREE.DodecahedronGeometry(0.42, 0), mat(WHITE), list('rock'), (p, o) => {
    o.position.set(p.x + 0.5, 0.2, p.y + 0.5);
    o.rotation.set(rng() * 3, rng() * 3, rng() * 3);
    o.scale.set(1.1, 0.7, 1);
    return rng() < 0.5 ? 0x8b8a86 : 0x9a968e;
  }));

  // ---- Flowers (3 blossoms per tile) --------------------------------------
  const petals = [0xf2e35b, 0xf07ca8, 0xffffff, 0xb08cf0, 0xf29a4a];
  const blossoms = [];
  for (const p of list('flowers')) {
    const c = petals[Math.floor(rng() * petals.length)];
    for (let k = 0; k < 3; k++) blossoms.push({ x: p.x + 0.2 + rng() * 0.6, z: p.y + 0.2 + rng() * 0.6, c });
  }
  const blossomMesh = instanced(new THREE.IcosahedronGeometry(0.07, 0), mat(WHITE), blossoms, (b, o) => {
    o.position.set(b.x, 0.12, b.z);
    return b.c;
  });
  blossomMesh.castShadow = false;
  group.add(blossomMesh);

  // ---- Crops ---------------------------------------------------------------
  const crops = [];
  for (const p of list('crop')) for (const k of [0.3, 0.7]) crops.push({ x: p.x + k, z: p.y + 0.5, ripe: p.ripe });
  group.add(instanced(new THREE.ConeGeometry(0.13, 0.45, 5), mat(WHITE), crops, (c, o) => {
    o.position.set(c.x, 0.22, c.z);
    o.rotation.y = rng() * 3;
    return c.ripe ? 0xd9b13a : 0x7fb34a;
  }));

  // ---- Fences (posts + rails between neighbouring fence tiles) ------------
  const fence = list('fence');
  const isFence = new Set(fence.map((p) => `${p.x},${p.y}`));
  const rails = [];
  for (const p of fence) {
    if (isFence.has(`${p.x + 1},${p.y}`)) rails.push({ x: p.x + 1, z: p.y + 0.5, rot: 0 });
    if (isFence.has(`${p.x},${p.y + 1}`)) rails.push({ x: p.x + 0.5, z: p.y + 1, rot: Math.PI / 2 });
  }
  group.add(instanced(new THREE.BoxGeometry(0.13, 0.7, 0.13), mat(0x7a5634), fence, (p, o) => { o.position.set(p.x + 0.5, 0.35, p.y + 0.5); }));
  const railGeo = new THREE.BoxGeometry(1, 0.07, 0.06);
  for (const y of [0.28, 0.52]) group.add(instanced(railGeo, mat(0x8a6440), rails, (r, o) => { o.position.set(r.x, y, r.z); o.rotation.y = r.rot; }));

  // ---- One-off props -------------------------------------------------------
  const tagged = (obj, p) => {
    if (p.interact) {
      obj.traverse((m) => { if (m.isMesh) { m.userData.prop = p; interactables.push(m); } });
    }
    return obj;
  };

  for (const p of list('lamp')) {
    const g = new THREE.Group();
    g.position.set(p.x + 0.5, 0, p.y + 0.5);
    g.add(cyl(0.06, 0.08, 1.8, 6, 0x3a3530, 0, 0.9, 0));
    g.add(box(0.26, 0.3, 0.26, 0x3a3530, 0, 1.9, 0));
    const glass = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.22, 0.2), mat(0xffe28a, { emissive: 0xffc94a, emissiveIntensity: 0.9 }));
    glass.position.y = 1.9;
    g.add(glass);
    group.add(g);
  }

  for (const p of list('well')) {
    const c = center(p);
    const g = new THREE.Group();
    g.position.set(c.x, 0, c.z);
    g.add(cyl(0.85, 0.92, 0.65, 8, 0x8e8a80, 0, 0.33, 0));
    const water = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.05, 8), mat(0x3b6f9e));
    water.position.y = 0.6;
    g.add(water);
    for (const sx of [-0.75, 0.75]) g.add(box(0.12, 1.3, 0.12, 0x6e4a2c, sx, 1.1, 0));
    const bar = cyl(0.06, 0.06, 1.6, 6, 0x6e4a2c, 0, 1.45, 0);
    bar.rotation.z = Math.PI / 2;
    g.add(bar);
    const roof = gableRoof(1.7, 1.3, 0.55, 0.1, 0x7a3b28);
    roof.position.y = 1.7;
    g.add(roof);
    g.add(box(0.18, 0.16, 0.18, 0x5a3a20, 0.15, 1.2, 0));
    group.add(tagged(g, p));
  }

  for (const p of list('stall')) {
    const c = center(p);
    const g = new THREE.Group();
    g.position.set(c.x, 0, c.z);
    g.add(box(1.8, 0.75, 0.75, 0x8a6440, 0, 0.38, 0));
    for (const sx of [-0.85, 0.85]) for (const sz of [-0.32, 0.32]) g.add(box(0.07, 1.7, 0.07, 0x6e4a2c, sx, 0.85, sz));
    for (let k = 0; k < 4; k++) g.add(box(0.5, 0.06, 1.0, k % 2 ? 0xf3ead6 : 0xc0392b, -0.75 + k * 0.5, 1.72, 0));
    g.add(box(0.4, 0.3, 0.35, 0xa3784a, -0.55, 0.9, 0.05));
    group.add(tagged(g, p));
  }

  for (const p of list('sign')) {
    const g = new THREE.Group();
    g.position.set(p.x + 0.5, 0, p.y + 0.5);
    g.add(box(0.1, 1.05, 0.1, 0x6e4a2c, 0, 0.52, 0));
    g.add(box(0.85, 0.45, 0.07, 0x9c7346, 0, 1.0, 0.06));
    g.add(box(0.7, 0.06, 0.02, 0x4a321e, 0, 1.06, 0.1));
    g.add(box(0.55, 0.06, 0.02, 0x4a321e, 0, 0.94, 0.1));
    group.add(tagged(g, p));
  }

  for (const p of list('fallenTree')) {
    const c = center(p);
    const g = new THREE.Group();
    g.position.set(c.x, 0, c.z);
    const log = cyl(0.42, 0.5, p.tiles.length + 0.4, 7, 0x6b4a2c, 0, 0.45, 0);
    log.rotation.z = Math.PI / 2;
    g.add(log);
    const stump = cyl(0.5, 0.5, 0.08, 7, 0xc9a26b, p.tiles.length / 2 + 0.24, 0.45, 0);
    stump.rotation.z = Math.PI / 2;
    g.add(stump);
    for (const [bx, s] of [[-1.6, 0.9], [-2.4, 0.75], [-1.9, 0.6]]) {
      const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.6 * s, 0), mat(0x5a8c3a));
      leaf.position.set(bx, 0.7 + s * 0.2, (s - 0.75) * 1.2);
      leaf.castShadow = true;
      g.add(leaf);
    }
    for (const bx of [-0.6, 0.5, 1.4]) {
      const branch = box(0.12, 0.5, 0.12, 0x5a3a20, bx, 0.95, 0.15);
      branch.rotation.z = 0.6 - bx * 0.3;
      g.add(branch);
    }
    group.add(tagged(g, p));
  }

  for (const p of list('scarecrow')) {
    const g = new THREE.Group();
    g.position.set(p.x + 0.5, 0, p.y + 0.5);
    g.add(box(0.09, 1.6, 0.09, 0x6e4a2c, 0, 0.8, 0));
    g.add(box(1.0, 0.08, 0.08, 0x6e4a2c, 0, 1.15, 0));
    g.add(box(0.38, 0.5, 0.22, 0x8a5a9c, 0, 1.15, 0));
    g.add(box(0.26, 0.26, 0.26, 0xd9c48a, 0, 1.55, 0));
    g.add(cyl(0.3, 0.3, 0.04, 8, 0x5a4630, 0, 1.69, 0));
    g.add(cyl(0.12, 0.16, 0.2, 8, 0x5a4630, 0, 1.8, 0));
    group.add(tagged(g, p));
  }

  // ---- Buildings -----------------------------------------------------------
  for (const b of area.buildings) {
    const doorProp = area.props.find((p) => p.type === 'door' && p.building === b.id);
    group.add(buildBuilding(b, interactables, doorProp));
  }

  return { group, interactables };
}
