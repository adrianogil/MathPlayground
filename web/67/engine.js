/* Exact arithmetic and puzzle rules, shared by the browser and Node tests. */
(function (root) {
  'use strict';
  const OPS = ['+', '-', '*', '/'];
  const symbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  function rational(n, d = 1) {
    if (!d) throw new Error('zero');
    if (!Number.isSafeInteger(n) || !Number.isSafeInteger(d)) throw new Error('range');
    if (n === 0) return { n: 0, d: 1 };
    if (d < 0) { n = -n; d = -d; }
    let a = Math.abs(n), b = d;
    while (b) [a, b] = [b, a % b];
    return { n: n / a, d: d / a };
  }
  function calculate(a, op, b) {
    switch (op) {
      case '+': return rational(a.n * b.d + b.n * a.d, a.d * b.d);
      case '-': return rational(a.n * b.d - b.n * a.d, a.d * b.d);
      case '*': return rational(a.n * b.n, a.d * b.d);
      case '/': return rational(a.n * b.d, a.d * b.n);
      default: throw new Error('operation');
    }
  }
  const format = value => value.d === 1 ? String(value.n) : `${value.n}/${value.d}`;
  function createState(numbers) {
    if (numbers.length !== 5 || numbers.some(n => !Number.isInteger(n) || n < 1 || n > 36)) throw new Error('numbers');
    return { tiles: numbers.map((n, i) => ({ id: i, value: rational(n), expression: String(n) })), ops: [...OPS], steps: [], nextId: 5 };
  }
  function combine(state, aId, op, bId) {
    const a = state.tiles.find(t => t.id === aId), b = state.tiles.find(t => t.id === bId);
    if (!a || !b || aId === bId || !state.ops.includes(op)) throw new Error('selection');
    const value = calculate(a.value, op, b.value);
    const result = { id: state.nextId, value, expression: `(${a.expression} ${symbols[op]} ${b.expression})` };
    return { tiles: [...state.tiles.filter(t => t !== a && t !== b), result], ops: state.ops.filter(o => o !== op),
      steps: [...state.steps, { a: a.value, op, b: b.value, value }], nextId: state.nextId + 1 };
  }
  const won = state => state.tiles.length === 1 && state.ops.length === 0 && state.tiles[0].value.n === 67 * state.tiles[0].value.d;
  function solve(state) {
    const failed = new Set();
    function visit(current) {
      if (!current.ops.length) return won(current) ? [] : null;
      const key = current.tiles.map(t => format(t.value)).sort().join(',') + '|' + current.ops.join('');
      if (failed.has(key)) return null;
      for (const op of current.ops) for (let i = 0; i < current.tiles.length; i++) for (let j = 0; j < current.tiles.length; j++) {
        if (i === j || ((op === '+' || op === '*') && j < i)) continue;
        const a = current.tiles[i], b = current.tiles[j];
        let next;
        try { next = combine(current, a.id, op, b.id); } catch { continue; }
        const tail = visit(next);
        if (tail) return [{ aId: a.id, bId: b.id, op, a: a.value, b: b.value, value: next.tiles.at(-1).value }, ...tail];
      }
      failed.add(key);
      return null;
    }
    return visit(state);
  }
  function generate(random = Math.random, previous = []) {
    const int = (lo, hi) => lo + Math.floor(random() * (hi - lo + 1));
    const signature = ns => [...ns].sort((a, b) => a - b).join(',');
    let numbers;
    for (let attempt = 0; attempt < 2000; attempt++) {
      const family = int(0, 2);
      if (family === 0) {
        const a = int(5, 12), b = int(5, 12), q = int(1, 9), e = int(2, 6);
        numbers = [a, b, 67 - a * b + q, q * e, e];
      } else if (family === 1) {
        const a = int(4, 20), b = int(4, 20), c = int(3, 9), e = int(2, 4);
        numbers = [a, b, c, (a + b) * c - 67 * e, e];
      } else {
        const a = int(6, 20), b = int(6, 20), d = int(2, 5), e = int(1, 15);
        numbers = [a, b, a * b - (67 - e) * d, d, e];
      }
      if (numbers.every(n => n >= 1 && n <= 36) && signature(numbers) !== signature(previous)) break;
      numbers = null;
    }
    numbers ||= signature(previous) === '2,4,5,8,8' ? [7, 9, 6, 4, 2] : [8, 8, 5, 4, 2];
    for (let i = numbers.length - 1; i > 0; i--) { const j = int(0, i); [numbers[i], numbers[j]] = [numbers[j], numbers[i]]; }
    return numbers;
  }
  const api = { OPS, symbols, rational, calculate, format, createState, combine, won, solve, generate };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SixtySeven = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
