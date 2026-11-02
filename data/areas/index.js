// Every area in the world, by id. Add new areas here.

import { buildBrambleford } from './brambleford.js';
import { buildRoute1 } from './route1.js';

export const AREAS = {
  brambleford: buildBrambleford,
  route1: buildRoute1,
};

export const START_AREA = 'brambleford';
