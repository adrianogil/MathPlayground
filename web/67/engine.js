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
  function createState(numbers, ops = OPS) {
    if (numbers.length < 2 || numbers.length > 5 || numbers.some(n => !Number.isInteger(n) || n < 1 || n > 200)) throw new Error('numbers');
    if (ops.length !== numbers.length - 1 || new Set(ops).size !== ops.length || ops.some(op => !OPS.includes(op))) throw new Error('operations');
    return { tiles: numbers.map((n, i) => ({ id: i, slot: i, value: rational(n), expression: String(n) })), ops: [...ops], steps: [], nextId: numbers.length };
  }
  function combine(state, aId, op, bId) {
    const a = state.tiles.find(t => t.id === aId), b = state.tiles.find(t => t.id === bId);
    if (!a || !b || aId === bId || !state.ops.includes(op)) throw new Error('selection');
    const value = calculate(a.value, op, b.value);
    const result = { id: state.nextId, slot: Math.min(a.slot, b.slot), value, expression: `(${a.expression} ${symbols[op]} ${b.expression})` };
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
  // Enumerate calculation trees, not move orders. Swapping equal tiles or the
  // operands of + and × does not create a different solution. Subtraction and
  // division remain ordered; no approximate arithmetic or numeric-only memo is used.
  function countSolutions(state, limit = 2) {
    const answers = new Set(), visited = new Set();
    const initial = state.tiles.map(tile => ({ value: tile.value, key: format(tile.value) }));
    function visit(tiles, ops) {
      if (!ops.length) {
        if (tiles.length === 1 && tiles[0].value.n === 67 * tiles[0].value.d) answers.add(tiles[0].key);
        return;
      }
      const key = tiles.map(t => t.key).sort().join('|') + ':' + ops.join('');
      if (visited.has(key)) return;
      visited.add(key);
      for (const op of ops) for (let i = 0; i < tiles.length; i++) for (let j = 0; j < tiles.length; j++) {
        if (i === j || ((op === '+' || op === '*') && j < i)) continue;
        const a = tiles[i], b = tiles[j];
        let value;
        try { value = calculate(a.value, op, b.value); } catch { continue; }
        let children = [a.key, b.key];
        if (op === '+' || op === '*') children.sort();
        const result = { value, key: `(${children[0]}${op}${children[1]})` };
        visit([...tiles.filter((_, index) => index !== i && index !== j), result], ops.filter(o => o !== op));
        if (answers.size >= limit) return;
      }
    }
    visit(initial, state.ops);
    return answers.size;
  }
  const PRACTICE_ROUNDS = 5;
  function levelAfter(level, solved) {
    return Math.min(4, Math.max(1, level) + (solved >= PRACTICE_ROUNDS ? 1 : 0));
  }
  function generate(level = 1, random = Math.random, previous = null) {
    const bank = typeof module !== 'undefined' && module.exports ? require('./puzzles.js') : root.SixtySevenPuzzles;
    level = Math.max(1, Math.min(4, Math.floor(level)));
    const signature = puzzle => [...puzzle.numbers].sort((a, b) => a - b).join(',') + ':' + [...puzzle.ops].sort().join('');
    const choices = bank[level - 1].filter(puzzle => !previous || signature(puzzle) !== signature(previous));
    const selected = choices[Math.floor(random() * choices.length)];
    const numbers = [...selected.numbers], ops = [...selected.ops];
    for (let i = numbers.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [numbers[i], numbers[j]] = [numbers[j], numbers[i]]; }
    return { numbers, ops, level };
  }
  const api = { OPS, symbols, rational, calculate, format, createState, combine, won, solve, countSolutions, PRACTICE_ROUNDS, levelAfter, generate };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SixtySeven = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
