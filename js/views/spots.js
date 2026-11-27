// Раздел «Точки клёва»: список, фильтры, избранное, строка для чата, случайная точка.
import { $, $$, copyText } from '../dom.js';
import { esc, plural } from '../lib/format.js';
import { filterSpots, lineFor, pickSpot } from '../lib/filters.js';
import { storage } from '../lib/storage.js';
import { CROSS_ICON, STAR_ICON, sourcesHtml, tierBars } from './shared.js';

const FAV_KEY = 'rf4atlas:favs';

export function mountSpots(data, { goTo }) {
  const { spots, waters, waterById, sources } = data;
  const select = $('#spotWater');
  const list = $('#spotList');
  const pickBox = $('#pick');
  const spotById = new Map(spots.map((s) => [s.id, s]));
  const stored = storage.get(FAV_KEY, []);
  const favs = new Set(Array.isArray(stored) ? stored.filter((id) => spotById.has(id)) : []);
  let favOnly = false;
  let shown = [];
  let lastPick = null;

  const waterName = (id) => waterById.get(id)?.name ?? id;

  // Водоёмы, у которых есть точки, в порядке открытия.
  const counts = new Map();
  for (const s of spots) counts.set(s.water, (counts.get(s.water) ?? 0) + 1);
  select.innerHTML =
    `<option value="">Все водоёмы (${spots.length})</option>` +
    waters
      .filter((w) => counts.has(w.id))
      .map((w) => `<option value="${esc(w.id)}">${esc(w.name)} (${counts.get(w.id)})</option>`)
      .join('');

  function card(s) {
    const fav = favs.has(s.id);
    const rows = [];
    if (s.bait) rows.push(['Наживка', s.bait]);
    if (s.clip) rows.push(['Клипса', s.clip]);
    if (s.note) rows.push(['Заметка', s.note]);
    if (!rows.length) rows.push(['Наживка', 'Автор не указал']);
    const stamp = s.coord
      ? `<span class="coord">${CROSS_ICON}<span>${esc(s.coord)}</span></span>
         <button type="button" class="mini" data-copy="${esc(s.coord)}">Копировать</button>`
      : `<span class="coord coord-text">${esc(s.place)}</span>`;
    return `<article class="card spot" data-id="${esc(s.id)}">
      <div class="spot-top">${tierBars(waterById.get(s.water)?.level)}
        <span class="water-tag">${esc(waterName(s.water))}</span>
        ${s.verified ? '' : '<span class="badge badge-warn" title="Эту точку не подтвердили игроки">не подтверждено</span>'}
        <button type="button" class="fav" data-fav="${esc(s.id)}" aria-pressed="${fav}" aria-label="В избранное">${STAR_ICON}</button>
      </div>
      <h3>${esc(s.fish ?? 'Рыба не указана')}</h3>
      <div class="coordrow">${stamp}<button type="button" class="mini" data-chat="${esc(s.id)}">В чат</button></div>
      <dl>${rows.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
      <div class="src srcline">Источник: ${sourcesHtml(s.sources, sources)}</div>
    </article>`;
  }

  function render() {
    shown = filterSpots(spots, { water: select.value, query: $('#spotQ').value, favs, favOnly });
    $('#spotCount').textContent = `Найдено: ${shown.length} ${plural(shown.length, 'точка', 'точки', 'точек')}`;
    list.innerHTML = shown.length
      ? shown.map(card).join('')
      : `<div class="empty">${favOnly
          ? 'В избранном пока пусто. Нажмите звёздочку на карточке точки.'
          : 'Ничего не найдено. Попробуйте другое слово или выберите все водоёмы.'}</div>`;
  }

  select.addEventListener('change', render);
  $('#spotQ').addEventListener('input', render);
  $('#favOnly').addEventListener('click', (event) => {
    favOnly = !favOnly;
    event.currentTarget.setAttribute('aria-pressed', String(favOnly));
    render();
  });

  list.addEventListener('click', (event) => {
    const btn = event.target.closest('button');
    if (!btn) return;
    if (btn.dataset.copy) {
      copyText(btn.dataset.copy, btn);
    } else if (btn.dataset.chat) {
      const s = spotById.get(btn.dataset.chat);
      if (s) copyText(lineFor(s, waterName(s.water)), btn);
    } else if (btn.dataset.fav) {
      const id = btn.dataset.fav;
      const had = favs.delete(id);
      if (!had) favs.add(id);
      storage.set(FAV_KEY, [...favs]);
      btn.setAttribute('aria-pressed', String(!had));
      if (favOnly) render();
    }
  });

  function pick() {
    const spot = pickSpot(shown.length ? shown : spots, lastPick);
    if (!spot) return;
    lastPick = spot;
    goTo('spots');
    const notes = [];
    if (spot.bait) notes.push(`Наживка: ${spot.bait}`);
    if (spot.clip) notes.push(`клипса ${spot.clip}`);
    if (spot.note) notes.push(spot.note);
    pickBox.hidden = false;
    pickBox.dataset.id = spot.id;
    pickBox.innerHTML = `<div>
        <div class="eyebrow">Сегодня идём</div>
        <div class="pick-main"><em>${esc(waterName(spot.water))}</em> · ${esc(spot.fish ?? 'Рыба не указана')}</div>
        <div class="pick-sub">${esc(notes.join('. ') || 'Наживку автор не указал')}</div>
      </div>
      <div class="pick-act">
        <span class="coord">${spot.coord ? `${CROSS_ICON}<span>${esc(spot.coord)}</span>` : esc(spot.place)}</span>
        <button type="button" class="btn small" data-act="copy">Для чата</button>
        <button type="button" class="btn small primary" data-act="again">Ещё раз</button>
        <button type="button" class="mini" data-act="close">Закрыть</button>
      </div>`;
    pickBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    for (const el of $$('.spot', list)) {
      el.classList.remove('flash');
      if (el.dataset.id === spot.id) {
        void el.offsetWidth; // перезапуск анимации
        el.classList.add('flash');
      }
    }
  }

  pickBox.addEventListener('click', (event) => {
    const btn = event.target.closest('button');
    if (!btn) return;
    if (btn.dataset.act === 'again') pick();
    else if (btn.dataset.act === 'close') pickBox.hidden = true;
    else if (btn.dataset.act === 'copy') {
      const s = spotById.get(pickBox.dataset.id);
      if (s) copyText(lineFor(s, waterName(s.water)), btn);
    }
  });
  $('#rollBtn').addEventListener('click', pick);
  $('#rollBtn2').addEventListener('click', pick);

  render();
  return { filterByWater(id) { select.value = id; render(); } };
}
