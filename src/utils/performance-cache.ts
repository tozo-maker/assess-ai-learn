
import { supabase } from '@/integrations/supabase/client';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class PerformanceCache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Performance-optimized queries with caching
  async getCachedStudents(teacherId: string) {
    const cacheKey = `students:${teacherId}`;
    const cached = this.get(cacheKey);
    
    if (cached) {
      console.log('Cache hit for students');
      return cached;
    }

    console.log('Cache miss for students, fetching...');
    const { data, error } = await supabase
      .from('students')
      .select(`
        id,
        first_name,
        last_name,
        grade_level,
        parent_email,
        created_at
      `)
      .eq('teacher_id', teacherId)
      .order('last_name', { ascending: true });

    if (error) throw error;

    this.set(cacheKey, data, 2 * 60 * 1000); // 2 minute cache
    return data;
  }

  async getCachedAssessments(teacherId: string) {
    const cacheKey = `assessments:${teacherId}`;
    const cached = this.get(cacheKey);
    
    if (cached) {
      console.log('Cache hit for assessments');
      return cached;
    }

    console.log('Cache miss for assessments, fetching...');
    const { data, error } = await supabase
      .from('assessments')
      .select(`
        id,
        title,
        subject,
        assessment_type,
        assessment_date,
        max_score,
        created_at
      `)
      .eq('teacher_id', teacherId)
      .order('assessment_date', { ascending: false })
      .limit(50);

    if (error) throw error;

    this.set(cacheKey, data, 3 * 60 * 1000); // 3 minute cache
    return data;
  }

  async getCachedStudentPerformance(studentId: string) {
    const cacheKey = `performance:${studentId}`;
    const cached = this.get(cacheKey);
    
    if (cached) {
      console.log('Cache hit for student performance');
      return cached;
    }

    console.log('Cache miss for student performance, fetching...');
    const { data, error } = await supabase
      .from('student_performance')
      .select('*')
      .eq('student_id', studentId)
      .single();

    if (error) throw error;

    this.set(cacheKey, data, 1 * 60 * 1000); // 1 minute cache
    return data;
  }

  async getCachedGoals(studentId: string) {
    const cacheKey = `goals:${studentId}`;
    const cached = this.get(cacheKey);
    
    if (cached) {
      console.log('Cache hit for goals');
      return cached;
    }

    console.log('Cache miss for goals, fetching...');
    const { data, error } = await supabase
      .from('goals')
      .select(`
        id,
        title,
        description,
        status,
        progress_percentage,
        target_date,
        created_at
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    this.set(cacheKey, data, 2 * 60 * 1000); // 2 minute cache
    return data;
  }

  // Invalidation helpers for data mutations
  invalidateStudentData(teacherId: string, studentId?: string) {
    this.invalidate(`students:${teacherId}`);
    if (studentId) {
      this.invalidate(`performance:${studentId}`);
      this.invalidate(`goals:${studentId}`);
    }
  }

  invalidateAssessmentData(teacherId: string) {
    this.invalidate(`assessments:${teacherId}`);
  }

  invalidateGoalData(studentId: string) {
    this.invalidate(`goals:${studentId}`);
  }
}

export const performanceCache = new PerformanceCache();
