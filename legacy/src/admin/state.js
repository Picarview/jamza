import { defaults } from '../config/defaults.js';
export const state = {
  cache: structuredClone(defaults),
  authorized: false,
  busy: false,
  authGeneration: 0,
  current: 'overview',
};
