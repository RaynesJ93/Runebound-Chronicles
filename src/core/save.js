// Local saving.
//
// - Two rotating slots, so a crash mid-save can never destroy the only copy.
// - Every save has a version number and a checksum.
// - Older saves are upgraded step by step through `migrations`, then merged
//   over the current defaults so new fields always exist.
// - Export/import as a text code, because iPhone Home Screen apps keep their
//   storage separate from Safari.

import { defaultState } from './state.js';

export const SAVE_VERSION = 1;

const SLOT_KEYS = ['rbc.save.0', 'rbc.save.1'];
const LAST_KEY = 'rbc.save.last';
const CODE_PREFIX = 'RBC1:';

// migrations[n] turns a version-n save into a version-(n+1) save.
// Example for a future change:
//   1: (d) => { d.player.hp = 10; return d; },
const migrations = {};

function fnv(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}

function safeGet(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function safeSet(key, value) {
  try { localStorage.setItem(key, value); return true; } catch { return false; }
}

function safeRemove(key) {
  try { localStorage.removeItem(key); } catch { /* ignore */ }
}

export function deepMerge(base, over) {
  if (Array.isArray(base)) return Array.isArray(over) ? over : base;
  if (base && typeof base === 'object') {
    const out = { ...base };
    if (over && typeof over === 'object' && !Array.isArray(over)) {
      for (const k of Object.keys(over)) out[k] = k in base ? deepMerge(base[k], over[k]) : over[k];
    }
    return out;
  }
  return over === undefined || (over !== null && typeof over !== typeof base && base !== null) ? base : over;
}

function makeEnvelope(state) {
  const data = JSON.stringify(state);
  return { version: SAVE_VERSION, savedAt: Date.now(), sum: fnv(data), data };
}

function parseEnvelope(raw) {
  if (!raw) return null;
  try {
    const env = JSON.parse(raw);
    if (!env || typeof env.data !== 'string' || fnv(env.data) !== env.sum) return null;
    return { version: env.version | 0, savedAt: +env.savedAt || 0, data: JSON.parse(env.data) };
  } catch {
    return null;
  }
}

export function migrate(version, data) {
  let v = version;
  let d = data;
  if (v > SAVE_VERSION) throw new Error('This save comes from a newer version of the game.');
  while (v < SAVE_VERSION) {
    const step = migrations[v];
    if (!step) throw new Error(`No upgrade path from save version ${v}.`);
    d = step(d);
    v++;
  }
  return deepMerge(defaultState(), d);
}

export function loadGame() {
  const candidates = SLOT_KEYS
    .map((k) => parseEnvelope(safeGet(k)))
    .filter(Boolean)
    .sort((a, b) => b.savedAt - a.savedAt);
  for (const c of candidates) {
    try {
      return { state: migrate(c.version, c.data), loaded: true };
    } catch (err) {
      console.warn('[save] skipping unreadable save:', err);
    }
  }
  return { state: defaultState(), loaded: false };
}

export function saveGame(state) {
  const env = makeEnvelope(state);
  const last = parseInt(safeGet(LAST_KEY) ?? '-1', 10);
  const slot = Number.isFinite(last) ? (last + 1) % SLOT_KEYS.length : 0;
  if (!safeSet(SLOT_KEYS[slot], JSON.stringify(env))) return false;
  safeSet(LAST_KEY, String(slot));
  return true;
}

export function wipeSave() {
  for (const k of SLOT_KEYS) safeRemove(k);
  safeRemove(LAST_KEY);
}

function toBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

function fromBase64(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function exportSave(state) {
  return CODE_PREFIX + toBase64(JSON.stringify(makeEnvelope(state)));
}

export function importSave(code) {
  const text = String(code || '').replace(/\s+/g, '');
  if (!text.startsWith(CODE_PREFIX)) throw new Error("That doesn't look like a RuneBound save code.");
  let env;
  try { env = parseEnvelope(fromBase64(text.slice(CODE_PREFIX.length))); } catch { env = null; }
  if (!env) throw new Error('That save code is damaged or incomplete.');
  return migrate(env.version, env.data);
}
