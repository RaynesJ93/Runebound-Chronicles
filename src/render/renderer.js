import * as THREE from 'three';

// Scene, lights and the Emerald-style camera: fixed angle, looking north,
// following the player. Only the distance (zoom) can change.

export const ZOOM_MIN = 8;
export const ZOOM_MAX = 24;

export function createRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const sky = 0xa9d3ee;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(sky);
  scene.fog = new THREE.Fog(sky, 30, 60);

  const camera = new THREE.PerspectiveCamera(40, 1, 0.5, 120);

  scene.add(new THREE.HemisphereLight(0xe8f4ff, 0x6a5a3a, 1.25));

  const sun = new THREE.DirectionalLight(0xfff0d0, 1.9);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 70 });
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.04;
  scene.add(sun, sun.target);

  const rig = {
    target: new THREE.Vector3(),
    distance: 16,
    pitch: THREE.MathUtils.degToRad(54),
  };

  function updateCamera() {
    const { target: t, distance: d, pitch } = rig;
    camera.position.set(t.x, t.y + d * Math.sin(pitch), t.z + d * Math.cos(pitch));
    camera.lookAt(t.x, t.y + 0.6, t.z);
    sun.position.set(t.x + 9, t.y + 24, t.z + 7);
    sun.target.position.copy(t);
  }

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Portrait phones need a wider view so you can see around you.
    camera.fov = camera.aspect < 0.75 ? 58 : camera.aspect < 1.1 ? 48 : 40;
    camera.updateProjectionMatrix();
  }

  function setShadows(on) {
    renderer.shadowMap.enabled = on;
    sun.castShadow = on;
    scene.traverse((o) => { if (o.material) o.material.needsUpdate = true; });
  }

  return { renderer, scene, camera, rig, sun, updateCamera, resize, setShadows, render: () => renderer.render(scene, camera) };
}
