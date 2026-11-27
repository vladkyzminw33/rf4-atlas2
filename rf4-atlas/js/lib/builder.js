// Подбор катушки под бюджет. Чистая функция: данные на вход, рекомендации на выход.

/** Диапазоны фрикциона (кг) по классам рыбы. Это ориентир из практики игроков. */
export const TARGETS = {
  s: [0, 9],
  m: [9, 17],
  l: [17, 26],
  x: [26, Infinity],
};

/** Диаметр лески, который в игре идёт с катушкой данного размера. */
export function lineDiameter(size) {
  if (size <= 2000) return '0,18';
  if (size <= 4000) return '0,24';
  if (size <= 8000) return '0,32';
  return '0,56';
}

/**
 * @param {object[]} reels все катушки
 * @param {{budget: number, level: number, type: 'spin'|'multi', target: 's'|'m'|'l'|'x'}} params
 * @returns {{status: 'empty'|'fallback'|'ok', picks: {reel: object, label: string}[]}}
 */
export function recommend(reels, { budget, level, type, target }) {
  const [lo, hi] = TARGETS[target] ?? TARGETS.l;
  const pool = reels.filter(
    (r) => r.type === type && r.priceSilver != null && r.priceSilver <= budget && (r.level ?? 0) <= level,
  );
  if (!pool.length) return { status: 'empty', picks: [] };

  let fit = pool.filter((r) => r.dragKg >= lo && r.dragKg < hi);
  let status = 'ok';
  if (!fit.length) {
    fit = [...pool].sort((a, b) => b.dragKg - a.dragKg).slice(0, 3);
    status = 'fallback';
  }

  const best = [...fit].sort((a, b) => b.mechKg - a.mechKg || b.dragKg - a.dragKg)[0];
  const strong = [...fit].sort((a, b) => b.dragKg - a.dragKg || a.priceSilver - b.priceSilver)[0];
  const cheap = [...fit].sort((a, b) => a.priceSilver - b.priceSilver)[0];

  const picks = [];
  for (const [reel, label] of [
    [best, 'Самый прочный механизм'],
    [strong, 'Максимальный фрикцион'],
    [cheap, 'Самый дешёвый'],
  ]) {
    if (!picks.some((p) => p.reel.id === reel.id)) picks.push({ reel, label });
  }
  return { status, picks };
}
