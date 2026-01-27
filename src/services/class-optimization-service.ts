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

    // Get classes
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('*')
      .eq('teacher_id', user.id);

    if (classError) throw classError;

    // Get students with class assignments
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, class_id, grade_level')
      .eq('teacher_id', user.id);

    if (studentsError) throw studentsError;

    // Get total student counts
    const totalStudents = students?.length || 0;

    // Get unassigned student count
    const unassignedStudents = students?.filter(s => !s.class_id).length || 0;

    // Process class summary with student counts
    const classSummary = (classData || []).map(classItem => {
      const classStudents = students?.filter(s => s.class_id === classItem.id) || [];
      const studentCount = classStudents.length;

      return {
        ...classItem,
        studentCount,
        averagePerformance: undefined
      };
    });

    // Calculate grade distribution
    const gradeDistribution = classSummary.reduce((acc, classItem) => {
      const grade = classItem.grade_level || 'Unknown';
      const existing = acc.find(item => item.grade === grade);
      if (existing) {
        existing.totalStudents += classItem.studentCount;
        existing.classCount += 1;
      } else {
        acc.push({
          grade,
          totalStudents: classItem.studentCount,
          classCount: 1
        });
      }
      return acc;
    }, [] as Array<{ grade: string; totalStudents: number; classCount: number }>);

    return {
      classSummary,
      gradeDistribution,
      unassignedStudents,
      totalStudents
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

    // Build base query for students with classes
    let studentsQuery = supabase
      .from('students')
      .select(`
        *,
        class:classes(*)
      `)
      .eq('teacher_id', user.id);

    // Apply filters
    if (options?.classId) {
      studentsQuery = studentsQuery.eq('class_id', options.classId);
    }

    if (options?.gradeLevel) {
      studentsQuery = studentsQuery.eq('grade_level', options.gradeLevel);
    }

    if (options?.includeUnassigned === false) {
      studentsQuery = studentsQuery.not('class_id', 'is', null);
    }

    // Order for consistent results
    studentsQuery = studentsQuery.order('last_name', { ascending: true });

    // Fetch students and performance separately (view has no FK relationship)
    const [studentsResult, performanceResult] = await Promise.all([
      studentsQuery,
      supabase
        .from('student_performance')
        .select('*')
        .eq('teacher_id', user.id)
    ]);

    if (studentsResult.error) {
      console.error('Error fetching students with class info:', studentsResult.error);
      throw studentsResult.error;
    }

    // Merge performance into students
    return (studentsResult.data || []).map(student => ({
      ...student,
      performance: (performanceResult.data || []).filter(p => p.student_id === student.id)
    })) as StudentWithPerformance[];
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

    // Delete source class
    const { error: deleteError } = await supabase
      .from('classes')
      .delete()
      .eq('id', sourceClassId)
      .eq('teacher_id', user.id);

    if (deleteError) throw deleteError;
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
          className: classItem.name,
          currentSize: studentCount,
          recommendedAction: 'Consider removing this empty class or merge with another class'
        };
      } else if (studentCount < averageClassSize * 0.5) {
        return {
          type: 'underutilized' as const,
          classId: classItem.id,
          className: classItem.name,
          currentSize: studentCount,
          recommendedAction: 'Consider merging with another class in the same grade'
        };
      } else if (studentCount > averageClassSize * 1.5) {
        return {
          type: 'overcrowded' as const,
          classId: classItem.id,
          className: classItem.name,
          currentSize: studentCount,
          recommendedAction: 'Consider splitting into multiple classes or redistributing students'
        };
      } else {
        return {
          type: 'balanced' as const,
          classId: classItem.id,
          className: classItem.name,
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
