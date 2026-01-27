
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
      
      // Fetch student and performance separately (view has no FK relationship)
      const [studentResult, performanceResult] = await Promise.all([
        supabase
          .from('students')
          .select('*')
          .eq('id', id)
          .single(),
        supabase
          .from('student_performance')
          .select('*')
          .eq('student_id', id)
      ]);

      if (studentResult.error) {
        console.error('Error fetching student:', studentResult.error);
        throw new Error(`Failed to fetch student: ${studentResult.error.message}`);
      }

      // Merge performance data
      const data = {
        ...studentResult.data,
        student_performance: performanceResult.data || []
      };

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
      
      // Fetch students and performance separately (view has no FK relationship)
      const [studentsResult, performanceResult] = await Promise.all([
        supabase
          .from('students')
          .select('*')
          .eq('teacher_id', teacherId),
        supabase
          .from('student_performance')
          .select('*')
          .eq('teacher_id', teacherId)
          .eq('needs_attention', true)
      ]);

      if (studentsResult.error) {
        console.error('Error fetching students:', studentsResult.error);
        throw new Error(`Failed to fetch students: ${studentsResult.error.message}`);
      }

      // Filter to only students needing attention and merge data
      const studentsNeedingAttention = performanceResult.data || [];
      const studentIds = new Set(studentsNeedingAttention.map(p => p.student_id));
      
      const data = (studentsResult.data || [])
        .filter(student => studentIds.has(student.id))
        .map(student => ({
          ...student,
          student_performance: studentsNeedingAttention.filter(p => p.student_id === student.id)
        }));

      console.log('Students needing attention fetched:', data.length);
      return data;
    } catch (error) {
      console.error('Students needing attention fetch error:', error);
      throw error;
    }
  }
}
