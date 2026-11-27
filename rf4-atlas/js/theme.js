// Переключатель светлой и ночной темы. Выбор хранится в localStorage, по умолчанию берётся системная тема.
import { $ } from './dom.js';
import { storage } from './lib/storage.js';

const KEY = 'rf4atlas:theme';
const root = document.documentElement;
const media = matchMedia('(prefers-color-scheme: dark)');

export const isDark = () => (root.dataset.theme ? root.dataset.theme === 'dark' : media.matches);

export function initTheme(onChange = () => {}) {
  const btn = $('#themeBtn');
  const saved = storage.get(KEY, null);
  if (saved === 'light' || saved === 'dark') root.dataset.theme = saved;

  const sync = () => {
    btn.textContent = isDark() ? 'Дневной режим' : 'Ночной режим';
    btn.setAttribute('aria-pressed', String(isDark()));
    onChange();
  };
  btn.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    root.dataset.theme = next;
    storage.set(KEY, next);
    sync();
  });
  media.addEventListener('change', sync);
  sync();
}
