
// Shared types for Edge Functions

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
  goals: Array<{
    id: string;
    title: string;
    description?: string;
    target_date?: string;
    progress_percentage: number;
    status: string;
  }>;
  ai_insights: {
    strengths: string[];
    growth_areas: string[];
    recommendations: string[];
  };
}

export interface PDFGenerationRequest {
  student_id: string;
  template?: string;
  include_charts?: boolean;
  include_goals?: boolean;
}

export interface EmailRequest {
  communication_id: string;
}

export interface GoalSuggestionsRequest {
  student_id: string;
}

export interface DataExportRequest {
  export_id: string;
}
