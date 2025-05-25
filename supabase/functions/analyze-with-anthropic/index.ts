
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { corsHeaders } from "../_shared/cors.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Starting analyze-with-anthropic function...');
    
    // Parse the request body
    const { assessment_id, student_id } = await req.json();
    console.log('Received request for assessment:', assessment_id, 'student:', student_id);
    
    // Check for required parameters
    if (!assessment_id || !student_id) {
      console.error('Missing required parameters:', { assessment_id, student_id });
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Missing required parameters: assessment_id or student_id' 
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 400 }
      );
    }

    // Check if we have the API key
    if (!ANTHROPIC_API_KEY) {
      console.error('Anthropic API key not configured');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Anthropic API key not configured. Please set the ANTHROPIC_API_KEY environment variable.' 
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }
    
    // Create Supabase client using the official SDK
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );
    
    console.log('Fetching assessment data...');
    // Fetch assessment data with items
    const { data: assessment, error: assessmentError } = await supabaseClient
      .from('assessments')
      .select(`
        *,
        assessment_items (*)
      `)
      .eq('id', assessment_id)
      .single();
    
    if (assessmentError) {
      console.error('Error fetching assessment:', assessmentError);
      return new Response(
        JSON.stringify({ success: false, message: `Error fetching assessment: ${assessmentError.message}` }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }
    
    console.log('Fetching student data...');
    // Fetch student data
    const { data: student, error: studentError } = await supabaseClient
      .from('students')
      .select('*')
      .eq('id', student_id)
      .single();
    
    if (studentError) {
      console.error('Error fetching student:', studentError);
      return new Response(
        JSON.stringify({ success: false, message: `Error fetching student: ${studentError.message}` }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }
    
    console.log('Fetching student responses...');
    // Fetch student responses for this assessment with assessment items
    const { data: responses, error: responsesError } = await supabaseClient
      .from('student_responses')
      .select(`
        *,
        assessment_items!inner (*)
      `)
      .eq('assessment_id', assessment_id)
      .eq('student_id', student_id);
    
    if (responsesError) {
      console.error('Error fetching responses:', responsesError);
      return new Response(
        JSON.stringify({ success: false, message: `Error fetching responses: ${responsesError.message}` }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }
    
    if (!responses || responses.length === 0) {
      console.error('No student responses found');
      return new Response(
        JSON.stringify({ success: false, message: 'No student responses found for this assessment' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 404 }
      );
    }
    
    console.log(`Found ${responses.length} responses for analysis`);
    
    // Process the data for AI analysis
    const totalItems = assessment.assessment_items.length;
    const totalCorrectItems = responses.filter(r => r.score > 0).length;
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
    
    // Create a detailed prompt for Claude
    const prompt = `
      You are an expert educational analyst. Please analyze the following assessment data for a student and provide insights:
      
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
      
      Based on this assessment data, please provide:
      1. 3-5 specific strengths the student demonstrated (be specific)
      2. 3-5 specific growth areas where the student needs improvement (be specific)
      3. 3-5 learning patterns observed in the student's performance
      4. 4-6 personalized teaching recommendations to help this student improve
      5. A brief overall summary of the student's performance (2-3 sentences)
      
      Format your response as a JSON object with these keys: strengths, growth_areas, patterns_observed, recommendations, overall_summary.
      Each field except overall_summary should be an array of strings. overall_summary should be a string.
    `;
    
    console.log('Calling Anthropic API...');
    // Call Anthropic API
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        system: "You are an expert educational analyst providing insights based on student assessment data. You specialize in identifying learning patterns and providing actionable recommendations for teachers."
      })
    });
    
    const anthropicData = await anthropicResponse.json();
    
    if (!anthropicResponse.ok) {
      console.error('Anthropic API error:', anthropicData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Error from Anthropic: ${anthropicData.error?.message || 'Unknown error'}` 
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }
    
    console.log('Processing Anthropic response...');
    // Extract the analysis from the API response
    let analysis;
    try {
      // Parse the JSON from the response content
      const responseText = anthropicData.content[0].text;
      analysis = JSON.parse(responseText);
    } catch (e) {
      // If parsing fails, try to use regex to extract the JSON
      const responseText = anthropicData.content[0].text;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          analysis = JSON.parse(jsonMatch[0]);
        } catch (e2) {
          console.error('Failed to parse AI response:', e2);
          return new Response(
            JSON.stringify({ success: false, message: 'Failed to parse AI response' }),
            { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
          );
        }
      } else {
        console.error('Invalid AI response format');
        return new Response(
          JSON.stringify({ success: false, message: 'Invalid AI response format' }),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
        );
      }
    }
    
    // Check if the analysis has the expected structure
    if (!analysis || !analysis.strengths || !analysis.growth_areas || 
        !analysis.patterns_observed || !analysis.recommendations) {
      console.error('Incomplete AI analysis:', analysis);
      return new Response(
        JSON.stringify({ success: false, message: 'Incomplete AI analysis' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }
    
    console.log('Saving analysis to database...');
    // Save the analysis to the database
    const analysisData = {
      assessment_id: assessment_id,
      student_id: student_id,
      strengths: analysis.strengths,
      growth_areas: analysis.growth_areas,
      patterns_observed: analysis.patterns_observed,
      recommendations: analysis.recommendations,
      overall_summary: analysis.overall_summary,
      analysis_json: {
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
        })),
        model: 'claude-3-sonnet-20240229'
      }
    };
    
    // Check if an analysis already exists and update or insert accordingly
    const { data: existingAnalysis } = await supabaseClient
      .from('assessment_analysis')
      .select('id')
      .eq('assessment_id', assessment_id)
      .eq('student_id', student_id)
      .maybeSingle();
    
    let dbResult;
    if (existingAnalysis) {
      console.log('Updating existing analysis...');
      // Update the existing analysis
      dbResult = await supabaseClient
        .from('assessment_analysis')
        .update(analysisData)
        .eq('id', existingAnalysis.id)
        .select()
        .single();
    } else {
      console.log('Creating new analysis...');
      // Insert a new analysis
      dbResult = await supabaseClient
        .from('assessment_analysis')
        .insert(analysisData)
        .select()
        .single();
    }
    
    if (dbResult.error) {
      console.error('Error saving analysis:', dbResult.error);
      return new Response(
        JSON.stringify({ success: false, message: `Error saving analysis: ${dbResult.error.message}` }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }
    
    console.log('Analysis completed successfully');
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Analysis completed successfully with Claude',
        analysis: dbResult.data
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
    
  } catch (err) {
    console.error('Error in analyze-with-anthropic function:', err);
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
    );
  }
});
