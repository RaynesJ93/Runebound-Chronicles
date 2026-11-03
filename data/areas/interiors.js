// Building interiors in Brambleford. Small rooms with a door at the bottom
// that takes you back outside.

import { GROUND } from '../../src/world/area.js';

function room(W, H) {
  const ground = new Uint8Array(W * H).fill(GROUND.FLOOR);
  const blocked = new Uint8Array(W * H);
  const props = [];
  const i = (x, y) => y * W + x;
  // Back wall (two rows), side walls, front wall with a doorway.
  for (let x = 0; x < W; x++) for (const y of [0, 1]) { ground[i(x, y)] = GROUND.WALL; blocked[i(x, y)] = 1; }
  for (let y = 0; y < H; y++) for (const x of [0, W - 1]) { ground[i(x, y)] = GROUND.WALL; blocked[i(x, y)] = 1; }
  const prop = (type, tiles, extra = {}) => {
    props.push({ type, tiles, x: tiles[0].x, y: tiles[0].y, ...extra });
    if (extra.blocks !== false) for (const t of tiles) blocked[i(t.x, t.y)] = 1;
  };
  return { W, H, ground, blocked, props, prop, i };
}

export function buildStore() {
  const r = room(11, 9);
  // Counter across the room; Pell stands behind it.
  const counter = [2, 3, 4, 5, 6, 7, 8].map((x) => ({ x, y: 4 }));
  r.prop('counter', counter, { action: 'shop', interact: ['The shop counter. Talk to Pell to trade.'] });
  [2, 4, 6, 8].forEach((x, k) => r.prop('shelf', [{ x, y: 1 }], { blocks: false, variant: k })); // food, tools, potions, books
  r.prop('barrel', [{ x: 1, y: 2 }]);
  r.prop('barrel', [{ x: 9, y: 2 }]);
  r.prop('crate', [{ x: 1, y: 6 }]);
  r.prop('crate', [{ x: 9, y: 7 }]);
  r.prop('rug', [{ x: 5, y: 6 }], { blocks: false });
  r.prop('grainSack', [{ x: 1, y: 7 }]);
  for (const x of [3, 7]) r.prop('wallLamp', [{ x, y: 1 }], { blocks: false });
  // front wall either side of the door
  for (let x = 0; x < r.W; x++) if (x !== 5) { r.ground[r.i(x, r.H - 1)] = GROUND.WALL; r.blocked[r.i(x, r.H - 1)] = 1; }
  return {
    id: 'store', name: 'General Store', W: r.W, H: r.H, ground: r.ground, blocked: r.blocked, props: r.props, indoors: true,
    spawn: { x: 5, y: 7, facing: Math.PI },
    exits: [{ tiles: [{ x: 5, y: 8 }], to: 'brambleford', at: { x: 13, y: 15 }, facing: 0 }],
  };
}

export function buildBank() {
  const r = room(13, 9);
  // Three booths with brass grilles; Edda works behind the middle one.
  const booths = [[2, 3], [5, 6], [8, 9]];
  for (const [a, b] of booths) r.prop('bankBooth', [{ x: a, y: 4 }, { x: b, y: 4 }], { action: 'bank', interact: ['A bank booth.'] });
  for (const x of [4, 7]) r.prop('counter', [{ x, y: 4 }]);
  for (const x of [1, 10, 11]) r.prop('counter', [{ x, y: 4 }]);
  r.prop('coinChest', [{ x: 2, y: 2 }], { blocks: true });
  r.prop('coinChest', [{ x: 10, y: 2 }], { blocks: true });
  for (const x of [4, 8]) r.prop('wallLamp', [{ x, y: 1 }], { blocks: false });
  r.prop('rug', [{ x: 6, y: 6 }], { blocks: false });
  r.prop('plant', [{ x: 1, y: 7 }]);
  r.prop('plant', [{ x: 11, y: 7 }]);
  for (let x = 0; x < r.W; x++) if (x !== 6 && x !== 7) { r.ground[r.i(x, r.H - 1)] = GROUND.WALL; r.blocked[r.i(x, r.H - 1)] = 1; }
  return {
    id: 'bank', name: 'Bank of Brambleford', W: r.W, H: r.H, ground: r.ground, blocked: r.blocked, props: r.props, indoors: true,
    spawn: { x: 6, y: 7, facing: Math.PI },
    exits: [{ tiles: [{ x: 6, y: 8 }, { x: 7, y: 8 }], to: 'brambleford', at: { x: 29, y: 15 }, facing: 0 }],
  };
}
