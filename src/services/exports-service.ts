
import { supabase } from '@/integrations/supabase/client';
import { DataExport, ExportRequestData } from '@/types/exports';

export const exportsService = {
  async getExports(): Promise<DataExport[]> {
    const { data, error } = await supabase
      .from('data_exports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as DataExport[];
  },

  async requestExport(exportData: ExportRequestData): Promise<DataExport> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('data_exports')
        .insert({
          teacher_id: user.user.id,
          ...exportData,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Trigger the export processing
      await supabase.functions.invoke('process-data-export', {
        body: { export_id: data.id }
      });

      return data as DataExport;
    } catch (error) {
      console.error('Error requesting export:', error);
      throw error;
    }
  },

  async downloadExport(exportId: string): Promise<string> {
    const { data, error } = await supabase
      .from('data_exports')
      .select('file_url')
      .eq('id', exportId)
      .single();

    if (error) throw error;
    
    if (!data.file_url) {
      throw new Error('Export file not ready');
    }

    return data.file_url;
  }
};
