let grid;
let color_combination;

export default function({ seeds, dim, random_init = false, combo = 'simple' }) {
  grid = [];
  color_combination = combo;
  const h_seed = binaryArray(8, seeds.h);
  const v_seed = binaryArray(8, seeds.v);
  const d_seed = binaryArray(8, seeds.d);

  for (let i = 0; i < dim.y + 1; i++) {
    let row = [];
    for (let j = 0; j < dim.x + 1; j++) {
      let px = { h: false, v: false, d: false };
      if (i == 0) px.h = true;
      if (j == 0) px.v = true;
      if (random_init && (i == 0 || j == 0))
        px = { h: flip(), v: flip(), d: flip() };
      row.push(px);
    }
    grid.push(row);
  }

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      const px = grid[i][j];
      if (i > 0 && j > 0) {
        px.h = resolve(
          grid[i][j - 1].h,
          grid[i - 1][j].v,
          grid[i - 1][j - 1].d,
          h_seed
        );
        px.v = resolve(
          grid[i][j - 1].h,
          grid[i - 1][j].v,
          grid[i - 1][j - 1].d,
          v_seed
        );
        px.d = resolve(
          grid[i][j - 1].h,
          grid[i - 1][j].v,
          grid[i - 1][j - 1].d,
          d_seed
        );
      }
      colorize(j, i);
    }
  }
  return grid.slice(1).map(r => r.slice(1));
}

function colorize(x, y, random_init) {
  const cell = grid[y][x];
  const topcol = grid[y - 1]
    ? grid[y - 1][x].lc
    : random_init
    ? randomInt(4)
    : 3;
  const leftcol = grid[y][x - 1]
    ? grid[y][x - 1].tc
    : random_init
    ? randomInt(4)
    : 3;

  if (!cell.h) cell.tc = topcol;
  if (!cell.v) cell.lc = leftcol;
  if (!cell.d) {
    if (cell.h && !cell.v) cell.tc = cell.lc;
    if (!cell.h && cell.v) cell.lc = cell.tc;
    if (cell.h && cell.v) cell.tc = cell.lc = new_col(topcol, leftcol);
  }
  if (cell.d) {
    if (cell.h) cell.tc = new_col(topcol, cell.lc ? cell.lc : null);
    if (cell.v) cell.lc = new_col(leftcol, cell.tc);
  }
}

function new_col(a, b) {
  if (b === null) return (a + 1) % 4;
  return combine(a, b);
}

// ---- UTILS ----

function combine(x, y) {
  const simple = [[1, 2, 1, 1], [2, 0, 0, 0], [1, 0, 0, 0], [1, 0, 0, 0]];
  const strict = [[1, 2, 3, 1], [2, 3, 0, 2], [3, 0, 3, 0], [1, 2, 0, 1]];
  const regular = [[1, 3, 1, 2], [3, 2, 0, 0], [3, 0, 3, 1], [2, 2, 1, 0]];
  if (color_combination === 'simple') return simple[y][x];
  if (color_combination === 'strict') return strict[y][x];
  return regular[y][x];
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
  return Math.random() > 0.5;
}

function randomInt(max) {
  return Math.floor(Math.random() * max);
}
