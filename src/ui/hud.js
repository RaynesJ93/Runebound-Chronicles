// The on-screen interface: area name banner, game messages, run orb,
// D-pad, dialogue box and the settings panel (with save backup tools).

import { iconUrl } from '../render/icons.js';
import { itemIcon, stackLabel } from '../render/items.js';
import { ITEMS } from '../../data/items.js';
import { SLOT_NAME, TYPES } from '../items/equipment.js';

// Where each equipment slot sits on the 3 x 5 grid (like a paper doll).
const DOLL = [
  [null, 'head', null],
  ['cape', 'neck', 'ammo'],
  ['weapon', 'body', 'shield'],
  [null, 'legs', null],
  ['hands', 'feet', 'ring'],
];
const sign = (n) => (n > 0 ? `+${n}` : String(n));
import { SKILLS, xpForLevel, MAX_LEVEL } from '../skills/skills.js';

const fmt = (n) => Math.floor(n).toLocaleString('en-GB');

const GEAR_SVG = '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M19.4 13a7.6 7.6 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.4 7.4 0 0 0-1.7-1L15 3.3h-4l-.4 2.6a7.4 7.4 0 0 0-1.7 1l-2.5-1-2 3.5L6.6 11a7.6 7.6 0 0 0 0 2l-2.2 1.6 2 3.5 2.5-1a7.4 7.4 0 0 0 1.7 1l.4 2.6h4l.4-2.6a7.4 7.4 0 0 0 1.7-1l2.5 1 2-3.5zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" transform="translate(-1 0)"/></svg>';
const HEART_SVG = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M12 21 3.5 12.6A5.2 5.2 0 0 1 12 6.2a5.2 5.2 0 0 1 8.5 6.4z"/></svg>';
const BOOT_SVG = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M7 3h5v8l6 3c1.7.8 3 2.4 3 4.3V20H4v-3l3-1z"/></svg>';

