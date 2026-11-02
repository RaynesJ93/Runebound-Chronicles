import * as THREE from 'three';
import { GAME_VERSION, BUILD_NAME } from './version.js';
import { Ticker } from './core/tick.js';
import { loadGame, saveGame, exportSave, importSave, wipeSave } from './core/save.js';
import { Area, adjacentTo } from './world/area.js';
import { findPath } from './world/pathfinding.js';
import { buildBrambleford } from '../data/areas/brambleford.js';
import { createRenderer, ZOOM_MIN, ZOOM_MAX } from './render/renderer.js';
import { buildTerrain } from './render/terrain.js';
import { buildProps } from './render/props.js';
import { createHumanoid } from './render/characters.js';
import { createMarker } from './render/marker.js';
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

  let view;
  try {
    view = createRenderer(canvas);
  } catch (err) {
    console.error(err);
    fail('Your browser could not start 3D graphics (WebGL). Try updating it, or turn off Low Power Mode.');
    return;
  }
  const { scene, rig, camera } = view;
  const terrain = buildTerrain(area);
  const props = buildProps(area);
  scene.add(terrain.group, props.group);

  const marker = createMarker();
  scene.add(marker.object);

  const playerModel = createHumanoid();
  scene.add(playerModel.root);

  const player = new PlayerController(area, state);
  const hud = new Hud(document.getElementById('ui'));
  const input = new Input(canvas);
  input.bindDpad(hud.el.dpad);

  rig.distance = THREE.MathUtils.clamp(state.settings.zoom || 16, ZOOM_MIN, ZOOM_MAX);
  const start = player.worldPosition();
  rig.target.set(start.x, 0, start.z);

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
    hud.el.setShadows.textContent = s.shadows ? 'On' : 'Off';
    view.setShadows(s.shadows);
  };
  applySettings();
  hud.el.version.textContent = `RuneBound Chronicles v${GAME_VERSION} · ${BUILD_NAME}`;
  hud.onSettingsOpen = () => { hud.el.saveStatus.textContent = describeSave(); };

  hud.el.setDpad.addEventListener('click', () => {
    const order = ['auto', 'on', 'off'];
    state.settings.dpad = order[(order.indexOf(state.settings.dpad) + 1) % order.length];
    applySettings();
  });
  hud.el.setShadows.addEventListener('click', () => {
    state.settings.shadows = !state.settings.shadows;
    applySettings();
  });
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
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();

  const walkTo = (tx, ty) => {
    const s = player.pathStart;
    const path = findPath(area, s.x, s.y, (x, y) => x === tx && y === ty, { x: tx, y: ty });
    player.setPath(path);
    if (path && path.length) {
      const end = path.at(-1);
      marker.show(end.x, end.y);
    } else {
      marker.hide();
    }
  };

  const interactWith = (prop) => {
    const s = player.pathStart;
    const isGoal = adjacentTo(prop.tiles);
    const path = isGoal(s.x, s.y) ? [] : findPath(area, s.x, s.y, isGoal);
    if (!path) { hud.message("I can't reach that."); return; }
    player.setPath(path, { prop, isGoal });
    if (path.length) marker.show(path.at(-1).x, path.at(-1).y);
    else marker.hide();
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
    const rect = canvas.getBoundingClientRect();
    ndc.set(((sx - rect.left) / rect.width) * 2 - 1, -((sy - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects([...props.interactables, terrain.ground], false);
    if (!hits.length) return;
    const hit = hits[0];
    if (hit.object.userData.prop) { interactWith(hit.object.userData.prop); firstMove(); return; }
    const tx = Math.floor(hit.point.x);
    const ty = Math.floor(hit.point.z);
    if (!area.inBounds(tx, ty)) return;
    walkTo(tx, ty);
    firstMove();
  };

  input.onKey = (e) => {
    if (e.code === 'KeyR') toggleRun();
    else if (e.code === 'Escape') { if (hud.dialogOpen) hud.advanceDialog(); else if (hud.settingsOpen) hud.closeSettings(); }
    else if ((e.code === 'Space' || e.code === 'Enter') && hud.dialogOpen) { e.preventDefault(); hud.advanceDialog(); }
  };

  const toggleRun = () => {
    if (!state.run.on && state.run.energy < 1) { hud.message('You have no run energy left.'); return; }
    state.run.on = !state.run.on;
  };
  hud.el.runOrb.addEventListener('click', toggleRun);

  player.onInteract = (prop) => {
    marker.hide();
    if (prop.interact) hud.showDialog(prop.interact);
  };
  player.onRunEmpty = () => hud.message("You're out of run energy.");
  player.onStep = () => {
    if (!player.path.length && !player.moving) marker.hide();
  };

  // ---- Ticks ----------------------------------------------------------------
  const ticker = new Ticker();
  ticker.on((n) => {
    player.onTick();
    state.stats.playTimeSec += 0.6;
    if (n % AUTOSAVE_TICKS === 0) save();
  });

  // ---- Frame loop -------------------------------------------------------------
  let last = performance.now();
  const frame = (now) => {
    const dt = Math.min(0.25, (now - last) / 1000);
    last = now;

    const zoom = input.consumeZoom();
    if (zoom) {
      rig.distance = THREE.MathUtils.clamp(rig.distance + zoom, ZOOM_MIN, ZOOM_MAX);
      state.settings.zoom = Math.round(rig.distance * 10) / 10;
    }

    const blocked = hud.dialogOpen || hud.settingsOpen;
    const dir = blocked ? null : input.heldDir();
    if (dir) { marker.hide(); firstMove(); }
    ticker.update(dt);
    player.update(dt, dir);

    const wp = player.worldPosition();
    const ground = terrain.heightAt(wp.x, wp.z);
    playerModel.root.position.set(wp.x, Math.max(0, ground), wp.z);
    playerModel.root.rotation.y = player.facing;
    playerModel.animate(dt, player.moving, player.stepRunning);

    const follow = 1 - Math.exp(-dt * 9);
    rig.target.x += (wp.x - rig.target.x) * follow;
    rig.target.z += (wp.z - rig.target.z) * follow;
    view.updateCamera();

    marker.update(dt);
    hud.setRun(state.run.on, state.run.energy);
    view.render();
    requestAnimationFrame(frame);
  };

  view.resize();
  window.addEventListener('resize', view.resize);
  window.addEventListener('orientationchange', () => setTimeout(view.resize, 200));
  view.updateCamera();
  requestAnimationFrame(frame);

  document.getElementById('loading')?.classList.add('done');
  setTimeout(() => hud.showArea(area.name), 400);
  if (!loaded) setTimeout(() => hud.message('Welcome to RuneBound Chronicles.'), 900);
  else setTimeout(() => hud.message('Welcome back.'), 900);
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
