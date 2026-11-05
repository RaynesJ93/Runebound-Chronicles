// Bank tabs: every item goes into one tab by what it is, automatically, so
// there's nothing to set up. "All" shows everything. Icons are item ids.

import { ITEMS } from './items.js';

export const BANK_TABS = [
  { id: 'all', name: 'All', icon: 'bag' },
  { id: 'weapons', name: 'Weapons', icon: 'ironSword' },
  { id: 'armour', name: 'Armour', icon: 'ironPlatebody' },
  { id: 'ammo', name: 'Ammo & runes', icon: 'ironArrow' },
  { id: 'tools', name: 'Tools', icon: 'ironPickaxe' },
  { id: 'ores', name: 'Ores & bars', icon: 'ironBar' },
  { id: 'materials', name: 'Materials', icon: 'logs' },
  { id: 'food', name: 'Food & potions', icon: 'shrimps' },
  { id: 'jewellery', name: 'Jewellery & gems', icon: 'goldSapphireRing' },
];

// Things that aren't weapons or armour but live with the tools.
const TOOLS = new Set(['hammer', 'knife', 'chisel', 'needle', 'thread', 'ringMould', 'amuletMould', 'smallNet', 'fishingRod', 'flyFishingRod', 'fishingBait']);
const GEMS = new Set(['sapphire', 'emerald', 'ruby', 'diamond', 'gemBag']);

export function tabOf(id) {
  const def = ITEMS[id];
  if (!def) return 'materials';
  const e = def.equip;
  if (/[a-z]Rune$/.test(id)) return 'ammo'; // air rune, mind rune... (not rune bars or rune gear)
  if (e?.slot === 'ammo' || e?.thrown || /(Arrowtips|DartTip|JavelinHeads)$/.test(id) || id === 'headlessArrow' || id === 'arrowShaft') return 'ammo';
  if (def.tool || TOOLS.has(id)) return 'tools';
  if (e?.slot === 'neck' || e?.slot === 'ring' || /^uncut[A-Z]/.test(id) || GEMS.has(id)) return 'jewellery';
  if (e?.slot === 'weapon') return 'weapons';
  if (e) return 'armour';
  if (def.food || def.potion || /^(raw|burnt)[A-Z]/.test(id)) return 'food';
  if (/(Ore|Bar)$/.test(id) || id === 'coal' || id === 'runeEssence' || id === 'stardust' || id === 'coalBag' || id === 'emberCore') return 'ores';
  return 'materials';
}
