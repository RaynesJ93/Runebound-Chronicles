// Every quest in the game. The quest journal (the Quests button, top left)
// lists them all from here, so a new quest only needs adding to this list
// (and its dialogue in npcs.js).
//
//   id, name
//   giver:    who starts it, and where (area id, for the map pin)
//   about:    one line on what it's about
//   requires: skill levels needed to start it
//   requiresQuests: quest ids that must be done first (story chapters)
//   recommend: a hint shown in the journal, e.g. 'Combat level 5+'
//   chapter:  for the main story, its chapter number
//   flag:     the state.flags key the quest's dialogue sets: undefined, then
//             'started', then 'done'
//   steps(c): what to do now, while it's in progress: [{ text, done }]
//             c has level(skill) and count(item) (your bag)
//   rewards:  lines shown in the journal

export const QUESTS = [
  {
    id: 'cart',
    chapter: 1,
    name: 'The Overturned Cart',
    giver: { name: 'Pell the Shopkeeper', where: 'General Store, Brambleford', area: 'brambleford' },
    about: "Pell's supply cart was raided on the mine road, and his strongbox is gone. The first chapter of The Runebound.",
    recommend: 'Combat level 5+ (goblin brutes)',
    flag: 'cartQuest',
    steps: (c) => [
      { text: 'Look at the overturned cart in Thornwood, north of the village', done: !!c.flags.cartClue },
      { text: 'Follow the goblin tracks west and take back the strongbox from a goblin brute', done: c.count('pellsStrongbox') >= 1 },
      { text: 'Bring the strongbox to Pell', done: false },
    ],
    rewards: ['300 coins and 3 meat pies', 'A little Attack and Strength XP', 'A strange goblin token...'],
  },
  {
    id: 'war',
    chapter: 2,
    name: 'Echoes of the War',
    giver: { name: 'Elder Maren', where: 'Brambleford village square', area: 'brambleford' },
    about: 'The goblin token from Pell\'s strongbox bears a mark Maren hoped never to see again. Learn what really happened in the Goblin War.',
    requiresQuests: ['cart'],
    flag: 'warQuest',
    steps: (c) => [
      { text: 'Read the war memorial in the old graveyard, in the south of Thornwood', done: !!c.flags.warMemorial },
      { text: 'Search the old watchtower in Thornwood', done: !!c.flags.warJournal },
      { text: 'Find someone who remembers the war', done: !!c.flags.hermitTold },
      { text: 'Tell Elder Maren what you learned', done: false },
    ],
    rewards: ['600 coins', 'Attack, Strength and Defence XP', 'The story continues in chapter 3 (coming soon)'],
  },
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
  const skills = Object.entries(q.requires || {}).every(([skill, lv]) => c.level(skill) >= lv);
  return skills && questsDone(q, c) ? 'available' : 'locked';
}

export const questById = (id) => QUESTS.find((q) => q.id === id);
export const questsDone = (q, c) => (q.requiresQuests || []).every((id) => c.flags[questById(id)?.flag] === 'done');

// ---- Story places ---------------------------------------------------------------
// Tapping a place while on a quest can show different text, set flags and give
// items. The first hook that matches is used instead of the place's own text.
//   area, type (prop type), at: { x, y } (any tile of the prop)
//   when(flags, c): whether this hook applies (c has count(item))
//   say: lines;  set: flags;  give: [{ item, qty }] (needs room in the bag,
//   else `full` is shown)
export const QUEST_HOOKS = [
  {
    area: 'route1', type: 'stall', at: { x: 38, y: 35 },
    when: (f) => f.cartQuest === 'started' && !f.cartClue,
    say: ["A merchant's cart, overturned. Barrels are smashed open and the goods are gone.", "This must be Pell's cart. There's no sign of his strongbox.",
      'Big goblin footprints, heavier than the usual sort, lead away to the west. Towards the goblin camp.'],
    set: { cartClue: true },
  },
  {
    area: 'route1', type: 'stall', at: { x: 38, y: 35 },
    when: (f) => f.cartQuest === 'started',
    say: ["Pell's overturned cart. Heavy goblin footprints lead west, to the goblin camp. Goblin brutes, by the size of them."],
  },
  {
    area: 'route1', type: 'memorial', at: { x: 43, y: 90 },
    when: (f) => f.warQuest === 'started',
    say: ['A tall memorial stone: "TO THE FALLEN OF THE GOBLIN WAR."', 'Below, the names of the fallen. At the top: "CAPTAIN EDRIC HOLT, OF THE WATCH."',
      'Around the back, half hidden by moss, someone has scratched a few words much later:', '"Here lies no warlord. He sleeps beneath the stones."'],
    set: { warMemorial: true },
  },
  {
    area: 'route1', type: 'ruinTower', at: { x: 41, y: 22 },
    when: (f, c) => f.warQuest === 'started' && !f.warJournal,
    say: ['You climb through the rubble of the old watchtower.', 'Under a fallen beam, wrapped in oilcloth, is a small leather book. Captain Holt\'s journal!'],
    give: [{ item: 'holtsJournal', qty: 1 }],
    full: ["There's a book under a fallen beam, but your bag is full. Make some room."],
    set: { warJournal: true },
  },
  {
    area: 'route1', type: 'ruinTower', at: { x: 41, y: 22 },
    when: (f, c) => f.warJournal && !c.have('holtsJournal'),
    say: ['You search the rubble again and find the journal where it fell. You must have dropped it here.'],
    give: [{ item: 'holtsJournal', qty: 1 }],
    full: ["Holt's journal is here, but your bag is full."],
  },
  {
    area: 'route1', type: 'shrine', at: { x: 100, y: 42 },
    when: (f) => f.warQuest === 'done',
    say: ['A worn stone altar. Carvings of a great tree circle its base.', 'The hollow in the top is empty. Tobin said a runestone sat here, holding the binding.', 'Someone has prised it out. The scratches look fresh.'],
  },
];

// ---- Quest drops -------------------------------------------------------------------
// A monster always drops a quest item while you need it and don't have one
// (in your bag, bank or on the ground).
export const QUEST_DROPS = [
  { enemy: 'moltenBeast', item: 'emberCore', when: (f) => f.forgeQuest === 'started', say: 'The Molten beast leaves behind a glowing ember core!' },
  { enemy: 'goblinBrute', item: 'pellsStrongbox', when: (f) => f.cartQuest === 'started' && f.cartClue, say: "The goblin brute drops a battered strongbox. Pell's!" },
];
