
import { Goal } from './goals';

export interface ParentCommunication {
  id: string;
  student_id: string;
  teacher_id: string;
  communication_type: 'progress_report' | 'assessment_summary' | 'goal_update' | 'general' | 'ai_insight';
  subject: string;
  content: string;
  sent_at?: string;
  parent_email?: string;
  pdf_url?: string;
  created_at: string;
}

export interface CommunicationFormData {
  student_id: string;
  communication_type: 'progress_report' | 'assessment_summary' | 'goal_update' | 'general' | 'ai_insight';
  subject: string;
  content: string;
  parent_email?: string;
}

export interface ProgressReportData {
  student: {
    id: string;
    first_name: string;
    last_name: string;
    grade_level: string;
  };
  performance: {
    average_score: number;
    assessment_count: number;
    performance_level: string;
    needs_attention: boolean;
  };
  recent_assessments: Array<{
    title: string;
    score: number;
    date: string;
    subject: string;
  }>;
  goals: Goal[];
  ai_insights: {
    strengths: string[];
    growth_areas: string[];
    recommendations: string[];
  };
}
