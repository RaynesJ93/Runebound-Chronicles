// Player movement on the tile grid.
//
// Walking: one tile per 0.6 s tick.  Running: two tiles per tick (one every 0.3 s).
// Steps chain without pauses, and a step starts immediately when you press a key
// or tap, so movement feels responsive (Emerald) while keeping OSRS speeds.

const WALK_STEP = 0.6;
const RUN_STEP = 0.3;
const RUN_COST_PER_TILE = 0.55; // ~180 tiles of running from full energy

export class PlayerController {
  constructor(area, state) {
    this.area = area;
    this.state = state;
    const p = state.player;
    this.tile = { x: p.x, y: p.y };
    this.from = { ...this.tile };
    this.to = { ...this.tile };
    this.t = 0;
    this.moving = false;
    this.stepRunning = false;
    this.stepDur = WALK_STEP;
    this.path = [];
    this.interact = null; // { prop, isGoal }
    this.facing = p.facing || 0;
    this.targetFacing = this.facing;
    // hooks
    this.onStep = null;
    this.onInteract = null;
    this.onRunEmpty = null;
    this.onBlocked = null; // a villager is standing in the way of our path
    this.waited = 0;
    this.dt = 0;
  }

  // Jump straight to a tile (used when entering a new area).
  teleport(area, x, y, facing = this.facing) {
    this.area = area;
    this.tile = { x, y };
    this.from = { x, y };
    this.to = { x, y };
    this.moving = false;
    this.t = 0;
    this.stop();
    this.facing = this.targetFacing = facing;
    Object.assign(this.state.player, { area: area.id, x, y, facing });
  }

  get canRun() {
    return this.state.run.on && this.state.run.energy >= 1;
  }

  // Where the next path starts: the tile we're stepping into, or where we stand.
  get pathStart() {
    return this.moving ? this.to : this.tile;
  }

  setPath(path, interact = null) {
    this.path = path ? path.slice() : [];
    this.interact = interact;
  }

  stop() {
    this.path = [];
    this.interact = null;
  }

  faceTowards(x, y) {
    const dx = x - this.tile.x;
    const dy = y - this.tile.y;
    if (dx || dy) this.targetFacing = Math.atan2(dx, dy);
  }

  update(dt, heldDir) {
    this.dt = dt;
    if (heldDir) this.stop();
    let budget = dt;
    for (let guard = 0; guard < 4; guard++) {
      if (this.moving) {
        this.t += budget / this.stepDur;
        budget = 0;
        if (this.t < 1) break;
        budget = (this.t - 1) * this.stepDur;
        this.finishStep();
      }
      const next = this.nextStep(heldDir);
      if (!next) { this.checkInteract(); break; }
      this.startStep(next);
      if (budget <= 0) break;
    }
    // Smoothly turn to face the direction of travel.
    let diff = this.targetFacing - this.facing;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    this.facing += diff * Math.min(1, dt * 14);
  }

  nextStep(heldDir) {
    if (this.frozen) return null; // e.g. while the screen fades to a new area
    if (this.path.length) {
      const n = this.path[0];
      if (this.area.canStep(this.tile.x, this.tile.y, n.x, n.y)) {
        this.path.shift();
        this.waited = 0;
        return n;
      }
      if (this.area.canStep(this.tile.x, this.tile.y, n.x, n.y, true)) {
        // Only a villager is in the way: wait a moment, then find a way round.
        this.waited += this.dt;
        if (this.waited > 0.7) { this.waited = 0; this.onBlocked?.(); }
        return null;
      }
      this.stop(); // a wall is in the way now
      return null;
    }
    if (heldDir) {
      const { x, y } = this.tile;
      const tries = [[heldDir.dx, heldDir.dy]];
      // Diagonal blocked? Slide along whichever straight direction is open.
      if (heldDir.dx && heldDir.dy) tries.push([heldDir.dx, 0], [0, heldDir.dy]);
      for (const [dx, dy] of tries) {
        if (this.area.canStep(x, y, x + dx, y + dy)) return { x: x + dx, y: y + dy };
      }
      this.faceTowards(x + heldDir.dx, y + heldDir.dy); // bump: turn to face the wall
    }
    return null;
  }

  startStep(n) {
    this.from = { ...this.tile };
    this.to = { x: n.x, y: n.y };
    this.moving = true;
    this.t = 0;
    this.stepRunning = this.canRun;
    this.stepDur = this.stepRunning ? RUN_STEP : WALK_STEP;
    this.targetFacing = Math.atan2(n.x - this.tile.x, n.y - this.tile.y);
  }

  finishStep() {
    this.tile = { ...this.to };
    this.moving = false;
    this.t = 0;
    const s = this.state;
    s.player.x = this.tile.x;
    s.player.y = this.tile.y;
    s.player.facing = this.targetFacing;
    s.stats.tilesWalked++;
    if (this.stepRunning) {
      s.run.energy = Math.max(0, s.run.energy - RUN_COST_PER_TILE);
      if (s.run.energy < 1 && s.run.on) {
        s.run.on = false;
        this.onRunEmpty?.();
      }
    }
    this.onStep?.(this.tile);
  }

  checkInteract() {
    if (!this.interact || this.path.length || this.moving) return;
    const { prop, isGoal } = this.interact;
    this.interact = null;
    if (!isGoal(this.tile.x, this.tile.y)) return;
    const tx = prop.tiles.reduce((s, t) => s + t.x, 0) / prop.tiles.length;
    const ty = prop.tiles.reduce((s, t) => s + t.y, 0) / prop.tiles.length;
    this.faceTowards(tx, ty);
    this.onInteract?.(prop);
  }

  // Ticks: run energy comes back while you aren't running.
  onTick() {
    const r = this.state.run;
    if (!(this.moving && this.stepRunning)) r.energy = Math.min(100, r.energy + 0.45);
  }

  // Smooth position between tiles, in world units (tile centres).
  worldPosition() {
    const k = this.moving ? this.t : 0;
    const a = this.moving ? this.from : this.tile;
    const b = this.moving ? this.to : this.tile;
    return { x: a.x + (b.x - a.x) * k + 0.5, z: a.y + (b.y - a.y) * k + 0.5 };
  }
}
