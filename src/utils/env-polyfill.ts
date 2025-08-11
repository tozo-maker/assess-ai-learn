
// Polyfill to ensure process.env.NODE_ENV is available in Vite runtime
// without touching build config. This enables existing checks across the app.

declare global {
  interface Window { process?: any }
}

if (typeof window !== 'undefined') {
  const w = window as any;
  w.process = w.process || {};
  w.process.env = w.process.env || {};
  if (!w.process.env.NODE_ENV) {
    w.process.env.NODE_ENV = import.meta.env.MODE;
  }
}
