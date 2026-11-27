// Раздел «Удилища».
import { $, $$ } from '../dom.js';
import { esc, fmt, fmtOrDash, plural } from '../lib/format.js';
import { createDataTable } from './data-table.js';

const TYPE_LABELS = { bolognese: 'Болонское', jerk: 'Джерковое' };

export function mountRods(data) {
  const { rods } = data;
  let type = '';

  const columns = [
    { key: 'name', label: 'Название', firstDir: 1, cell: (r) => esc(r.name) },
    { key: 'type', label: 'Тип', firstDir: 1, cell: (r) => TYPE_LABELS[r.type] ?? esc(r.type) },
    { key: 'lengthM', label: 'Длина, м', cell: (r) => fmt(r.lengthM) },
    { key: 'testMinG', label: 'Тест, г', cell: (r) => `${r.testMinG}-${r.testMaxG}` },
    { key: 'action', label: 'Строй', firstDir: 1, cell: (r) => esc(r.action) },
    { key: 'strengthKg', label: 'Прочность, кг', cell: (r) => fmt(r.strengthKg) },
    { key: 'level', label: 'Ур.', cell: (r) => r.level ?? '—' },
    { key: 'priceSilver', label: 'Серебро', cell: (r) => fmtOrDash(r.priceSilver, 0) },
    { key: 'priceGold', label: 'Золото', cell: (r) => fmtOrDash(r.priceGold, 2) },
  ];

  const rows = () => {
    const q = $('#rodQ').value.trim().toLowerCase();
    return rods.filter((r) => (!type || r.type === type) && (!q || r.name.toLowerCase().includes(q)));
  };
  const table = createDataTable($('#rodTable'), { columns, getRows: rows, sort: { key: 'level', dir: -1 } });

  function render() {
    const n = table.render();
    $('#rodCount').textContent = `${n} ${plural(n, 'удилище', 'удилища', 'удилищ')}`;
  }

  $('#rodType').addEventListener('click', (event) => {
    const btn = event.target.closest('.chip');
    if (!btn) return;
    type = btn.dataset.type;
    for (const c of $$('#rodType .chip')) c.setAttribute('aria-pressed', String(c === btn));
    render();
  });
  $('#rodQ').addEventListener('input', render);
  render();
}
