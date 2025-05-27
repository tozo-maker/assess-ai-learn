
import { supabase } from '@/integrations/supabase/client';

interface CacheItem {
  key: string;
  data: any;
  timestamp: number;
  ttl: number;
}

class AIOptimizationService {
  private cache = new Map<string, CacheItem>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  private generateCacheKey(type: string, params: any): string {
    return `${type}_${JSON.stringify(params)}`;
  }

  private isExpired(item: CacheItem): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  async getCachedResult(type: string, params: any): Promise<any | null> {
    const key = this.generateCacheKey(type, params);
    const item = this.cache.get(key);
    
    if (item && !this.isExpired(item)) {
      console.log(`Cache hit for ${type}`);
      return item.data;
    }
    
    if (item && this.isExpired(item)) {
      this.cache.delete(key);
    }
    
    return null;
  }

  setCachedResult(type: string, params: any, data: any, ttl = this.DEFAULT_TTL): void {
    const key = this.generateCacheKey(type, params);
    this.cache.set(key, {
      key,
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  async optimizedAICall(
    functionName: string,
    params: any,
    options: { useCache?: boolean; ttl?: number } = {}
  ): Promise<any> {
    const { useCache = true, ttl = this.DEFAULT_TTL } = options;

    // Check cache first
    if (useCache) {
      const cachedResult = await this.getCachedResult(functionName, params);
      if (cachedResult) {
        return cachedResult;
      }
    }

    // Make the actual AI call
    console.log(`Making AI call to ${functionName}`);
    const startTime = Date.now();

    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: params
      });

      if (error) throw error;

      const duration = Date.now() - startTime;
      console.log(`AI call to ${functionName} completed in ${duration}ms`);

      // Cache the result
      if (useCache && data) {
        this.setCachedResult(functionName, params, data, ttl);
      }

      return data;
    } catch (error) {
      console.error(`AI call to ${functionName} failed:`, error);
      throw error;
    }
  }

  async batchAICall(
    functionName: string,
    batchParams: any[],
    options: { batchSize?: number; useCache?: boolean } = {}
  ): Promise<any[]> {
    const { batchSize = 5, useCache = true } = options;
    const results: any[] = [];

    // Process in batches to avoid overwhelming the API
    for (let i = 0; i < batchParams.length; i += batchSize) {
      const batch = batchParams.slice(i, i + batchSize);
      
      const batchPromises = batch.map(params => 
        this.optimizedAICall(functionName, params, { useCache })
      );

      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      } catch (error) {
        console.error(`Batch ${i / batchSize + 1} failed:`, error);
        // Continue with remaining batches
        results.push(...batch.map(() => null));
      }

      // Add delay between batches to prevent rate limiting
      if (i + batchSize < batchParams.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  clearCache(): void {
    this.cache.clear();
    console.log('AI cache cleared');
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const aiOptimizationService = new AIOptimizationService();
