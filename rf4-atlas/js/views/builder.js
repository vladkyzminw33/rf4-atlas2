// Раздел «Сборка по бюджету»: форма и вывод рекомендаций из lib/builder.js.
import { $ } from '../dom.js';
import { esc, fmt, fmtOrDash } from '../lib/format.js';
import { lineDiameter, recommend } from '../lib/builder.js';

export function mountBuilder(data) {
  const { reels } = data;
  const number = $('#bBudget');
  const range = $('#bBudgetR');
  const out = $('#buildOut');

  function pickHtml({ reel, label }, index, budget) {
    const line = reel.type === 'spin'
      ? `Леска диаметром около ${lineDiameter(reel.size)} мм`
      : 'Шнур или леска с запасом по толщине, мультипликатор тянет сильнее';
    return `<article class="rec${index === 0 ? ' first' : ''}">
      <div class="top"><h3>${esc(reel.name)}</h3><span class="tag${index === 0 ? '' : ' alt'}">${label}</span></div>
      <dl>
        <dt>Фрикцион</dt><dd>${fmt(reel.dragKg)} кг</dd>
        <dt>Механизм</dt><dd>${fmtOrDash(reel.mechKg, 2)} кг</dd>
        <dt>Цена</dt><dd>${fmtOrDash(reel.priceSilver, 0)} серебра, уровень ${reel.level ?? '—'}</dd>
        <dt>Остаток бюджета</dt><dd>${fmt(budget - reel.priceSilver, 0)} серебра на удилище и леску</dd>
      </dl>
      <div class="warn">К этой катушке: леска или шнур с разрывной нагрузкой около ${fmt(reel.dragKg)} кг, чтобы тормоз срабатывал раньше обрыва. ${line}.</div>
    </article>`;
  }

  function render() {
    const budget = Math.max(0, Number(number.value) || 0);
    const level = Math.max(1, Number($('#bLevel').value) || 1);
    const result = recommend(reels, { budget, level, type: $('#bType').value, target: $('#bTarget').value });

    if (result.status === 'empty') {
      out.innerHTML = '<div class="empty">В этот бюджет и уровень ничего не попало. Увеличьте бюджет или уровень. Катушки, которые продаются только за золото, помощник не предлагает.</div>';
      return;
    }
    const note = result.status === 'fallback'
      ? '<p class="warn">Под выбранную цель в бюджет ничего не подходит. Ниже самые сильные катушки из доступных, это компромисс.</p>'
      : '';
    out.innerHTML = note + result.picks.map((p, i) => pickHtml(p, i, budget)).join('') +
      '<p class="warn">Диапазоны фрикциона по классам рыбы взяты как ориентир из практики игроков. Для рекордной рыбы проверяйте точку и снасть по постам из раздела «Точки и наживка».</p>';
  }

  number.addEventListener('input', () => { range.value = number.value; render(); });
  range.addEventListener('input', () => { number.value = range.value; render(); });
  for (const id of ['#bLevel', '#bType', '#bTarget']) $(id).addEventListener('input', render);
  render();
}
