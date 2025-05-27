
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { PDFDocument, rgb, StandardFonts } from 'https://esm.sh/pdf-lib@1.17.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StudentReportData {
  student: {
    id: string;
    first_name: string;
    last_name: string;
    grade_level: string;
  };
  performance: {
    average_score: number;
    assessment_count: number;
    performance_level: string;
    needs_attention: boolean;
  };
  recent_assessments: Array<{
    title: string;
    score: number;
    date: string;
    subject: string;
  }>;
  goals: Array<{
    title: string;
    status: string;
    progress_percentage: number;
  }>;
  ai_insights: {
    strengths: string[];
    growth_areas: string[];
    recommendations: string[];
  };
}

async function generatePDFReport(reportData: StudentReportData): Promise<Uint8Array> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  
  // Embed fonts
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Add a page
  const page = pdfDoc.addPage([612, 792]); // 8.5 x 11 inches
  const { width, height } = page.getSize();
  
  let yPosition = height - 50;
  
  // Header
  page.drawText('LearnSpark AI - Progress Report', {
    x: 50,
    y: yPosition,
    size: 24,
    font: helveticaBoldFont,
    color: rgb(0.15, 0.39, 0.92), // Blue color
  });
  
  yPosition -= 30;
  page.drawText(`Student: ${reportData.student.first_name} ${reportData.student.last_name}`, {
    x: 50,
    y: yPosition,
    size: 16,
    font: helveticaBoldFont,
  });
  
  yPosition -= 20;
  page.drawText(`Grade: ${reportData.student.grade_level} | Generated: ${new Date().toLocaleDateString()}`, {
    x: 50,
    y: yPosition,
    size: 12,
    font: helveticaFont,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  // Draw a line
  yPosition -= 15;
  page.drawLine({
    start: { x: 50, y: yPosition },
    end: { x: width - 50, y: yPosition },
    thickness: 2,
    color: rgb(0.15, 0.39, 0.92),
  });
  
  yPosition -= 30;
  
  // Performance Summary
  page.drawText('Performance Summary', {
    x: 50,
    y: yPosition,
    size: 18,
    font: helveticaBoldFont,
  });
  
  yPosition -= 25;
  page.drawText(`Average Score: ${reportData.performance.average_score}%`, {
    x: 70,
    y: yPosition,
    size: 12,
    font: helveticaFont,
  });
  
  yPosition -= 18;
  page.drawText(`Performance Level: ${reportData.performance.performance_level}`, {
    x: 70,
    y: yPosition,
    size: 12,
    font: helveticaFont,
  });
  
  yPosition -= 18;
  page.drawText(`Assessments Completed: ${reportData.performance.assessment_count}`, {
    x: 70,
    y: yPosition,
    size: 12,
    font: helveticaFont,
  });
  
  yPosition -= 30;
  
  // Recent Assessments
  if (reportData.recent_assessments.length > 0) {
    page.drawText('Recent Assessments', {
      x: 50,
      y: yPosition,
      size: 18,
      font: helveticaBoldFont,
    });
    
    yPosition -= 25;
    
    reportData.recent_assessments.slice(0, 5).forEach((assessment, index) => {
      page.drawText(`• ${assessment.title}: ${assessment.score}% (${assessment.subject})`, {
        x: 70,
        y: yPosition,
        size: 12,
        font: helveticaFont,
      });
      yPosition -= 18;
    });
    
    yPosition -= 15;
  }
  
  // AI Insights
  page.drawText('Key Insights', {
    x: 50,
    y: yPosition,
    size: 18,
    font: helveticaBoldFont,
  });
  
  yPosition -= 25;
  
  // Strengths
  if (reportData.ai_insights.strengths.length > 0) {
    page.drawText('Strengths:', {
      x: 70,
      y: yPosition,
      size: 14,
      font: helveticaBoldFont,
      color: rgb(0, 0.6, 0),
    });
    yPosition -= 20;
    
    reportData.ai_insights.strengths.slice(0, 3).forEach((strength) => {
      const wrappedText = wrapText(strength, 70, helveticaFont, 12);
      wrappedText.forEach((line) => {
        page.drawText(`• ${line}`, {
          x: 90,
          y: yPosition,
          size: 12,
          font: helveticaFont,
        });
        yPosition -= 15;
      });
    });
    
    yPosition -= 10;
  }
  
  // Growth Areas
  if (reportData.ai_insights.growth_areas.length > 0) {
    page.drawText('Areas for Growth:', {
      x: 70,
      y: yPosition,
      size: 14,
      font: helveticaBoldFont,
      color: rgb(0.8, 0.4, 0),
    });
    yPosition -= 20;
    
    reportData.ai_insights.growth_areas.slice(0, 3).forEach((area) => {
      const wrappedText = wrapText(area, 70, helveticaFont, 12);
      wrappedText.forEach((line) => {
        page.drawText(`• ${line}`, {
          x: 90,
          y: yPosition,
          size: 12,
          font: helveticaFont,
        });
        yPosition -= 15;
      });
    });
    
    yPosition -= 10;
  }
  
  // Goals Progress
  if (reportData.goals.length > 0) {
    page.drawText('Learning Goals Progress', {
      x: 50,
      y: yPosition,
      size: 18,
      font: helveticaBoldFont,
    });
    
    yPosition -= 25;
    
    reportData.goals.slice(0, 3).forEach((goal) => {
      page.drawText(`• ${goal.title}`, {
        x: 70,
        y: yPosition,
        size: 12,
        font: helveticaFont,
      });
      
      // Progress bar
      const barWidth = 150;
      const barHeight = 8;
      const progressWidth = (goal.progress_percentage / 100) * barWidth;
      
      // Background bar
      page.drawRectangle({
        x: 300,
        y: yPosition - 2,
        width: barWidth,
        height: barHeight,
        color: rgb(0.9, 0.9, 0.9),
      });
      
      // Progress bar
      page.drawRectangle({
        x: 300,
        y: yPosition - 2,
        width: progressWidth,
        height: barHeight,
        color: rgb(0.15, 0.39, 0.92),
      });
      
      page.drawText(`${goal.progress_percentage}%`, {
        x: 460,
        y: yPosition,
        size: 10,
        font: helveticaFont,
      });
      
      yPosition -= 25;
    });
  }
  
  // Footer
  page.drawText('Generated by LearnSpark AI - Educational Analytics Platform', {
    x: 50,
    y: 50,
    size: 10,
    font: helveticaFont,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  // Save the PDF
  return await pdfDoc.save();
}

function wrapText(text: string, maxWidth: number, font: any, fontSize: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    if (testLine.length * fontSize * 0.6 <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { student_id } = await req.json();
    
    if (!student_id) {
      throw new Error('Student ID is required');
    }
    
    console.log(`Generating PDF for student: ${student_id}`);
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get authenticated user for RLS
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      supabase.auth.getUser(authHeader);
    }
    
    // Get report data using the existing progress report function
    const { data: reportData, error: reportError } = await supabase.functions.invoke('generate-progress-report', {
      body: { student_id },
    });
    
    if (reportError) {
      console.error('Error from generate-progress-report:', reportError);
      throw new Error(`Error fetching report data: ${reportError.message}`);
    }
    
    if (!reportData) {
      throw new Error('No report data returned');
    }
    
    console.log('Successfully fetched report data, generating PDF...');
    
    // Generate PDF
    const pdfBytes = await generatePDFReport(reportData);
    
    // Convert to base64 for storage or direct download
    const base64PDF = btoa(String.fromCharCode(...pdfBytes));
    
    // For now, return the PDF as a data URL for immediate download
    const pdfDataUrl = `data:application/pdf;base64,${base64PDF}`;
    
    // Save communication record
    const { data: user } = await supabase.auth.getUser();
    if (user.user) {
      const { error: communicationError } = await supabase
        .from('parent_communications')
        .insert({
          student_id,
          teacher_id: user.user.id,
          communication_type: 'progress_report',
          subject: `Progress Report for ${reportData.student.first_name} ${reportData.student.last_name}`,
          content: `Generated progress report PDF on ${new Date().toLocaleDateString()}`,
          pdf_url: pdfDataUrl,
        });
      
      if (communicationError) {
        console.error("Error saving communication:", communicationError);
      }
    }
    
    console.log('PDF generated successfully');
    
    // Return the PDF data URL
    return new Response(JSON.stringify({ 
      pdf_url: pdfDataUrl,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
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
