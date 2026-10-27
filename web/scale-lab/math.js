(function (root) {
  'use strict';
  // Decimal strings are integers plus a scale: no binary floating-point arithmetic
  // is used to grade answers or convert units.
  function parse(value) {
    const text = String(value).trim().replace(',', '.');
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text) || text.length > 40) return null;
    const negative = text.startsWith('-');
    const [whole, fraction = ''] = text.replace(/^[+-]/, '').split('.');
    return { n: BigInt((whole || '0') + fraction) * (negative ? -1n : 1n), scale: fraction.length };
  }
  function format(n, scale) {
    if (n === 0n) return '0';
    const sign = n < 0n ? '-' : '';
    let digits = String(n < 0n ? -n : n);
    if (scale < 0) return sign + digits + '0'.repeat(-scale);
    digits = digits.padStart(scale + 1, '0');
    let result = scale ? digits.slice(0, -scale) + '.' + digits.slice(-scale) : digits;
    if (result.includes('.')) result = result.replace(/0+$/, '').replace(/\.$/, '');
    return (n === 0n ? '' : sign) + result;
  }
  function compare(a, b) {
    a = parse(a); b = parse(b);
    if (!a || !b) return null;
    const scale = Math.max(a.scale, b.scale);
    const x = a.n * 10n ** BigInt(scale - a.scale), y = b.n * 10n ** BigInt(scale - b.scale);
    return x < y ? -1 : x > y ? 1 : 0;
  }
  function shift(value, exponent) {
    const d = parse(value);
    if (!d || !Number.isInteger(exponent) || Math.abs(exponent) > 20) return null;
    return format(d.n, d.scale - exponent);
  }
  function difference(a, b) {
    a = parse(a); b = parse(b);
    const scale = Math.max(a.scale, b.scale);
    const delta = a.n * 10n ** BigInt(scale - a.scale) - b.n * 10n ** BigInt(scale - b.scale);
    return format(delta < 0n ? -delta : delta, scale);
  }
  const units = { km: 3, hm: 2, dam: 1, m: 0, dm: -1, cm: -2, mm: -3 };
  function convert(value, from, to) {
    if (!Object.hasOwn(units, from) || !Object.hasOwn(units, to)) return null;
    return shift(value, units[from] - units[to]);
  }
  function scientific(value) {
    const d = parse(value);
    if (!d || d.n <= 0n) return null;
    const exponent = d.n.toString().length - d.scale - 1;
    return { coefficient: shift(value, -exponent), exponent };
  }
  function valid(value, min, max, places = 3) {
    const d = parse(value);
    if (!d) return false;
    const canonical = format(d.n, d.scale);
    return compare(value, min) >= 0 && compare(value, max) <= 0 && (canonical.split('.')[1] || '').length <= places;
  }
  const banks = {
    decimal: [
      ['0.6', 2], ['0.4', 3], ['0.38', 2], ['0.09', 3], ['0.605', 3], ['0.12', 2], ['0.007', 3], ['1', 3], ['0', 2], ['0.25', 3],
    ].map(([value, places]) => ({ value, places, answer: shift(value, places) })),
    compare: [
      ['0.6', '0.38'], ['0.9', '0.12'], ['0.4', '0.40'], ['0.08', '0.1'], ['0.305', '0.35'], ['1.02', '1.2'], ['2.09', '2.009'], ['0.007', '0.07'], ['12.5', '12.50'], ['9.99', '10'],
    ].map(([a, b]) => ({ a, b, answer: ['<', '=', '>'][compare(a, b) + 1] })),
    units: [
      ['0.6', 'm', 'cm'], ['250', 'cm', 'm'], ['1.2', 'km', 'm'], ['38', 'mm', 'cm'], ['0.005', 'm', 'mm'], ['75', 'cm', 'm'], ['6', 'dm', 'm'], ['3500', 'm', 'km'], ['2.4', 'hm', 'm'], ['0.7', 'dam', 'cm'],
    ].map(([value, from, to]) => ({ value, from, to, answer: convert(value, from, to) })),
    science: ['0.0042', '600', '0.000008', '72000', '0.6', '1', '3500000', '0.038', '9.1', '120'].map(value => ({ value, ...scientific(value) })),
  };
  const api = { parse, format, compare, shift, difference, convert, scientific, valid, units, banks };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ScaleMath = api;
})(globalThis);
