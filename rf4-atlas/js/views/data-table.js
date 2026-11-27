// Сортируемая таблица. Заголовки это кнопки, поэтому сортировка доступна с клавиатуры,
// а текущее направление объявляется через aria-sort.
import { esc } from '../lib/format.js';
import { sortRows } from '../lib/sort.js';

/**
 * @param {HTMLTableElement} table
 * @param {{
 *   columns: {key: string, label: string, cell: (row: object) => string, firstDir?: 1|-1}[],
 *   getRows: () => object[],
 *   sort: {key: string, dir: 1|-1}
 * }} options
 */
export function createDataTable(table, { columns, getRows, sort }) {
  const state = { ...sort };

  function head() {
    const cells = columns
      .map((c) => {
        const aria = c.key === state.key ? (state.dir < 0 ? 'descending' : 'ascending') : 'none';
        return `<th scope="col" aria-sort="${aria}"><button type="button" class="th-btn" data-key="${esc(c.key)}">${esc(c.label)}</button></th>`;
      })
      .join('');
    return `<thead><tr>${cells}</tr></thead>`;
  }

  function render() {
    const rows = sortRows(getRows(), state.key, state.dir);
    const body = rows.map((row) => `<tr>${columns.map((c) => `<td>${c.cell(row)}</td>`).join('')}</tr>`).join('');
    table.innerHTML = `${head()}<tbody>${body}</tbody>`;
    return rows.length;
  }

  table.addEventListener('click', (event) => {
    const btn = event.target.closest('.th-btn');
    if (!btn) return;
    const key = btn.dataset.key;
    if (key === state.key) {
      state.dir = -state.dir;
    } else {
      state.key = key;
      state.dir = columns.find((c) => c.key === key)?.firstDir ?? -1;
    }
    render();
    table.querySelector(`.th-btn[data-key="${CSS.escape(key)}"]`)?.focus();
  });

  return { render };
}
