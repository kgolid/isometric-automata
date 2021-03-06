'use strict';

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var seedRandom = createCommonjsModule(function (module) {

var width = 256;// each RC4 output is 0 <= x < 256
var chunks = 6;// at least six RC4 outputs for each double
var digits = 52;// there are 52 significant digits in a double
var pool = [];// pool: entropy pool starts empty
var GLOBAL = typeof commonjsGlobal === 'undefined' ? window : commonjsGlobal;

//
// The following constants are related to IEEE 754 limits.
//
var startdenom = Math.pow(width, chunks),
    significance = Math.pow(2, digits),
    overflow = significance * 2,
    mask = width - 1;


var oldRandom = Math.random;

//
// seedrandom()
// This is the seedrandom function described above.
//
module.exports = function(seed, options) {
  if (options && options.global === true) {
    options.global = false;
    Math.random = module.exports(seed, options);
    options.global = true;
    return Math.random;
  }
  var use_entropy = (options && options.entropy) || false;
  var key = [];

  // Flatten the seed string or build one from local entropy if needed.
  var shortseed = mixkey(flatten(
    use_entropy ? [seed, tostring(pool)] :
    0 in arguments ? seed : autoseed(), 3), key);

  // Use the seed to initialize an ARC4 generator.
  var arc4 = new ARC4(key);

  // Mix the randomness into accumulated entropy.
  mixkey(tostring(arc4.S), pool);

  // Override Math.random

  // This function returns a random double in [0, 1) that contains
  // randomness in every bit of the mantissa of the IEEE 754 value.

  return function() {         // Closure to return a random double:
    var n = arc4.g(chunks),             // Start with a numerator n < 2 ^ 48
        d = startdenom,                 //   and denominator d = 2 ^ 48.
        x = 0;                          //   and no 'extra last byte'.
    while (n < significance) {          // Fill up all significant digits by
      n = (n + x) * width;              //   shifting numerator and
      d *= width;                       //   denominator and generating a
      x = arc4.g(1);                    //   new least-significant-byte.
    }
    while (n >= overflow) {             // To avoid rounding up, before adding
      n /= 2;                           //   last byte, shift everything
      d /= 2;                           //   right using integer Math until
      x >>>= 1;                         //   we have exactly the desired bits.
    }
    return (n + x) / d;                 // Form the number within [0, 1).
  };
};

module.exports.resetGlobal = function () {
  Math.random = oldRandom;
};

//
// ARC4
//
// An ARC4 implementation.  The constructor takes a key in the form of
// an array of at most (width) integers that should be 0 <= x < (width).
//
// The g(count) method returns a pseudorandom integer that concatenates
// the next (count) outputs from ARC4.  Its return value is a number x
// that is in the range 0 <= x < (width ^ count).
//
/** @constructor */
function ARC4(key) {
  var t, keylen = key.length,
      me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];

  // The empty key [] is treated as [0].
  if (!keylen) { key = [keylen++]; }

  // Set up S using the standard key scheduling algorithm.
  while (i < width) {
    s[i] = i++;
  }
  for (i = 0; i < width; i++) {
    s[i] = s[j = mask & (j + key[i % keylen] + (t = s[i]))];
    s[j] = t;
  }

  // The "g" method returns the next (count) outputs as one number.
  (me.g = function(count) {
    // Using instance members instead of closure state nearly doubles speed.
    var t, r = 0,
        i = me.i, j = me.j, s = me.S;
    while (count--) {
      t = s[i = mask & (i + 1)];
      r = r * width + s[mask & ((s[i] = s[j = mask & (j + t)]) + (s[j] = t))];
    }
    me.i = i; me.j = j;
    return r;
    // For robust unpredictability discard an initial batch of values.
    // See http://www.rsa.com/rsalabs/node.asp?id=2009
  })(width);
}

//
// flatten()
// Converts an object tree to nested arrays of strings.
//
function flatten(obj, depth) {
  var result = [], typ = (typeof obj)[0], prop;
  if (depth && typ == 'o') {
    for (prop in obj) {
      try { result.push(flatten(obj[prop], depth - 1)); } catch (e) {}
    }
  }
  return (result.length ? result : typ == 's' ? obj : obj + '\0');
}

//
// mixkey()
// Mixes a string seed into a key that is an array of integers, and
// returns a shortened string seed that is equivalent to the result key.
//
function mixkey(seed, key) {
  var stringseed = seed + '', smear, j = 0;
  while (j < stringseed.length) {
    key[mask & j] =
      mask & ((smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++));
  }
  return tostring(key);
}

//
// autoseed()
// Returns an object for autoseeding, using window.crypto if available.
//
/** @param {Uint8Array=} seed */
function autoseed(seed) {
  try {
    GLOBAL.crypto.getRandomValues(seed = new Uint8Array(width));
    return tostring(seed);
  } catch (e) {
    return [+new Date, GLOBAL, GLOBAL.navigator && GLOBAL.navigator.plugins,
            GLOBAL.screen, tostring(pool)];
  }
}

//
// tostring()
// Converts an array of charcodes to a string
//
function tostring(a) {
  return String.fromCharCode.apply(0, a);
}

//
// When seedrandom.js is loaded, we immediately mix a few bits
// from the built-in RNG into the entropy pool.  Because we do
// not want to intefere with determinstic PRNG state later,
// seedrandom will not call Math.random on its own again after
// initialization.
//
mixkey(Math.random(), pool);
});
var seedRandom_1 = seedRandom.resetGlobal;

// Get bit at pos(ition) for num(ber)
const get_bit = (num, base, size, pos) => {
  return parseInt(
    Number(num)
      .toString(base)
      .padStart(Math.pow(base, size), 0)
      .split('')
      .reverse()
      .join('')
      .charAt(pos)
  );
};

const combine = (bs, base) => {
  return parseInt(bs.join(''), base);
};

// Returns given number in the form of a tertiary function (a rule)
const get_rule = (base, num) => (...bs) =>
  get_bit(num, base, bs.length, combine(bs, base));

const get_random_rule = (base, arity) =>
  get_rule(base, Math.floor(Math.random() * Math.pow(base, Math.pow(base, arity))));

function get_ca_combine_function(n, seed) {
  if (seed === null) return get_random_rule(n);

  const rng = seedRandom(seed);
  const rule_num = Math.floor(rng() * Math.pow(n, Math.pow(n, 2)));
  return get_rule(n, rule_num);
}

function get_combine_function(n) {
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

let rng;
let grid;
let combine_function;

function index({
  seeds,
  dim,
  random_init = false,
  init_seed = null,
  palette_size = 4,
  combo = 'simple',
  offset = 1,
  color_seed = null
}) {
  rng = init_seed ? seedRandom(init_seed) : seedRandom();
  grid = [];
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

module.exports = index;