export class Hud {
  constructor(root) {
    this.root = root;
    root.innerHTML = `
      <div class="hud-top-left">
        <div class="area-banner" id="area-banner"></div>
        <div class="grave-timer hidden" id="grave-timer"></div>
        <div class="messages" id="messages" aria-live="polite"></div>
      </div>
      <div class="hud-top-right">
        <button class="icon-btn ui" id="btn-inv" aria-label="Inventory"><img class="px" src="${itemIcon('bag').url}" alt=""></button>
        <button class="icon-btn ui" id="btn-skills" aria-label="Skills"><img class="px" src="${iconUrl('attack')}" alt=""></button>
        <button class="icon-btn ui" id="btn-settings" aria-label="Settings">${GEAR_SVG}</button>
        <div class="xp-drops" id="xp-drops" aria-hidden="true"></div>
      </div>
      <div class="levelup hidden" id="levelup" role="status">
        <img class="px" id="levelup-icon" alt="">
        <div><div class="levelup-title">Level up!</div><div id="levelup-text"></div></div>
      </div>
      <div class="panel-backdrop ui hidden" id="inv">
        <div class="panel inv-panel" role="dialog" aria-label="Inventory">
          <div class="panel-head">
            <div class="tabs"><button class="tab on" data-itab="inv">Bag</button><button class="tab" data-itab="gear">Equipment</button></div>
            <span class="inv-free" id="inv-free"></span><button class="close-btn" data-close aria-label="Close">✕</button>
          </div>
          <div class="panel-body">
            <div data-ipane="inv">
              <div class="inv-grid" id="inv-grid"></div>
              <p class="muted small" id="inv-help"></p>
            </div>
            <div data-ipane="gear" class="hidden">
              <div class="doll" id="doll"></div>
              <div class="bonuses" id="bonuses"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="panel-backdrop ui hidden" id="trade">
        <div class="panel trade-panel" role="dialog" aria-label="Bank or shop">
          <div class="panel-head">
            <h2 id="trade-title">Bank</h2>
            <span class="qty-pick" id="qty-pick">
              <button class="chip sq on" data-q="1">1</button><button class="chip sq" data-q="5">5</button><button class="chip sq" data-q="10">10</button><button class="chip sq" data-q="all">All</button>
            </span>
            <button class="close-btn" data-close aria-label="Close">✕</button>
          </div>
          <div class="panel-body">
            <p class="muted small trade-help" id="trade-help"></p>
            <div class="trade-grid" id="trade-grid"></div>
            <div class="trade-actions" id="trade-actions">
              <button class="btn" id="bank-dep-inv">Deposit bag</button>
              <button class="btn" id="bank-dep-gear">Deposit worn items</button>
            </div>
            <h3 id="trade-bag-title">Your bag</h3>
            <div class="inv-grid trade-inv" id="trade-inv"></div>
            <p class="trade-status" id="trade-status"></p>
          </div>
        </div>
      </div>
      <div class="menu-backdrop ui hidden" id="menu-backdrop"><div class="menu" id="menu" role="menu"></div></div>
      <div class="panel-backdrop ui hidden" id="skills">
        <div class="panel" role="dialog" aria-label="Skills">
          <div class="panel-head">
            <div class="tabs"><button class="tab on" data-tab="skills">Skills</button><button class="tab" data-tab="combat">Combat</button></div>
            <button class="close-btn" data-close aria-label="Close">✕</button>
          </div>
          <div class="panel-body">
            <div data-pane="skills">
              <div class="skill-grid" id="skill-grid"></div>
              <div class="skill-foot" id="skill-foot"></div>
            </div>
            <div data-pane="combat" class="hidden">
              <p class="muted" id="style-intro"></p>
              <div class="style-list" id="style-list"></div>
              <div class="row"><span>Auto retaliate</span><button class="chip" id="set-retaliate2"></button></div>
              <p class="muted small" id="combat-stats"></p>
            </div>
          </div>
        </div>
      </div>
      <div class="target hidden" id="target" aria-live="polite">
        <div class="target-name" id="target-name"></div>
        <div class="target-bar"><span id="target-fill"></span></div>
      </div>
      <div class="hud-bottom-right">
        <div class="hp-orb" id="hp-orb" aria-label="Hitpoints">
          <span class="hp-icon">${HEART_SVG}</span>
          <span class="run-bar"><span class="hp-fill" id="hp-fill"></span></span>
          <span class="run-val" id="hp-val">10</span>
        </div>
        <button class="run-orb ui" id="run-orb" aria-label="Toggle run">
          <span class="run-icon">${BOOT_SVG}</span>
          <span class="run-val" id="run-val">Run</span>
        </button>
      </div>
      <div class="dpad ui hidden" id="dpad" aria-label="Movement joystick">
        <span class="joy-knob"></span>
      </div>
      <div class="hint hidden" id="hint"></div>
      <div class="dialog ui hidden" id="dialog" role="dialog" aria-live="polite">
        <div class="dialog-name hidden" id="dialog-name"></div>
        <div class="dialog-text" id="dialog-text"></div>
        <div class="dialog-choices hidden" id="dialog-choices"></div>
        <div class="dialog-next" id="dialog-next">▼</div>
      </div>
      <div class="fade" id="fade"></div>
      <div class="panel-backdrop ui hidden" id="settings">
        <div class="panel" role="dialog" aria-label="Settings">
          <div class="panel-head"><h2>Settings</h2><button class="close-btn" data-close aria-label="Close">✕</button></div>
          <div class="panel-body">
            <h3 class="first">Controls</h3>
            <div class="row"><span>On-screen joystick</span><button class="chip" id="set-dpad"></button></div>
            <div class="row"><span>Tapping an item<small id="item-tap-sub"></small></span><button class="chip" id="set-itemtap"></button></div>
            <p class="muted small" id="controls-help"></p>
            <h3>Gameplay</h3>
            <div class="row"><span>Auto retaliate<small>Fight back when attacked</small></span><button class="chip" id="set-retaliate"></button></div>
            <div class="row"><span>Text speed</span><button class="chip" id="set-textspeed"></button></div>
            <div class="row"><span>XP drops</span><button class="chip" id="set-xpdrops"></button></div>
            <h3>Display</h3>
            <div class="row"><span>Zoom</span><span class="zoom-ctl"><button class="chip sq" id="zoom-out" aria-label="Zoom out">−</button><span id="zoom-val">0</span><button class="chip sq" id="zoom-in" aria-label="Zoom in">+</button></span></div>
            <div class="row"><span>Battery saver<small>30 frames a second</small></span><button class="chip" id="set-battery"></button></div>
            <h3>Your adventure</h3>
            <div class="adv-stats" id="adv-stats"></div>
            <h3>Your save</h3>
            <p class="muted" id="save-status">Your game saves automatically.</p>
            <div class="btn-grid">
              <button class="btn" id="save-now">Save now</button>
              <button class="btn" id="save-copy">Copy save code</button>
              <button class="btn" id="save-download">Download save file</button>
              <button class="btn" id="save-load-toggle">Load a save code</button>
            </div>
            <div class="import hidden" id="import-box">
              <textarea id="import-text" rows="3" placeholder="Paste a save code (starts with RBC1:)" spellcheck="false" autocapitalize="off" autocomplete="off"></textarea>
              <button class="btn primary" id="import-go">Load this save</button>
            </div>
            <p class="muted small">Tip: on iPhone, the Home Screen app and Safari keep separate saves. Use "Copy save code" in one and "Load a save code" in the other to move your progress.</p>
            <h3>Danger zone</h3>
            <button class="btn danger" id="save-reset">Start a new game</button>
            <p class="version" id="version"></p>
          </div>
        </div>
      </div>
      <div class="toast hidden" id="toast"></div>
    `;
    const $ = (id) => root.querySelector(`#${id}`);
    this.el = {
      banner: $('area-banner'), messages: $('messages'), runOrb: $('run-orb'), runVal: $('run-val'),
      dpad: $('dpad'), hint: $('hint'), dialog: $('dialog'), dialogText: $('dialog-text'),
      dialogName: $('dialog-name'), dialogChoices: $('dialog-choices'), dialogNext: $('dialog-next'), fade: $('fade'),
      settings: $('settings'), toast: $('toast'), saveStatus: $('save-status'),
      setDpad: $('set-dpad'), zoomVal: $('zoom-val'), importBox: $('import-box'), importText: $('import-text'),
      version: $('version'), setRetaliate: $('set-retaliate'),
      setItemTap: $('set-itemtap'), setTextSpeed: $('set-textspeed'), setXpDrops: $('set-xpdrops'), setBattery: $('set-battery'),
      hpOrb: $('hp-orb'), hpFill: $('hp-fill'), hpVal: $('hp-val'),
      target: $('target'), targetName: $('target-name'), targetFill: $('target-fill'),
    };
    this.$ = $;
    this.dialogLines = [];
    this.dialogOpen = false;
    this.onDialogClose = null;

    $('btn-settings').addEventListener('click', () => this.openSettings());
    $('btn-skills').addEventListener('click', () => this.openSkills());
    $('btn-inv').addEventListener('click', () => this.openInventory());
    this.el.inv = $('inv');
    this.el.inv.addEventListener('click', (e) => {
      if (e.target === this.el.inv || e.target.closest('[data-close]')) this.closeInventory();
      const tab = e.target.closest('[data-itab]');
      if (tab) this.showInvTab(tab.dataset.itab);
      const eq = e.target.closest('[data-eq]');
      if (eq && eq.classList.contains('full')) this.onGearTap?.(eq.dataset.eq, e.clientX, e.clientY);
    });
    this.el.menuBackdrop = $('menu-backdrop');
    this.el.menuBackdrop.addEventListener('pointerdown', (e) => { if (e.target === this.el.menuBackdrop) { e.preventDefault(); this.closeMenu(); } });
    this.bindInventoryDrag($('inv-grid'));
    this.tradeQty = 1;
    this.el.trade = $('trade');
    this.el.trade.addEventListener('click', (e) => {
      if (e.target === this.el.trade || e.target.closest('[data-close]')) { this.closeTrade(); return; }
      const q = e.target.closest('[data-q]');
      if (q) {
        this.tradeQty = q.dataset.q === 'all' ? Infinity : Number(q.dataset.q);
        for (const b of this.el.trade.querySelectorAll('[data-q]')) b.classList.toggle('on', b === q);
        return;
      }
      const t = e.target.closest('[data-take]');
      if (t) { this.onTradeTake?.(t.dataset.take); return; }
      const g = e.target.closest('[data-give]');
      if (g) { this.onTradeGive?.(Number(g.dataset.give)); return; }
    });
    $('bank-dep-inv').addEventListener('click', () => this.onDepositBag?.());
    $('bank-dep-gear').addEventListener('click', () => this.onDepositGear?.());
    this.el.skills = $('skills');
    this.el.skills.addEventListener('click', (e) => {
      if (e.target === this.el.skills || e.target.closest('[data-close]')) this.closeSkills();
      const tab = e.target.closest('[data-tab]');
      if (tab) this.showTab(tab.dataset.tab);
      const st = e.target.closest('[data-style]');
      if (st) this.onStylePick?.(st.dataset.style);
    });
    this.el.settings.addEventListener('click', (e) => {
      if (e.target === this.el.settings || e.target.closest('[data-close]')) this.closeSettings();
    });
    this.el.dialog.addEventListener('click', (e) => { if (!e.target.closest('.choice')) this.advanceDialog(); });
    $('save-load-toggle').addEventListener('click', () => {
      this.el.importBox.classList.toggle('hidden');
      if (!this.el.importBox.classList.contains('hidden')) this.el.importText.focus();
    });
  }

