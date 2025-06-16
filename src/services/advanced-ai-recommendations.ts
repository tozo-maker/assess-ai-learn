import { supabase } from '@/integrations/supabase/client';
import { aiOptimizationService } from './ai-optimization-service';
import { predictiveAnalyticsService } from './predictive-analytics-service';

export interface LearningPath {
  id: string;
  studentId: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // in hours
  prerequisites: string[];
  learningObjectives: string[];
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    estimatedTime: number;
    resources: Resource[];
    assessments: string[];
  }>;
  adaptiveElements: Array<{
    condition: string;
    action: string;
    parameters: any;
  }>;
  progress: {
    completed: number;
    total: number;
    currentMilestone: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  id: string;
  type: 'video' | 'article' | 'interactive' | 'practice' | 'assessment';
  title: string;
  description: string;
  url?: string;
  content?: string;
  difficulty: number; // 1-10 scale
  estimatedTime: number; // in minutes
  tags: string[];
  metadata: any;
}

export interface ContentRecommendation {
  id: string;
  studentId: string;
  resource: Resource;
  reason: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  adaptiveFactors: Array<{
    factor: string;
    weight: number;
    value: any;
  }>;
  expectedOutcome: string;
  generatedAt: string;
}

export interface GroupingRecommendation {
  id: string;
  type: 'skill_based' | 'peer_learning' | 'collaborative' | 'remediation';
  title: string;
  description: string;
  students: Array<{
    studentId: string;
    role: 'leader' | 'participant' | 'support_needed';
    reason: string;
  }>;
  objectives: string[];
  suggestedActivities: string[];
  duration: number; // in days
  success_criteria: string[];
  confidence: number;
  createdAt: string;
}

export interface AdaptiveParameters {
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  pace: 'slow' | 'normal' | 'fast';
  difficulty_preference: 'gradual' | 'challenging';
  attention_span: number; // in minutes
  motivation_factors: string[];
  preferred_content_types: string[];
}

class AdvancedAIRecommendationsService {
  private learningPaths: Map<string, LearningPath> = new Map();
  private contentRecommendations: Map<string, ContentRecommendation[]> = new Map();
  private groupingRecommendations: GroupingRecommendation[] = [];

