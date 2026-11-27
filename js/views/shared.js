// Разметка, которая повторяется в нескольких разделах.
import { esc } from '../lib/format.js';
import { tierOf } from '../lib/filters.js';

export const TIER_NAMES = ['', 'Стартовый водоём', 'Средний уровень', 'Поздний уровень'];

export const STAR_ICON = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 3.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.8l6.1-.7z"/></svg>';
export const CROSS_ICON = '<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><circle cx="10" cy="10" r="5.5"/><path d="M10 1v5M10 14v5M1 10h5M14 10h5"/></svg>';

/** Три столбика уровня водоёма. */
export function tierBars(level) {
  const tier = tierOf(level);
  return `<span class="tier t${tier}" role="img" aria-label="${TIER_NAMES[tier]}" title="${TIER_NAMES[tier]}"><i></i><i></i><i></i></span>`;
}

/** Список источников со ссылками там, где адрес известен. */
export function sourcesHtml(ids, sources) {
  return ids
    .map((id) => {
      const src = sources[id];
      if (!src) return esc(id);
      return src.url
        ? `<a href="${esc(src.url)}" target="_blank" rel="noopener noreferrer">${esc(src.name)}</a>`
        : esc(src.name);
    })
    .join(', ');
}
