import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv } from '../scripts/lib/csv.mjs';
import { mergeSpots, slug } from '../scripts/lib/merge.mjs';

test('parseCsv: кавычки, запятые внутри поля, BOM, ; как разделитель', () => {
  const rows = parseCsv('﻿water,fish,bait\r\n"Белое","Щука, трофей","воблер ""Х"""\r\n');
  assert.deepEqual(rows, [{ water: 'Белое', fish: 'Щука, трофей', bait: 'воблер "Х"' }]);
  assert.equal(parseCsv('a;b\n1;2')[0].b, '2');
  assert.throws(() => parseCsv('a\n"oops'), /кавычка/);
});

const waters = [{ id: 'beloe', name: 'Белое' }, { id: 'medvezhe', name: 'Медвежье' }];
const existing = [{ id: 'beloe-schuka-1-2', water: 'beloe', fish: 'Щука', coord: '1:2', place: null }];

test('mergeSpots: нормализация, дедупликация, причины пропуска', () => {
  const rows = [
    { water: 'белое', fish: 'щука', coord: '1:2' },
    { water: 'Белое', fish: 'Карп', coord: '5:6', bait: 'кукуруза', verified: 'нет' },
    { water: 'Нет такого', fish: 'Язь', coord: '1:1' },
    { water: 'Медвежье', fish: 'Лещ', coord: 'abc' },
    { water: 'Медвежье', fish: 'Лещ' },
    { water: 'Медвежье', fish: 'Лещ', place: 'у коряги' },
    { water: 'Медвежье', fish: 'Лещ', place: 'у коряги' },
  ];
  const { added, skipped } = mergeSpots({ existing, rows, waters, sourceId: 'mine' });
  assert.equal(added.length, 2);
  assert.equal(added[0].verified, false);
  assert.deepEqual(added[0].sources, ['mine']);
  assert.equal(added[1].coord, null);
  assert.equal(skipped.length, 5);
  assert.match(skipped[0].reason, /дубликат/);
  assert.equal(new Set([...existing, ...added].map((s) => s.id)).size, 3);
});
test('slug транслитерирует', () => assert.equal(slug('Щука (трофей) 21:67'), 'schuka-trofey-21-67'));
