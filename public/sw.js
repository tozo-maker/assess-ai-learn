// Minimal Service Worker for LearnSpark AI
// Provides basic offline support and caching

const CACHE_NAME = 'learnspark-v1';
const STATIC_CACHE_URLS = [
  '/',
  '/app',
  '/auth/login',
  '/auth/signup'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_CACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip API calls and external resources
  if (event.request.url.includes('/api') || 
      event.request.url.includes('supabase.co') ||
      event.request.url.includes('chrome-extension')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request).catch(() => {
        // If both cache miss and network fail, return a basic offline page
        if (event.request.mode === 'navigate') {
          return new Response(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>LearnSpark AI - Offline</title>
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                body { font-family: system-ui, sans-serif; text-align: center; padding: 2rem; }
                .offline { max-width: 400px; margin: 0 auto; }
              </style>
            </head>
            <body>
              <div class="offline">
                <h1>You're offline</h1>
                <p>LearnSpark AI needs an internet connection to work properly.</p>
                <button onclick="location.reload()">Try again</button>
              </div>
            </body>
            </html>
          `, {
            headers: { 'Content-Type': 'text/html' }
          });
        }
      });
    })
  );
});