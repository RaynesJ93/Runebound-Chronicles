// The game tick: 0.6 seconds, like Old School RuneScape.
// Game logic (regeneration, autosave, and later combat and enemy AI) runs on ticks.
// Rendering runs every frame and interpolates between ticks.

export const TICK_SECONDS = 0.6;

export class Ticker {
  constructor(seconds = TICK_SECONDS) {
    this.interval = seconds;
    this.acc = 0;
    this.count = 0;
    this.listeners = [];
  }

  on(fn) {
    this.listeners.push(fn);
  }

  update(dt) {
    this.acc += dt;
    let ran = 0;
    while (this.acc >= this.interval && ran < 10) {
      this.acc -= this.interval;
      this.count++;
      ran++;
      for (const fn of this.listeners) fn(this.count);
    }
    // After a long pause (tab hidden), don't fast-forward forever.
    if (ran >= 10) this.acc = 0;
  }
}
