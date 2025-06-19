
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Student = Database['public']['Tables']['students']['Row'];
type StudentInsert = Database['public']['Tables']['students']['Insert'];
type StudentUpdate = Database['public']['Tables']['students']['Update'];

export class EnhancedStudentService {
  static async createStudent(studentData: StudentInsert) {
    try {
      console.log('Creating student with data:', studentData);
      
      const { data, error } = await supabase
        .from('students')
        .insert(studentData)
        .select()
        .single();

      if (error) {
        console.error('Error creating student:', error);
        throw new Error(`Failed to create student: ${error.message}`);
      }

      console.log('Student created successfully:', data);
      return data;
    } catch (error) {
      console.error('Student creation error:', error);
      throw error;
    }
  }

  static async updateStudent(id: string, updates: StudentUpdate) {
    try {
      console.log('Updating student:', id, updates);
      
      const { data, error } = await supabase
        .from('students')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating student:', error);
        throw new Error(`Failed to update student: ${error.message}`);
      }

      console.log('Student updated successfully:', data);
      return data;
    } catch (error) {
      console.error('Student update error:', error);
      throw error;
    }
  }

  static async deleteStudent(id: string) {
    try {
      console.log('Deleting student:', id);
      
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting student:', error);
        throw new Error(`Failed to delete student: ${error.message}`);
      }

      console.log('Student deleted successfully');
      return true;
    } catch (error) {
      console.error('Student deletion error:', error);
      throw error;
    }
  }

  static async getStudentWithPerformance(id: string) {
    try {
      console.log('Fetching student with performance:', id);
      
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
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching student with performance:', error);
        throw new Error(`Failed to fetch student: ${error.message}`);
      }

      console.log('Student with performance fetched:', data);
      return data;
    } catch (error) {
      console.error('Student fetch error:', error);
      throw error;
    }
  }

  static async bulkCreateStudents(studentsData: StudentInsert[]) {
    try {
      console.log('Bulk creating students:', studentsData.length);
      
      const { data, error } = await supabase
        .from('students')
        .insert(studentsData)
        .select();

      if (error) {
        console.error('Error bulk creating students:', error);
        throw new Error(`Failed to create students: ${error.message}`);
      }

      console.log('Students created successfully:', data?.length);
      return data || [];
    } catch (error) {
      console.error('Bulk student creation error:', error);
      throw error;
    }
  }

  static async getStudentsNeedingAttention(teacherId: string) {
    try {
      console.log('Fetching students needing attention for teacher:', teacherId);
      
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          student_performance!inner (
            assessment_count,
            average_score,
            performance_level,
            needs_attention,
            last_assessment_date
          )
        `)
        .eq('teacher_id', teacherId)
        .eq('student_performance.needs_attention', true)
        .order('student_performance.average_score', { ascending: true });

      if (error) {
        console.error('Error fetching students needing attention:', error);
        throw new Error(`Failed to fetch students: ${error.message}`);
      }

      console.log('Students needing attention fetched:', data?.length);
      return data || [];
    } catch (error) {
      console.error('Students needing attention fetch error:', error);
      throw error;
    }
  }
}
