
import { supabase } from '@/integrations/supabase/client';

interface AssessmentAnalysisRequest {
  assessmentId: string;
  studentId: string;
  responses: Array<{
    itemId: string;
    score: number;
    maxScore: number;
    errorType?: string;
  }>;
}

interface AssessmentAnalysis {
  id: string;
  assessment_id: string;
  student_id: string;
  strengths: string[];
  growth_areas: string[];
  patterns_observed: string[];
  recommendations: string[];
  overall_summary: string;
  analysis_json: any;
  created_at: string;
  updated_at: string;
}

export const assessmentAnalysisService = {
  async generateAnalysis(request: AssessmentAnalysisRequest): Promise<AssessmentAnalysis> {
    try {
      console.log('Generating assessment analysis:', request);

      // Call edge function to generate AI analysis
      const { data: analysisData, error: functionError } = await supabase.functions.invoke(
        'generate-assessment-analysis',
        {
          body: request
        }
      );

      if (functionError) {
        console.error('Analysis generation error:', functionError);
        throw new Error(`Failed to generate analysis: ${functionError.message}`);
      }

      // Save analysis to database
      const { data, error } = await supabase
        .from('assessment_analysis')
        .insert({
          assessment_id: request.assessmentId,
          student_id: request.studentId,
          strengths: analysisData.strengths || [],
          growth_areas: analysisData.growth_areas || [],
          patterns_observed: analysisData.patterns_observed || [],
          recommendations: analysisData.recommendations || [],
          overall_summary: analysisData.overall_summary || '',
          analysis_json: analysisData
        })
        .select()
        .single();

      if (error) {
        console.error('Database save error:', error);
        throw new Error(`Failed to save analysis: ${error.message}`);
      }

      console.log('Analysis generated successfully:', data);
      return data;
    } catch (error) {
      console.error('Assessment analysis service error:', error);
      throw error;
    }
  },

  async getAnalysis(assessmentId: string, studentId: string): Promise<AssessmentAnalysis | null> {
    const { data, error } = await supabase
      .from('assessment_analysis')
      .select('*')
      .eq('assessment_id', assessmentId)
      .eq('student_id', studentId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch analysis: ${error.message}`);
    }

    return data;
  },

  async getAllAnalysesForAssessment(assessmentId: string): Promise<AssessmentAnalysis[]> {
    const { data, error } = await supabase
      .from('assessment_analysis')
      .select(`
        *,
        students!inner (
          id,
          first_name,
          last_name,
          grade_level
        )
      `)
      .eq('assessment_id', assessmentId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch analyses: ${error.message}`);
    }

    return data || [];
  }
};
