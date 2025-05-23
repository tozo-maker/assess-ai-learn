
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
    const { data, error } = await supabase.functions.invoke('generate-progress-report', {
      body: { student_id: studentId }
    });

    if (error) throw error;
    return data as ProgressReportData;
  },

  async generateProgressReportPDF(studentId: string): Promise<string> {
    const { data, error } = await supabase.functions.invoke('generate-progress-pdf', {
      body: { student_id: studentId }
    });

    if (error) throw error;
    return data.pdf_url;
  },

  async sendCommunication(communicationId: string): Promise<void> {
    const { error } = await supabase.functions.invoke('send-parent-communication', {
      body: { communication_id: communicationId }
    });

    if (error) throw error;
  }
};
