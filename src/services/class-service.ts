import { supabase } from '@/integrations/supabase/client';
import type { Class } from '@/types/student';

export const classService = {
  // Get all classes for the authenticated teacher
  async getClasses(): Promise<Class[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('teacher_id', user.id)
      .order('grade_level', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching classes:', error);
      throw error;
    }

    return data || [];
  },

  // Get a specific class by ID
  async getClassById(id: string): Promise<Class | null> {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Class not found
      }
      console.error('Error fetching class:', error);
      throw error;
    }

    return data;
  },

  // Create a new class
  async createClass(classData: Omit<Class, 'id' | 'created_at' | 'updated_at' | 'teacher_id'>): Promise<Class> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('classes')
      .insert({
        ...classData,
        teacher_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating class:', error);
      throw error;
    }

    return data;
  },

  // Update an existing class
  async updateClass(id: string, updates: Partial<Class>): Promise<Class> {
    const { data, error } = await supabase
      .from('classes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating class:', error);
      throw error;
    }

    return data;
  },

  // Delete a class (hard delete since is_active doesn't exist)
  async deleteClass(id: string): Promise<void> {
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting class:', error);
      throw error;
    }
  },

  // Get classes by grade level
  async getClassesByGradeLevel(gradeLevel: string): Promise<Class[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('teacher_id', user.id)
      .eq('grade_level', gradeLevel)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching classes by grade level:', error);
      throw error;
    }

    return data || [];
  },

  // Get student count for a class
  async getClassStudentCount(classId: string): Promise<number> {
    const { count, error } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('class_id', classId);

    if (error) {
      console.error('Error getting class student count:', error);
      throw error;
    }

    return count || 0;
  },

  // Assign students to a class
  async assignStudentsToClass(studentIds: string[], classId: string): Promise<void> {
    const { error } = await supabase
      .from('students')
      .update({ class_id: classId })
      .in('id', studentIds);

    if (error) {
      console.error('Error assigning students to class:', error);
      throw error;
    }
  },

  // Remove students from a class
  async removeStudentsFromClass(studentIds: string[]): Promise<void> {
    const { error } = await supabase
      .from('students')
      .update({ class_id: null })
      .in('id', studentIds);

    if (error) {
      console.error('Error removing students from class:', error);
      throw error;
    }
  }
};
