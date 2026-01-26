import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { PDFDocument, rgb, StandardFonts } from 'https://esm.sh/pdf-lib@1.17.1';
import { getCorsHeaders } from '../_shared/cors.ts';

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
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication first
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Initialize Supabase client with user's auth context
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });
    
    // Verify the user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { student_id } = await req.json();
    
    if (!student_id) {
      return new Response(
        JSON.stringify({ error: 'Student ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`User ${user.id} generating PDF for student: ${student_id}`);
    
    // Fetch report data directly from database
    console.log('Fetching student data...');
    
    // Get student information
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, first_name, last_name, grade_level')
      .eq('id', student_id)
      .single();
      
    if (studentError || !student) {
      throw new Error(`Student not found: ${studentError?.message}`);
    }
    
    // Get performance data
    const { data: performance } = await supabase
      .from('student_performance')
      .select('*')
      .eq('student_id', student_id)
      .single();
    
    // Get recent assessments (via student responses)
    const { data: recentAssessments } = await supabase
      .from('student_responses')
      .select(`
        score,
        assessments!inner(title, subject, assessment_date)
      `)
      .eq('student_id', student_id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    // Get learning goals
    const { data: goals } = await supabase
      .from('goals')
      .select('title, status, progress_percentage')
      .eq('student_id', student_id)
      .limit(5);
    
    // Get AI insights from latest assessment analysis
    const { data: aiInsights } = await supabase
      .from('assessment_analysis')
      .select('strengths, growth_areas, recommendations')
      .eq('student_id', student_id)
      .order('created_at', { ascending: false })
      .limit(1);
    
    // Structure the report data
    const reportData = {
      student: {
        id: student.id,
        first_name: student.first_name,
        last_name: student.last_name,
        grade_level: student.grade_level,
      },
      performance: {
        average_score: performance?.average_score || 0,
        assessment_count: performance?.assessment_count || 0,
        performance_level: performance?.performance_level || 'Not assessed',
        needs_attention: performance?.needs_attention || false,
      },
      recent_assessments: recentAssessments?.map(response => ({
        title: response.assessments.title,
        score: response.score,
        date: response.assessments.assessment_date || new Date().toISOString(),
        subject: response.assessments.subject,
      })) || [],
      goals: goals || [],
      ai_insights: {
        strengths: aiInsights?.[0]?.strengths || ['Showing consistent effort'],
        growth_areas: aiInsights?.[0]?.growth_areas || ['Continue practicing regularly'],
        recommendations: aiInsights?.[0]?.recommendations || ['Keep up the good work'],
      },
    };
    
    console.log('Successfully fetched report data, generating PDF...');
    
    // Generate PDF
    const pdfBytes = await generatePDFReport(reportData);
    
    // Convert to base64 for storage or direct download
    const base64PDF = btoa(String.fromCharCode(...pdfBytes));
    
    // For now, return the PDF as a data URL for immediate download
    const pdfDataUrl = `data:application/pdf;base64,${base64PDF}`;
    
    // Save communication record (user already verified above)
    if (user) {
      const { error: communicationError } = await supabase
        .from('parent_communications')
        .insert({
          student_id: student_id,
          teacher_id: user.id,
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
    // Log detailed error server-side only
    console.error('Error in generate-progress-pdf function:', error);
    
    // Return generic error message to client
    return new Response(JSON.stringify({ 
      error: 'Failed to generate progress report. Please try again.',
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
