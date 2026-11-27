import test from 'node:test';
import assert from 'node:assert/strict';
import { esc, fmt, fmtOrDash, formatIsoDate, kgFromGrams, plural } from '../js/lib/format.js';

test('esc экранирует HTML и кавычки', () => {
  assert.equal(esc('<a href="x">&\'</a>'), '&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;');
  assert.equal(esc(null), '');
});
test('plural склоняет по-русски', () => {
  const f = (n) => plural(n, 'точка', 'точки', 'точек');
  assert.deepEqual([1, 2, 5, 11, 12, 21, 22, 25, 111, 0].map(f), ['точка', 'точки', 'точек', 'точек', 'точек', 'точка', 'точки', 'точек', 'точек', 'точек']);
});
test('fmt и fmtOrDash', () => {
  assert.equal(fmt(1234.56, 1).replace(/\s/g, ' '), '1 234,6');
  assert.equal(fmtOrDash(null), '—');
});
test('kgFromGrams', () => assert.match(kgFromGrams(885308).replace(/\s/g, ' '), /^885,3 кг$/));
test('formatIsoDate', () => {
  assert.equal(formatIsoDate('2026-10-29'), '29.10.2026');
  assert.equal(formatIsoDate('мусор'), 'мусор');
});
