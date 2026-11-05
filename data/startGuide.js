// The Guide (button at the top left): where new players get their first tools,
// where to train, where to fight and where to bank. Plain data, so it's easy to
// keep up to date. icon: an item id or a skill id. map: an area id; tapping the
// row opens the map there.

export const GUIDE = [
  {
    title: 'How to play',
    rows: [
      { icon: 'bag', name: 'Tap to move, tap to do', sub: 'Tap the ground to walk there. Tap people to talk, monsters to fight, and trees, rocks or fishing spots to use them. Hold your finger on anything for more options.' },
      { icon: 'coins', name: 'Your bag, map and skills', sub: 'The buttons at the top right: your bag and gear, the map (where you are and where everything is), and your skills. Tap a skill to see everything it unlocks.' },
      { icon: 'leatherBoots', name: 'Talk to everyone', sub: 'Most people in Brambleford and beyond will teach you a skill and give you the tools for it, for free.' },
    ],
  },
  {
    title: 'Free starter tools',
    rows: [
      { icon: 'bronzePickaxe', name: 'Pickaxe and hammer: Dorrin the Miner', sub: 'Copperdeep Mine, at the top of Thornwood\'s north-west road. Ask "Can you teach me to mine?"', map: 'mine' },
      { icon: 'bronzeAxe', name: 'Axe and knife: Bram the Woodcutter', sub: 'Bram\'s cabin, on Thornwood\'s south road. Ask "Can you teach me to chop trees?"', map: 'route1' },
      { icon: 'shortbow', name: 'Shortbow and 50 arrows: Bram', sub: 'Ask Bram "Do you have a bow I could use?"', map: 'route1' },
      { icon: 'apprenticeStaff', name: 'Staff and runes: Wren the Traveller', sub: 'On the mine road, in the north-west of Thornwood. Ask about her staff.', map: 'route1' },
      { icon: 'smallNet', name: 'Net, rod and bait: Old Finn', sub: 'By the fishing pond in Brambleford. Ask "Can you teach me to fish?"', map: 'brambleford' },
      { icon: 'needle', name: 'Needle and thread: Hilda the Tanner', sub: 'By the cow field in Brambleford. Ask "Can you teach me to craft?"', map: 'brambleford' },
      { icon: 'bread', name: 'Everything else: Pell\'s General Store', sub: 'On Brambleford\'s square. Food, potions, tools, basic weapons and armour, arrows and runes. Pell buys almost anything too.', map: 'brambleford' },
    ],
  },
  {
    title: 'Where to train',
    rows: [
      { icon: 'woodcutting', name: 'Woodcutting', sub: 'Pine trees in Brambleford\'s orchard and all over Thornwood; oaks from level 15 (the orchard and Thornwood\'s oak grove).', map: 'brambleford' },
      { icon: 'mining', name: 'Mining', sub: 'Copperdeep Mine: copper and tin, iron at 15. Deeper down: the Depths (silver 20, coal 30, gold 40), the Hollow (mithril 55) and the Sunken Forge (adamantite 70, runite 85).', map: 'mine' },
      { icon: 'smithing', name: 'Smithing', sub: 'The furnace and anvil in Copperdeep Mine\'s entrance hall. You need a hammer for the anvil.', map: 'mine' },
      { icon: 'fishing', name: 'Fishing', sub: 'Brambleford\'s pond and river, and Thornwood\'s stream and lake. Net, bait and lure spots catch different fish.', map: 'brambleford' },
      { icon: 'cooking', name: 'Cooking', sub: 'The cooking pit by Brambleford\'s pond, or the campfires in Thornwood. Food burns less as you level.', map: 'brambleford' },
      { icon: 'fletching', name: 'Fletching', sub: 'Anywhere: tap some logs with a knife in your bag. Arrow shafts first, then bows.' },
      { icon: 'crafting', name: 'Crafting', sub: 'Kill cows for hides, tan them at Hilda\'s rack, then tap the leather with a needle and thread.', map: 'brambleford' },
      { icon: 'runecrafting', name: 'Runecrafting', sub: 'Whispering Vale, east of Thornwood\'s oak grove: mine essence in the quarry, then take it to an altar. Aldric explains.', map: 'vale' },
    ],
  },
  {
    title: 'Where to fight',
    rows: [
      { icon: 'attack', name: 'Chickens and cows (levels 1–2)', sub: 'Brambleford\'s farm and cow field. Safe, easy, and cows drop hides for Crafting.', map: 'brambleford' },
      { icon: 'strength', name: 'Goblins (levels 2–5)', sub: 'The goblin camp in Thornwood\'s west. The brutes hit a little harder.', map: 'route1' },
      { icon: 'defence', name: 'Tunnel goblins and wolves (levels 4–14)', sub: 'Tunnel goblins in Copperdeep Mine\'s iron gallery; wolves (and the Alpha Wolf) in Thornwood\'s wolf hills. Wolves attack on sight.', map: 'route1' },
      { icon: 'hitpoints', name: 'Deeper down (levels 20–70)', sub: 'Cave beasts in the Depths, night stalkers in the Hollow, forge golems and the Molten beast in the Sunken Forge. Bring food!', map: 'depths' },
    ],
  },
  {
    title: 'Banking and more',
    rows: [
      { icon: 'coins', name: 'Banks', sub: 'The Bank of Brambleford on the square, plus supply chests (they open the same bank) in Copperdeep Mine, Whispering Vale and the Sunken Forge.', map: 'brambleford' },
      { icon: 'stardust', name: 'Shooting stars', sub: 'Every so often a star crashes somewhere: mine it for stardust and trade it with Lyra the Stargazer by the square.', map: 'brambleford' },
      { icon: 'goblinToken', name: 'The story: The Runebound', sub: "Ask Pell in the General Store why he looks worried. It's the start of the main story, and good for combat level 5 and up.", map: 'brambleford' },
      { icon: 'emberCore', name: 'Quests', sub: 'Tap the Quests button (under this Guide) to see every quest, what it needs, and what to do next. It glows when there\'s a new one you can start.' },
    ],
  },
];
