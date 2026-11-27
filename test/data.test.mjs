import test from 'node:test';
import assert from 'node:assert/strict';
import { readAll } from '../scripts/lib/data-io.mjs';
import { validate } from '../scripts/lib/validate.mjs';

test('реальные данные проходят проверку', async () => {
  assert.deepEqual(validate(await readAll()), []);
});

test('валидатор ловит типичные ошибки', async () => {
  const d = structuredClone(await readAll());
  d.spots[0].water = 'нет-такого';
  d.spots[1].coord = '12-34';
  d.spots[2].id = d.spots[3].id;
  d.reels[0].ratio = 99;
  d.rods[0].testMinG = d.rods[0].testMaxG + 1;
  d.meta.updatedAt = '29.10.2026';
  d.builds[0].sources = ['nope'];
  const text = validate(d).join('\n');
  for (const part of ['не найден', 'не в формате X:Y', 'повторяющийся id', 'ratio', 'testMinG', 'updatedAt', 'неизвестный источник']) {
    assert.ok(text.includes(part), `ожидалась ошибка «${part}»`);
  }
});
