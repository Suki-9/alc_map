export const store = {
  set: (key: string, value: string) => localStorage.setItem(key, value),
  get: (key: string) => localStorage.getItem(key),
  del: (key: string) => localStorage.removeItem(key),
  clear: () => localStorage.clear(),
};