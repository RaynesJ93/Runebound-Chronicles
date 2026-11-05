// The on-screen interface: area name banner, game messages, run orb,
// D-pad, dialogue box and the settings panel (with save backup tools).

import { iconUrl, paintedIconUrl } from '../render/icons.js';

// A painted interface icon, or the drawn SVG if there isn't one.
const uiIcon = (name, svg, size) => { const u = paintedIconUrl(name); return u ? `<img class="px ui-ic" src="${u}" alt="" width="${size}" height="${size}" id="ic-${name}">` : svg; };
import { itemIcon, stackLabel } from '../render/items.js';
import { ITEMS } from '../../data/items.js';
import { BANK_TABS, tabOf } from '../../data/bankTabs.js';
import { GUIDE } from '../../data/startGuide.js';
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
import { guide } from '../skills/guide.js';
import { drawArea, markers } from './map.js';
import { MAP_AREAS, MAP_TAB } from '../../data/mapLabels.js';

const fmt = (n) => Math.floor(n).toLocaleString('en-GB');

const GEAR_SVG = '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M19.4 13a7.6 7.6 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.4 7.4 0 0 0-1.7-1L15 3.3h-4l-.4 2.6a7.4 7.4 0 0 0-1.7 1l-2.5-1-2 3.5L6.6 11a7.6 7.6 0 0 0 0 2l-2.2 1.6 2 3.5 2.5-1a7.4 7.4 0 0 0 1.7 1l.4 2.6h4l.4-2.6a7.4 7.4 0 0 0 1.7-1l2.5 1 2-3.5zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" transform="translate(-1 0)"/></svg>';
const HEART_SVG = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M12 21 3.5 12.6A5.2 5.2 0 0 1 12 6.2a5.2 5.2 0 0 1 8.5 6.4z"/></svg>';
const BOOK_SVG = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="#8a3a2a" stroke="#2b1d16" stroke-width="1.5" stroke-linejoin="round" d="M4 4.5C4 3.7 4.7 3 5.5 3H19v15H6a2 2 0 0 0-2 2z"/><path fill="#f4e6c4" stroke="#2b1d16" stroke-width="1.5" stroke-linejoin="round" d="M4 20a2 2 0 0 1 2-2h13v3H6a2 2 0 0 1-2-1z"/><path stroke="#e8b33c" stroke-width="1.6" d="M8 7.5h7M8 10.5h5"/></svg>';
const MAP_SVG = '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="#e8d8b0" stroke="#2b1d16" stroke-width="1.6" stroke-linejoin="round" d="M2.5 5.5 8.5 3l7 2.5 6-2.5v15l-6 2.5-7-2.5-6 2.5z"/><path stroke="#2b1d16" stroke-width="1.4" d="M8.5 3v15M15.5 5.5v15"/><path fill="none" stroke="#b0483a" stroke-width="1.6" stroke-dasharray="2 1.6" d="M4.5 15c2-3 4-1 5.5-4s3.5-2 5-4"/><path fill="#b0483a" d="m17 6.2 2.4.3-1.2 2.3z"/></svg>';
const BOOT_SVG = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M7 3h5v8l6 3c1.7.8 3 2.4 3 4.3V20H4v-3l3-1z"/></svg>';

