import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from './production-logger';
import { performanceMonitor } from '@/utils/performance-monitor';

export interface PredictiveInsight {
  id: string;
  studentId: string;
  type: 'performance_trend' | 'at_risk' | 'skill_gap' | 'growth_opportunity';
  prediction: string;
  confidence: number;
  recommendations: string[];
  dataPoints: any[];
  createdAt: string;
}

export interface CustomReport {
  id: string;
  name: string;
  type: 'student_progress' | 'class_overview' | 'skill_analysis' | 'parent_summary';
  filters: Record<string, any>;
  format: 'pdf' | 'csv' | 'excel';
  generatedAt: string;
  downloadUrl?: string;
}

export interface AnalyticsFilter {
  dateRange?: { start: string; end: string };
  students?: string[];
  subjects?: string[];
  assessmentTypes?: string[];
  skillCategories?: string[];
  performanceLevels?: string[];
}

class AdvancedAnalyticsService {
  async generatePredictiveInsights(teacherId: string, studentIds?: string[]): Promise<PredictiveInsight[]> {
    return performanceMonitor.measureAsync('generate-predictive-insights', async () => {
      try {
        const { data, error } = await supabase.functions.invoke('generate-predictive-insights', {
          body: { teacherId, studentIds }
        });

        if (error) throw error;
        
        productionLogger.info('Generated predictive insights', {
          teacherId,
          insightCount: data?.insights?.length || 0
        });

        return data?.insights || [];
      } catch (error) {
        productionLogger.error('Failed to generate predictive insights', { error, teacherId });
        throw error;
      }
    });
  }

  async createCustomReport(teacherId: string, reportConfig: Omit<CustomReport, 'id' | 'generatedAt'>): Promise<CustomReport> {
    return performanceMonitor.measureAsync('create-custom-report', async () => {
      try {
        const { data, error } = await supabase.functions.invoke('generate-custom-report', {
          body: { teacherId, ...reportConfig }
        });

        if (error) throw error;

        const report: CustomReport = {
          id: data.reportId,
          generatedAt: new Date().toISOString(),
          downloadUrl: data.downloadUrl,
          ...reportConfig
        };

        productionLogger.info('Generated custom report', {
          teacherId,
          reportType: reportConfig.type,
          reportId: report.id
        });

        return report;
      } catch (error) {
        productionLogger.error('Failed to create custom report', { error, teacherId });
        throw error;
      }
    });
  }

  async getAdvancedMetrics(teacherId: string, filters: AnalyticsFilter = {}): Promise<any> {
    return performanceMonitor.measureAsync('get-advanced-metrics', async () => {
      try {
        let query = supabase
          .from('students')
          .select(`
            id,
            first_name,
            last_name,
            grade_level,
            student_performance (
              average_score,
              assessment_count,
              performance_level,
              needs_attention
            ),
            student_skills (
              skill_id,
              current_mastery_level,
              mastery_score,
              skills (name, subject, difficulty_level)
            ),
            assessment_analysis (
              strengths,
              growth_areas,
              recommendations,
              created_at
            )
          `)
          .eq('teacher_id', teacherId);

        // Apply filters
        if (filters.students?.length) {
          query = query.in('id', filters.students);
        }

        const { data: students, error } = await query;
        if (error) throw error;

        // Process data into advanced metrics
        const metrics = this.processAdvancedMetrics(students, filters);
        
        productionLogger.info('Retrieved advanced metrics', {
          teacherId,
          studentCount: students?.length || 0,
          filters
        });

        return metrics;
      } catch (error) {
        productionLogger.error('Failed to get advanced metrics', { error, teacherId });
        throw error;
      }
    });
  }

