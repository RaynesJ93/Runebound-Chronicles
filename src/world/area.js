// An area is one tile map: ground types, which tiles block movement, and the
// props standing on it. Tile (x, y): x grows east, y grows south.
// In 3D, tile (x, y) covers world x..x+1 and z..z+1 (y maps to z).

export const GROUND = { GRASS: 0, PATH: 1, PLAZA: 2, WATER: 3, SAND: 4, DIRT: 5 };

export class Area {
  constructor(def) {
    this.id = def.id;
    this.name = def.name;
    this.W = def.W;
    this.H = def.H;
    this.ground = def.ground;
    this.blocked = def.blocked;
    this.props = def.props;
    this.buildings = def.buildings;
    this.spawn = def.spawn;
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

  isWalkable(x, y) {
    return this.inBounds(x, y) && !this.blocked[this.idx(x, y)];
  }

  // One step, 8 directions. Diagonals may not cut corners.
  canStep(fx, fy, tx, ty) {
    const dx = tx - fx;
    const dy = ty - fy;
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1 || (dx === 0 && dy === 0)) return false;
    if (!this.isWalkable(tx, ty)) return false;
    if (dx !== 0 && dy !== 0) return this.isWalkable(fx + dx, fy) && this.isWalkable(fx, fy + dy);
    return true;
  }
}

// Goal test: standing next to (not diagonal to) any tile of a prop.
export function adjacentTo(tiles) {
  return (x, y) => tiles.some((t) => Math.abs(t.x - x) + Math.abs(t.y - y) === 1);
}
