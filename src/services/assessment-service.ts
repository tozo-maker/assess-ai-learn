
import { supabase } from '@/integrations/supabase/client';
import { aiOptimizationService } from '@/services/ai-optimization-service';
import { 
  Assessment, 
  AssessmentFormData,
  AssessmentItem,
  AssessmentItemFormData,
  StudentResponse,
  StudentResponseFormData,
  AssessmentAnalysis
} from '@/types/assessment';

export const assessmentService = {
  // Assessment CRUD
  async createAssessment(data: AssessmentFormData): Promise<Assessment> {
    // Ensure teacher_id is set
    let assessmentData = { ...data };
    if (!assessmentData.teacher_id) {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) throw new Error("User not authenticated");
      
      assessmentData.teacher_id = authData.user.id;
    }
    
    const { data: assessment, error } = await supabase
      .from('assessments')
      .insert(assessmentData)
      .select()
      .single();

    if (error) throw error;
    return assessment as Assessment;
  },

  async getAssessments(): Promise<Assessment[]> {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Assessment[];
  },

  async getAssessmentById(id: string): Promise<Assessment> {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Assessment;
  },

  async updateAssessment(id: string, data: Partial<AssessmentFormData>): Promise<Assessment> {
    const { data: assessment, error } = await supabase
      .from('assessments')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return assessment as Assessment;
  },

  async deleteAssessment(id: string): Promise<void> {
    const { error } = await supabase
      .from('assessments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async duplicateAssessment(id: string, newTitle?: string): Promise<Assessment> {
    const originalAssessment = await this.getAssessmentById(id);
    const originalItems = await this.getAssessmentItems(id);

    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) throw new Error("User not authenticated");

    const duplicatedAssessment = await this.createAssessment({
      title: newTitle || `${originalAssessment.title} (Copy)`,
      description: originalAssessment.description,
      subject: originalAssessment.subject,
      grade_level: originalAssessment.grade_level,
      assessment_type: originalAssessment.assessment_type,
      standards_covered: originalAssessment.standards_covered,
      max_score: originalAssessment.max_score,
      assessment_date: undefined,
      is_draft: true,
      teacher_id: authData.user.id
    });

    if (originalItems.length > 0) {
      const duplicatedItems = originalItems.map(item => ({
        question_text: item.question_text,
        item_number: item.item_number,
        knowledge_type: item.knowledge_type,
        difficulty_level: item.difficulty_level,
        standard_reference: item.standard_reference,
        max_score: item.max_score
      }));

      await this.createAssessmentItems(duplicatedItems, duplicatedAssessment.id);
    }

    return duplicatedAssessment;
  },

  // Assessment Items CRUD
  async createAssessmentItems(items: AssessmentItemFormData[], assessmentId: string): Promise<AssessmentItem[]> {
    const formattedItems = items.map(item => ({
      ...item,
      assessment_id: assessmentId
    }));
    
    const { data, error } = await supabase
      .from('assessment_items')
      .insert(formattedItems)
      .select();

    if (error) throw error;
    return data as AssessmentItem[];
  },

  async getAssessmentItems(assessmentId: string): Promise<AssessmentItem[]> {
    const { data, error } = await supabase
      .from('assessment_items')
      .select('*')
      .eq('assessment_id', assessmentId)
      .order('item_number', { ascending: true });

    if (error) throw error;
    return data as AssessmentItem[];
  },

  async updateAssessmentItem(id: string, data: Partial<AssessmentItemFormData>): Promise<AssessmentItem> {
    const { data: item, error } = await supabase
      .from('assessment_items')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return item as AssessmentItem;
  },

  async deleteAssessmentItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('assessment_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Student Responses
  async submitStudentResponses(responses: StudentResponseFormData[]): Promise<StudentResponse[]> {
    const { data, error } = await supabase
      .from('student_responses')
      .insert(responses)
      .select();

    if (error) throw error;
    return data as StudentResponse[];
  },
  
  async getStudentResponses(assessmentId: string, studentId?: string): Promise<StudentResponse[]> {
    let query = supabase
      .from('student_responses')
      .select('*')
      .eq('assessment_id', assessmentId);
    
    if (studentId) {
      query = query.eq('student_id', studentId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data as StudentResponse[];
  },

  // Assessment Analysis
  async getAssessmentAnalysis(assessmentId: string, studentId: string): Promise<AssessmentAnalysis | null> {
    const { data, error } = await supabase
      .from('assessment_analysis')
      .select('*')
      .eq('assessment_id', assessmentId)
      .eq('student_id', studentId)
      .maybeSingle();

    if (error) throw error;
    return data as AssessmentAnalysis | null;
  },

  async triggerAnalysis(assessmentId: string, studentId: string): Promise<{ success: boolean, message: string }> {
    try {
      const result = await aiOptimizationService.optimizedAICall(
        'analyze-student-assessment',
        { assessment_id: assessmentId, student_id: studentId },
        { priority: 'high', useCache: true, ttl: 10 * 60 * 1000 } // 10 minutes cache
      );
      return result;
    } catch (error) {
      console.error('Error triggering analysis:', error);
      throw error;
    }
  },

  async batchTriggerAnalysis(
    requests: Array<{ assessmentId: string; studentId: string }>,
    onProgress?: (completed: number, total: number) => void
  ): Promise<Array<{ success: boolean; message: string }>> {
    const batchParams = requests.map(({ assessmentId, studentId }) => ({
      assessment_id: assessmentId,
      student_id: studentId
    }));

    try {
      const results = await aiOptimizationService.batchAICall(
        'analyze-student-assessment',
        batchParams,
        { 
          priority: 'normal',
          useCache: true,
          batchSize: 3, // Smaller batches for analysis
          onProgress
        }
      );
      return results;
    } catch (error) {
      console.error('Error in batch analysis:', error);
      throw error;
    }
  },

  async generateAssessmentAnalysis(assessmentId: string, studentId: string) {
    try {
      console.log('Generating assessment analysis for:', { assessmentId, studentId });
      
      const result = await aiOptimizationService.optimizedAICall(
        'analyze-student-assessment',
        { assessment_id: assessmentId, student_id: studentId },
        { priority: 'high', useCache: true, retries: 3 }
      );

      if (!result || !result.success) {
        throw new Error(result?.message || 'Analysis generation failed');
      }

      console.log('Analysis generated successfully:', result);
      return result;
    } catch (error) {
      console.error('Error generating assessment analysis:', error);
      throw error;
    }
  },

  // Performance and Analytics
  async getAssessmentStats(assessmentId: string): Promise<{
    totalResponses: number;
    averageScore: number;
    completionRate: number;
    analysisStatus: { completed: number; pending: number; failed: number };
  }> {
    const [responses, analysis] = await Promise.all([
      this.getStudentResponses(assessmentId),
      supabase
        .from('assessment_analysis')
        .select('id')
        .eq('assessment_id', assessmentId)
    ]);

    const totalResponses = responses.length;
    const averageScore = responses.length > 0 
      ? responses.reduce((sum, r) => sum + r.score, 0) / responses.length 
      : 0;

    return {
      totalResponses,
      averageScore,
      completionRate: totalResponses > 0 ? 100 : 0, // Would need total enrolled students
      analysisStatus: {
        completed: analysis.data?.length || 0,
        pending: Math.max(0, totalResponses - (analysis.data?.length || 0)),
        failed: 0 // Would need to track this separately
      }
    };
  },

  // Cache management
  clearAnalysisCache(assessmentId?: string): void {
    if (assessmentId) {
      aiOptimizationService.clearCache(`analyze-student-assessment_${assessmentId}`);
    } else {
      aiOptimizationService.clearCache('analyze-student-assessment');
    }
  },

  // Performance monitoring
  async getPerformanceStats() {
    return await aiOptimizationService.monitorPerformance();
  }
};
