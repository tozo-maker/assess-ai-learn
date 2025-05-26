
import { supabase } from '@/integrations/supabase/client';
import { performanceCalculator } from '@/utils/performance-calculator';

export const performanceService = {
  async updateStudentPerformance(studentId: string) {
    console.log(`Updating performance for student: ${studentId}`);
    
    // Get all responses for this student with proper joins
    const { data: responses, error } = await supabase
      .from('student_responses')
      .select(`
        student_id,
        score,
        assessment_item_id,
        assessment_id,
        assessment_items!inner(max_score),
        assessments!inner(assessment_date)
      `)
      .eq('student_id', studentId);

    if (error) {
      console.error('Error fetching student responses:', error);
      throw error;
    }

    if (!responses || responses.length === 0) {
      console.log(`No responses found for student ${studentId}`);
      
      // Create empty performance record for students with no responses
      await this.createEmptyPerformanceRecord(studentId);
      return null;
    }

    // Transform data for calculator
    const responseData = responses.map(response => ({
      student_id: response.student_id,
      score: response.score,
      max_score: response.assessment_items.max_score,
      assessment_date: response.assessments.assessment_date
    }));

    // Calculate performance
    const [performanceData] = performanceCalculator.calculateStudentPerformance(responseData);

    if (!performanceData) {
      console.log(`No performance data calculated for student ${studentId}`);
      await this.createEmptyPerformanceRecord(studentId);
      return null;
    }

    // Update or insert performance record
    const { data: existingRecord } = await supabase
      .from('student_performance')
      .select('id')
      .eq('student_id', studentId)
      .maybeSingle();

    const performanceRecord = {
      student_id: performanceData.student_id,
      assessment_count: performanceData.assessment_count,
      average_score: performanceData.average_score,
      performance_level: performanceData.performance_level,
      needs_attention: performanceData.needs_attention,
      last_assessment_date: performanceData.last_assessment_date
    };

    if (existingRecord) {
      // Update existing record
      const { data, error: updateError } = await supabase
        .from('student_performance')
        .update(performanceRecord)
        .eq('student_id', studentId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating performance record:', updateError);
        throw updateError;
      }

      return data;
    } else {
      // Insert new record
      const { data, error: insertError } = await supabase
        .from('student_performance')
        .insert([performanceRecord])
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting performance record:', insertError);
        throw insertError;
      }

      return data;
    }
  },

  async createEmptyPerformanceRecord(studentId: string) {
    const { data: existingRecord } = await supabase
      .from('student_performance')
      .select('id')
      .eq('student_id', studentId)
      .maybeSingle();

    if (existingRecord) {
      console.log(`Performance record already exists for student ${studentId}`);
      return existingRecord;
    }

    const { data, error } = await supabase
      .from('student_performance')
      .insert([{
        student_id: studentId,
        assessment_count: 0,
        average_score: null,
        performance_level: null,
        needs_attention: false,
        last_assessment_date: null
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating empty performance record:', error);
      throw error;
    }

    return data;
  },

  async updateAllStudentPerformances() {
    console.log('Updating all student performances...');
    
    // Get all students with responses
    const { data: students, error } = await supabase
      .from('students')
      .select('id');

    if (error) {
      console.error('Error fetching students:', error);
      throw error;
    }

    if (!students || students.length === 0) {
      console.log('No students found');
      return [];
    }

    const results = [];
    for (const student of students) {
      try {
        const result = await this.updateStudentPerformance(student.id);
        if (result) {
          results.push(result);
        }
      } catch (error) {
        console.error(`Error updating performance for student ${student.id}:`, error);
      }
    }

    console.log(`Updated performance for ${results.length} students`);
    return results;
  }
};
