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
  // A phone on a weak signal (or a page opened mid-deploy) can fail to fetch
  // the 2-3 MB atlas, which used to drop the whole game back to code-drawn art
  // until a reload. Now it tries a few times, then reports the failure.
  for (let attempt = 0; attempt < 4; attempt++) {
    const v = `?v=${version}${attempt ? `&retry=${attempt}` : ''}`;
    try {
      const [meta, img] = await Promise.all([
        fetch(`${base}art.json${v}`, attempt ? { cache: 'reload' } : {}).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`art.json ${r.status}`)))),
        new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('art.png failed to load')); i.src = `${base}art.png${v}`; }),
      ]);
      if (!meta || !img.width) throw new Error('art was empty');
      sheet = img;
      META = meta;
      return true;
    } catch (err) {
      console.warn(`[art] attempt ${attempt + 1} failed:`, err);
      await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
    }
  }
  console.warn('[art] using code-drawn art');
  return false;
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
