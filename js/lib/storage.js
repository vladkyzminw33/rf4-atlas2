// Безопасная обёртка над localStorage. В приватном режиме или при заблокированных
// данных сайта доступ может бросать исключение, поэтому страница не должна на него полагаться.

export const storage = {
  get(key, fallback = null) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
};
