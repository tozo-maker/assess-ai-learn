
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { DataExportRequest } from '../_shared/types.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { export_id }: DataExportRequest = await req.json();
    
    if (!export_id) {
      throw new Error('Export ID is required');
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Update export status to processing
    await supabase
      .from('data_exports')
      .update({ status: 'processing' })
      .eq('id', export_id);
    
    // Fetch the export request details
    const { data: exportRequest, error: exportError } = await supabase
      .from('data_exports')
      .select('*')
      .eq('id', export_id)
      .single();
    
    if (exportError || !exportRequest) {
      throw new Error(`Export request not found: ${exportError?.message || 'Unknown error'}`);
    }
    
    // Process the export based on the type and format
    let data: any[] = [];
    let error = null;
    
    // Build the query based on filters
    let query = supabase.from('students').select('*');
    
    // Apply filters if they exist
    if (exportRequest.filters) {
      if (exportRequest.filters.student_ids && exportRequest.filters.student_ids.length > 0) {
        query = query.in('id', exportRequest.filters.student_ids);
      }
      
      if (exportRequest.filters.grade_level) {
        query = query.eq('grade_level', exportRequest.filters.grade_level);
      }
    }
    
    // Fetch student data
    if (exportRequest.export_type === 'student_data') {
      const { data: studentData, error: studentError } = await query;
      data = studentData || [];
      error = studentError;
    }
    // Fetch assessment results
    else if (exportRequest.export_type === 'assessment_results') {
      // First get the students based on filters
      const { data: studentData } = await query;
      
      if (studentData && studentData.length > 0) {
        // Get student IDs
        const studentIds = studentData.map(s => s.id);
        
        // Fetch assessment results for these students
        let assessmentQuery = supabase
          .from('student_responses')
          .select(`
            id,
            student_id,
            assessment_id,
            score,
            error_type,
            created_at,
            students:student_id(first_name, last_name),
            assessments:assessment_id(title, subject, assessment_date)
          `)
          .in('student_id', studentIds);
        
        // Apply subject filter if it exists
        if (exportRequest.filters && exportRequest.filters.subject) {
          assessmentQuery = assessmentQuery.eq('assessments.subject', exportRequest.filters.subject);
        }
        
        const { data: assessmentData, error: assessmentError } = await assessmentQuery;
        data = assessmentData || [];
        error = assessmentError;
      }
    }
    // Process progress reports
    else if (exportRequest.export_type === 'progress_reports') {
      // Get students based on filters
      const { data: studentData } = await query;
      
      if (studentData && studentData.length > 0) {
        const reportPromises = studentData.map(async (student) => {
          // Get progress report data for each student
          const reportResponse = await supabase.functions.invoke('generate-progress-report', {
            body: JSON.stringify({ student_id: student.id }),
          });
          
          return reportResponse.data;
        });
        
        data = await Promise.all(reportPromises);
      }
    }
    // Process class summary
    else if (exportRequest.export_type === 'class_summary') {
      // Get students based on filters
      const { data: studentData } = await query;
      
      if (studentData && studentData.length > 0) {
        // Get performance data for each student
        const studentIds = studentData.map(s => s.id);
        
        const { data: performanceData, error: performanceError } = await supabase
          .from('student_performance')
          .select('*')
          .in('student_id', studentIds);
        
        // Join student data with performance data
        const classSummary = studentData.map(student => {
          const performance = performanceData?.find(p => p.student_id === student.id) || {
            average_score: 0,
            assessment_count: 0,
            performance_level: 'Not available',
            needs_attention: false
          };
          
          return {
            student_id: student.id,
            first_name: student.first_name,
            last_name: student.last_name,
            grade_level: student.grade_level,
            average_score: performance.average_score,
            assessment_count: performance.assessment_count,
            performance_level: performance.performance_level,
            needs_attention: performance.needs_attention
          };
        });
        
        data = classSummary;
        error = performanceError;
      }
    }
    
    if (error) {
      // Update export status to failed
      await supabase
        .from('data_exports')
        .update({ 
          status: 'failed',
          completed_at: new Date().toISOString()
        })
        .eq('id', export_id);
      
      throw new Error(`Error processing export: ${error.message}`);
    }
    
    // Generate file content
    let fileContent = '';
    let fileExt = '';
    let contentType = '';
    
    // Format as CSV
    if (exportRequest.export_format === 'csv') {
      fileContent = formatAsCSV(data);
      fileExt = 'csv';
      contentType = 'text/csv';
    }
    // Format as PDF
    else if (exportRequest.export_format === 'pdf') {
      // In a real implementation, generate PDF content
      fileContent = JSON.stringify(data);
      fileExt = 'json';  // Using JSON for now as placeholder
      contentType = 'application/json';
    }
    
    // In a real implementation, upload the file to storage and get a URL
    // For this example, we'll simulate a file URL
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `export_${exportRequest.export_type}_${timestamp}.${fileExt}`;
    const fileUrl = `https://storage.googleapis.com/example-bucket/${fileName}`;
    
    // Update export status to completed with the file URL
    await supabase
      .from('data_exports')
      .update({ 
        status: 'completed',
        file_url: fileUrl,
        completed_at: new Date().toISOString()
      })
      .eq('id', export_id);
    
    return new Response(JSON.stringify({ 
      success: true,
      export_id: export_id,
      file_url: fileUrl
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in process-data-export function:', error);
    
    // Try to update the export status to failed
    try {
      const { export_id } = await req.json();
      if (export_id) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
        const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') as string;
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        await supabase
          .from('data_exports')
          .update({ 
            status: 'failed',
            completed_at: new Date().toISOString()
          })
          .eq('id', export_id);
      }
    } catch (e) {
      console.error('Failed to update export status:', e);
    }
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper function to format data as CSV
function formatAsCSV(data: any[]): string {
  if (!data || data.length === 0) return '';
  
  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create header row
  let csv = headers.join(',') + '\n';
  
  // Add data rows
  data.forEach(item => {
    const row = headers.map(header => {
      const value = item[header];
      
      // Handle special cases
      if (value === null || value === undefined) return '';
      if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
      if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      
      return String(value);
    });
    
    csv += row.join(',') + '\n';
  });
  
  return csv;
}
