import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { DataExportRequest } from '../_shared/types.ts';
import { getCorsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require authentication header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') as string;

    // Create client with user's auth context
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { export_id }: DataExportRequest = await req.json();
    
    if (!export_id) {
      throw new Error('Export ID is required');
    }

    console.log('Processing export request:', export_id, 'for user:', user.id);
    
    // Use service role for database operations, but verify ownership first
    const serviceSupabase = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    );
    
    // Fetch the export request details and verify ownership
    const { data: exportRequest, error: exportError } = await serviceSupabase
      .from('data_exports')
      .select('*')
      .eq('id', export_id)
      .eq('teacher_id', user.id)  // Verify ownership
      .single();
    
    if (exportError || !exportRequest) {
      console.error('Export request not found or access denied:', exportError);
      return new Response(
        JSON.stringify({ error: 'Export request not found or access denied' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Update export status to processing
    await serviceSupabase
      .from('data_exports')
      .update({ status: 'processing' })
      .eq('id', export_id)
      .eq('teacher_id', user.id);
    
    console.log('Processing export request:', exportRequest);
    
    // Process the export based on the type
    let csvData = '';
    
    switch (exportRequest.export_type) {
      case 'student_data':
        csvData = await generateStudentDataCSV(serviceSupabase, exportRequest, user.id);
        break;
      case 'assessment_results':
        csvData = await generateAssessmentResultsCSV(serviceSupabase, exportRequest, user.id);
        break;
      case 'analytics_data':
        csvData = await generateAnalyticsCSV(serviceSupabase, exportRequest, user.id);
        break;
      case 'progress_reports':
        csvData = await generateProgressReportsCSV(serviceSupabase, exportRequest, user.id);
        break;
      case 'class_summary':
        csvData = await generateClassSummaryCSV(serviceSupabase, exportRequest, user.id);
        break;
      default:
        throw new Error(`Unsupported export type: ${exportRequest.export_type}`);
    }
    
    // Create a data URL for the CSV file
    const csvBlob = new Blob([csvData], { type: 'text/csv' });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${exportRequest.export_type}_${timestamp}.csv`;
    
    // Convert blob to base64 for storage
    const arrayBuffer = await csvBlob.arrayBuffer();
    const base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const dataUrl = `data:text/csv;base64,${base64Data}`;
    
    // Update export status to completed
    await serviceSupabase
      .from('data_exports')
      .update({ 
        status: 'completed',
        file_url: dataUrl,
        completed_at: new Date().toISOString()
      })
      .eq('id', export_id)
      .eq('teacher_id', user.id);
    
    return new Response(JSON.stringify({ 
      success: true,
      export_id: export_id,
      file_url: dataUrl,
      filename: fileName
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in process-data-export function:', error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateStudentDataCSV(supabase: any, exportRequest: any, userId: string): Promise<string> {
  console.log('Generating student data CSV for user:', userId);
  
  // Build query with filters - ensure teacher_id matches
  let query = supabase
    .from('students')
    .select(`
      id,
      first_name,
      last_name,
      grade_level,
      student_id,
      parent_name,
      parent_email,
      parent_phone,
      learning_goals,
      special_considerations,
      created_at
    `)
    .eq('teacher_id', userId);
  
  // Apply filters
  if (exportRequest.filters?.grade_level) {
    query = query.eq('grade_level', exportRequest.filters.grade_level);
  }
  
  if (exportRequest.filters?.student_ids?.length > 0) {
    query = query.in('id', exportRequest.filters.student_ids);
  }
  
  const { data: students, error } = await query;
  
  if (error) throw error;
  
  // Create CSV headers
  const headers = [
    'Student ID',
    'First Name',
    'Last Name',
    'Grade Level',
    'Parent Name',
    'Parent Email',
    'Parent Phone',
    'Learning Goals',
    'Special Considerations',
    'Enrollment Date'
  ];
  
  // Generate CSV rows
  const rows = students?.map((student: any) => {
    return [
      student.student_id || '',
      student.first_name || '',
      student.last_name || '',
      student.grade_level || '',
      student.parent_name || '',
      student.parent_email || '',
      student.parent_phone || '',
      student.learning_goals || '',
      student.special_considerations || '',
      new Date(student.created_at).toLocaleDateString()
    ];
  }) || [];
  
  return formatAsCSV([headers, ...rows]);
}

async function generateAssessmentResultsCSV(supabase: any, exportRequest: any, userId: string): Promise<string> {
  console.log('Generating assessment results CSV for user:', userId);
  
  // Get students for this teacher first
  const { data: students } = await supabase
    .from('students')
    .select('id')
    .eq('teacher_id', userId);
  
  const studentIds = students?.map((s: any) => s.id) || [];
  
  if (studentIds.length === 0) {
    return formatAsCSV([['No data available']]);
  }
  
  // Build query for assessment results
  let query = supabase
    .from('student_responses')
    .select(`
      id,
      score,
      error_type,
      teacher_notes,
      created_at,
      students (
        first_name,
        last_name,
        grade_level
      ),
      assessments (
        title,
        subject,
        assessment_type,
        assessment_date,
        max_score
      ),
      assessment_items (
        item_order,
        question_text,
        max_score,
        difficulty_level
      )
    `)
    .in('student_id', studentIds);
  
  // Apply date range filter
  if (exportRequest.filters?.date_range) {
    query = query
      .gte('created_at', exportRequest.filters.date_range.start)
      .lte('created_at', exportRequest.filters.date_range.end);
  }
  
  const { data: responses, error } = await query;
  
  if (error) throw error;
  
  const headers = [
    'Date',
    'Student Name',
    'Grade Level',
    'Assessment Title',
    'Subject',
    'Assessment Type',
    'Item Order',
    'Question',
    'Score',
    'Max Score',
    'Percentage',
    'Error Type',
    'Difficulty Level',
    'Teacher Notes'
  ];
  
  const rows = responses?.map((response: any) => {
    const percentage = response.assessment_items?.max_score 
      ? ((response.score / response.assessment_items.max_score) * 100).toFixed(1)
      : '0';
      
    return [
      new Date(response.created_at).toLocaleDateString(),
      `${response.students?.first_name || ''} ${response.students?.last_name || ''}`,
      response.students?.grade_level || '',
      response.assessments?.title || '',
      response.assessments?.subject || '',
      response.assessments?.assessment_type || '',
      response.assessment_items?.item_order || '',
      response.assessment_items?.question_text || '',
      response.score || '0',
      response.assessment_items?.max_score || '0',
      percentage + '%',
      response.error_type || '',
      response.assessment_items?.difficulty_level || '',
      response.teacher_notes || ''
    ];
  }) || [];
  
  return formatAsCSV([headers, ...rows]);
}

async function generateAnalyticsCSV(supabase: any, exportRequest: any, userId: string): Promise<string> {
  console.log('Generating analytics CSV for user:', userId);
  
  // Get students for this teacher
  const { data: students, error } = await supabase
    .from('students')
    .select(`
      id,
      first_name,
      last_name,
      grade_level
    `)
    .eq('teacher_id', userId);
  
  if (error) throw error;
  
  const headers = [
    'Student Name',
    'Grade Level',
    'Student ID'
  ];
  
  const rows = students?.map((student: any) => {
    return [
      `${student.first_name || ''} ${student.last_name || ''}`,
      student.grade_level || '',
      student.id || ''
    ];
  }) || [];
  
  return formatAsCSV([headers, ...rows]);
}

async function generateProgressReportsCSV(supabase: any, exportRequest: any, userId: string): Promise<string> {
  console.log('Generating progress reports CSV for user:', userId);
  
  // Get goals for this teacher
  const { data: goals, error: goalsError } = await supabase
    .from('goals')
    .select(`
      *,
      students (
        first_name,
        last_name,
        grade_level
      )
    `)
    .eq('teacher_id', userId);
  
  if (goalsError) throw goalsError;
  
  const headers = [
    'Student Name',
    'Grade Level',
    'Goal Title',
    'Goal Description',
    'Status',
    'Progress',
    'Target Date',
    'Created Date',
    'Days Remaining'
  ];
  
  const rows = goals?.map((goal: any) => {
    const targetDate = goal.target_date ? new Date(goal.target_date) : null;
    const today = new Date();
    const daysRemaining = targetDate ? Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : '';
    
    return [
      `${goal.students?.first_name || ''} ${goal.students?.last_name || ''}`,
      goal.students?.grade_level || '',
      goal.title || '',
      goal.description || '',
      goal.status || '',
      (goal.progress || 0) + '%',
      targetDate ? targetDate.toLocaleDateString() : '',
      new Date(goal.created_at).toLocaleDateString(),
      daysRemaining ? daysRemaining.toString() : ''
    ];
  }) || [];
  
  return formatAsCSV([headers, ...rows]);
}

async function generateClassSummaryCSV(supabase: any, exportRequest: any, userId: string): Promise<string> {
  console.log('Generating class summary CSV for user:', userId);
  
  // Get aggregated class data
  const { data: classData, error } = await supabase
    .from('students')
    .select(`
      grade_level,
      id
    `)
    .eq('teacher_id', userId);
  
  if (error) throw error;
  
  // Aggregate by grade level
  const gradeStats = new Map();
  
  classData?.forEach((student: any) => {
    const grade = student.grade_level || 'Unassigned';
    
    if (!gradeStats.has(grade)) {
      gradeStats.set(grade, {
        totalStudents: 0
      });
    }
    
    const stats = gradeStats.get(grade);
    stats.totalStudents++;
  });
  
  const headers = [
    'Grade Level',
    'Total Students'
  ];
  
  const rows = Array.from(gradeStats.entries()).map(([grade, stats]: [string, any]) => [
    grade,
    stats.totalStudents.toString()
  ]);
  
  return formatAsCSV([headers, ...rows]);
}

function formatAsCSV(data: any[][]): string {
  return data.map(row => 
    row.map(cell => {
      // Escape quotes and wrap in quotes if contains comma, newline or quote
      const cellStr = String(cell);
      if (cellStr.includes(',') || cellStr.includes('\n') || cellStr.includes('"')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(',')
  ).join('\n');
}
