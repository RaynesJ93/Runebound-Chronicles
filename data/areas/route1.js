// Thornwood — the big open wilds north of Brambleford (area id 'route1', kept
// so saves and exits still find it).
//
// Roads meet at a crossroads in the middle: south to Brambleford, north-west
// to Copperdeep Mine, east to Whispering Vale, west to the goblins' camp. A
// stream winds across the south. Around them:
//   - Goblin territory (west): a palisaded camp of tents, and the chief's hut
//   - Wolf hills (north-east): rocky ground, bones, and the alpha's den
//   - Bram's cabin and the woodcutting woods (south-east of the bridge)
//   - The oak grove (east), the lake and hunters' camp (south-west)
// and points of interest for quests to come: a ruined watchtower, a hermit's
// hut, a sealed cave, an old graveyard, an abandoned farmstead, a stone shrine,
// a wrecked merchant's cart and a fairy ring.

import { GROUND } from '../../src/world/area.js';
import { mulberry32 } from '../../src/core/rng.js';

const W = 112;
const H = 96;

export function buildRoute1() {
  const ground = new Uint8Array(W * H);
  const blocked = new Uint8Array(W * H);
  const props = [];
  const buildings = [];
  const rng = mulberry32(5150);
  const inB = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
  const i = (x, y) => y * W + x;
  const taken = new Uint8Array(W * H);
  const keep = new Uint8Array(W * H); // no trees or clutter here
  const paint = (x, y, g) => { if (inB(x, y)) { ground[i(x, y)] = g; keep[i(x, y)] = 1; } };
  const rect = (x0, y0, x1, y1, g) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) paint(x, y, g); };
  const clearArea = (x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (inB(x, y)) keep[i(x, y)] = 1; };
  const block = (x, y) => { if (inB(x, y)) blocked[i(x, y)] = 1; };
  const prop = (type, tiles, extra = {}) => {
    const p = { type, tiles, x: tiles[0].x, y: tiles[0].y, ...extra };
    for (const t of tiles) { if (!inB(t.x, t.y)) continue; taken[i(t.x, t.y)] = 1; if (extra.blocks !== false) block(t.x, t.y); }
    props.push(p);
    return p;
  };
  const one = (type, x, y, extra) => prop(type, [{ x, y }], extra);
  const free = (x, y) => inB(x, y) && !blocked[i(x, y)] && !taken[i(x, y)];
  const placeIfFree = (type, x, y, extra) => { if (free(x, y) && !keep[i(x, y)] && ground[i(x, y)] === GROUND.GRASS) one(type, x, y, extra); };
  const at = (type, x, y, extra) => { if (free(x, y) && ground[i(x, y)] !== GROUND.WATER) one(type, x, y, extra); };
  // A road two tiles wide through a list of waypoints.
  const road = (pts, g = GROUND.PATH) => {
    for (let k = 1; k < pts.length; k++) {
      let [x, y] = pts[k - 1];
      const [x1, y1] = pts[k];
      while (x !== x1 || y !== y1) {
        rect(x, y, x + 1, y + 1, g);
        if (x !== x1 && (y === y1 || Math.abs(x1 - x) >= Math.abs(y1 - y))) x += Math.sign(x1 - x); else y += Math.sign(y1 - y);
      }
      rect(x, y, x + 1, y + 1, g);
    }
  };
  const building = (b) => {
    for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) { block(x, y); taken[i(x, y)] = 1; keep[i(x, y)] = 1; }
    const door = { x: b.doorX, y: b.y + b.h - 1 };
    buildings.push({ ...b, doorTiles: [door] });
    props.push({ type: 'door', tiles: [door], x: door.x, y: door.y, building: b.id, interact: b.doorText });
    clearArea(b.x - 2, b.y - 1, b.x + b.w + 1, b.y + b.h + 2);
  };

  // ---- Roads -------------------------------------------------------------------------
  road([[55, 95], [55, 50]]);                               // south, from Brambleford, to the crossroads
  road([[55, 50], [44, 38], [36, 30], [30, 20], [30, 0]]);  // north-west, to Copperdeep Mine
  road([[55, 48], [111, 48]]);                              // east, to Whispering Vale
  road([[33, 50], [55, 50]]);                               // west, through the goblin camp's gate
  road([[56, 82], [24, 82]]);                               // south-west, past the graveyard to the lake
  road([[57, 84], [86, 84]]);                               // south-east, to the old farmstead
  road([[84, 48], [84, 32]]);                               // north, into the wolf hills
  road([[80, 50], [80, 56]]);                               // down to the oak grove
  road([[30, 26], [15, 26]]);                               // west, to the hermit's door
  road([[30, 10], [7, 10], [7, 7]]);                        // west, up to the sealed cave
  road([[57, 75], [64, 75]]);                               // to Bram's door
  road([[86, 84], [92, 84], [92, 81]]);                     // up to the farmhouse door
  road([[43, 83], [43, 85]]);                               // into the graveyard
  road([[44, 28], [44, 30], [40, 34]]);                     // the watchtower, off the mine road
  rect(99, 45, 101, 47, GROUND.PATH);                       // into the shrine
  // a small, round cobbled patch where the roads meet
  for (let y = 45; y <= 54; y++) for (let x = 51; x <= 60; x++) if ((x + 0.5 - 56) ** 2 + (y + 0.5 - 50) ** 2 <= 10.5) paint(x, y, GROUND.PLAZA);
  clearArea(49, 43, 62, 57);

  // ---- The stream, winding across the south, with a bridge on the road ------------------
  const bend = (x) => 66 + Math.round(Math.sin(x / 7) * 2.2 + Math.sin(x / 3.1) * 0.8);
  // Level for a few tiles each side of the road (x 55-56), so the bridge goes
  // straight across instead of stepping with the stream's bend.
  const streamY = (x) => (x >= 52 && x <= 59 ? bend(55) : bend(x));
  for (let x = 0; x < W; x++) {
    const cy = streamY(x);
    for (let y = cy - 1; y <= cy + 1; y++) {
      if (ground[i(x, y)] === GROUND.PATH) { ground[i(x, y)] = GROUND.BRIDGE; continue; }
      ground[i(x, y)] = GROUND.WATER; block(x, y); taken[i(x, y)] = 1; keep[i(x, y)] = 1;
    }
    clearArea(x, cy - 3, x, cy + 3);
  }
  for (const [x, side, variant] of [[44, -1, 'lure'], [67, -1, 'lure'], [38, 1, 'bait'], [73, 1, 'net']]) {
    const y = streamY(x) + side;
    props.push({ type: 'fishingSpot', tiles: [{ x, y }], x, y, variant });
    taken[i(x, y + side)] = 1;
  }

  // ---- Crossroads ---------------------------------------------------------------------------
  one('sign', 59, 47, { interact: ['THE CROSSROADS', 'North-west: Copperdeep Mine.  East: Whispering Vale.', 'West: goblin camp (danger!).  South: Brambleford.'] });
  for (const [x, y] of [[52, 47], [59, 53]]) one('lamp', x, y);
  one('well', 52, 53, { interact: ['An old stone well at the crossroads. Travellers have scratched their names into it.'] });

  // ---- Goblin territory (west) ------------------------------------------------------------
  clearArea(4, 29, 36, 64);
  rect(8, 33, 32, 57, GROUND.PATH);                         // trampled earth
  // a rough palisade ring, gate on the east side
  for (let x = 6; x <= 34; x++) for (let y = 31; y <= 59; y++) {
    const edge = x === 6 || x === 34 || y === 31 || y === 59;
    const gate = x === 34 && (y === 49 || y === 50 || y === 51);
    const broken = (x * 7 + y * 3) % 11 === 0; // gaps where it's fallen down
    if (edge && !gate && !broken && ground[i(x, y)] !== GROUND.WATER) one('fence', x, y);
  }
  for (const [x, y] of [[11, 42], [18, 41], [25, 42], [10, 55], [27, 57]]) prop('tent', [{ x, y }, { x: x + 1, y }], { interact: ['A grubby goblin tent. It smells awful.'] });
  one('campfire', 20, 50, { action: 'cook', interact: ['The goblins\' campfire. Something is burnt to the pot.'] });
  for (const [x, y] of [[14, 46], [29, 46], [9, 50], [24, 56], [30, 54]]) one('crate', x, y);
  for (const [x, y] of [[16, 52], [23, 47], [12, 57], [28, 44], [19, 56]]) one('bones', x, y, { blocks: false });
  one('standingStone', 20, 45, { interact: ['A goblin war totem, daubed with red paint and hung with teeth.'] });
  building({ id: 'chiefHut', kind: 'cabin', art: 'chiefHut', label: null, x: 13, y: 33, w: 6, h: 4, doorX: 15,
    doorText: ["The goblin chief's hut. Something big is snoring inside.", 'Best not to wake it... yet.'] });
  one('sign', 37, 47, { interact: ['DANGER! GOBLIN CAMP.', 'Signed, the Brambleford Watch.'] });

  // ---- Wolf hills (north-east) ---------------------------------------------------------------
  clearArea(66, 4, 106, 34);
  for (let k = 0; k < 46; k++) at('rock', 66 + Math.floor(rng() * 40), 4 + Math.floor(rng() * 30));
  for (let k = 0; k < 22; k++) at('bones', 68 + Math.floor(rng() * 36), 6 + Math.floor(rng() * 26), { blocks: false });
  // the alpha's den: a rock face with a dark mouth
  // (an uneven outcrop: each column's top and bottom rock rows)
  const outcrop = (cols) => { for (const [x, top, bottom] of cols) for (let y = top; y <= bottom; y++) { ground[i(x, y)] = GROUND.ROCKWALL; block(x, y); taken[i(x, y)] = 1; } };
  outcrop([[90, 5, 6], [91, 4, 6], [92, 4, 7], [93, 4, 6], [94, 4, 7], [95, 4, 7], [96, 4, 7], [97, 4, 7], [98, 4, 6], [99, 4, 7], [100, 4, 6], [101, 4, 6], [102, 5, 6], [103, 5, 5]]);
  one('caveMouth', 96, 7, { interact: ["The alpha wolf's den. Bones are piled at the entrance.", 'It goes back further than you can see.'] });
  one('sign', 86, 36, { interact: ['WOLF HILLS', 'Travel in daylight. Travel in groups.'] });

  // ---- Bram's cabin and the woodcutting woods (south-east of the bridge) -----------------------
  building({ id: 'cabin', kind: 'cabin', label: null, sign: 'bow', x: 62, y: 71, w: 5, h: 4, doorX: 64,
    doorText: ["Bram's cabin. It smells of pine sap and woodsmoke.", 'A board by the door shows a bow and arrow: "New adventurers: ask Bram for a free bow!"'] });
  prop('logPile', [{ x: 68, y: 75 }, { x: 69, y: 75 }], { interact: ['A neat pile of logs, ready for the winter.'] });
  for (const [x, y] of [[70, 72], [61, 77], [71, 77]]) one('stump', x, y);
  one('crate', 60, 73);
  one('sign', 58, 76, { interact: ["Bram's Woodcutting: logs, kindling and advice.", 'New to adventuring? Ask Bram for a FREE bow and arrows!'] });
  // pines to practise on
  for (let x = 66; x <= 78; x += 3) for (let y = 79; y <= 81; y += 2) at('tree', x, y, { variant: 'pine' });

  // ---- Oak grove (east) -------------------------------------------------------------------------
  clearArea(70, 54, 92, 62);
  for (let x = 72; x <= 90; x += 3) for (let y = 55; y <= 61; y += 3) if (!(x === 81 && y <= 58)) at('tree', x, y, { variant: 'oak' });
  one('sign', 82, 53, { interact: ['THE OAK GROVE', 'Old oaks, good timber. Woodcutting 15.'] });

  // ---- Lake and the hunters' camp (south-west) -----------------------------------------------------
  clearArea(4, 72, 34, 92);
  const lake = { cx: 14, cy: 84, rx: 8, ry: 5 };
  const shore = [];
  for (let y = 74; y < 94; y++) for (let x = 2; x < 26; x++) {
    const d = ((x + 0.5 - lake.cx) / lake.rx) ** 2 + ((y + 0.5 - lake.cy) / lake.ry) ** 2;
    if (d < 1) { ground[i(x, y)] = GROUND.WATER; block(x, y); taken[i(x, y)] = 1; }
    else if (d < 1.45) ground[i(x, y)] = GROUND.SAND;
  }
  for (let y = 74; y < 94; y++) for (let x = 2; x < 26; x++) {
    if (ground[i(x, y)] !== GROUND.WATER) continue;
    if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => ground[i(x + dx, y + dy)] !== GROUND.WATER)) shore.push({ x, y });
  }
  const near = (tx, ty) => shore.sort((a, b) => Math.hypot(a.x - tx, a.y - ty) - Math.hypot(b.x - tx, b.y - ty)).shift();
  for (const [tx, ty, variant] of [[22, 82, 'net'], [14, 78, 'bait'], [20, 88, 'lure']]) { const t = near(tx, ty); props.push({ type: 'fishingSpot', tiles: [t], x: t.x, y: t.y, variant }); }
  prop('tent', [{ x: 27, y: 76 }, { x: 28, y: 76 }], { interact: ["A hunter's tent. Snares and a bow hang inside."] });
  one('campfire', 28, 79, { action: 'cook', interact: ["The hunters' cooking fire, still burning."] });
  prop('logPile', [{ x: 31, y: 77 }, { x: 32, y: 77 }], { interact: ['Firewood, neatly stacked.'] });
  one('crate', 26, 79);
  one('sign', 33, 80, { interact: ["HUNTERS' CAMP", 'Cook your catch at the fire. The lake has fish too.'] });

  // ---- Points of interest (quests to come) ----------------------------------------------------------
  // The ruined watchtower
  clearArea(38, 18, 50, 31);
  rect(41, 21, 47, 27, GROUND.PLAZA);
  // what's left of it: the stump of the tower, an arched wall, low broken
  // walls along the sides, a fallen pillar and heaps of rubble
  const ruin = { interact: ['Broken stone, blackened by an old fire.'] };
  prop('ruinTower', [{ x: 41, y: 22 }, { x: 42, y: 22 }], ruin);
  prop('ruinArch', [{ x: 45, y: 22 }, { x: 46, y: 22 }, { x: 47, y: 22 }], ruin);
  prop('ruinLow', [{ x: 41, y: 25 }, { x: 41, y: 26 }], ruin);
  prop('ruinLow', [{ x: 46, y: 27 }, { x: 47, y: 27 }], ruin);
  prop('ruinLow', [{ x: 41, y: 27 }, { x: 42, y: 27 }], ruin);
  prop('fallenPillar', [{ x: 44, y: 24 }, { x: 45, y: 24 }], { interact: ['A fallen stone pillar, half sunk in the earth.'] });
  for (const [x, y] of [[43, 23], [45, 25], [39, 24], [48, 22]]) one('rubble', x, y, { blocks: false });
  one('sign', 44, 29, { interact: ['THE OLD WATCHTOWER', 'It fell in the Goblin War, long ago. The stairs have collapsed.'] });

  // The hermit's hut
  building({ id: 'hermit', kind: 'cabin', art: 'hermit', label: null, x: 13, y: 22, w: 5, h: 4, doorX: 15,
    doorText: ['A crooked hut. A sign on the door says: "GO AWAY."', 'Underneath, smaller: "Unless you have mushrooms."'] });
  for (const [x, y] of [[19, 23], [20, 27], [11, 27]]) one('mushrooms', x, y, { blocks: false });
  one('scarecrow', 21, 24, { interact: ['A scarecrow made of sticks and an old robe. Its button eyes follow you.'] });

  // The sealed cave
  clearArea(4, 3, 14, 13);
  outcrop([[3, 2, 4], [4, 2, 5], [5, 2, 6], [6, 2, 6], [7, 2, 6], [8, 2, 6], [9, 2, 5], [10, 2, 6], [11, 2, 4]]);
  one('caveMouth', 7, 6, { sealed: true, interact: ['Huge boulders block the mouth of a cave.', 'Cold air seeps out between them, and something deep inside is breathing.'] });
  for (const [x, y] of [[5, 8], [9, 8], [11, 9]]) one('rock', x, y);

  // The old graveyard: black iron railings, a flagstone path from the gate
  // to a tall memorial, two rows of graves either side, and a pair of dead trees.
  clearArea(35, 83, 51, 94);
  for (let x = 37; x <= 49; x++) for (let y = 85; y <= 92; y++) {
    const edge = x === 37 || x === 49 || y === 85 || y === 92;
    if (edge && !(y === 85 && (x === 43 || x === 44))) one('fence', x, y, { style: 'iron' });
  }
  rect(43, 86, 44, 89, GROUND.PLAZA);
  prop('memorial', [{ x: 43, y: 90 }, { x: 44, y: 90 }], { interact: ['A tall memorial stone: "TO THE FALLEN OF THE GOBLIN WAR."', 'Below, in smaller letters: "They held the crossroads."'] });
  const names = ['Here lies Old Tam. He went looking for the goblin chief.', 'Mira Thorn. Beloved. Brave. Very stubborn.', 'An old stone. The name has worn away.', '"I told you I was ill."',
    'A soldier of the Goblin War.', 'Someone has left fresh flowers here.', 'Bran Hollow, farmer. "Gone to see the cows."', 'A cracked stone. Something has scratched at the earth in front of it.'];
  let nk = 0;
  for (const x of [39, 41, 46, 48]) for (const y of [86, 89]) one('grave', x, y, { interact: [names[nk++ % names.length]] });
  for (const [x, y] of [[38, 91], [48, 91]]) one('tree', x, y, { variant: 'dead', interact: ['A dead tree. Nothing grows well here.'] });
  for (const [x, y] of [[38, 87], [40, 91], [42, 88], [45, 91], [47, 88], [42, 86], [45, 86], [38, 89]]) at('deadGrass', x, y, { blocks: false });
  for (const [x, y] of [[40, 88], [47, 91]]) at('bones', x, y, { blocks: false });
  for (const [x, y] of [[41, 91], [46, 87]]) at('mushrooms', x, y, { blocks: false });
  one('sign', 45, 83, { interact: ['THE OLD GRAVEYARD', 'Rest in peace.'] });

  // The abandoned farmstead
  clearArea(80, 76, 104, 92);
  building({ id: 'farmstead', kind: 'house', art: 'farmstead', roof: 0x6a5a4a, label: null, x: 90, y: 77, w: 6, h: 4, doorX: 92,
    doorText: ['The farmhouse door is boarded up.', 'Scratched into the wood: "THEY CAME AT NIGHT."'] });
  rect(84, 86, 100, 90, GROUND.DIRT);
  for (let x = 84; x <= 100; x++) for (let y = 86; y <= 90; y += 2) if ((x * 5 + y) % 4 !== 0) one('crop', x, y, { blocks: false, ripe: (x + y) % 5 === 0 });
  for (let x = 82; x <= 102; x++) if (x % 4 !== 1) one('fence', x, 92);
  one('scarecrow', 98, 85, { interact: ['A scarecrow, slumped over. Its straw is chewed.'] });
  one('well', 86, 79, { interact: ['The farm well. The rope has been cut.'] });

  // The stone shrine
  clearArea(92, 34, 108, 49);
  // An odd-sized square of paving, so the shrine sits right in the middle,
  // with eight stones standing in line just outside its edges (two a side)
  // and the path coming in between the two on the south side.
  rect(97, 38, 103, 44, GROUND.PLAZA);
  for (const [x, y] of [[98, 37], [102, 37], [104, 39], [104, 43], [96, 39], [96, 43], [98, 45], [102, 45]]) one('standingStone', x, y);
  one('shrine', 100, 42, { interact: ['A worn stone altar. Carvings of a great tree circle its base.', "There's a hollow in the top, as if something used to sit there."] });

  // The wrecked merchant's cart, on the mine road
  clearArea(36, 33, 42, 38);
  one('stall', 38, 35, { interact: ['A merchant\'s cart, overturned. The goods are long gone.', 'Goblin footprints lead away to the west.'] });
  for (const [x, y] of [[40, 34], [37, 37]]) one('crate', x, y);
  one('barrel', 41, 36);

  // A fairy ring of mushrooms, deep in the woods
  clearArea(66, 86, 74, 92);
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    one('mushrooms', Math.round(70 + Math.cos(a) * 3), Math.round(89 + Math.sin(a) * 2.2), { blocks: false });
  }

  // A glowing rune stone stands in the middle of the ring
  one('runeStone', 70, 89, { interact: ['A standing stone carved with a glowing rune.', 'The mushrooms around it grow in a perfect circle. Nobody planted them.'] });

  // ---- The mine entrance: a timbered tunnel in a rock face at the end of the north-west road ----
  for (let x = 24; x <= 37; x++) for (let y = 0; y <= 1; y++) {
    if (y === 1 && (x === 30 || x === 31)) continue;
    ground[i(x, y)] = GROUND.ROCKWALL; block(x, y); taken[i(x, y)] = 1; keep[i(x, y)] = 1;
  }
  props.push({ type: 'mineEntrance', tiles: [{ x: 30, y: 1 }, { x: 31, y: 1 }], x: 30, y: 1 });

  // ---- Old trees, fallen logs and leftovers ------------------------------------------------------
  for (const [x, y] of [[24, 20], [62, 39], [47, 71], [101, 58], [9, 69], [76, 37]]) at('tree', x, y, { variant: 'oldOak' });
  const log2 = (x, y) => { if (free(x, y) && free(x + 1, y) && ground[i(x, y)] === GROUND.GRASS && ground[i(x + 1, y)] === GROUND.GRASS) prop('hollowLog', [{ x, y }, { x: x + 1, y }]); };
  for (const [x, y] of [[40, 43], [70, 44], [25, 71], [88, 64], [60, 89], [16, 15]]) log2(x, y);
  for (const [x, y] of [[93, 9], [100, 9], [89, 12]]) at('skeleton', x, y, { blocks: false, interact: ['Old bones. Something big did this.'] });
  for (const [x, y] of [[30, 41], [10, 57]]) at('crateStack', x, y);                  // goblin loot
  at('openBarrel', 12, 44); at('openBarrel', 26, 52);
  at('crateStack', 25, 77); at('openBarrel', 30, 79);                                 // hunters' camp
  at('crateStack', 39, 37);                                                           // the merchant's cart

  // ---- Forest: thick round the edge, copses and woods everywhere else -------------------------
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const d = Math.min(x, y, W - 1 - x, H - 1 - y);
    const edge = d <= 1 ? 1 : d === 2 ? 0.75 : d === 3 ? 0.35 : 0;
    const n = Math.sin(x * 0.21) + Math.cos(y * 0.19) + Math.sin((x - y) * 0.13) + Math.cos((x + y) * 0.09);
    const wood = n > 1.3 ? 0.75 : n > 0.6 ? 0.3 : 0.04;
    if (rng() < Math.max(edge, wood)) placeIfFree('tree', x, y, { variant: rng() < 0.6 ? 'pine' : 'oak' });
  }

  // ---- Undergrowth ------------------------------------------------------------------------------
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!free(x, y) || keep[i(x, y)] || ground[i(x, y)] !== GROUND.GRASS) continue;
    const r = rng();
    const patch = Math.sin(x * 0.7) + Math.cos(y * 0.45) > 0.95;
    if (patch && r < 0.4) one('tallGrass', x, y, { blocks: false });
    else if (r < 0.025) one('bush', x, y);
    else if (r < 0.065) one('flowers', x, y, { blocks: false });
    else if (r < 0.08) one('mushrooms', x, y, { blocks: false });
    else if (r < 0.088) one('rock', x, y);
  }
  // Undergrowth inside the clearings too, but lighter (never on roads)
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!free(x, y) || ground[i(x, y)] !== GROUND.GRASS || !keep[i(x, y)]) continue;
    const r = rng();
    if (r < 0.04) one('flowers', x, y, { blocks: false });
    else if (r < 0.06) one('tallGrass', x, y, { blocks: false });
  }

  // Birches among the woods (only out in the wild woods, so the trees you
  // came to chop stay oaks and pines), and young saplings among the bushes.
  for (const p of props) {
    if (p.type === 'tree' && (p.variant === 'oak' || p.variant === 'pine') && !keep[i(p.x, p.y)] && (p.x * 13 + p.y * 7) % 9 === 0) p.variant = 'birch';
    if (p.type === 'bush' && (p.x * 5 + p.y * 3) % 4 === 0) p.type = 'sapling';
  }

  return {
    id: 'route1',
    name: 'Thornwood',
    neat: [[97, 38, 103, 44], [43, 86, 44, 89]], // the shrine's paving, the graveyard path
    W, H, ground, blocked, props, buildings,
    spawn: { x: 55, y: H - 3, facing: Math.PI },
    exits: [
      { tiles: [{ x: 55, y: H - 1 }, { x: 56, y: H - 1 }], to: 'brambleford', at: { x: 21, y: 1 }, facing: 0 },
      { tiles: [{ x: 30, y: 1 }, { x: 31, y: 1 }], to: 'mine', at: { x: 15, y: 26 }, facing: Math.PI },
      { tiles: [{ x: W - 1, y: 48 }, { x: W - 1, y: 49 }], to: 'vale', at: { x: 2, y: 29 }, facing: Math.PI / 2 },
    ],
    spawns: [
      // Goblin territory
      { enemy: 'goblin', x: 13, y: 45 }, { enemy: 'goblin', x: 21, y: 43 }, { enemy: 'goblin', x: 27, y: 49 },
      { enemy: 'goblin', x: 12, y: 52 }, { enemy: 'goblin', x: 22, y: 54 }, { enemy: 'goblin', x: 29, y: 56 },
      { enemy: 'goblin', x: 17, y: 49 }, { enemy: 'goblin', x: 9, y: 46 },
      { enemy: 'goblinBrute', x: 16, y: 55 }, { enemy: 'goblinBrute', x: 24, y: 40 },
      // Wolf hills
      { enemy: 'wolf', x: 74, y: 20 }, { enemy: 'wolf', x: 80, y: 13 }, { enemy: 'wolf', x: 86, y: 24 },
      { enemy: 'wolf', x: 92, y: 17 }, { enemy: 'wolf', x: 77, y: 28 }, { enemy: 'wolf', x: 100, y: 22 },
      { enemy: 'alphaWolf', x: 96, y: 10 },
    ],
  };
}