  private processAdvancedMetrics(students: any[], filters: AnalyticsFilter) {
    const now = new Date();
    const dateFilter = filters.dateRange || {
      start: new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString(),
      end: now.toISOString()
    };

    return {
      overview: {
        totalStudents: students.length,
        averagePerformance: this.calculateAveragePerformance(students),
        atRiskStudents: students.filter(s => s.student_performance?.[0]?.needs_attention).length,
        topPerformers: students.filter(s => s.student_performance?.[0]?.performance_level === 'Advanced').length
      },
      trends: {
        performanceTrend: this.calculatePerformanceTrend(students, dateFilter),
        skillMasteryTrend: this.calculateSkillMasteryTrend(students, dateFilter),
        engagementTrend: this.calculateEngagementTrend(students, dateFilter)
      },
      insights: {
        skillGaps: this.identifySkillGaps(students),
        strengthAreas: this.identifyStrengthAreas(students),
        recommendedActions: this.generateRecommendedActions(students)
      },
      predictions: {
        riskPredictions: this.generateRiskPredictions(students),
        growthPredictions: this.generateGrowthPredictions(students)
      }
    };
  }

  private calculateAveragePerformance(students: any[]): number {
    const scores = students
      .map(s => s.student_performance?.[0]?.average_score)
      .filter(score => score !== null && score !== undefined);
    
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  }

  private calculatePerformanceTrend(students: any[], dateFilter: any): string {
    // Simplified trend calculation - in production, this would analyze historical data
    const avgScore = this.calculateAveragePerformance(students);
    if (avgScore >= 85) return 'improving';
    if (avgScore >= 70) return 'stable';
    return 'declining';
  }

  private calculateSkillMasteryTrend(students: any[], dateFilter: any): string {
    const masteryLevels = students.flatMap(s => 
      s.student_skills?.map(skill => skill.current_mastery_level) || []
    );
    
    const advancedCount = masteryLevels.filter(level => level === 'Advanced').length;
    const totalCount = masteryLevels.length;
    
    const masteryRate = totalCount > 0 ? advancedCount / totalCount : 0;
    
    if (masteryRate >= 0.6) return 'improving';
    if (masteryRate >= 0.4) return 'stable';
    return 'needs_attention';
  }

  private calculateEngagementTrend(students: any[], dateFilter: any): string {
    // Simplified engagement calculation based on assessment frequency
    const assessmentCounts = students
      .map(s => s.student_performance?.[0]?.assessment_count || 0);
    
    const avgAssessments = assessmentCounts.length > 0 
      ? assessmentCounts.reduce((a, b) => a + b, 0) / assessmentCounts.length 
      : 0;
    
    if (avgAssessments >= 10) return 'high';
    if (avgAssessments >= 5) return 'moderate';
    return 'low';
  }

  private identifySkillGaps(students: any[]): string[] {
    const skillPerformance = new Map<string, number[]>();
    
    students.forEach(student => {
      student.student_skills?.forEach((skill: any) => {
        const skillName = skill.skills?.name;
        const score = skill.mastery_score;
        
        if (skillName && score !== null) {
          if (!skillPerformance.has(skillName)) {
            skillPerformance.set(skillName, []);
          }
          skillPerformance.get(skillName)!.push(score);
        }
      });
    });

    return Array.from(skillPerformance.entries())
      .filter(([_, scores]) => {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        return avg < 70; // Below 70% average indicates a skill gap
      })
      .map(([skillName]) => skillName)
      .slice(0, 5); // Top 5 skill gaps
  }

  private identifyStrengthAreas(students: any[]): string[] {
    const skillPerformance = new Map<string, number[]>();
    
    students.forEach(student => {
      student.student_skills?.forEach((skill: any) => {
        const skillName = skill.skills?.name;
        const score = skill.mastery_score;
        
        if (skillName && score !== null) {
          if (!skillPerformance.has(skillName)) {
            skillPerformance.set(skillName, []);
          }
          skillPerformance.get(skillName)!.push(score);
        }
      });
    });

    return Array.from(skillPerformance.entries())
      .filter(([_, scores]) => {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        return avg >= 85; // Above 85% average indicates a strength
      })
      .map(([skillName]) => skillName)
      .slice(0, 5); // Top 5 strengths
  }

