
import { supabase } from '@/integrations/supabase/client';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  tags: string[];
}

interface CacheStrategy {
  defaultTTL: number;
  maxSize: number;
  evictionPolicy: 'lru' | 'fifo' | 'ttl';
}

class EnhancedCachingService {
  private cache = new Map<string, CacheEntry<any>>();
  private accessOrder = new Map<string, number>();
  private strategy: CacheStrategy = {
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    maxSize: 1000,
    evictionPolicy: 'lru'
  };
  private accessCounter = 0;

  // Intelligent cache key generation
  private generateKey(namespace: string, params?: Record<string, any>): string {
    const baseKey = namespace;
    if (!params) return baseKey;
    
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${JSON.stringify(params[key])}`)
      .join('|');
    
    return `${baseKey}:${sortedParams}`;
  }

  // Set with tags for selective invalidation
  set<T>(
    namespace: string, 
    data: T, 
    options: {
      ttl?: number;
      tags?: string[];
      params?: Record<string, any>;
    } = {}
  ): void {
    const key = this.generateKey(namespace, options.params);
    const ttl = options.ttl || this.strategy.defaultTTL;
    const tags = options.tags || [namespace];

    // Evict if cache is full
    if (this.cache.size >= this.strategy.maxSize) {
      this.evict();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      tags
    });

    this.accessOrder.set(key, ++this.accessCounter);
  }

  // Get with automatic cleanup
  get<T>(namespace: string, params?: Record<string, any>): T | null {
    const key = this.generateKey(namespace, params);
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check TTL
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.accessOrder.delete(key);
      return null;
    }

    // Update access order for LRU
    this.accessOrder.set(key, ++this.accessCounter);
    return entry.data as T;
  }

  // Invalidate by tags
  invalidateByTags(tags: string[]): void {
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.some(tag => tags.includes(tag))) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.accessOrder.delete(key);
    });
  }

  // Smart eviction based on strategy
  private evict(): void {
    if (this.cache.size === 0) return;

    let keyToEvict: string;

    switch (this.strategy.evictionPolicy) {
      case 'lru':
        // Find least recently used
        keyToEvict = Array.from(this.accessOrder.entries())
          .sort(([, a], [, b]) => a - b)[0][0];
        break;
      
      case 'fifo':
        // First key in the map
        keyToEvict = this.cache.keys().next().value;
        break;
      
      case 'ttl':
        // Find entry with shortest remaining TTL
        let shortestTTL = Infinity;
        keyToEvict = '';
        
        for (const [key, entry] of this.cache.entries()) {
          const remaining = entry.ttl - (Date.now() - entry.timestamp);
          if (remaining < shortestTTL) {
            shortestTTL = remaining;
            keyToEvict = key;
          }
        }
        break;
      
      default:
        keyToEvict = this.cache.keys().next().value;
    }

    this.cache.delete(keyToEvict);
    this.accessOrder.delete(keyToEvict);
  }

  // Cached database operations
  async getCachedStudents(teacherId: string, forceRefresh = false) {
    const cacheKey = `students:${teacherId}`;
    
    if (!forceRefresh) {
      const cached = this.get(cacheKey);
      if (cached) {
        console.log('Cache hit: students');
        return cached;
      }
    }

    console.log('Cache miss: students, fetching...');
    
    // Fetch students and performance separately (view has no FK relationship)
    const [studentsResult, performanceResult] = await Promise.all([
      supabase
        .from('students')
        .select('id, first_name, last_name, grade_level, parent_email')
        .eq('teacher_id', teacherId)
        .order('last_name', { ascending: true }),
      supabase
        .from('student_performance')
        .select('student_id, average_score, performance_level, needs_attention')
        .eq('teacher_id', teacherId)
    ]);

    if (studentsResult.error) throw studentsResult.error;

    // Merge performance into students
    const data = (studentsResult.data || []).map(student => ({
      ...student,
      student_performance: (performanceResult.data || []).filter(p => p.student_id === student.id)
    }));

    this.set(cacheKey, data, {
      ttl: 2 * 60 * 1000, // 2 minutes
      tags: ['students', `teacher:${teacherId}`]
    });

    return data;
  }

  async getCachedAssessments(teacherId: string, forceRefresh = false) {
    const cacheKey = `assessments:${teacherId}`;
    
    if (!forceRefresh) {
      const cached = this.get(cacheKey);
      if (cached) {
        console.log('Cache hit: assessments');
        return cached;
      }
    }

    console.log('Cache miss: assessments, fetching...');
    const { data, error } = await supabase
      .from('assessments')
      .select(`
        id,
        title,
        subject,
        assessment_type,
        assessment_date,
        max_score
      `)
      .eq('teacher_id', teacherId)
      .order('assessment_date', { ascending: false })
      .limit(20);

    if (error) throw error;

    this.set(cacheKey, data, {
      ttl: 3 * 60 * 1000, // 3 minutes
      tags: ['assessments', `teacher:${teacherId}`]
    });

    return data;
  }

  // Invalidation helpers for mutations
  invalidateStudentData(teacherId: string, studentId?: string) {
    const tags = ['students', `teacher:${teacherId}`];
    if (studentId) {
      tags.push(`student:${studentId}`);
    }
    this.invalidateByTags(tags);
  }

  invalidateAssessmentData(teacherId: string) {
    this.invalidateByTags(['assessments', `teacher:${teacherId}`]);
  }

  // Cache statistics
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.strategy.maxSize,
      hitRate: this.calculateHitRate(),
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  private calculateHitRate(): number {
    // This would need hit/miss tracking in a real implementation
    return 0; // Placeholder
  }

  private estimateMemoryUsage(): number {
    // Rough estimation of cache memory usage
    let size = 0;
    for (const entry of this.cache.values()) {
      size += JSON.stringify(entry).length;
    }
    return Math.round(size / 1024); // KB
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
    this.accessOrder.clear();
    this.accessCounter = 0;
  }

  // Configure cache strategy
  configure(newStrategy: Partial<CacheStrategy>): void {
    this.strategy = { ...this.strategy, ...newStrategy };
  }
}

export const enhancedCache = new EnhancedCachingService();
