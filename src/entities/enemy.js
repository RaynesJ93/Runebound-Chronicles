// A monster in the world. Movement is one tile per tick (0.6 s), smoothly
// animated between tiles. The decisions (wander, chase, attack, go home)
// are made by the combat system in src/combat/combat.js.

let nextId = 1;

export class Enemy {
  constructor(def, spawn, area) {
    this.def = def;
    this.uid = nextId++;
    this.area = area;
    this.spawn = { x: spawn.x, y: spawn.y };
    this.reset();
  }

  reset() {
    this.tile = { ...this.spawn };
    this.from = { ...this.spawn };
    this.to = { ...this.spawn };
    this.t = 0;
    this.moving = false;
    this.stepDur = 0.6;
    this.facing = 0;
    this.hp = this.def.hp;
    this.state = 'idle'; // idle | fight | return
    this.cooldown = 0;
    this.dead = false;
    this.diedAt = 0;
    this.respawnIn = 0;
    this.lastHit = -99;
    this.lungeAt = -99;
    this.steps = 0;
  }

  get name() { return this.def.name; }
  get maxHp() { return this.def.hp; }
  get standTile() { return this.moving ? this.to : this.tile; }

  occupies(x, y) {
    if (this.dead) return false;
    return (this.tile.x === x && this.tile.y === y) || (this.moving && this.to.x === x && this.to.y === y);
  }

  faceTowards(x, y) {
    const s = this.standTile;
    if (x !== s.x || y !== s.y) this.facing = Math.atan2(x - s.x, y - s.y);
  }

  stepTo(n) {
    this.from = { ...this.tile };
    this.to = { x: n.x, y: n.y };
    this.moving = true;
    this.t = 0;
    this.facing = Math.atan2(n.x - this.tile.x, n.y - this.tile.y);
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
