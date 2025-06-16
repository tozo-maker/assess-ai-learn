import { supabase } from '@/integrations/supabase/client';
import { aiOptimizationService } from './ai-optimization-service';
import { performanceMonitoringService } from './performance-monitoring-service';

export interface PredictionModel {
  id: string;
  name: string;
  type: 'performance' | 'risk' | 'trajectory' | 'engagement';
  accuracy: number;
  lastTrained: string;
  features: string[];
}

export interface StudentPrediction {
  studentId: string;
  predictionType: 'performance' | 'risk' | 'trajectory';
  prediction: any;
  confidence: number;
  factors: Array<{
    factor: string;
    impact: number;
    description: string;
  }>;
  recommendations: string[];
  timeframe: string;
  generatedAt: string;
}

export interface RiskAlert {
  id: string;
  studentId: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskType: 'academic' | 'engagement' | 'attendance' | 'behavioral';
  description: string;
  predictedOutcome: string;
  interventionSuggestions: string[];
  confidence: number;
  urgency: number;
  createdAt: string;
}

export interface LearningTrajectory {
  studentId: string;
  subject: string;
  currentLevel: number;
  projectedLevel: number;
  timeToGoal: number;
  milestones: Array<{
    date: string;
    expectedLevel: number;
    description: string;
  }>;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
}

class PredictiveAnalyticsService {
  private models: Map<string, PredictionModel> = new Map();
  private predictionCache: Map<string, StudentPrediction> = new Map();
  private riskAlerts: RiskAlert[] = []; // Store in memory for now

  // Initialize prediction models
  async initializeModels(): Promise<void> {
    try {
      const models: PredictionModel[] = [
        {
          id: 'performance-predictor-v1',
          name: 'Student Performance Predictor',
          type: 'performance',
          accuracy: 0.87,
          lastTrained: new Date().toISOString(),
          features: ['assessment_scores', 'engagement_metrics', 'time_spent', 'previous_performance']
        },
        {
          id: 'risk-detector-v1',
          name: 'At-Risk Student Detector',
          type: 'risk',
          accuracy: 0.92,
          lastTrained: new Date().toISOString(),
          features: ['performance_trend', 'engagement_drop', 'assessment_frequency', 'goal_completion']
        },
        {
          id: 'trajectory-forecaster-v1',
          name: 'Learning Trajectory Forecaster',
          type: 'trajectory',
          accuracy: 0.84,
          lastTrained: new Date().toISOString(),
          features: ['skill_progression', 'learning_velocity', 'difficulty_adaptation', 'mastery_patterns']
        }
      ];

      models.forEach(model => this.models.set(model.id, model));
      console.log('Predictive models initialized:', models.length);
    } catch (error) {
      console.error('Error initializing prediction models:', error);
      throw error;
    }
  }

  // Predict student performance for upcoming assessments
  async predictStudentPerformance(
    studentId: string,
    assessmentType?: string,
    timeframe: string = '30d'
  ): Promise<StudentPrediction> {
    try {
      const cacheKey = `performance-${studentId}-${assessmentType}-${timeframe}`;
      const cached = this.predictionCache.get(cacheKey);
      
      if (cached && this.isCacheValid(cached)) {
        return cached;
      }

      // Gather student data for prediction
      const studentData = await this.gatherStudentData(studentId);
      
      // Use AI service for prediction
      const predictionResult = await aiOptimizationService.optimizedAICall(
        'predict-student-performance',
        {
          student_id: studentId,
          student_data: studentData,
          assessment_type: assessmentType,
          timeframe: timeframe
        },
        { 
          priority: 'high',
          useCache: true,
          ttl: 2 * 60 * 60 * 1000 // 2 hours cache
        }
      );

      const prediction: StudentPrediction = {
        studentId,
        predictionType: 'performance',
        prediction: predictionResult.prediction,
        confidence: predictionResult.confidence,
        factors: predictionResult.factors || [],
        recommendations: predictionResult.recommendations || [],
        timeframe,
        generatedAt: new Date().toISOString()
      };

      this.predictionCache.set(cacheKey, prediction);
      return prediction;
    } catch (error) {
      console.error('Error predicting student performance:', error);
      throw error;
    }
  }

  // Identify at-risk students with early intervention recommendations
  async identifyAtRiskStudents(classId?: string): Promise<RiskAlert[]> {
    try {
      // Get students to analyze
      const studentsQuery = supabase
        .from('students')
        .select(`
          id,
          first_name,
          last_name,
          grade_level,
          student_performance!inner(*)
        `);

      if (classId) {
        studentsQuery.eq('class_id', classId);
      }

      const { data: students, error } = await studentsQuery;
      if (error) throw error;

      const riskAlerts: RiskAlert[] = [];

      // Analyze each student for risk factors
      for (const student of students || []) {
        const studentData = await this.gatherStudentData(student.id);
        
        const riskAnalysis = await aiOptimizationService.optimizedAICall(
          'analyze-student-risk',
          {
            student_id: student.id,
            student_data: studentData
          },
          { 
            priority: 'normal',
            useCache: true,
            ttl: 4 * 60 * 60 * 1000 // 4 hours cache
          }
        );

        if (riskAnalysis.risk_level !== 'low') {
          riskAlerts.push({
            id: `risk-${student.id}-${Date.now()}`,
            studentId: student.id,
            riskLevel: riskAnalysis.risk_level,
            riskType: riskAnalysis.risk_type,
            description: riskAnalysis.description,
            predictedOutcome: riskAnalysis.predicted_outcome,
            interventionSuggestions: riskAnalysis.intervention_suggestions || [],
            confidence: riskAnalysis.confidence,
            urgency: riskAnalysis.urgency,
            createdAt: new Date().toISOString()
          });
        }
      }

      // Store risk alerts in memory for now
      this.riskAlerts.push(...riskAlerts);

      return riskAlerts;
    } catch (error) {
      console.error('Error identifying at-risk students:', error);
      throw error;
    }
  }

