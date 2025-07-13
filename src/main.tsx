
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { productionLogger } from '@/services/production-logger'

// Register service worker for basic caching only
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      productionLogger.info('Service Worker registered for caching');
    } catch (error) {
      productionLogger.warn('Service Worker registration failed', { error: error as Error });
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
