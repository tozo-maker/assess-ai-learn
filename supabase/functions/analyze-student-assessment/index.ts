
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { OpenAI } from 'https://esm.sh/openai@4';
import { corsHeaders } from '../_shared/cors.ts';

const openaiClient = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY') || '',
});

interface RequestBody {
  assessment_id: string;
  student_id: string;
}

Deno.serve(async (req) => {
  // Handle CORS pre-flight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey || !openaiClient.apiKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Server configuration error. Missing required environment variables.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Create clients with the Auth context of the user that called the function
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse request body
    const { assessment_id, student_id } = await req.json() as RequestBody;
    
    if (!assessment_id || !student_id) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required parameters: assessment_id and student_id' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Step 1: Get the assessment data
    const { data: assessment, error: assessmentError } = await supabaseClient
      .from('assessments')
      .select('*')
      .eq('id', assessment_id)
      .single();

    if (assessmentError || !assessment) {
      return new Response(
        JSON.stringify({ success: false, message: 'Assessment not found', error: assessmentError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Step 2: Get the assessment items
    const { data: assessmentItems, error: itemsError } = await supabaseClient
      .from('assessment_items')
      .select('*')
      .eq('assessment_id', assessment_id)
      .order('item_number', { ascending: true });

    if (itemsError) {
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to fetch assessment items', error: itemsError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Step 3: Get the student responses
    const { data: studentResponses, error: responsesError } = await supabaseClient
      .from('student_responses')
      .select('*')
      .eq('assessment_id', assessment_id)
      .eq('student_id', student_id);

    if (responsesError) {
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to fetch student responses', error: responsesError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (!studentResponses || studentResponses.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'No student responses found for this assessment' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Step 4: Get the student information
    const { data: student, error: studentError } = await supabaseClient
      .from('students')
      .select('*')
      .eq('id', student_id)
      .single();

    if (studentError || !student) {
      return new Response(
        JSON.stringify({ success: false, message: 'Student not found', error: studentError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Step 5: Prepare the analysis data for GPT
    const assessmentData = {
      assessment: assessment,
      items: assessmentItems,
      responses: studentResponses.map(response => {
        const item = assessmentItems.find(item => item.id === response.assessment_item_id);
        return {
          ...response,
          item_details: item,
          score_percentage: item ? (response.score / item.max_score * 100) : 0,
        };
      }),
      student: {
        name: `${student.first_name} ${student.last_name}`,
        grade: student.grade_level,
        special_considerations: student.special_considerations || null,
        learning_goals: student.learning_goals || null,
      },
      totalScore: studentResponses.reduce((total, response) => total + Number(response.score), 0),
      maxPossibleScore: assessment.max_score,
      scorePercentage: (studentResponses.reduce((total, response) => total + Number(response.score), 0) / assessment.max_score * 100).toFixed(1),
    };

    // Step 6: Create the prompt for GPT
    const prompt = `
    As an educational assessment expert, analyze the following assessment data for a student and provide insights.
    
    ASSESSMENT INFORMATION:
    - Title: ${assessment.title}
    - Subject: ${assessment.subject}
    - Grade Level: ${assessment.grade_level}
    - Type: ${assessment.assessment_type}
    - Standards Covered: ${assessment.standards_covered ? assessment.standards_covered.join(", ") : "None specified"}
    
    STUDENT INFORMATION:
    - Name: ${assessmentData.student.name}
    - Grade: ${assessmentData.student.grade}
    - Special Considerations: ${assessmentData.student.special_considerations || "None"}
    - Learning Goals: ${assessmentData.student.learning_goals || "None specified"}
    
    PERFORMANCE SUMMARY:
    - Total Score: ${assessmentData.totalScore} out of ${assessmentData.maxPossibleScore} (${assessmentData.scorePercentage}%)
    
    DETAILED RESPONSES:
    ${assessmentData.responses.map(r => `
    Item #${r.item_details?.item_number || '?'}: "${r.item_details?.question_text || '?'}"
    - Knowledge Type: ${r.item_details?.knowledge_type || '?'}
    - Difficulty: ${r.item_details?.difficulty_level || '?'}
    - Standard: ${r.item_details?.standard_reference || 'None'}
    - Score: ${r.score} / ${r.item_details?.max_score || '?'} (${r.score_percentage.toFixed(1)}%)
    - Error Type: ${r.error_type || 'None'}
    - Teacher Notes: ${r.teacher_notes || 'None'}
    `).join('\n')}
    
    Based on this assessment data, please provide:
    
    1. STRENGTHS: Identify 3-5 specific strengths demonstrated by the student in this assessment.
    2. GROWTH AREAS: Identify 3-5 specific areas where the student needs improvement, based on the assessment results.
    3. PATTERNS OBSERVED: Identify 2-4 patterns in the student's responses (e.g., struggles with certain types of problems, excels in specific areas, etc.)
    4. RECOMMENDATIONS: Provide 3-5 specific, actionable recommendations for helping this student improve.
    5. OVERALL SUMMARY: Provide a brief paragraph summarizing the student's performance and next steps.
    
    Format your response as JSON with the following structure:
    {
      "strengths": ["strength1", "strength2", ...],
      "growth_areas": ["area1", "area2", ...],
      "patterns_observed": ["pattern1", "pattern2", ...],
      "recommendations": ["recommendation1", "recommendation2", ...],
      "overall_summary": "A paragraph summarizing the analysis..."
    }
    `;

    // Step 7: Call the OpenAI API
    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an expert educational assessment analyst that provides insightful analysis of student performance. You always respond in valid JSON format as specified." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const analysisText = completion.choices[0]?.message?.content || '{}';
    let analysis;
    
    try {
      analysis = JSON.parse(analysisText);
    } catch (e) {
      console.error("Failed to parse OpenAI response as JSON:", e);
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to parse AI analysis response', rawResponse: analysisText }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Step 8: Store the analysis in the database
    const analysisData = {
      assessment_id: assessment_id,
      student_id: student_id,
      strengths: analysis.strengths || [],
      growth_areas: analysis.growth_areas || [],
      patterns_observed: analysis.patterns_observed || [],
      recommendations: analysis.recommendations || [],
      overall_summary: analysis.overall_summary || "",
      analysis_json: analysis
    };

    // Check if an analysis already exists and update it, or create a new one
    const { data: existingAnalysis, error: existingAnalysisError } = await supabaseClient
      .from('assessment_analysis')
      .select('id')
      .eq('assessment_id', assessment_id)
      .eq('student_id', student_id)
      .maybeSingle();

    let saveResult;
    
    if (existingAnalysis) {
      // Update existing analysis
      saveResult = await supabaseClient
        .from('assessment_analysis')
        .update(analysisData)
        .eq('id', existingAnalysis.id)
        .select();
    } else {
      // Create new analysis
      saveResult = await supabaseClient
        .from('assessment_analysis')
        .insert(analysisData)
        .select();
    }

    if (saveResult.error) {
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to save analysis', error: saveResult.error }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Analysis completed and saved successfully', 
        analysis_id: saveResult.data[0].id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
