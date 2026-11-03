// Painted art from the sprite atlas (assets/art.png, made by tools/build_art.py).
//
// loadArt() runs once before the game starts. art('oak') then gives the list
// of sprite variants for a name ({ img, ax, ay, w, h }, like the code-drawn
// sprites), or null when the atlas doesn't have it, so the game falls back to
// drawing that thing in code. If the atlas fails to load at all, everything
// is drawn in code as before.

let META = null;
const cache = new Map();
let sheet = null;

export async function loadArt(version = '', base = './assets/') {
  const v = version ? `?v=${version}` : '';
  try {
    const [meta, img] = await Promise.all([
      fetch(`${base}art.json${v}`).then((r) => (r.ok ? r.json() : null)),
      new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = `${base}art.png${v}`; }),
    ]);
    if (!meta) return false;
    sheet = img;
    META = meta;
    return true;
  } catch (err) {
    console.warn('[art] using code-drawn art:', err);
    return false;
  }
}

function cut(x, y, w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(sheet, x, y, w, h, 0, 0, w, h);
  return c;
}

export function art(name) {
  if (!META || !META[name]) return null;
  if (!cache.has(name)) cache.set(name, META[name].map(([x, y, w, h, ax, ay]) => ({ img: cut(x, y, w, h), ax, ay, w, h })));
  return cache.get(name);
}

// A ground texture's pixels (RGBA, repeating), or null.
export function texture(name) {
  const a = art('tex:' + name);
  if (!a) return null;
  const c = a[0].img;
  return { w: c.width, h: c.height, data: c.getContext('2d').getImageData(0, 0, c.width, c.height).data };
}
