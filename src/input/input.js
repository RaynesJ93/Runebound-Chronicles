// Keyboard, mouse, touch and D-pad input.
//
// - WASD / arrow keys: held direction (most recent key wins)
// - Click / tap: onTap(screenX, screenY)
// - Mouse wheel / pinch: zoom
// - D-pad (on-screen): held direction while touched

const KEYMAP = {
  ArrowUp: [0, -1], KeyW: [0, -1],
  ArrowDown: [0, 1], KeyS: [0, 1],
  ArrowLeft: [-1, 0], KeyA: [-1, 0],
  ArrowRight: [1, 0], KeyD: [1, 0],
};

const TAP_MOVE_PX = 12;
const TAP_MAX_MS = 650;

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.held = [];
    this.dpadDir = null;
    this.zoomDelta = 0;
    this.pointers = new Map();
    this.pinchDist = 0;
    this.onTap = null;
    this.onKey = null;
    this.enabled = true;

    const isTyping = (e) => e.target instanceof HTMLElement && e.target.closest('input, textarea, select');

    window.addEventListener('keydown', (e) => {
      if (isTyping(e)) return;
      if (KEYMAP[e.code]) {
        e.preventDefault();
        if (!this.held.includes(e.code)) this.held.push(e.code);
      } else if (!e.repeat) {
        this.onKey?.(e);
      }
    });
    window.addEventListener('keyup', (e) => {
      const i = this.held.indexOf(e.code);
      if (i >= 0) this.held.splice(i, 1);
    });
    window.addEventListener('blur', () => { this.held.length = 0; this.dpadDir = null; });

    canvas.addEventListener('pointerdown', (e) => this.down(e));
    canvas.addEventListener('pointermove', (e) => this.move(e));
    canvas.addEventListener('pointerup', (e) => this.up(e, true));
    canvas.addEventListener('pointercancel', (e) => this.up(e, false));
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.zoomDelta += Math.sign(e.deltaY) * Math.min(2, Math.abs(e.deltaY) / 60);
    }, { passive: false });

    // Stop iOS Safari's own pinch-zoom and double-tap zoom on the page.
    for (const ev of ['gesturestart', 'gesturechange', 'gestureend']) document.addEventListener(ev, (e) => e.preventDefault());
    document.addEventListener('dblclick', (e) => e.preventDefault());
  }

  down(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    try { this.canvas.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: performance.now(), moved: false, pinch: false });
    if (this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()];
      a.pinch = b.pinch = true;
      this.pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
    }
  }

  move(e) {
    const p = this.pointers.get(e.pointerId);
    if (!p) return;
    p.x = e.clientX;
    p.y = e.clientY;
    if (Math.hypot(p.x - p.sx, p.y - p.sy) > TAP_MOVE_PX) p.moved = true;
    if (this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      this.zoomDelta += (this.pinchDist - d) * 0.035;
      this.pinchDist = d;
    }
  }

  up(e, fire) {
    const p = this.pointers.get(e.pointerId);
    this.pointers.delete(e.pointerId);
    if (!p || !fire || !this.enabled) return;
    if (!p.moved && !p.pinch && performance.now() - p.t < TAP_MAX_MS) this.onTap?.(e.clientX, e.clientY);
  }

  heldDir() {
    if (this.dpadDir) return this.dpadDir;
    const code = this.held.at(-1);
    return code ? { dx: KEYMAP[code][0], dy: KEYMAP[code][1] } : null;
  }

  consumeZoom() {
    const z = this.zoomDelta;
    this.zoomDelta = 0;
    return z;
  }

  // The D-pad is a circle: direction comes from where your thumb is relative to
  // its centre, so you can slide between directions without lifting.
  bindDpad(el) {
    let active = null;
    const update = (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      if (Math.hypot(dx, dy) < r.width * 0.12) { this.dpadDir = null; el.dataset.dir = ''; return; }
      const horiz = Math.abs(dx) > Math.abs(dy);
      this.dpadDir = horiz ? { dx: Math.sign(dx), dy: 0 } : { dx: 0, dy: Math.sign(dy) };
      el.dataset.dir = horiz ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    };
    const end = (e) => {
      if (active !== e.pointerId) return;
      active = null;
      this.dpadDir = null;
      el.dataset.dir = '';
    };
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      active = e.pointerId;
      try { el.setPointerCapture(e.pointerId); } catch { /* ignore */ }
      update(e);
    });
    el.addEventListener('pointermove', (e) => { if (active === e.pointerId) update(e); });
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('contextmenu', (e) => e.preventDefault());
  }
}
