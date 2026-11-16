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
  // v0.51.0 (skill review batch 2). Earth, fire and body are out in the world;
  // cosmic and up are in Lumenhaven, the hidden fae city.
  earth: { name: 'Earth altar', rune: 'earthRune', level: 9, xp: 6.5, multi: [26, 52, 78],
    colour: ['#e8f0b0', '#8ac04a', '#5a3a1a'], examine: 'An altar of packed earth and roots. Pebbles roll uphill towards it.' },
  fire: { name: 'Fire altar', rune: 'fireRune', level: 14, xp: 7, multi: [35, 70],
    colour: ['#fff0a0', '#ff9a3a', '#c8301a'], examine: 'An altar of black stone. Flames dance on it without fuel.' },
  body: { name: 'Body altar', rune: 'bodyRune', level: 20, xp: 7.5, multi: [46, 92],
    colour: ['#f0e8f8', '#a890d0', '#4a3a7a'], examine: 'A pale altar shaped like a sleeping figure. You can almost hear a heartbeat.' },
  cosmic: { name: 'Cosmic altar', rune: 'cosmicRune', level: 27, xp: 8, multi: [59],
    colour: ['#fff8c0', '#e0c050', '#5a4a8a'], examine: 'An altar of starlight on a tiny island. The night sky turns slowly above it.' },
  chaos: { name: 'Chaos altar', rune: 'chaosRune', level: 35, xp: 8.5, multi: [74],
    colour: ['#ffe0a0', '#e85a2a', '#5a1a1a'], examine: 'A cracked altar in a broken temple. It never looks the same twice.' },
  nature: { name: 'Nature altar', rune: 'natureRune', level: 44, xp: 9, multi: [91],
    colour: ['#e8ffd0', '#5ad05a', '#1a5a2a'], examine: 'An altar grown from the roots of a great tree. Flowers bloom and fade on it.' },
  law: { name: 'Law altar', rune: 'lawRune', level: 54, xp: 9.5, multi: [],
    colour: ['#ffffff', '#a8c8ff', '#2a4a9a'], examine: 'A perfect altar of clear crystal. Everything around it is very still.' },
  death: { name: 'Death altar', rune: 'deathRune', level: 65, xp: 10, multi: [],
    colour: ['#e0e0e8', '#6a6a7a', '#141418'], examine: 'A black altar in a hollow where no light reaches. It is very cold.' },
};

export const runesPerEssence = (altar, level) => 1 + altar.multi.filter((l) => level >= l).length;
