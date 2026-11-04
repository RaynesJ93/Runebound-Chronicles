// Every area in the world, by id. Add new areas here.

import { buildBrambleford } from './brambleford.js';
import { buildRoute1 } from './route1.js';
import { buildStore, buildBank } from './interiors.js';
import { buildMine } from './mine.js';
import { buildDepths } from './depths.js';
import { buildHollow } from './hollow.js';
import { buildForge } from './forge.js';
import { buildVale } from './vale.js';
import { waterEdges } from './decor.js';

export const AREAS = {
  brambleford: () => waterEdges(buildBrambleford()),
  route1: () => waterEdges(buildRoute1()),
  store: buildStore,
  bank: buildBank,
  mine: buildMine,
  depths: buildDepths,
  hollow: buildHollow,
  forge: buildForge,
  vale: buildVale,
};

export const START_AREA = 'brambleford';
