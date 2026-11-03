// Fletching recipes.
//
// uses:  items used up for one make
// gives: items made by one make
// tool:  needed in your bag, not used up
// batch: arrow steps join up to this many at once (limited by what you have);
//        xp is then per item
// ticks: how long one make takes (1 tick = 0.6 s)
// group: which item opens this recipe's menu when you tap it

export const RECIPES = [
  { id: 'shafts', name: 'Arrow shafts', level: 1, xp: 5, uses: { logs: 1 }, gives: { arrowShaft: 15 }, tool: 'knife', ticks: 3, group: 'logs' },
  { id: 'shortbow', name: 'Shortbow', level: 5, xp: 10, uses: { logs: 1 }, gives: { shortbow: 1 }, tool: 'knife', ticks: 3, group: 'logs' },
  { id: 'longbow', name: 'Longbow', level: 10, xp: 20, uses: { logs: 1 }, gives: { longbow: 1 }, tool: 'knife', ticks: 3, group: 'logs' },
  { id: 'oakShafts', name: 'Arrow shafts', level: 15, xp: 10, uses: { oakLogs: 1 }, gives: { arrowShaft: 30 }, tool: 'knife', ticks: 3, group: 'oakLogs' },
  { id: 'oakShortbow', name: 'Oak shortbow', level: 20, xp: 33, uses: { oakLogs: 1 }, gives: { oakShortbow: 1 }, tool: 'knife', ticks: 3, group: 'oakLogs' },
  { id: 'oakLongbow', name: 'Oak longbow', level: 25, xp: 50, uses: { oakLogs: 1 }, gives: { oakLongbow: 1 }, tool: 'knife', ticks: 3, group: 'oakLogs' },
  { id: 'headless', name: 'Headless arrows', level: 1, xp: 1, uses: { arrowShaft: 1, feather: 1 }, gives: { headlessArrow: 1 }, batch: 15, ticks: 2, group: 'arrows' },
  { id: 'bronzeArrows', name: 'Bronze arrows', level: 1, xp: 1.3, uses: { headlessArrow: 1, bronzeArrowtips: 1 }, gives: { bronzeArrow: 1 }, batch: 15, ticks: 2, group: 'arrows' },
  { id: 'ironArrows', name: 'Iron arrows', level: 15, xp: 2.5, uses: { headlessArrow: 1, ironArrowtips: 1 }, gives: { ironArrow: 1 }, batch: 15, ticks: 2, group: 'arrows' },
  { id: 'steelArrows', name: 'Steel arrows', level: 30, xp: 5, uses: { headlessArrow: 1, steelArrowtips: 1 }, gives: { steelArrow: 1 }, batch: 15, ticks: 2, group: 'arrows' },
  { id: 'mithrilArrows', name: 'Mithril arrows', level: 45, xp: 7.5, uses: { headlessArrow: 1, mithrilArrowtips: 1 }, gives: { mithrilArrow: 1 }, batch: 15, ticks: 2, group: 'arrows' },
];

// Which recipe group an item belongs to when you tap it.
export const GROUP_OF = {
  logs: 'logs', oakLogs: 'oakLogs',
  arrowShaft: 'arrows', feather: 'arrows', headlessArrow: 'arrows', bronzeArrowtips: 'arrows', ironArrowtips: 'arrows', steelArrowtips: 'arrows', mithrilArrowtips: 'arrows',
};
