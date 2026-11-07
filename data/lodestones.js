// Lodestones: ancient standing stones the runekeepers raised, one in each main
// area, for teleporting between them. Dormant until Aldric's side quest The
// Sleeping Stones (data/quests.js); then each one is attuned by touching it
// once, and touching any awake stone lists the attuned ones to travel to
// (useLodestone in src/main.js).
//
// id, name (shown in the travel list), area, x, y (the stone's tile; you
// arrive on the tile just south of it).
// awakeFlag: the flag that makes this stone glow. Every stone wakes with the
// network (lodeOn); the Vale's wakes first, when Aldric does it (lodeVale).

export const LODESTONES = [
  { id: 'brambleford', name: 'Brambleford', area: 'brambleford', x: 24, y: 10 },
  { id: 'thornwood', name: 'Thornwood crossroads', area: 'route1', x: 62, y: 42 },
  { id: 'mine', name: 'Copperdeep Mine', area: 'mine', x: 17, y: 19 },
  { id: 'forge', name: 'The Sunken Forge', area: 'forge', x: 23, y: 20 },
  { id: 'vale', name: 'Whispering Vale', area: 'vale', x: 24, y: 23, awakeFlag: 'lodeVale' },
  { id: 'warrens', name: 'Goblin Warrens', area: 'warrens', x: 24, y: 32 },
];

const TEXT = ['An ancient standing stone, taller than you, carved with a single great rune.'];

// Adds this area's lodestone (if it has one) to an area as it's built.
export function withLodestones(def) {
  for (const l of LODESTONES) {
    if (l.area !== def.id) continue;
    def.props.push({
      type: 'lodestone', tiles: [{ x: l.x, y: l.y }], x: l.x, y: l.y,
      lodestone: l.id, openable: true, openFlag: l.awakeFlag || 'lodeOn', interact: TEXT,
    });
    def.blocked[l.y * def.W + l.x] = 1;
  }
  return def;
}
