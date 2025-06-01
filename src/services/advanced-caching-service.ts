interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessed: number;
  hits: number;
}

interface CacheStats {
  totalItems: number;
  totalMemory: number;
  hitRate: number;
  missRate: number;
  topItems: Array<{ key: string; hits: number; size: number }>;
}

class AdvancedCachingService {
  private cache = new Map<string, CacheItem<any>>();
  private maxSize = 100; // Maximum number of cache items
  private defaultTTL = 5 * 60 * 1000; // 5 minutes
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    evictions: 0
  };
  private isEnabled = false; // Disable by default to prevent layout interference

  constructor() {
    // Only initialize if explicitly enabled to prevent interference
    if (this.isEnabled) {
      this.setupPeriodicCleanup();
      this.setupBrowserCaching();
    }
  }

  // Enhanced cache with LRU eviction
  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    // Remove expired items if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      ttl,
      accessed: now,
      hits: 0
    });

    this.stats.sets++;
    console.log(`Cache SET: ${key} (TTL: ${ttl}ms)`);
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      console.log(`Cache MISS: ${key}`);
      return null;
    }

    const now = Date.now();
    
    // Check if item has expired
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      console.log(`Cache EXPIRED: ${key}`);
      return null;
    }

    // Update access statistics
    item.accessed = now;
    item.hits++;
    this.stats.hits++;
    
    console.log(`Cache HIT: ${key} (hits: ${item.hits})`);
    return item.data;
  }

  // Intelligent cache invalidation
  invalidate(pattern: string): void {
    const keysToDelete: string[] = [];
    
    for (const [key] of this.cache) {
      if (key.includes(pattern) || key.startsWith(pattern)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      console.log(`Cache INVALIDATED: ${key}`);
    });
  }

  // Cache with dependency tracking
  setWithDependencies<T>(key: string, data: T, dependencies: string[], ttl: number = this.defaultTTL): void {
    this.set(key, data, ttl);
    
    // Store dependency information
    const dependencyKey = `deps:${key}`;
    this.set(dependencyKey, dependencies, ttl);
  }

  invalidateDependencies(dependency: string): void {
    const keysToInvalidate: string[] = [];
    
    for (const [key, item] of this.cache) {
      if (key.startsWith('deps:')) {
        const originalKey = key.replace('deps:', '');
        const dependencies = item.data as string[];
        
        if (dependencies.includes(dependency)) {
          keysToInvalidate.push(originalKey);
          keysToInvalidate.push(key);
        }
      }
    }

    keysToInvalidate.forEach(key => {
      this.cache.delete(key);
      console.log(`Cache DEPENDENCY INVALIDATED: ${key}`);
    });
  }

  // LRU eviction strategy
  private evictLRU(): void {
    let oldestKey = '';
    let oldestAccess = Date.now();

    for (const [key, item] of this.cache) {
      if (item.accessed < oldestAccess) {
        oldestAccess = item.accessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
      console.log(`Cache EVICTED (LRU): ${oldestKey}`);
    }
  }

  // Periodic cleanup of expired items
  private setupPeriodicCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      const keysToDelete: string[] = [];

      for (const [key, item] of this.cache) {
        if (now - item.timestamp > item.ttl) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach(key => {
        this.cache.delete(key);
      });

      if (keysToDelete.length > 0) {
        console.log(`Cache CLEANUP: Removed ${keysToDelete.length} expired items`);
      }
    }, 60000); // Run every minute
  }

  // Browser caching setup
  private setupBrowserCaching(): void {
    // Service Worker registration for advanced caching
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(() => {
        console.log('Service Worker registered for caching');
      }).catch(error => {
        console.warn('Service Worker registration failed:', error);
      });
    }

    // Implement cache-first strategy for API calls
    this.interceptFetchRequests();
  }

  private interceptFetchRequests(): void {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const [resource, config] = args;
      // Fix: Properly extract URL from either Request or string/URL
      const url = typeof resource === 'string' ? resource : 
                  resource instanceof Request ? resource.url : 
                  resource.toString();
      
      // Only cache GET requests to API endpoints
      if (config?.method !== 'GET' && !config?.method) {
        const cacheKey = `api:${url}`;
        const cachedResponse = this.get(cacheKey);
        
        if (cachedResponse) {
          return new Response(JSON.stringify(cachedResponse), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        try {
          const response = await originalFetch(...args);
          
          if (response.ok && url.includes('/api/')) {
            const data = await response.clone().json();
            this.set(cacheKey, data, this.getApiCacheTTL(url));
          }
          
          return response;
        } catch (error) {
          // Return cached data if available during network failures
          const fallbackData = this.get(cacheKey);
          if (fallbackData) {
            console.log(`Network failed, serving stale cache: ${url}`);
            return new Response(JSON.stringify(fallbackData), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }
          throw error;
        }
      }
      
      return originalFetch(...args);
    };
  }

  private getApiCacheTTL(url: string): number {
    // Different TTL for different types of data
    if (url.includes('students') || url.includes('assessments')) {
      return 2 * 60 * 1000; // 2 minutes for dynamic data
    }
    if (url.includes('skills') || url.includes('categories')) {
      return 10 * 60 * 1000; // 10 minutes for semi-static data
    }
    return this.defaultTTL; // 5 minutes default
  }

  // Preload critical resources
  preloadCriticalData(endpoints: string[]): void {
    endpoints.forEach(async (endpoint) => {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          this.set(`preload:${endpoint}`, data, this.getApiCacheTTL(endpoint));
          console.log(`Preloaded: ${endpoint}`);
        }
      } catch (error) {
        console.warn(`Failed to preload: ${endpoint}`, error);
      }
    });
  }

  // Cache statistics and monitoring
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
    const missRate = totalRequests > 0 ? (this.stats.misses / totalRequests) * 100 : 0;

    // Calculate memory usage estimation
    let totalMemory = 0;
    const topItems: Array<{ key: string; hits: number; size: number }> = [];

    for (const [key, item] of this.cache) {
      const size = this.estimateSize(item.data);
      totalMemory += size;
      
      topItems.push({
        key,
        hits: item.hits,
        size
      });
    }

    // Sort by hits descending
    topItems.sort((a, b) => b.hits - a.hits);

    return {
      totalItems: this.cache.size,
      totalMemory,
      hitRate,
      missRate,
      topItems: topItems.slice(0, 10)
    };
  }

  private estimateSize(obj: any): number {
    try {
      return JSON.stringify(obj).length * 2; // Rough estimation in bytes
    } catch {
      return 0;
    }
  }

  // Advanced cache warming strategies
  warmCache(strategy: 'user-specific' | 'popular-content' | 'predictive' = 'popular-content'): void {
    switch (strategy) {
      case 'user-specific':
        this.warmUserSpecificCache();
        break;
      case 'popular-content':
        this.warmPopularContentCache();
        break;
      case 'predictive':
        this.warmPredictiveCache();
        break;
    }
  }

  private warmUserSpecificCache(): void {
    // Preload user's frequently accessed data
    const userEndpoints = [
      '/api/students',
      '/api/recent-assessments',
      '/api/dashboard-stats'
    ];
    this.preloadCriticalData(userEndpoints);
  }

  private warmPopularContentCache(): void {
    // Preload commonly accessed data
    const popularEndpoints = [
      '/api/skills/categories',
      '/api/assessment-templates',
      '/api/grade-levels'
    ];
    this.preloadCriticalData(popularEndpoints);
  }

  private warmPredictiveCache(): void {
    // Preload data based on user behavior patterns
    const predictiveEndpoints = [
      '/api/upcoming-assessments',
      '/api/recommended-goals',
      '/api/insights/trending'
    ];
    this.preloadCriticalData(predictiveEndpoints);
  }

  // Cache health monitoring
  monitorCacheHealth(): void {
    setInterval(() => {
      const stats = this.getStats();
      
      if (stats.hitRate < 50) {
        console.warn('Low cache hit rate detected:', stats.hitRate);
      }
      
      if (stats.totalMemory > 10 * 1024 * 1024) { // 10MB
        console.warn('High cache memory usage:', stats.totalMemory);
      }
      
      console.log('Cache Health:', {
        hitRate: `${stats.hitRate.toFixed(1)}%`,
        totalItems: stats.totalItems,
        memoryUsage: `${(stats.totalMemory / 1024 / 1024).toFixed(2)}MB`
      });
    }, 300000); // Every 5 minutes
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, sets: 0, evictions: 0 };
    console.log('Cache cleared');
  }
}

export const advancedCachingService = new AdvancedCachingService();

// Initialize cache monitoring
advancedCachingService.monitorCacheHealth();

// Warm cache on application start
advancedCachingService.warmCache('popular-content');