  get settingsOpen() {
    return !this.el.settings.classList.contains('hidden') || !this.el.skills.classList.contains('hidden') || this.invOpen || this.menuOpen || this.tradeOpen;
  }

  // ---- Bank and shop -------------------------------------------------------------
  // mode: 'bank' or 'shop'. Tapping an item at the top takes it (withdraw/buy);
  // tapping one in your bag gives it (deposit/sell). Quantity from the 1/5/10/All chips.
  get tradeOpen() { return !this.el.trade.classList.contains('hidden'); }

  openTrade(mode, title) {
    this.tradeMode = mode;
    this.$('trade-title').textContent = title;
    this.$('trade-actions').classList.toggle('hidden', mode !== 'bank');
    this.$('trade-help').textContent = mode === 'bank'
      ? 'Tap an item in the bank to take it out, or in your bag to put it in. Choose how many with the buttons above.'
      : 'Tap an item to buy it, or one of your own to sell it. Prices are in coins.';
    this.$('trade-status').textContent = '';
    this.el.trade.classList.remove('hidden');
  }

  closeTrade() {
    this.el.trade.classList.add('hidden');
    this.onTradeClose?.();
  }

  tradeStatus(text) { this.$('trade-status').textContent = text; }

  // top: [{ id, qty, price? }], bag: inventory slots, sell: (id) => price (shop only)
  renderTrade(top, bag, sell = null) {
    const cell = (id, qty, extra) => {
      const lab = qty > 1 || ITEMS[id]?.stackable ? stackLabel(qty) : null;
      return `<img class="px" src="${itemIcon(id).url}" alt="${ITEMS[id]?.name ?? ''}" draggable="false">
        ${lab ? `<span class="qty ${lab.cls}">${lab.text}</span>` : ''}${extra || ''}`;
    };
    this.$('trade-grid').innerHTML = top.length
      ? top.map((t) => `<button class="slot full ${t.qty <= 0 ? 'empty-stock' : ''}" data-take="${t.id}" title="${ITEMS[t.id]?.name}${t.price ? ` — ${t.price} coins` : ''}">
          ${cell(t.id, t.qty, t.price ? `<span class="price">${t.price}</span>` : '')}</button>`).join('')
      : '<p class="muted" style="grid-column: 1 / -1; margin: 6px 4px; color: #e8d8b0">Your bank is empty. Tap items in your bag to store them.</p>';
    this.$('trade-inv').innerHTML = bag.map((s, i) => {
      if (!s) return '<div class="slot"></div>';
      const p = sell ? sell(s.id) : null;
      return `<button class="slot full" data-give="${i}" title="${ITEMS[s.id]?.name}${p != null ? ` — sells for ${p}` : ''}">
        ${cell(s.id, ITEMS[s.id]?.stackable ? s.qty : 1, p != null && s.id !== 'coins' ? `<span class="price sell">${p}</span>` : '')}</button>`;
    }).join('');
  }

