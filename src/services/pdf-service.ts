
import { supabase } from '@/integrations/supabase/client';

export interface PDFGenerationOptions {
  includeCharts?: boolean;
  includeGoals?: boolean;
  includeInsights?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  customNotes?: string;
}

export const pdfService = {
  async generateProgressReportPDF(
    studentId: string, 
    options: PDFGenerationOptions = {}
  ): Promise<string> {
    try {
      console.log('Generating PDF for student:', studentId);
      
      const { data, error } = await supabase.functions.invoke('generate-progress-pdf', {
        body: { 
          student_id: studentId,
          options 
        }
      });

      if (error) {
        console.error('PDF generation error:', error);
        throw new Error(`Failed to generate PDF: ${error.message}`);
      }

      if (!data?.pdf_url) {
        throw new Error('No PDF URL returned from service');
      }

      return data.pdf_url;
    } catch (error) {
      console.error('Error in PDF service:', error);
      throw error;
    }
  },

  async downloadPDF(pdfUrl: string, filename: string): Promise<void> {
    try {
      if (pdfUrl.startsWith('data:application/pdf;base64,')) {
        // Handle data URL download
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Handle regular URL download
        const response = await fetch(pdfUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      throw new Error('Failed to download PDF');
    }
  },

  async generateBulkReports(
    studentIds: string[], 
    options: PDFGenerationOptions = {}
  ): Promise<{ success: string[], failed: string[] }> {
    const results = {
      success: [] as string[],
      failed: [] as string[]
    };

    for (const studentId of studentIds) {
      try {
        await this.generateProgressReportPDF(studentId, options);
        results.success.push(studentId);
      } catch (error) {
        console.error(`Failed to generate PDF for student ${studentId}:`, error);
        results.failed.push(studentId);
      }
    }

    return results;
  }
};