  private generateRecommendedActions(students: any[]): string[] {
    const actions: string[] = [];
    const atRiskCount = students.filter(s => s.student_performance?.[0]?.needs_attention).length;
    const lowEngagementCount = students.filter(s => 
      (s.student_performance?.[0]?.assessment_count || 0) < 3
    ).length;

    if (atRiskCount > 0) {
      actions.push(`Focus on ${atRiskCount} at-risk students with targeted interventions`);
    }
    
    if (lowEngagementCount > 0) {
      actions.push(`Re-engage ${lowEngagementCount} students with low assessment participation`);
    }

    const skillGaps = this.identifySkillGaps(students);
    if (skillGaps.length > 0) {
      actions.push(`Address skill gaps in: ${skillGaps.slice(0, 3).join(', ')}`);
    }

    return actions;
  }

  private generateRiskPredictions(students: any[]): any[] {
    return students
      .filter(student => {
        const performance = student.student_performance?.[0];
        return performance?.average_score < 70 || performance?.needs_attention;
      })
      .map(student => ({
        studentId: student.id,
        studentName: `${student.first_name} ${student.last_name}`,
        riskLevel: student.student_performance?.[0]?.average_score < 60 ? 'high' : 'medium',
        riskFactors: this.calculateRiskFactors(student),
        recommendedActions: this.getStudentRecommendations(student)
      }));
  }

  private generateGrowthPredictions(students: any[]): any[] {
    return students
      .filter(student => {
        const performance = student.student_performance?.[0];
        return performance?.average_score >= 70 && !performance?.needs_attention;
      })
      .map(student => ({
        studentId: student.id,
        studentName: `${student.first_name} ${student.last_name}`,
        growthPotential: student.student_performance?.[0]?.average_score >= 85 ? 'high' : 'moderate',
        strengths: student.assessment_analysis?.[0]?.strengths || [],
        nextSteps: this.getGrowthRecommendations(student)
      }));
  }

  private calculateRiskFactors(student: any): string[] {
    const factors: string[] = [];
    const performance = student.student_performance?.[0];
    
    if (performance?.average_score < 60) {
      factors.push('Low overall performance');
    }
    
    if ((performance?.assessment_count || 0) < 3) {
      factors.push('Limited assessment data');
    }

    const lowSkills = student.student_skills?.filter((skill: any) => 
      skill.mastery_score < 65
    ) || [];
    
    if (lowSkills.length > 2) {
      factors.push('Multiple skill deficiencies');
    }

    return factors;
  }

  private getStudentRecommendations(student: any): string[] {
    const recommendations: string[] = [];
    const analysis = student.assessment_analysis?.[0];
    
    if (analysis?.recommendations) {
      recommendations.push(...analysis.recommendations.slice(0, 3));
    }
    
    return recommendations.length > 0 ? recommendations : [
      'Schedule one-on-one support session',
      'Focus on foundational skills',
      'Increase practice opportunities'
    ];
  }

  private getGrowthRecommendations(student: any): string[] {
    const analysis = student.assessment_analysis?.[0];
    
    if (analysis?.recommendations) {
      return analysis.recommendations.slice(0, 3);
    }
    
    return [
      'Introduce advanced challenges',
      'Peer tutoring opportunities',
      'Independent research projects'
    ];
  }

  async exportData(teacherId: string, format: 'csv' | 'excel' | 'pdf', filters: AnalyticsFilter = {}): Promise<string> {
    return performanceMonitor.measureAsync('export-data', async () => {
      try {
        const { data, error } = await supabase.functions.invoke('export-analytics-data', {
          body: { teacherId, format, filters }
        });

        if (error) throw error;
        
        productionLogger.info('Exported analytics data', {
          teacherId,
          format,
          filters
        });

        return data.downloadUrl;
      } catch (error) {
        productionLogger.error('Failed to export data', { error, teacherId, format });
        throw error;
      }
    });
  }
}

export const advancedAnalyticsService = new AdvancedAnalyticsService();