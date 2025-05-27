
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
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
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
    
    console.log('Processing export request:', exportRequest);
    
    // Process the export based on the type
    let csvData = '';
    
    switch (exportRequest.export_type) {
      case 'student_data':
        csvData = await generateStudentDataCSV(supabase, exportRequest);
        break;
      case 'assessment_results':
        csvData = await generateAssessmentResultsCSV(supabase, exportRequest);
        break;
      case 'analytics_data':
        csvData = await generateAnalyticsCSV(supabase, exportRequest);
        break;
      case 'progress_reports':
        csvData = await generateProgressReportsCSV(supabase, exportRequest);
        break;
      case 'class_summary':
        csvData = await generateClassSummaryCSV(supabase, exportRequest);
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
    await supabase
      .from('data_exports')
      .update({ 
        status: 'completed',
        file_url: dataUrl,
        completed_at: new Date().toISOString()
      })
      .eq('id', export_id);
    
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
    
    // Try to update the export status to failed
    try {
      const body = await req.json();
      const { export_id } = body;
      if (export_id) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
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

async function generateStudentDataCSV(supabase: any, exportRequest: any): Promise<string> {
  console.log('Generating student data CSV');
  
  // Build query with filters
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
      created_at,
      student_performance (
        average_score,
        performance_level,
        assessment_count,
        needs_attention,
        last_assessment_date
      )
    `)
    .eq('teacher_id', exportRequest.teacher_id);
  
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
    'Average Score',
    'Performance Level',
    'Assessment Count',
    'Needs Attention',
    'Last Assessment Date',
    'Learning Goals',
    'Special Considerations',
    'Enrollment Date'
  ];
  
  // Generate CSV rows
  const rows = students?.map((student: any) => {
    const performance = student.student_performance?.[0] || {};
    return [
      student.student_id || '',
      student.first_name || '',
      student.last_name || '',
      student.grade_level || '',
      student.parent_name || '',
      student.parent_email || '',
      student.parent_phone || '',
      performance.average_score || '0',
      performance.performance_level || 'Not Assessed',
      performance.assessment_count || '0',
      performance.needs_attention ? 'Yes' : 'No',
      performance.last_assessment_date ? new Date(performance.last_assessment_date).toLocaleDateString() : '',
      student.learning_goals || '',
      student.special_considerations || '',
      new Date(student.created_at).toLocaleDateString()
    ];
  }) || [];
  
  return formatAsCSV([headers, ...rows]);
}

async function generateAssessmentResultsCSV(supabase: any, exportRequest: any): Promise<string> {
  console.log('Generating assessment results CSV');
  
  // Build complex query for assessment results
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
        item_number,
        question_text,
        max_score,
        difficulty_level
      )
    `);
  
  // Apply date range filter
  if (exportRequest.filters?.date_range) {
    query = query
      .gte('created_at', exportRequest.filters.date_range.start)
      .lte('created_at', exportRequest.filters.date_range.end);
  }
  
  // Apply subject filter
  if (exportRequest.filters?.subject) {
    query = query.eq('assessments.subject', exportRequest.filters.subject);
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
    'Item Number',
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
      response.assessment_items?.item_number || '',
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

async function generateAnalyticsCSV(supabase: any, exportRequest: any): Promise<string> {
  console.log('Generating analytics CSV');
  
  // Get comprehensive analytics data
  const { data: studentPerformance, error: perfError } = await supabase
    .from('student_performance')
    .select(`
      *,
      students (
        first_name,
        last_name,
        grade_level
      )
    `)
    .eq('students.teacher_id', exportRequest.teacher_id);
  
  if (perfError) throw perfError;
  
  // Get skill mastery data
  const { data: skillMastery, error: skillError } = await supabase
    .from('student_skills')
    .select(`
      *,
      students (
        first_name,
        last_name
      ),
      skills (
        name,
        subject,
        grade_level
      )
    `)
    .eq('students.teacher_id', exportRequest.teacher_id);
  
  if (skillError) throw skillError;
  
  // Create comprehensive analytics CSV
  const headers = [
    'Student Name',
    'Grade Level',
    'Average Score',
    'Performance Level',
    'Assessment Count',
    'Needs Attention',
    'Skills Mastered',
    'Skills Developing',
    'Skills Beginning',
    'Last Assessment',
    'Growth Trend'
  ];
  
  const rows = studentPerformance?.map((perf: any) => {
    const studentSkills = skillMastery?.filter((skill: any) => 
      skill.students?.first_name === perf.students?.first_name &&
      skill.students?.last_name === perf.students?.last_name
    ) || [];
    
    const masteredCount = studentSkills.filter(s => s.current_mastery_level === 'Advanced' || s.current_mastery_level === 'Proficient').length;
    const developingCount = studentSkills.filter(s => s.current_mastery_level === 'Developing').length;
    const beginningCount = studentSkills.filter(s => s.current_mastery_level === 'Beginning').length;
    
    return [
      `${perf.students?.first_name || ''} ${perf.students?.last_name || ''}`,
      perf.students?.grade_level || '',
      perf.average_score || '0',
      perf.performance_level || 'Not Assessed',
      perf.assessment_count || '0',
      perf.needs_attention ? 'Yes' : 'No',
      masteredCount.toString(),
      developingCount.toString(),
      beginningCount.toString(),
      perf.last_assessment_date ? new Date(perf.last_assessment_date).toLocaleDateString() : '',
      perf.average_score >= 80 ? 'Positive' : perf.average_score >= 60 ? 'Stable' : 'Needs Support'
    ];
  }) || [];
  
  return formatAsCSV([headers, ...rows]);
}

async function generateProgressReportsCSV(supabase: any, exportRequest: any): Promise<string> {
  console.log('Generating progress reports CSV');
  
  // Get goals and achievements data
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
    .eq('teacher_id', exportRequest.teacher_id);
  
  if (goalsError) throw goalsError;
  
  const headers = [
    'Student Name',
    'Grade Level',
    'Goal Title',
    'Goal Description',
    'Status',
    'Progress Percentage',
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
      goal.progress_percentage + '%',
      targetDate ? targetDate.toLocaleDateString() : '',
      new Date(goal.created_at).toLocaleDateString(),
      daysRemaining ? daysRemaining.toString() : ''
    ];
  }) || [];
  
  return formatAsCSV([headers, ...rows]);
}

async function generateClassSummaryCSV(supabase: any, exportRequest: any): Promise<string> {
  console.log('Generating class summary CSV');
  
  // Get aggregated class data
  const { data: classData, error } = await supabase
    .from('students')
    .select(`
      grade_level,
      student_performance (
        average_score,
        performance_level,
        needs_attention
      )
    `)
    .eq('teacher_id', exportRequest.teacher_id);
  
  if (error) throw error;
  
  // Aggregate by grade level
  const gradeStats = new Map();
  
  classData?.forEach((student: any) => {
    const grade = student.grade_level;
    const perf = student.student_performance?.[0];
    
    if (!gradeStats.has(grade)) {
      gradeStats.set(grade, {
        totalStudents: 0,
        totalScore: 0,
        aboveAverage: 0,
        average: 0,
        belowAverage: 0,
        needsAttention: 0
      });
    }
    
    const stats = gradeStats.get(grade);
    stats.totalStudents++;
    
    if (perf) {
      stats.totalScore += perf.average_score || 0;
      
      switch (perf.performance_level) {
        case 'Above Average':
          stats.aboveAverage++;
          break;
        case 'Average':
          stats.average++;
          break;
        case 'Below Average':
          stats.belowAverage++;
          break;
      }
      
      if (perf.needs_attention) {
        stats.needsAttention++;
      }
    }
  });
  
  const headers = [
    'Grade Level',
    'Total Students',
    'Class Average Score',
    'Above Average Count',
    'Average Count',
    'Below Average Count',
    'Students Needing Attention',
    'Attention Percentage'
  ];
  
  const rows = Array.from(gradeStats.entries()).map(([grade, stats]: [string, any]) => {
    const avgScore = stats.totalStudents > 0 ? (stats.totalScore / stats.totalStudents).toFixed(1) : '0';
    const attentionPercentage = stats.totalStudents > 0 ? ((stats.needsAttention / stats.totalStudents) * 100).toFixed(1) : '0';
    
    return [
      grade,
      stats.totalStudents.toString(),
      avgScore,
      stats.aboveAverage.toString(),
      stats.average.toString(),
      stats.belowAverage.toString(),
      stats.needsAttention.toString(),
      attentionPercentage + '%'
    ];
  });
  
  return formatAsCSV([headers, ...rows]);
}

function formatAsCSV(data: any[][]): string {
  return data.map(row => {
    return row.map(cell => {
      const value = cell?.toString() || '';
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  }).join('\n');
}
