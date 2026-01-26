import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { getCorsHeaders } from '../_shared/cors.ts';
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, message: 'Authentication required' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 401 }
      );
    }

    // Create authenticated Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, message: 'Authentication required' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 401 }
      );
    }

    const { assessment_id, student_id } = await req.json();
    
    if (!assessment_id || !student_id) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required parameters' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 400 }
      );
    }

    if (!ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, message: 'AI service not configured' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }
    
    // Fetch assessment with ownership check (RLS enforced)
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('*, assessment_items(*)')
      .eq('id', assessment_id)
      .eq('teacher_id', user.id)
      .single();
    
    if (assessmentError || !assessment) {
      console.error('Assessment fetch error:', assessmentError);
      return new Response(
        JSON.stringify({ success: false, message: 'Assessment not found or access denied' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 404 }
      );
    }
    
    // Fetch student with ownership check (RLS enforced)
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', student_id)
      .eq('teacher_id', user.id)
      .single();
    
    if (studentError || !student) {
      console.error('Student fetch error:', studentError);
      return new Response(
        JSON.stringify({ success: false, message: 'Student not found or access denied' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 404 }
      );
    }
    
    // Fetch student responses (RLS enforced through student ownership)
    const { data: responses, error: responsesError } = await supabase
      .from('student_responses')
      .select('*, assessment_items!inner(*)')
      .eq('assessment_id', assessment_id)
      .eq('student_id', student_id);
    
    if (responsesError) {
      console.error('Responses fetch error:', responsesError);
      return new Response(
        JSON.stringify({ success: false, message: 'Unable to fetch assessment responses' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }
    
    if (!responses || responses.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'No responses found for this assessment' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 404 }
      );
    }
    
    // Process the data for AI analysis
    const totalItems = assessment.assessment_items?.length || 0;
    const totalScore = responses.reduce((sum, r) => sum + Number(r.score), 0);
    const maxPossibleScore = responses.reduce((sum, r) => sum + Number(r.assessment_items.max_score), 0);
    const scorePercentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
    
    const errorTypeBreakdown = responses.reduce((acc, r) => {
      if (r.error_type && r.error_type !== 'none') {
        acc[r.error_type] = (acc[r.error_type] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const knowledgeTypeBreakdown = responses.reduce((acc, r) => {
      const knowledgeType = r.assessment_items.knowledge_type || 'unknown';
      if (!acc[knowledgeType]) {
        acc[knowledgeType] = { total: 0, correct: 0, score: 0, maxScore: 0 };
      }
      acc[knowledgeType].total += 1;
      if (r.score === r.assessment_items.max_score) {
        acc[knowledgeType].correct += 1;
      }
      acc[knowledgeType].score += Number(r.score);
      acc[knowledgeType].maxScore += Number(r.assessment_items.max_score);
      return acc;
    }, {} as Record<string, { total: number; correct: number; score: number; maxScore: number }>);
    
    const difficultyBreakdown = responses.reduce((acc, r) => {
      const difficulty = r.assessment_items.difficulty_level || 'unknown';
      if (!acc[difficulty]) {
        acc[difficulty] = { total: 0, correct: 0, score: 0, maxScore: 0 };
      }
      acc[difficulty].total += 1;
      if (r.score === r.assessment_items.max_score) {
        acc[difficulty].correct += 1;
      }
      acc[difficulty].score += Number(r.score);
      acc[difficulty].maxScore += Number(r.assessment_items.max_score);
      return acc;
    }, {} as Record<string, { total: number; correct: number; score: number; maxScore: number }>);
    
    const prompt = `
      You are an expert educational analyst. Analyze the following assessment data:
      
      STUDENT: ${student.first_name} ${student.last_name}, Grade: ${student.grade_level}
      ASSESSMENT: ${assessment.title}, Subject: ${assessment.subject}, Type: ${assessment.assessment_type}
      SCORE: ${totalScore}/${maxPossibleScore} (${scorePercentage.toFixed(1)}%)
      
      ERROR TYPES: ${Object.entries(errorTypeBreakdown).map(([type, count]) => 
        `${type}: ${count}`
      ).join(', ') || 'None'}
      
      KNOWLEDGE TYPE PERFORMANCE: ${Object.entries(knowledgeTypeBreakdown).map(([type, data]) => 
        `${type}: ${((data.score / data.maxScore) * 100).toFixed(1)}%`
      ).join(', ')}
      
      DIFFICULTY PERFORMANCE: ${Object.entries(difficultyBreakdown).map(([level, data]) => 
        `${level}: ${((data.score / data.maxScore) * 100).toFixed(1)}%`
      ).join(', ')}
      
      Provide: 1) 3-5 strengths, 2) 3-5 growth areas, 3) 3-5 learning patterns, 4) 4-6 recommendations, 5) overall summary (2-3 sentences)
      
      Format as JSON: { strengths: [], growth_areas: [], patterns_observed: [], recommendations: [], overall_summary: "" }
    `;
    
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      })
    });
    
    const anthropicData = await anthropicResponse.json();
    
    if (!anthropicResponse.ok) {
      console.error('Anthropic API error:', anthropicData);
      return new Response(
        JSON.stringify({ success: false, message: 'AI analysis failed. Please try again.' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }
    
    let analysis;
    try {
      const responseText = anthropicData.content[0].text;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse AI response');
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to process AI analysis' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }
    
    if (!analysis?.strengths || !analysis?.growth_areas || !analysis?.patterns_observed || !analysis?.recommendations) {
      return new Response(
        JSON.stringify({ success: false, message: 'Incomplete AI analysis response' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }
    
    // Use service role for database write operations
    const supabaseService = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    const analysisData = {
      assessment_id,
      student_id,
      strengths: analysis.strengths,
      growth_areas: analysis.growth_areas,
      patterns_observed: analysis.patterns_observed,
      recommendations: analysis.recommendations,
      overall_summary: analysis.overall_summary,
      analysis_json: {
        model: 'claude-3-5-sonnet-20241022',
        performance: { totalScore, maxPossibleScore, scorePercentage, errorTypeBreakdown, knowledgeTypeBreakdown, difficultyBreakdown }
      }
    };
    
    const { data: existingAnalysis } = await supabaseService
      .from('assessment_analysis')
      .select('id')
      .eq('assessment_id', assessment_id)
      .eq('student_id', student_id)
      .maybeSingle();
    
    let dbResult;
    if (existingAnalysis) {
      dbResult = await supabaseService
        .from('assessment_analysis')
        .update(analysisData)
        .eq('id', existingAnalysis.id)
        .select()
        .single();
    } else {
      dbResult = await supabaseService
        .from('assessment_analysis')
        .insert(analysisData)
        .select()
        .single();
    }
    
    if (dbResult.error) {
      console.error('Database save error:', dbResult.error);
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to save analysis' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }
    
    return new Response(
      JSON.stringify({ success: true, message: 'Analysis completed', analysis: dbResult.data }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
    
  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(
      JSON.stringify({ success: false, message: 'An unexpected error occurred. Please try again.' }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
    );
  }
});
