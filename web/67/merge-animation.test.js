'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { animateMerge } = require('./merge-animation.js');
function fixture(rect = { left: 0, top: 0, width: 100, height: 100 }, finished = Promise.resolve()) {
  const classes = new Set(), calls = [];
  return {
    classes, calls,
    classList: { add: name => classes.add(name), remove: name => classes.delete(name) },
    getBoundingClientRect: () => rect,
    animate(frames, options) {
      const animation = { finished, cancelled: false, cancel() { this.cancelled = true; } };
      calls.push({ frames, options, animation }); return animation;
    }
  };
}
test('both operands converge on the retained slot, including across wrapped rows', async () => {
  const board = fixture(), first = fixture(), second = fixture({ left: 250, top: 120, width: 100, height: 100 });
  await animateMerge(board, first, second, first);
  assert.equal(first.calls[0].frames.at(-1).transform, 'translate(0px, 0px) scale(0.7)');
  assert.equal(second.calls[0].frames.at(-1).transform, 'translate(-250px, -120px) scale(0.7)');
  assert.equal(second.calls[0].options.duration, 480);
  assert.equal(board.classes.size, 0);
  for (const tile of [first, second]) { assert.equal(tile.classes.size, 0); assert.ok(tile.calls[0].animation.cancelled); }
});
test('the merge remains pending until both operand animations finish', async () => {
  let finishA, finishB, completed = false;
  const board = fixture(), a = fixture(undefined, new Promise(resolve => { finishA = resolve; }));
  const b = fixture(undefined, new Promise(resolve => { finishB = resolve; }));
  const running = animateMerge(board, a, b, a).then(() => { completed = true; });
  assert.ok(board.classes.has('is-merging'));
  finishA(); await Promise.resolve();
  assert.equal(completed, false);
  finishB(); await running;
  assert.equal(completed, true);
  assert.equal(board.classes.size, 0);
});
test('reduced motion and missing animation support skip spatial movement', async () => {
  const board = fixture(), a = fixture(), b = fixture();
  await animateMerge(board, a, b, a, { reducedMotion: true });
  assert.equal(a.calls.length + b.calls.length, 0);
  b.animate = undefined;
  await animateMerge(board, a, b, a);
  assert.equal(a.calls.length, 0);
  assert.equal(board.classes.size, 0);
});
test('cancelled animations and startup failures clean up their visual state', async () => {
  const board = fixture(), a = fixture(undefined, Promise.reject(new Error('cancelled'))), b = fixture();
  await animateMerge(board, a, b, a);
  assert.equal(board.classes.size, 0);
  b.animate = () => { throw new Error('unavailable'); };
  await assert.rejects(animateMerge(board, a, b, a), /unavailable/);
  assert.equal(board.classes.size, 0);
  assert.equal(a.classes.size + b.classes.size, 0);
  assert.ok(a.calls.every(call => call.animation.cancelled));
});
test('a stalled timeline times out instead of leaving the game locked', async () => {
  const board = fixture(), a = fixture(undefined, new Promise(() => {})), b = fixture();
  await animateMerge(board, a, b, a, { duration: 0 });
  assert.equal(board.classes.size, 0);
  assert.ok(a.calls[0].animation.cancelled);
});
