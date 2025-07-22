
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CreateStudentData {
  first_name: string;
  last_name: string;
  grade_level: string;
  learning_style?: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  special_considerations?: string;
  email?: string;
}

class StudentService {
  private static instance: StudentService;

  static getInstance(): StudentService {
    if (!StudentService.instance) {
      StudentService.instance = new StudentService();
    }
    return StudentService.instance;
  }

  async createStudent(studentData: CreateStudentData & { teacher_id: string }) {
    const { data, error } = await supabase
      .from('students')
      .insert([studentData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getStudents(teacherId: string) {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        student_performance (
          assessment_count,
          average_score,
          performance_level,
          needs_attention,
          last_assessment_date
        )
      `)
      .eq('teacher_id', teacherId)
      .order('last_name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async updateStudent(studentId: string, updates: Partial<CreateStudentData>) {
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', studentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteStudent(studentId: string) {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', studentId);

    if (error) throw error;
  }
}

export const studentService = StudentService.getInstance();

// Hook to create student with auth context
export const useCreateStudent = () => {
  const { user } = useAuth();
  
  return async (studentData: CreateStudentData) => {
    if (!user?.id) throw new Error('User not authenticated');
    
    return studentService.createStudent({
      ...studentData,
      teacher_id: user.id
    });
  };
};
