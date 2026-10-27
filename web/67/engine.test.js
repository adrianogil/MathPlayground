'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const E = require('./engine.js');
const messages = require('./i18n.js');
function finish(state, solution) {
  for (const step of solution) state = E.combine(state, step.aId, step.op, step.bId);
  return state;
}
test('starter uses both copies of 8 and every operation to reach 67', () => {
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
test('100 generated rounds are varied, bounded, solvable and use all operations', () => {
  let seed = 6767;
  const random = () => { seed = (Math.imul(1664525, seed) + 1013904223) >>> 0; return seed / 4294967296; };
  const seen = new Set();
  let previous = [];
  for (let i = 0; i < 100; i++) {
    const numbers = E.generate(random, previous);
    assert.ok(numbers.every(n => n >= 1 && n <= 36));
    const signature = [...numbers].sort((a, b) => a - b).join(',');
    assert.notEqual(signature, [...previous].sort((a, b) => a - b).join(','));
    seen.add(signature);
    const state = E.createState(numbers), solution = E.solve(state);
    assert.ok(solution, `No solution for ${numbers}`);
    assert.equal(solution.length, 4);
    assert.deepEqual(solution.map(step => step.op).sort(), [...E.OPS].sort());
    assert.ok(E.won(finish(state, solution)));
    previous = numbers;
  }
  assert.ok(seen.size > 80);
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
