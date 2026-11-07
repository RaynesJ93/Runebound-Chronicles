// Every area in the world, by id. Add new areas here.

import { buildBrambleford } from './brambleford.js';
import { buildRoute1 } from './route1.js';
import { buildStore, buildBank } from './interiors.js';
import { buildMine } from './mine.js';
import { buildDepths } from './depths.js';
import { buildHollow } from './hollow.js';
import { buildForge } from './forge.js';
import { buildVale } from './vale.js';
import { buildWarrens } from './warrens.js';
import { buildChamber } from './chamber.js';
import { waterEdges } from './decor.js';
import { withLodestones } from '../lodestones.js';

// (Each area's lodestone, if it has one, is added as it's built: data/lodestones.js.)
const BUILD = {
  brambleford: () => waterEdges(buildBrambleford()),
  route1: () => waterEdges(buildRoute1()),
  store: buildStore,
  bank: buildBank,
  mine: buildMine,
  depths: buildDepths,
  hollow: buildHollow,
  forge: buildForge,
  vale: buildVale,
  warrens: buildWarrens,
  chamber: buildChamber,
};
export const AREAS = Object.fromEntries(Object.entries(BUILD).map(([id, fn]) => [id, () => withLodestones(fn())]));

export const START_AREA = 'brambleford';
