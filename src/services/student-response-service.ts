
import { supabase } from '@/integrations/supabase/client';
import { StudentResponse, StudentResponseFormData, ErrorType } from '@/types/assessment';

export const studentResponseService = {
  async createStudentResponses(responses: StudentResponseFormData[]): Promise<StudentResponse[]> {
    console.log('Creating student responses:', responses.length);
    
    const { data, error } = await supabase
      .from('student_responses')
      .insert(responses)
      .select();

    if (error) {
      console.error('Error creating student responses:', error);
      throw new Error(`Failed to create student responses: ${error.message}`);
    }

    return (data || []).map(item => ({
      ...item,
      error_type: item.error_type as ErrorType
    }));
  },

  async getStudentResponses(assessmentId: string, studentId?: string): Promise<StudentResponse[]> {
    let query = supabase
      .from('student_responses')
      .select(`
        *,
        assessment_items (
          question_text,
          item_number,
          knowledge_type,
          difficulty_level,
          max_score
        )
      `)
      .eq('assessment_id', assessmentId);

    if (studentId) {
      query = query.eq('student_id', studentId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch student responses: ${error.message}`);
    }

    return (data || []).map(item => ({
      ...item,
      error_type: item.error_type as ErrorType
    }));
  },

  async updateStudentResponse(id: string, updates: Partial<StudentResponseFormData>): Promise<StudentResponse> {
    const { data, error } = await supabase
      .from('student_responses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update student response: ${error.message}`);
    }

    return {
      ...data,
      error_type: data.error_type as ErrorType
    };
  },

  async deleteStudentResponse(id: string): Promise<void> {
    const { error } = await supabase
      .from('student_responses')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete student response: ${error.message}`);
    }
  },

  async submitAssessmentForAnalysis(assessmentId: string, studentId: string): Promise<void> {
    console.log('Submitting assessment for AI analysis:', { assessmentId, studentId });
    
    // Get student responses for this assessment
    const responses = await this.getStudentResponses(assessmentId, studentId);
    
    if (responses.length === 0) {
      throw new Error('No responses found for this assessment');
    }

    // Format responses for analysis
    const analysisRequest = {
      assessmentId,
      studentId,
      responses: responses.map(r => ({
        itemId: r.assessment_item_id,
        score: Number(r.score),
        maxScore: Number(r.assessment_items?.max_score || 0),
        errorType: r.error_type || undefined
      }))
    };

    // Import the analysis service dynamically to avoid circular dependencies
    const { assessmentAnalysisService } = await import('./assessment-analysis-service');
    await assessmentAnalysisService.generateAnalysis(analysisRequest);
  }
};
