
import { supabase } from '@/integrations/supabase/client';

interface CacheItem {
  key: string;
  data: any;
  timestamp: number;
  ttl: number;
  hits: number;
}

interface BatchRequest {
  id: string;
  params: any;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

class AIOptimizationService {
  private cache = new Map<string, CacheItem>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 100;
  private batchQueue: BatchRequest[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 5;
  private readonly BATCH_DELAY = 1000; // 1 second

  private generateCacheKey(type: string, params: any): string {
    // Create a more deterministic cache key
    const sortedParams = JSON.stringify(params, Object.keys(params).sort());
    return `${type}_${btoa(sortedParams).replace(/[/+=]/g, '')}`;
  }

  private isExpired(item: CacheItem): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  private evictLeastUsed(): void {
    if (this.cache.size <= this.MAX_CACHE_SIZE) return;

    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].hits - b[1].hits || a[1].timestamp - b[1].timestamp);
    
    const toRemove = entries.slice(0, Math.floor(this.MAX_CACHE_SIZE * 0.2));
    toRemove.forEach(([key]) => this.cache.delete(key));
    
    console.log(`Evicted ${toRemove.length} cache entries`);
  }

  async getCachedResult(type: string, params: any): Promise<any | null> {
    const key = this.generateCacheKey(type, params);
    const item = this.cache.get(key);
    
    if (item && !this.isExpired(item)) {
      item.hits++;
      console.log(`Cache hit for ${type} (${item.hits} hits)`);
      return item.data;
    }
    
    if (item && this.isExpired(item)) {
      this.cache.delete(key);
      console.log(`Cache expired for ${type}`);
    }
    
    return null;
  }

  setCachedResult(type: string, params: any, data: any, ttl = this.DEFAULT_TTL): void {
    this.evictLeastUsed();
    
    const key = this.generateCacheKey(type, params);
    this.cache.set(key, {
      key,
      data,
      timestamp: Date.now(),
      ttl,
      hits: 0
    });
    
    console.log(`Cached result for ${type}, cache size: ${this.cache.size}`);
  }

