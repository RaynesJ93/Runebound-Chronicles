// Villagers and other non-player characters.
//
// They wander one tile at a time within `radius` tiles of home, never onto
// the player or each other, and stop wandering while you walk up to talk.

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

export class Npc {
  constructor(def, area) {
    this.def = def;
    this.id = def.id;
    this.name = def.name;
    this.area = area;
    this.home = { x: def.x, y: def.y };
    this.tile = { ...this.home };
    this.from = { ...this.home };
    this.to = { ...this.home };
    this.t = 0;
    this.moving = false;
    this.stepRunning = false;
    this.facing = def.facing ?? 0;
    this.radius = def.radius ?? 2;
    this.stepDur = def.fast ? 0.35 : 0.6;
    this.wander = def.wander ?? 0.25; // chance per tick to take a step
    this.busy = false;
    this.steps = 0;
  }

  // The tile(s) this NPC currently blocks.
  occupies(x, y) {
    return (this.tile.x === x && this.tile.y === y) || (this.moving && this.to.x === x && this.to.y === y);
  }

  // Where they will be standing once their current step finishes.
  get standTile() {
    return this.moving ? this.to : this.tile;
  }

  faceTowards(x, y) {
    const s = this.standTile;
    const dx = x - s.x;
    const dy = y - s.y;
    if (dx || dy) this.facing = Math.atan2(dx, dy);
  }

  onTick(rng, isFree) {
    if (this.busy || this.moving || this.radius <= 0) return;
    if (rng() > this.wander) return;
    const [dx, dy] = DIRS[Math.floor(rng() * DIRS.length)];
    const n = { x: this.tile.x + dx, y: this.tile.y + dy };
    if (Math.abs(n.x - this.home.x) + Math.abs(n.y - this.home.y) > this.radius) { this.facing = Math.atan2(dx, dy); return; }
    if (!this.area.isWalkable(n.x, n.y) || !isFree(n.x, n.y, this)) return;
    this.from = { ...this.tile };
    this.to = n;
    this.moving = true;
    this.t = 0;
    this.facing = Math.atan2(dx, dy);
  }

  update(dt) {
    if (!this.moving) return;
    this.t += dt / this.stepDur;
    if (this.t >= 1) {
      this.tile = { ...this.to };
      this.moving = false;
      this.t = 0;
      this.steps++;
    }
  }

  worldPosition() {
    const k = this.moving ? this.t : 0;
    const a = this.moving ? this.from : this.tile;
    const b = this.moving ? this.to : this.tile;
    return { x: a.x + (b.x - a.x) * k + 0.5, z: a.y + (b.y - a.y) * k + 0.5 };
  }
}
