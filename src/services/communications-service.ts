
import { supabase } from '@/integrations/supabase/client';
import { emailService } from './email-service';
import { pdfService } from './pdf-service';
import { ProgressReportData } from '@/types/communications';

export interface BulkReportResult {
  success: string[];
  failed: string[];
}

class CommunicationsService {
  async generateProgressReport(studentId: string): Promise<ProgressReportData> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-progress-report', {
        body: { student_id: studentId }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data as ProgressReportData;
    } catch (error) {
      console.error('Error generating progress report:', error);
      throw error;
    }
  }

  async generateProgressReportPDF(studentId: string): Promise<string> {
    try {
      return await pdfService.generateProgressReportPDF(studentId);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  async generateBulkProgressReports(studentIds: string[]): Promise<BulkReportResult> {
    const results: BulkReportResult = {
      success: [],
      failed: []
    };

    for (const studentId of studentIds) {
      try {
        await this.generateProgressReportPDF(studentId);
        results.success.push(studentId);
      } catch (error) {
        console.error(`Failed to generate report for student ${studentId}:`, error);
        results.failed.push(studentId);
      }
    }

    return results;
  }

  async getCommunications() {
    const { data, error } = await supabase
      .from('parent_communications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  async sendProgressReportEmail(studentId: string, reportData: ProgressReportData) {
    try {
      // Get student info for email
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('first_name, last_name, parent_email')
        .eq('id', studentId)
        .single();

      if (studentError || !student?.parent_email) {
        throw new Error('Student not found or no parent email available');
      }

      // Send email using email service
      await emailService.sendEmail({
        recipients: [student.parent_email],
        subject: `Progress Report for ${student.first_name} ${student.last_name}`,
        template_type: 'progress_report',
        template_data: reportData
      });

      // Save communication record
      const { error: saveError } = await supabase
        .from('parent_communications')
        .insert({
          student_id: studentId,
          teacher_id: (await supabase.auth.getUser()).data.user?.id,
          communication_type: 'progress_report',
          subject: `Progress Report for ${student.first_name} ${student.last_name}`,
          content: 'Progress report sent via email',
          parent_email: student.parent_email,
          email_status: 'sent'
        });

      if (saveError) {
        console.error('Error saving communication record:', saveError);
      }

    } catch (error) {
      console.error('Error sending progress report email:', error);
      throw error;
    }
  }
}

export const communicationsService = new CommunicationsService();
