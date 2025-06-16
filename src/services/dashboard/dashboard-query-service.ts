
import { supabase } from '@/integrations/supabase/client';

interface QueryOptions {
  useCache?: boolean;
  cacheKey?: string;
  cacheTTL?: number;
}

class DashboardQueryService {
  private static instance: DashboardQueryService;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  static getInstance(): DashboardQueryService {
    if (!DashboardQueryService.instance) {
      DashboardQueryService.instance = new DashboardQueryService();
    }
    return DashboardQueryService.instance;
  }

  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCached<T>(key: string, data: T, ttl: number = 2 * 60 * 1000): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }

  async getStudentsWithPerformance(teacherId: string, options: QueryOptions = {}) {
    const cacheKey = `students_performance_${teacherId}`;
    
    if (options.useCache !== false) {
      const cached = this.getCached(cacheKey);
      if (cached) return cached;
    }

    const { data, error } = await supabase
      .from('students')
      .select(`
        id,
        first_name,
        last_name,
        grade_level,
        parent_email,
        created_at,
        student_performance (
          average_score,
          performance_level,
          needs_attention,
          assessment_count
        )
      `)
      .eq('teacher_id', teacherId)
      .order('last_name');

    if (error) throw error;

    const result = data || [];
    this.setCached(cacheKey, result, options.cacheTTL || 2 * 60 * 1000);
    return result;
  }

  async getAssessmentsWithStats(teacherId: string, options: QueryOptions = {}) {
    const cacheKey = `assessments_stats_${teacherId}`;
    
    if (options.useCache !== false) {
      const cached = this.getCached(cacheKey);
      if (cached) return cached;
    }

    const { data, error } = await supabase
      .from('assessments')
      .select(`
        id,
        title,
        subject,
        assessment_date,
        max_score,
        created_at,
        student_responses (count)
      `)
      .eq('teacher_id', teacherId)
      .order('assessment_date', { ascending: false })
      .limit(50);

    if (error) throw error;

    const result = data || [];
    this.setCached(cacheKey, result, options.cacheTTL || 3 * 60 * 1000);
    return result;
  }

  async getTeacherProfile(teacherId: string, options: QueryOptions = {}) {
    const cacheKey = `teacher_profile_${teacherId}`;
    
    if (options.useCache !== false) {
      const cached = this.getCached(cacheKey);
      if (cached) return cached;
    }

    const { data, error } = await supabase
      .from('teacher_profiles')
      .select('full_name, school, subjects, grade_levels')
      .eq('id', teacherId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;

    const result = data || { full_name: 'Teacher' };
    this.setCached(cacheKey, result, options.cacheTTL || 5 * 60 * 1000);
    return result;
  }

  async getPerformanceMetrics(teacherId: string, options: QueryOptions = {}) {
    const cacheKey = `performance_metrics_${teacherId}`;
    
    if (options.useCache !== false) {
      const cached = this.getCached(cacheKey);
      if (cached) return cached;
    }

    const { data, error } = await supabase
      .from('student_performance')
      .select(`
        *,
        students!inner(teacher_id)
      `)
      .eq('students.teacher_id', teacherId);

    if (error) throw error;

    const result = data || [];
    this.setCached(cacheKey, result, options.cacheTTL || 1 * 60 * 1000);
    return result;
  }

  invalidateCache(teacherId?: string): void {
    if (teacherId) {
      const keysToDelete = Array.from(this.cache.keys()).filter(key => 
        key.includes(teacherId)
      );
      keysToDelete.forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }
}

export const dashboardQueryService = DashboardQueryService.getInstance();
