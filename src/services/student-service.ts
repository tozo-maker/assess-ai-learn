import { supabase } from "@/integrations/supabase/client";
import { Student, StudentPerformance, StudentWithPerformance, normalizeStudentPerformance } from "@/types/student";

export const studentService = {
  async getStudents(): Promise<StudentWithPerformance[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: students, error } = await supabase
      .from('students')
      .select(`
        *,
        performance:student_performance(*)
      `)
      .eq('teacher_id', user.id)
      .order('last_name');
    
    if (error) {
      console.error("Error fetching students:", error);
      throw error;
    }
    
    return (students || []).map(student => normalizeStudentPerformance(student as StudentWithPerformance));
  },
  
  async getStudentById(id: string): Promise<StudentWithPerformance | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        performance:student_performance(*)
      `)
      .eq('id', id)
      .eq('teacher_id', user.id)
      .single();
    
    if (error) {
      console.error(`Error fetching student with id ${id}:`, error);
      throw error;
    }
    
    return data ? normalizeStudentPerformance(data as StudentWithPerformance) : null;
  },
  
  async createStudent(student: Omit<Student, 'id' | 'created_at' | 'updated_at' | 'teacher_id'>): Promise<Student> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('students')
      .insert([{
        ...student,
        teacher_id: user.id
      }])
      .select()
      .single();
    
    if (error) {
      console.error("Error creating student:", error);
      throw error;
    }
    
    // Create empty performance record
    await this.createEmptyPerformanceRecord(data.id);
    
    return data;
  },
  
  async updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating student with id ${id}:`, error);
      throw error;
    }
    
    return data;
  },
  
  async deleteStudent(id: string): Promise<void> {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Error deleting student with id ${id}:`, error);
      throw error;
    }
  },
  
  async createEmptyPerformanceRecord(studentId: string): Promise<StudentPerformance> {
    const { data, error } = await supabase
      .from('student_performance')
      .insert([{
        student_id: studentId,
        assessment_count: 0,
        needs_attention: false
      }])
      .select()
      .single();
    
    if (error) {
      console.error("Error creating performance record:", error);
      throw error;
    }
    
    return data;
  },
  
  async updateStudentPerformance(
    studentId: string, 
    updates: Partial<StudentPerformance>
  ): Promise<StudentPerformance> {
    const { data, error } = await supabase
      .from('student_performance')
      .update(updates)
      .eq('student_id', studentId)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating performance for student ${studentId}:`, error);
      throw error;
    }
    
    return data;
  },
  
  async searchStudents(query: string): Promise<StudentWithPerformance[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        performance:student_performance(*)
      `)
      .eq('teacher_id', user.id)
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,student_id.ilike.%${query}%`)
      .order('last_name');
    
    if (error) {
      console.error("Error searching students:", error);
      throw error;
    }
    
    return (data || []).map(student => normalizeStudentPerformance(student as StudentWithPerformance));
  },
  
  async getStudentsByFilter(filters: {
    grade_level?: string;
    needs_attention?: boolean;
    performance_level?: string;
  }): Promise<StudentWithPerformance[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    let query = supabase
      .from('students')
      .select(`
        *,
        performance:student_performance(*)
      `)
      .eq('teacher_id', user.id);
    
    if (filters.grade_level) {
      query = query.eq('grade_level', filters.grade_level);
    }
    
    const { data: students, error } = await query.order('last_name');
    
    if (error) {
      console.error("Error filtering students:", error);
      throw error;
    }
    
    const normalizedStudents = (students || []).map(student => 
      normalizeStudentPerformance(student as StudentWithPerformance)
    );
    
    let filteredStudents = normalizedStudents;
    
    if (filters.needs_attention !== undefined) {
      filteredStudents = filteredStudents.filter(student => {
        if (!student.performance || Array.isArray(student.performance)) {
          return false;
        }
        return student.performance.needs_attention === filters.needs_attention;
      });
    }
    
    if (filters.performance_level) {
      filteredStudents = filteredStudents.filter(student => {
        if (!student.performance || Array.isArray(student.performance)) {
          return false;
        }
        return student.performance.performance_level === filters.performance_level;
      });
    }
    
    return filteredStudents;
  },
  
  async getStudentMetrics() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: students, error } = await supabase
      .from('students')
      .select(`
        *,
        performance:student_performance(*)
      `)
      .eq('teacher_id', user.id);
    
    if (error) {
      console.error("Error fetching student metrics:", error);
      throw error;
    }
    
    const normalizedStudents = (students || []).map(student => 
      normalizeStudentPerformance(student as StudentWithPerformance)
    );
    
    const totalStudents = normalizedStudents.length || 0;
    
    const studentsNeedingAttention = normalizedStudents.filter(student => {
      if (!student.performance || Array.isArray(student.performance)) {
        return false;
      }
      return student.performance.needs_attention;
    }).length || 0;
    
    const aboveAverageCount = normalizedStudents.filter(student => {
      if (!student.performance || Array.isArray(student.performance)) {
        return false;
      }
      return student.performance.performance_level === 'Above Average';
    }).length || 0;
    
    let averagePerformance = 0;
    const studentsWithScores = normalizedStudents.filter(student => {
      if (!student.performance || Array.isArray(student.performance)) {
        return false;
      }
      return student.performance.average_score !== null && 
             student.performance.average_score !== undefined;
    });
    
    if (studentsWithScores.length > 0) {
      averagePerformance = studentsWithScores.reduce((sum, student) => {
        if (!student.performance || Array.isArray(student.performance)) {
          return sum;
        }
        return sum + (student.performance.average_score || 0);
      }, 0) / studentsWithScores.length;
    }
    
    return {
      totalStudents,
      studentsNeedingAttention,
      aboveAverageCount,
      averagePerformance: Math.round(averagePerformance * 10) / 10
    };
  }
};
