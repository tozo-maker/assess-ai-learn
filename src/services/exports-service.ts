// data_exports table doesn't exist in the schema
// This service provides mock implementations

export interface DataExport {
  id: string;
  teacher_id: string;
  export_type: string;
  export_format: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_url?: string;
  created_at: string;
}

export interface ExportRequestData {
  export_type: string;
  export_format: string;
  filters?: Record<string, unknown>;
}

export const exportsService = {
  async getExports(): Promise<DataExport[]> {
    // data_exports table doesn't exist - return empty array
    console.log('getExports called - table not implemented');
    return [];
  },

  async requestExport(exportData: ExportRequestData): Promise<DataExport> {
    // data_exports table doesn't exist - return mock
    console.log('requestExport called - table not implemented', exportData);
    
    const mockExport: DataExport = {
      id: crypto.randomUUID(),
      teacher_id: 'mock-teacher-id',
      export_type: exportData.export_type,
      export_format: exportData.export_format,
      status: 'completed',
      file_url: undefined,
      created_at: new Date().toISOString()
    };
    
    return mockExport;
  },

  async downloadExport(exportItem: DataExport): Promise<void> {
    if (!exportItem.file_url) {
      throw new Error('Export file not ready');
    }

    // Create download link
    const link = document.createElement('a');
    link.href = exportItem.file_url;
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${exportItem.export_type}_${timestamp}.csv`;
    link.download = filename;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  async deleteExport(exportId: string): Promise<void> {
    // data_exports table doesn't exist
    console.log('deleteExport called - table not implemented', exportId);
  }
};

// Re-export types for backwards compatibility
export type { DataExport as Export };
