// Every quest in the game. The quest journal (the Quests button, top left)
// lists them all from here, so a new quest only needs adding to this list
// (and its dialogue in npcs.js).
//
//   id, name
//   giver:    who starts it, and where (area id, for the map pin)
//   about:    one line on what it's about
//   requires: skill levels needed to start it
//   flag:     the state.flags key the quest's dialogue sets: undefined, then
//             'started', then 'done'
//   steps(c): what to do now, while it's in progress: [{ text, done }]
//             c has level(skill) and count(item) (your bag)
//   rewards:  lines shown in the journal

export const QUESTS = [
  {
    id: 'coldForge',
    name: 'The Cold Forge',
    giver: { name: 'Dorrin the Miner', where: 'Copperdeep Mine', area: 'mine' },
    about: "The dwarves' great furnace in the Sunken Forge has gone cold. Dorrin wants it lit again.",
    requires: { smithing: 40, mining: 40 },
    flag: 'forgeQuest',
    steps: (c) => [
      { text: `Bring Dorrin 25 coal (you have ${c.count('coal')})`, done: c.count('coal') >= 25 },
      { text: `Bring Dorrin 5 steel bars (you have ${c.count('steelBar')})`, done: c.count('steelBar') >= 5 },
      { text: 'Get an ember core from the Molten beast, in the far hall of the Sunken Forge', done: c.count('emberCore') >= 1 },
      { text: 'Take them all to Dorrin in Copperdeep Mine', done: false },
    ],
    rewards: ["The great furnace in the Sunken Forge works again", "Dorrin's smith's outfit (+6% Smithing XP for the full set)", '12,000 Smithing XP and 6,000 Mining XP'],
  },
];

// 'locked' (requirements not met), 'available', 'started' or 'done'.
export function questStatus(q, c) {
  const st = c.flags[q.flag];
  if (st === 'done') return 'done';
  if (st) return 'started';
  return Object.entries(q.requires || {}).every(([skill, lv]) => c.level(skill) >= lv) ? 'available' : 'locked';
}
