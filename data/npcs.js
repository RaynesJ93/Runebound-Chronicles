// Villagers and travellers.
//
// Each NPC: id, name, area, home tile (x, y), how far they wander (radius),
// a look (see characterFrames in src/render/sprites.js) and a conversation.
//
// Conversations: { start, nodes }. start can be a function of ctx (ctx.flags
// are the saved story flags). Nodes have say / choices / next / set — see
// startConversation in src/ui/hud.js.

const pickLine = (lines) => () => lines[Math.floor(Math.random() * lines.length)];

export const NPCS = [
  // ---- Brambleford -------------------------------------------------------------
  {
    examine: "The village elder. She seems to know everyone's business.",
    id: 'maren', name: 'Elder Maren', area: 'brambleford', x: 23, y: 18, radius: 3, wander: 0.15,
    look: { hair: '#e8e4dc', tunic: '#6b4a8a', pants: '#6b4a8a', robe: true, hat: 'bun' },
    talk: {
      start: (c) => (c.flags.metElder ? 'again' : 'intro'),
      nodes: {
        intro: {
          say: ['Ah, a new face! Welcome to Brambleford.', "I'm Maren, elder of this village. We're a quiet lot: farmers, woodcutters, and the odd adventurer."],
          set: { metElder: true },
          next: 'menu',
        },
        again: { say: 'Back again? What can I do for you?', next: 'menu' },
        menu: {
          say: [],
          choices: [
            { text: 'Tell me about Brambleford.', next: 'town' },
            { text: "What's north of the village?", next: 'north' },
            { text: 'How do I get stronger?', next: 'stronger' },
            { text: 'Goodbye.', next: 'bye' },
          ],
        },
        town: {
          say: ['Brambleford sits at the edge of Thornwood Forest.', 'The bank and the General Store face the square. They open soon. The merchants are still on the road.'],
          next: 'more',
        },
        north: {
          say: ['The road north runs through Thornwood to the old Copperdeep Mine.', "Bram and his woodcutters cleared that fallen oak this morning, so the way is open again.",
            'But be careful. Goblins have made camp in the woods, and wolves hunt near the rocks.'],
          set: { heardOfGoblins: true },
          next: 'more',
        },
        stronger: {
          say: ['Practice, my dear. Fight, gather, craft. Every skill grows the more you use it.', "They say a true master can reach level 99. I've never met one myself."],
          next: 'more',
        },
        more: { say: 'Anything else?', choices: [
          { text: 'Tell me about Brambleford.', next: 'town' },
          { text: "What's north of the village?", next: 'north' },
          { text: 'How do I get stronger?', next: 'stronger' },
          { text: "That's all, thanks.", next: 'bye' },
        ] },
        bye: { say: 'Safe travels, and come back in one piece.' },
      },
    },
  },
  {
    examine: 'He takes guarding the north gate very seriously.',
    id: 'tomas', name: 'Guard Tomas', area: 'brambleford', x: 20, y: 5, radius: 1, wander: 0.12,
    look: { hair: '#4a3220', tunic: '#8c2f2f', pants: '#5a5f66', hat: 'helmet', beard: '#4a3220' },
    talk: {
      start: (c) => (c.flags.visitedRoute1 ? 'back' : c.flags.metTomas ? 'again' : 'warn'),
      nodes: {
        warn: {
          say: ['Halt! Oh, just a villager. Sorry. Force of habit.', "The road north is open again, but Thornwood isn't safe."],
          set: { metTomas: true },
          choices: [
            { text: "What's out there?", next: 'danger' },
            { text: 'I can handle myself.', next: 'brave' },
            { text: "I'll be careful.", next: 'careful' },
          ],
        },
        again: { say: 'Still thinking about the woods?', choices: [
          { text: "What's out there?", next: 'danger' },
          { text: 'Never mind.', next: 'careful' },
        ] },
        danger: {
          say: ['Goblins, mostly. Small, nasty, and they come in packs.', "And wolves. Fast ones. If a wolf chases you, head for the road home. They won't follow you far."],
          next: 'careful',
        },
        brave: { say: "Ha! That's what the last one said. Take some food with you, at least." },
        careful: { say: 'Keep your wits about you.' },
        back: { say: ['Back from the woods in one piece? Good on you.', 'Did you see the goblin camp? The Watch will want to hear about it.'] },
      },
    },
  },
  {
    examine: 'A small, fast child. Probably up to something.',
    id: 'pip', name: 'Pip', area: 'brambleford', x: 19, y: 14, radius: 4, wander: 0.55, fast: true,
    look: { hair: '#d9772b', tunic: '#4f9a35', pants: '#6b5137' },
    talk: {
      start: 'hi',
      nodes: {
        hi: { say: pickLine([
          'Race you to the well! ...Hey, you have to actually run!',
          "There's a frog in the well. I named him Sir Ribbit.",
          "Mum says I can't go in the forest until I'm bigger. I'm nearly bigger.",
          "Bram let me hold his axe once. It was SO heavy.",
        ]) },
      },
    },
  },
  {
    examine: 'He runs the General Store. His apron has seen better days.',
    id: 'pell', name: 'Pell the Shopkeeper', area: 'store', x: 5, y: 3, radius: 0, talkRange: 2,
    look: { hair: '#2a2a2a', tunic: '#e8dcc0', belt: '#7a4a26', pants: '#4a4a5a', beard: '#2a2a2a' },
    talk: {
      start: (c) => (c.flags.metPell ? 'again' : 'hi'),
      nodes: {
        hi: {
          say: ['Welcome, welcome! The wagon finally came in, so the shelves are full.', 'Food, potions, weapons, armour, arrows and runes. And I buy just about anything.'],
          set: { metPell: true },
          next: 'menu',
        },
        again: { say: 'Back again! What can I get you?', next: 'menu' },
        menu: { say: [], choices: [
          { text: "Let's trade.", action: 'shop' },
          { text: 'How do prices work?', next: 'prices' },
          { text: 'Just looking, thanks.', next: 'bye' },
        ] },
        prices: { say: ['The more I have of something, the cheaper it gets. Sell me ten swords and I will not pay much for the eleventh!', 'I sell to you at a fair price and buy at about a third of that.'], next: 'menu' },
        bye: { say: 'Come back soon!' },
      },
    },
  },
  {
    examine: 'She keeps the village savings safe. Nothing gets past her.',
    id: 'edda', name: 'Edda the Banker', area: 'bank', x: 5, y: 3, radius: 0, talkRange: 2,
    look: { hair: '#a8a39a', tunic: '#2f4a73', pants: '#2f4a73', robe: true, hat: 'bun' },
    talk: {
      start: 'hi',
      nodes: {
        hi: {
          say: 'Good day. Welcome to the Bank of Brambleford. How may I help?',
          choices: [
            { text: "I'd like to use my bank.", action: 'bank' },
            { text: 'What is a bank for?', next: 'about' },
            { text: 'Nothing, thank you.', next: 'bye' },
          ],
        },
        about: { say: ['We keep your things safe, as many as you like. Everything stacks in the vault.', "Anything in the bank stays safe if you're unlucky out in the woods. Any booth here will do."], next: 'hi' },
        bye: { say: 'Good day to you.' },
      },
    },
  },
  {
    examine: 'A farmer with soil under every fingernail.',
    id: 'wyn', name: 'Farmer Wyn', area: 'brambleford', x: 33, y: 30, radius: 3, wander: 0.2,
    look: { hair: '#8a5a2e', tunic: '#6f8f3a', pants: '#3f5f8a', hat: 'straw' },
    talk: {
      start: 'hi',
      nodes: {
        hi: {
          say: "Mornin'! Pumpkins are nearly ripe.",
          choices: [
            { text: 'Need a hand?', next: 'help' },
            { text: 'Nice scarecrow.', next: 'crow' },
            { text: 'Bye!', next: 'bye' },
          ],
        },
        help: { say: "Not today, but thank you kindly. Come harvest time I might take you up on that." },
        crow: { say: ["Old Hubert? Useless. The crows sit on his hat.", "Still, he's good company."] },
        bye: { say: 'Mind the cabbages on your way out.' },
      },
    },
  },

  // ---- Route 1 -----------------------------------------------------------------
  {
    examine: 'A big, bearded woodcutter. He smells of pine.',
    id: 'bram', name: 'Bram the Woodcutter', area: 'route1', x: 27, y: 38, radius: 2, wander: 0.18,
    look: { hair: '#a8462a', tunic: '#b0302a', pants: '#4a3a2a', beard: '#a8462a' },
    talk: {
      start: (c) => (c.flags.metBram ? 'again' : 'intro'),
      nodes: {
        intro: {
          say: ["Hello there! Name's Bram. I cut the wood round these parts.", 'We cleared that fallen oak off the village road this morning. Took six of us and a lot of grumbling.'],
          set: { metBram: true },
          next: 'menu',
        },
        again: { say: 'Still in one piece? Good.', next: 'menu' },
        menu: { say: [], choices: [
          { text: 'Any danger in these woods?', next: 'danger' },
          { text: 'Do you have a bow I could use?', next: 'bow', if: (c) => !c.flags.gotBow },
          { text: 'Where do I get more arrows?', next: 'arrows', if: (c) => c.flags.gotBow },
          { text: 'Can you teach me to chop trees?', next: 'teach' },
          { text: 'See you around.', next: 'bye' },
        ] },
        bow: {
          say: ["A bow? I've a spare shortbow I made last winter. Take it, and a quiver of arrows.",
            'Put the arrows in your ammo slot and the bow in your hand. Then you can shoot from a safe distance.'],
          give: { flag: 'gotBow', items: [{ item: 'shortbow', qty: 1 }, { item: 'bronzeArrow', qty: 50 }] },
          giveFail: 'bowFull',
          next: 'menu',
        },
        bowFull: { say: 'Your bag is stuffed full! Make some room, then ask me again.', next: 'menu' },
        arrows: { say: ['Goblins carry a few. And most arrows you shoot land under your target, so pick them back up.'], next: 'menu' },
        danger: {
          say: ["Goblins, west of the road past the tall grass. They've pitched tents and everything.", "Wolves keep to the rocks up north-east. Don't go poking round there without a weapon."],
          set: { heardOfGoblins: true },
          next: 'menu',
        },
        teach: {
          say: ['Ha! Not without an axe, you can\'t.', 'Once Pell gets some stock in, buy yourself a bronze axe and come and find me.'],
          set: { bramOffersLessons: true },
          next: 'menu',
        },
        bye: { say: 'Mind the roots on the path.' },
      },
    },
  },
  {
    examine: 'A traveller with a staff and a lot of stories.',
    id: 'wren', name: 'Wren the Traveller', area: 'route1', x: 13, y: 5, radius: 1, wander: 0.15,
    look: { hair: '#3a2a1a', tunic: '#4a6b3a', pants: '#5a4a3a', hat: 'hood', hatColor: '#3d5a30' },
    talk: {
      start: 'hi',
      nodes: {
        hi: {
          say: ["The mine road's blocked by a rockslide. I've been waiting two days for someone to clear it.", "If you're heading north, you'll have to wait too."],
          next: 'menu',
        },
        menu: { say: [], choices: [
          { text: "What's at the mine?", next: 'mine' },
          { text: 'Is that a magic staff?', next: 'staff', if: (c) => !c.flags.gotStaff },
          { text: 'How does magic work?', next: 'magic', if: (c) => c.flags.gotStaff },
          { text: 'Good luck.', next: 'bye' },
        ] },
        staff: {
          say: ["This old thing? I'm an apprentice of the Tower, or I was. I've a spare one, actually.",
            "Here, take it, and some runes. Wield the staff, pick Wind Strike in your Combat tab, and every attack casts it.",
            'Each cast uses an air rune and a mind rune. Water Strike needs Magic level 5 and a water rune too.'],
          give: { flag: 'gotStaff', items: [{ item: 'apprenticeStaff', qty: 1 }, { item: 'airRune', qty: 60 }, { item: 'mindRune', qty: 50 }, { item: 'waterRune', qty: 20 }] },
          giveFail: 'staffFull',
          next: 'menu',
        },
        staffFull: { say: 'You have no room for it! Free up some space in your bag first.', next: 'menu' },
        magic: { say: ['Runes hold the power. The staff just points it.', 'Goblins carry air and mind runes; the brute by the tents often has water runes.'], next: 'menu' },
        mine: { say: ['Copper, tin, and dwarves who don\'t much like visitors.', "Best place around to learn mining, once you can get there."], next: 'menu' },
        bye: { say: 'And to you.' },
      },
    },
  },
];
