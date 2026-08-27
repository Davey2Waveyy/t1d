import '@testing-library/jest-dom/vitest';

// Node 25 exposes an incomplete native localStorage unless a persistence
// file is configured. Vitest's jsdom tests need the browser contract only,
// so provide a deterministic in-memory implementation when that native
// object shadows jsdom's Storage API.
if (typeof globalThis.localStorage?.clear !== 'function') {
  const values = new Map();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key) => (values.has(String(key)) ? values.get(String(key)) : null),
      setItem: (key, value) => values.set(String(key), String(value)),
      removeItem: (key) => values.delete(String(key)),
      clear: () => values.clear(),
      key: (index) => [...values.keys()][index] ?? null,
      get length() { return values.size; },
    },
  });
}
