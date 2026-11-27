// Сборка для публикации: копирует только файлы сайта в dist/ и подставляет версию кеша из meta.updatedAt.
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { DATA_DIR, ROOT, readAll } from './lib/data-io.mjs';
import { validate } from './lib/validate.mjs';

const data = await readAll();
const errors = validate(data);
if (errors.length) { console.error('Сборка остановлена, данные не прошли проверку:\n - ' + errors.join('\n - ')); process.exit(1); }

const dist = path.join(ROOT, 'dist');
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
for (const dir of ['css', 'js', 'data']) await cp(path.join(ROOT, dir), path.join(dist, dir), { recursive: true });

const version = data.meta.updatedAt.replaceAll('-', '');
const html = (await readFile(path.join(ROOT, 'index.html'), 'utf8')).replaceAll('?v=dev', `?v=${version}`);
await writeFile(path.join(dist, 'index.html'), html);
await writeFile(path.join(dist, '.nojekyll'), '');
const count = (await readdir(dist, { recursive: true })).length;
console.log(`dist/ готов: ${count} элементов, версия ${version}. Данные: ${DATA_DIR}`);
