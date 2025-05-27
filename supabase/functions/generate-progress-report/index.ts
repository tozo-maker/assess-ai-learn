
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { ProgressReportData } from '../_shared/types.ts';

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
    const { student_id } = await req.json();
    
    if (!student_id) {
      throw new Error('Student ID is required');
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get authenticated user for RLS
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Authentication required');
    }
    
    console.log(`Generating progress report for student: ${student_id}, teacher: ${user.id}`);
    
    // Fetch student data with proper filtering
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', student_id)
      .eq('teacher_id', user.id) // Ensure RLS compliance
      .maybeSingle();
    
    if (studentError) {
      console.error('Error fetching student:', studentError);
      throw new Error(`Error fetching student: ${studentError.message}`);
    }
    
    if (!student) {
      throw new Error('Student not found or access denied');
    }
    
    console.log(`Found student: ${student.first_name} ${student.last_name}`);
    
    // Fetch recent assessments with proper joins and filtering
    const { data: assessments, error: assessmentsError } = await supabase
      .from('student_responses')
      .select(`
        score,
        created_at,
        assessments:assessment_id(
          id,
          title,
          assessment_date,
          subject,
          max_score
        )
      `)
      .eq('student_id', student_id)
      .not('assessments', 'is', null) // Ensure assessment exists
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (assessmentsError) {
      console.error('Error fetching assessments:', assessmentsError);
      throw new Error(`Error fetching assessments: ${assessmentsError.message}`);
    }
    
    console.log(`Found ${assessments?.length || 0} assessment responses`);
    
    // Fetch performance data with proper filtering
    const { data: performance, error: performanceError } = await supabase
      .from('student_performance')
      .select('*')
      .eq('student_id', student_id)
      .maybeSingle();
    
    if (performanceError) {
      console.log(`Warning: Error fetching performance data: ${performanceError.message}`);
    }
    
    // Fetch AI analysis with proper filtering - get most recent one
    const { data: analysis, error: analysisError } = await supabase
      .from('assessment_analysis')
      .select('*')
      .eq('student_id', student_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
      
    if (analysisError) {
      console.log(`Warning: Error fetching analysis: ${analysisError.message}`);
    }
    
    // Fetch student goals with proper filtering
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('*')
      .eq('student_id', student_id)
      .eq('teacher_id', user.id) // Ensure RLS compliance
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (goalsError) {
      console.log(`Warning: Error fetching goals: ${goalsError.message}`);
    }
    
    // Format recent assessments safely
    const recentAssessments = (assessments || [])
      .filter(item => item.assessments) // Filter out null assessments
      .map((item) => ({
        title: item.assessments.title,
        score: item.score,
        date: item.assessments.assessment_date,
        subject: item.assessments.subject,
      }));
    
    console.log(`Formatted ${recentAssessments.length} recent assessments`);
    
    // Generate progress report data with safe defaults
    const progressReport: ProgressReportData = {
      student: {
        id: student.id,
        first_name: student.first_name,
        last_name: student.last_name,
        grade_level: student.grade_level,
      },
      performance: {
        average_score: performance?.average_score || 0,
        assessment_count: performance?.assessment_count || 0,
        performance_level: performance?.performance_level || 'No data available',
        needs_attention: performance?.needs_attention || false,
      },
      recent_assessments: recentAssessments,
      goals: goals || [],
      ai_insights: {
        strengths: analysis?.strengths || ['Complete more assessments to identify strengths.'],
        growth_areas: analysis?.growth_areas || ['Complete more assessments to identify growth areas.'],
        recommendations: analysis?.recommendations || ['Complete more assessments to receive personalized recommendations.'],
      }
    };
    
    console.log('Progress report generated successfully');
    
    // Return the progress report data
    return new Response(JSON.stringify(progressReport), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in generate-progress-report function:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Check Edge Function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
