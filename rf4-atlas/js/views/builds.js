// Раздел «Готовые сборки».
import { $ } from '../dom.js';
import { esc, plural } from '../lib/format.js';
import { sourcesHtml } from './shared.js';

export function mountBuilds(data) {
  const { builds, sources } = data;
  const input = $('#buildQ');

  function card(b) {
    return `<article class="card">
      <div><div class="water-tag">${esc(b.purpose)}</div><h3>${esc(b.title)}</h3></div>
      <dl>
        <dt>Удилище</dt><dd>${esc(b.rod)}</dd>
        <dt>Катушка</dt><dd>${esc(b.reel)}</dd>
        <dt>Леска</dt><dd>${esc(b.line)}</dd>
        <dt>Поводок</dt><dd>${esc(b.leader)}</dd>
        <dt>Приманки</dt><dd>${esc(b.lures)}</dd>
      </dl>
      <div class="src srcline">Источник: ${sourcesHtml(b.sources, sources)}</div>
    </article>`;
  }

  function render() {
    const q = input.value.trim().toLowerCase();
    const found = builds.filter((b) => !q || [b.title, b.purpose, b.rod, b.reel, b.line, b.leader, b.lures].join(' ').toLowerCase().includes(q));
    $('#buildCount').textContent = `${found.length} ${plural(found.length, 'сборка', 'сборки', 'сборок')}`;
    $('#buildList').innerHTML = found.length ? found.map(card).join('') : '<div class="empty">Ничего не найдено. Попробуйте другое слово.</div>';
  }

  input.addEventListener('input', render);
  render();
}
