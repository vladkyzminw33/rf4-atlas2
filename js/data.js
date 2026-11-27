// Загрузка данных из data/*.json. Каждый файл проверяется на HTTP-статус и на формат,
// а ошибка поднимается наверх, чтобы страница показала понятное сообщение.

const FILES = ['meta', 'sources', 'waters', 'spots', 'reels', 'rods', 'builds'];
const ARRAYS = new Set(['waters', 'spots', 'reels', 'rods', 'builds']);

async function fetchJson(name, base) {
  const response = await fetch(`${base}${name}.json`);
  if (!response.ok) throw new Error(`${name}.json: HTTP ${response.status}`);
  let json;
  try {
    json = await response.json();
  } catch {
    throw new Error(`${name}.json: файл не является корректным JSON`);
  }
  if (ARRAYS.has(name) && !Array.isArray(json)) throw new Error(`${name}.json: ожидался массив`);
  return json;
}

/** Загружает все файлы параллельно и строит справочник водоёмов по id. */
export async function loadData(base = 'data/') {
  const entries = await Promise.all(FILES.map(async (name) => [name, await fetchJson(name, base)]));
  const data = Object.fromEntries(entries);
  data.waterById = new Map(data.waters.map((w) => [w.id, w]));
  return data;
}
