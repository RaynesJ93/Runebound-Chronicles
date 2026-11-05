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
    about: "Pell's supply cart was raided on the south road, and his strongbox is gone. The first chapter of The Runebound.",
    recommend: 'Combat level 5+ (goblin brutes)',
    flag: 'cartQuest',
    steps: (c) => [
      { text: 'Look at the wrecked cart on the south road, just before the bridge', done: !!c.flags.cartClue },
      { text: 'Follow the goblin tracks to the goblin camp in Thornwood and take back the strongbox from a goblin brute', done: c.count('pellsStrongbox') >= 1 },
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
    rewards: ['600 coins', 'Attack, Strength and Defence XP', 'The story continues in chapter 3'],
  },
  {
    id: 'stone',
    chapter: 3,
    name: 'The Empty Hollow',
    giver: { name: 'Tobin the Hermit', where: "The hermit's hut, Thornwood", area: 'route1' },
    about: 'The runestone that keeps Grubnak bound has been stolen from the shrine. Find it before the binding fails.',
    requiresQuests: ['war'],
    recommend: 'Combat level 15+ (the Goblin Chief)',
    flag: 'stoneQuest',
    steps: (c) => [
      { text: 'Look at the stone shrine on the eastern hill of Thornwood', done: !!c.flags.stoneShrine },
      { text: 'Pick up the runestone base at the shrine', done: c.count('runestoneBase') >= 1 },
      ...(c.flags.stoneShrine ? [
        { text: c.flags.chiefAwake ? 'Defeat the Goblin Chief for the runestone crown' : "Wake the Goblin Chief: knock on his hut in the goblin camp", done: c.count('runestoneCrown') >= 1 },
        { text: 'Take the runestone heart from the tunnel goblins in Copperdeep Mine', done: c.count('runestoneHeart') >= 1 },
      ] : []),
      { text: 'Bring all three shards to Aldric in Whispering Vale', done: false },
    ],
    rewards: ['800 coins', 'Runecrafting XP', 'Attack, Strength and Defence XP', 'The story continues in chapter 4'],
  },
  {
    id: 'remake',
    chapter: 4,
    name: 'Stone and Rune',
    giver: { name: 'Aldric the Runekeeper', where: 'Whispering Vale', area: 'vale' },
    about: 'Aldric can remake the broken runestone, but he needs essence, runes and a strong metal setting to do it.',
    requiresQuests: ['stone'],
    requires: { runecrafting: 10, smithing: 30 },
    flag: 'remakeQuest',
    steps: (c) => {
      const made = !!c.flags.stoneRemade;
      return [
        { text: `Bring Aldric 20 rune essence (you have ${c.count('runeEssence')})`, done: made || c.count('runeEssence') >= 20 },
        { text: `Bring Aldric 30 water runes (you have ${c.count('waterRune')})`, done: made || c.count('waterRune') >= 30 },
        { text: `Bring Aldric 30 mind runes (you have ${c.count('mindRune')})`, done: made || c.count('mindRune') >= 30 },
        { text: 'Get a runestone setting from Dorrin in Copperdeep Mine (he needs 2 steel bars and a silver bar)', done: made || c.count('runestoneSetting') >= 1 },
        { text: 'Give it all to Aldric so he can remake the stone', done: made },
        { text: 'Set the Binding Stone in the stone shrine', done: !!c.flags.stonePlaced },
        { text: 'Tell Tobin', done: false },
      ];
    },
    rewards: ['1,000 coins', 'Runecrafting, Smithing and Magic XP', 'The story continues in chapter 5'],
  },
  {
    id: 'cave',
    chapter: 5,
    name: 'The Sealed Cave',
    giver: { name: 'Tobin the Hermit', where: "The hermit's hut, Thornwood", area: 'route1' },
    about: 'Grubnak is stirring, and his goblins are digging for him. Open the sealed cave and find out what is going on down there.',
    requiresQuests: ['remake'],
    requires: { mining: 30 },
    recommend: 'Combat level 25+ (warren goblins and the Digmaster)',
    flag: 'caveQuest',
    steps: (c) => [
      { text: 'Break the boulders at the sealed cave, north of the hermit\'s hut (needs a pickaxe)', done: !!c.flags.caveOpen },
      { text: 'Go down into the Goblin Warrens and find the great dig', done: !!c.flags.sawDoor },
      { text: 'Defeat the Goblin Digmaster and take his orders', done: !!c.flags.gotOrders || c.count('digmastersOrders') >= 1 },
      { text: 'Show the orders to Tobin', done: false },
    ],
    rewards: ['1,500 coins', 'Attack, Strength, Defence and Mining XP', 'The Goblin Warrens stay open', 'The story continues in chapter 6'],
  },
  {
    id: 'final',
    chapter: 6,
    name: 'The Runebound',
    giver: { name: 'Tobin the Hermit', where: "The hermit's hut, Thornwood", area: 'route1' },
    about: 'Forty years ago Grubnak could not be killed, only bound. Now he is waking. Go through the door and face him.',
    requiresQuests: ['cave'],
    recommend: 'Combat level 35+, plenty of food, and 30 mind runes for the rune pillars',
    flag: 'finalQuest',
    steps: (c) => [
      { text: 'Ask Aldric in Whispering Vale for a way through the rune door', done: !!c.flags.chamberOpen || c.have('runeKey') },
      { text: "Open the rune door in the Goblin Warrens' great dig", done: !!c.flags.chamberOpen },
      { text: 'Face Grubnak in his chamber. Watch for red ground, and feed the rune pillars mind runes to pin him', done: !!c.flags.grubnakDown },
      { text: 'Talk to Tobin. (The ending of the story is coming in the next update.)', done: false },
    ],
    rewards: ['The ending of The Runebound (coming in the next update)'],
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
//   say: lines (or a function of flags, c);  set: flags;  give: [{ item, qty }]
//   (needs room in the bag, else `full` is shown);  take: [{ item, qty }]
//   (taken from your bag when the text closes)
export const QUEST_HOOKS = [
  {
    area: 'brambleford', type: 'brokenCart', at: { x: 37, y: 42 },
    when: (f) => f.cartQuest === 'started' && !f.cartClue,
    say: ["A merchant's cart, smashed and overturned. Barrels are split open and the goods are gone.", "This is Pell's cart. There's no sign of his strongbox.",
      'Big goblin footprints, heavier than the usual sort, lead away through the meadow, north-west into Thornwood. Towards the goblin camp.'],
    set: { cartClue: true },
  },
  {
    area: 'brambleford', type: 'brokenCart', at: { x: 37, y: 42 },
    when: (f) => f.cartQuest === 'started',
    say: ["Pell's wrecked cart. Heavy goblin footprints lead north-west into Thornwood, to the goblin camp. Goblin brutes, by the size of them."],
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
    when: (f) => f.stoneQuest === 'started' && !f.stoneShrine,
    say: ['The hollow in the top of the altar is empty. The runestone has been prised out, and not gently: there are chisel marks all round it.',
      'Glittering chips of stone are scattered in the grass. They smashed it getting it out!',
      'One big piece lies under the altar, still glowing faintly: the base of the runestone.',
      'Goblin tracks lead away two ways: west, towards the goblin camp, and north-west, towards Copperdeep Mine.'],
    give: [{ item: 'runestoneBase', qty: 1 }],
    full: ['There\'s a glowing piece of stone under the altar, but your bag is full. Make some room.'],
    set: { stoneShrine: true },
  },
  {
    area: 'route1', type: 'shrine', at: { x: 100, y: 42 },
    when: (f, c) => f.stoneQuest === 'started' && !c.have('runestoneBase'),
    say: ['You search under the altar again and find the runestone base where it fell.'],
    give: [{ item: 'runestoneBase', qty: 1 }],
    full: ['The runestone base is here, but your bag is full.'],
  },
  // Chapter 4: set the remade Binding Stone in the shrine.
  {
    area: 'route1', type: 'shrine', at: { x: 100, y: 42 },
    when: (f, c) => f.remakeQuest === 'started' && !f.stonePlaced && c.count('bindingStone') >= 1,
    say: ['You lift the Binding Stone into the hollow on the altar. It fits perfectly, as if it had never left.',
      'The runes blaze white. The standing stones around you hum, one after another, all the way round the ring.',
      'The ground shakes.', 'Far away to the north-west, something ROARS. Birds burst from every tree in Thornwood.',
      'Then silence. The light settles into a steady glow... though every few moments, it flickers.', 'Tobin will want to know.'],
    take: [{ item: 'bindingStone', qty: 1 }],
    set: { stonePlaced: true },
  },
  {
    area: 'route1', type: 'shrine', at: { x: 100, y: 42 },
    when: (f) => f.stonePlaced,
    say: ['The Binding Stone sits in the hollow, glowing softly.', 'Every few moments the light flickers, as if something far away is pushing against it.'],
  },
  {
    area: 'route1', type: 'caveMouth', at: { x: 7, y: 6 },
    when: (f) => f.stonePlaced && !f.caveQuest,
    say: ['Huge boulders block the mouth of the cave. But they have shifted: there is a dark crack between them now.', 'Cold air pours out. Deep inside, something is breathing. Slowly. Heavily.'],
  },
  {
    area: 'route1', type: 'shrine', at: { x: 100, y: 42 },
    when: (f) => f.warQuest === 'done',
    say: (f) => (f.stoneQuest === 'done'
      ? ['The empty hollow waits for its stone. Aldric is working on it.']
      : ['A worn stone altar. Carvings of a great tree circle its base.', 'The hollow in the top is empty. Tobin said a runestone sat here, holding the binding.', 'Someone has prised it out. The scratches look fresh.']),
  },
  // Chapter 5: break the boulders at the sealed cave.
  {
    area: 'route1', type: 'caveMouth', at: { x: 7, y: 6 },
    when: (f, c) => f.caveQuest === 'started' && !f.caveOpen && c.level('mining') >= 30 && c.holdingPickaxe(),
    say: ['You set your pickaxe against the crack between the boulders and swing.', '*crack* ... *CRACK*', 'The biggest boulder splits in two and rolls aside. Cold air rushes out, and the smell of goblin.',
      'A rough tunnel slopes down into the dark. The sealed cave is open.'],
    set: { caveOpen: true },
    xp: { mining: 300 },
  },
  {
    area: 'route1', type: 'caveMouth', at: { x: 7, y: 6 },
    when: (f) => f.caveQuest === 'started' && !f.caveOpen,
    say: (f, c) => [c.level('mining') >= 30 ? 'The boulders are cracked. With a pickaxe in your bag, you could break them open.' : `The boulders are cracked, but they are huge. You'd need Mining 30 to break them (you have ${c.level('mining')}).`],
  },
  {
    area: 'route1', type: 'caveMouth', at: { x: 7, y: 6 },
    when: (f) => f.caveOpen,
    say: ['The broken boulders lie to one side. A rough tunnel slopes down into the Goblin Warrens.'],
  },
  // Chapter 5: the door of Grubnak's chamber, in the great dig.
  {
    area: 'warrens', type: 'runeDoor', at: { x: 22, y: 5 },
    when: (f) => f.caveQuest === 'started' && !f.sawDoor,
    say: ['A great door of solid rock, carved all over with runes. They glow a faint, steady blue.',
      'The goblins have been at it with picks. Some of the runes are chipped half away, and their glow is weaker.',
      'Behind the door, something breathes. Slowly. Heavily. And it is listening.',
      'Whoever is giving the orders here must be stopped.'],
    set: { sawDoor: true },
  },
  // Chapter 6: open the rune door with Aldric's key.
  {
    area: 'warrens', type: 'runeDoor', at: { x: 22, y: 5 },
    when: (f, c) => f.finalQuest === 'started' && !f.chamberOpen && c.count('runeKey') >= 1,
    say: ['You fit the rune key into a slot in the middle of the door. Its runes light up one by one, then all together.',
      'With a long, grinding groan, the slab sinks into the floor. Cold air rolls out of the dark.',
      'Behind you, a voice: "Not without me, you don\'t." Tobin, out of breath, sword in hand. "Knees or no knees. Let\'s go."'],
    set: { chamberOpen: true },
  },
  {
    area: 'warrens', type: 'runeDoor', at: { x: 22, y: 5 },
    when: (f) => f.finalQuest === 'started' && !f.chamberOpen,
    say: ['The rune door is shut fast, and the runes on it are still strong enough to hold.', "Aldric's order made this door. He'll know how to open it without breaking the binding."],
  },
  {
    area: 'warrens', type: 'runeDoor', at: { x: 22, y: 5 },
    when: (f) => f.chamberOpen,
    say: (f) => [f.grubnakDown ? "The rune door stands open. Grubnak's chamber is quiet now." : "The rune door stands open. Beyond it, something huge is breathing."],
  },
  // The Goblin Chief's hut: knock to wake him (chapter 3).
  {
    area: 'route1', type: 'door', at: { x: 15, y: 36 },
    when: (f) => f.stoneQuest === 'started' && f.stoneShrine && !f.chiefAwake,
    say: ['You hammer on the door of the chief\'s hut.', 'The snoring stops.', '...', 'The door bursts open and the Goblin Chief storms out, roaring. Round his neck, on a leather cord, is a big glowing piece of stone!'],
    set: { chiefAwake: true },
  },
  {
    area: 'route1', type: 'door', at: { x: 15, y: 36 },
    when: (f) => f.chiefAwake,
    say: ["The goblin chief's hut. It's empty, and it stinks."],
  },
];

// ---- Quest drops -------------------------------------------------------------------
// A monster always drops a quest item while you need it and don't have one
// (in your bag, bank or on the ground).
export const QUEST_DROPS = [
  { enemy: 'moltenBeast', item: 'emberCore', when: (f) => f.forgeQuest === 'started', say: 'The Molten beast leaves behind a glowing ember core!' },
  { enemy: 'goblinBrute', item: 'pellsStrongbox', when: (f) => f.cartQuest === 'started' && f.cartClue, say: "The goblin brute drops a battered strongbox. Pell's!" },
  { enemy: 'goblinChief', item: 'runestoneCrown', when: (f) => f.stoneQuest === 'started', say: 'The Goblin Chief falls, and the glowing stone on his cord drops to the ground: the runestone crown!' },
  { enemy: 'goblinDigmaster', item: 'digmastersOrders', when: (f) => f.caveQuest === 'started', say: 'The Digmaster drops a filthy scroll: his orders!' },
  { enemy: 'tunnelGoblin', item: 'runestoneHeart', when: (f) => f.stoneQuest === 'started' && f.stoneShrine, say: 'The tunnel goblin drops a glowing lump of stone it was hiding: the runestone heart!' },
];
