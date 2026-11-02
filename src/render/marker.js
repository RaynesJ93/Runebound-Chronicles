import * as THREE from 'three';

// The yellow cross that marks where you clicked to walk.

export function createMarker() {
  const g = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({ color: 0xffe14a, transparent: true, opacity: 0.95, depthWrite: false });
  for (const r of [Math.PI / 4, -Math.PI / 4]) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.03, 0.12), material);
    bar.rotation.y = r;
    g.add(bar);
  }
  g.visible = false;
  let t = 0;

  return {
    object: g,
    show(x, y, height = 0) {
      g.position.set(x + 0.5, height + 0.06, y + 0.5);
      g.visible = true;
      t = 0;
    },
    hide() { g.visible = false; },
    update(dt) {
      if (!g.visible) return;
      t += dt;
      const s = 1 + Math.sin(t * 8) * 0.08;
      g.scale.set(s, 1, s);
    },
  };
}
