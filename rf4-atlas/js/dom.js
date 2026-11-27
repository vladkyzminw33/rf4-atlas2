// Мелкие DOM-помощники, общие для всех разделов.

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

/**
 * Копирует текст в буфер обмена и на секунду меняет подпись кнопки.
 * Если Clipboard API недоступен (встроенные окна, старые приложения), использует запасной вариант.
 */
export function copyText(text, button, doneLabel = 'Скопировано') {
  const label = button.dataset.label ?? (button.dataset.label = button.textContent);
  const flash = (message) => {
    button.textContent = message;
    setTimeout(() => { button.textContent = label; }, 1400);
  };
  const fallback = () => {
    const area = document.createElement('textarea');
    area.className = 'copy-shim';
    area.value = text;
    area.setAttribute('readonly', '');
    document.body.append(area);
    area.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { /* ничего */ }
    area.remove();
    flash(ok ? doneLabel : 'Не получилось');
  };
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(() => flash(doneLabel), fallback);
  } else {
    fallback();
  }
}