export class Hud {
  constructor(root) {
    this.root = root;
    root.innerHTML = `
      <div class="hud-top-left">
        <button class="guide-btn ui" id="btn-guide" aria-label="Guide: how to play and where to get your first tools">${BOOK_SVG}<span>Guide</span></button>
        <div class="area-banner" id="area-banner"></div>
        <div class="grave-timer hidden" id="grave-timer"></div>
        <div class="messages" id="messages" aria-live="polite"></div>
      </div>
      <div class="hud-top-right">
        <button class="icon-btn ui" id="btn-inv" aria-label="Inventory"><img class="px" src="${itemIcon('bag').url}" alt=""></button>
        <button class="icon-btn ui" id="btn-map" aria-label="Map">${uiIcon('map', MAP_SVG, 32)}</button>
        <button class="icon-btn ui" id="btn-skills" aria-label="Skills"><img class="px" src="${paintedIconUrl('equipment') || iconUrl('attack')}" alt=""></button>
        <button class="icon-btn ui" id="btn-settings" aria-label="Settings">${uiIcon('settings', GEAR_SVG, 32)}</button>
        <div class="xp-drops" id="xp-drops" aria-hidden="true"></div>
      </div>
      <div class="levelup hidden" id="levelup" role="status">
        <img class="px" id="levelup-icon" alt="">
        <span class="levelup-title">Level up!</span><span class="levelup-text" id="levelup-text"></span>
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
            <div class="bank-tools" id="bank-tools">
              <div class="bank-tabs" id="bank-tabs" role="tablist"></div>
              <input class="bank-search" id="bank-search" type="search" placeholder="Search the bank" aria-label="Search the bank" autocomplete="off" spellcheck="false">
            </div>
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
      <div class="panel-backdrop ui hidden" id="guide">
        <div class="panel guide-panel" role="dialog" aria-label="Guide">
          <div class="panel-head">
            <h2>Guide</h2>
            <button class="close-btn" data-close aria-label="Close">✕</button>
          </div>
          <div class="panel-body" id="guide-body"></div>
        </div>
      </div>
      <div class="panel-backdrop ui hidden" id="map">
        <div class="panel map-panel" role="dialog" aria-label="Map">
          <div class="panel-head">
            <h2>Map</h2>
            <span class="zoom-ctl"><button class="chip sq" id="map-zoom-out" aria-label="Zoom out">−</button><button class="chip sq" id="map-zoom-in" aria-label="Zoom in">+</button></span>
            <button class="close-btn" data-close aria-label="Close">✕</button>
          </div>
          <div class="panel-body">
            <div class="map-areas" id="map-areas"></div>
            <div class="map-view" id="map-view"><div class="map-inner" id="map-inner"></div></div>
            <p class="map-where" id="map-where"></p>
            <div class="map-legend">
              <span><i class="mk-you"></i>You</span><span><i class="mk-npc"></i>People</span><span><i class="mk-enemy"></i>Monsters</span><span><i class="mk-exit">▲</i>Way out</span>
              <span><img class="px" src="${itemIcon('coins').url}" alt="">Bank</span><span><img class="px" src="${itemIcon('bag').url}" alt="">Shop</span>
              <span><img class="px" src="${iconUrl('fishing')}" alt="">Fishing</span><span><img class="px" src="${iconUrl('mining')}" alt="">Mining</span>
              <span><img class="px" src="${iconUrl('smithing')}" alt="">Smithing</span><span><img class="px" src="${iconUrl('cooking')}" alt="">Cooking</span>
              <span><img class="px" src="${iconUrl('crafting')}" alt="">Tanning</span><span><img class="px" src="${iconUrl('runecrafting')}" alt="">Altar</span><span><img class="px" src="${itemIcon('stardust').url}" alt="">Shooting star</span>
            </div>
          </div>
        </div>
      </div>
      <div class="panel-backdrop ui hidden" id="skills">
        <div class="panel" role="dialog" aria-label="Skills">
          <div class="panel-head">
            <div class="tabs"><button class="tab on" data-tab="skills">Skills</button><button class="tab" data-tab="combat">Combat</button></div>
            <button class="close-btn" data-close aria-label="Close">✕</button>
          </div>
          <div class="panel-body">
            <div data-pane="skills">
              <div id="skill-list">
                <div class="skill-grid" id="skill-grid"></div>
                <div class="skill-foot" id="skill-foot"></div>
              </div>
              <div class="skill-guide hidden" id="skill-guide"></div>
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
          <span class="hp-icon">${uiIcon('heart', HEART_SVG, 26)}</span>
          <span class="run-bar"><span class="hp-fill" id="hp-fill"></span></span>
          <span class="run-val" id="hp-val">10</span>
        </div>
        <button class="run-orb ui" id="run-orb" aria-label="Toggle run">
          <span class="run-icon">${uiIcon('walk', BOOT_SVG, 26)}</span>
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
    $('btn-map').addEventListener('click', () => this.openMap());
    $('btn-guide').addEventListener('click', () => this.openGuidePanel());
    this.el.guide = $('guide');
    this.el.guide.addEventListener('click', (e) => {
      if (e.target === this.el.guide || e.target.closest('[data-close]')) { this.closeGuidePanel(); return; }
      const row = e.target.closest('[data-gmap]');
      if (row) { this.closeGuidePanel(); this.openMapAt(row.dataset.gmap); }
    });
    this.el.map = $('map');
    this.mapZoom = 1;
    this.el.map.addEventListener('click', (e) => {
      if (e.target === this.el.map || e.target.closest('[data-close]')) { this.closeMap(); return; }
      const t = e.target.closest('[data-map]');
      if (t) { this.mapShown = t.dataset.map; this.renderMap(true); return; }
      const m = e.target.closest('[data-mk]');
      if (m) this.$('map-where').textContent = m.dataset.mk;
    });
    $('map-zoom-in').addEventListener('click', () => this.zoomMap(1));
    $('map-zoom-out').addEventListener('click', () => this.zoomMap(-1));
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
    this.bankTab = 'all';
    this.bankSearch = '';
    $('bank-search').addEventListener('input', (e) => { this.bankSearch = e.target.value; this.onTradeRefresh?.(); });
    this.el.trade.addEventListener('click', (e) => {
      const bt = e.target.closest('[data-btab]');
      if (bt) { this.bankTab = bt.dataset.btab; this.onTradeRefresh?.(); return; }
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
      const sk = e.target.closest('[data-skill]');
      if (sk) this.openGuide(sk.dataset.skill);
      if (e.target.closest('[data-guide-back]')) this.openGuide(null);
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
    return !this.el.settings.classList.contains('hidden') || !this.el.skills.classList.contains('hidden') || this.mapOpen || this.guideOpen || this.invOpen || this.menuOpen || this.tradeOpen;
  }

  // ---- Bank and shop -------------------------------------------------------------
  // mode: 'bank' or 'shop'. Tapping an item at the top takes it (withdraw/buy);
  // tapping one in your bag gives it (deposit/sell). Quantity from the 1/5/10/All chips.
  get tradeOpen() { return !this.el.trade.classList.contains('hidden'); }

  openTrade(mode, title, help = null) {
    this.tradeMode = mode;
    this.$('trade-title').textContent = title;
    this.$('trade-actions').classList.toggle('hidden', mode !== 'bank');
    this.$('bank-tools').classList.toggle('hidden', mode !== 'bank');
    if (mode === 'bank') { this.bankSearch = ''; this.$('bank-search').value = ''; }
    this.$('trade-help').textContent = mode === 'bank'
      ? 'Tap an item in the bank to take it out, or in your bag to put it in. Choose how many with the buttons above.'
      : help || 'Tap an item to buy it, or one of your own to sell it. Prices are in coins.';
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
    let emptyMsg = 'Your bank is empty. Tap items in your bag to store them.';
    if (this.tradeMode === 'bank') {
      // Tabs (with how many kinds of item each holds), then the search, then the grid.
      const counts = {};
      for (const t of top) { const k = tabOf(t.id); counts[k] = (counts[k] || 0) + 1; }
      counts.all = top.length;
      this.$('bank-tabs').innerHTML = BANK_TABS.map((t) => `<button class="bank-tab ${this.bankTab === t.id ? 'on' : ''} ${counts[t.id] ? '' : 'none'}" data-btab="${t.id}" role="tab" aria-selected="${this.bankTab === t.id}" title="${t.name}" aria-label="${t.name}${counts[t.id] ? ` (${counts[t.id]})` : ''}">
          <img class="px" src="${itemIcon(t.icon).url}" alt=""><span>${counts[t.id] || 0}</span></button>`).join('');
      const q = (this.bankSearch || '').trim().toLowerCase();
      this.$('bank-tabs').classList.toggle('searching', !!q);
      const tab = BANK_TABS.find((t) => t.id === this.bankTab) || BANK_TABS[0];
      if (q) top = top.filter((t) => (ITEMS[t.id]?.name || '').toLowerCase().includes(q));
      else if (tab.id !== 'all') top = top.filter((t) => tabOf(t.id) === tab.id);
      if (counts.all) emptyMsg = q ? `Nothing in your bank matches "${q.replace(/[<>&"]/g, '')}".` : `Nothing in ${tab.name.toLowerCase()} yet.`;
      this.$('bank-search').placeholder = `Search the bank (${counts.all} items)`;
    }
    const cell = (id, qty, extra) => {
      const lab = qty !== null && (qty > 1 || ITEMS[id]?.stackable) ? stackLabel(qty) : null;
      return `<img class="px" src="${itemIcon(id).url}" alt="${ITEMS[id]?.name ?? ''}" draggable="false">
        ${lab ? `<span class="qty ${lab.cls}">${lab.text}</span>` : ''}${extra || ''}`;
    };
    this.$('trade-grid').innerHTML = top.length
      ? top.map((t) => `<button class="slot full ${t.qty !== null && t.qty <= 0 ? 'empty-stock' : ''}" data-take="${t.id}" title="${ITEMS[t.id]?.name}${t.price ? ` — ${t.price} ${t.currency || 'coins'}` : ''}">
          ${cell(t.id, t.qty, t.price ? `<span class="price">${t.price}</span>` : '')}</button>`).join('')
      : `<p class="muted" style="grid-column: 1 / -1; margin: 6px 4px; color: #e8d8b0">${emptyMsg}</p>`;
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

  // ---- Guide (top left): how to play, first tools, where to train ------------------
  get guideOpen() { return !this.el.guide.classList.contains('hidden'); }

  // seen: whether the player has opened it before (the button glows until then).
  setGuideSeen(seen) { this.$('btn-guide').classList.toggle('new', !seen); }

  openGuidePanel() {
    const skills = new Set(SKILLS.map((s) => s.id));
    const icon = (id) => (skills.has(id) ? iconUrl(id) : itemIcon(id).url);
    this.$('guide-body').innerHTML = `<p class="muted small">New here? Start with the free tools: most people will teach you a skill and give you what you need. Tap a row with a map pin to see the place on the map.</p>`
      + GUIDE.map((sec) => `<h3 class="guide-sec">${sec.title}</h3>${sec.rows.map((r) => `
        <${r.map ? 'button' : 'div'} class="guide-row guide-tip"${r.map ? ` data-gmap="${r.map}"` : ''}>
          <img class="px" src="${icon(r.icon)}" alt="">
          <span class="guide-text"><b>${r.name}</b><small>${r.sub}</small></span>
          ${r.map ? '<span class="guide-pin" aria-label="Show on map">📍</span>' : ''}
        </${r.map ? 'button' : 'div'}>`).join('')}`).join('');
    this.el.guide.classList.remove('hidden');
    this.el.guide.querySelector('.panel-body').scrollTop = 0;
    this.setGuideSeen(true);
    this.onGuideOpen?.();
  }

  closeGuidePanel() { this.el.guide.classList.add('hidden'); }

  // Open the map on a given area's tab.
  openMapAt(areaId) {
    this.openMap();
    this.mapShown = areaId;
    this.renderMap(true);
  }

  // ---- Map ---------------------------------------------------------------------
  // here: { id, x, y } — the map you're on and your tile; live: { npcs, enemies }.
  get mapOpen() { return !this.el.map.classList.contains('hidden'); }

  openMap() {
    this.el.map.classList.remove('hidden');
    this.mapShown = null;
    this.mapZoom = 1;
    this.onMapOpen?.();
  }

  closeMap() { this.el.map.classList.add('hidden'); }

  // Called by the game with where you are; redraws the open map.
  setMapHere(here, live) {
    this.mapHere = here;
    this.mapLive = live;
    if (this.mapOpen) this.renderMap(!this.mapShown);
  }

  zoomMap(dir) {
    const z = Math.max(1, Math.min(4, this.mapZoom * (dir > 0 ? 2 : 0.5)));
    if (z === this.mapZoom) return;
    const v = this.$('map-view');
    // keep the middle of the view in the middle
    const cx = (v.scrollLeft + v.clientWidth / 2) / v.scrollWidth, cy = (v.scrollTop + v.clientHeight / 2) / v.scrollHeight;
    this.mapZoom = z;
    this.layoutMap();
    v.scrollLeft = cx * v.scrollWidth - v.clientWidth / 2;
    v.scrollTop = cy * v.scrollHeight - v.clientHeight / 2;
  }

  layoutMap() {
    const inner = this.$('map-inner');
    inner.style.width = `${this.mapZoom * 100}%`;
    inner.classList.toggle('zoomed', this.mapZoom > 1);
    this.$('map-zoom-out').disabled = this.mapZoom <= 1;
    this.$('map-zoom-in').disabled = this.mapZoom >= 4;
  }

  // centre: scroll so you (or the middle of the map) are in view.
  renderMap(centre = false) {
    const here = this.mapHere;
    if (!here) return;
    const id = this.mapShown || here.id;
    const onIt = id === here.id;
    this.$('map-areas').innerHTML = MAP_AREAS.map((a) => `<button class="chip ${a === id ? 'on' : ''}" data-map="${a}">${MAP_TAB[a]}${a === here.id ? ' •' : ''}${this.mapStar?.area === a ? ' ★' : ''}</button>`).join('');
    const m = markers(id, onIt ? this.mapLive : null, this.mapStar);
    const pct = (x, y) => `left:${(x / m.W) * 100}%;top:${(y / m.H) * 100}%`;
    const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const mk = m.list.map((k) => {
      if (k.type === 'label') return `<span class="mk-label ${k.x / m.W < 0.14 ? 'al' : k.x / m.W > 0.86 ? 'ar' : ''}" style="${pct(k.x, k.y)}">${esc(k.name)}</span>`;
      if (k.type === 'spot') return `<img class="px mk-spot" data-mk="${esc(k.name)}" style="${pct(k.x, k.y)}" src="${k.icon}" alt="${esc(k.name)}">`;
      if (k.type === 'exit') return `<span class="mk-exit-wrap edge-${k.edge}" data-mk="${esc(k.name)}" style="${pct(k.x, k.y)}"><i class="mk-exit">▲</i><b>${esc(k.name)}</b></span>`;
      if (k.type === 'npc') return `<span class="mk-dot mk-npc" data-mk="${esc(k.name)}" style="${pct(k.x, k.y)}"><b>${esc(k.name)}</b></span>`;
      return `<span class="mk-dot mk-enemy ${k.boss ? 'boss' : ''}" data-mk="${esc(k.name)}" style="${pct(k.x, k.y)}"></span>`;
    }).join('');
    const you = onIt ? `<span class="mk-you" style="${pct(here.x + 0.5, here.y + 0.5)}"></span>` : '';
    const inner = this.$('map-inner');
    if (inner.dataset.area !== id) {
      inner.dataset.area = id;
      inner.innerHTML = '<div class="map-marks"></div>';
      const c = drawArea(id);
      c.className = 'map-canvas';
      inner.prepend(c);
    }
    inner.style.aspectRatio = `${m.W} / ${m.H}`;
    inner.querySelector('.map-marks').innerHTML = mk + you;
    this.layoutMap();
    if (centre) {
      const tab = this.$('map-areas').querySelector('.on');
      if (tab) this.$('map-areas').scrollLeft = tab.offsetLeft - this.$('map-areas').offsetLeft - 8;
      this.$('map-where').textContent = onIt ? `You are in ${m.name}. Tap a marker to see what it is.` : `${m.name}. Tap a marker to see what it is.`;
      const v = this.$('map-view');
      requestAnimationFrame(() => {
        const tx = onIt ? (here.x + 0.5) / m.W : 0.5, ty = onIt ? (here.y + 0.5) / m.H : 0.5;
        v.scrollLeft = tx * v.scrollWidth - v.clientWidth / 2;
        v.scrollTop = ty * v.scrollHeight - v.clientHeight / 2;
      });
    }
  }

  // ---- Skills panel ------------------------------------------------------------
  openSkills(tab) {
    this.el.skills.classList.remove('hidden');
    if (tab) this.showTab(tab);
    this.onSkillsOpen?.();
  }

  closeSkills() {
    this.el.skills.classList.add('hidden');
    this.openGuide(null);
  }

  // Tap a skill to see everything it unlocks; null goes back to the list.
  openGuide(skillId) {
    this.guideSkill = skillId;
    this.$('skill-list').classList.toggle('hidden', !!skillId);
    this.$('skill-guide').classList.toggle('hidden', !skillId);
    if (skillId) {
      this.renderGuide();
      this.el.skills.querySelector('.panel-body').scrollTop = 0;
    }
  }

  renderGuide() {
    const g = this.guideSkill && guide(this.guideSkill);
    if (!g || !this.lastBook) return;
    const lvl = this.lastBook.level(g.id);
    const row = (r) => {
      const ok = lvl >= r.level;
      return `<div class="guide-row ${ok ? '' : 'locked'}">
        <span class="guide-lvl">${r.level}</span>
        <img class="px" src="${itemIcon(r.icon).url}" alt="">
        <span class="guide-text"><b>${r.name}</b>${r.sub ? `<small>${r.sub[0].toUpperCase()}${r.sub.slice(1)}</small>` : ''}</span>
      </div>`;
    };
    const next = g.sections.flatMap((s) => s.rows).filter((r) => r.level > lvl).sort((a, b) => a.level - b.level)[0];
    this.$('skill-guide').innerHTML = `
      <div class="guide-head">
        <button class="chip" data-guide-back>‹ Skills</button>
        <img class="px" src="${iconUrl(g.id)}" alt="">
        <span class="guide-title"><b>${g.name}</b><small>Level ${lvl}${next ? ` · next unlock at ${next.level}` : ''}</small></span>
      </div>
      <p class="muted small">${g.about}</p>
      ${g.sections.map((s) => `
        <h3 class="guide-sec">${s.title}</h3>
        ${s.note ? `<p class="muted small">${s.note}</p>` : ''}
        ${s.rows.map(row).join('')}`).join('')}`;
  }

  showTab(name) {
    if (name === 'skills' && this.guideSkill) this.openGuide(null);
    for (const t of this.el.skills.querySelectorAll('[data-tab]')) t.classList.toggle('on', t.dataset.tab === name);
    for (const p of this.el.skills.querySelectorAll('[data-pane]')) p.classList.toggle('hidden', p.dataset.pane !== name);
    this.onSkillsOpen?.();
  }

  // book: SkillBook. Draws every skill with its level and progress to the next.
  renderSkills(book, combatLevel, boosts = {}) {
    this.lastBook = book;
    if (this.guideSkill) this.renderGuide();
    const grid = this.$('skill-grid');
    grid.innerHTML = SKILLS.map((sk) => {
      const xp = book.xp(sk.id);
      const lvl = book.level(sk.id);
      const lo = xpForLevel(lvl);
      const hi = xpForLevel(lvl + 1);
      const pct = lvl >= MAX_LEVEL ? 100 : Math.floor((100 * (xp - lo)) / (hi - lo));
      const next = lvl >= MAX_LEVEL ? 'Maxed!' : `${fmt(hi - xp)} XP to level ${lvl + 1}`;
      return `<button class="skill" data-skill="${sk.id}" title="${sk.about} (${fmt(xp)} XP)" aria-label="${sk.name} level ${lvl}: see what it unlocks">
        <img class="px" src="${iconUrl(sk.id)}" alt="">
        <div class="skill-main">
          <div class="skill-top"><span class="skill-name">${sk.name}</span><span class="skill-lvl">${boosts[sk.id] ? `<b class="boost">${lvl + boosts[sk.id]}</b>/` : ''}${lvl}</span></div>
          <div class="skill-bar"><span style="width:${pct}%"></span></div>
          <div class="skill-xp">${next}</div>
        </div>
      </button>`;
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
    this.$('levelup-text').textContent = `${skillName} is now ${level}`;
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
    const boot = this.el.runOrb.querySelector('img.ui-ic');
    const u = paintedIconUrl(on ? 'run' : 'walk');
    if (boot && u) boot.src = u;
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
    // take: [{ item, qty }] — the NPC takes things from your bag (all or nothing).
    if (node.take && this.ctx.take && !this.ctx.take(node.take) && node.takeFail) { this.goto(node.takeFail); return; }
    this.node = node;
    if (node.set) Object.assign(this.ctx.flags, node.set);
    // reward: { xp: { skill: base XP }, quest: 'name' } — after the flags are set.
    if (node.reward) this.ctx.reward?.(node.reward);
    const said = typeof node.say === 'function' ? node.say(this.ctx || {}) : node.say;
    const say = Array.isArray(said) ? said : said ? [said] : [];
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
