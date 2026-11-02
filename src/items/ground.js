// Items lying on the ground in one area.
// Monster drops last 2 minutes; things you drop yourself last 3 minutes.
// (Ground items aren't saved — like OSRS, they vanish if you leave the game.)

export const DROP_LIFE = 120;
export const PLAYER_DROP_LIFE = 180;

let nextId = 1;

export class GroundItems {
  constructor() {
    this.list = [];
  }

  add(item, qty, x, y, now, { rare = false, mine = false } = {}) {
    const g = { uid: nextId++, item, qty, x, y, droppedAt: now, expires: now + (mine ? PLAYER_DROP_LIFE : DROP_LIFE), rare };
    this.list.push(g);
    return g;
  }

  at(x, y) {
    return this.list.filter((g) => g.x === x && g.y === y);
  }

  has(g) {
    return this.list.includes(g);
  }

  remove(g) {
    const i = this.list.indexOf(g);
    if (i >= 0) this.list.splice(i, 1);
  }

  prune(now) {
    this.list = this.list.filter((g) => g.expires > now);
  }
}
