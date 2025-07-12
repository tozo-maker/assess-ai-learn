import { supabase } from '@/integrations/supabase/client';
import { performanceMonitor } from '@/utils/performance-monitor';
import { productionLogger } from './production-logger';

export interface PredictiveInsight {
  id: string;
  studentId: string;
  studentName: string;
  riskLevel: 'low' | 'medium' | 'high';
  predictedOutcome: string;
  prediction: string;
  type: string;
  confidence: number;
  recommendations: string[];
  timeframe: string;
  historicalPatterns: string[];
}

export interface AnalyticsFilter {
  dateRange: { start: string; end: string };
  studentIds?: string[];
  subjectFilter?: string[];
  gradeLevel?: string[];
}

export interface CustomReport {
  id: string;
  title: string;
  description: string;
  generatedAt: string;
  data: any;
  visualizations: ReportVisualization[];
  exportFormats: string[];
}

interface ReportVisualization {
  type: 'chart' | 'table' | 'metric';
  title: string;
  data: any;
  config: any;
}

interface ReportOptions {
  reportType: 'performance_trends' | 'skill_analysis' | 'comparative' | 'predictive';
  dateRange: { start: string; end: string };
  studentIds?: string[];
  subjectFilter?: string[];
  gradeLevel?: string[];
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
      } catch (error: any) {
        productionLogger.error('Failed to generate predictive insights', error.message);
        throw error;
      }
    });
  }

  async generateCustomReport(teacherId: string, options: ReportOptions): Promise<CustomReport> {
    return performanceMonitor.measureAsync('generate-custom-report', async () => {
      try {
        const { data, error } = await supabase.functions.invoke('generate-custom-report', {
          body: { teacherId, options }
        });

        if (error) throw error;

        productionLogger.info('Generated custom report', {
          teacherId,
          reportType: options.reportType,
          reportId: data?.report?.id
        });

        return data?.report;
      } catch (error: any) {
        productionLogger.error('Failed to generate custom report', error.message);
        throw error;
      }
    });
  }

  async getAdvancedMetrics(teacherId: string, filters: AnalyticsFilter): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('assessment_analysis')
        .select(`
          *,
          assessments!inner(title, assessment_type, subject),
          students!inner(first_name, last_name)
        `)
        .eq('assessments.teacher_id', teacherId);

      if (error) throw error;

      return {
        totalAssessments: data?.length || 0,
        averageScore: data?.reduce((acc, item) => acc + (item.analysis_json as any)?.overallScore || 0, 0) / (data?.length || 1),
        insights: data || []
      };
    } catch (error: any) {
      productionLogger.error('Failed to get advanced metrics', error.message);
      throw error;
    }
  }

  async exportData(teacherId: string, format: 'pdf' | 'excel' | 'csv', options: any): Promise<string> {
    return performanceMonitor.measureAsync('export-analytics-data', async () => {
      try {
        const { data, error } = await supabase.functions.invoke('export-analytics-data', {
          body: { teacherId, format, options }
        });

        if (error) throw error;

        productionLogger.info('Exported analytics data', {
          teacherId,
          format,
          fileUrl: data?.fileUrl
        });

        return data?.fileUrl;
      } catch (error: any) {
        productionLogger.error('Failed to export analytics data', error.message);
        throw error;
      }
    });
  }
}

export const advancedAnalyticsService = new AdvancedAnalyticsService();