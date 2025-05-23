
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
    
    // Fetch student data
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', student_id)
      .single();
    
    if (studentError || !student) {
      throw new Error(`Error fetching student: ${studentError?.message || 'Student not found'}`);
    }
    
    // Fetch recent assessments
    const { data: assessments, error: assessmentsError } = await supabase
      .from('student_responses')
      .select(`
        score,
        assessments:assessment_id(
          id,
          title,
          assessment_date,
          subject,
          max_score
        )
      `)
      .eq('student_id', student_id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (assessmentsError) {
      throw new Error(`Error fetching assessments: ${assessmentsError.message}`);
    }
    
    // Fetch performance data
    const { data: performance, error: performanceError } = await supabase
      .from('student_performance')
      .select('*')
      .eq('student_id', student_id)
      .single();
    
    if (performanceError) {
      console.log(`Warning: No performance data found: ${performanceError.message}`);
    }
    
    // Fetch AI analysis
    const { data: analysis, error: analysisError } = await supabase
      .from('assessment_analysis')
      .select('*')
      .eq('student_id', student_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    // Fetch student goals
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('*')
      .eq('student_id', student_id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (goalsError) {
      console.log(`Warning: Error fetching goals: ${goalsError.message}`);
    }
    
    // Format recent assessments
    const recentAssessments = assessments ? assessments.map((item) => ({
      title: item.assessments.title,
      score: item.score,
      date: item.assessments.assessment_date,
      subject: item.assessments.subject,
    })) : [];
    
    // Generate progress report data
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
        performance_level: performance?.performance_level || 'Not available',
        needs_attention: performance?.needs_attention || false,
      },
      recent_assessments: recentAssessments,
      goals: goals || [],
      ai_insights: {
        strengths: analysis?.strengths || ['No strengths identified yet.'],
        growth_areas: analysis?.growth_areas || ['No growth areas identified yet.'],
        recommendations: analysis?.recommendations || ['Complete more assessments to receive personalized recommendations.'],
      }
    };
    
    // Return the progress report data
    return new Response(JSON.stringify(progressReport), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in generate-progress-report function:', error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
