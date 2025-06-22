
import { supabase } from '@/integrations/supabase/client';
import { ParentCommunication, ProgressReportData } from '@/types/communications';

export const communicationsService = {
  async getCommunications(): Promise<ParentCommunication[]> {
    // Mock data for now - replace with actual Supabase query when table is created
    return [
      {
        id: '1',
        student_id: '1',
        teacher_id: '1',
        communication_type: 'progress_report',
        subject: 'Weekly Progress Report for John Doe',
        content: 'John has shown excellent progress this week...',
        parent_email: 'parent@example.com',
        email_status: 'sent',
        sent_at: '2024-01-15T10:00:00Z',
        created_at: '2024-01-15T09:30:00Z'
      },
      {
        id: '2',
        student_id: '2',
        teacher_id: '1',
        communication_type: 'progress_report',
        subject: 'Great Achievement - Math Assessment',
        content: 'Congratulations! Your child scored 95% on the recent math assessment.',
        parent_email: 'parent2@example.com',
        email_status: 'sent',
        sent_at: '2024-01-14T14:30:00Z',
        created_at: '2024-01-14T14:00:00Z'
      }
    ];
  },

  async createCommunication(data: Omit<ParentCommunication, 'id' | 'created_at'>): Promise<ParentCommunication> {
    // Mock implementation - replace with actual Supabase insert
    const newCommunication: ParentCommunication = {
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      ...data
    };
    return newCommunication;
  },

  async generateProgressReport(studentId: string): Promise<ProgressReportData> {
    // Mock progress report data - replace with actual implementation
    return {
      student: {
        id: studentId,
        first_name: 'John',
        last_name: 'Doe',
        grade_level: '5th Grade'
      },
      performance: {
        average_score: 85,
        assessment_count: 12,
        performance_level: 'Proficient',
        needs_attention: false
      },
      recent_assessments: [
        {
          title: 'Math Quiz #5',
          score: 92,
          date: '2024-01-15',
          subject: 'Mathematics'
        },
        {
          title: 'Reading Comprehension',
          score: 88,
          date: '2024-01-12',
          subject: 'English'
        }
      ],
      goals: [],
      ai_insights: {
        strengths: ['Strong mathematical reasoning', 'Excellent problem-solving skills'],
        growth_areas: ['Reading fluency', 'Writing organization'],
        recommendations: ['Practice daily reading', 'Use graphic organizers for writing']
      }
    };
  },

  async generateProgressReportPDF(studentId: string) {
    const { data, error } = await supabase.functions.invoke('generate-progress-pdf', {
      body: { student_id: studentId }
    });

    if (error) {
      throw new Error(error.message);
    }

    return data?.pdf_url || '';
  },

  async generateBulkProgressReports(studentIds: string[]) {
    // Mock implementation for bulk report generation
    return {
      success: studentIds.length,
      failed: 0,
      reports: studentIds.map(id => ({
        student_id: id,
        pdf_url: `mock-pdf-url-${id}.pdf`
      }))
    };
  }
};
