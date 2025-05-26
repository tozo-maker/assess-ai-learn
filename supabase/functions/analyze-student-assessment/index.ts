import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { assessment_id, student_id } = await req.json();
    
    console.log('Received request with:', { assessment_id, student_id });
    
    // Check for required parameters
    if (!assessment_id || !student_id) {
      console.error('Missing required parameters:', { assessment_id, student_id });
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Missing required parameters: assessment_id or student_id',
          details: { received_assessment_id: assessment_id, received_student_id: student_id }
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 400 }
      );
    }

    // Check if we have the API key
    if (!ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'AI service not configured. Please set the ANTHROPIC_API_KEY environment variable.' 
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }
    
    // Create Supabase client using service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase configuration missing');
      return new Response(
        JSON.stringify({ success: false, message: 'Supabase configuration missing' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }
    
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Fetch assessment data with detailed logging
    console.log('Fetching assessment with ID:', assessment_id);
    const { data: assessment, error: assessmentError } = await supabaseClient
      .from('assessments')
      .select('*, assessment_items(*)')
      .eq('id', assessment_id)
      .single();
    
    if (assessmentError) {
      console.error('Error fetching assessment:', assessmentError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Error fetching assessment: ${assessmentError.message}`,
          details: { assessment_id, error: assessmentError }
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }
    
    if (!assessment) {
      console.error('Assessment not found:', assessment_id);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Assessment not found with ID: ${assessment_id}` 
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 404 }
      );
    }
    
    console.log('Found assessment:', assessment.title);
    
    // Fetch student data with detailed logging
    console.log('Fetching student with ID:', student_id);
    const { data: student, error: studentError } = await supabaseClient
      .from('students')
      .select('*')
      .eq('id', student_id)
      .single();
    
    if (studentError) {
      console.error('Error fetching student:', studentError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Error fetching student: ${studentError.message}`,
          details: { student_id, error: studentError }
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }
    
    if (!student) {
      console.error('Student not found:', student_id);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Student not found with ID: ${student_id}` 
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 404 }
      );
    }
    
    console.log('Found student:', student.first_name, student.last_name);
    
    // Fetch student responses for this assessment with detailed logging
    console.log('Fetching responses for assessment:', assessment_id, 'student:', student_id);
    const { data: responses, error: responsesError } = await supabaseClient
      .from('student_responses')
      .select('*, assessment_items!inner(*)')
      .eq('assessment_id', assessment_id)
      .eq('student_id', student_id);
    
    if (responsesError) {
      console.error('Error fetching responses:', responsesError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Error fetching responses: ${responsesError.message}`,
          details: { assessment_id, student_id, error: responsesError }
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }
    
    if (!responses || responses.length === 0) {
      console.error('No responses found for assessment:', assessment_id, 'student:', student_id);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'No student responses found for this assessment',
          details: { assessment_id, student_id, found_responses: responses?.length || 0 }
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 404 }
      );
    }
    
    console.log('Found responses:', responses.length);
    
    // Process the data for AI analysis
    const totalItems = assessment.assessment_items.length;
    const totalScore = responses.reduce((sum, r) => sum + Number(r.score), 0);
    const maxPossibleScore = responses.reduce((sum, r) => sum + Number(r.assessment_items.max_score), 0);
    const scorePercentage = (totalScore / maxPossibleScore) * 100;
    
    const errorTypeBreakdown = responses.reduce((acc, r) => {
      if (r.error_type && r.error_type !== 'none') {
        acc[r.error_type] = (acc[r.error_type] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const knowledgeTypeBreakdown = responses.reduce((acc, r) => {
      const knowledgeType = r.assessment_items.knowledge_type;
      if (!acc[knowledgeType]) {
        acc[knowledgeType] = {
          total: 0,
          correct: 0,
          score: 0,
          maxScore: 0
        };
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
      const difficulty = r.assessment_items.difficulty_level;
      if (!acc[difficulty]) {
        acc[difficulty] = {
          total: 0,
          correct: 0,
          score: 0,
          maxScore: 0
        };
      }
      
      acc[difficulty].total += 1;
      if (r.score === r.assessment_items.max_score) {
        acc[difficulty].correct += 1;
      }
      acc[difficulty].score += Number(r.score);
      acc[difficulty].maxScore += Number(r.assessment_items.max_score);
      
      return acc;
    }, {} as Record<string, { total: number; correct: number; score: number; maxScore: number }>);
    
    // Create educational prompt for AI analysis
    const prompt = `
      You are an expert educational analyst specializing in student learning assessment. Analyze the following assessment data and provide comprehensive educational insights:
      
      STUDENT INFORMATION:
      Name: ${student.first_name} ${student.last_name}
      Grade Level: ${student.grade_level}
      
      ASSESSMENT INFORMATION:
      Title: ${assessment.title}
      Subject: ${assessment.subject}
      Type: ${assessment.assessment_type}
      
      PERFORMANCE SUMMARY:
      Total Score: ${totalScore}/${maxPossibleScore} (${scorePercentage.toFixed(1)}%)
      
      ERROR TYPE BREAKDOWN:
      ${Object.entries(errorTypeBreakdown).map(([type, count]) => 
        `${type}: ${count} items (${((count / totalItems) * 100).toFixed(1)}%)`
      ).join('\n')}
      
      KNOWLEDGE TYPE PERFORMANCE:
      ${Object.entries(knowledgeTypeBreakdown).map(([type, data]) => 
        `${type}: ${data.score}/${data.maxScore} (${((data.score / data.maxScore) * 100).toFixed(1)}%)`
      ).join('\n')}
      
      DIFFICULTY LEVEL PERFORMANCE:
      ${Object.entries(difficultyBreakdown).map(([level, data]) => 
        `${level}: ${data.score}/${data.maxScore} (${((data.score / data.maxScore) * 100).toFixed(1)}%)`
      ).join('\n')}
      
      DETAILED RESPONSES:
      ${responses.map((r, i) => 
        `Item ${i+1}: "${r.assessment_items.question_text}"
        - Knowledge Type: ${r.assessment_items.knowledge_type}
        - Difficulty: ${r.assessment_items.difficulty_level}
        - Score: ${r.score}/${r.assessment_items.max_score}
        - Error Type: ${r.error_type || 'None'}
        - Notes: ${r.teacher_notes || 'None'}`
      ).join('\n\n')}
      
      Based on this comprehensive assessment data, provide:
      1. 3-5 specific learning strengths demonstrated (be specific and evidence-based)
      2. 3-5 specific growth areas needing improvement (be specific and actionable)
      3. 3-5 learning patterns observed in performance (identify trends and behaviors)
      4. 4-6 personalized teaching recommendations for improvement (specific strategies)
      5. A concise overall summary of educational progress (2-3 sentences)
      
      Format your response as a JSON object with these keys: strengths, growth_areas, patterns_observed, recommendations, overall_summary.
      Each field except overall_summary should be an array of strings. overall_summary should be a string.
      
      Focus on educational insights that help teachers understand learning needs and develop targeted interventions.
    `;
    
    console.log('Calling Anthropic API...');
    
    // Call Anthropic Claude API
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        messages: [
          { 
            role: 'user', 
            content: prompt 
          }
        ],
        temperature: 0.7,
      })
    });
    
    const anthropicData = await anthropicResponse.json();
    
    if (!anthropicResponse.ok) {
      console.error('Anthropic API error:', anthropicData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `AI service error: ${anthropicData.error?.message || 'Unknown error'}`,
          details: anthropicData
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }
    
    // Extract and parse AI analysis
    let analysis;
    try {
      const responseText = anthropicData.content[0].text;
      analysis = JSON.parse(responseText);
    } catch (e) {
      // Fallback: try to extract JSON from response
      const responseText = anthropicData.content[0].text;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          analysis = JSON.parse(jsonMatch[0]);
        } catch (e2) {
          console.error('Failed to parse AI response:', responseText);
          return new Response(
            JSON.stringify({ success: false, message: 'Failed to parse AI analysis response' }),
            { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
          );
        }
      } else {
        console.error('No JSON found in AI response:', responseText);
        return new Response(
          JSON.stringify({ success: false, message: 'Invalid AI response format' }),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
        );
      }
    }
    
    // Validate analysis structure
    if (!analysis || !analysis.strengths || !analysis.growth_areas || 
        !analysis.patterns_observed || !analysis.recommendations) {
      console.error('Incomplete AI analysis:', analysis);
      return new Response(
        JSON.stringify({ success: false, message: 'Incomplete AI analysis response' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }
    
    // Prepare analysis data for database
    const analysisData = {
      assessment_id: assessment_id,
      student_id: student_id,
      strengths: analysis.strengths,
      growth_areas: analysis.growth_areas,
      patterns_observed: analysis.patterns_observed,
      recommendations: analysis.recommendations,
      overall_summary: analysis.overall_summary,
      analysis_json: {
        model: 'claude-3-sonnet-20240229',
        performance: {
          totalScore,
          maxPossibleScore,
          scorePercentage,
          errorTypeBreakdown,
          knowledgeTypeBreakdown,
          difficultyBreakdown
        },
        responses: responses.map(r => ({
          question: r.assessment_items.question_text,
          knowledge_type: r.assessment_items.knowledge_type,
          difficulty: r.assessment_items.difficulty_level,
          score: r.score,
          max_score: r.assessment_items.max_score,
          error_type: r.error_type,
          notes: r.teacher_notes
        }))
      }
    };
    
    console.log('Saving analysis to database...');
    
    // Save or update analysis in database
    const { data: existingAnalysis } = await supabaseClient
      .from('assessment_analysis')
      .select('id')
      .eq('assessment_id', assessment_id)
      .eq('student_id', student_id)
      .maybeSingle();
    
    let dbResult;
    if (existingAnalysis) {
      dbResult = await supabaseClient
        .from('assessment_analysis')
        .update(analysisData)
        .eq('id', existingAnalysis.id)
        .select()
        .single();
    } else {
      dbResult = await supabaseClient
        .from('assessment_analysis')
        .insert(analysisData)
        .select()
        .single();
    }
    
    if (dbResult.error) {
      console.error('Database error:', dbResult.error);
      return new Response(
        JSON.stringify({ success: false, message: `Error saving analysis: ${dbResult.error.message}` }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }
    
    console.log('Analysis completed successfully');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Educational analysis completed successfully',
        analysis: dbResult.data
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
    
  } catch (err) {
    console.error('Error in analyze-student-assessment function:', err);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: err.message,
        details: err.stack
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
    );
  }
});
