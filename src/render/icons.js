import { Bitmap, hex, OUTLINE } from './pixel.js';

// 16 x 16 pixel icons for skills and attack styles, drawn from little text
// pictures. Each letter is a colour; '.' is transparent.

const PAL = {
  o: OUTLINE,
  w: hex('#d8dde2'), W: hex('#f4f2e6'), g: hex('#9aa3ab'),
  y: hex('#e8c040'), Y: hex('#b8901f'),
  b: hex('#8a5a32'), B: hex('#3f5fb0'), L: hex('#6f8fe0'),
  s: hex('#f2c393'), S: hex('#d99c6c'), a: hex('#b0302a'),
  r: hex('#d63a2a'), R: hex('#9a2018'), p: hex('#f7a3a0'),
  n: hex('#5d3a1e'),
};

const ART = {
  attack: [
    '..............oo',
    '.............owo',
    '............owWo',
    '...........owWo.',
    '..........owWo..',
    '.........owWo...',
    '........owWo....',
    '...oo..owWo.....',
    '...oyo.owo......',
    '....oyowo.......',
    '.....oyyo.......',
    '....obooyo......',
    '...obbo.oyo.....',
    '..obbo...oo.....',
    '..obo...........',
    '...o............',
  ],
  strength: [
    '................',
    '.....oooooo.....',
    '....ossssssoo...',
    '...osSsSsSssso..',
    '...osssssssssSo.',
    '...oSsSsSsSssSo.',
    '...osssssssssSo.',
    '....osssssssSo..',
    '....osssssssSo..',
    '.....osssssSo...',
    '.....osssssSo...',
    '......oaaaao....',
    '......oaaaRo....',
    '......oaaaRo....',
    '.......oooo.....',
    '................',
  ],
  defence: [
    '................',
    '...oooooooooo...',
    '..owwwwwwwwwwo..',
    '..owBBBBBBBBgo..',
    '..owBLBBBBBBgo..',
    '..owBBByyBBBgo..',
    '..owBByyyyBBgo..',
    '..owBBByyBBBgo..',
    '..owBBBBBBBBgo..',
    '...owBBBBBBgo...',
    '...owBBBBBBgo...',
    '....owBBBBgo....',
    '.....owBBgo.....',
    '......owgo......',
    '.......oo.......',
    '................',
  ],
  hitpoints: [
    '................',
    '................',
    '..oooo....oooo..',
    '.orrrro..orrrro.',
    'orrpprroorrrrrro',
    'orpprrrrrrrrrrro',
    'orprrrrrrrrrrrro',
    'orrrrrrrrrrrrRro',
    '.orrrrrrrrrrRro.',
    '..orrrrrrrrRRo..',
    '...orrrrrrRRo...',
    '....orrrrRRo....',
    '.....orrRRo.....',
    '......orRo......',
    '.......oo.......',
    '................',
  ],
  ranged: [
    '................',
    '.....oo.........',
    '....obbo......o.',
    '...obo.o.....owo',
    '...obo..o...owo.',
    '..obo....o.owo..',
    '..obo....oWo....',
    '..obo...oWo.....',
    '..obo..oWo......',
    '..obo.oWo.o.....',
    '..obooWo..o.....',
    '...oboo..o......',
    '...obo..o.......',
    '....obbo........',
    '.....oo.........',
    '................',
  ],
  magic: [
    '.........oo.....',
    '........oBBo....',
    '.......oBBBo....',
    '.......oBLBo....',
    '......oBBBBBo...',
    '......oBByBBo...',
    '.....oBByyyBBo..',
    '.....oBBByBBBo..',
    '....oBBBBBBBBBo.',
    '...oBLBBBBBBBBo.',
    '..ooBBBBBBBBBBoo',
    '.oBBBBBBBBBBBBBo',
    '.oLBBBBBBBBBBBBo',
    '..oooooooooooooo',
    '................',
    '................',
  ],
  woodcutting: [
    '................',
    '............oo..',
    '...........onbo.',
    '..........onbo..',
    '.........onbo...',
    '........onbggoo.',
    '.......onbgggwWo',
    '......onboggwWo.',
    '.....onbo.owWo..',
    '....onbo..oWo...',
    '...onbo....o....',
    '..onbo..........',
    '.onbo...........',
    'onbo............',
    'obo.............',
    '.o..............',
  ],
  fletching: [
    '..........ooo...',
    '.........owwo...',
    '........owgwo...',
    '.......obooo....',
    '......obo.......',
    '.....obo........',
    '....obo.........',
    '.oooobo.........',
    'oarabo..........',
    'oaroo...........',
    '.oaro...........',
    'oaro............',
    'oao.............',
    'oo..............',
    '................',
    '................',
  ],
  mining: [
    '......owwo......',
    '......oggwo.....',
    '.......oogwo....',
    '.........ogwo...',
    '..........ogwo..',
    '..........obgo..',
    '.........oboowo.',
    '........obonogwo',
    '.......obono.ogo',
    '......obono...oW',
    '.....obono....ow',
    '....obono......o',
    '...obono........',
    '..obono.........',
    '.obono..........',
    '..ono...........',
  ],
  smithing: [
    '......owo.......',
    '.....oWowo....o.',
    '......oWowo..obo',
    '.......oWowoobo.',
    '........oWowbo..',
    '.........oWbo...',
    '.........obo....',
    '........obo.....',
    'oooooooooooooo..',
    'wwwwwwwwwwwwwwo.',
    'ogggggggggggggo.',
    '.ooooogggggooo..',
    '....oogggggoo...',
    '...ogggggggggo..',
    '...onnnnnnnnno..',
    '....ooooooooo...',
  ],
};
ART.controlled = ART.attack;
ART.accurate = ART.attack;
ART.aggressive = ART.strength;
ART.defensive = ART.defence;
ART.combat = ART.attack;
ART.rapid = ART.ranged;
ART.longrange = ART.ranged;
ART.windStrike = ART.magic;
ART.waterStrike = ART.magic;

const cache = new Map();

// A data: URL for an <img>, drawn once and remembered.
export function iconUrl(name) {
  if (cache.has(name)) return cache.get(name);
  const rows = ART[name] || ART.attack;
  const b = new Bitmap(16, 16);
  rows.forEach((row, y) => {
    for (let x = 0; x < 16; x++) {
      const c = PAL[row[x]];
      if (c) b.set(x, y, c);
    }
  });
  const url = b.toCanvas().toDataURL('image/png');
  cache.set(name, url);
  return url;
}