  // Generate personalized learning path for a student
  async generatePersonalizedLearningPath(
    studentId: string,
    subject: string,
    targetLevel: number,
    timeframe: number // in weeks
  ): Promise<LearningPath> {
    try {
      // Get student data and current performance
      const studentData = await this.gatherStudentLearningData(studentId);
      
      // Get predictive insights
      const prediction = await predictiveAnalyticsService.predictStudentPerformance(
        studentId,
        subject,
        `${timeframe}w`
      );

      // Generate learning path using AI
      const pathResult = await aiOptimizationService.optimizedAICall(
        'generate-learning-path',
        {
          student_id: studentId,
          student_data: studentData,
          subject: subject,
          target_level: targetLevel,
          timeframe_weeks: timeframe,
          prediction_data: prediction
        },
        {
          priority: 'high',
          useCache: true,
          ttl: 4 * 60 * 60 * 1000 // 4 hours cache
        }
      );

      const learningPath: LearningPath = {
        id: `path-${studentId}-${Date.now()}`,
        studentId,
        title: pathResult.title,
        description: pathResult.description,
        difficulty: pathResult.difficulty,
        estimatedDuration: pathResult.estimated_duration,
        prerequisites: pathResult.prerequisites || [],
        learningObjectives: pathResult.learning_objectives || [],
        milestones: pathResult.milestones || [],
        adaptiveElements: pathResult.adaptive_elements || [],
        progress: {
          completed: 0,
          total: pathResult.milestones?.length || 0,
          currentMilestone: pathResult.milestones?.[0]?.id || ''
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.learningPaths.set(learningPath.id, learningPath);
      return learningPath;
    } catch (error) {
      console.error('Error generating personalized learning path:', error);
      throw error;
    }
  }

  // Generate adaptive content recommendations
  async generateContentRecommendations(
    studentId: string,
    limit: number = 10
  ): Promise<ContentRecommendation[]> {
    try {
      const cacheKey = `content-rec-${studentId}`;
      const cached = this.contentRecommendations.get(cacheKey);
      
      if (cached && this.isRecommendationCacheValid(cached[0])) {
        return cached.slice(0, limit);
      }

      // Get student learning profile
      const studentData = await this.gatherStudentLearningData(studentId);
      const adaptiveParams = await this.getAdaptiveParameters(studentId);

      // Generate recommendations using AI
      const recommendationsResult = await aiOptimizationService.optimizedAICall(
        'generate-content-recommendations',
        {
          student_id: studentId,
          student_data: studentData,
          adaptive_parameters: adaptiveParams,
          limit: limit
        },
        {
          priority: 'normal',
          useCache: true,
          ttl: 2 * 60 * 60 * 1000 // 2 hours cache
        }
      );

      const recommendations: ContentRecommendation[] = recommendationsResult.recommendations.map((rec: any) => ({
        id: `rec-${studentId}-${Date.now()}-${Math.random()}`,
        studentId,
        resource: rec.resource,
        reason: rec.reason,
        confidence: rec.confidence,
        priority: rec.priority,
        adaptiveFactors: rec.adaptive_factors || [],
        expectedOutcome: rec.expected_outcome,
        generatedAt: new Date().toISOString()
      }));

      this.contentRecommendations.set(cacheKey, recommendations);
      return recommendations;
    } catch (error) {
      console.error('Error generating content recommendations:', error);
      throw error;
    }
  }

  // Generate intelligent grouping recommendations
  async generateGroupingRecommendations(
    studentIds: string[],
    objective: string,
    groupSize: number = 4
  ): Promise<GroupingRecommendation[]> {
    try {
      // Gather data for all students
      const studentsData = await Promise.all(
        studentIds.map(id => this.gatherStudentLearningData(id))
      );

      // Generate grouping recommendations using AI
      const groupingResult = await aiOptimizationService.optimizedAICall(
        'generate-grouping-recommendations',
        {
          students_data: studentsData,
          objective: objective,
          group_size: groupSize
        },
        {
          priority: 'normal',
          useCache: true,
          ttl: 1 * 60 * 60 * 1000 // 1 hour cache
        }
      );

      const recommendations: GroupingRecommendation[] = groupingResult.groups.map((group: any) => ({
        id: `group-${Date.now()}-${Math.random()}`,
        type: group.type,
        title: group.title,
        description: group.description,
        students: group.students,
        objectives: group.objectives || [],
        suggestedActivities: group.suggested_activities || [],
        duration: group.duration || 7,
        success_criteria: group.success_criteria || [],
        confidence: group.confidence,
        createdAt: new Date().toISOString()
      }));

      this.groupingRecommendations.push(...recommendations);
      return recommendations;
    } catch (error) {
      console.error('Error generating grouping recommendations:', error);
      throw error;
    }
  }

  // Update learning path progress
  async updateLearningPathProgress(
    pathId: string,
    milestoneId: string,
    completed: boolean
  ): Promise<LearningPath | null> {
    try {
      const path = this.learningPaths.get(pathId);
      if (!path) return null;

      // Update progress
      if (completed) {
        path.progress.completed += 1;
        
        // Find next milestone
        const currentIndex = path.milestones.findIndex(m => m.id === milestoneId);
        if (currentIndex < path.milestones.length - 1) {
          path.progress.currentMilestone = path.milestones[currentIndex + 1].id;
        }
      }

      path.updatedAt = new Date().toISOString();

      // Check if path needs adaptation
      await this.adaptLearningPath(path);

      this.learningPaths.set(pathId, path);
      return path;
    } catch (error) {
      console.error('Error updating learning path progress:', error);
      throw error;
    }
  }

  // Adapt learning path based on student performance
  private async adaptLearningPath(path: LearningPath): Promise<void> {
    try {
      // Get recent performance data
      const recentPerformance = await this.getRecentPerformanceData(path.studentId);
      
      // Check adaptive elements
      for (const element of path.adaptiveElements) {
        if (this.shouldTriggerAdaptation(element.condition, recentPerformance)) {
          await this.applyAdaptation(path, element);
        }
      }
    } catch (error) {
      console.error('Error adapting learning path:', error);
    }
  }

  // Get adaptive parameters for a student
  private async getAdaptiveParameters(studentId: string): Promise<AdaptiveParameters> {
    try {
      // This would typically come from student profile or be learned over time
      return {
        learningStyle: 'visual',
        pace: 'normal',
        difficulty_preference: 'gradual',
        attention_span: 25,
        motivation_factors: ['gamification', 'progress_tracking'],
        preferred_content_types: ['interactive', 'video']
      };
    } catch (error) {
      console.error('Error getting adaptive parameters:', error);
      return {
        learningStyle: 'visual',
        pace: 'normal',
        difficulty_preference: 'gradual',
        attention_span: 20,
        motivation_factors: [],
        preferred_content_types: []
      };
    }
  }

  // Helper methods
  private async gatherStudentLearningData(studentId: string): Promise<any> {
    try {
      const { data: student, error } = await supabase
        .from('students')
        .select(`
          *,
          student_performance(*),
          student_assessments(*),
          student_goals(*)
        `)
        .eq('id', studentId)
        .single();

      if (error) throw error;

      return {
        student,
        performance: student.student_performance,
        assessments: student.student_assessments,
        goals: student.student_goals
      };
    } catch (error) {
      console.error('Error gathering student learning data:', error);
      return {};
    }
  }

  private async getRecentPerformanceData(studentId: string): Promise<any> {
    try {
      const { data: assessments } = await supabase
        .from('assessments')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(5);

      return { assessments: assessments || [] };
    } catch (error) {
      console.error('Error getting recent performance data:', error);
      return { assessments: [] };
    }
  }

  private shouldTriggerAdaptation(condition: string, performanceData: any): boolean {
    // Simple condition evaluation - in practice this would be more sophisticated
    try {
      // Example conditions: "average_score < 70", "completion_rate < 0.8"
      return Math.random() > 0.8; // Placeholder logic
    } catch (error) {
      return false;
    }
  }

  private async applyAdaptation(path: LearningPath, element: any): Promise<void> {
    try {
      // Apply adaptive changes to the learning path
      console.log('Applying adaptation:', element.action);
      // Implementation would modify path based on element.action and element.parameters
    } catch (error) {
      console.error('Error applying adaptation:', error);
    }
  }

  private isRecommendationCacheValid(recommendation: ContentRecommendation): boolean {
    const age = Date.now() - new Date(recommendation.generatedAt).getTime();
    return age < 2 * 60 * 60 * 1000; // 2 hours
  }

  // Public methods for accessing data
  getLearningPath(pathId: string): LearningPath | undefined {
    return this.learningPaths.get(pathId);
  }

  getStudentLearningPaths(studentId: string): LearningPath[] {
    return Array.from(this.learningPaths.values()).filter(path => path.studentId === studentId);
  }

  getGroupingRecommendations(): GroupingRecommendation[] {
    return this.groupingRecommendations;
  }

  clearCache(): void {
    this.contentRecommendations.clear();
  }
}

export const advancedAIRecommendationsService = new AdvancedAIRecommendationsService(); 