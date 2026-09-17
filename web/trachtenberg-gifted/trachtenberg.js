(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.Trachtenberg = api;
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function parseInteger(value, label) {
    const number = Number(value);
    if (!Number.isSafeInteger(number)) {
      throw new TypeError(`${label} must be a whole number.`);
    }
    return number;
  }

  function buildTrace(multiplicandValue, multiplierValue) {
    const multiplicand = parseInteger(multiplicandValue, "Multiplicand");
    const multiplier = parseInteger(multiplierValue, "Multiplier");

    if (multiplicand < 1 || multiplicand > 99999) {
      throw new RangeError("Multiplicand must be between 1 and 99,999.");
    }
    if (multiplier < 10 || multiplier > 99) {
      throw new RangeError("Multiplier must have exactly two digits.");
    }

    const digits = String(multiplicand).split("").reverse().map(Number);
    const unitsMultiplier = multiplier % 10;
    const tensMultiplier = Math.floor(multiplier / 10);
    const steps = [];
    const outputDigits = [];
    let carry = 0;
    let position = 0;

    do {
      const outsideDigit = digits[position] ?? 0;
      const insideDigit = position > 0 ? (digits[position - 1] ?? 0) : 0;
      const incomingCarry = carry;
      const outsideValue = outsideDigit * unitsMultiplier;
      const insideValue = insideDigit * tensMultiplier;
      const total = outsideValue + insideValue + incomingCarry;
      const outputDigit = total % 10;
      carry = Math.floor(total / 10);
      outputDigits.push(outputDigit);

      steps.push({
        position,
        outsideDigit,
        insideDigit,
        unitsMultiplier,
        tensMultiplier,
        outsideValue,
        insideValue,
        incomingCarry,
        total,
        outputDigit,
        outgoingCarry: carry
      });
      position += 1;
    } while (position <= digits.length || carry > 0);

    const result = Number(outputDigits.slice().reverse().join(""));
    const expected = multiplicand * multiplier;
    if (result !== expected) {
      throw new Error(`Trace invariant failed: ${result} !== ${expected}.`);
    }

    return {
      multiplicand,
      multiplier,
      unitsMultiplier,
      tensMultiplier,
      result,
      outputDigits,
      steps
    };
  }

  return { buildTrace };
}));
