const test = require('node:test');
const assert = require('node:assert/strict');
const M = require('./math.js');
const messages = require('./i18n.js');

test('decimal comparisons use place value, including equivalent trailing zeros', () => {
  for (const [a, b, result] of [['0.6', '0.38', 1], ['0.9', '0.12', 1], ['0.4', '0.40', 0], ['0.08', '0.1', -1], ['2.09', '2.009', 1], ['0,60', '.6', 0], ['0', '-0.000', 0]]) {
    assert.equal(M.compare(a, b), result);
    assert.equal(M.compare(b, a), result === 0 ? 0 : -result);
  }
  assert.equal(M.difference('0.6', '0.38'), '0.22');
  assert.equal(M.difference('0.300', '0.1'), '0.2');
});

test('conversion examples and every metric-unit round trip remain exact', () => {
  assert.equal(M.convert('0.6', 'm', 'cm'), '60');
  assert.equal(M.convert('250', 'cm', 'm'), '2.5');
  assert.equal(M.convert('0.001', 'mm', 'km'), '0.000000001');
  assert.equal(M.convert('10000', 'km', 'mm'), '10000000000');
  for (const from of Object.keys(M.units)) for (const to of Object.keys(M.units)) {
    for (const value of ['0.001', '0.6', '38', '9999.999']) {
      assert.equal(M.convert(M.convert(value, from, to), to, from), value);
    }
  }
  assert.equal(M.convert('1', 'm', 'kg'), null);
});

test('powers of ten preserve exact decimals and normalize correctly', () => {
  for (const [value, coefficient, exponent] of [['0.0042', '4.2', -3], ['600', '6', 2], ['1', '1', 0], ['0.000001', '1', -6], ['9990000', '9.99', 6], ['0.60', '6', -1], ['100.00', '1', 2]]) {
    assert.deepEqual(M.scientific(value), { coefficient, exponent });
    assert.equal(M.compare(M.shift(coefficient, exponent), value), 0);
  }
  assert.equal(M.shift('0', 6), '0');
  assert.equal(M.shift('0.000', -6), '0');
  assert.equal(M.shift('1.23', -6), '0.00000123');
  assert.equal(M.scientific('0'), null);
  assert.equal(M.scientific('-1'), null);
});

test('invalid and ambiguous numeric syntax is rejected, with locale decimal support', () => {
  for (const bad of ['', ' ', 'NaN', 'Infinity', '1e3', '1,000.5', '1.000,5', '1 000', '1/2', '<script>', '1'.repeat(41)]) assert.equal(M.parse(bad), null, bad);
  assert.equal(M.valid('0,605', '0', '1'), true);
  assert.equal(M.valid('0.6050', '0', '1'), true);
  assert.equal(M.valid('0.0001', '0', '1'), false);
  assert.equal(M.valid('-0.1', '0', '1'), false);
  assert.equal(M.valid('1.001', '0', '1'), false);
  assert.equal(M.compare('garbage', '1'), null);
});

test('exercise bank answers match independently specified teaching examples', () => {
  assert.deepEqual(M.banks.decimal.map(q => q.answer), ['60', '400', '38', '90', '605', '12', '7', '1000', '0', '250']);
  assert.deepEqual(M.banks.compare.map(q => q.answer), ['>', '>', '=', '<', '<', '<', '>', '<', '=', '<']);
  assert.deepEqual(M.banks.units.map(q => q.answer), ['60', '2.5', '1200', '3.8', '5', '0.75', '0.6', '3.5', '240', '700']);
  assert.deepEqual(M.banks.science.map(q => [q.coefficient, q.exponent]), [['4.2', -3], ['6', 2], ['8', -6], ['7.2', 4], ['6', -1], ['1', 0], ['3.5', 6], ['3.8', -2], ['9.1', 0], ['1.2', 2]]);
});

test('all five translations contain every key, array item, and interpolation', () => {
  assert.deepEqual(Object.keys(messages).sort(), ['en', 'fr', 'ja', 'ko', 'pt-BR']);
  const placeholders = value => [...String(value).matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort();
  for (const [locale, translation] of Object.entries(messages)) {
    assert.deepEqual(Object.keys(translation).sort(), Object.keys(messages.en).sort(), locale);
    for (const key of Object.keys(messages.en)) {
      assert.deepEqual(placeholders(translation[key]), placeholders(messages.en[key]), `${locale}.${key}`);
      if (Array.isArray(messages.en[key])) assert.equal(translation[key].length, messages.en[key].length, `${locale}.${key}`);
      assert.ok(translation[key].length, `${locale}.${key}`);
    }
  }
});
