
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

  async downloadExport(exportItem: DataExport): Promise<void> {
    if (!exportItem.file_url) {
      throw new Error('Export file not ready');
    }

    try {
      // Create download link for data URL
      const link = document.createElement('a');
      link.href = exportItem.file_url;
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${exportItem.export_type}_${timestamp}.csv`;
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading export:', error);
      throw error;
    }
  },

  async deleteExport(exportId: string): Promise<void> {
    const { error } = await supabase
      .from('data_exports')
      .delete()
      .eq('id', exportId);

    if (error) throw error;
  }
};
