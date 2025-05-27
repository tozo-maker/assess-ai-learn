
import { supabase } from '@/integrations/supabase/client';
import { ParentCommunication, CommunicationFormData, ProgressReportData } from '@/types/communications';
import { pdfService, PDFGenerationOptions } from './pdf-service';
import { emailService } from './email-service';

export const communicationsService = {
  async getCommunications(): Promise<ParentCommunication[]> {
    const { data, error } = await supabase
      .from('parent_communications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as ParentCommunication[];
  },

  async createCommunication(communicationData: CommunicationFormData): Promise<ParentCommunication> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('parent_communications')
      .insert({
        teacher_id: user.user.id,
        ...communicationData
      })
      .select()
      .single();

    if (error) throw error;
    return data as ParentCommunication;
  },

  async generateProgressReport(studentId: string): Promise<ProgressReportData> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-progress-report', {
        body: { student_id: studentId }
      });

      if (error) throw error;
      return data as ProgressReportData;
    } catch (error) {
      console.error('Error generating progress report:', error);
      throw error;
    }
  },

  async generateProgressReportPDF(
    studentId: string, 
    options: PDFGenerationOptions = {}
  ): Promise<string> {
    try {
      return await pdfService.generateProgressReportPDF(studentId, options);
    } catch (error) {
      console.error('Error generating progress report PDF:', error);
      throw error;
    }
  },

  async downloadProgressReportPDF(studentId: string, studentName: string): Promise<void> {
    try {
      const pdfUrl = await this.generateProgressReportPDF(studentId);
      const filename = `${studentName.replace(/\s+/g, '_')}_Progress_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      await pdfService.downloadPDF(pdfUrl, filename);
    } catch (error) {
      console.error('Error downloading progress report PDF:', error);
      throw error;
    }
  },

  async generateBulkProgressReports(
    studentIds: string[], 
    options: PDFGenerationOptions = {}
  ): Promise<{ success: string[], failed: string[] }> {
    try {
      return await pdfService.generateBulkReports(studentIds, options);
    } catch (error) {
      console.error('Error generating bulk progress reports:', error);
      throw error;
    }
  },

  async sendCommunication(communicationId: string): Promise<void> {
    try {
      const result = await emailService.sendCommunicationEmail(communicationId);
      if (!result.success) {
        throw new Error('Failed to send email communication');
      }
    } catch (error) {
      console.error('Error sending communication:', error);
      throw error;
    }
  },

  async sendProgressReportEmail(studentId: string, reportData?: ProgressReportData): Promise<void> {
    try {
      let data = reportData;
      if (!data) {
        data = await this.generateProgressReport(studentId);
      }

      // Create communication record
      const communication = await this.createCommunication({
        student_id: studentId,
        communication_type: 'progress_report',
        subject: `Progress Report for ${data.student.first_name} ${data.student.last_name}`,
        content: this.formatProgressReportContent(data),
        parent_email: ''
      });

      // Send email
      await this.sendCommunication(communication.id);
    } catch (error) {
      console.error('Error sending progress report email:', error);
      throw error;
    }
  },

  async sendBulkProgressReports(studentIds: string[]): Promise<void> {
    try {
      const results = [];
      for (const studentId of studentIds) {
        try {
          await this.sendProgressReportEmail(studentId);
          results.push({ studentId, success: true });
        } catch (error) {
          console.error(`Failed to send progress report for student ${studentId}:`, error);
          results.push({ studentId, success: false, error: error.message });
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error sending bulk progress reports:', error);
      throw error;
    }
  },

  async sendAchievementNotification(studentId: string, achievement: string): Promise<void> {
    try {
      await emailService.sendAchievementNotification(studentId, achievement);
    } catch (error) {
      console.error('Error sending achievement notification:', error);
      throw error;
    }
  },

  async sendConcernAlert(studentId: string, concern: string): Promise<void> {
    try {
      await emailService.sendConcernAlert(studentId, concern);
    } catch (error) {
      console.error('Error sending concern alert:', error);
      throw error;
    }
  },

  private formatProgressReportContent(reportData: ProgressReportData): string {
    const { student, performance, recent_assessments, goals, ai_insights } = reportData;
    
    return `
      <h2>Progress Summary</h2>
      <p><strong>Overall Performance:</strong> ${performance.performance_level}</p>
      <p><strong>Average Score:</strong> ${performance.average_score}%</p>
      <p><strong>Assessments Completed:</strong> ${performance.assessment_count}</p>
      
      <h3>Recent Assessment Results</h3>
      ${recent_assessments.map(assessment => `
        <p>• ${assessment.title}: ${assessment.score}% (${assessment.date})</p>
      `).join('')}
      
      <h3>Learning Goals Progress</h3>
      ${goals.map(goal => `
        <p>• ${goal.title}: ${goal.progress_percentage}% complete</p>
      `).join('')}
      
      <h3>Teacher Insights</h3>
      <p><strong>Strengths:</strong> ${ai_insights.strengths.join(', ')}</p>
      <p><strong>Growth Areas:</strong> ${ai_insights.growth_areas.join(', ')}</p>
      <p><strong>Recommendations:</strong> ${ai_insights.recommendations.join(', ')}</p>
    `;
  }
};
