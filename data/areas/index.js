// Every area in the world, by id. Add new areas here.

import { buildBrambleford } from './brambleford.js';
import { buildRoute1 } from './route1.js';
import { buildStore, buildBank } from './interiors.js';

export const AREAS = {
  brambleford: buildBrambleford,
  route1: buildRoute1,
  store: buildStore,
  bank: buildBank,
};

export const START_AREA = 'brambleford';
