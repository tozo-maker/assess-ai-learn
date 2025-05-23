
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
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // First, get the report data using the generate-progress-report function
    const reportResponse = await supabase.functions.invoke('generate-progress-report', {
      body: JSON.stringify({ student_id }),
    });
    
    if (reportResponse.error) {
      throw new Error(`Error fetching report data: ${reportResponse.error.message}`);
    }
    
    const reportData = reportResponse.data;
    
    // Generate PDF from report data
    const pdfUrl = await generatePDF(reportData);
    
    // Save the PDF URL to the communications table
    const { data: communication, error: communicationError } = await supabase
      .from('parent_communications')
      .insert({
        student_id,
        teacher_id: (await supabase.auth.getUser()).data.user?.id,
        communication_type: 'progress_report',
        subject: `Progress Report for ${reportData.student.first_name} ${reportData.student.last_name}`,
        content: `Generated progress report on ${new Date().toLocaleDateString()}`,
        pdf_url: pdfUrl,
      })
      .select()
      .single();
    
    if (communicationError) {
      console.error("Error saving communication:", communicationError);
    }
    
    // Return the PDF URL
    return new Response(JSON.stringify({ pdf_url: pdfUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in generate-progress-pdf function:', error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
