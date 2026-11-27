// Чистые функции форматирования. Без доступа к DOM, поэтому их можно тестировать в Node.

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Экранирует строку для вставки в HTML-текст или в значение атрибута. */
export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

/** Число в русском формате: 1 234,5 */
export function fmt(n, digits = 1) {
  return n.toLocaleString('ru-RU', { maximumFractionDigits: digits });
}

/** Как fmt, но для null возвращает длинное тире. */
export function fmtOrDash(n, digits = 1) {
  return n == null ? '—' : fmt(n, digits);
}

/** Граммы в килограммы: 885308 -> «885,3 кг» */
export function kgFromGrams(g) {
  return `${fmt(g / 1000, 1)} кг`;
}

/** Русское склонение: plural(2, 'точка', 'точки', 'точек') -> 'точки' */
export function plural(n, one, few, many) {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return many;
  if (last > 1 && last < 5) return few;
  if (last === 1) return one;
  return many;
}

/** '2026-10-29' -> '29.10.2026'. Некорректную строку возвращает как есть. */
export function formatIsoDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '');
  return m ? `${m[3]}.${m[2]}.${m[1]}` : String(iso ?? '');
}
