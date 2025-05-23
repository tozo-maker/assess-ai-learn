
export interface DataExport {
  id: string;
  teacher_id: string;
  export_type: 'student_data' | 'assessment_results' | 'progress_reports' | 'class_summary';
  export_format: 'csv' | 'pdf';
  filters?: Record<string, any>;
  file_url?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
}

export interface ExportRequestData {
  export_type: 'student_data' | 'assessment_results' | 'progress_reports' | 'class_summary';
  export_format: 'csv' | 'pdf';
  filters?: {
    student_ids?: string[];
    grade_level?: string;
    subject?: string;
    date_range?: {
      start: string;
      end: string;
    };
  };
}
