
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { assessment_id, student_id } = await req.json();
    
    // Check for required parameters
    if (!assessment_id || !student_id) {
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
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Anthropic API key not configured. Please set the ANTHROPIC_API_KEY environment variable.' 
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }
    
    // Create Supabase client using service role (for querying the database)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );
    
    // Fetch assessment data
    const { data: assessment, error: assessmentError } = await supabaseClient
      .from('assessments')
      .select('*, assessment_items(*)')
      .eq('id', assessment_id)
      .single();
    
    if (assessmentError) {
      return new Response(
        JSON.stringify({ success: false, message: `Error fetching assessment: ${assessmentError.message}` }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }
    
    // Fetch student data
    const { data: student, error: studentError } = await supabaseClient
      .from('students')
      .select('*')
      .eq('id', student_id)
      .single();
    
    if (studentError) {
      return new Response(
        JSON.stringify({ success: false, message: `Error fetching student: ${studentError.message}` }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }
    
    // Fetch student responses for this assessment
    const { data: responses, error: responsesError } = await supabaseClient
      .from('student_responses')
      .select('*, assessment_item:assessment_item_id(*)')
      .eq('assessment_id', assessment_id)
      .eq('student_id', student_id);
    
    if (responsesError) {
      return new Response(
        JSON.stringify({ success: false, message: `Error fetching responses: ${responsesError.message}` }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }
    
    if (!responses || responses.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'No student responses found for this assessment' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 404 }
      );
    }
    
    // Process the data for AI analysis
    const totalItems = assessment.assessment_items.length;
    const totalCorrectItems = responses.filter(r => r.score > 0).length;
    const totalScore = responses.reduce((sum, r) => sum + Number(r.score), 0);
    const maxPossibleScore = responses.reduce((sum, r) => sum + Number(r.assessment_item.max_score), 0);
    const scorePercentage = (totalScore / maxPossibleScore) * 100;
    
    const errorTypeBreakdown = responses.reduce((acc, r) => {
      if (r.error_type && r.error_type !== 'none') {
        acc[r.error_type] = (acc[r.error_type] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const knowledgeTypeBreakdown = responses.reduce((acc, r) => {
      const knowledgeType = r.assessment_item.knowledge_type;
      if (!acc[knowledgeType]) {
        acc[knowledgeType] = {
          total: 0,
          correct: 0,
          score: 0,
          maxScore: 0
        };
      }
      
      acc[knowledgeType].total += 1;
      if (r.score === r.assessment_item.max_score) {
        acc[knowledgeType].correct += 1;
      }
      acc[knowledgeType].score += Number(r.score);
      acc[knowledgeType].maxScore += Number(r.assessment_item.max_score);
      
      return acc;
    }, {} as Record<string, { total: number; correct: number; score: number; maxScore: number }>);
    
    const difficultyBreakdown = responses.reduce((acc, r) => {
      const difficulty = r.assessment_item.difficulty_level;
      if (!acc[difficulty]) {
        acc[difficulty] = {
          total: 0,
          correct: 0,
          score: 0,
          maxScore: 0
        };
      }
      
      acc[difficulty].total += 1;
      if (r.score === r.assessment_item.max_score) {
        acc[difficulty].correct += 1;
      }
      acc[difficulty].score += Number(r.score);
      acc[difficulty].maxScore += Number(r.assessment_item.max_score);
      
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
        `Item ${i+1}: "${r.assessment_item.question_text}"
        - Knowledge Type: ${r.assessment_item.knowledge_type}
        - Difficulty: ${r.assessment_item.difficulty_level}
        - Score: ${r.score}/${r.assessment_item.max_score}
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
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Error from Anthropic: ${anthropicData.error?.message || 'Unknown error'}` 
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }
    
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
          return new Response(
            JSON.stringify({ success: false, message: 'Failed to parse AI response' }),
            { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
          );
        }
      } else {
        return new Response(
          JSON.stringify({ success: false, message: 'Invalid AI response format' }),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
        );
      }
    }
    
    // Check if the analysis has the expected structure
    if (!analysis || !analysis.strengths || !analysis.growth_areas || 
        !analysis.patterns_observed || !analysis.recommendations) {
      return new Response(
        JSON.stringify({ success: false, message: 'Incomplete AI analysis' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }
    
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
          question: r.assessment_item.question_text,
          knowledge_type: r.assessment_item.knowledge_type,
          difficulty: r.assessment_item.difficulty_level,
          score: r.score,
          max_score: r.assessment_item.max_score,
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
      // Update the existing analysis
      dbResult = await supabaseClient
        .from('assessment_analysis')
        .update(analysisData)
        .eq('id', existingAnalysis.id)
        .select()
        .single();
    } else {
      // Insert a new analysis
      dbResult = await supabaseClient
        .from('assessment_analysis')
        .insert(analysisData)
        .select()
        .single();
    }
    
    if (dbResult.error) {
      return new Response(
        JSON.stringify({ success: false, message: `Error saving analysis: ${dbResult.error.message}` }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }
    
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

// Helper function to create Supabase client
function createClient(supabaseUrl: string, supabaseKey: string) {
  return {
    from(table: string) {
      return {
        select(columns = '*') {
          let url = `${supabaseUrl}/rest/v1/${table}?select=${columns}`;
          let headers = {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          };
          let query: Record<string, any> = {};
          
          return {
            eq(column: string, value: any) {
              query[column] = `eq.${value}`;
              return this;
            },
            single() {
              url += '&limit=1';
              return fetch(url, { 
                headers,
                method: 'GET',
                signal: AbortSignal.timeout(15000)
              })
              .then(response => response.json())
              .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                  return { data: data[0], error: null };
                } else if (Array.isArray(data) && data.length === 0) {
                  return { data: null, error: { message: 'No rows found' } };
                }
                return { data, error: null };
              })
              .catch(error => ({ data: null, error }));
            },
            maybeSingle() {
              url += '&limit=1';
              return fetch(url, { 
                headers,
                method: 'GET',
                signal: AbortSignal.timeout(15000)
              })
              .then(response => response.json())
              .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                  return { data: data[0], error: null };
                } else if (Array.isArray(data) && data.length === 0) {
                  return { data: null, error: null };
                }
                return { data, error: null };
              })
              .catch(error => ({ data: null, error }));
            },
            then(resolve: any) {
              Object.keys(query).forEach(key => {
                url += `&${key}=${encodeURIComponent(query[key])}`;
              });
              
              return fetch(url, { 
                headers,
                method: 'GET',
                signal: AbortSignal.timeout(15000)
              })
              .then(response => response.json())
              .then(data => resolve({ data, error: null }))
              .catch(error => resolve({ data: null, error }));
            }
          };
        },
        insert(data: any) {
          const url = `${supabaseUrl}/rest/v1/${table}`;
          const headers = {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'return=representation'
          };
          
          return {
            select(columns = '*') {
              return fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(data),
                signal: AbortSignal.timeout(15000)
              })
              .then(response => response.json())
              .then(result => ({ data: result, error: null }))
              .catch(error => ({ data: null, error }));
            }
          };
        },
        update(data: any) {
          let url = `${supabaseUrl}/rest/v1/${table}`;
          const headers = {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'return=representation'
          };
          let conditions: Record<string, any> = {};
          
          return {
            eq(column: string, value: any) {
              conditions[column] = `eq.${value}`;
              return this;
            },
            select(columns = '*') {
              Object.keys(conditions).forEach((key, index) => {
                url += `${index === 0 ? '?' : '&'}${key}=${encodeURIComponent(conditions[key])}`;
              });
              
              return fetch(url, {
                method: 'PATCH',
                headers,
                body: JSON.stringify(data),
                signal: AbortSignal.timeout(15000)
              })
              .then(response => response.json())
              .then(result => ({ data: result, error: null }))
              .catch(error => ({ data: null, error }));
            },
            single() {
              Object.keys(conditions).forEach((key, index) => {
                url += `${index === 0 ? '?' : '&'}${key}=${encodeURIComponent(conditions[key])}`;
              });
              url += '&limit=1';
              
              return fetch(url, {
                method: 'PATCH',
                headers,
                body: JSON.stringify(data),
                signal: AbortSignal.timeout(15000)
              })
              .then(response => response.json())
              .then(result => {
                if (Array.isArray(result) && result.length > 0) {
                  return { data: result[0], error: null };
                }
                return { data: result, error: null };
              })
              .catch(error => ({ data: null, error }));
            }
          };
        }
      };
    }
  };
}
