'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const M = require('./math.js');
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-10, `${a} ≠ ${b}`);

test('the five reference stars close after n edges and stay on straight edges', () => {
  for (const [n, k] of [[7, 5], [9, 4], [20, 13], [25, 12], [29, 17]]) {
    assert.equal(M.period(n, k), n);
    close(M.position(n, k, n).x, 1); close(M.position(n, k, n).y, 0);
    const distances = [];
    for (let j = 0; j < n; j++) {
      const a = M.vertex(n, k, j), b = M.vertex(n, k, j + 1), mid = M.position(n, k, j + .5);
      close(mid.x, (a.x + b.x) / 2); close(mid.y, (a.y + b.y) / 2);
      distances.push(Math.hypot(b.x - a.x, b.y - a.y));
    }
    distances.forEach(d => close(d, distances[0]));
  }
});
test('25/12 has the claimed alternating sine envelope at every vertex', () => {
  for (let j = -100; j <= 100; j++) close(M.vertex(25, 12, j).y, (-1) ** (j + 1) * Math.sin(Math.PI * j / 25));
});
test('history starts at the moving dot and includes every corner across the wrap', () => {
  for (const edge of [0, .5, 7, 24.99]) {
    const trace = M.trace(25, 12, edge, 50);
    close(trace[0].y, M.position(25, 12, edge).y);
    close(trace.at(-1).y, M.position(25, 12, edge - 50).y);
    assert.equal(trace.at(-1).age, 50);
    trace.slice(1, -1).forEach(p => close(edge - p.age, Math.round(edge - p.age)));
    for (let i = 1; i < trace.length; i++) assert.ok(trace[i].age > trace[i - 1].age);
  }
});
test('compound polygons and diameters use the actual closed-path period', () => {
  assert.equal(M.gcd(12, 8), 4); assert.equal(M.period(12, 8), 3);
  close(M.position(12, 8, 3).x, 1); close(M.position(12, 8, 3).y, 0);
  assert.equal(M.period(12, 6), 2);
});
test('custom values reject fractional, non-finite, and out-of-range input', () => {
  for (const [n, k] of [[2, 1], [81, 1], [7, 0], [7, 7], [7.5, 2], [7, 2.5], [NaN, 2], [7, Infinity]]) assert.throws(() => M.validate(n, k), RangeError);
  M.validate(80, 79);
});
