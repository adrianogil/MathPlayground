'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const E = require('./engine.js');
const messages = require('./i18n.js');
function finish(state, solution) {
  for (const step of solution) state = E.combine(state, step.aId, step.op, step.bId);
  return state;
}
test('five-piece arithmetic uses both copies of 8 and every operation to reach 67', () => {
  const initial = E.createState([8, 5, 4, 8, 2]);
  const result = finish(initial, [
    { aId: 0, op: '*', bId: 3 }, { aId: 2, op: '/', bId: 4 },
    { aId: 5, op: '+', bId: 1 }, { aId: 7, op: '-', bId: 6 }
  ]);
  assert.ok(E.won(result));
  assert.equal(result.steps.length, 4);
  assert.equal(initial.tiles.length, 5, 'original state remains available for undo');
  assert.deepEqual(initial.ops, E.OPS);
});
test('fractions are exact, signs normalize, and zero division is rejected', () => {
  const third = E.calculate(E.rational(1), '/', E.rational(3));
  assert.deepEqual(E.calculate(third, '*', E.rational(201)), E.rational(67));
  assert.deepEqual(E.calculate(third, '+', E.rational(2, 3)), E.rational(1));
  assert.equal(E.format(E.rational(6, -4)), '-3/2');
  assert.deepEqual(E.rational(0, -3), { n: 0, d: 1 });
  assert.throws(() => E.calculate(E.rational(1), '/', E.rational(0)), /zero/);
});
test('tiles and operations cannot be reused; early 67 is not a win', () => {
  const state = E.createState([8, 8, 3, 4, 2]);
  assert.throws(() => E.combine(state, 0, '+', 0), /selection/);
  const multiplied = E.combine(state, 0, '*', 1);
  assert.throws(() => E.combine(multiplied, 0, '+', 2), /selection/);
  assert.throws(() => E.combine(multiplied, 2, '*', 3), /selection/);
  const early = E.combine(multiplied, 5, '+', 2);
  assert.equal(early.tiles.at(-1).value.n, 67);
  assert.equal(E.won(early), false);
});
test('starts with two numbers and requires five solved rounds before adding a piece', () => {
  const starter = E.createState([40, 27], ['+']);
  assert.equal(starter.tiles.length, 2);
  assert.equal(starter.ops.length, 1);
  assert.ok(E.won(E.combine(starter, 0, '+', 1)));
  let level = 1;
  for (let expected = 1; expected <= 4; expected++) {
    assert.equal(level, expected);
    for (let solved = 0; solved < E.PRACTICE_ROUNDS; solved++) assert.equal(E.levelAfter(level, solved), level);
    assert.equal(E.levelAfter(level, 0), level, 'extra practice starts a fresh set at the same level');
    const puzzle = E.generate(level, () => 0.5);
    assert.equal(puzzle.numbers.length, level + 1);
    assert.equal(puzzle.ops.length, level);
    level = E.levelAfter(level, E.PRACTICE_ROUNDS);
  }
  assert.equal(level, 4);
  assert.equal(E.PRACTICE_ROUNDS, 5);
});
test('uniqueness ignores commutative order and identical tiles, but rejects different solutions', () => {
  assert.equal(E.countSolutions(E.createState([40, 27], ['+'])), 1);
  assert.equal(E.countSolutions(E.createState([8, 8, 3], ['*', '+'])), 1);
  assert.equal(E.countSolutions(E.createState([1, 2], ['+'])), 0);
  // The original unconstrained generator admitted several different answers.
  assert.equal(E.countSolutions(E.createState([8, 20, 5, 6, 2])), 2);
  assert.equal(E.countSolutions(E.createState([8, 5, 4, 8, 2])), 2);
});
test('every puzzle in all four levels has exactly one solution using all supplied pieces', () => {
  const bank = require('./puzzles.js');
  assert.equal(bank.length, 4);
  for (const [index, puzzles] of bank.entries()) {
    assert.equal(puzzles.length, 24);
    for (const puzzle of puzzles) {
      assert.equal(puzzle.numbers.length, index + 2);
      assert.equal(puzzle.ops.length, index + 1);
      const state = E.createState(puzzle.numbers, puzzle.ops);
      assert.equal(E.countSolutions(state), 1, JSON.stringify(puzzle));
      const solution = E.solve(state);
      assert.equal(solution.length, puzzle.ops.length);
      assert.deepEqual(solution.map(step => step.op).sort(), [...puzzle.ops].sort());
      const result = finish(state, solution);
      assert.ok(E.won(result));
      assert.equal(result.tiles.length, 1);
      assert.equal(result.ops.length, 0);
      // Number labels do not affect uniqueness when the display order changes.
      assert.equal(E.countSolutions(E.createState([...puzzle.numbers].reverse(), puzzle.ops)), 1);
    }
  }
});
test('new pieces preserve difficulty, avoid immediate repeats, and do not mutate the bank', () => {
  const bank = require('./puzzles.js'), before = JSON.stringify(bank);
  for (let level = 1; level <= 4; level++) {
    const first = E.generate(level, () => 0);
    const next = E.generate(level, () => 0, first);
    assert.notDeepEqual([...first.numbers].sort(), [...next.numbers].sort());
    assert.equal(next.level, level);
    assert.equal(next.numbers.length, level + 1);
    first.numbers[0] = 999;
    first.ops.pop();
  }
  assert.equal(JSON.stringify(bank), before);
});
test('invalid deals cannot omit an operation or repeat a supplied operation', () => {
  assert.throws(() => E.createState([40, 27], []), /operations/);
  assert.throws(() => E.createState([40, 20, 7], ['+', '+']), /operations/);
  assert.throws(() => E.createState([40, 27], ['?']), /operations/);
});
test('hints solve the current partial board and report dead ends', () => {
  const state = E.createState([8, 5, 4, 8, 2]);
  const partial = E.combine(state, 2, '/', 4);
  assert.ok(E.won(finish(partial, E.solve(partial))));
  const impossible = E.combine(E.combine(E.combine(state, 0, '+', 3), 5, '-', 1), 6, '*', 2);
  assert.equal(E.solve(impossible), null);
});
test('all five languages have every message and matching placeholders', () => {
  const keys = Object.keys(messages['pt-BR']).sort();
  assert.deepEqual(Object.keys(messages).sort(), ['en', 'fr', 'ja', 'ko', 'pt-BR']);
  for (const [language, translation] of Object.entries(messages)) {
    assert.deepEqual(Object.keys(translation).sort(), keys, language);
    for (const key of keys) {
      assert.ok(translation[key].length, `${language}.${key}`);
      assert.deepEqual((translation[key].match(/\{\w+\}/g) || []).sort(), (messages['pt-BR'][key].match(/\{\w+\}/g) || []).sort());
    }
  }
});

test('merges retain stable board slots and leave unrelated tiles in place', () => {
  const initial = E.createState([8, 5, 4, 8, 2]);
  const merged = E.combine(initial, 4, '/', 2);
  assert.deepEqual(merged.tiles.map(t => [t.id, t.slot]), [[0, 0], [1, 1], [3, 3], [5, 2]]);
  const next = E.combine(merged, 3, '*', 0);
  assert.deepEqual(next.tiles.map(t => [t.id, t.slot]), [[1, 1], [5, 2], [6, 0]]);
  assert.equal(new Set(next.tiles.map(t => t.slot)).size, next.tiles.length);
  assert.deepEqual(initial.tiles.map(t => t.slot), [0, 1, 2, 3, 4]);
  assert.deepEqual(merged.tiles.map(t => t.slot), [0, 1, 3, 2], 'undo snapshots keep their layout');
});