  setGraveTimer(text) {
    const el = this.$('grave-timer');
    if (!text) { el.classList.add('hidden'); return; }
    el.classList.remove('hidden');
    if (el.textContent !== text) el.textContent = text;
  }

  // ---- Inventory ------------------------------------------------------------------
  get invOpen() { return !this.el.inv.classList.contains('hidden'); }
  get menuOpen() { return !this.el.menuBackdrop.classList.contains('hidden'); }

  openInventory() {
    this.el.inv.classList.remove('hidden');
    this.onInventoryOpen?.();
  }

  closeInventory() {
    this.el.inv.classList.add('hidden');
    this.closeMenu();
  }

  showInvTab(name) {
    for (const t of this.el.inv.querySelectorAll('[data-itab]')) t.classList.toggle('on', t.dataset.itab === name);
    for (const p of this.el.inv.querySelectorAll('[data-ipane]')) p.classList.toggle('hidden', p.dataset.ipane !== name);
    this.$('inv-free').classList.toggle('hidden', name !== 'inv');
    this.onInventoryOpen?.();
  }

  // gear: { slot: {id, qty} | null }, b: summed bonuses, weapon: { name, type, speed }
  renderEquipment(gear, b, weapon, maxHitNow) {
    this.$('doll').innerHTML = DOLL.map((row) => row.map((slot) => {
      if (!slot) return '<div class="eq-gap"></div>';
      const s = gear[slot];
      if (!s) return `<div class="eq-slot" data-eq="${slot}"><span class="eq-label">${SLOT_NAME[slot]}</span></div>`;
      const lab = ITEMS[s.id]?.stackable ? stackLabel(s.qty) : null;
      return `<div class="eq-slot full" data-eq="${slot}" title="${ITEMS[s.id]?.name}">
        <img class="px" src="${itemIcon(s.id).url}" alt="${ITEMS[s.id]?.name}">
        ${lab ? `<span class="qty ${lab.cls}">${lab.text}</span>` : ''}
      </div>`;
    }).join('')).join('');
    const cell = (v) => `<td class="${v > 0 ? 'pos' : v < 0 ? 'neg' : ''}">${sign(v)}</td>`;
    this.$('bonuses').innerHTML = `
      <table>
        <thead><tr><th></th>${TYPES.map((t) => `<th>${t[0].toUpperCase() + t.slice(1)}</th>`).join('')}</tr></thead>
        <tbody>
          <tr><th>Attack</th>${TYPES.map((t) => cell(b.att[t])).join('')}</tr>
          <tr><th>Defence</th>${TYPES.map((t) => cell(b.def[t])).join('')}</tr>
        </tbody>
      </table>
      <p class="bonus-line">Melee strength <b>${sign(b.str)}</b> · Max hit <b>${maxHitNow}</b></p>
      <p class="bonus-line">${weapon.name}: ${weapon.type}, ${(weapon.speed * 0.6).toFixed(1)} s per attack</p>`;
  }

