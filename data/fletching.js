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
  // v0.50.0: willow, maple, yew, magic and elder (shafts, shortbow, longbow)
  ...[['willow', 'Willow', 30, 45, 66, 83], ['maple', 'Maple', 45, 60, 100, 116], ['yew', 'Yew', 60, 75, 135, 150], ['magic', 'Magic', 75, 90, 166, 183], ['elder', 'Elder', 90, 105, 200, 220]]
    .flatMap(([id, Name, lv, shafts, sxp, lxp]) => {
      const logs = `${id}Logs`;
      const bowLv = id === 'elder' ? [92, 95] : [lv + 5, lv + 10];
      return [
        { id: `${id}Shafts`, name: 'Arrow shafts', level: lv, xp: Math.round(lv / 3), uses: { [logs]: 1 }, gives: { arrowShaft: shafts }, tool: 'knife', ticks: 3, group: logs },
        { id: `${id}Shortbow`, name: `${Name} shortbow`, level: bowLv[0], xp: sxp, uses: { [logs]: 1 }, gives: { [`${id}Shortbow`]: 1 }, tool: 'knife', ticks: 3, group: logs },
        { id: `${id}Longbow`, name: `${Name} longbow`, level: bowLv[1], xp: lxp, uses: { [logs]: 1 }, gives: { [`${id}Longbow`]: 1 }, tool: 'knife', ticks: 3, group: logs },
      ];
    }),
  { id: 'headless', name: 'Headless arrows', level: 1, xp: 1, uses: { arrowShaft: 1, feather: 1 }, gives: { headlessArrow: 1 }, batch: 15, ticks: 2, group: 'arrows' },
  { id: 'bronzeArrows', name: 'Bronze arrows', level: 1, xp: 1.3, uses: { headlessArrow: 1, bronzeArrowtips: 1 }, gives: { bronzeArrow: 1 }, batch: 15, ticks: 2, group: 'arrows' },
  { id: 'ironArrows', name: 'Iron arrows', level: 15, xp: 2.5, uses: { headlessArrow: 1, ironArrowtips: 1 }, gives: { ironArrow: 1 }, batch: 15, ticks: 2, group: 'arrows' },
  { id: 'steelArrows', name: 'Steel arrows', level: 30, xp: 5, uses: { headlessArrow: 1, steelArrowtips: 1 }, gives: { steelArrow: 1 }, batch: 15, ticks: 2, group: 'arrows' },
  { id: 'mithrilArrows', name: 'Mithril arrows', level: 45, xp: 7.5, uses: { headlessArrow: 1, mithrilArrowtips: 1 }, gives: { mithrilArrow: 1 }, batch: 15, ticks: 2, group: 'arrows' },
  { id: 'bronzeDarts', name: 'Bronze darts', level: 10, xp: 1.8, uses: { bronzeDartTip: 1, feather: 1 }, gives: { bronzeDart: 1 }, batch: 10, ticks: 2, group: 'thrown' },
  { id: 'bronzeJavelins', name: 'Bronze javelins', level: 3, xp: 1, uses: { bronzeJavelinHeads: 1, arrowShaft: 1 }, gives: { bronzeJavelin: 1 }, batch: 5, ticks: 2, group: 'thrown' },
  { id: 'ironDarts', name: 'Iron darts', level: 22, xp: 3.8, uses: { ironDartTip: 1, feather: 1 }, gives: { ironDart: 1 }, batch: 10, ticks: 2, group: 'thrown' },
  { id: 'ironJavelins', name: 'Iron javelins', level: 17, xp: 2, uses: { ironJavelinHeads: 1, arrowShaft: 1 }, gives: { ironJavelin: 1 }, batch: 5, ticks: 2, group: 'thrown' },
  { id: 'steelDarts', name: 'Steel darts', level: 37, xp: 7.5, uses: { steelDartTip: 1, feather: 1 }, gives: { steelDart: 1 }, batch: 10, ticks: 2, group: 'thrown' },
  { id: 'steelJavelins', name: 'Steel javelins', level: 32, xp: 5, uses: { steelJavelinHeads: 1, arrowShaft: 1 }, gives: { steelJavelin: 1 }, batch: 5, ticks: 2, group: 'thrown' },
  { id: 'mithrilDarts', name: 'Mithril darts', level: 52, xp: 11.2, uses: { mithrilDartTip: 1, feather: 1 }, gives: { mithrilDart: 1 }, batch: 10, ticks: 2, group: 'thrown' },
  { id: 'mithrilJavelins', name: 'Mithril javelins', level: 47, xp: 8, uses: { mithrilJavelinHeads: 1, arrowShaft: 1 }, gives: { mithrilJavelin: 1 }, batch: 5, ticks: 2, group: 'thrown' },
  { id: 'adamantArrows', name: 'Adamant arrows', level: 60, xp: 10, uses: { headlessArrow: 1, adamantArrowtips: 1 }, gives: { adamantArrow: 1 }, batch: 15, ticks: 2, group: 'arrows' },
  { id: 'adamantDarts', name: 'Adamant darts', level: 67, xp: 15, uses: { adamantDartTip: 1, feather: 1 }, gives: { adamantDart: 1 }, batch: 10, ticks: 2, group: 'thrown' },
  { id: 'adamantJavelins', name: 'Adamant javelins', level: 62, xp: 10, uses: { adamantJavelinHeads: 1, arrowShaft: 1 }, gives: { adamantJavelin: 1 }, batch: 5, ticks: 2, group: 'thrown' },
  { id: 'runeArrows', name: 'Rune arrows', level: 75, xp: 12.5, uses: { headlessArrow: 1, runeArrowtips: 1 }, gives: { runeArrow: 1 }, batch: 15, ticks: 2, group: 'arrows' },
  { id: 'runeDarts', name: 'Rune darts', level: 81, xp: 18.8, uses: { runeDartTip: 1, feather: 1 }, gives: { runeDart: 1 }, batch: 10, ticks: 2, group: 'thrown' },
  { id: 'runeJavelins', name: 'Rune javelins', level: 77, xp: 12.4, uses: { runeJavelinHeads: 1, arrowShaft: 1 }, gives: { runeJavelin: 1 }, batch: 5, ticks: 2, group: 'thrown' },
  // v0.61.0: carving bones (Crafting, with a knife), then finishing the arrows and darts (Fletching)
  ...[['bones', 'bone', 'Bone', 5, 10, 5, 1.8, 12, 2.5], ['bigBones', 'bigBone', 'Big bone', 25, 25, 33, 5.5, 40, 8],
    ['cursedBones', 'cursedBone', 'Cursed bone', 45, 45, 50, 8.5, 55, 12], ['wyrmBones', 'wyrmBone', 'Wyrm bone', 65, 80, 68, 11, 70, 16]]
    .flatMap(([bone, pre, Name, lv, xp, arLv, arXp, dLv, dXp]) => [
      { id: `${pre}Tips`, name: `${Name} arrowtips`, level: lv, xp, uses: { [bone]: 1 }, gives: { [`${pre}Arrowtips`]: 8 }, tool: 'knife', ticks: 3, group: bone, skill: 'crafting' },
      { id: `${pre}DartTips`, name: `${Name} dart tips`, level: lv, xp, uses: { [bone]: 1 }, gives: { [`${pre}DartTip`]: 6 }, tool: 'knife', ticks: 3, group: bone, skill: 'crafting' },
      { id: `${pre}Arrows`, name: `${Name} arrows`, level: arLv, xp: arXp, uses: { headlessArrow: 1, [`${pre}Arrowtips`]: 1 }, gives: { [`${pre}Arrow`]: 1 }, batch: 15, ticks: 2, group: 'arrows' },
      { id: `${pre}Darts`, name: `${Name} darts`, level: dLv, xp: dXp, uses: { [`${pre}DartTip`]: 1, feather: 1 }, gives: { [`${pre}Dart`]: 1 }, batch: 10, ticks: 2, group: 'thrown' },
    ]),
];

