
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SimpleAuthContext';

interface CreateStudentData {
  first_name: string;
  last_name: string;
  grade_level: string;
  learning_style?: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  special_considerations?: string;
  email?: string;
}

// Define the student performance interface based on the actual view columns
interface StudentPerformanceData {
  assessment_count: number | null;
  average_score: number | null;
  performance_level: string | null;
  needs_attention: boolean | null;
  first_name: string | null;
  last_name: string | null;
  student_id: string | null;
  teacher_id: string | null;
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
    // Fetch students and performance data separately to avoid embedded relation issues
    // (student_performance is a view, not a table with foreign key relationship)
    const [studentsResult, performanceResult] = await Promise.all([
      supabase
        .from('students')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('last_name', { ascending: true }),
      supabase
        .from('student_performance')
        .select('*')
        .eq('teacher_id', teacherId)
    ]);

    if (studentsResult.error) throw studentsResult.error;
    if (performanceResult.error) throw performanceResult.error;

    const students = studentsResult.data || [];
    const performanceData = performanceResult.data || [];

    // Merge performance data into students
    return students.map(student => ({
      ...student,
      student_performance: performanceData.filter(p => p.student_id === student.id)
    }));
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

  async getStudentById(studentId: string) {
    // Fetch student and performance data separately
    const [studentResult, performanceResult] = await Promise.all([
      supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single(),
      supabase
        .from('student_performance')
        .select('*')
        .eq('student_id', studentId)
    ]);

    if (studentResult.error) throw studentResult.error;
    // Performance query errors are non-fatal (student may have no performance data)

    return {
      ...studentResult.data,
      student_performance: performanceResult.data || []
    };
  }

  async getStudentMetrics(teacherId: string) {
    const students = await this.getStudents(teacherId);
    const totalStudents = students.length;
    
    const studentsWithPerformance = students.filter(student => 
      Array.isArray(student.student_performance) && student.student_performance.length > 0
    );
    
    const averageScore = studentsWithPerformance.length > 0
      ? Math.round(
          studentsWithPerformance.reduce((sum, student) => {
            const performance = student.student_performance[0] as StudentPerformanceData;
            return sum + (performance?.average_score || 0);
          }, 0) / studentsWithPerformance.length
        )
      : 0;

    const studentsNeedingAttention = studentsWithPerformance.filter(student => {
      const performance = student.student_performance[0] as StudentPerformanceData;
      return performance?.needs_attention;
    }).length;

    return {
      totalStudents,
      averageScore,
      studentsNeedingAttention,
      studentsWithPerformance: studentsWithPerformance.length
    };
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
