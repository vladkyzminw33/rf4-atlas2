// Переносит проверенные кандидаты из data/inbox.json в справочник.
//   npm run promote -- --list            показать кандидатов
//   npm run promote -- --ids a,b,c       принять выбранные
//   npm run promote -- --reject a,b      выбросить выбранные
import { parseArgs } from 'node:util';
import { readAll, writeJson } from './lib/data-io.mjs';
import { validate } from './lib/validate.mjs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { DATA_DIR } from './lib/data-io.mjs';

const { values } = parseArgs({ options: { list: { type: 'boolean', default: false }, ids: { type: 'string' }, reject: { type: 'string' } } });
const inbox = JSON.parse(await readFile(path.join(DATA_DIR, 'inbox.json'), 'utf8').catch(() => '[]'));
const split = (s) => new Set((s ?? '').split(',').map((x) => x.trim()).filter(Boolean));

if (values.list || (!values.ids && !values.reject)) {
  for (const c of inbox) console.log(`${c.id}\n  ${c.water} · ${c.fish ?? 'рыба?'} · ${c.coord} · ${c.bait ?? 'наживка?'}\n  ${c.post}`);
  console.log(`Кандидатов: ${inbox.length}`);
  process.exit(0);
}

const accept = split(values.ids), reject = split(values.reject);
const data = await readAll();
const take = inbox.filter((c) => accept.has(c.id)).map(({ post, ...spot }) => ({ ...spot, note: spot.note ?? `Пост: ${post}`, verified: false }));
const next = { ...data, spots: [...data.spots, ...take] };
const errors = validate(next);
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
await writeJson('spots', next.spots);
await writeJson('inbox.json', inbox.filter((c) => !accept.has(c.id) && !reject.has(c.id)));
if (take.length) await writeJson('meta', { ...data.meta, updatedAt: new Date().toISOString().slice(0, 10) });
console.log(`Принято: ${take.length}, отклонено: ${reject.size}. Остаётся в очереди: ${inbox.length - take.length - [...reject].filter((id) => inbox.some((c) => c.id === id)).length}.`);
