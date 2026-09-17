"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { buildTrace } = require("./trachtenberg.js");

test("reconstructs the multiplication from Gifted", function () {
  const trace = buildTrace(135, 57);

  assert.equal(trace.result, 7695);
  assert.deepEqual(
    trace.steps.map(step => [step.total, step.outputDigit, step.outgoingCarry]),
    [[35, 5, 3], [49, 9, 4], [26, 6, 2], [7, 7, 0]]
  );
});

test("matches ordinary multiplication across two-digit multipliers", function () {
  for (let multiplicand = 1; multiplicand <= 500; multiplicand += 7) {
    for (let multiplier = 10; multiplier <= 99; multiplier += 3) {
      assert.equal(
        buildTrace(multiplicand, multiplier).result,
        multiplicand * multiplier
      );
    }
  }
});

test("keeps a final carry as an additional output digit", function () {
  const trace = buildTrace(999, 99);
  assert.equal(trace.result, 98901);
  assert.equal(trace.steps.at(-1).outputDigit, 9);
});

test("rejects unsupported operands", function () {
  assert.throws(() => buildTrace(0, 57), /between 1 and 99,999/);
  assert.throws(() => buildTrace(135, 7), /exactly two digits/);
  assert.throws(() => buildTrace(135.5, 57), /whole number/);
});
