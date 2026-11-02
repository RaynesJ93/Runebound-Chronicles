import * as THREE from 'three';
import { GROUND } from '../world/area.js';
import { hash2 } from '../core/rng.js';

// One flat-shaded quad per tile, with a little height noise on grass and
// sunken banks around water. A single water plane sits just below ground level.

const PALETTE = {
  [GROUND.GRASS]: [0x6db34f, 0x64a846, 0x77bb57, 0x5f9f42],
  [GROUND.PATH]: [0xbd9e6b, 0xb39362, 0xc4a674],
  [GROUND.PLAZA]: [0xa39b8e, 0x989083, 0xada597],
  [GROUND.WATER]: [0x6f8f6a],
  [GROUND.SAND]: [0xdccb92, 0xd3c189],
  [GROUND.DIRT]: [0x7d5b3b, 0x735335],
};

export function buildTerrain(area) {
  const { W, H } = area;
  const VW = W + 1;
  const height = new Float32Array(VW * (H + 1));

  for (let vy = 0; vy <= H; vy++) {
    for (let vx = 0; vx <= W; vx++) {
      let water = 0;
      let grass = 0;
      for (const [tx, ty] of [[vx - 1, vy - 1], [vx, vy - 1], [vx - 1, vy], [vx, vy]]) {
        if (!area.inBounds(tx, ty)) { grass++; continue; }
        const g = area.groundAt(tx, ty);
        if (g === GROUND.WATER) water++;
        else if (g === GROUND.GRASS) grass++;
      }
      let h;
      if (water === 4) h = -0.5;
      else if (water > 0) h = -0.14;
      else if (grass === 4) h = (hash2(vx, vy, 7) - 0.3) * 0.14;
      else h = (hash2(vx, vy, 9) - 0.5) * 0.03;
      height[vy * VW + vx] = h;
    }
  }

  const positions = new Float32Array(W * H * 18);
  const colors = new Float32Array(W * H * 18);
  const col = new THREE.Color();
  let p = 0;

  const vtx = (x, y, c) => {
    positions[p] = x;
    positions[p + 1] = height[y * VW + x];
    positions[p + 2] = y;
    colors[p] = c.r;
    colors[p + 1] = c.g;
    colors[p + 2] = c.b;
    p += 3;
  };

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const shades = PALETTE[area.groundAt(x, y)];
      const pick = shades[Math.floor(hash2(x, y, 3) * shades.length)];
      col.setHex(pick);
      vtx(x, y, col); vtx(x, y + 1, col); vtx(x + 1, y, col);
      col.offsetHSL(0, 0, (hash2(x, y, 5) - 0.5) * 0.03);
      vtx(x + 1, y, col); vtx(x, y + 1, col); vtx(x + 1, y + 1, col);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();

  const ground = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }));
  ground.receiveShadow = true;
  ground.name = 'terrain';

  const waterGeo = new THREE.PlaneGeometry(W, H);
  waterGeo.rotateX(-Math.PI / 2);
  const water = new THREE.Mesh(waterGeo, new THREE.MeshLambertMaterial({ color: 0x4f8fc4, transparent: true, opacity: 0.85 }));
  water.position.set(W / 2, -0.2, H / 2);
  water.receiveShadow = true;

  // A wide skirt of forest-floor colour so the edge of the map never shows sky.
  const skirtGeo = new THREE.PlaneGeometry(W + 80, H + 80);
  skirtGeo.rotateX(-Math.PI / 2);
  const skirt = new THREE.Mesh(skirtGeo, new THREE.MeshLambertMaterial({ color: 0x3f6e33, polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 2 }));
  skirt.position.set(W / 2, -0.05, H / 2);

  const group = new THREE.Group();
  group.add(skirt, ground, water);

  const heightAt = (wx, wz) => {
    const x = Math.max(0, Math.min(W, Math.round(wx)));
    const y = Math.max(0, Math.min(H, Math.round(wz)));
    return height[y * VW + x];
  };

  return { group, ground, heightAt };
}
