
const CACHE_NAME = 'learnspark-ai-v1';
const STATIC_CACHE_NAME = 'learnspark-static-v1';

// Minimal static assets to prevent cache errors
const STATIC_ASSETS = [
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then(cache => {
      // Only cache essential assets to prevent errors
      return cache.addAll(STATIC_ASSETS).catch(error => {
        console.warn('Failed to cache some assets:', error);
        return Promise.resolve(); // Don't fail installation
      });
    }).then(() => {
      console.log('Service Worker installed');
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Minimal fetch handling to prevent errors
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Only handle favicon to prevent API interference
  if (request.url.includes('favicon.ico')) {
    event.respondWith(
      caches.match(request).then(response => {
        return response || fetch(request);
      })
    );
  }
  
  // Let all other requests pass through normally
});
