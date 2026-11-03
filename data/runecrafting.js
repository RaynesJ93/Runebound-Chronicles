// Runecrafting altars. Tap one with rune essence in your bag and every piece
// of essence becomes a rune at once. At each level in `multi` you get one more
// rune per essence (2 at the first, 3 at the second, and so on).

export const ALTARS = {
  air: { name: 'Air altar', rune: 'airRune', level: 1, xp: 5, multi: [11, 22, 33, 44, 55, 66, 77, 88, 99],
    colour: ['#ffffff', '#cfe8ff', '#9ec8f0'], examine: 'A pale stone altar. The wind never stops swirling around it.' },
  mind: { name: 'Mind altar', rune: 'mindRune', level: 2, xp: 5.5, multi: [14, 28, 42, 56, 70, 84, 98],
    colour: ['#ffe08a', '#ff9a3a', '#c8501e'], examine: 'A dark altar in a ring of standing stones. A glowing eye seems to watch you.' },
  water: { name: 'Water altar', rune: 'waterRune', level: 5, xp: 6, multi: [19, 38, 57, 76, 95],
    colour: ['#e8f8ff', '#8fd0ff', '#2f6fd0'], examine: 'A blue stone fountain. The water flows upwards as often as down.' },
};

export const runesPerEssence = (altar, level) => 1 + altar.multi.filter((l) => level >= l).length;
