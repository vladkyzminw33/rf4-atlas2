// Чтение и запись data/*.json. Запись атомарная: сначала временный файл, потом rename.
import { readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const DATA_DIR = path.join(ROOT, 'data');
const NAMES = ['meta', 'sources', 'waters', 'spots', 'reels', 'rods', 'builds'];

export async function readAll(dir = DATA_DIR) {
  const entries = await Promise.all(NAMES.map(async (n) => [n, JSON.parse(await readFile(path.join(dir, `${n}.json`), 'utf8'))]));
  return Object.fromEntries(entries);
}

export async function writeJson(name, value, dir = DATA_DIR) {
  const file = path.join(dir, `${name}.json`);
  const tmp = `${file}.tmp`;
  await writeFile(tmp, JSON.stringify(value, null, 2) + '\n');
  await rename(tmp, file);
}
