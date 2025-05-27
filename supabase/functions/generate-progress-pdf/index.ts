
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { PDFGenerationRequest } from '../_shared/types.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simulated PDF generation - in a real app, use a PDF generation library or service
async function generatePDF(report: any): Promise<string> {
  // In a production app, use a PDF generation service like PDFLayer, Puppeteer in a serverless function,
  // or a service like DocRaptor
  
  // For this example, we'll simulate PDF generation and return a dummy URL
  console.log("Generating PDF for student:", report.student.first_name, report.student.last_name);
  
  // In a real implementation, you would:
  // 1. Generate the PDF content
  // 2. Upload it to Supabase Storage
  // 3. Return the URL to the uploaded file
  
  // Simulated URL for now - in production, use Supabase Storage
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `progress_report_${report.student.id}_${timestamp}.pdf`;
  return `https://storage.googleapis.com/example-bucket/${filename}`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { student_id }: PDFGenerationRequest = await req.json();
    
    if (!student_id) {
      throw new Error('Student ID is required');
    }
    
    console.log(`Generating PDF for student: ${student_id}`);
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get authenticated user for RLS
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Authentication required');
    }
    
    // First, get the report data using the generate-progress-report function
    try {
      const reportResponse = await supabase.functions.invoke('generate-progress-report', {
        body: { student_id },
      });
      
      if (reportResponse.error) {
        console.error('Error from generate-progress-report:', reportResponse.error);
        throw new Error(`Error fetching report data: ${reportResponse.error.message}`);
      }
      
      if (!reportResponse.data) {
        throw new Error('No report data returned from generate-progress-report function');
      }
      
      const reportData = reportResponse.data;
      console.log('Successfully fetched report data');
      
      // Generate PDF from report data
      const pdfUrl = await generatePDF(reportData);
      console.log('PDF generated with URL:', pdfUrl);
      
      // Save the PDF URL to the communications table with proper filtering
      const { data: communication, error: communicationError } = await supabase
        .from('parent_communications')
        .insert({
          student_id,
          teacher_id: user.id,
          communication_type: 'progress_report',
          subject: `Progress Report for ${reportData.student.first_name} ${reportData.student.last_name}`,
          content: `Generated progress report on ${new Date().toLocaleDateString()}`,
          pdf_url: pdfUrl,
        })
        .select()
        .single();
      
      if (communicationError) {
        console.error("Error saving communication:", communicationError);
        // Don't throw here - PDF was generated successfully, just logging failed
      } else {
        console.log('Communication record saved successfully');
      }
      
      // Return the PDF URL
      return new Response(JSON.stringify({ pdf_url: pdfUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
      
    } catch (reportError) {
      console.error('Error generating or fetching report:', reportError);
      throw new Error(`Failed to generate report: ${reportError.message}`);
    }
    
  } catch (error) {
    console.error('Error in generate-progress-pdf function:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Check Edge Function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
