
import { supabase } from '@/integrations/supabase/client';
import { ParentCommunication, CommunicationFormData, ProgressReportData } from '@/types/communications';
import { pdfService, PDFGenerationOptions } from './pdf-service';

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
      const { error } = await supabase.functions.invoke('send-parent-communication', {
        body: { communication_id: communicationId }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending communication:', error);
      throw error;
    }
  }
};
