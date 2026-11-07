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
            { text: "It's over. Grubnak is bound for ever.", next: 'finalEnd', if: (c) => c.flags.finalQuest === 'started' && c.flags.tobinThanked },
            { text: 'About Grubnak...', next: 'warDone', if: (c) => c.flags.warQuest === 'done' && !(c.flags.finalQuest === 'started' && c.flags.tobinThanked) },
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
              c.flags.warJournal ? "A journal of Holt's? And it names a young soldier called Tobin? There's an old hermit called Tobin in the hut in north-west Thornwood, near the sealed cave. He keeps to himself. Folk say he was a soldier once. Go and see him." : 'Holt kept a post at the old watchtower, north of the road.']),
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
        // ---- The Runebound, the ending -------------------------------------------------
        finalEnd: {
          give: { flag: 'finalPaid', items: [{ item: 'coins', qty: 5000 }] },
          giveFail: 'warFull',
          set: { finalQuest: 'done' },
          reward: { xp: { attack: 800, strength: 800, defence: 800, hitpoints: 800 }, quest: 'The Runebound' },
          say: ['Bound? For ever? Turned to stone?', '...', '*Maren takes both your hands in hers. Her eyes are wet.*',
            'Forty years. Holt lied to keep us safe, and Tobin gave up his whole life to keep the lie true. And you ended it.',
            'Brambleford owes you more than it can pay. But take this: the village chest, every coin we could spare. There will be a feast, and you will sit at the head of the table.',
            'And one more thing. Since the war, the old road east of Whispering Vale has been closed. Nobody dared open it with Grubnak under our feet.',
            'Now we can. There is a whole world out there. When you are ready, I think it is waiting for you.'],
          next: 'more',
        },
        warFull: { say: "Your bag's full, dear. Make a little room and come back.", next: 'more' },
        warDone: { say: (c) => (c.flags.finalQuest === 'done'
          ? ['Grubnak, a statue in a cave. I go and look at the war memorial sometimes now, and for the first time in my life it feels finished.', 'Have you thought about the east road? There is a whole world past the Vale.']
          : c.flags.stoneQuest === 'done'
          ? ['The pieces of the stone are with Aldric? Thank the stars. Help him however you can.']
          : ["Grubnak, bound under the old cave. I still can't quite believe it.", "Tobin has watched that binding for forty years. Go and see him. He'll know what needs doing."]), next: 'more' },
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
          { text: "It's over. Grubnak is bound for ever.", next: 'finalEnd', if: (c) => c.flags.finalQuest === 'started' && c.flags.tobinThanked },
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
          say: ['Worried? Me? ...Oh, all right. Yes.', 'My second supply cart never made it. Goblins jumped the driver last night on the south road, right before the bridge. Inside the village!',
            "He's fine. But they took my strongbox. Everything I've saved this season is in it."],
          choices: [
            { text: "I'll get it back.", next: 'cartStart' },
            { text: 'Sorry to hear that.', next: 'menu' },
          ],
        },
        cartStart: {
          set: { cartQuest: 'started' },
          say: ["You will? Bless you! The cart's still lying where they left it, down the south road by the bridge.",
            "Have a look around it. And be careful. The driver said these weren't the little goblins. Big ones. Brutes."],
          next: 'menu',
        },
        cartProgress: {
          say: (c) => (c.count('pellsStrongbox') ? ['Is that... my strongbox?!'] : c.flags.cartClue
            ? ['Goblin tracks heading west, you say? That\'ll be the goblin camp. Watch out for the brutes.']
            : ["The cart's down the south road, just before the bridge. Have a look around it."]),
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
            ? ['Maren knows, then. Good.']
            : ['Go on, tell Maren what I told you. The binding, the runestone, the cave. She needs to know.']),
          choices: [
            { text: 'What do we do now?', next: 'stone', if: (c) => c.flags.warQuest === 'done' && !c.flags.stoneQuest },
            { text: 'About the runestone...', next: 'stoneProgress', if: (c) => c.flags.stoneQuest === 'started' },
            { text: 'How are you holding up?', next: 'stoneDone', if: (c) => c.flags.stoneQuest === 'done' && !c.flags.stonePlaced },
            { text: 'The Binding Stone is back in the shrine.', next: 'remakeEnd', if: (c) => c.flags.stonePlaced && c.flags.remakeQuest === 'started' },
            { text: 'What happens now?', next: 'cave', if: (c) => c.flags.remakeQuest === 'done' && !c.flags.caveQuest },
            { text: 'About the cave...', next: 'caveProgress', if: (c) => c.flags.caveQuest === 'started' && !c.count('digmastersOrders') },
            { text: 'I found these orders on the Digmaster.', next: 'caveEnd', if: (c) => c.flags.caveQuest === 'started' && c.count('digmastersOrders') > 0 },
            { text: 'What now?', next: 'final', if: (c) => c.flags.caveQuest === 'done' && !c.flags.finalQuest },
            { text: 'About Grubnak...', next: 'finalHut', if: (c) => c.flags.finalQuest === 'started' },
            { text: 'How are you, Tobin?', next: 'finalAfter', if: (c) => c.flags.finalQuest === 'done' },
            { text: 'Goodbye, Tobin.', next: 'bye' },
          ],
        },
        bye: { say: 'Hmph. Mind the goblins.' },

        // ---- The Runebound, chapter 3: The Empty Hollow -----------------------------
        stone: {
          say: ['Now? Now it\'s worse than I feared.', 'I went up to the shrine this morning, like I do every week. The hollow is empty. The runestone is gone.',
            "Without it the binding won't hold for long. Days, maybe. Weeks if we're lucky.", 'Go and look for yourself. Find out who took it. I\'d go, but these knees...'],
          choices: [
            { text: "I'll find the stone.", next: 'stoneStart' },
            { text: 'Not yet.', next: 'bye' },
          ],
        },
        stoneStart: {
          set: { stoneQuest: 'started' },
          say: ['Good. The shrine is on the eastern hill, past the crossroads, in the ring of standing stones.',
            "If goblins took it, they'll have smashed it up and shared out the pieces. Goblins always share out loot. Find every piece."],
        },
        stoneProgress: {
          say: (c) => {
            const have = ['runestoneBase', 'runestoneCrown', 'runestoneHeart'].filter((id) => c.count(id) > 0).length;
            if (!c.flags.stoneShrine) return ['The shrine is on the eastern hill, in the ring of standing stones. Go and look.'];
            if (have === 3) return ['All three pieces! Take them to Aldric in Whispering Vale. His order made that stone. If anyone can mend it, he can.'];
            return [`Smashed in pieces, you say? You've got ${have} of them. Goblins share loot by rank: the chief keeps the best bit, and the rest goes to whoever ran off with it.`,
              c.flags.chiefAwake ? 'You woke the chief? Ha! Then go and take it off him.' : 'The chief sleeps in the big hut in the goblin camp. Knock loud.',
              'And tracks towards the mine? Dorrin has had tunnel goblins for months.'];
          },
          next: 'bye',
        },
        stoneDone: { say: ['Better, now the pieces are with Aldric. I can sleep for an hour or two at a time.', "Go and see him. He'll need help to remake it."] },

        // ---- The Runebound, chapter 4: Stone and Rune -----------------------------
        remakeEnd: {
          give: { flag: 'remakePaid', items: [{ item: 'coins', qty: 1000 }] },
          giveFail: 'remakeFull',
          set: { remakeQuest: 'done' },
          reward: { xp: { magic: 400, smithing: 200, runecrafting: 200 }, quest: 'Stone and Rune' },
          say: ['I heard it. The whole forest heard it. That roar came from the cave.', 'The stone is back, and the binding holds. But he was never that loud when he slept. He is half awake now, pushing at it.',
            'And the boulders at the cave mouth have shifted. Go and look, if you dare. There is a crack between them now.',
            'Forty years I hoped it would never come to this. The binding will not hold him for long. Sooner or later someone has to go down there and finish it.',
            'Take this. Old Watch pay, saved for a rainy day. I reckon the storm is coming. (The story continues in chapter 5, coming soon.)'],
        },
        remakeFull: { say: 'Make a bit of room in your bag first.' },
        remakeAfter: { say: ['He is stirring down there. I hear him at night now.'] },

        // ---- The Runebound, chapter 5: The Sealed Cave -----------------------------
        cave: {
          say: ['Now? Now somebody goes down there. I heard picks last night. Under my own floor. Clink, clink, clink, all night long.',
            "The goblins are digging. For him. The stone holds him asleep, but if they break the runes on his door, he won't need to wake up gently.",
            "Those boulders have cracked since the stone went back in. A good miner with a pickaxe could break them open. Then we'd see what's down there."],
          choices: [
            { text: "I'll open the cave.", next: 'caveStart', if: (c) => c.level('mining') >= 30 },
            { text: "I'll open the cave.", next: 'caveTooLow', if: (c) => c.level('mining') < 30 },
            { text: 'Not yet.', next: 'bye' },
          ],
        },
        caveTooLow: { say: (c) => [`Those boulders are big. You'll want Mining 30 to break them (you have ${c.level('mining')}). Dorrin's mine is good practice.`] },
        caveStart: {
          set: { caveQuest: 'started' },
          say: ['Good. The cave is just north of here, past my hut. Take a pickaxe, and plenty of food.',
            "Find out who is giving the orders down there, and stop them. And whatever you do, don't open that door."],
        },
        caveProgress: {
          say: (c) => (!c.flags.caveOpen ? ['The cave is just north of my hut. Break the boulders with a pickaxe.']
            : !c.flags.sawDoor ? ["You've opened it? Then go down. Find where they're digging."]
              : ['Chipping at the runes on his door? Then find whoever is in charge of that dig, and stop them.']),
        },
        caveEnd: {
          give: { flag: 'cavePaid', items: [{ item: 'coins', qty: 1500 }] },
          giveFail: 'remakeFull',
          take: [{ item: 'digmastersOrders', qty: 1 }],
          set: { caveQuest: 'done', gotOrders: true },
          reward: { xp: { attack: 600, strength: 600, defence: 600, mining: 300 }, quest: 'The Sealed Cave' },
          say: ['Let me see. ...My goblin is rusty. "Chief of Chiefs"... "Old One speaks in our dreams"...',
            '"When the door breaks, Grubnak walks again, and Brambleford burns like before."',
            "He's talking to them. In their sleep. That's how they knew to steal the stone. He can't get out, so he's getting them to dig him out.",
            "Stopping the Digmaster buys us time. Not much. They'll dig again, and the binding won't hold forever.",
            "There's only one way this ends. Someone goes through that door and finishes what Holt and I couldn't. Take this. You've earned every coin. (The story continues in chapter 6, coming soon.)"],
        },
        caveAfter: { say: ['They are digging again. Slower, without their Digmaster. But they are digging.'] },

        // ---- The Runebound, chapter 6 ----------------------------------------------
        final: {
          say: ['They are digging again. Slower, without their Digmaster. But they are digging, and he is waking.',
            "Holt and I couldn't kill him. But we were two tired soldiers with bent swords. You're something else.",
            "It's time to go through that door. Not break it. Open it, and face him while the chains still hold him.",
            "Aldric's lot made that door. Ask him for a way through. And bring food. Lots of food."],
          choices: [
            { text: "Let's finish it.", next: 'finalStart' },
            { text: 'Not yet.', next: 'bye' },
          ],
        },
        finalAfter: { say: ['Slept for a week, just like I said. Best sleep of my life.', 'I still walk up to the shrine every morning. Old habits. But now it\'s just a walk.'] },
        finalStart: {
          set: { finalQuest: 'started' },
          say: ['Good. Go and see Aldric in the Vale.', "I'll be at the door when you get there. Don't argue. I've waited forty years for this."],
        },
        finalHut: {
          say: (c) => (c.flags.grubnakDown ? (c.flags.tobinThanked ? ['Tell Maren. Then let an old man sleep.'] : ["You did it! But don't stand about here. Come back to the chamber. It isn't finished."])
            : c.flags.chamberOpen ? ['What are you doing back here? Grubnak is through that door!'] : ["Get Aldric's help with the door. I'll meet you there."]),
        },
      },
    },
  },

  {
    // Tobin again, waiting just inside Grubnak's chamber (The Runebound, chapter 6).
    examine: 'Old Tobin, in his faded Watch coat, with a bent old sword. His knuckles are white on the hilt.',
    id: 'tobinChamber', art: 'tobin', name: 'Tobin the Hermit', short: 'Tobin', area: 'chamber', x: 14, y: 24, radius: 0,
    look: { hair: '#d8d4cc', tunic: '#4a5a3a', pants: '#3a3a30', beard: '#e4e0d8', hat: 'hood', hatColor: '#3e3428' },
    talk: {
      start: (c) => (!c.flags.grubnakDown ? 'before' : !c.flags.runeSealed ? 'after' : !c.flags.tobinThanked ? 'thanks' : 'end'),
      nodes: {
        before: {
          say: ['There he is. Grubnak. Forty years, and he hasn\'t changed. Bigger, if anything.',
            "Listen. When he lifts both fists, the ground under you goes red. Get off it. Fast.",
            "When he roars, his goblins come running. Deal with them, or they'll wear you down.",
            'And the pillars: ten mind runes each, and the chain pulls him to his knees for a moment. Save them for when you need them.',
            "I'll hold the tunnel. Nothing gets past me. Go."],
        },
        after: {
          say: ['He\'s down. He\'s really down.', 'Forty years I watched that cave. I thought I\'d die watching it.',
            'But look at him. He\'s turned to stone, and those runes on his skin are still glowing. The binding isn\'t finished.',
            'Aldric told me once: when the binding has done its work, it wants a living hand to close it. Go on. Lay your hand on him.'],
        },
        thanks: {
          give: { flag: 'tobinGifts', items: [{ item: 'holtsSword', qty: 1 }, { item: 'runeboundCape', qty: 1 }] },
          giveFail: 'full',
          set: { tobinThanked: true },
          say: ['...It\'s over. It\'s really over.', '*Tobin sits down on a rock, very slowly, and is quiet for a long time.*',
            'Holt would have liked you. He always said it wouldn\'t be a soldier who finished this. Too tired. Too scared.',
            'This was his. His sword. I\'ve kept it sharp every week for forty years, waiting for someone worthy of it. Take it.',
            'And this. The runekeepers made one for Holt and one for me, back then. Blue as the runes. I never felt I\'d earned mine. You have.',
            'Go and tell Maren. Tell the whole village. And then, I think, I\'m going to sleep for a week.'],
        },
        full: { say: "I've something for you, but your hands are full. Make room in your bag for two things." },
        end: {
          say: (c) => (c.flags.finalQuest === 'done'
            ? ['Just looking at him. Making sure. Old habits.', "Go on. The world's bigger than this cave. Holt would want you to see it."]
            : ['Go on, tell Maren. I\'ll sit with him a while. Make sure.']),
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
          { text: 'Aldric needs a setting for a runestone.', next: 'setting', if: (c) => c.flags.remakeQuest === 'started' && !c.flags.stoneRemade && !c.have('runestoneSetting') },
          { text: 'Is there anything I can help with?', next: 'quest', if: (c) => !c.flags.forgeQuest },
          { text: 'About the great forge...', next: 'questProgress', if: (c) => c.flags.forgeQuest === 'started' },
          { text: "How's the great forge?", next: 'questDone', if: (c) => c.flags.forgeQuest === 'done' },
          { text: 'See you, Dorrin.', next: 'bye' },
        ] },

        // ---- The Runebound, chapter 4: the runestone setting -------------------------
        setting: {
          say: ['A setting for a runestone? For old Aldric? Ha! Course I can.', 'Steel band to hold it, silver inlay so the runes can flow through. Bring me two steel bars and a silver bar and I\'ll have it done before you can blink.'],
          choices: [
            { text: 'Here are the bars.', next: 'settingMake', if: (c) => c.count('steelBar') >= 2 && c.count('silverBar') >= 1 },
            { text: "I'll get them.", next: 'menu' },
          ],
        },
        settingMake: { set: { gotSetting: false }, say: [], next: 'settingGive' },
        settingGive: {
          give: { flag: 'gotSetting', items: [{ item: 'runestoneSetting', qty: 1 }] },
          giveFail: 'settingFull',
          take: [{ item: 'steelBar', qty: 2 }, { item: 'silverBar', qty: 1 }],
          takeFail: 'setting',
          reward: { xp: { smithing: 400 } },
          say: ['*clang* *clang* *hiss*', 'There you go. A runestone setting, fit for a king. Don\'t tell Aldric I enjoyed that.'],
          next: 'menu',
        },
        settingFull: { say: "No room in your bag for it! Clear a space and come back.", next: 'menu' },

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
          { text: 'What are those old standing stones?', next: 'lode', if: (c) => !c.flags.lodeQuest },
          { text: 'About the sleeping stones...', next: 'lodeProgress', if: (c) => c.flags.lodeQuest === 'started' },
          { text: 'I have pieces of a runestone.', next: 'stone', if: (c) => c.flags.stoneQuest === 'started' },
          { text: 'How is the runestone?', next: 'remake', if: (c) => c.flags.stoneQuest === 'done' && !c.flags.remakeQuest },
          { text: 'About remaking the stone...', next: 'remakeProgress', if: (c) => c.flags.remakeQuest === 'started' && !c.flags.stoneRemade },
          { text: 'I lost the Binding Stone.', next: 'remakeAgain', if: (c) => c.flags.stoneRemade && !c.flags.stonePlaced && !c.have('bindingStone') },
          { text: 'How is the Binding Stone?', next: 'remakeDone', if: (c) => c.flags.stonePlaced && !c.flags.finalQuest },
          { text: "We need to open Grubnak's door.", next: 'key', if: (c) => c.flags.finalQuest === 'started' && !c.flags.chamberOpen && !c.have('runeKey') },
          { text: 'Farewell, Aldric.', next: 'bye' },
        ] },

        // ---- Side quest: The Sleeping Stones (lodestones, data/lodestones.js) ----------
        lode: {
          say: ['The lodestones? Ah. My order raised them, long before I was born. One in every corner of the land.',
            'Touch one, and it would carry you to any other you had touched before. Merchants, healers, runekeepers: everyone used them.',
            'When Grubnak came, we put them to sleep, so his horde could not use them. And nobody ever woke them again.',
            'I could. With enough runes to give them a push, and a pair of hands to wake the one in Brambleford, where the network meets.'],
          choices: [
            { text: "I'll help you wake them.", next: 'lodeStart', if: (c) => c.level('runecrafting') >= 5 },
            { text: "I'll help you wake them.", next: 'lodeTooLow', if: (c) => c.level('runecrafting') < 5 },
            { text: 'Maybe later.', next: 'menu' },
          ],
        },
        lodeTooLow: { say: (c) => [`The stones only answer to someone who knows a little of runes. Come back with Runecrafting 5 (you have ${c.level('runecrafting')}).`], next: 'menu' },
        lodeStart: {
          set: { lodeQuest: 'started' },
          say: ['Wonderful. Bring me twenty air runes, to carry the call, and ten rune essence, to wake the stone here.', 'Air runes are made at the air altar, to the north-east of the camp.'],
          next: 'menu',
        },
        lodeProgress: {
          say: (c) => (c.flags.lodeVale
            ? ["Our stone is awake. Now go to Brambleford and lay your hand on the lodestone in the village square, north of the well. That will wake the rest."]
            : [`Twenty air runes and ten rune essence. You have ${c.count('airRune')} air runes and ${c.count('runeEssence')} essence.`]),
          choices: [
            { text: 'Here they are.', next: 'lodeHandIn', if: (c) => !c.flags.lodeVale && c.count('airRune') >= 20 && c.count('runeEssence') >= 10 },
            { text: 'Thanks.', next: 'menu' },
          ],
        },
        lodeHandIn: {
          take: [{ item: 'airRune', qty: 20 }, { item: 'runeEssence', qty: 10 }],
          takeFail: 'lodeProgress',
          set: { lodeVale: true },
          reward: { xp: { runecrafting: 100 } },
          say: ['Aldric walks to the old standing stone by the camp and presses the essence into the cracks round its rune. Then he throws the air runes up over it.',
            'They burst into a little whirlwind of light, and the rune drinks it in. The stone begins to glow.',
            "There. Ours is awake. But a lodestone alone is just a pretty rock. Go to Brambleford, to the stone in the village square, north of the well, and lay your hand on it. It will wake the others."],
          next: 'menu',
        },

        // ---- The Runebound, chapter 3: The Empty Hollow -----------------------------
        stone: {
          say: (c) => {
            const n = ['runestoneBase', 'runestoneCrown', 'runestoneHeart'].filter((id) => c.count(id) > 0).length;
            return n === 3 ? ['Pieces of a... let me see them.'] : [`A runestone, broken? Bring me every piece you can find. You have ${n} of 3.`];
          },
          choices: [
            { text: 'Here they are.', next: 'stoneHandIn', if: (c) => ['runestoneBase', 'runestoneCrown', 'runestoneHeart'].every((id) => c.count(id) > 0) },
            { text: "I'll find the rest.", next: 'menu' },
          ],
        },
        stoneHandIn: {
          give: { flag: 'stonePaid', items: [{ item: 'coins', qty: 800 }] },
          giveFail: 'stoneFull',
          take: [{ item: 'runestoneBase', qty: 1 }, { item: 'runestoneCrown', qty: 1 }, { item: 'runestoneHeart', qty: 1 }],
          takeFail: 'stone',
          set: { stoneQuest: 'done' },
          reward: { xp: { runecrafting: 300, attack: 400, strength: 400, defence: 400 }, quest: 'The Empty Hollow' },
          say: ['...', 'By the old winds. The Binding Stone. My master carved this, forty years ago, with three others of our order. I helped polish it. I was just a boy.',
            'And goblins have smashed it. The runes along the breaks are still alive, faintly. That is the only reason Grubnak still sleeps.',
            'I can remake it. But not with what I have here. It will need runes, a great deal of essence, and a setting of strong metal to hold the pieces together.',
            'Leave the pieces with me. Take this for your trouble. When I know exactly what I need, I will send word. (The story continues in chapter 4, coming soon.)'],
          next: 'menu',
        },
        stoneFull: { say: 'Your bag is full, friend. Make a little room first.', next: 'menu' },
        stoneDone: { say: ['The pieces sit in my workshop, humming.'], next: 'menu' },

        // ---- The Runebound, chapter 4: Stone and Rune -----------------------------
        remake: {
          say: ['I have worked it out. The pieces can be bound back together, but the binding must be fed.',
            'I need twenty rune essence to fill the cracks, thirty water runes to make it flow, and thirty mind runes to give it will.',
            "And a setting: a band of steel with a silver inlay, to hold the three pieces as one. I am no smith. But Dorrin the miner is the best there is."],
          choices: [
            { text: "I'll gather it all.", next: 'remakeStart', if: (c) => c.level('runecrafting') >= 10 && c.level('smithing') >= 30 },
            { text: "I'll gather it all.", next: 'remakeTooLow', if: (c) => !(c.level('runecrafting') >= 10 && c.level('smithing') >= 30) },
            { text: 'Not yet.', next: 'menu' },
          ],
        },
        remakeTooLow: { say: "Gladly, but this is skilled work. Come back with Runecrafting 10, to help me channel the runes, and Smithing 30, so you can make the steel Dorrin will need.", next: 'menu' },
        remakeStart: {
          set: { remakeQuest: 'started' },
          say: ['Good. Twenty essence, thirty water runes, thirty mind runes, and the setting from Dorrin.', 'The binding will not wait forever. Be quick, but be careful.'],
          next: 'menu',
        },
        remakeProgress: {
          say: (c) => [`I need 20 rune essence (you have ${c.count('runeEssence')}), 30 water runes (${c.count('waterRune')}), 30 mind runes (${c.count('mindRune')}), and Dorrin's setting (${c.count('runestoneSetting') ? 'yes' : 'not yet'}).`],
          choices: [
            { text: 'Here, everything.', next: 'remakeHandIn', if: (c) => [['runeEssence', 20], ['waterRune', 30], ['mindRune', 30], ['runestoneSetting', 1]].every(([id, n]) => c.count(id) >= n) },
            { text: 'Not yet.', next: 'menu' },
          ],
        },
        remakeHandIn: {
          give: { flag: 'gotBindingStone', items: [{ item: 'bindingStone', qty: 1 }] },
          giveFail: 'remakeFull',
          take: [{ item: 'runeEssence', qty: 20 }, { item: 'waterRune', qty: 30 }, { item: 'mindRune', qty: 30 }, { item: 'runestoneSetting', qty: 1 }],
          takeFail: 'remakeProgress',
          set: { stoneRemade: true },
          reward: { xp: { runecrafting: 300 } },
          say: ['Then let us begin. Hold the setting steady. Do not let go, whatever happens.',
            'Aldric lays the three pieces in the steel band and scatters the essence over them. The runes in your bag rise into the air, glowing, and pour into the cracks like water.',
            'The stone grows hot, then cold. The cracks close. With a sound like a bell, it is whole.',
            'The Binding Stone. Take it to the shrine and set it in the hollow. Quickly, now.'],
          next: 'menu',
        },
        remakeFull: { say: 'Make room in your bag first. You will need to carry the stone.', next: 'menu' },
        remakeAgain: { set: { gotBindingStone: false }, say: ['Lost it?! ...Very well. The pieces remember being whole. I can coax them together once more.'], next: 'remakeGive' },
        remakeGive: { give: { flag: 'gotBindingStone', items: [{ item: 'bindingStone', qty: 1 }] }, giveFail: 'remakeFull', say: ['There. Guard it with your life this time.'], next: 'menu' },
        // ---- The Runebound, chapter 6: the rune key ---------------------------------
        key: { set: { gotRuneKey: false }, say: [], next: 'keyGive' },
        keyGive: {
          give: { flag: 'gotRuneKey', items: [{ item: 'runeKey', qty: 1 }] },
          giveFail: 'remakeFull',
          say: ['So it has come to this. Forty years, and someone must finally face him.',
            'That door was made by my master. Break it, and the binding breaks with it. But it was made to be opened, once, by one of us.',
            'Take this rune key. It opens the door and leaves the chains whole. While they hold, he cannot reach his full strength.',
            'The pillars in his chamber hold the chains. Feed them mind runes, ten at a time, and they will pull tight. Use them when he is hurting you most.',
            'Go, and may the wind carry you.'],
          next: 'menu',
        },
        remakeDone: { say: ['I felt it from here when the stone went in. And I felt something else push back.', 'Talk to Tobin. He knows that cave better than anyone.'], next: 'menu' },
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
