// Place names shown on the map (the map button, top right). Everything else
// on the map — skilling spots, the bank and shop, villagers, monsters and the
// ways out — is found from the area data, so only names need adding here.
//
// Tiles are (x, y) in the area's own grid. Keep labels short.

// The outdoor maps, in the order of the map's tabs.
export const MAP_AREAS = ['brambleford', 'route1', 'mine', 'depths', 'vale'];

// Short names for the tabs and for "To ..." exit labels.
export const MAP_NAME = {
  brambleford: 'Brambleford',
  route1: 'Thornwood',
  mine: 'Copperdeep Mine',
  depths: 'Copperdeep Depths',
  vale: 'Whispering Vale',
};

// Even shorter names for the map's tabs.
export const MAP_TAB = { brambleford: 'Brambleford', route1: 'Thornwood', mine: 'Mine', depths: 'Depths', vale: 'Vale' };

// Rooms you walk into from another map. Inside them the map shows the
// outside, with you at the door.
export const INSIDE = { store: 'brambleford', bank: 'brambleford' };

export const LABELS = {
  brambleford: [
    { x: 22, y: 14, text: 'Village square' },
    { x: 16, y: 25, text: 'Your home' },
    { x: 7, y: 33, text: 'Fishing pond' },
    { x: 23, y: 34, text: "Wyn's farm" },
    { x: 50, y: 18, text: 'East End' },
    { x: 51, y: 31, text: 'Orchard' },
    { x: 51, y: 36, text: 'Cow field' },
    { x: 40, y: 49, text: 'River' },
  ],
  route1: [
    { x: 59, y: 45, text: 'Crossroads' },
    { x: 20, y: 38, text: 'Goblin camp' },
    { x: 88, y: 18, text: 'Wolf hills' },
    { x: 96, y: 3, text: "Alpha's den" },
    { x: 82, y: 56, text: 'Oak grove' },
    { x: 64, y: 70, text: "Bram's cabin" },
    { x: 14, y: 90, text: 'Lake' },
    { x: 28, y: 76, text: "Hunters' camp" },
    { x: 44, y: 25, text: 'Old watchtower' },
    { x: 34, y: 87, text: 'Old graveyard' },
    { x: 15, y: 21, text: "Hermit's hut" },
    { x: 93, y: 76, text: 'Old farmstead' },
    { x: 100, y: 37, text: 'Stone shrine' },
    { x: 76, y: 88, text: 'Fairy ring' },
    { x: 7, y: 5, text: 'Sealed cave' },
  ],
  mine: [
    { x: 7, y: 5, text: 'Copper and tin' },
    { x: 25, y: 3, text: 'Iron' },
    { x: 12, y: 17, text: 'Furnace and anvil' },
  ],
  depths: [
    { x: 8, y: 7, text: 'West coal' },
    { x: 20, y: 1, text: 'North coal' },
    { x: 32, y: 7, text: 'East coal' },
    { x: 20, y: 22, text: 'Landing' },
  ],
  vale: [
    { x: 9, y: 2, text: 'Essence quarry' },
    { x: 28, y: 21, text: "Runekeepers' camp" },
    { x: 64, y: 6, text: 'Air altar' },
    { x: 64, y: 47, text: 'Mind altar' },
    { x: 15, y: 44, text: 'Water altar' },
  ],
};
