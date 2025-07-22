import { supabase } from '@/integrations/supabase/client';
import { errorService } from './error-service';
import { validationService } from './validation-service';

export interface EnhancedAnalysisRequest {
  assessmentId: string;
  studentId: string;
  responses: Array<{
    question_id: string;
    answer: string;
    points_earned: number;
    is_correct?: boolean;
  }>;
  context?: {
    subject: string;
    grade_level: string;
    assessment_type: string;
    learning_objectives?: string[];
  };
}

export interface EnhancedAnalysisResult {
  id: string;
  assessment_id: string;
  student_id: string;
  overall_score: number;
  performance_level: 'excellent' | 'good' | 'satisfactory' | 'needs_improvement' | 'poor';
  strengths: string[];
  growth_areas: string[];
  learning_gaps: string[];
  recommendations: Array<{
    type: 'instruction' | 'practice' | 'assessment' | 'intervention';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    resources?: string[];
  }>;
  skill_analysis: Array<{
    skill_name: string;
    mastery_level: number;
    evidence: string[];
    next_steps: string[];
  }>;
  learning_patterns: {
    preferred_learning_style?: string;
    response_patterns: string[];
    mistake_patterns: string[];
    time_management: string;
  };
  confidence_indicators: {
    overall_confidence: number;
    areas_of_confidence: string[];
    areas_of_uncertainty: string[];
  };
  next_assessment_suggestions: Array<{
    skill_area: string;
    assessment_type: string;
    timeline: string;
    focus_areas: string[];
  }>;
  generated_at: string;
  analysis_version: string;
}

class EnhancedAnalysisService {
  private static instance: EnhancedAnalysisService;

  static getInstance(): EnhancedAnalysisService {
    if (!EnhancedAnalysisService.instance) {
      EnhancedAnalysisService.instance = new EnhancedAnalysisService();
    }
    return EnhancedAnalysisService.instance;
  }

  async generateComprehensiveAnalysis(request: EnhancedAnalysisRequest): Promise<EnhancedAnalysisResult> {
    try {
      // Validate request data - basic validation for now
      if (!request.assessmentId || !request.studentId || !request.responses.length) {
        throw new Error('Invalid request: missing required fields');
      }

      // Check if analysis already exists
      const existingAnalysis = await this.getExistingAnalysis(request.assessmentId, request.studentId);
      if (existingAnalysis) {
        return existingAnalysis;
      }

      // Fetch additional context data
      const contextData = await this.fetchAnalysisContext(request.assessmentId, request.studentId);

      // Generate analysis using AI
      const analysisResult = await this.callAnalysisFunction(request, contextData);

      // Store the analysis result
      const savedAnalysis = await this.saveAnalysisResult(analysisResult);

      return savedAnalysis;
    } catch (error) {
      const errorId = errorService.logError('EnhancedAnalysisService', error as Error, {
        assessmentId: request.assessmentId,
        studentId: request.studentId,
        responseCount: request.responses.length
      });
      
      throw new Error(`Analysis generation failed: ${(error as Error).message}`);
    }
  }

