// Brambleford — the starting village.
// Built by "painting" ground and props onto a grid, so it is easy to edit:
// change a rect() or a prop position and reload.

import { GROUND } from '../../src/world/area.js';
import { mulberry32 } from '../../src/core/rng.js';

// The original village is the top-left 44 x 36; the map grew east and south
// (an east end, an orchard, a river and a cow field) without moving anything,
// so old saves still line up.
const W = 64;
const H = 54;

export function buildBrambleford() {
  const ground = new Uint8Array(W * H);
  const blocked = new Uint8Array(W * H);
  const props = [];
  const buildings = [];
  const exits = [];
  const rng = mulberry32(20261102);

  const inB = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
  const i = (x, y) => y * W + x;
  const rect = (x0, y0, x1, y1, g) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (inB(x, y)) ground[i(x, y)] = g;
  };
  const block = (x, y) => { if (inB(x, y)) blocked[i(x, y)] = 1; };
  const free = (x, y) => inB(x, y) && !blocked[i(x, y)];
  const taken = new Uint8Array(W * H); // tiles that already hold a prop
  const occupy = (x, y) => { if (inB(x, y)) taken[i(x, y)] = 1; };

  // A prop on one or more tiles. Blocking props stop movement.
  const prop = (type, tiles, extra = {}) => {
    const p = { type, tiles, x: tiles[0].x, y: tiles[0].y, ...extra };
    for (const t of tiles) { occupy(t.x, t.y); if (extra.blocks !== false) block(t.x, t.y); }
    props.push(p);
    return p;
  };
  const one = (type, x, y, extra) => prop(type, [{ x, y }], extra);
  const placeIfFree = (type, x, y, extra) => {
    if (free(x, y) && !taken[i(x, y)] && ground[i(x, y)] === GROUND.GRASS) one(type, x, y, extra);
  };

  // ---- Ground -------------------------------------------------------------
  rect(0, 0, W - 1, H - 1, GROUND.GRASS);
  rect(21, 0, 22, 25, GROUND.PATH);    // north road through the village
  rect(5, 17, 38, 18, GROUND.PATH);    // main street
  rect(5, 25, 38, 25, GROUND.PATH);    // lower lane
  rect(17, 13, 26, 19, GROUND.PLAZA);  // village square
  rect(13, 15, 13, 16, GROUND.PATH);   // to the general store
  rect(29, 15, 30, 16, GROUND.PATH);   // to the bank
  rect(37, 14, 37, 16, GROUND.PATH);   // to the elder's house
  rect(8, 24, 8, 24, GROUND.PATH);     // house A
  rect(33, 24, 33, 24, GROUND.PATH);   // house B
  rect(16, 24, 16, 24, GROUND.PATH);   // your home
  rect(30, 26, 30, 27, GROUND.PATH);   // to the farm gate
  rect(22, 26, 22, 27, GROUND.PATH);   // to the chicken pen gate

  // Pond with a sandy shore
  const pcx = 7.5, pcy = 30.6, prx = 4.2, pry = 2.4;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const d = ((x + 0.5 - pcx) / prx) ** 2 + ((y + 0.5 - pcy) / pry) ** 2;
    if (d < 1) { ground[i(x, y)] = GROUND.WATER; block(x, y); occupy(x, y); }
    else if (d < 1.7) ground[i(x, y)] = GROUND.SAND;
  }

  // Fishing spots around the pond's edge: water tiles next to the shore.
  const shoreWater = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (ground[i(x, y)] !== GROUND.WATER) continue;
    if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => inB(x + dx, y + dy) && ground[i(x + dx, y + dy)] === GROUND.SAND)) shoreWater.push({ x, y });
  }
  const nearest = (tx, ty) => shoreWater.slice().sort((a, b) => Math.hypot(a.x - tx, a.y - ty) - Math.hypot(b.x - tx, b.y - ty))[0];
  for (const [tx, ty, variant] of [[12, 30, 'net'], [9, 27, 'net'], [5, 27, 'bait'], [2, 30, 'bait']]) {
    const t = nearest(tx, ty);
    shoreWater.splice(shoreWater.indexOf(t), 1);
    prop('fishingSpot', [t], { variant });
  }

  // Farm field
  rect(29, 29, 37, 32, GROUND.DIRT);

  // ---- The east end and the south road (added when the village grew) --------
  rect(39, 17, 59, 18, GROUND.PATH);   // main street, continued east
  rect(39, 25, 59, 25, GROUND.PATH);   // lower lane, continued east
  rect(40, 26, 41, 48, GROUND.PATH);   // south road, over the river
  rect(42, 38, 44, 38, GROUND.PATH);   // to the cow field gate
  rect(59, 18, 59, 25, GROUND.PATH);   // round the end of the lanes

  // The river: across the south of the village, with a bridge on the south road.
  const riverY = (x) => 45 + Math.round(Math.sin(x / 5.5) * 1.2);
  for (let x = 0; x < W; x++) {
    const cy = riverY(x);
    for (let y = cy - 1; y <= cy + 1; y++) {
      if (!inB(x, y)) continue;
      if (x === 40 || x === 41) { ground[i(x, y)] = GROUND.BRIDGE; continue; }
      ground[i(x, y)] = GROUND.WATER; block(x, y); occupy(x, y);
    }
  }
  // Fishing spots on the river (the bank beside each is kept clear).
  for (const [x, side, variant] of [[30, -1, 'net'], [47, -1, 'bait'], [54, -1, 'lure'], [24, -1, 'bait']]) {
    const y = riverY(x) + side;
    prop('fishingSpot', [{ x, y }], { variant });
    occupy(x, y - 1);
  }

  // ---- Buildings (all doors face south, towards the camera) ---------------
  const building = (b) => {
    for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) { block(x, y); occupy(x, y); }
    const door = { x: b.doorX, y: b.y + b.h - 1 };
    const doorTiles = b.doorW === 2 ? [door, { x: door.x + 1, y: door.y }] : [door];
    buildings.push({ ...b, doorTiles });
    if (b.enter) {
      // You can walk in: the door tile becomes an exit to the interior.
      for (const t of doorTiles) blocked[i(t.x, t.y)] = 0;
      exits.push({ tiles: doorTiles, to: b.enter, at: b.enterAt, facing: Math.PI });
      return;
    }
    // The door is an interactable prop (it doesn't add new blocking — the wall already blocks).
    props.push({ type: 'door', tiles: doorTiles, x: door.x, y: door.y, building: b.id, interact: b.doorText });
  };

  building({
    id: 'store', kind: 'store', label: 'General Store', x: 11, y: 10, w: 6, h: 5, doorX: 13, doorW: 1,
    enter: 'store', enterAt: { x: 5, y: 7 },
  });
  building({
    id: 'bank', kind: 'bank', label: 'Bank', x: 27, y: 10, w: 6, h: 5, doorX: 29, doorW: 2,
    enter: 'bank', enterAt: { x: 6, y: 7 },
  });
  building({
    id: 'elder', kind: 'house', roof: 0x4f6d3a, label: null, x: 35, y: 10, w: 5, h: 4, doorX: 37, doorW: 1,
    doorText: ["Village Elder Maren's house. Nobody answers.", 'Maybe she is out walking the square.'],
  });
  building({
    id: 'houseA', kind: 'house', roof: 0x8a4b2a, label: null, x: 6, y: 20, w: 5, h: 4, doorX: 8, doorW: 1,
    doorText: ['The door is locked. You can hear someone snoring inside.'],
  });
  building({
    id: 'houseB', kind: 'house', roof: 0x6b4e8a, label: null, x: 31, y: 20, w: 5, h: 4, doorX: 33, doorW: 1,
    doorText: ['A note on the door reads: "Gone to the forest. Back by supper."'],
  });
  building({
    id: 'home', kind: 'house', roof: 0x3d5f8c, label: null, x: 14, y: 20, w: 5, h: 4, doorX: 16, doorW: 1,
    doorText: ["Your home. It's cosy, but adventure is calling."],
  });

  // ---- Village square -----------------------------------------------------
  prop('well', [{ x: 21, y: 15 }, { x: 22, y: 15 }, { x: 21, y: 16 }, { x: 22, y: 16 }], {
    interact: ['The village well. The water down there looks cold and clear.'],
  });
  for (const [x, y] of [[17, 13], [26, 13], [17, 19], [26, 19]]) one('lamp', x, y);
  prop('stall', [{ x: 24, y: 15 }, { x: 25, y: 15 }], {
    interact: ['An empty market stall. Traders will set up here soon.'],
  });

  // ---- Signs --------------------------------------------------------------
  one('sign', 23, 12, {
    interact: ['Welcome to Brambleford!', 'General Store: west of the square.  Bank: east of the square.'],
  });
  one('sign', 23, 5, {
    interact: ['NORTH: Route 1 — Thornwood Forest.', 'Travellers beware: goblins and wolves roam the woods.'],
  });

  // ---- North road: the fallen oak has been cleared and cut into logs ------
  prop('logPile', [{ x: 19, y: 3 }, { x: 20, y: 3 }], {
    interact: ["The fallen oak, neatly cut and stacked. Bram's woodcutters worked fast."],
  });
  one('stump', 23, 2, { interact: ['A fresh stump. It still smells of sap.'] });
  for (const [x, y] of [[19, 0], [20, 0], [23, 0], [24, 0], [19, 1], [24, 1]]) placeIfFree('tree', x, y, { variant: 'pine' });

  // ---- Farm fence with a gate gap at (30, 28) -----------------------------
  for (let x = 28; x <= 38; x++) for (let y = 28; y <= 33; y++) {
    const edge = x === 28 || x === 38 || y === 28 || y === 33;
    if (edge && !(x === 30 && y === 28)) one('fence', x, y);
  }
  for (let x = 29; x <= 37; x++) for (let y = 29; y <= 32; y++) if ((y - 29) % 2 === 0) one('crop', x, y, { blocks: false, ripe: x % 3 === 0 });
  one('scarecrow', 35, 30, { interact: ['A scarecrow in a battered hat. The crows seem unimpressed.'] });

  // ---- Wyn's chicken pen, west of the farm, gate at (22, 27) --------------
  for (let x = 18; x <= 26; x++) for (let y = 27; y <= 31; y++) {
    const edge = x === 18 || x === 26 || y === 27 || y === 31;
    if (edge && !(x === 22 && y === 27)) one('fence', x, y);
  }
  rect(22, 28, 22, 28, GROUND.DIRT);
  one('crate', 25, 28, { interact: ['A chicken coop made from an old crate. There is straw and a feather inside.'] });
  one('sign', 23, 26, { interact: ["WYN'S CHICKENS", 'Too many hens! Help yourself, but mind the cabbages.'] });

  // ---- Old Finn's fishing corner by the pond --------------------------------
  one('cookingPit', 14, 30, { action: 'cook', interact: ['A stone-ringed cooking pit. The fire never quite goes out.'] });
  one('sign', 14, 27, { interact: ['FISHING POND', 'Ask Old Finn for a net and a rod. Cook your catch on the pit.'] });

  // ---- East end houses -------------------------------------------------------
  building({
    id: 'eastA', kind: 'house', roof: 0x9a3b30, label: null, x: 44, y: 11, w: 5, h: 4, doorX: 46, doorW: 1,
    doorText: ['A neat house with a polished door knocker. Nobody answers.'],
  });
  building({
    id: 'eastB', kind: 'house', roof: 0x3f6f6a, label: null, x: 52, y: 11, w: 5, h: 4, doorX: 54, doorW: 1,
    doorText: ['Someone inside is singing, badly.'],
  });
  building({
    id: 'eastC', kind: 'house', roof: 0x7a5a2a, label: null, x: 47, y: 20, w: 5, h: 4, doorX: 49, doorW: 1,
    doorText: ['A note on the door: "Gone to see the cows."'],
  });
  rect(46, 15, 46, 16, GROUND.PATH);
  rect(54, 15, 54, 16, GROUND.PATH);
  rect(49, 24, 49, 24, GROUND.PATH);
  for (const [x, y] of [[43, 13], [50, 13], [58, 13], [45, 22], [53, 22]]) one('bush', x, y);
  for (const [x, y] of [[43, 16], [57, 16]]) one('lamp', x, y);
  one('sign', 42, 19, { interact: ['EAST END', 'Orchard: south of the lane.  Cow field and river: down the south road.'] });

  // ---- Orchard (rows of trees you can chop) ----------------------------------
  for (let x = 45; x <= 57; x += 3) for (let y = 28; y <= 34; y += 3) one('tree', x, y, { variant: (x + y) % 2 ? 'oak' : 'pine' });
  one('sign', 44, 27, { interact: ['THE ORCHARD', 'Pines for beginners, oaks for the skilled (Woodcutting 15).'] });

  // ---- Cow field: fenced, gate on the west side at (44, 38) -------------------
  for (let x = 44; x <= 58; x++) for (let y = 36; y <= 42; y++) {
    const edge = x === 44 || x === 58 || y === 36 || y === 42;
    if (edge && !(x === 44 && y === 38)) one('fence', x, y);
  }
  one('crate', 57, 37, { interact: ['A trough of fresh hay.'] });
  one('sign', 43, 40, { interact: ['COW FIELD', 'Cows give beef for cooking, and hides for crafting.'] });
  // Hilda's tanning rack, just west of the south road
  one('tanningRack', 36, 38, { action: 'tan', interact: ['A wooden frame for stretching and tanning hides.'] });

  // ---- South meadow, between the pond and the river ---------------------------
  for (const [x, y] of [[6, 38], [14, 36], [20, 40], [28, 38], [33, 41], [10, 41]]) placeIfFree('bush', x, y);
  for (const [x, y] of [[4, 36], [17, 42], [35, 37], [26, 42]]) placeIfFree('rock', x, y);
  for (const [x, y] of [[12, 38], [24, 37], [31, 35], [8, 43], [33, 43]]) placeIfFree('tree', x, y, { variant: 'oak' });
  one('sign', 39, 34, { interact: ['SOUTH ROAD', 'River and fishing ahead. Cows to the east.'] });

  // ---- Decoration ---------------------------------------------------------
  for (const [x, y] of [[4, 9], [8, 6], [16, 6], [27, 6], [33, 5], [38, 7], [4, 21], [39, 22], [25, 22], [12, 22]]) {
    placeIfFree('tree', x, y, { variant: rng() < 0.5 ? 'oak' : 'pine' });
  }
  for (const [x, y] of [[10, 13], [17, 11], [26, 11], [34, 13], [5, 22], [11, 21], [30, 22], [36, 22], [13, 23], [19, 23]]) placeIfFree('bush', x, y);
  for (const [x, y] of [[37, 4], [6, 12], [25, 32], [15, 32], [40, 27]]) placeIfFree('rock', x, y);

  // Forest edge around the village (thickest at the border).
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (x >= 19 && x <= 24 && y <= 6) continue; // keep the north road clear
    if (x >= 16 && x <= 28 && y >= 32 && y <= 33) continue; // keep the chicken pen in view
    const d = Math.min(x, y, W - 1 - x, H - 1 - y);
    const chance = d <= 1 ? 1 : d === 2 ? 0.75 : d === 3 ? 0.35 : d === 4 ? 0.08 : 0;
    if (chance && rng() < chance) placeIfFree('tree', x, y, { variant: rng() < 0.6 ? 'pine' : 'oak' });
  }

  // Wildflowers on open grass.
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (ground[i(x, y)] === GROUND.GRASS && free(x, y) && !taken[i(x, y)] && rng() < 0.05) one('flowers', x, y, { blocks: false });
  }

  return {
    id: 'brambleford',
    name: 'Brambleford',
    W, H, ground, blocked, props, buildings,
    spawn: { x: 16, y: 24, facing: 0 },
    // Walking onto these tiles takes you to another area.
    exits: [
      { tiles: [{ x: 21, y: 0 }, { x: 22, y: 0 }], to: 'route1', at: { x: 16, y: 76 }, facing: Math.PI },
      ...exits, // shop and bank doors
    ],
    spawns: [
      { enemy: 'cow', x: 48, y: 39 },
      { enemy: 'cow', x: 52, y: 38 },
      { enemy: 'cow', x: 55, y: 40 },
      { enemy: 'cow', x: 50, y: 41 },
      { enemy: 'cow', x: 46, y: 40 },
      { enemy: 'chicken', x: 20, y: 29 },
      { enemy: 'chicken', x: 23, y: 29 },
      { enemy: 'chicken', x: 24, y: 30 },
      { enemy: 'chicken', x: 19, y: 30 },
      { enemy: 'chicken', x: 21, y: 30 },
    ],
  };
}
