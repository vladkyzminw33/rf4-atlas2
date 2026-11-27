// Слияние новых точек со справочником: нормализация, дедупликация по водоём+рыба+координата.
const COORD = /^\d{1,4}:\d{1,4}$/;

const MAP = { а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'e',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'c',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya' };
export function slug(text) {
  return [...text.toLowerCase()].map((c) => MAP[c] ?? c).join('').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

const norm = (s) => (s ?? '').toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim();
export const dedupeKey = (s) => [s.water, norm(s.fish), s.coord ?? norm(s.place)].join('|');

/** Поле water в строке может быть id или названием водоёма. */
function resolveWater(value, waters) {
  const v = norm(value);
  return waters.find((w) => w.id === v || norm(w.name) === v)?.id ?? null;
}

/**
 * @returns {{added: object[], skipped: {row: number, reason: string}[]}}
 */
export function mergeSpots({ existing, rows, waters, sourceId }) {
  const keys = new Set(existing.map(dedupeKey));
  const ids = new Set(existing.map((s) => s.id));
  const added = [];
  const skipped = [];

  rows.forEach((row, index) => {
    const n = index + 1;
    const water = resolveWater(row.water, waters);
    if (!water) return skipped.push({ row: n, reason: `неизвестный водоём «${row.water ?? ''}»` });
    const coord = row.coord || null;
    const place = row.place || null;
    if (coord && !COORD.test(coord)) return skipped.push({ row: n, reason: `координаты «${coord}» не в формате X:Y` });
    if (!coord && !place) return skipped.push({ row: n, reason: 'нет ни coord, ни place' });
    const spot = {
      id: '',
      water,
      fish: row.fish || null,
      coord,
      place: coord ? null : place,
      bait: row.bait || null,
      clip: row.clip || null,
      note: row.note || null,
      verified: !/^(0|false|нет|no)$/i.test(row.verified ?? ''),
      sources: [sourceId],
    };
    const key = dedupeKey(spot);
    if (keys.has(key)) return skipped.push({ row: n, reason: 'дубликат (тот же водоём, рыба и координата)' });
    let base = slug([water, spot.fish ?? 'ryba', coord ?? place].join(' '));
    let id = base, k = 2;
    while (ids.has(id)) id = `${base}-${k++}`;
    spot.id = id;
    ids.add(id); keys.add(key);
    added.push(spot);
  });
  return { added, skipped };
}