  async getAnalysis(assessmentId: string, studentId: string): Promise<EnhancedAnalysisResult | null> {
    try {
      const { data, error } = await supabase
        .from('assessment_analysis')
        .select('*')
        .eq('assessment_id', assessmentId)
        .eq('student_id', studentId)
        .order('generated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ? data as EnhancedAnalysisResult : null;
    } catch (error) {
      errorService.logError('EnhancedAnalysisService', error as Error, {
        action: 'getAnalysis',
        assessmentId,
        studentId
      });
      throw error;
    }
  }

  async getAnalysesForAssessment(assessmentId: string): Promise<EnhancedAnalysisResult[]> {
    try {
      const { data, error } = await supabase
        .from('assessment_analysis')
        .select(`
          *,
          students!inner(
            id,
            first_name,
            last_name,
            grade_level
          )
        `)
        .eq('assessment_id', assessmentId)
        .order('generated_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data ? data.map(item => item as EnhancedAnalysisResult) : [];
    } catch (error) {
      errorService.logError('EnhancedAnalysisService', error as Error, {
        action: 'getAnalysesForAssessment',
        assessmentId
      });
      throw error;
    }
  }

  async regenerateAnalysis(assessmentId: string, studentId: string): Promise<EnhancedAnalysisResult> {
    try {
      // Delete existing analysis
      await supabase
        .from('assessment_analysis')
        .delete()
        .eq('assessment_id', assessmentId)
        .eq('student_id', studentId);

      // Fetch fresh data and regenerate
      const { data: responses } = await supabase
        .from('student_responses')
        .select('*')
        .eq('assessment_id', assessmentId)
        .eq('student_id', studentId);

      if (!responses || responses.length === 0) {
        throw new Error('No responses found for analysis');
      }

      const request: EnhancedAnalysisRequest = {
        assessmentId,
        studentId,
        responses: responses.map(r => ({
          question_id: r.assessment_item_id || '',
          answer: r.teacher_notes || '',
          points_earned: r.score || 0,
          is_correct: r.score > 0
        }))
      };

      return await this.generateComprehensiveAnalysis(request);
    } catch (error) {
      errorService.logError('EnhancedAnalysisService', error as Error, {
        action: 'regenerateAnalysis',
        assessmentId,
        studentId
      });
      throw error;
    }
  }

  private async getExistingAnalysis(assessmentId: string, studentId: string): Promise<EnhancedAnalysisResult | null> {
    const { data } = await supabase
      .from('assessment_analysis')
      .select('*')
      .eq('assessment_id', assessmentId)
      .eq('student_id', studentId)
      .maybeSingle();

    return data ? data as EnhancedAnalysisResult : null;
  }

  private async fetchAnalysisContext(assessmentId: string, studentId: string) {
    try {
      // Fetch assessment details
      const { data: assessment } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', assessmentId)
        .single();

      // Fetch student details
      const { data: student } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();

      // Fetch previous assessments for context
      const { data: previousAssessments } = await supabase
        .from('student_responses')
        .select(`
          *,
          assessments!inner(
            title,
            subject,
            grade_level,
            assessment_date
          )
        `)
        .eq('student_id', studentId)
        .neq('assessment_id', assessmentId)
        .order('created_at', { ascending: false })
        .limit(5);

      return {
        assessment,
        student,
        previousAssessments: previousAssessments || []
      };
    } catch (error) {
      errorService.logError('EnhancedAnalysisService', error as Error, {
        action: 'fetchAnalysisContext',
        assessmentId,
        studentId
      });
      return null;
    }
  }

  private async callAnalysisFunction(request: EnhancedAnalysisRequest, context: any): Promise<EnhancedAnalysisResult> {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-with-anthropic', {
        body: {
          assessment_id: request.assessmentId,
          student_id: request.studentId,
          responses: request.responses,
          context: {
            ...request.context,
            ...context
          }
        }
      });

      if (error) {
        throw new Error(`AI Analysis failed: ${error.message}`);
      }

      if (!data || !data.analysis) {
        throw new Error('Invalid analysis response from AI service');
      }

      return {
        id: crypto.randomUUID(),
        assessment_id: request.assessmentId,
        student_id: request.studentId,
        ...data.analysis,
        generated_at: new Date().toISOString(),
        analysis_version: '2.0'
      };
    } catch (error) {
      errorService.logError('EnhancedAnalysisService', error as Error, {
        action: 'callAnalysisFunction',
        assessmentId: request.assessmentId,
        studentId: request.studentId
      });
      throw error;
    }
  }

  private async saveAnalysisResult(analysis: EnhancedAnalysisResult): Promise<EnhancedAnalysisResult> {
    try {
      const { data, error } = await supabase
        .from('assessment_analysis')
        .upsert({
          id: analysis.id,
          assessment_id: analysis.assessment_id,
          student_id: analysis.student_id,
          strengths: analysis.strengths,
          growth_areas: analysis.growth_areas,
          recommendations: analysis.recommendations.map(r => r.title), // Simplified for DB
          patterns_observed: analysis.learning_patterns.response_patterns,
          overall_summary: `Performance Level: ${analysis.performance_level}, Score: ${analysis.overall_score}%`,
          analysis_json: JSON.stringify(analysis) // Store full analysis in JSON column
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as EnhancedAnalysisResult;
    } catch (error) {
      errorService.logError('EnhancedAnalysisService', error as Error, {
        action: 'saveAnalysisResult',
        analysisId: analysis.id
      });
      throw error;
    }
  }

  // Analytics and batch operations
  async getAnalyticsForTeacher(teacherId: string, timeframe: 'week' | 'month' | 'quarter' = 'month') {
    try {
      const startDate = this.getStartDateForTimeframe(timeframe);
      
      const { data, error } = await supabase
        .from('assessment_analysis')
        .select(`
          *,
          assessments!inner(teacher_id),
          students!inner(id, first_name, last_name)
        `)
        .eq('assessments.teacher_id', teacherId)
        .gte('generated_at', startDate.toISOString());

      if (error) throw error;

      return this.processAnalyticsData(data);
    } catch (error) {
      errorService.logError('EnhancedAnalysisService', error as Error, {
        action: 'getAnalyticsForTeacher',
        teacherId,
        timeframe
      });
      throw error;
    }
  }

  private getStartDateForTimeframe(timeframe: 'week' | 'month' | 'quarter'): Date {
    const now = new Date();
    switch (timeframe) {
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case 'quarter':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  private processAnalyticsData(analyses: any[]) {
    return {
      totalAnalyses: analyses.length,
      performanceLevels: analyses.reduce((acc, analysis) => {
        acc[analysis.performance_level] = (acc[analysis.performance_level] || 0) + 1;
        return acc;
      }, {}),
      averageScore: analyses.length > 0 
        ? analyses.reduce((sum, analysis) => sum + analysis.overall_score, 0) / analyses.length
        : 0,
      commonStrengths: this.extractCommonItems(analyses.map(a => a.strengths)),
      commonGrowthAreas: this.extractCommonItems(analyses.map(a => a.growth_areas)),
      skillTrends: this.analyzeSkillTrends(analyses)
    };
  }

  private extractCommonItems(itemArrays: string[][]): Array<{ item: string; frequency: number }> {
    const itemCounts: Record<string, number> = {};
    
    itemArrays.flat().forEach(item => {
      itemCounts[item] = (itemCounts[item] || 0) + 1;
    });

    return Object.entries(itemCounts)
      .map(([item, frequency]) => ({ item, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
  }

  private analyzeSkillTrends(analyses: any[]) {
    const skillData: Record<string, number[]> = {};
    
    analyses.forEach(analysis => {
      if (analysis.skill_analysis) {
        analysis.skill_analysis.forEach((skill: any) => {
          if (!skillData[skill.skill_name]) {
            skillData[skill.skill_name] = [];
          }
          skillData[skill.skill_name].push(skill.mastery_level);
        });
      }
    });

    return Object.entries(skillData).map(([skillName, masteryLevels]) => ({
      skillName,
      averageMastery: masteryLevels.reduce((sum, level) => sum + level, 0) / masteryLevels.length,
      studentCount: masteryLevels.length,
      trend: this.calculateTrend(masteryLevels)
    }));
  }

  private calculateTrend(values: number[]): 'improving' | 'declining' | 'stable' {
    if (values.length < 2) return 'stable';
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const difference = secondAvg - firstAvg;
    
    if (difference > 0.1) return 'improving';
    if (difference < -0.1) return 'declining';
    return 'stable';
  }
}

export const enhancedAnalysisService = EnhancedAnalysisService.getInstance();