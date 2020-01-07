import seedrandom from 'seed-random';
import { get_ca_combine_function, get_combine_function } from './combinations';

let rng;
let grid;
let color_combination;
let combine_function;

export default function({
  seeds,
  dim,
  random_init = false,
  init_seed = null,
  palette_size = 4,
  combo = 'simple',
  offset = 1,
  color_seed = null
}) {
  rng = init_seed ? seedrandom(init_seed) : seedrandom();
  grid = [];
  color_combination = combo;
  combine_function =
    combo === 'ca'
      ? get_ca_combine_function(palette_size, color_seed)
      : get_combine_function(palette_size);

  const h_seed = binaryArray(8, seeds.h);
  const v_seed = binaryArray(8, seeds.v);
  const d_seed = binaryArray(8, seeds.d);

  for (let i = 0; i < dim.y + offset; i++) {
    let row = [];
    for (let j = 0; j < dim.x + offset; j++) {
      let px = { h: false, v: false, d: false };
      if (i == 0) px.h = true;
      if (j == 0) px.v = true;
      if (random_init && (i == 0 || j == 0)) px = { h: flip(), v: flip(), d: flip() };
      row.push(px);
    }
    grid.push(row);
  }

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      const px = grid[i][j];
      if (i > 0 && j > 0) {
        px.h = resolve(grid[i][j - 1].h, grid[i - 1][j].v, grid[i - 1][j - 1].d, h_seed);
        px.v = resolve(grid[i][j - 1].h, grid[i - 1][j].v, grid[i - 1][j - 1].d, v_seed);
        px.d = resolve(grid[i][j - 1].h, grid[i - 1][j].v, grid[i - 1][j - 1].d, d_seed);
      }
      colorize(j, i, random_init, palette_size);
    }
  }
  return grid.slice(offset).map(r => r.slice(offset));
}

function colorize(x, y, random_init, palette_size) {
  const cell = grid[y][x];
  const topcol = grid[y - 1]
    ? grid[y - 1][x].lc
    : random_init
    ? randomInt(palette_size)
    : palette_size - 1;
  const leftcol = grid[y][x - 1]
    ? grid[y][x - 1].tc
    : random_init
    ? randomInt(palette_size)
    : palette_size - 1;

  if (!cell.h) cell.tc = topcol;
  if (!cell.v) cell.lc = leftcol;
  if (!cell.d) {
    if (cell.h && !cell.v) cell.tc = cell.lc;
    if (!cell.h && cell.v) cell.lc = cell.tc;
    if (cell.h && cell.v) cell.tc = cell.lc = new_col(topcol, leftcol, palette_size);
  }
  if (cell.d) {
    if (cell.h) cell.tc = new_col(topcol, cell.lc ? cell.lc : null, palette_size);
    if (cell.v) cell.lc = new_col(leftcol, cell.tc, palette_size);
  }
}

function new_col(a, b, n) {
  if (b === null) return (a + 1) % n;
  return combine_function(a, b);
}

function resolve(b1, b2, b3, seed) {
  const i = (b1 ? 4 : 0) + (b2 ? 2 : 0) + (b3 ? 1 : 0);
  return seed[i];
}

function binaryArray(num, seed) {
  return seed
    .toString(2)
    .padStart(num, '0')
    .split('')
    .map(x => !!+x);
}

function flip() {
  return rng() > 0.5;
}

function randomInt(max) {
  return Math.floor(rng() * max);
}
