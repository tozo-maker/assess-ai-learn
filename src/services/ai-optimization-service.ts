
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

interface QueuedRequest {
  id: string;
  functionName: string;
  params: any;
  options: AICallOptions;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  priority: 'high' | 'normal' | 'low';
  timestamp: number;
}

interface AICallOptions {
  useCache?: boolean;
  ttl?: number; // Time to live in milliseconds
  priority?: 'high' | 'normal' | 'low';
  retries?: number;
  timeout?: number;
}

interface PerformanceStats {
  cacheHitRate: number;
  averageResponseTime: number;
  cacheSize: number;
  queueLength: number;
}

class AIOptimizationService {
  private cache = new Map<string, CacheEntry>();
  private requestQueue: QueuedRequest[] = [];
  private isProcessingQueue = false;
  private performanceMetrics = {
    totalRequests: 0,
    cacheHits: 0,
    totalResponseTime: 0,
    errors: 0
  };

  // Intelligent caching with TTL
  private getCacheKey(functionName: string, params: any): string {
    return `${functionName}:${JSON.stringify(params)}`;
  }

  private isCacheValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  async getCachedResult(functionName: string, params: any): Promise<any | null> {
    const key = this.getCacheKey(functionName, params);
    const entry = this.cache.get(key);
    
    if (entry && this.isCacheValid(entry)) {
      this.performanceMetrics.cacheHits++;
      console.log(`Cache hit for ${functionName}`);
      return entry.data;
    }
    
    if (entry && !this.isCacheValid(entry)) {
      this.cache.delete(key);
    }
    
    return null;
  }

  private setCacheEntry(functionName: string, params: any, data: any, ttl: number): void {
    const key = this.getCacheKey(functionName, params);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
    
    // Prevent cache from growing too large
    if (this.cache.size > 1000) {
      this.cleanupCache();
    }
  }

