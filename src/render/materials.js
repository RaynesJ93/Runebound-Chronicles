import * as THREE from 'three';

// Shared flat-shaded materials — the low-poly look comes from flat shading.
const cache = new Map();

export function mat(color, opts = {}) {
  const key = `${color}|${JSON.stringify(opts)}`;
  if (!cache.has(key)) cache.set(key, new THREE.MeshLambertMaterial({ color, flatShading: true, ...opts }));
  return cache.get(key);
}

// Text drawn onto a canvas, for shop and bank signboards.
export function textTexture(text, { width = 256, height = 64, bg = '#6b4a2b', fg = '#f5e6b8', font = 'bold 34px Georgia, serif' } = {}) {
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  const g = c.getContext('2d');
  g.fillStyle = bg;
  g.fillRect(0, 0, width, height);
  g.strokeStyle = 'rgba(0,0,0,0.45)';
  g.lineWidth = 6;
  g.strokeRect(3, 3, width - 6, height - 6);
  g.font = font;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = 'rgba(0,0,0,0.5)';
  g.fillText(text, width / 2 + 2, height / 2 + 3);
  g.fillStyle = fg;
  g.fillText(text, width / 2, height / 2 + 1);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}
