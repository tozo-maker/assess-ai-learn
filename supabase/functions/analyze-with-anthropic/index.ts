import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { getCorsHeaders } from "../_shared/cors.ts";
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
      console.error('Anthropic API key not configured');
      return new Response(
        JSON.stringify({ success: false, message: 'AI service not configured' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }
    
    // Fetch assessment with ownership check
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
    
    // Fetch student with ownership check
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
    
    // Fetch responses
    const { data: responses, error: responsesError } = await supabase
      .from('student_responses')
      .select('*, assessment_items!inner(*)')
      .eq('assessment_id', assessment_id)
      .eq('student_id', student_id);
    
    if (responsesError || !responses || responses.length === 0) {
      console.error('Responses fetch error:', responsesError);
      return new Response(
        JSON.stringify({ success: false, message: 'No responses found for this assessment' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 404 }
      );
    }
    
    // Process data
    const totalItems = assessment.assessment_items?.length || 0;
    const totalScore = responses.reduce((sum, r) => sum + Number(r.score), 0);
    const maxPossibleScore = responses.reduce((sum, r) => sum + Number(r.assessment_items.max_score), 0);
    const scorePercentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
    
    const prompt = `
      You are an expert educational analyst. Analyze the following assessment data:
      
      STUDENT: ${student.first_name} ${student.last_name}, Grade: ${student.grade_level}
      ASSESSMENT: ${assessment.title}, Subject: ${assessment.subject}
      SCORE: ${totalScore}/${maxPossibleScore} (${scorePercentage.toFixed(1)}%)
      
      Provide: 1) 3-5 strengths, 2) 3-5 growth areas, 3) 3-5 learning patterns, 4) 4-6 recommendations, 5) overall summary
      
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
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      })
    });
    
    const anthropicData = await anthropicResponse.json();
    
    if (!anthropicResponse.ok) {
      console.error('Anthropic API error:', anthropicData);
      return new Response(
        JSON.stringify({ success: false, message: 'AI analysis failed' }),
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
        JSON.stringify({ success: false, message: 'Failed to process AI response' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }
    
    if (!analysis?.strengths || !analysis?.growth_areas) {
      return new Response(
        JSON.stringify({ success: false, message: 'Incomplete AI analysis' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }
    
    // Use service role for database writes
    const supabaseService = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    
    const analysisData = {
      assessment_id,
      student_id,
      strengths: analysis.strengths,
      growth_areas: analysis.growth_areas,
      patterns_observed: analysis.patterns_observed || [],
      recommendations: analysis.recommendations || [],
      overall_summary: analysis.overall_summary || '',
      analysis_json: { model: 'claude-3-5-sonnet-20241022', performance: { totalScore, maxPossibleScore, scorePercentage } }
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
      JSON.stringify({ success: false, message: 'An unexpected error occurred' }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
    );
  }
});
