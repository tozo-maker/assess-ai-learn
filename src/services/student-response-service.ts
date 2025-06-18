
import { supabase } from '@/integrations/supabase/client';

export interface StudentResponseWithAssessment {
  id: string;
  student_id: string;
  assessment_id: string;
  score: number;
  created_at: string;
  assessment?: {
    id: string;
    title: string;
    subject: string;
    max_score: number;
  };
}

class StudentResponseService {
  async getStudentResponsesByStudent(studentId: string): Promise<StudentResponseWithAssessment[]> {
    console.log('Fetching responses for student:', studentId);
    
    const { data, error } = await supabase
      .from('student_responses')
      .select(`
        id,
        student_id,
        assessment_id,
        score,
        created_at,
        assessments:assessment_id (
          id,
          title,
          subject,
          max_score
        )
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching student responses:', error);
      throw error;
    }

    return (data || []).map(response => ({
      ...response,
      assessment: Array.isArray(response.assessments) 
        ? response.assessments[0] 
        : response.assessments
    }));
  }
}

export const studentResponseService = new StudentResponseService();
