// The on-screen interface: area name banner, game messages, run orb,
// D-pad, dialogue box and the settings panel (with save backup tools).

const GEAR_SVG = '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M19.4 13a7.6 7.6 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.4 7.4 0 0 0-1.7-1L15 3.3h-4l-.4 2.6a7.4 7.4 0 0 0-1.7 1l-2.5-1-2 3.5L6.6 11a7.6 7.6 0 0 0 0 2l-2.2 1.6 2 3.5 2.5-1a7.4 7.4 0 0 0 1.7 1l.4 2.6h4l.4-2.6a7.4 7.4 0 0 0 1.7-1l2.5 1 2-3.5zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" transform="translate(-1 0)"/></svg>';
const HEART_SVG = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M12 21 3.5 12.6A5.2 5.2 0 0 1 12 6.2a5.2 5.2 0 0 1 8.5 6.4z"/></svg>';
const BOOT_SVG = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M7 3h5v8l6 3c1.7.8 3 2.4 3 4.3V20H4v-3l3-1z"/></svg>';

export class Hud {
  constructor(root) {
    this.root = root;
    root.innerHTML = `
      <div class="hud-top-left">
        <div class="area-banner" id="area-banner"></div>
        <div class="messages" id="messages" aria-live="polite"></div>
      </div>
      <div class="hud-top-right">
        <button class="icon-btn ui" id="btn-settings" aria-label="Settings">${GEAR_SVG}</button>
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
          <span class="run-bar"><span class="run-fill"></span></span>
          <span class="run-val" id="run-val">100</span>
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
            <div class="row"><span>On-screen joystick</span><button class="chip" id="set-dpad"></button></div>
            <div class="row"><span>Auto retaliate</span><button class="chip" id="set-retaliate"></button></div>
            <div class="row"><span>Zoom</span><span class="zoom-ctl"><button class="chip sq" id="zoom-out" aria-label="Zoom out">−</button><span id="zoom-val">0</span><button class="chip sq" id="zoom-in" aria-label="Zoom in">+</button></span></div>
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
      hpOrb: $('hp-orb'), hpFill: $('hp-fill'), hpVal: $('hp-val'),
      target: $('target'), targetName: $('target-name'), targetFill: $('target-fill'),
    };
    this.$ = $;
    this.dialogLines = [];
    this.dialogOpen = false;
    this.onDialogClose = null;

    $('btn-settings').addEventListener('click', () => this.openSettings());
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
    return !this.el.settings.classList.contains('hidden');
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

  setRun(on, energy) {
    this.el.runOrb.classList.toggle('on', on);
    this.el.runOrb.style.setProperty('--pct', Math.floor(energy));
    const v = String(Math.floor(energy));
    if (this.el.runVal.textContent !== v) this.el.runVal.textContent = v;
  }

  setHp(hp, max) {
    const v = String(hp);
    if (this.el.hpVal.textContent !== v) this.el.hpVal.textContent = v;
    this.el.hpFill.style.width = `${(100 * hp) / max}%`;
    this.el.hpOrb.classList.toggle('low', hp <= max * 0.3);
  }

  // Who you're fighting: name, level and health.
  setTarget(enemy) {
    const el = this.el.target;
    if (!enemy) { if (!el.classList.contains('hidden')) el.classList.add('hidden'); return; }
    el.classList.remove('hidden');
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
    this.typer = setInterval(() => {
      n += 2;
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