  renderInventory(slots) {
    const grid = this.$('inv-grid');
    grid.innerHTML = slots.map((s, i) => {
      if (!s) return `<div class="slot" data-slot="${i}"></div>`;
      const lab = ITEMS[s.id]?.stackable ? stackLabel(s.qty) : null;
      return `<div class="slot full" data-slot="${i}" title="${ITEMS[s.id]?.name ?? s.id}">
        <img class="px" src="${itemIcon(s.id).url}" alt="${ITEMS[s.id]?.name ?? ''}" draggable="false">
        ${lab ? `<span class="qty ${lab.cls}">${lab.text}</span>` : ''}
      </div>`;
    }).join('');
    const free = slots.filter((s) => !s).length;
    this.$('inv-free').textContent = `${28 - free} / 28`;
  }

  // Tap a slot -> onSlotTap(i, x, y). Long-press or right-click -> onSlotMenu(i, x, y).
  // Drag a slot onto another -> onSlotSwap(a, b).
  bindInventoryDrag(grid) {
    let drag = null;
    let lastTouch = -Infinity;
    grid.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (performance.now() - lastTouch < 1000) return; // a long-press already did it
      const slot = e.target.closest('.slot.full');
      if (slot) this.onSlotMenu?.(Number(slot.dataset.slot), e.clientX, e.clientY);
    });
    grid.addEventListener('pointerdown', (e) => {
      const slot = e.target.closest('.slot.full');
      if (!slot || (e.pointerType === 'mouse' && e.button !== 0)) return;
      e.preventDefault();
      const d = { from: Number(slot.dataset.slot), x: e.clientX, y: e.clientY, moved: false, ghost: null, id: e.pointerId, timer: 0 };
      drag = d;
      if (e.pointerType !== 'mouse') {
        lastTouch = performance.now();
        d.timer = setTimeout(() => {
          if (drag !== d || d.moved) return;
          drag = null;
          navigator.vibrate?.(12);
          this.onSlotMenu?.(d.from, d.x, d.y);
        }, 450);
      }
      try { grid.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    });
    grid.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 8) {
        drag.moved = true;
        clearTimeout(drag.timer);
        const img = grid.querySelector(`[data-slot="${drag.from}"] img`);
        if (img) {
          drag.ghost = img.cloneNode();
          drag.ghost.className = 'px drag-ghost';
          document.body.appendChild(drag.ghost);
        }
      }
      if (drag.ghost) Object.assign(drag.ghost.style, { left: `${e.clientX - 22}px`, top: `${e.clientY - 22}px` });
    });
    const end = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag;
      drag = null;
      clearTimeout(d.timer);
      d.ghost?.remove();
      if (e.type === 'pointercancel') return;
      if (!d.moved) { this.onSlotTap?.(d.from, e.clientX, e.clientY); return; }
      const under = document.elementFromPoint(e.clientX, e.clientY)?.closest('.slot');
      if (under) this.onSlotSwap?.(d.from, Number(under.dataset.slot));
    };
    grid.addEventListener('pointerup', end);
    grid.addEventListener('pointercancel', end);
  }

  // A small pop-up list of choices near (x, y): [{ label, fn, icon? }].
  showMenu(x, y, title, options) {
    const m = this.$('menu');
    m.innerHTML = `${title ? `<div class="menu-title">${title}</div>` : ''}` + options.map((o, i) =>
      `<button class="menu-item" data-i="${i}">${o.icon ? `<img class="px" src="${o.icon}" alt="">` : ''}<span>${o.label}</span></button>`).join('');
    this.el.menuBackdrop.classList.remove('hidden');
    m.querySelectorAll('.menu-item').forEach((b) => b.addEventListener('click', (e) => {
      e.stopPropagation();
      const o = options[Number(b.dataset.i)];
      this.closeMenu();
      o.fn?.();
    }));
    // keep it on screen
    const r = m.getBoundingClientRect();
    const left = Math.max(8, Math.min(window.innerWidth - r.width - 8, x - r.width / 2));
    const top = Math.max(8, Math.min(window.innerHeight - r.height - 8, y + 12));
    Object.assign(m.style, { left: `${left}px`, top: `${top}px` });
  }

  closeMenu() {
    this.el.menuBackdrop.classList.add('hidden');
  }

  get skillsOpen() {
    return !this.el.skills.classList.contains('hidden');
  }

  // ---- Skills panel ------------------------------------------------------------
  openSkills(tab) {
    this.el.skills.classList.remove('hidden');
    if (tab) this.showTab(tab);
    this.onSkillsOpen?.();
  }

  closeSkills() {
    this.el.skills.classList.add('hidden');
  }

  showTab(name) {
    for (const t of this.el.skills.querySelectorAll('[data-tab]')) t.classList.toggle('on', t.dataset.tab === name);
    for (const p of this.el.skills.querySelectorAll('[data-pane]')) p.classList.toggle('hidden', p.dataset.pane !== name);
    this.onSkillsOpen?.();
  }

  // book: SkillBook. Draws every skill with its level and progress to the next.
  renderSkills(book, combatLevel, boosts = {}) {
    const grid = this.$('skill-grid');
    grid.innerHTML = SKILLS.map((sk) => {
      const xp = book.xp(sk.id);
      const lvl = book.level(sk.id);
      const lo = xpForLevel(lvl);
      const hi = xpForLevel(lvl + 1);
      const pct = lvl >= MAX_LEVEL ? 100 : Math.floor((100 * (xp - lo)) / (hi - lo));
      const next = lvl >= MAX_LEVEL ? 'Maxed!' : `${fmt(hi - xp)} XP to level ${lvl + 1}`;
      return `<div class="skill" title="${sk.about} (${fmt(xp)} XP)">
        <img class="px" src="${iconUrl(sk.id)}" alt="">
        <div class="skill-main">
          <div class="skill-top"><span class="skill-name">${sk.name}</span><span class="skill-lvl">${boosts[sk.id] ? `<b class="boost">${lvl + boosts[sk.id]}</b>/` : ''}${lvl}</span></div>
          <div class="skill-bar"><span style="width:${pct}%"></span></div>
          <div class="skill-xp">${next}</div>
        </div>
      </div>`;
    }).join('');
    this.$('skill-foot').innerHTML = `<span>Combat level <b>${combatLevel}</b></span><span>Total level <b>${book.total()}</b></span>`;
  }

  // list: [{ id, name, sub, icon, locked }] — melee styles, bow styles or spells.
  renderStyles(list, currentId, retaliate, stats, intro) {
    this.$('style-intro').textContent = intro;
    this.$('style-list').innerHTML = list.map((st) => `
      <button class="style ${st.id === currentId ? 'on' : ''} ${st.locked ? 'locked' : ''}" data-style="${st.id}" aria-pressed="${st.id === currentId}">
        <img class="px" src="${iconUrl(st.icon || st.id)}" alt="">
        <span><b>${st.name}</b><small>${st.sub}</small></span>
      </button>`).join('');
    this.$('set-retaliate2').textContent = retaliate ? 'On' : 'Off';
    this.$('combat-stats').textContent = stats;
  }

  // Floating "+20" with the skill's icon, near the top-right. XP from the same
  // hit (e.g. Strength and Hitpoints) is gathered into one row, side by side.
  xpDrop(skill, amount) {
    if (this.showXpDrops === false) return;
    (this.pendingDrops ||= []).push([skill, amount]);
    if (this.dropQueued) return;
    this.dropQueued = true;
    queueMicrotask(() => {
      this.dropQueued = false;
      const parts = this.pendingDrops;
      this.pendingDrops = [];
      const box = this.$('xp-drops');
      const d = document.createElement('div');
      d.className = 'xp-drop';
      d.innerHTML = parts.map(([sk, amt]) => {
        const n = amt >= 10 ? Math.round(amt) : Math.round(amt * 10) / 10;
        return `<span class="xp-part"><img class="px" src="${iconUrl(sk)}" alt=""><span>+${n}</span></span>`;
      }).join('');
      box.appendChild(d);
      while (box.children.length > 4) box.firstChild.remove();
      setTimeout(() => d.remove(), 1700);
    });
  }

  levelUp(skillId, skillName, level) {
    const el = this.$('levelup');
    this.$('levelup-icon').src = iconUrl(skillId);
    this.$('levelup-text').textContent = `Your ${skillName} level is now ${level}.`;
    el.classList.remove('hidden', 'pop');
    void el.offsetWidth;
    el.classList.add('pop');
    clearTimeout(this.levelTimer);
    this.levelTimer = setTimeout(() => el.classList.add('hidden'), 3600);
  }

  openSettings() {
    this.el.settings.classList.remove('hidden');
    this.onSettingsOpen?.();
  }

  closeSettings() {
    this.el.settings.classList.add('hidden');
    this.el.importBox.classList.add('hidden');
    const reset = this.$('save-reset');
    reset.dataset.armed = '';
    reset.textContent = 'Start a new game';
  }

  showArea(name) {
    const b = this.el.banner;
    b.textContent = name;
    b.classList.remove('show');
    void b.offsetWidth; // restart the animation
    b.classList.add('show');
  }

  message(text) {
    const m = document.createElement('div');
    m.className = 'msg';
    m.textContent = text;
    this.el.messages.appendChild(m);
    while (this.el.messages.children.length > 4) this.el.messages.firstChild.remove();
    setTimeout(() => m.classList.add('fade'), 5000);
    setTimeout(() => m.remove(), 6000);
  }

  toast(text) {
    const t = this.el.toast;
    t.textContent = text;
    t.classList.remove('hidden');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => t.classList.add('hidden'), 2200);
  }

  // These run every frame, so they only touch the page when something changed.
  // The run button: running never runs out, it just toggles run / walk.
  setRun(on) {
    if (on === this.runOn) return;
    this.runOn = on;
    this.el.runOrb.classList.toggle('on', on);
    this.el.runVal.textContent = on ? 'Run' : 'Walk';
    this.el.runOrb.setAttribute('aria-pressed', String(on));
  }

  setHp(hp, max) {
    const key = `${hp}|${max}`;
    if (key === this.hpKey) return;
    this.hpKey = key;
    this.el.hpVal.textContent = String(hp);
    this.el.hpFill.style.width = `${(100 * hp) / max}%`;
    this.el.hpOrb.classList.toggle('low', hp <= max * 0.3);
  }

  flashHeal() {
    const o = this.el.hpOrb;
    o.classList.remove('heal');
    void o.offsetWidth;
    o.classList.add('heal');
  }

  // Who you're fighting: name, level and health.
  // playerLevel colours the name: green = weaker than you, yellow = close, red = stronger.
  setTarget(enemy, playerLevel = 3) {
    const el = this.el.target;
    const key = enemy ? `${enemy.id ?? enemy.name}|${enemy.hp}|${enemy.maxHp}|${playerLevel}` : '';
    if (key === this.targetKey) return;
    this.targetKey = key;
    if (!enemy) { el.classList.add('hidden'); return; }
    el.classList.remove('hidden');
    const diff = enemy.def.level - playerLevel;
    el.dataset.diff = diff <= -3 ? 'easy' : diff >= 3 ? 'hard' : 'even';
    const name = `${enemy.name}  (level ${enemy.def.level})`;
    if (this.el.targetName.textContent !== name) this.el.targetName.textContent = name;
    this.el.targetFill.style.width = `${(100 * enemy.hp) / enemy.maxHp}%`;
  }

  setDpadVisible(v) {
    this.el.dpad.classList.toggle('hidden', !v);
    document.body.classList.toggle('has-dpad', v);
  }

  showHint(text) {
    this.el.hint.textContent = text;
    this.el.hint.classList.remove('hidden');
  }

  hideHint() {
    this.el.hint.classList.add('hidden');
  }

  // Fade the screen to black and back, for moving between areas.
  setFade(on) {
    this.el.fade.classList.toggle('on', on);
  }

  // ---- Conversations ---------------------------------------------------------
  //
  // A conversation is { name, start, nodes }. Each node has:
  //   say:     lines of text (strings, or functions of ctx returning a string)
  //   choices: [{ text, next, set }]   — buttons shown after the last line
  //   next:    node to go to automatically after the last line
  //   set:     { flagName: value }     — stored in the save when the node opens
  // `start` may be a node id or a function of ctx returning one.
  // ctx = { flags } (the saved story flags), passed through to functions.

  showDialog(lines, onClose, name = null) {
    this.startConversation({ name, start: 'a', nodes: { a: { say: lines } } }, { flags: {} }, onClose);
  }

  startConversation(conv, ctx, onClose) {
    this.conv = conv;
    this.ctx = ctx;
    this.onDialogClose = onClose || null;
    this.dialogOpen = true;
    this.el.dialog.classList.remove('hidden');
    this.el.dialogName.textContent = conv.name || '';
    this.el.dialogName.classList.toggle('hidden', !conv.name);
    this.goto(typeof conv.start === 'function' ? conv.start(ctx) : conv.start);
  }

  goto(id) {
    const node = this.conv.nodes[id];
    if (!node) { this.endConversation(); return; }
    // give: { flag, items: [{ item, qty }], say } — an NPC hands you things once.
    if (node.give && this.ctx.give && !this.ctx.give(node.give) && node.giveFail) { this.goto(node.giveFail); return; }
    this.node = node;
    if (node.set) Object.assign(this.ctx.flags, node.set);
    const say = Array.isArray(node.say) ? node.say : node.say ? [node.say] : [];
    this.dialogLines = say.map((l) => (typeof l === 'function' ? l(this.ctx) : l));
    this.hideChoices();
    if (this.dialogLines.length) this.typeLine(this.dialogLines.shift());
    else this.afterLines();
  }

  // Reveal text a few letters at a time, like Emerald. A tap finishes the line.
  typeLine(text) {
    clearInterval(this.typer);
    this.fullLine = text;
    let n = 0;
    this.el.dialogText.textContent = '';
    this.el.dialogNext.classList.add('hidden');
    this.typing = true;
    if (this.textSpeed === 'instant') { this.finishTyping(); return; }
    const step = this.textSpeed === 'fast' ? 5 : 2;
    this.typer = setInterval(() => {
      n += step;
      this.el.dialogText.textContent = text.slice(0, n);
      if (n >= text.length) this.finishTyping();
    }, 28);
  }

  finishTyping() {
    clearInterval(this.typer);
    this.typing = false;
    this.el.dialogText.textContent = this.fullLine;
    const more = this.dialogLines.length || (this.node && (this.node.next || !this.node.choices));
    if (!this.dialogLines.length && this.node?.choices) this.showChoices(this.node.choices);
    else this.el.dialogNext.classList.toggle('hidden', !more);
  }

  advanceDialog() {
    if (!this.dialogOpen) return;
    if (this.typing) { this.finishTyping(); return; }
    if (this.choicesShown) return; // pick an answer
    if (this.dialogLines.length) { this.typeLine(this.dialogLines.shift()); return; }
    this.afterLines();
  }

  afterLines() {
    const node = this.node;
    if (node?.choices) this.showChoices(node.choices);
    else if (node?.next) this.goto(node.next);
    else this.endConversation();
  }

  showChoices(choices) {
    const box = this.el.dialogChoices;
    box.innerHTML = '';
    this.visibleChoices = choices.filter((c) => !c.if || c.if(this.ctx));
    this.visibleChoices.forEach((c, i) => {
      const b = document.createElement('button');
      b.className = 'choice';
      b.textContent = c.text;
      b.dataset.key = String(i + 1);
      b.addEventListener('click', (e) => { e.stopPropagation(); this.pickChoice(i); });
      box.appendChild(b);
    });
    box.classList.remove('hidden');
    this.el.dialogNext.classList.add('hidden');
    this.choicesShown = true;
  }

  hideChoices() {
    this.el.dialogChoices.classList.add('hidden');
    this.el.dialogChoices.innerHTML = '';
    this.choicesShown = false;
  }

  pickChoice(i) {
    if (!this.choicesShown) return;
    const c = this.visibleChoices[i];
    if (!c) return;
    if (c.set) Object.assign(this.ctx.flags, c.set);
    this.hideChoices();
    if (c.action) { const act = this.ctx.action; this.endConversation(); act?.(c.action); return; }
    if (c.next) this.goto(c.next);
    else this.endConversation();
  }

  endConversation() {
    clearInterval(this.typer);
    this.typing = false;
    this.hideChoices();
    this.dialogOpen = false;
    this.el.dialog.classList.add('hidden');
    const cb = this.onDialogClose;
    this.onDialogClose = null;
    this.conv = null;
    this.node = null;
    cb?.();
  }
}
