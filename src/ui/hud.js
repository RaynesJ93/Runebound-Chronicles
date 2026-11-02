// The on-screen interface: area name banner, game messages, run orb,
// D-pad, dialogue box and the settings panel (with save backup tools).

const GEAR_SVG = '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M19.4 13a7.6 7.6 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.4 7.4 0 0 0-1.7-1L15 3.3h-4l-.4 2.6a7.4 7.4 0 0 0-1.7 1l-2.5-1-2 3.5L6.6 11a7.6 7.6 0 0 0 0 2l-2.2 1.6 2 3.5 2.5-1a7.4 7.4 0 0 0 1.7 1l.4 2.6h4l.4-2.6a7.4 7.4 0 0 0 1.7-1l2.5 1 2-3.5zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" transform="translate(-1 0)"/></svg>';
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
      <div class="hud-bottom-right">
        <button class="run-orb ui" id="run-orb" aria-label="Toggle run">
          <span class="run-ring"></span>
          <span class="run-inner">${BOOT_SVG}<span class="run-val" id="run-val">100</span></span>
        </button>
      </div>
      <div class="dpad ui hidden" id="dpad" aria-label="Movement pad">
        <span class="dp up"></span><span class="dp right"></span><span class="dp down"></span><span class="dp left"></span>
        <span class="dp-nub"></span>
      </div>
      <div class="hint hidden" id="hint"></div>
      <div class="dialog ui hidden" id="dialog" role="dialog">
        <div class="dialog-text" id="dialog-text"></div>
        <div class="dialog-next">▼</div>
      </div>
      <div class="panel-backdrop ui hidden" id="settings">
        <div class="panel" role="dialog" aria-label="Settings">
          <div class="panel-head"><h2>Settings</h2><button class="close-btn" data-close aria-label="Close">✕</button></div>
          <div class="panel-body">
            <div class="row"><span>On-screen D-pad</span><button class="chip" id="set-dpad"></button></div>
            <div class="row"><span>Shadows</span><button class="chip" id="set-shadows"></button></div>
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
      settings: $('settings'), toast: $('toast'), saveStatus: $('save-status'),
      setDpad: $('set-dpad'), setShadows: $('set-shadows'), importBox: $('import-box'), importText: $('import-text'),
      version: $('version'),
    };
    this.$ = $;
    this.dialogLines = [];
    this.dialogOpen = false;
    this.onDialogClose = null;

    $('btn-settings').addEventListener('click', () => this.openSettings());
    this.el.settings.addEventListener('click', (e) => {
      if (e.target === this.el.settings || e.target.closest('[data-close]')) this.closeSettings();
    });
    this.el.dialog.addEventListener('click', () => this.advanceDialog());
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

  showDialog(lines, onClose) {
    this.dialogLines = lines.slice();
    this.dialogOpen = true;
    this.onDialogClose = onClose || null;
    this.el.dialog.classList.remove('hidden');
    this.el.dialogText.textContent = this.dialogLines.shift();
  }

  advanceDialog() {
    if (!this.dialogOpen) return;
    if (this.dialogLines.length) {
      this.el.dialogText.textContent = this.dialogLines.shift();
      return;
    }
    this.dialogOpen = false;
    this.el.dialog.classList.add('hidden');
    const cb = this.onDialogClose;
    this.onDialogClose = null;
    cb?.();
  }
}
