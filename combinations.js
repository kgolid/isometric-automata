import { get_random_rule, get_rule } from 'cellular-automata-generator';
import seedrandom from 'seed-random';

export function get_ca_combine_function(n, seed) {
  if (seed === null) return get_random_rule(n);

  const rng = seedrandom(seed);
  const rule_num = Math.floor(rng() * Math.pow(n, Math.pow(n, 2)));
  return get_rule(n, rule_num);
}

export function get_combine_function(n) {
  return (a, b) => combination_tables[n - 2][b][a];
}

const table2 = [
  [1, 1],
  [0, 0]
];

const table3 = [
  [2, 2, 1],
  [2, 0, 0],
  [1, 0, 1]
];

const table4 = [
  [3, 2, 1, 1],
  [2, 0, 3, 2],
  [3, 3, 1, 0],
  [1, 0, 0, 2]
];

const table5 = [
  [4, 3, 3, 1, 2],
  [3, 0, 4, 4, 2],
  [3, 4, 1, 0, 0],
  [1, 4, 0, 2, 1],
  [2, 2, 0, 1, 3]
];

const table6 = [
  [5, 2, 4, 1, 1, 3],
  [4, 0, 3, 5, 2, 2],
  [3, 5, 1, 4, 0, 3],
  [4, 4, 0, 2, 5, 1],
  [2, 5, 5, 1, 3, 0],
  [1, 3, 0, 0, 2, 4]
];

const combination_tables = [table2, table3, table4, table5, table6];
