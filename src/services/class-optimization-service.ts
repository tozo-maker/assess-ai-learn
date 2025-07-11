import { supabase } from '@/integrations/supabase/client';
import { Class, StudentWithPerformance } from '@/types/student';

export const classOptimizationService = {
  // Optimized batch operations for better performance
  async batchAssignStudentsToClasses(assignments: Array<{ studentId: string; classId: string }>): Promise<void> {
    // Group assignments by class for efficient batch updates
    const assignmentsByClass = assignments.reduce((acc, assignment) => {
      if (!acc[assignment.classId]) {
        acc[assignment.classId] = [];
      }
      acc[assignment.classId].push(assignment.studentId);
      return acc;
    }, {} as Record<string, string[]>);

    // Execute batch updates
    const updatePromises = Object.entries(assignmentsByClass).map(([classId, studentIds]) => 
      supabase
        .from('students')
        .update({ class_id: classId })
        .in('id', studentIds)
    );

    const results = await Promise.all(updatePromises);
    
    // Check for errors
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      throw new Error(`Batch assignment failed: ${errors.map(e => e.error?.message).join(', ')}`);
    }
  },

  // Get comprehensive class analytics with optimized queries
  async getClassAnalytics(): Promise<{
    classSummary: Array<Class & { studentCount: number; averagePerformance?: number }>;
    gradeDistribution: Array<{ grade: string; totalStudents: number; classCount: number }>;
    unassignedStudents: number;
    totalStudents: number;
  }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get classes with student counts in a single optimized query
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select(`
        *,
        students!inner(id, grade_level, performance:student_performance(*))
      `)
      .eq('teacher_id', user.id)
      .eq('is_active', true);

    if (classError) throw classError;

    // Get total student counts
    const { count: totalStudents, error: totalError } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('teacher_id', user.id);

    if (totalError) throw totalError;

    // Get unassigned student count
    const { count: unassignedStudents, error: unassignedError } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('teacher_id', user.id)
      .is('class_id', null);

    if (unassignedError) throw unassignedError;

    // Process class summary with student counts and performance
    const classSummary = (classData || []).map(classItem => {
      const students = Array.isArray(classItem.students) ? classItem.students : [];
      const studentCount = students.length;
      
      // Calculate average performance if available
      const performanceScores = students
        .map(s => s.performance?.[0]?.average_score)
        .filter(score => score !== null && score !== undefined) as number[];
      
      const averagePerformance = performanceScores.length > 0 
        ? performanceScores.reduce((sum, score) => sum + score, 0) / performanceScores.length
        : undefined;

      return {
        ...classItem,
        students: undefined, // Remove nested data to reduce payload
        studentCount,
        averagePerformance
      };
    });

    // Calculate grade distribution
    const gradeDistribution = classSummary.reduce((acc, classItem) => {
      const existing = acc.find(item => item.grade === classItem.grade_level);
      if (existing) {
        existing.totalStudents += classItem.studentCount;
        existing.classCount += 1;
      } else {
        acc.push({
          grade: classItem.grade_level,
          totalStudents: classItem.studentCount,
          classCount: 1
        });
      }
      return acc;
    }, [] as Array<{ grade: string; totalStudents: number; classCount: number }>);

    return {
      classSummary,
      gradeDistribution,
      unassignedStudents: unassignedStudents || 0,
      totalStudents: totalStudents || 0
    };
  },

  // Optimize class-based student queries with smart caching
  async getStudentsWithClassInfo(options?: {
    classId?: string;
    gradeLevel?: string;
    includeUnassigned?: boolean;
  }): Promise<StudentWithPerformance[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    let query = supabase
      .from('students')
      .select(`
        *,
        performance:student_performance(*),
        class:classes(*)
      `)
      .eq('teacher_id', user.id);

    // Apply filters
    if (options?.classId) {
      query = query.eq('class_id', options.classId);
    }

    if (options?.gradeLevel) {
      query = query.eq('grade_level', options.gradeLevel);
    }

    if (options?.includeUnassigned === false) {
      query = query.not('class_id', 'is', null);
    }

    // Order for consistent results
    query = query.order('last_name', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching students with class info:', error);
      throw error;
    }

    return data || [];
  },

  // Advanced class operations
  async mergeClasses(sourceClassId: string, targetClassId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get students from source class
    const { data: students, error: fetchError } = await supabase
      .from('students')
      .select('id')
      .eq('class_id', sourceClassId)
      .eq('teacher_id', user.id);

    if (fetchError) throw fetchError;

    if (students && students.length > 0) {
      // Move students to target class
      const { error: updateError } = await supabase
        .from('students')
        .update({ class_id: targetClassId })
        .in('id', students.map(s => s.id));

      if (updateError) throw updateError;
    }

    // Deactivate source class
    const { error: deactivateError } = await supabase
      .from('classes')
      .update({ is_active: false })
      .eq('id', sourceClassId)
      .eq('teacher_id', user.id);

    if (deactivateError) throw deactivateError;
  },

  // Class capacity and balance analysis
  async analyzeClassBalance(): Promise<{
    recommendations: Array<{
      type: 'underutilized' | 'overcrowded' | 'balanced';
      classId: string;
      className: string;
      currentSize: number;
      recommendedAction?: string;
    }>;
    averageClassSize: number;
    totalClasses: number;
  }> {
    const analytics = await this.getClassAnalytics();
    const { classSummary } = analytics;

    const averageClassSize = classSummary.length > 0 
      ? classSummary.reduce((sum, c) => sum + c.studentCount, 0) / classSummary.length
      : 0;

    const recommendations = classSummary.map(classItem => {
      const { studentCount } = classItem;
      
      if (studentCount === 0) {
        return {
          type: 'underutilized' as const,
          classId: classItem.id,
          className: classItem.display_name,
          currentSize: studentCount,
          recommendedAction: 'Consider removing this empty class or merge with another class'
        };
      } else if (studentCount < averageClassSize * 0.5) {
        return {
          type: 'underutilized' as const,
          classId: classItem.id,
          className: classItem.display_name,
          currentSize: studentCount,
          recommendedAction: 'Consider merging with another class in the same grade'
        };
      } else if (studentCount > averageClassSize * 1.5) {
        return {
          type: 'overcrowded' as const,
          classId: classItem.id,
          className: classItem.display_name,
          currentSize: studentCount,
          recommendedAction: 'Consider splitting into multiple classes or redistributing students'
        };
      } else {
        return {
          type: 'balanced' as const,
          classId: classItem.id,
          className: classItem.display_name,
          currentSize: studentCount
        };
      }
    });

    return {
      recommendations,
      averageClassSize,
      totalClasses: classSummary.length
    };
  }
};