  private cleanupCache(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.cache.forEach((entry, key) => {
      if (!this.isCacheValid(entry)) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.cache.delete(key));
    
    // If still too large, remove oldest entries
    if (this.cache.size > 800) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toRemove = entries.slice(0, 200);
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  // Optimized AI function call with retries and caching
  async optimizedAICall(
    functionName: string, 
    params: any, 
    options: AICallOptions = {}
  ): Promise<any> {
    const startTime = Date.now();
    this.performanceMetrics.totalRequests++;
    
    const {
      useCache = true,
      ttl = 5 * 60 * 1000, // 5 minutes default
      retries = 2,
      timeout = 30000 // 30 seconds
    } = options;
    
    // Try cache first
    if (useCache) {
      const cached = await this.getCachedResult(functionName, params);
      if (cached) {
        return cached;
      }
    }
    
    // Make the API call with retries
    let lastError: any;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`Calling ${functionName} (attempt ${attempt + 1}/${retries + 1})`);
        
        const { data, error } = await this.makeSupabaseCall(functionName, params, timeout);
        
        if (error) {
          throw new Error(error.message || 'AI function call failed');
        }
        
        // Cache the result
        if (useCache && data) {
          this.setCacheEntry(functionName, params, data, ttl);
        }
        
        // Update performance metrics
        const responseTime = Date.now() - startTime;
        this.performanceMetrics.totalResponseTime += responseTime;
        
        console.log(`${functionName} completed in ${responseTime}ms`);
        return data;
        
      } catch (error) {
        lastError = error;
        console.error(`${functionName} attempt ${attempt + 1} failed:`, error);
        
        // Exponential backoff for retries
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s...
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    this.performanceMetrics.errors++;
    throw lastError;
  }

  private async makeSupabaseCall(functionName: string, params: any, timeout: number): Promise<any> {
    // Import supabase here to avoid circular dependencies
    const { supabase } = await import('@/integrations/supabase/client');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const result = await supabase.functions.invoke(functionName, {
        body: params,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // Batch processing for multiple AI calls
  async batchAICall(
    functionName: string,
    paramsList: any[],
    options: AICallOptions & { 
      batchSize?: number;
      onProgress?: (completed: number, total: number) => void;
    } = {}
  ): Promise<any[]> {
    const { batchSize = 5, onProgress } = options;
    const results: any[] = [];
    
    console.log(`Starting batch processing of ${paramsList.length} items`);
    
    for (let i = 0; i < paramsList.length; i += batchSize) {
      const batch = paramsList.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(paramsList.length / batchSize)}`);
      
      const batchPromises = batch.map(params => 
        this.optimizedAICall(functionName, params, options)
          .catch(error => {
            console.error(`Batch item failed:`, error);
            return null; // Return null for failed items
          })
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      if (onProgress) {
        onProgress(results.length, paramsList.length);
      }
      
      // Small delay between batches to prevent overwhelming the system
      if (i + batchSize < paramsList.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    console.log(`Batch processing completed. ${results.filter(r => r !== null).length}/${paramsList.length} successful`);
    return results;
  }

  // Queue management for high-volume scenarios
  async queuedAICall(
    functionName: string,
    params: any,
    options: AICallOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const request: QueuedRequest = {
        id: `${functionName}-${Date.now()}-${Math.random()}`,
        functionName,
        params,
        options,
        resolve,
        reject,
        priority: options.priority || 'normal',
        timestamp: Date.now()
      };
      
      this.requestQueue.push(request);
      this.requestQueue.sort((a, b) => {
        // Sort by priority first, then by timestamp
        const priorityWeight = { high: 3, normal: 2, low: 1 };
        const aPriority = priorityWeight[a.priority];
        const bPriority = priorityWeight[b.priority];
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority; // Higher priority first
        }
        
        return a.timestamp - b.timestamp; // Older requests first
      });
      
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }
    
    this.isProcessingQueue = true;
    
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift()!;
      
      try {
        const result = await this.optimizedAICall(
          request.functionName,
          request.params,
          request.options
        );
        request.resolve(result);
      } catch (error) {
        request.reject(error);
      }
    }
    
    this.isProcessingQueue = false;
  }

  // Preload cache for better performance
  async preloadCache(functionName: string, paramsList: any[]): Promise<void> {
    console.log(`Preloading cache for ${functionName} with ${paramsList.length} entries`);
    
    const preloadPromises = paramsList.map(params =>
      this.optimizedAICall(functionName, params, { 
        useCache: true, 
        priority: 'low',
        ttl: 10 * 60 * 1000 // 10 minutes for preloaded data
      }).catch(error => {
        console.warn(`Preload failed for ${functionName}:`, error);
        return null;
      })
    );
    
    await Promise.allSettled(preloadPromises);
    console.log(`Cache preloading completed for ${functionName}`);
  }

  // Performance monitoring
  async monitorPerformance(): Promise<PerformanceStats> {
    const cacheHitRate = this.performanceMetrics.totalRequests > 0 
      ? (this.performanceMetrics.cacheHits / this.performanceMetrics.totalRequests) * 100 
      : 0;
    
    const averageResponseTime = this.performanceMetrics.totalRequests > 0
      ? this.performanceMetrics.totalResponseTime / this.performanceMetrics.totalRequests
      : 0;
    
    return {
      cacheHitRate,
      averageResponseTime,
      cacheSize: this.cache.size,
      queueLength: this.requestQueue.length
    };
  }

  // Cache management
  clearCache(pattern?: string): void {
    if (pattern) {
      const keysToDelete: string[] = [];
      this.cache.forEach((_, key) => {
        if (key.includes(pattern)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => this.cache.delete(key));
      console.log(`Cleared ${keysToDelete.length} cache entries matching pattern: ${pattern}`);
    } else {
      this.cache.clear();
      console.log('Cache cleared completely');
    }
  }

  // Reset performance metrics
  resetMetrics(): void {
    this.performanceMetrics = {
      totalRequests: 0,
      cacheHits: 0,
      totalResponseTime: 0,
      errors: 0
    };
  }
}

export const aiOptimizationService = new AIOptimizationService();
