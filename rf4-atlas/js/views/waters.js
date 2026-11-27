// Раздел «Водоёмы».
import { $ } from '../dom.js';
import { esc, kgFromGrams } from '../lib/format.js';
import { sourcesHtml, tierBars } from './shared.js';

export function mountWaters(data, { onShowSpots }) {
  const { waters, spots, sources } = data;
  const counts = new Map();
  for (const s of spots) counts.set(s.water, (counts.get(s.water) ?? 0) + 1);

  function card(w) {
    const n = counts.get(w.id) ?? 0;
    const rows = [];
    if (w.species) rows.push(['Видов рыбы', w.species]);
    if (w.recordG) rows.push(['Рекорд по статистике', kgFromGrams(w.recordG)]);
    rows.push(['Точек в справочнике', n]);
    return `<article class="card">
      <div class="spot-top">${tierBars(w.level)}<span class="water-tag">${w.level ? 'Открывается с уровня' : 'Уровень не указан'}</span></div>
      <h3>${esc(w.name)}</h3>
      ${w.level ? `<span class="lvl">Ур. ${w.level}</span>` : ''}
      <p class="water-summary">${esc(w.summary)}</p>
      ${w.history ? `<p class="hist"><b>История.</b> ${esc(w.history)}</p>` : ''}
      <dl>${rows.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
      ${n ? `<button type="button" class="mini" data-water="${esc(w.id)}">Показать точки</button>` : ''}
      <div class="src srcline">Источник: ${sourcesHtml(w.sources, sources)}</div>
    </article>`;
  }

  const list = $('#waterList');
  list.innerHTML = waters.map(card).join('');
  list.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-water]');
    if (btn) onShowSpots(btn.dataset.water);
  });
}
