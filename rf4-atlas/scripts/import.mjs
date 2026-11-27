// Импорт точек из CSV или JSON. Использовать только с данными, на которые у вас есть право:
// свои записи, выгрузки по разрешению авторов, открытые лицензии.
//   npm run import -- --file spots.csv --source my-notes [--dry-run]
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { parseCsv } from './lib/csv.mjs';
import { readAll, writeJson } from './lib/data-io.mjs';
import { mergeSpots } from './lib/merge.mjs';
import { validate } from './lib/validate.mjs';

const { values } = parseArgs({ options: { file: { type: 'string' }, source: { type: 'string' }, 'dry-run': { type: 'boolean', default: false } } });
if (!values.file || !values.source) {
  console.error('Использование: npm run import -- --file <spots.csv|spots.json> --source <id источника> [--dry-run]');
  process.exit(2);
}

const data = await readAll();
if (!(values.source in data.sources)) {
  console.error(`Источник «${values.source}» не описан в data/sources.json. Добавьте его туда (name, url) и повторите.`);
  process.exit(2);
}

const text = await readFile(values.file, 'utf8');
const rows = path.extname(values.file).toLowerCase() === '.json' ? JSON.parse(text) : parseCsv(text);
if (!Array.isArray(rows)) { console.error('JSON должен быть массивом объектов.'); process.exit(2); }

const { added, skipped } = mergeSpots({ existing: data.spots, rows, waters: data.waters, sourceId: values.source });
const next = { ...data, spots: [...data.spots, ...added] };
const errors = validate(next);
if (errors.length) {
  console.error('После слияния данные не прошли проверку, ничего не записано:');
  for (const e of errors) console.error(' - ' + e);
  process.exit(1);
}

console.log(`Строк: ${rows.length}. Добавлено: ${added.length}. Пропущено: ${skipped.length}.`);
for (const s of skipped) console.log(`  строка ${s.row}: ${s.reason}`);
if (values['dry-run'] || !added.length) { console.log(values['dry-run'] ? 'Пробный запуск, файлы не менялись.' : 'Менять нечего.'); process.exit(0); }

await writeJson('spots', next.spots);
await writeJson('meta', { ...data.meta, updatedAt: new Date().toISOString().slice(0, 10) });
console.log('Готово: data/spots.json и data/meta.json обновлены. Запустите npm run check.');
