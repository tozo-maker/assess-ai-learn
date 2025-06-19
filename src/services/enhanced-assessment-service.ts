
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Assessment = Database['public']['Tables']['assessments']['Row'];
type AssessmentInsert = Database['public']['Tables']['assessments']['Insert'];
type AssessmentUpdate = Database['public']['Tables']['assessments']['Update'];

export class EnhancedAssessmentService {
  static async createAssessment(assessmentData: AssessmentInsert) {
    try {
      console.log('Creating assessment:', assessmentData);
      
      const { data, error } = await supabase
        .from('assessments')
        .insert(assessmentData)
        .select()
        .single();

      if (error) {
        console.error('Error creating assessment:', error);
        throw new Error(`Failed to create assessment: ${error.message}`);
      }

      console.log('Assessment created successfully:', data);
      return data;
    } catch (error) {
      console.error('Assessment creation error:', error);
      throw error;
    }
  }

  static async updateAssessment(id: string, updates: AssessmentUpdate) {
    try {
      console.log('Updating assessment:', id, updates);
      
      const { data, error } = await supabase
        .from('assessments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating assessment:', error);
        throw new Error(`Failed to update assessment: ${error.message}`);
      }

      console.log('Assessment updated successfully:', data);
      return data;
    } catch (error) {
      console.error('Assessment update error:', error);
      throw error;
    }
  }

  static async getAssessmentWithResponses(id: string) {
    try {
      console.log('Fetching assessment with responses:', id);
      
      const { data, error } = await supabase
        .from('assessments')
        .select(`
          *,
          student_responses (
            id,
            student_id,
            score,
            error_type,
            teacher_notes,
            created_at,
            students (
              first_name,
              last_name
            )
          ),
          assessment_items (
            id,
            item_number,
            question_text,
            max_score,
            knowledge_type,
            difficulty_level
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching assessment with responses:', error);
        throw new Error(`Failed to fetch assessment: ${error.message}`);
      }

      console.log('Assessment with responses fetched:', data);
      return data;
    } catch (error) {
      console.error('Assessment fetch error:', error);
      throw error;
    }
  }

  static async publishAssessment(id: string) {
    try {
      console.log('Publishing assessment:', id);
      
      const { data, error } = await supabase
        .from('assessments')
        .update({ is_draft: false })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error publishing assessment:', error);
        throw new Error(`Failed to publish assessment: ${error.message}`);
      }

      console.log('Assessment published successfully:', data);
      return data;
    } catch (error) {
      console.error('Assessment publish error:', error);
      throw error;
    }
  }

  static async getDraftAssessments(teacherId: string) {
    try {
      console.log('Fetching draft assessments for teacher:', teacherId);
      
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('teacher_id', teacherId)
        .eq('is_draft', true)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching draft assessments:', error);
        throw new Error(`Failed to fetch draft assessments: ${error.message}`);
      }

      console.log('Draft assessments fetched:', data?.length);
      return data || [];
    } catch (error) {
      console.error('Draft assessments fetch error:', error);
      throw error;
    }
  }

  static async getAssessmentAnalytics(id: string) {
    try {
      console.log('Fetching assessment analytics:', id);
      
      const { data, error } = await supabase
        .from('student_responses')
        .select(`
          score,
          error_type,
          students (
            first_name,
            last_name,
            grade_level
          )
        `)
        .eq('assessment_id', id);

      if (error) {
        console.error('Error fetching assessment analytics:', error);
        throw new Error(`Failed to fetch analytics: ${error.message}`);
      }

      // Calculate analytics
      const responses = data || [];
      const totalResponses = responses.length;
      const averageScore = totalResponses > 0 
        ? responses.reduce((sum, r) => sum + Number(r.score), 0) / totalResponses
        : 0;
      
      const scoreDistribution = responses.reduce((acc, r) => {
        const score = Number(r.score);
        if (score >= 90) acc.excellent++;
        else if (score >= 80) acc.good++;
        else if (score >= 70) acc.satisfactory++;
        else acc.needsImprovement++;
        return acc;
      }, { excellent: 0, good: 0, satisfactory: 0, needsImprovement: 0 });

      const errorTypes = responses.reduce((acc, r) => {
        if (r.error_type) {
          acc[r.error_type] = (acc[r.error_type] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      console.log('Assessment analytics calculated:', {
        totalResponses,
        averageScore,
        scoreDistribution,
        errorTypes
      });

      return {
        totalResponses,
        averageScore,
        scoreDistribution,
        errorTypes,
        responses
      };
    } catch (error) {
      console.error('Assessment analytics error:', error);
      throw error;
    }
  }
}
