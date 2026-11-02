// Shops. Each item has a normal stock level: buying lowers the stock (and
// raises the price a little), selling raises it (and lowers what Pell pays).
// Stock drifts back to normal over time.

export const SHOPS = {
  generalStore: {
    name: "Pell's General Store",
    stock: [
      { id: 'bread', base: 20 },
      { id: 'meatPie', base: 10 },
      { id: 'cookedTrout', base: 10 },
      { id: 'attackPotion4', base: 4 },
      { id: 'strengthPotion4', base: 4 },
      { id: 'defencePotion4', base: 4 },
      { id: 'bronzeDagger', base: 5 },
      { id: 'bronzeSword', base: 4 },
      { id: 'woodenShield', base: 4 },
      { id: 'bronzeMedHelm', base: 3 },
      { id: 'leatherBody', base: 3 },
      { id: 'leatherGloves', base: 5 },
      { id: 'leatherBoots', base: 5 },
      { id: 'shortbow', base: 2 },
      { id: 'bronzeArrow', base: 500 },
      { id: 'apprenticeStaff', base: 2 },
      { id: 'airRune', base: 300 },
      { id: 'mindRune', base: 300 },
      { id: 'waterRune', base: 200 },
      { id: 'bronzeAxe', base: 5 },
      { id: 'ironAxe', base: 2 },
      { id: 'knife', base: 5 },
      { id: 'bronzePickaxe', base: 5 },
      { id: 'ironPickaxe', base: 2 },
      { id: 'hammer', base: 5 },
      { id: 'smallNet', base: 5 },
      { id: 'fishingRod', base: 5 },
      { id: 'flyFishingRod', base: 3 },
      { id: 'fishingBait', base: 500 },
      { id: 'feather', base: 500 },
      { id: 'bronzeArrowtips', base: 300 },
    ],
  },
};
