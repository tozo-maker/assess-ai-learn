
import { StudentPerformance } from '@/types/student';

export interface StudentResponseData {
  student_id: string;
  score: number;
  max_score: number;
  assessment_date: string;
}

export interface CalculatedPerformance {
  student_id: string;
  assessment_count: number;
  average_score: number;
  performance_level: string;
  needs_attention: boolean;
  last_assessment_date: string;
}

export const performanceCalculator = {
  calculateStudentPerformance(responses: StudentResponseData[]): CalculatedPerformance[] {
    // Group responses by student_id
    const studentGroups = responses.reduce((acc, response) => {
      if (!acc[response.student_id]) {
        acc[response.student_id] = [];
      }
      acc[response.student_id].push(response);
      return acc;
    }, {} as Record<string, StudentResponseData[]>);

    return Object.entries(studentGroups).map(([studentId, studentResponses]) => {
      // Calculate metrics
      const assessmentCount = studentResponses.length;
      
      // Calculate average score as percentage
      const totalScore = studentResponses.reduce((sum, response) => {
        const percentage = (response.score / response.max_score) * 100;
        return sum + percentage;
      }, 0);
      
      const averageScore = Math.round((totalScore / assessmentCount) * 100) / 100;
      
      // Determine performance level
      let performanceLevel: string;
      if (averageScore >= 85) {
        performanceLevel = 'Above Average';
      } else if (averageScore >= 70) {
        performanceLevel = 'Average';
      } else {
        performanceLevel = 'Below Average';
      }
      
      // Determine if needs attention (below 70% or declining trend)
      const needsAttention = averageScore < 70 || this.hasDeciliningTrend(studentResponses);
      
      // Get most recent assessment date
      const lastAssessmentDate = studentResponses
        .map(r => r.assessment_date)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

      return {
        student_id: studentId,
        assessment_count: assessmentCount,
        average_score: averageScore,
        performance_level: performanceLevel,
        needs_attention: needsAttention,
        last_assessment_date: lastAssessmentDate
      };
    });
  },

  hasDeciliningTrend(responses: StudentResponseData[]): boolean {
    if (responses.length < 3) return false;
    
    // Sort by date
    const sortedResponses = [...responses].sort((a, b) => 
      new Date(a.assessment_date).getTime() - new Date(b.assessment_date).getTime()
    );
    
    // Check if last 3 assessments show declining trend
    const recentResponses = sortedResponses.slice(-3);
    const scores = recentResponses.map(r => (r.score / r.max_score) * 100);
    
    return scores[0] > scores[1] && scores[1] > scores[2];
  }
};
