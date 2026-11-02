import { GAME_VERSION, BUILD_NAME } from './version.js';
import { Ticker } from './core/tick.js';
import { loadGame, saveGame, exportSave, importSave, wipeSave } from './core/save.js';
import { Area, adjacentTo } from './world/area.js';
import { findPath } from './world/pathfinding.js';
import { buildBrambleford } from '../data/areas/brambleford.js';
import { createWorldView } from './render/world2d.js';
import { PlayerController } from './entities/player.js';
import { Input } from './input/input.js';
import { Hud } from './ui/hud.js';

const AUTOSAVE_TICKS = 50; // 30 seconds

function fail(message) {
  const el = document.getElementById('loading-text');
  if (el) el.textContent = message;
  document.getElementById('loading')?.classList.add('error');
}

function boot() {
  const canvas = document.getElementById('game');
  const { state, loaded } = loadGame();

  // ---- World ---------------------------------------------------------------
  const area = new Area(buildBrambleford());
  if (!area.isWalkable(state.player.x, state.player.y)) Object.assign(state.player, area.spawn);

  const view = createWorldView(canvas, area);
  const player = new PlayerController(area, state);
  const hud = new Hud(document.getElementById('ui'));
  const input = new Input(canvas);
  input.bindDpad(hud.el.dpad);

  // Tiles you can tap to look at something: props with text, and every tile
  // of a building (which opens its door text).
  const lookup = new Map();
  for (const p of area.props) if (p.interact) for (const t of p.tiles) lookup.set(area.idx(t.x, t.y), p);
  for (const b of area.buildings) {
    const door = area.props.find((p) => p.type === 'door' && p.building === b.id);
    for (let y = b.y - 1; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) if (area.inBounds(x, y) && (y >= b.y || !area.isWalkable(x, y))) lookup.set(area.idx(x, y), door);
  }

  // ---- Saving --------------------------------------------------------------
  let lastSaved = loaded ? Date.now() : 0;
  let blockSaves = false;
  const save = () => {
    if (blockSaves) return false;
    const ok = saveGame(state);
    if (ok) lastSaved = Date.now();
    return ok;
  };
  const describeSave = () => {
    if (!lastSaved) return 'Your game saves automatically.';
    const secs = Math.round((Date.now() - lastSaved) / 1000);
    return `Saved automatically · last save ${secs < 5 ? 'just now' : secs < 90 ? `${secs} seconds ago` : `${Math.round(secs / 60)} minutes ago`}.`;
  };
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') save(); });
  window.addEventListener('pagehide', save);

  // ---- Settings ------------------------------------------------------------
  const coarse = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  const DPAD_LABEL = { auto: 'Auto', on: 'On', off: 'Off' };
  const applySettings = () => {
    const s = state.settings;
    hud.setDpadVisible(s.dpad === 'on' || (s.dpad === 'auto' && coarse));
    hud.el.setDpad.textContent = DPAD_LABEL[s.dpad] || 'Auto';
    s.zoomStep = view.setZoomStep(s.zoomStep || 0);
    hud.el.zoomVal.textContent = s.zoomStep > 0 ? `+${s.zoomStep}` : String(s.zoomStep);
  };
  hud.el.version.textContent = `RuneBound Chronicles v${GAME_VERSION} · ${BUILD_NAME}`;
  hud.onSettingsOpen = () => { hud.el.saveStatus.textContent = describeSave(); };

  hud.el.setDpad.addEventListener('click', () => {
    const order = ['auto', 'on', 'off'];
    state.settings.dpad = order[(order.indexOf(state.settings.dpad) + 1) % order.length];
    applySettings();
  });
  const zoomBy = (d) => { state.settings.zoomStep = (state.settings.zoomStep || 0) + d; applySettings(); };
  hud.$('zoom-in').addEventListener('click', () => zoomBy(1));
  hud.$('zoom-out').addEventListener('click', () => zoomBy(-1));

  hud.$('save-now').addEventListener('click', () => {
    hud.toast(save() ? 'Game saved.' : "Couldn't save — storage may be full or blocked.");
    hud.el.saveStatus.textContent = describeSave();
  });
  hud.$('save-copy').addEventListener('click', async () => {
    const code = exportSave(state);
    try {
      await navigator.clipboard.writeText(code);
      hud.toast('Save code copied.');
    } catch {
      hud.el.importBox.classList.remove('hidden');
      hud.el.importText.value = code;
      hud.el.importText.select();
      hud.toast('Select the code and copy it.');
    }
  });
  hud.$('save-download').addEventListener('click', () => {
    const blob = new Blob([exportSave(state)], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `runebound-save-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  });
  hud.$('import-go').addEventListener('click', () => {
    try {
      const imported = importSave(hud.el.importText.value);
      blockSaves = true;
      saveGame(imported);
      hud.toast('Save loaded. Restarting…');
      setTimeout(() => location.reload(), 600);
    } catch (err) {
      hud.toast(err.message);
    }
  });
  const resetBtn = hud.$('save-reset');
  resetBtn.addEventListener('click', () => {
    if (resetBtn.dataset.armed !== '1') {
      resetBtn.dataset.armed = '1';
      resetBtn.textContent = 'Tap again to erase your save';
      return;
    }
    blockSaves = true;
    wipeSave();
    location.reload();
  });

  // ---- Movement and interaction -------------------------------------------
  let marker = null;

  const walkTo = (tx, ty) => {
    const s = player.pathStart;
    const path = findPath(area, s.x, s.y, (x, y) => x === tx && y === ty, { x: tx, y: ty });
    player.setPath(path);
    marker = path && path.length ? path.at(-1) : null;
  };

  const interactWith = (prop) => {
    const s = player.pathStart;
    const isGoal = adjacentTo(prop.tiles);
    const path = isGoal(s.x, s.y) ? [] : findPath(area, s.x, s.y, isGoal);
    if (!path) { hud.message("I can't reach that."); return; }
    player.setPath(path, { prop, isGoal });
    marker = path.length ? path.at(-1) : null;
  };

  const firstMove = () => {
    if (!state.flags.seenMoveHint) {
      state.flags.seenMoveHint = true;
      hud.hideHint();
    }
  };

  input.onTap = (sx, sy) => {
    if (hud.dialogOpen) { hud.advanceDialog(); return; }
    if (hud.settingsOpen) return;
    const t = view.screenToTile(sx, sy);
    if (!area.inBounds(t.x, t.y)) return;
    const prop = lookup.get(area.idx(t.x, t.y));
    if (prop) interactWith(prop);
    else walkTo(t.x, t.y);
    firstMove();
  };

  const toggleRun = () => {
    if (!state.run.on && state.run.energy < 1) { hud.message('You have no run energy left.'); return; }
    state.run.on = !state.run.on;
  };
  hud.el.runOrb.addEventListener('click', toggleRun);

  input.onKey = (e) => {
    if (e.code === 'KeyR') toggleRun();
    else if (e.code === 'Equal' || e.code === 'NumpadAdd') zoomBy(1);
    else if (e.code === 'Minus' || e.code === 'NumpadSubtract') zoomBy(-1);
    else if (e.code === 'Escape') { if (hud.dialogOpen) hud.advanceDialog(); else if (hud.settingsOpen) hud.closeSettings(); }
    else if ((e.code === 'Space' || e.code === 'Enter') && hud.dialogOpen) { e.preventDefault(); hud.advanceDialog(); }
  };

  player.onInteract = (prop) => {
    marker = null;
    if (prop.interact) hud.showDialog(prop.interact);
  };
  player.onRunEmpty = () => hud.message("You're out of run energy.");
  player.onStep = () => {
    if (!player.path.length) marker = null;
  };

  // ---- Ticks ----------------------------------------------------------------
  const ticker = new Ticker();
  ticker.on((n) => {
    player.onTick();
    state.stats.playTimeSec += 0.6;
    if (n % AUTOSAVE_TICKS === 0) save();
  });

  // ---- Frame loop -------------------------------------------------------------
  let zoomAcc = 0;
  let last = performance.now();
  let time = 0;
  const frame = (now) => {
    const dt = Math.max(0, Math.min(0.25, (now - last) / 1000));
    last = now;
    time += dt;

    // Wheel and pinch: positive = zoom out. One whole step at a time.
    zoomAcc += input.consumeZoom();
    if (Math.abs(zoomAcc) >= 1) {
      zoomBy(zoomAcc > 0 ? -1 : 1);
      zoomAcc = 0;
    }

    const blocked = hud.dialogOpen || hud.settingsOpen;
    const dir = blocked ? null : input.heldDir();
    if (dir) { marker = null; firstMove(); }
    ticker.update(dt);
    player.update(dt, dir);

    view.render(player, { time, steps: state.stats.tilesWalked, marker });
    hud.setRun(state.run.on, state.run.energy);
    requestAnimationFrame(frame);
  };

  const onResize = () => { view.resize(); applySettings(); };
  onResize();
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', () => setTimeout(onResize, 200));
  requestAnimationFrame(frame);

  document.getElementById('loading')?.classList.add('done');
  setTimeout(() => hud.showArea(area.name), 400);
  setTimeout(() => hud.message(loaded ? 'Welcome back.' : 'Welcome to RuneBound Chronicles.'), 900);
  if (!state.flags.seenMoveHint) {
    hud.showHint(coarse ? 'Tap the ground to walk · tap signs and doors to look' : 'Click to walk, or use WASD / arrow keys · R toggles run');
  }
  if (!loaded) save();

  // Handle for testing in the browser console.
  window.RBC = { state, player, area, save, hud, view, version: GAME_VERSION };
}

try {
  boot();
} catch (err) {
  console.error(err);
  fail(`Something went wrong while loading: ${err.message}`);
}
