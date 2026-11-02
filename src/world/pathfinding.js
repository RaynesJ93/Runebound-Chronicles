// Breadth-first search over the tile grid (the same approach OSRS uses).
// Each step costs one tick-step whether straight or diagonal.
//
// findPath(area, sx, sy, isGoal, fallback)
//   isGoal(x, y)  -> true when a tile is an acceptable destination
//   fallback      -> {x, y}: if no goal is reachable, walk to the reachable
//                    tile closest to this point instead (like clicking a wall)
// Returns an array of tiles to walk (not including the start), or null.

const DIRS = [[-1, 0], [1, 0], [0, 1], [0, -1], [-1, 1], [1, 1], [-1, -1], [1, -1]];

export function findPath(area, sx, sy, isGoal, fallback = null) {
  const N = area.W * area.H;
  const prev = new Int32Array(N).fill(-1);
  const dist = new Int32Array(N).fill(-1);
  const queue = new Int32Array(N);
  let head = 0;
  let tail = 0;

  const start = area.idx(sx, sy);
  dist[start] = 0;
  prev[start] = start;
  queue[tail++] = start;

  let goal = -1;
  let best = start;
  let bestScore = Infinity;

  while (head < tail) {
    const c = queue[head++];
    const cx = c % area.W;
    const cy = (c / area.W) | 0;
    if (isGoal(cx, cy)) { goal = c; break; }
    if (fallback) {
      const score = ((cx - fallback.x) ** 2 + (cy - fallback.y) ** 2) * 1000 + dist[c];
      if (score < bestScore) { bestScore = score; best = c; }
    }
    for (const [dx, dy] of DIRS) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (!area.canStep(cx, cy, nx, ny)) continue;
      const n = area.idx(nx, ny);
      if (dist[n] !== -1) continue;
      dist[n] = dist[c] + 1;
      prev[n] = c;
      queue[tail++] = n;
    }
  }

  if (goal === -1) {
    if (!fallback) return null;
    goal = best;
  }

  const path = [];
  for (let c = goal; c !== start; c = prev[c]) path.push({ x: c % area.W, y: (c / area.W) | 0 });
  path.reverse();
  return path;
}
