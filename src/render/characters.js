import * as THREE from 'three';
import { mat } from './materials.js';

// A blocky low-poly humanoid built from boxes, facing +z (towards the camera)
// at rotation 0. Limbs hang from pivot groups so they can swing when walking.

function part(w, h, d, color, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
  m.position.set(x, y, z);
  m.castShadow = true;
  return m;
}

export const DEFAULT_LOOK = {
  skin: 0xe0b48a,
  hair: 0x5a3a1e,
  tunic: 0x3f6fb0,
  trim: 0xd4af37,
  legs: 0x5b4632,
  boots: 0x3a2a1c,
  belt: 0x4a321e,
};

export function createHumanoid(look = DEFAULT_LOOK) {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  const hip = 0.62;
  const legs = [-1, 1].map((side) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.11, hip, 0);
    pivot.add(part(0.17, 0.56, 0.19, look.legs, 0, -0.28, 0));
    pivot.add(part(0.19, 0.12, 0.26, look.boots, 0, -0.56, 0.03));
    body.add(pivot);
    return pivot;
  });

  body.add(part(0.46, 0.5, 0.26, look.tunic, 0, hip + 0.25, 0));
  body.add(part(0.48, 0.08, 0.28, look.belt, 0, hip + 0.03, 0));
  body.add(part(0.1, 0.08, 0.02, look.trim, 0, hip + 0.03, 0.145));
  body.add(part(0.2, 0.06, 0.02, look.trim, 0, hip + 0.47, 0.135));

  const arms = [-1, 1].map((side) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.31, hip + 0.46, 0);
    pivot.add(part(0.14, 0.46, 0.16, look.tunic, 0, -0.2, 0));
    pivot.add(part(0.12, 0.12, 0.13, look.skin, 0, -0.48, 0));
    body.add(pivot);
    return pivot;
  });

  const head = new THREE.Group();
  head.position.y = hip + 0.68;
  head.add(part(0.3, 0.3, 0.3, look.skin, 0, 0, 0));
  head.add(part(0.33, 0.1, 0.33, look.hair, 0, 0.17, 0));
  head.add(part(0.33, 0.24, 0.08, look.hair, 0, 0.05, -0.13));
  for (const sx of [-0.07, 0.07]) head.add(part(0.05, 0.05, 0.02, 0x1d1d2a, sx, 0.02, 0.155));
  body.add(head);

  let phase = 0;
  let swing = 0;

  // moving: currently stepping; running: faster gait
  function animate(dt, moving, running) {
    const targetSwing = moving ? (running ? 0.85 : 0.55) : 0;
    swing += (targetSwing - swing) * Math.min(1, dt * 12);
    if (moving) phase += dt * (running ? 14 : 9);
    else phase += (Math.round(phase / Math.PI) * Math.PI - phase) * Math.min(1, dt * 10);
    const s = Math.sin(phase) * swing;
    legs[0].rotation.x = s;
    legs[1].rotation.x = -s;
    arms[0].rotation.x = -s * 0.9;
    arms[1].rotation.x = s * 0.9;
    body.position.y = Math.abs(Math.sin(phase)) * 0.05 * (swing / 0.85);
    body.rotation.x = running && moving ? 0.08 : body.rotation.x * 0.9;
  }

  return { root, animate };
}
