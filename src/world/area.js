// An area is one tile map: ground types, which tiles block movement, the
// props standing on it, and exits to other areas. Tile (x, y): x grows east,
// y grows south.

export const GROUND = { GRASS: 0, PATH: 1, PLAZA: 2, WATER: 3, SAND: 4, DIRT: 5, BRIDGE: 6, FLOOR: 7, WALL: 8, CAVE: 9, ROCKWALL: 10 };

export class Area {
  constructor(def) {
    this.id = def.id;
    this.name = def.name;
    this.W = def.W;
    this.H = def.H;
    this.ground = def.ground;
    this.blocked = def.blocked;
    this.props = def.props;
    this.buildings = def.buildings || [];
    this.spawn = def.spawn;
    this.exits = def.exits || [];
    this.spawns = def.spawns || [];
    this.indoors = !!def.indoors; // interiors: dark surroundings, no forest skirt
    this.theme = def.theme || null; // a different look for the ground and scenery (e.g. 'vale')
    this.dark = !!def.dark; // night-time: only lights and glowing things show up
    // Things that move (villagers, later enemies) and block tiles while they stand on them.
    this.dynamicBlock = null;
    this.exitAt = new Map();
    for (const e of this.exits) e.tiles.forEach((t, k) => this.exitAt.set(this.idx(t.x, t.y), { ...e, offset: k }));
  }

  idx(x, y) {
    return y * this.W + x;
  }

  inBounds(x, y) {
    return x >= 0 && y >= 0 && x < this.W && y < this.H;
  }

  groundAt(x, y) {
    return this.inBounds(x, y) ? this.ground[this.idx(x, y)] : GROUND.GRASS;
  }

  // Static terrain only (walls, trees, water).
  isWalkable(x, y) {
    return this.inBounds(x, y) && !this.blocked[this.idx(x, y)];
  }

  isFree(x, y) {
    return this.isWalkable(x, y) && !(this.dynamicBlock && this.dynamicBlock(x, y));
  }

  // One step, 8 directions. Diagonals may not cut corners.
  // staticOnly: ignore villagers (used to tell "wall" from "someone in the way").
  canStep(fx, fy, tx, ty, staticOnly = false) {
    const dx = tx - fx;
    const dy = ty - fy;
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1 || (dx === 0 && dy === 0)) return false;
    const ok = staticOnly ? (x, y) => this.isWalkable(x, y) : (x, y) => this.isFree(x, y);
    if (!ok(tx, ty)) return false;
    if (dx !== 0 && dy !== 0) return ok(fx + dx, fy) && ok(fx, fy + dy);
    return true;
  }
}

// Goal test: standing next to (not diagonal to) any tile of a prop.
export function adjacentTo(tiles) {
  return (x, y) => tiles.some((t) => Math.abs(t.x - x) + Math.abs(t.y - y) === 1);
}
