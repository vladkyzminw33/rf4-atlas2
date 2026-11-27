// Проверка данных. Чистая функция: принимает объект с массивами и возвращает список ошибок.
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const COORD = /^\d{1,4}:\d{1,4}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
const isNullOrNum = (v) => v === null || isNum(v);

export function validate({ meta, sources, waters, spots, reels, rods, builds }) {
  const errors = [];
  const err = (where, msg) => errors.push(`${where}: ${msg}`);

  if (!meta || meta.schemaVersion !== 1) err('meta', 'schemaVersion должен быть 1');
  if (!meta || !DATE.test(meta.updatedAt ?? '') || Number.isNaN(Date.parse(meta.updatedAt))) err('meta', 'updatedAt должен быть датой ГГГГ-ММ-ДД');

  for (const [id, s] of Object.entries(sources ?? {})) {
    if (!s.name) err(`sources.${id}`, 'нет name');
    if (s.url !== null && !/^https:\/\//.test(s.url ?? '')) err(`sources.${id}`, 'url должен быть null или начинаться с https://');
  }
  const known = (ids) => Array.isArray(ids) && ids.length > 0 && ids.every((i) => i in (sources ?? {}));

  const unique = (name, rows) => {
    const seen = new Set();
    rows.forEach((r, i) => {
      if (typeof r.id !== 'string' || !ID.test(r.id)) err(`${name}[${i}]`, `некорректный id «${r.id}»`);
      else if (seen.has(r.id)) err(`${name}[${i}]`, `повторяющийся id «${r.id}»`);
      seen.add(r.id);
    });
    return seen;
  };

  const waterIds = unique('waters', waters);
  waters.forEach((w, i) => {
    const at = `waters[${w.id ?? i}]`;
    if (!w.name) err(at, 'нет name');
    if (w.level !== null && !(Number.isInteger(w.level) && w.level >= 1 && w.level <= 60)) err(at, 'level должен быть 1-60 или null');
    if (!isNullOrNum(w.species) || !isNullOrNum(w.recordG)) err(at, 'species и recordG должны быть числами или null');
    if (!w.summary) err(at, 'нет summary');
    if (!known(w.sources)) err(at, 'неизвестный источник');
  });

  unique('spots', spots);
  spots.forEach((s, i) => {
    const at = `spots[${s.id ?? i}]`;
    if (!waterIds.has(s.water)) err(at, `водоём «${s.water}» не найден`);
    const hasCoord = typeof s.coord === 'string' && COORD.test(s.coord);
    const hasPlace = typeof s.place === 'string' && s.place.length > 0;
    if (hasCoord === hasPlace) err(at, 'нужно ровно одно из полей coord (X:Y) или place');
    if (s.coord != null && !hasCoord) err(at, `координаты «${s.coord}» не в формате X:Y`);
    if (typeof s.verified !== 'boolean') err(at, 'verified должен быть true или false');
    if (!known(s.sources)) err(at, 'неизвестный источник');
  });

  unique('reels', reels);
  reels.forEach((r, i) => {
    const at = `reels[${r.id ?? i}]`;
    if (!r.name) err(at, 'нет name');
    if (!['spin', 'multi'].includes(r.type)) err(at, 'type: spin или multi');
    for (const k of ['size', 'dragKg']) if (!isNum(r[k]) || r[k] <= 0) err(at, `${k} должно быть положительным числом`);
    for (const k of ['testG', 'ratio', 'speed', 'mechKg', 'level', 'priceSilver', 'priceGold']) {
      if (!isNullOrNum(r[k]) || (r[k] !== null && r[k] < 0)) err(at, `${k} должно быть числом >= 0 или null`);
    }
    if (r.ratio != null && r.ratio > 12) err(at, 'ratio выглядит неправдоподобно');
  });

  unique('rods', rods);
  rods.forEach((r, i) => {
    const at = `rods[${r.id ?? i}]`;
    if (!r.name) err(at, 'нет name');
    if (!isNum(r.testMinG) || !isNum(r.testMaxG) || r.testMinG > r.testMaxG) err(at, 'testMinG должен быть <= testMaxG');
    if (!isNum(r.lengthM) || r.lengthM <= 0) err(at, 'lengthM должно быть положительным');
  });

  unique('builds', builds);
  builds.forEach((b, i) => {
    const at = `builds[${b.id ?? i}]`;
    for (const k of ['title', 'purpose', 'rod', 'reel', 'line', 'leader', 'lures']) if (!b[k]) err(at, `нет ${k}`);
    if (!known(b.sources)) err(at, 'неизвестный источник');
  });

  return errors;
}
