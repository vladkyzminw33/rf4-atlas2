import test from 'node:test';
import assert from 'node:assert/strict';
import { lineDiameter, recommend } from '../js/lib/builder.js';

const reel = (id, dragKg, priceSilver, level = 10, mechKg = 50, type = 'spin') => ({ id, name: id, type, size: 3000, dragKg, priceSilver, level, mechKg });
const reels = [reel('a', 5, 1000), reel('b', 20, 8000, 20, 90), reel('c', 22, 9000, 20, 60), reel('d', 30, 50000, 40), reel('e', 18, null)];

test('рекомендует катушки нужного класса в бюджете и по уровню', () => {
  const r = recommend(reels, { budget: 10000, level: 25, type: 'spin', target: 'l' });
  assert.equal(r.status, 'ok');
  assert.ok(r.picks.every((p) => p.reel.priceSilver <= 10000 && p.reel.dragKg >= 17 && p.reel.dragKg < 26));
  assert.equal(r.picks[0].reel.id, 'b');
});
test('катушки только за золото (priceSilver null) не предлагаются', () => {
  const r = recommend(reels, { budget: 1e9, level: 99, type: 'spin', target: 'l' });
  assert.ok(r.picks.every((p) => p.reel.id !== 'e'));
});
test('fallback, когда класс не найден, и empty, когда ничего нет', () => {
  assert.equal(recommend(reels, { budget: 2000, level: 25, type: 'spin', target: 'x' }).status, 'fallback');
  assert.equal(recommend(reels, { budget: 10, level: 25, type: 'spin', target: 'l' }).status, 'empty');
  assert.equal(recommend(reels, { budget: 1e5, level: 25, type: 'multi', target: 'l' }).status, 'empty');
});
test('picks без повторов', () => {
  const r = recommend(reels, { budget: 10000, level: 25, type: 'spin', target: 'l' });
  assert.equal(new Set(r.picks.map((p) => p.reel.id)).size, r.picks.length);
});
test('lineDiameter по размерам', () => {
  assert.deepEqual([1000, 3000, 6000, 10000].map(lineDiameter), ['0,18', '0,24', '0,32', '0,56']);
});
