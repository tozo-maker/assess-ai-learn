
import { supabase } from '@/integrations/supabase/client';
import { aiOptimizationService } from './ai-optimization-service';

interface AIAnalysisParams {
  studentId: string;
  assessmentData?: any;
  includeRecommendations?: boolean;
  priority?: 'high' | 'normal' | 'low';
}

interface GoalSuggestionParams {
  studentId: string;
  performanceContext?: any;
  count?: number;
  difficulty?: string;
}

interface BatchAnalysisParams {
  studentIds: string[];
  analysisType: 'performance' | 'goals' | 'insights';
  options?: Record<string, any>;
}

class OptimizedAIService {
  // Optimized student analysis with intelligent caching
  async analyzeStudentPerformance(params: AIAnalysisParams): Promise<any> {
    const cacheKey = `student-analysis-${params.studentId}`;
    
    // Try cache first for non-high priority requests
    if (params.priority !== 'high') {
      const cached = await aiOptimizationService.getCachedResult('analyze-student-assessment', params);
      if (cached) {
        console.log('Using cached student analysis');
        return cached;
      }
    }

    // Use optimized AI call with retries and caching
    return await aiOptimizationService.optimizedAICall(
      'analyze-student-assessment',
      params,
      {
        useCache: true,
        ttl: params.priority === 'high' ? 1 * 60 * 1000 : 5 * 60 * 1000, // 1 min for high priority, 5 min for normal
        priority: params.priority || 'normal',
        retries: params.priority === 'high' ? 3 : 2
      }
    );
  }

  // Enhanced goal suggestions with batch processing
  async generateGoalSuggestions(params: GoalSuggestionParams): Promise<string[]> {
    return await aiOptimizationService.optimizedAICall(
      'generate-goal-suggestions',
      {
        student_id: params.studentId,
        performance_context: params.performanceContext,
        suggestion_count: params.count || 5,
        difficulty_preference: params.difficulty
      },
      {
        useCache: true,
        ttl: 10 * 60 * 1000, // 10 minutes cache for goal suggestions
        priority: 'normal'
      }
    );
  }

  // Batch analysis for multiple students
  async batchAnalyzeStudents(params: BatchAnalysisParams): Promise<any[]> {
    const { studentIds, analysisType, options = {} } = params;
    
    console.log(`Starting batch ${analysisType} analysis for ${studentIds.length} students`);

    const batchParams = studentIds.map(studentId => ({
      studentId,
      analysisType,
      ...options
    }));

    const functionName = this.getFunctionNameForAnalysisType(analysisType);
    
    return await aiOptimizationService.batchAICall(
      functionName,
      batchParams,
      {
        batchSize: 3, // Smaller batches to prevent timeouts
        useCache: true,
        priority: 'normal',
        onProgress: (completed, total) => {
          console.log(`Batch analysis progress: ${completed}/${total} completed`);
        }
      }
    );
  }

  // Preload analysis for better performance
  async preloadStudentAnalyses(studentIds: string[]): Promise<void> {
    console.log(`Preloading analyses for ${studentIds.length} students`);
    
    const preloadParams = studentIds.map(studentId => ({
      studentId,
      includeRecommendations: true
    }));

    // Use low priority for preloading to not interfere with user requests
    aiOptimizationService.preloadCache('analyze-student-assessment', preloadParams);
  }

  // Smart goal generation with context awareness
  async generateContextAwareGoals(studentId: string): Promise<any> {
    try {
      // Get recent performance data
      const { data: recentAssessments } = await supabase
        .from('student_responses')
        .select(`
          score,
          error_type,
          assessments (
            subject,
            assessment_type,
            max_score
          )
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(10);

      // Get current goals to avoid duplication
      const { data: existingGoals } = await supabase
        .from('goals')
        .select('title, category, status')
        .eq('student_id', studentId)
        .eq('status', 'active');

      const context = {
        recentPerformance: recentAssessments || [],
        existingGoals: existingGoals || [],
        timestamp: new Date().toISOString()
      };

      return await this.generateGoalSuggestions({
        studentId,
        performanceContext: context,
        count: 8
      });
    } catch (error) {
      console.error('Error generating context-aware goals:', error);
      // Fallback to basic goal generation
      return await this.generateGoalSuggestions({ studentId });
    }
  }

  // Progressive analysis for large datasets
  async progressiveAnalysis(
    studentIds: string[], 
    onProgress?: (current: number, total: number, results: any[]) => void
  ): Promise<any[]> {
    const results: any[] = [];
    const batchSize = 5;
    const totalBatches = Math.ceil(studentIds.length / batchSize);

    for (let i = 0; i < totalBatches; i++) {
      const batch = studentIds.slice(i * batchSize, (i + 1) * batchSize);
      console.log(`Processing progressive analysis batch ${i + 1}/${totalBatches}`);

      try {
        const batchResults = await this.batchAnalyzeStudents({
          studentIds: batch,
          analysisType: 'performance'
        });

        results.push(...batchResults);

        // Progress callback
        if (onProgress) {
          onProgress(results.length, studentIds.length, results);
        }

        // Small delay between batches
        if (i < totalBatches - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`Batch ${i + 1} failed:`, error);
        // Continue with next batch even if this one fails
        results.push(...batch.map(() => null));
      }
    }

    return results;
  }

  // Performance monitoring and optimization
  async getAIPerformanceMetrics(): Promise<{
    cacheHitRate: number;
    averageResponseTime: number;
    totalRequests: number;
    errorRate: number;
  }> {
    const stats = await aiOptimizationService.monitorPerformance();
    
    return {
      cacheHitRate: stats.cacheHitRate,
      averageResponseTime: stats.averageResponseTime,
      totalRequests: stats.cacheSize + stats.queueLength,
      errorRate: 0 // Would need to track this separately
    };
  }

  // Cache management
  clearAICache(pattern?: string): void {
    aiOptimizationService.clearCache(pattern);
  }

  private getFunctionNameForAnalysisType(type: string): string {
    switch (type) {
      case 'performance':
        return 'analyze-student-assessment';
      case 'goals':
        return 'generate-goal-suggestions';
      case 'insights':
        return 'analyze-with-anthropic';
      default:
        return 'analyze-student-assessment';
    }
  }

  // Queue management for high-volume scenarios
  async queueAnalysis(studentId: string, priority: 'high' | 'normal' | 'low' = 'normal'): Promise<any> {
    return await aiOptimizationService.queuedAICall(
      'analyze-student-assessment',
      { studentId },
      { priority, useCache: true }
    );
  }
}

export const optimizedAIService = new OptimizedAIService();
