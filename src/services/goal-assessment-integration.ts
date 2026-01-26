import { supabase } from '@/integrations/supabase/client';

export const goalAssessmentIntegration = {
  // Link assessment performance to relevant goals
  async linkAssessmentToGoals(assessmentId: string, studentId: string): Promise<void> {
    try {
      // Get assessment data
      const { data: assessment } = await supabase
        .from('assessments')
        .select('subject, title')
        .eq('id', assessmentId)
        .single();

      if (!assessment) return;

      // Get student goals that match the assessment subject
      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('student_id', studentId)
        .eq('status', 'active')
        .ilike('description', `%${assessment.subject || ''}%`);

      // Log the linkage for tracking
      console.log(`Linked assessment ${assessment.title} to ${goals?.length || 0} goals`);
    } catch (error) {
      console.error('Error linking assessment to goals:', error);
    }
  },

  // Generate goal suggestions based on assessment analysis
  async generateGoalSuggestionsFromAssessment(assessmentId: string, studentId: string): Promise<string[]> {
    try {
      // Get assessment analysis
      const { data: analysis } = await supabase
        .from('assessment_analysis')
        .select('growth_areas, recommendations')
        .eq('assessment_id', assessmentId)
        .eq('student_id', studentId)
        .single();

      if (!analysis) return [];

      const suggestions: string[] = [];

      // Convert growth areas to goal suggestions
      (analysis.growth_areas || []).forEach(area => {
        suggestions.push(`Improve ${area.toLowerCase()} through targeted practice and exercises`);
      });

      // Convert recommendations to goal suggestions
      (analysis.recommendations || []).forEach(rec => {
        if (rec.toLowerCase().includes('practice') || rec.toLowerCase().includes('improve')) {
          suggestions.push(rec);
        }
      });

      return suggestions.slice(0, 5); // Limit to 5 suggestions
    } catch (error) {
      console.error('Error generating goal suggestions from assessment:', error);
      return [];
    }
  },

  // Suggest goal progress updates based on assessment improvements
  async suggestProgressUpdates(studentId: string): Promise<Array<{goalId: string, suggestedProgress: number, reason: string}>> {
    try {
      const suggestions: Array<{goalId: string, suggestedProgress: number, reason: string}> = [];

      // Get active goals for student - use 'progress' not 'progress_percentage'
      const { data: goals } = await supabase
        .from('goals')
        .select('id, title, progress, description')
        .eq('student_id', studentId)
        .eq('status', 'active');

      if (!goals) return suggestions;

      // Get recent assessments with good performance
      const { data: recentAssessments } = await supabase
        .from('student_responses')
        .select(`
          assessment_id,
          score,
          assessments!inner(subject, max_score, title)
        `)
        .eq('student_id', studentId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      // Analyze performance and suggest progress updates
      for (const goal of goals) {
        const relatedAssessments = recentAssessments?.filter(assessment => {
          const subject = assessment.assessments?.subject || '';
          return goal.description?.toLowerCase().includes(subject.toLowerCase());
        }) || [];

        if (relatedAssessments.length > 0) {
          const averageScore = relatedAssessments.reduce((acc, curr) => {
            const maxScore = curr.assessments?.max_score || 100;
            return acc + ((curr.score || 0) / maxScore * 100);
          }, 0) / relatedAssessments.length;

          const currentProgress = goal.progress || 0;
          if (averageScore > 80 && currentProgress < 80) {
            suggestions.push({
              goalId: goal.id,
              suggestedProgress: Math.min(90, currentProgress + 20),
              reason: `Strong performance in recent assessments (${Math.round(averageScore)}% average)`
            });
          }
        }
      }

      return suggestions;
    } catch (error) {
      console.error('Error suggesting progress updates:', error);
      return [];
    }
  },

  // Check for goal achievements based on assessment targets
  async checkGoalAchievements(studentId: string): Promise<Array<{goalId: string, achieved: boolean, assessmentTitle: string}>> {
    try {
      const achievements: Array<{goalId: string, achieved: boolean, assessmentTitle: string}> = [];

      // Get goals close to completion - use 'progress' not 'progress_percentage'
      const { data: goals } = await supabase
        .from('goals')
        .select('id, title, progress, target_date')
        .eq('student_id', studentId)
        .eq('status', 'active')
        .gte('progress', 80);

      if (!goals) return achievements;

      // Check recent assessment performance
      const { data: recentHighScores } = await supabase
        .from('student_responses')
        .select(`
          score,
          assessments!inner(max_score, title, subject)
        `)
        .eq('student_id', studentId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      for (const goal of goals) {
        const highPerformance = recentHighScores?.find(score => {
          const maxScore = score.assessments?.max_score || 100;
          return ((score.score || 0) / maxScore * 100) >= 90;
        });

        const currentProgress = goal.progress || 0;
        if (highPerformance && currentProgress >= 90) {
          achievements.push({
            goalId: goal.id,
            achieved: true,
            assessmentTitle: highPerformance.assessments?.title || 'Unknown'
          });
        }
      }

      return achievements;
    } catch (error) {
      console.error('Error checking goal achievements:', error);
      return [];
    }
  }
};
