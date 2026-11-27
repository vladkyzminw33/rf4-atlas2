const collator = new Intl.Collator('ru');

/**
 * Сортирует копию массива по ключу. Пустые значения (null, undefined) всегда
 * идут в конец, в каком бы направлении ни шла сортировка.
 * @param {object[]} rows
 * @param {string} key
 * @param {1|-1} dir 1 по возрастанию, -1 по убыванию
 */
export function sortRows(rows, key, dir = 1) {
  return [...rows].sort((a, b) => {
    const x = a[key];
    const y = b[key];
    if (x == null && y == null) return 0;
    if (x == null) return 1;
    if (y == null) return -1;
    const cmp = typeof x === 'string' ? collator.compare(x, y) : x - y;
    return cmp * dir;
  });
}
