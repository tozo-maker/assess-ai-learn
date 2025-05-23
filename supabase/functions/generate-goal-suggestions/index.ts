
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { GoalSuggestionsRequest } from '../_shared/types.ts';

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
    const { student_id }: GoalSuggestionsRequest = await req.json();
    
    if (!student_id) {
      throw new Error('Student ID is required');
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Fetch student data and assessment analysis
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', student_id)
      .single();
    
    if (studentError || !student) {
      throw new Error(`Student not found: ${studentError?.message || 'Unknown error'}`);
    }
    
    // Fetch latest assessment analysis
    const { data: analysis, error: analysisError } = await supabase
      .from('assessment_analysis')
      .select('*')
      .eq('student_id', student_id)
      .order('created_at', { ascending: false })
      .limit(1);
    
    // Here we would normally use OpenAI or another AI service to generate goal suggestions
    // based on the student's assessment data and analysis
    
    // For this example, we'll create some sample goals based on the student data we have
    const suggestions = [];
    
    // If we have analysis data, use it to create targeted suggestions
    if (analysis && analysis.length > 0) {
      const growthAreas = analysis[0].growth_areas || [];
      
      for (const area of growthAreas.slice(0, 3)) {
        suggestions.push(
          `Improve understanding of ${area} through daily practice exercises`
        );
      }
    }
    
    // Add some general suggestions based on grade level
    if (student.grade_level) {
      if (['K', '1', '2', '3'].includes(student.grade_level)) {
        suggestions.push(
          "Increase reading fluency by reading for 20 minutes daily",
          "Develop number sense through counting games and activities",
          "Improve fine motor skills through writing and drawing exercises"
        );
      } else if (['4', '5', '6'].includes(student.grade_level)) {
        suggestions.push(
          "Strengthen reading comprehension skills with weekly chapter summaries",
          "Master multiplication facts with timed practice sessions",
          "Develop critical thinking through problem-solving activities"
        );
      } else {
        suggestions.push(
          "Improve academic writing skills with weekly essays",
          "Develop study habits through consistent daily schedules",
          "Build test-taking strategies with practice assessments"
        );
      }
    }
    
    // Ensure we have at least 5 suggestions
    while (suggestions.length < 5) {
      suggestions.push(
        "Complete assigned homework consistently and on time",
        "Actively participate in class discussions",
        "Review notes daily to reinforce learning",
        "Ask questions when concepts are unclear",
        "Set specific academic goals for each quarter"
      );
    }
    
    // Limit to 5 unique suggestions
    const uniqueSuggestions = [...new Set(suggestions)].slice(0, 5);
    
    return new Response(JSON.stringify({
      student_name: `${student.first_name} ${student.last_name}`,
      grade_level: student.grade_level,
      suggestions: uniqueSuggestions
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in generate-goal-suggestions function:', error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
