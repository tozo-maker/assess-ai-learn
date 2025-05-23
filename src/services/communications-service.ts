
import { supabase } from '@/integrations/supabase/client';
import { ParentCommunication, CommunicationFormData, ProgressReportData } from '@/types/communications';

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

  async generateProgressReportPDF(studentId: string): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-progress-pdf', {
        body: { student_id: studentId }
      });

      if (error) throw error;
      return data.pdf_url;
    } catch (error) {
      console.error('Error generating PDF report:', error);
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
