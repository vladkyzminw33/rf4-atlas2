// Раздел «Катушки».
import { $, $$ } from '../dom.js';
import { esc, fmt, fmtOrDash, plural } from '../lib/format.js';
import { createDataTable } from './data-table.js';

export function mountReels(data) {
  const { reels } = data;
  let type = 'spin';

  const columns = [
    { key: 'name', label: 'Название', firstDir: 1, cell: (r) => esc(r.name) + (r.waterproof ? '<span class="badge">защита</span>' : '') },
    { key: 'size', label: 'Размер', cell: (r) => r.size },
    { key: 'testG', label: 'Тест, г', cell: (r) => fmt(r.testG) },
    { key: 'ratio', label: 'Пер. число', cell: (r) => fmt(r.ratio) },
    { key: 'speed', label: 'Скорость, м/с', cell: (r) => fmtOrDash(r.speed, 2) },
    { key: 'dragKg', label: 'Фрикцион, кг', cell: (r) => fmt(r.dragKg) },
    { key: 'mechKg', label: 'Мех., кг', cell: (r) => fmt(r.mechKg, 2) },
    { key: 'level', label: 'Ур.', cell: (r) => r.level ?? '—' },
    { key: 'priceSilver', label: 'Серебро', cell: (r) => fmtOrDash(r.priceSilver, 0) },
    { key: 'priceGold', label: 'Золото', cell: (r) => fmtOrDash(r.priceGold, 2) },
  ];

  const rows = () => {
    const size = $('#reelSize').value;
    const q = $('#reelQ').value.trim().toLowerCase();
    return reels.filter((r) => r.type === type && (!size || r.size === Number(size)) && (!q || r.name.toLowerCase().includes(q)));
  };

  const table = createDataTable($('#reelTable'), { columns, getRows: rows, sort: { key: 'dragKg', dir: -1 } });

  function fillSizes() {
    const sizes = [...new Set(reels.filter((r) => r.type === type).map((r) => r.size))].sort((a, b) => a - b);
    $('#reelSize').innerHTML = '<option value="">Все размеры</option>' + sizes.map((s) => `<option value="${s}">${s}</option>`).join('');
  }

  function render() {
    const n = table.render();
    $('#reelCount').textContent = `${n} ${plural(n, 'катушка', 'катушки', 'катушек')}`;
  }

  $('#reelType').addEventListener('click', (event) => {
    const btn = event.target.closest('.chip');
    if (!btn) return;
    type = btn.dataset.type;
    for (const c of $$('#reelType .chip')) c.setAttribute('aria-pressed', String(c === btn));
    fillSizes();
    render();
  });
  $('#reelSize').addEventListener('change', render);
  $('#reelQ').addEventListener('input', render);

  fillSizes();
  render();
}
