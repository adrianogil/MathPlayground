/* Pure geometry, shared by the browser and Node's built-in test runner. */
(function (root) {
  'use strict';
  const TAU = 2 * Math.PI;
  function gcd(a, b) { while (b) [a, b] = [b, a % b]; return a; }
  function validate(n, k) {
    if (!Number.isInteger(n) || n < 3 || n > 80 || !Number.isInteger(k) || k < 1 || k >= n) {
      throw new RangeError('Choose whole numbers: n from 3 to 80, and k from 1 to n − 1.');
    }
  }
  function period(n, k) { return n / gcd(n, k); }
  function vertex(n, k, j, offset = 0) {
    const angle = TAU * (((j * k + offset) % n + n) % n) / n;
    return { x: Math.cos(angle), y: Math.sin(angle) };
  }
  function position(n, k, edge) {
    const j = Math.floor(edge), f = edge - j;
    const a = vertex(n, k, j), b = vertex(n, k, j + 1);
    return { x: a.x + f * (b.x - a.x), y: a.y + f * (b.y - a.y) };
  }
  // Preserve every corner exactly, including fractional endpoints and negative history.
  function trace(n, k, edge, span) {
    const result = [{ age: 0, y: position(n, k, edge).y }];
    for (let j = Math.ceil(edge) - 1; j > edge - span; j--) {
      result.push({ age: edge - j, y: vertex(n, k, j).y });
    }
    result.push({ age: span, y: position(n, k, edge - span).y });
    return result;
  }
  const api = { gcd, validate, period, vertex, position, trace };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.StarMath = api;
})(typeof window !== 'undefined' ? window : globalThis);
