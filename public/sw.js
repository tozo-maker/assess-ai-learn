
const CACHE_NAME = 'learnspark-ai-v1';
const STATIC_CACHE_NAME = 'learnspark-static-v1';
const API_CACHE_NAME = 'learnspark-api-v1';

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/app',
  '/app/dashboard',
  '/favicon.ico',
  '/manifest.json'
];

// API endpoints to cache with different strategies
const API_CACHE_PATTERNS = [
  { pattern: /\/api\/students/, strategy: 'cache-first', ttl: 2 * 60 * 1000 },
  { pattern: /\/api\/skills/, strategy: 'cache-first', ttl: 10 * 60 * 1000 },
  { pattern: /\/api\/assessments/, strategy: 'network-first', ttl: 5 * 60 * 1000 },
  { pattern: /\/api\/insights/, strategy: 'network-first', ttl: 1 * 60 * 1000 }
];

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then(cache => {
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(API_CACHE_NAME)
    ]).then(() => {
      console.log('Service Worker installed and caches created');
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all pages
      self.clients.claim()
    ]).then(() => {
      console.log('Service Worker activated');
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle static assets
  if (STATIC_ASSETS.some(asset => url.pathname === asset || url.pathname.startsWith(asset))) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE_NAME));
    return;
  }

  // Handle API requests
  const apiPattern = API_CACHE_PATTERNS.find(pattern => pattern.pattern.test(url.pathname));
  if (apiPattern) {
    if (apiPattern.strategy === 'cache-first') {
      event.respondWith(cacheFirstWithTTL(request, API_CACHE_NAME, apiPattern.ttl));
    } else if (apiPattern.strategy === 'network-first') {
      event.respondWith(networkFirstWithCache(request, API_CACHE_NAME, apiPattern.ttl));
    }
    return;
  }

  // Default: network only for other requests
  event.respondWith(fetch(request));
});

// Cache-first strategy
async function cacheFirstStrategy(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('Serving from cache:', request.url);
      return cachedResponse;
    }

    console.log('Fetching and caching:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache-first strategy failed:', error);
    throw error;
  }
}

// Cache-first with TTL checking
async function cacheFirstWithTTL(request, cacheName, ttl) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      const dateHeader = cachedResponse.headers.get('sw-cache-date');
      if (dateHeader) {
        const cacheDate = new Date(dateHeader);
        const now = new Date();
        
        if (now.getTime() - cacheDate.getTime() < ttl) {
          console.log('Serving fresh cache:', request.url);
          return cachedResponse;
        } else {
          console.log('Cache expired, refetching:', request.url);
          await cache.delete(request);
        }
      }
    }

    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      const responseWithDate = new Response(responseClone.body, {
        status: responseClone.status,
        statusText: responseClone.statusText,
        headers: {
          ...Object.fromEntries(responseClone.headers.entries()),
          'sw-cache-date': new Date().toISOString()
        }
      });
      
      await cache.put(request, responseWithDate);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache-first with TTL failed:', error);
    
    // Try to serve stale cache if network fails
    const cache = await caches.open(cacheName);
    const staleResponse = await cache.match(request);
    if (staleResponse) {
      console.log('Serving stale cache due to network error:', request.url);
      return staleResponse;
    }
    
    throw error;
  }
}

// Network-first with cache fallback
async function networkFirstWithCache(request, cacheName, ttl) {
  try {
    console.log('Network-first strategy for:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      const responseClone = networkResponse.clone();
      const responseWithDate = new Response(responseClone.body, {
        status: responseClone.status,
        statusText: responseClone.statusText,
        headers: {
          ...Object.fromEntries(responseClone.headers.entries()),
          'sw-cache-date': new Date().toISOString()
        }
      });
      
      await cache.put(request, responseWithDate);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', request.url);
    
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('Serving cached response for:', request.url);
      return cachedResponse;
    }
    
    console.error('Both network and cache failed for:', request.url);
    throw error;
  }
}

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('Performing background sync...');
  
  // Retry failed API calls stored in IndexedDB
  // This would integrate with a queue system for offline actions
  
  try {
    // Example: Retry failed data submissions
    const failedRequests = await getFailedRequests();
    
    for (const request of failedRequests) {
      try {
        await fetch(request.url, request.options);
        await removeFailedRequest(request.id);
        console.log('Background sync succeeded for:', request.url);
      } catch (error) {
        console.log('Background sync still failing for:', request.url);
      }
    }
  } catch (error) {
    console.error('Background sync error:', error);
  }
}

// Placeholder functions for failed request management
async function getFailedRequests() {
  // This would read from IndexedDB
  return [];
}

async function removeFailedRequest(id) {
  // This would remove from IndexedDB
  console.log('Removed failed request:', id);
}

// Cache management and cleanup
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_CLEANUP') {
    event.waitUntil(cleanupCaches());
  }
  
  if (event.data && event.data.type === 'CACHE_STATS') {
    event.waitUntil(getCacheStats().then(stats => {
      event.ports[0].postMessage(stats);
    }));
  }
});

async function cleanupCaches() {
  console.log('Cleaning up expired cache entries...');
  
  const cache = await caches.open(API_CACHE_NAME);
  const requests = await cache.keys();
  
  for (const request of requests) {
    const response = await cache.match(request);
    const dateHeader = response.headers.get('sw-cache-date');
    
    if (dateHeader) {
      const cacheDate = new Date(dateHeader);
      const now = new Date();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours max
      
      if (now.getTime() - cacheDate.getTime() > maxAge) {
        await cache.delete(request);
        console.log('Cleaned up expired cache entry:', request.url);
      }
    }
  }
}

async function getCacheStats() {
  const cacheNames = await caches.keys();
  const stats = {};
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    stats[cacheName] = requests.length;
  }
  
  return stats;
}
