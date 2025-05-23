
import { supabase } from '@/integrations/supabase/client';
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
    if (!data.teacher_id) {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) throw new Error("User not authenticated");
      
      data.teacher_id = authData.user.id;
    }
    
    const { data: assessment, error } = await supabase
      .from('assessments')
      .insert(data)
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
    const { data, error } = await supabase.functions.invoke('analyze-student-assessment', {
      body: { assessment_id: assessmentId, student_id: studentId }
    });

    if (error) throw error;
    return data;
  }
};