// Which recipe group an item belongs to when you tap it.
export const GROUP_OF = {
  logs: 'logs', oakLogs: 'oakLogs', willowLogs: 'willowLogs', mapleLogs: 'mapleLogs', yewLogs: 'yewLogs', magicLogs: 'magicLogs', elderLogs: 'elderLogs',
  arrowShaft: 'arrows', feather: 'arrows', headlessArrow: 'arrows', bronzeArrowtips: 'arrows', ironArrowtips: 'arrows', steelArrowtips: 'arrows', mithrilArrowtips: 'arrows',
  adamantArrowtips: 'arrows', runeArrowtips: 'arrows', adamantDartTip: 'thrown', adamantJavelinHeads: 'thrown', runeDartTip: 'thrown', runeJavelinHeads: 'thrown',
  bronzeDartTip: 'thrown', bronzeJavelinHeads: 'thrown', ironDartTip: 'thrown', ironJavelinHeads: 'thrown', steelDartTip: 'thrown', steelJavelinHeads: 'thrown', mithrilDartTip: 'thrown', mithrilJavelinHeads: 'thrown',
  bones: 'bones', bigBones: 'bigBones', cursedBones: 'cursedBones', wyrmBones: 'wyrmBones',
  boneArrowtips: 'arrows', bigBoneArrowtips: 'arrows', cursedBoneArrowtips: 'arrows', wyrmBoneArrowtips: 'arrows',
  boneDartTip: 'thrown', bigBoneDartTip: 'thrown', cursedBoneDartTip: 'thrown', wyrmBoneDartTip: 'thrown',
};
export const BONES = ['bones', 'bigBones', 'cursedBones', 'wyrmBones'];
