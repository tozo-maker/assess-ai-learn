
export interface PDFGenerationRequest {
  student_id: string;
  report_data?: any;
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
  goals: any[];
  ai_insights: {
    strengths: string[];
    growth_areas: string[];
    recommendations: string[];
  };
}

export interface CommunicationRequest {
  student_id: string;
  communication_type: string;
  subject: string;
  report_data?: any;
  parent_email?: string;
}