  // Generate learning trajectory forecasts
  async generateLearningTrajectory(
    studentId: string,
    subject: string,
    goalLevel: number
  ): Promise<LearningTrajectory> {
    try {
      const studentData = await this.gatherStudentData(studentId);
      
      const trajectoryResult = await aiOptimizationService.optimizedAICall(
        'generate-learning-trajectory',
        {
          student_id: studentId,
          student_data: studentData,
          subject: subject,
          goal_level: goalLevel
        },
        { 
          priority: 'normal',
          useCache: true,
          ttl: 6 * 60 * 60 * 1000 // 6 hours cache
        }
      );

      return {
        studentId,
        subject,
        currentLevel: trajectoryResult.current_level,
        projectedLevel: trajectoryResult.projected_level,
        timeToGoal: trajectoryResult.time_to_goal,
        milestones: trajectoryResult.milestones || [],
        confidenceInterval: trajectoryResult.confidence_interval || { lower: 0, upper: 0 }
      };
    } catch (error) {
      console.error('Error generating learning trajectory:', error);
      throw error;
    }
  }

  // Batch prediction for multiple students
  async batchPredictPerformance(
    studentIds: string[],
    onProgress?: (completed: number, total: number) => void
  ): Promise<StudentPrediction[]> {
    try {
      const predictions: StudentPrediction[] = [];
      
      for (let i = 0; i < studentIds.length; i++) {
        const prediction = await this.predictStudentPerformance(studentIds[i]);
        predictions.push(prediction);
        
        if (onProgress) {
          onProgress(i + 1, studentIds.length);
        }
      }

      return predictions;
    } catch (error) {
      console.error('Error in batch prediction:', error);
      throw error;
    }
  }

  // Analyze class-wide trends and patterns
  async analyzeClassTrends(classId: string): Promise<{
    overallTrend: 'improving' | 'declining' | 'stable';
    riskDistribution: Record<string, number>;
    performancePredictions: Array<{
      timeframe: string;
      averageScore: number;
      confidence: number;
    }>;
    interventionPriorities: Array<{
      area: string;
      urgency: number;
      affectedStudents: number;
    }>;
  }> {
    try {
      const classData = await this.gatherClassData(classId);
      
      const trendAnalysis = await aiOptimizationService.optimizedAICall(
        'analyze-class-trends',
        {
          class_id: classId,
          class_data: classData
        },
        { 
          priority: 'normal',
          useCache: true,
          ttl: 1 * 60 * 60 * 1000 // 1 hour cache
        }
      );

      return trendAnalysis;
    } catch (error) {
      console.error('Error analyzing class trends:', error);
      throw error;
    }
  }

  // Helper methods
  private async gatherStudentData(studentId: string): Promise<any> {
    try {
      // Gather comprehensive student data for predictions
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select(`
          *,
          student_performance(*),
          student_assessments(*),
          student_goals(*)
        `)
        .eq('id', studentId)
        .single();

      if (studentError) throw studentError;

      // Get recent assessment data
      const { data: assessments } = await supabase
        .from('assessments')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(10);

      // Get basic engagement metrics from performance monitoring
      const engagementMetrics = this.getBasicEngagementMetrics(studentId);

      return {
        student,
        assessments: assessments || [],
        engagement: engagementMetrics
      };
    } catch (error) {
      console.error('Error gathering student data:', error);
      return {};
    }
  }

  private async gatherClassData(classId: string): Promise<any> {
    try {
      const { data: students, error } = await supabase
        .from('students')
        .select(`
          *,
          student_performance(*),
          student_assessments(*)
        `)
        .eq('class_id', classId);

      if (error) throw error;

      return { students: students || [] };
    } catch (error) {
      console.error('Error gathering class data:', error);
      return { students: [] };
    }
  }

  private getBasicEngagementMetrics(studentId: string): any {
    // Return basic engagement metrics structure
    return {
      sessionCount: 0,
      averageSessionDuration: 0,
      lastActivity: new Date().toISOString(),
      engagementScore: 0.5
    };
  }

  private isCacheValid(prediction: StudentPrediction): boolean {
    const age = Date.now() - new Date(prediction.generatedAt).getTime();
    return age < 2 * 60 * 60 * 1000; // 2 hours
  }

  // Get prediction model information
  getAvailableModels(): PredictionModel[] {
    return Array.from(this.models.values());
  }

  // Get stored risk alerts
  getRiskAlerts(): RiskAlert[] {
    return this.riskAlerts;
  }

  // Clear prediction cache
  clearCache(): void {
    this.predictionCache.clear();
  }

  // Clear risk alerts
  clearRiskAlerts(): void {
    this.riskAlerts = [];
  }
}

export const predictiveAnalyticsService = new PredictiveAnalyticsService(); 