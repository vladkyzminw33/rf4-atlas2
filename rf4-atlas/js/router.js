// Вкладки с ARIA-ролями, управлением стрелками и маршрутизацией через #hash.
import { $, $$ } from './dom.js';

export function initRouter(defaultView = 'spots') {
  const tabs = $$('.tab[data-view]');
  const views = tabs.map((t) => t.dataset.view);

  function show(view, { focus = false, updateHash = true } = {}) {
    if (!views.includes(view)) view = defaultView;
    for (const tab of tabs) {
      const on = tab.dataset.view === view;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      $(`#v-${tab.dataset.view}`).hidden = !on;
      if (on && focus) tab.focus();
    }
    if (updateHash && location.hash.slice(1) !== view) history.replaceState(null, '', `#${view}`);
  }

  $('.tabs').addEventListener('click', (event) => {
    const tab = event.target.closest('.tab');
    if (tab) show(tab.dataset.view);
  });
  $('.tabs').addEventListener('keydown', (event) => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    let next = null;
    if (step) next = (i + step + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    if (next === null) return;
    event.preventDefault();
    show(tabs[next].dataset.view, { focus: true });
  });
  window.addEventListener('hashchange', () => show(location.hash.slice(1), { updateHash: false }));

  show(location.hash.slice(1), { updateHash: false });
  return { show };
}
