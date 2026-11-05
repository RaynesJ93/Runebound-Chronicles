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
            { text: 'Pell found this token in his strongbox...', next: 'war', if: (c) => c.flags.cartQuest === 'done' && !c.flags.warQuest },
            { text: 'About the Goblin War...', next: 'warProgress', if: (c) => c.flags.warQuest === 'started' },
            { text: 'About Grubnak...', next: 'warDone', if: (c) => c.flags.warQuest === 'done' },
            { text: 'Tell me about Brambleford.', next: 'town' },
            { text: "What's north of the village?", next: 'north' },
            { text: 'How do I get stronger?', next: 'stronger' },
            { text: 'Goodbye.', next: 'bye' },
          ],
        },
        // ---- The Runebound, chapter 2: Echoes of the War -------------------------------
        war: {
          say: ['A token? Let me see.', '...', 'A crown over three slashes. I have not seen that mark since I was a girl.',
            "It's the mark of Grubnak, the goblin warlord. Forty years ago his horde came out of the north-west and burned half of Thornwood.",
            "The Watch held the crossroads, and the war ended. They told us he was dead. So why are his goblins carrying his mark again?"],
          choices: [
            { text: "I'll find out.", next: 'warStart' },
            { text: "That's in the past.", next: 'warPast' },
          ],
        },
        warPast: { say: "I hope you're right. Come back if you change your mind.", next: 'more' },
        warStart: {
          set: { warQuest: 'started' },
          say: ['Thank you. Start with the war memorial in the old graveyard, south in Thornwood. It names the fallen.',
            'Captain Holt of the Watch led the last stand. He kept a post at the old watchtower, north of the road. If he left anything behind, it would be there.',
            'And ask about. Some who fought are still alive, though few of them like to talk about it.'],
          next: 'more',
        },
        warProgress: {
          say: (c) => (c.flags.hermitTold
            ? ['You look like you have news.']
            : [`Have you been to the memorial in the graveyard${c.flags.warMemorial ? '? Yes, good' : ' yet'}? And the old watchtower${c.flags.warJournal ? '? Good' : ''}?`,
              c.flags.warJournal ? "A journal of Holt's? Then he mentions others who fought. Find them, if any still live." : 'Holt kept a post at the old watchtower, north of the road.']),
          choices: [
            { text: "Grubnak isn't dead.", next: 'warHandIn', if: (c) => c.flags.hermitTold && c.flags.warMemorial },
            { text: "Grubnak isn't dead.", next: 'warNotYet', if: (c) => c.flags.hermitTold && !c.flags.warMemorial },
            { text: "I'm still looking.", next: 'more' },
          ],
        },
        warNotYet: { say: "Not dead? Then why is there a memorial... Go and read it again, in the graveyard. I want to be sure before I believe this.", next: 'more' },
        warHandIn: {
          give: { flag: 'warPaid', items: [{ item: 'coins', qty: 600 }] },
          giveFail: 'warFull',
          set: { warQuest: 'done' },
          reward: { xp: { attack: 250, strength: 250, defence: 250 }, quest: 'Echoes of the War' },
          say: ['Bound? Under the old cave? And a runestone in the shrine holding him there...', 'Holt lied to all of us. To keep us safe, I suppose. Forty years we\'ve slept easy on top of that.',
            "If his goblins are carrying his mark again, something has changed. The binding must be weakening.",
            "Take this, for your trouble. And thank you. I need to think about what we do next. Come and see me again soon."],
          next: 'more',
        },
        warFull: { say: "Your bag's full, dear. Make a little room and come back.", next: 'more' },
        warDone: { say: ["Grubnak, bound under the old cave. I still can't quite believe it.", 'I\'m thinking on what to do. Talk to me again soon. (The story continues in chapter 3, coming soon.)'], next: 'more' },
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
          { text: 'Pell found this token in his strongbox...', next: 'war', if: (c) => c.flags.cartQuest === 'done' && !c.flags.warQuest },
          { text: 'About the Goblin War...', next: 'warProgress', if: (c) => c.flags.warQuest === 'started' },
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
          { text: 'You look worried.', next: 'cart', if: (c) => !c.flags.cartQuest },
          { text: 'About your cart...', next: 'cartProgress', if: (c) => c.flags.cartQuest === 'started' },
          { text: 'How do prices work?', next: 'prices' },
          { text: 'Just looking, thanks.', next: 'bye' },
        ] },

        // ---- The Runebound, chapter 1: The Overturned Cart ------------------------------
        cart: {
          say: ['Worried? Me? ...Oh, all right. Yes.', 'My second supply cart never made it. The driver ran back last night: goblins jumped him on the mine road, just north of the village.',
            "He's fine. But they took my strongbox. Everything I've saved this season is in it."],
          choices: [
            { text: "I'll get it back.", next: 'cartStart' },
            { text: 'Sorry to hear that.', next: 'menu' },
          ],
        },
        cartStart: {
          set: { cartQuest: 'started' },
          say: ["You will? Bless you! The cart's still lying where they left it, in Thornwood, a little way up the road.",
            "Have a look around it. And be careful. The driver said these weren't the little goblins. Big ones. Brutes."],
          next: 'menu',
        },
        cartProgress: {
          say: (c) => (c.count('pellsStrongbox') ? ['Is that... my strongbox?!'] : c.flags.cartClue
            ? ['Goblin tracks heading west, you say? That\'ll be the goblin camp. Watch out for the brutes.']
            : ["The cart's in Thornwood, a little way up the road north of the village. Have a look around it."]),
          choices: [
            { text: 'Here it is.', next: 'cartHandIn', if: (c) => c.count('pellsStrongbox') >= 1 },
            { text: "I'm still looking.", next: 'menu' },
          ],
        },
        cartHandIn: {
          give: { flag: 'cartPaid', items: [{ item: 'coins', qty: 300 }, { item: 'meatPie', qty: 3 }, { item: 'goblinToken', qty: 1 }] },
          giveFail: 'cartFull',
          take: [{ item: 'pellsStrongbox', qty: 1 }],
          takeFail: 'cartProgress',
          set: { cartQuest: 'done' },
          reward: { xp: { attack: 150, strength: 150 }, quest: 'The Overturned Cart' },
          say: ['It IS! Still locked, too. Those brutes never got it open.', '*click* ...All there. Every coin. Here, take some for your trouble, and some pies. Fresh this morning.',
            "Hang on, what's this? This isn't mine. A bone disc, carved with... a crown? Three slashes?",
            "Gives me the shivers. Show it to Elder Maren in the square. If anyone knows what it means, she will."],
          next: 'menu',
        },
        cartFull: { say: "I want to give you something, but your bag's full! Make room for five things and come back.", next: 'menu' },
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

  {
    examine: 'A weathered old fisherman. He smells strongly of the pond.',
    id: 'finn', name: 'Old Finn', short: 'Finn', area: 'brambleford', x: 12, y: 28, radius: 1, wander: 0.1,
    look: { hair: '#d8d4cc', tunic: '#3d6a8a', pants: '#4a4a3a', beard: '#e4e0d8', hat: 'straw' },
    talk: {
      start: (c) => (c.flags.metFinn ? 'again' : 'intro'),
      nodes: {
        intro: {
          say: ["Shh! You'll scare the fish. ...Oh, it's fine, they're not biting anyway.", "Name's Finn. Been fishing this pond since before your parents were born."],
          set: { metFinn: true },
          next: 'menu',
        },
        again: { say: 'Bite yet?', next: 'menu' },
        menu: { say: [], choices: [
          { text: 'Can you teach me to fish?', next: 'teach', if: (c) => !c.flags.gotNet },
          { text: 'How does fishing work again?', next: 'lesson', if: (c) => c.flags.gotNet },
          { text: 'How do I cook what I catch?', next: 'cook' },
          { text: 'Where are the big fish?', next: 'big' },
          { text: 'Tight lines, Finn.', next: 'bye' },
        ] },
        teach: {
          say: ['Ha! A pupil. Here, take my spare net and an old rod, and a tin of worms for bait.'],
          give: { flag: 'gotNet', items: [{ item: 'smallNet', qty: 1 }, { item: 'fishingRod', qty: 1 }, { item: 'fishingBait', qty: 30 }] },
          giveFail: 'full',
          next: 'lesson',
        },
        full: { say: "Your bag's full to bursting. Make some room and I'll give you something.", next: 'menu' },
        lesson: {
          say: ['See the ripples on the water? Those are fishing spots. Tap one and you\'ll fish until your bag\'s full.',
            'Use the net on the ones near me for shrimps. The rod and bait spots on the far side give sardines from Fishing 5, and herring at 10.',
            'Every cast with the rod uses one bait. Pell sells more.'],
          next: 'menu',
        },
        cook: {
          say: ['Tap the cooking pit right there, then pick what to cook.', "You'll burn a lot at first. Everyone does. You burn less as your Cooking level goes up.",
            'Wyn\'s chickens cook up nicely too. The goblins\' campfire in Thornwood works in a pinch, and so does the hunters\' fire by the lake.'],
          next: 'menu',
        },
        big: {
          say: ['Trout and salmon swim in the fast water of the stream in Thornwood.', 'You need a fly fishing rod from Pell, and feathers for lures. Trout need Fishing 20, salmon 30.'],
          next: 'menu',
        },
        bye: { say: 'And may they be big ones.' },
      },
    },
  },

  {
    examine: 'A strong-armed tanner. Her apron is stained every shade of brown.',
    id: 'hilda', name: 'Hilda the Tanner', short: 'Hilda', area: 'brambleford', x: 37, y: 40, radius: 1, wander: 0.12,
    look: { hair: '#7a3a1e', tunic: '#6e5a3a', pants: '#4a3a2a', hat: 'bun' },
    talk: {
      start: (c) => (c.flags.metHilda ? 'again' : 'intro'),
      nodes: {
        intro: {
          say: ["Hello, love. Hilda's the name, hides are the game.", "Those cows over there give the best hides in Brambleford. I turn them into leather."],
          set: { metHilda: true },
          next: 'menu',
        },
        again: { say: 'Brought me some hides?', next: 'menu' },
        menu: { say: [], choices: [
          { text: 'Can you teach me to craft?', next: 'teach', if: (c) => !c.flags.gotNeedle },
          { text: 'How does crafting work again?', next: 'lesson', if: (c) => c.flags.gotNeedle },
          { text: 'What can I make?', next: 'make' },
          { text: 'Bye, Hilda.', next: 'bye' },
        ] },
        teach: {
          say: ["Course I can. Here's a needle, and some thread to get you started."],
          give: { flag: 'gotNeedle', items: [{ item: 'needle', qty: 1 }, { item: 'thread', qty: 20 }] },
          giveFail: 'full',
          next: 'lesson',
        },
        full: { say: "Your bag's full! Make a bit of room first.", next: 'menu' },
        lesson: {
          say: ['First, kill a cow or two and take the hides. Every cow drops one.',
            'Bring them to my tanning rack here and tap it to tan them into leather. Hard leather needs Crafting 6.',
            'Then tap your leather with a needle and thread in your bag, and pick what to sew. Each piece uses one thread. Pell sells more.'],
          next: 'menu',
        },
        make: {
          say: ['Gloves to start with. Boots at 4, a cowl at 6, vambraces at 8.', 'A leather body at 10 and chaps at 13.',
            'Then hard leather: gloves at 15, boots at 16, a cowl at 18, a body at 20 and chaps at 22.',
            "It all helps an archer. The vambraces and chaps especially."],
          next: 'menu',
        },
        bye: { say: 'Mind the cow pats.' },
      },
    },
  },

  {
    examine: 'She has a telescope under one arm and stardust on her sleeves.',
    id: 'lyra', name: 'Lyra the Stargazer', short: 'Lyra', area: 'brambleford', x: 25, y: 18, radius: 1, wander: 0.1,
    look: { hair: '#e8e0f0', tunic: '#3a3a7a', pants: '#2a2a5a', belt: '#c8a030', hat: 'hood', hatColor: '#3a3a7a' },
    talk: {
      start: (c) => (c.flags.metLyra ? 'again' : 'intro'),
      nodes: {
        intro: {
          say: ['Oh! Hello. Lyra, stargazer. I watch the sky for falling stars.', 'They crash all over the place: the village, Thornwood, even the Vale. Mine one with a pickaxe and you get stardust.'],
          set: { metLyra: true },
          next: 'menu',
        },
        again: { say: 'Seen any stars come down?', next: 'menu' },
        menu: { say: [], choices: [
          { text: 'Where is the star now?', next: 'where' },
          { text: "Let's trade stardust.", action: 'starShop' },
          { text: 'How do stars work?', next: 'how' },
          { text: 'Bye, Lyra.', next: 'bye' },
        ] },
        where: { say: (c) => c.starNews?.() || "Nothing's come down for a while. Keep an eye on the sky.", next: 'menu' },
        how: {
          say: ['A star can be size 1 to 5. The bigger it is, the higher the Mining level you need.', 'Every 25 stardust, it shrinks a size. So if a big one is too hard for you, wait for someone... well, wait for it to shrink.',
            'Bring me the dust. I trade it for the prospector outfit, which helps you learn faster, and for bags of coal and gems.'],
          next: 'menu',
        },
        bye: { say: 'Clear skies!' },
      },
    },
  },

  // ---- Thornwood -----------------------------------------------------------------
  {
    examine: 'A big, bearded woodcutter. He smells of pine.',
    id: 'bram', name: 'Bram the Woodcutter', area: 'route1', x: 64, y: 77, radius: 2, wander: 0.18,
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
          { text: 'Can you teach me to chop trees?', next: 'teach', if: (c) => !c.flags.gotAxe },
          { text: 'Remind me how woodcutting works.', next: 'lesson', if: (c) => c.flags.gotAxe },
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
          say: ['Ha! Course I can. First thing you need is an axe.', "Here's my old bronze one, and a knife while I'm at it."],
          give: { flag: 'gotAxe', items: [{ item: 'bronzeAxe', qty: 1 }, { item: 'knife', qty: 1 }] },
          giveFail: 'bowFull',
          set: { bramOffersLessons: true },
          next: 'lesson',
        },
        lesson: {
          say: ['Tap a pine tree and you\'ll chop away at it till you get a log. Pines fall after one log, but they grow back quick.',
            'Oaks need Woodcutting 15. They give better logs and last longer.',
            'Then tap your logs to carve them with the knife: arrow shafts first, bows once you get the hang of it.',
            'Add feathers to the shafts, then bronze arrowtips. Pell sells both, and goblins carry feathers.'],
          next: 'menu',
        },
        bye: { say: 'Mind the roots on the path.' },
      },
    },
  },
  {
    examine: 'A traveller with a staff and a lot of stories.',
    id: 'wren', name: 'Wren the Traveller', area: 'route1', x: 33, y: 14, radius: 1, wander: 0.15,
    look: { hair: '#3a2a1a', tunic: '#4a6b3a', pants: '#5a4a3a', hat: 'hood', hatColor: '#3d5a30' },
    talk: {
      start: 'hi',
      nodes: {
        hi: {
          say: ["They've finally cleared the rockslide! The mine's just up the road.", "I'm resting my feet before I go in."],
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
        mine: { say: ['Copper and tin near the entrance, iron deeper in.', "Dorrin runs the place. Ask him and he'll teach you to mine and smith."], next: 'menu' },
        bye: { say: 'And to you.' },
      },
    },
  },

  // ---- Thornwood -------------------------------------------------------------------
  {
    examine: 'A weathered old man in a faded Watch coat. He looks like he was a soldier once.',
    id: 'tobin', name: 'Tobin the Hermit', short: 'Tobin', area: 'route1', x: 17, y: 26, radius: 1, wander: 0.08,
    look: { hair: '#d8d4cc', tunic: '#4a5a3a', pants: '#3a3a30', beard: '#e4e0d8', hat: 'hood', hatColor: '#3e3428' },
    talk: {
      start: (c) => (c.flags.warQuest === 'started' && !c.flags.hermitTold ? (c.flags.warJournal ? 'journal' : 'wary') : c.flags.hermitTold ? 'again' : 'hi'),
      nodes: {
        hi: { say: pickLine([
          "Hmph. Visitors. Don't get many. Don't want many.",
          'Mind the goblins on your way back. They\'re getting bolder.',
          "I've lived out here forty years. I like the quiet.",
        ]) },
        wary: {
          say: ['The war? Who sent you? Maren?', "I don't talk about the war. Not to strangers.",
            "If you want to know what happened, go and look in the old watchtower. If Holt left anything, it'll be there. Then come back."],
        },
        journal: {
          say: ["That book. Where did you... that's Holt's hand. I'd know it anywhere.", 'Sit down. I suppose you\'ve earned the truth.',
            "I was sixteen. Holt's youngest soldier. We held the crossroads for forty days, and Grubnak walked through our arrows like they were rain.",
            "He can't be killed. So the runekeepers came from the Vale and bound him, under the stones of the cave north-west of here. Then they sealed it with boulders.",
            'The binding is held by a runestone in the stone shrine, on the eastern hill. As long as the stone sits there, he sleeps.',
            'Holt and I swore to watch over it. Holt is gone now. I built my hut here, close to the cave, and I have kept watch every day since.',
            "And now his goblins carry his mark again. They can feel him stirring. Tell Maren. Tell her the binding is weakening."],
          set: { hermitTold: true },
        },
        again: {
          say: (c) => (c.flags.warQuest === 'done'
            ? ['Maren knows, then. Good. Keep your sword sharp. (The story continues in chapter 3, coming soon.)']
            : ['Go on, tell Maren what I told you. The binding, the runestone, the cave. She needs to know.']),
        },
      },
    },
  },

  // ---- Copperdeep Mine -----------------------------------------------------------
  {
    examine: 'A stocky old miner with a lamp on his helmet and dust in his beard.',
    id: 'dorrin', name: 'Dorrin the Miner', area: 'mine', x: 16, y: 21, radius: 2, wander: 0.12,
    look: { hair: '#8a8580', tunic: '#6a4a2a', pants: '#4a3a2a', beard: '#b8b2a8', hat: 'helmet', hatColor: '#c8a030' },
    talk: {
      start: (c) => (c.flags.metDorrin ? 'again' : 'intro'),
      nodes: {
        intro: {
          say: ["Mind your head! Welcome to Copperdeep. I'm Dorrin.", 'Bram\'s lot helped us shift the rockslide, so we\'re digging again at last.'],
          set: { metDorrin: true },
          next: 'menu',
        },
        again: { say: 'Back for more ore?', next: 'menu' },
        menu: { say: [], choices: [
          { text: 'Can you teach me to mine?', next: 'teach', if: (c) => !c.flags.gotPickaxe },
          { text: 'How does mining work again?', next: 'lesson', if: (c) => c.flags.gotPickaxe },
          { text: 'How do I make things from ore?', next: 'smith' },
          { text: "What's deeper in?", next: 'deeper' },
          { text: 'Is there anything I can help with?', next: 'quest', if: (c) => !c.flags.forgeQuest },
          { text: 'About the great forge...', next: 'questProgress', if: (c) => c.flags.forgeQuest === 'started' },
          { text: "How's the great forge?", next: 'questDone', if: (c) => c.flags.forgeQuest === 'done' },
          { text: 'See you, Dorrin.', next: 'bye' },
        ] },

        // ---- Quest: The Cold Forge -----------------------------------------------------
        quest: {
          say: ["Help? Well... far below the Hollow there's an old dwarven forge. My grandad used to talk about it.",
            'The great furnace down there has gone cold. Light it again, and you could smelt right next to the best ore there is.'],
          next: 'questAsk',
        },
        questAsk: { say: [], choices: [
          { text: "I'll help.", next: 'questStart', if: (c) => c.level('smithing') >= 40 && c.level('mining') >= 40 },
          { text: "I'll help.", next: 'questTooLow', if: (c) => !(c.level('smithing') >= 40 && c.level('mining') >= 40) },
          { text: 'Maybe later.', next: 'menu' },
        ] },
        questTooLow: { say: "I'd like that, but it's no place for a beginner. Come back with Smithing 40 and Mining 40.", next: 'menu' },
        questStart: {
          set: { forgeQuest: 'started' },
          say: ['Right! The furnace needs relining and fuel. Bring me 25 coal and 5 steel bars.',
            "And it needs a spark that never goes out. The Molten beast in the forge's far hall carries one inside it: an ember core.",
            "Bring me all three, and I'll head down and fire it up."],
          next: 'menu',
        },
        questProgress: {
          say: (c) => [`Got everything? I need 25 coal (you have ${c.count('coal')}), 5 steel bars (${c.count('steelBar')}) and the ember core (${c.count('emberCore') ? 'yes' : 'not yet'}).`],
          choices: [
            { text: 'Here you go.', next: 'questHandIn', if: (c) => c.count('coal') >= 25 && c.count('steelBar') >= 5 && c.count('emberCore') >= 1 },
            { text: 'Not yet.', next: 'menu' },
          ],
        },
        questHandIn: {
          give: { flag: 'gotSmithOutfit', items: [{ item: 'smithsTunic', qty: 1 }, { item: 'smithsTrousers', qty: 1 }, { item: 'smithsGloves', qty: 1 }, { item: 'smithsBoots', qty: 1 }] },
          giveFail: 'questFull',
          take: [{ item: 'coal', qty: 25 }, { item: 'steelBar', qty: 5 }, { item: 'emberCore', qty: 1 }],
          takeFail: 'questProgress',
          set: { forgeQuest: 'done' },
          reward: { xp: { smithing: 1000, mining: 500 }, quest: 'The Cold Forge' },
          say: ["That's everything! Right, I'm off down the tunnels. Back soon...",
            '...and done! The great furnace in the Sunken Forge is roaring again. Smelt anything you like down there.',
            "And take this: my old smithing outfit. It'll help you learn faster at the furnace and anvil."],
          next: 'menu',
        },
        questFull: { say: "I've got something for you, but your bag's full. Make room for four things and come back.", next: 'menu' },
        questDone: { say: 'Roaring away, last I looked. Best forge in the land, that.', next: 'menu' },
        teach: {
          say: ['Course! Every miner starts with a pickaxe. Take this old bronze one.', 'And a hammer, for the anvil. You\'ll want that soon enough.'],
          give: { flag: 'gotPickaxe', items: [{ item: 'bronzePickaxe', qty: 1 }, { item: 'hammer', qty: 1 }] },
          giveFail: 'full',
          next: 'lesson',
        },
        full: { say: "You've no room in that bag! Clear a couple of spaces and come back.", next: 'menu' },
        lesson: {
          say: ['Tap a rock and you\'ll chip away at it until some ore comes loose. Then the rock\'s empty for a few seconds.',
            'Copper and tin are in the west gallery. Iron\'s to the east, but you\'ll need Mining 15 for it.'],
          next: 'menu',
        },
        smith: {
          say: ['Take one copper ore and one tin ore to the furnace there, and out comes a bronze bar.',
            'Iron bars need Smithing 15. One ore makes one bar.',
            'Then take your bars to the anvil with a hammer. Daggers, swords, helmets, shields, even arrowtips.'],
          next: 'menu',
        },
        deeper: {
          say: ['Tunnel goblins. They crept in while the road was blocked, and they keep "borrowing" our ore.',
            'Not too tough on their own. Teach them some manners if you like.'],
          next: 'menu',
        },
        bye: { say: 'Watch for falling rocks!' },
      },
    },
  },

  // ---- Whispering Vale -----------------------------------------------------------
  {
    examine: 'An old runekeeper in a starry blue robe. His fingers are stained with ink.',
    id: 'aldric', name: 'Aldric the Runekeeper', short: 'Aldric', area: 'vale', x: 28, y: 26, radius: 2, wander: 0.12,
    look: { hair: '#d8d4cc', tunic: '#2f3f7a', pants: '#2f3f7a', robe: true, beard: '#e4e0d8', hat: 'hood', hatColor: '#24326a' },
    talk: {
      start: (c) => (c.flags.metAldric ? 'again' : 'intro'),
      nodes: {
        intro: {
          say: ['Welcome to Whispering Vale, traveller. Listen. Can you hear it?', "That's the old magic. I'm Aldric. I keep watch over the altars."],
          set: { metAldric: true },
          next: 'menu',
        },
        again: { say: 'The altars are quiet today. Good for crafting.', next: 'menu' },
        menu: { say: [], choices: [
          { text: 'How do I make runes?', next: 'how' },
          { text: 'Tell me about the altars.', next: 'altars' },
          { text: 'What is that chest?', next: 'chest' },
          { text: 'Farewell, Aldric.', next: 'bye' },
        ] },
        how: {
          say: ['First, mine essence in the quarry to the north-west. Any pickaxe will do, and the crystals never run dry.',
            'Then carry it to an altar and touch the altar. Every piece of essence in your bag becomes a rune at once.',
            'The better you get, the more runes each essence gives. Air runes double at Runecrafting 11.'],
          next: 'menu',
        },
        altars: {
          say: ['The Air altar stands on the windy hill to the north-east. Anyone can use it.',
            'The Mind altar is in the stone ring to the south-east. You need Runecrafting 2.',
            'And the Water altar is by the lake to the south-west, at Runecrafting 5.'],
          next: 'menu',
        },
        chest: {
          say: ["That's our supply chest. We runekeepers can't be walking to Brambleford every day.", 'It is bound to the bank there. Put things in here, take them out there. Handy, no?'],
          next: 'menu',
        },
        bye: { say: 'May the wind carry you.' },
      },
    },
  },
];