  async optimizedAICall(
    functionName: string,
    params: any,
    options: { 
      useCache?: boolean; 
      ttl?: number; 
      priority?: 'high' | 'normal' | 'low';
      retries?: number;
    } = {}
  ): Promise<any> {
    const { 
      useCache = true, 
      ttl = this.DEFAULT_TTL, 
      priority = 'normal',
      retries = 2
    } = options;

    // Check cache first
    if (useCache) {
      const cachedResult = await this.getCachedResult(functionName, params);
      if (cachedResult) {
        return cachedResult;
      }
    }

    // Make the actual AI call with retries
    console.log(`Making AI call to ${functionName} (priority: ${priority})`);
    const startTime = Date.now();

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const { data, error } = await supabase.functions.invoke(functionName, {
          body: { ...params, priority }
        });

        if (error) throw error;

        const duration = Date.now() - startTime;
        console.log(`AI call to ${functionName} completed in ${duration}ms (attempt ${attempt + 1})`);

        // Cache the result
        if (useCache && data) {
          this.setCachedResult(functionName, params, data, ttl);
        }

        return data;
      } catch (error) {
        console.error(`AI call to ${functionName} failed (attempt ${attempt + 1}):`, error);
        
        if (attempt === retries) {
          throw error;
        }
        
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  async batchAICall(
    functionName: string,
    batchParams: any[],
    options: { 
      batchSize?: number; 
      useCache?: boolean; 
      priority?: 'high' | 'normal' | 'low';
      onProgress?: (completed: number, total: number) => void;
    } = {}
  ): Promise<any[]> {
    const { 
      batchSize = this.BATCH_SIZE, 
      useCache = true, 
      priority = 'normal',
      onProgress
    } = options;
    
    const results: any[] = [];
    const totalBatches = Math.ceil(batchParams.length / batchSize);

    console.log(`Starting batch AI call: ${batchParams.length} items in ${totalBatches} batches`);

    // Check cache for all items first
    const uncachedParams: { index: number; params: any }[] = [];
    
    for (let i = 0; i < batchParams.length; i++) {
      if (useCache) {
        const cachedResult = await this.getCachedResult(functionName, batchParams[i]);
        if (cachedResult) {
          results[i] = cachedResult;
          continue;
        }
      }
      uncachedParams.push({ index: i, params: batchParams[i] });
    }

    console.log(`Cache hits: ${batchParams.length - uncachedParams.length}/${batchParams.length}`);

    // Process uncached items in batches
    for (let i = 0; i < uncachedParams.length; i += batchSize) {
      const batch = uncachedParams.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      
      console.log(`Processing batch ${batchNumber}/${Math.ceil(uncachedParams.length / batchSize)} (${batch.length} items)`);
      
      const batchPromises = batch.map(({ params }) => 
        this.optimizedAICall(functionName, params, { useCache, priority })
      );

      try {
        const batchResults = await Promise.allSettled(batchPromises);
        
        batch.forEach(({ index }, batchIndex) => {
          const result = batchResults[batchIndex];
          if (result.status === 'fulfilled') {
            results[index] = result.value;
          } else {
            console.error(`Batch item ${index} failed:`, result.reason);
            results[index] = null;
          }
        });
      } catch (error) {
        console.error(`Batch ${batchNumber} failed:`, error);
        batch.forEach(({ index }) => {
          results[index] = null;
        });
      }

      // Progress callback
      if (onProgress) {
        const completed = Math.min((batchNumber * batchSize), uncachedParams.length);
        onProgress(completed, uncachedParams.length);
      }

      // Add delay between batches to prevent rate limiting
      if (i + batchSize < uncachedParams.length) {
        await new Promise(resolve => setTimeout(resolve, this.BATCH_DELAY));
      }
    }

    const successCount = results.filter(r => r !== null).length;
    console.log(`Batch AI call completed: ${successCount}/${batchParams.length} successful`);

    return results;
  }

  async queuedAICall(
    functionName: string,
    params: any,
    options: { useCache?: boolean; priority?: 'high' | 'normal' | 'low' } = {}
  ): Promise<any> {
    const { useCache = true, priority = 'normal' } = options;

    // Check cache first
    if (useCache) {
      const cachedResult = await this.getCachedResult(functionName, params);
      if (cachedResult) {
        return cachedResult;
      }
    }

    return new Promise((resolve, reject) => {
      const request: BatchRequest = {
        id: `${functionName}_${Date.now()}_${Math.random()}`,
        params: { ...params, functionName, priority },
        resolve,
        reject
      };

      // Insert based on priority
      if (priority === 'high') {
        this.batchQueue.unshift(request);
      } else {
        this.batchQueue.push(request);
      }

      this.processBatchQueue();
    });
  }

  private processBatchQueue(): void {
    if (this.batchTimer) return;

    this.batchTimer = setTimeout(async () => {
      const batch = this.batchQueue.splice(0, this.BATCH_SIZE);
      this.batchTimer = null;

      if (batch.length === 0) return;

      console.log(`Processing queued batch: ${batch.length} items`);

      for (const request of batch) {
        try {
          const { functionName, priority, ...params } = request.params;
          const result = await this.optimizedAICall(functionName, params, { priority });
          request.resolve(result);
        } catch (error) {
          request.reject(error);
        }
      }

      // Continue processing if more items in queue
      if (this.batchQueue.length > 0) {
        this.processBatchQueue();
      }
    }, this.BATCH_DELAY);
  }

  preloadCache(functionName: string, paramsList: any[]): void {
    console.log(`Preloading cache for ${functionName} with ${paramsList.length} items`);
    
    // Process in background with low priority
    this.batchAICall(functionName, paramsList, { 
      priority: 'low', 
      useCache: true 
    }).catch(error => {
      console.error('Cache preload failed:', error);
    });
  }

  clearCache(pattern?: string): void {
    if (pattern) {
      const keysToDelete = Array.from(this.cache.keys()).filter(key => key.includes(pattern));
      keysToDelete.forEach(key => this.cache.delete(key));
      console.log(`Cleared ${keysToDelete.length} cache entries matching: ${pattern}`);
    } else {
      this.cache.clear();
      console.log('AI cache cleared');
    }
  }

  getCacheStats(): { 
    size: number; 
    keys: string[]; 
    hitRates: Record<string, number>;
    totalHits: number;
  } {
    const entries = Array.from(this.cache.entries());
    const hitRates: Record<string, number> = {};
    let totalHits = 0;

    entries.forEach(([key, item]) => {
      const functionName = key.split('_')[0];
      hitRates[functionName] = (hitRates[functionName] || 0) + item.hits;
      totalHits += item.hits;
    });

    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      hitRates,
      totalHits
    };
  }

  // Performance monitoring
  async monitorPerformance(): Promise<{
    cacheHitRate: number;
    averageResponseTime: number;
    queueLength: number;
    cacheSize: number;
  }> {
    const stats = this.getCacheStats();
    
    return {
      cacheHitRate: stats.totalHits > 0 ? (stats.totalHits / (stats.totalHits + stats.size)) * 100 : 0,
      averageResponseTime: 0, // Would need to track this separately
      queueLength: this.batchQueue.length,
      cacheSize: stats.size
    };
  }
}

export const aiOptimizationService = new AIOptimizationService();
