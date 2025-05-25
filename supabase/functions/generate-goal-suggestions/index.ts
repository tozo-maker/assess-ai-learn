
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Fetch student data and assessment analysis
    const { data: students, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', student_id);
    
    if (studentError || !students || students.length === 0) {
      throw new Error(`Student not found: ${studentError?.message || 'No student data'}`);
    }
    
    const student = students[0];
    
    // Fetch latest assessment analysis
    const { data: analysis, error: analysisError } = await supabase
      .from('assessment_analysis')
      .select('*')
      .eq('student_id', student_id)
      .order('created_at', { ascending: false })
      .limit(3);
    
    // Fetch student's recent assessment performance
    const { data: responses, error: responsesError } = await supabase
      .from('student_responses')
      .select(`
        *,
        assessments!inner(title, subject, assessment_type),
        assessment_items!inner(knowledge_type, difficulty_level)
      `)
      .eq('student_id', student_id)
      .order('created_at', { ascending: false })
      .limit(20);

    let suggestions = [];
    
    // If we have AI analysis and Anthropic API key, generate AI-powered suggestions
    if (ANTHROPIC_API_KEY && (analysis?.length > 0 || responses?.length > 0)) {
      try {
        const prompt = `
          You are an expert educational consultant specializing in personalized learning goals. Based on the following student data, generate 5 specific, actionable learning goals.

          STUDENT INFORMATION:
          Name: ${student.first_name} ${student.last_name}
          Grade Level: ${student.grade_level}
          Learning Goals: ${student.learning_goals || 'Not specified'}
          Special Considerations: ${student.special_considerations || 'None noted'}

          ${analysis && analysis.length > 0 ? `
          RECENT AI ANALYSIS:
          ${analysis.map((a, i) => `
          Analysis ${i + 1}:
          - Strengths: ${a.strengths?.join(', ') || 'None identified'}
          - Growth Areas: ${a.growth_areas?.join(', ') || 'None identified'}
          - Patterns: ${a.patterns_observed?.join(', ') || 'None identified'}
          `).join('\n')}
          ` : ''}

          ${responses && responses.length > 0 ? `
          RECENT ASSESSMENT PERFORMANCE (Last 20 responses):
          ${responses.map((r, i) => `
          Response ${i + 1}: ${r.assessments.title} (${r.assessments.subject})
          - Knowledge Type: ${r.assessment_items.knowledge_type}
          - Difficulty: ${r.assessment_items.difficulty_level}
          - Score: ${r.score} (Error Type: ${r.error_type || 'None'})
          `).join('\n')}
          ` : ''}

          Please generate 5 specific, measurable learning goals that:
          1. Are appropriate for a ${student.grade_level} grade student
          2. Address identified growth areas while building on strengths
          3. Are achievable within a 6-8 week timeframe
          4. Include specific actions or strategies
          5. Consider the student's special needs and learning style

          Format your response as a JSON array of strings, where each string is a complete goal statement.
          Example format: ["Goal 1 text here", "Goal 2 text here", ...]
        `;

        const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 1000,
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

        if (anthropicResponse.ok && anthropicData.content && anthropicData.content[0]) {
          try {
            const responseText = anthropicData.content[0].text;
            const aiSuggestions = JSON.parse(responseText);
            if (Array.isArray(aiSuggestions) && aiSuggestions.length > 0) {
              suggestions = aiSuggestions;
            }
          } catch (parseError) {
            console.log('Failed to parse AI suggestions, falling back to template goals');
          }
        }
      } catch (aiError) {
        console.log('AI goal generation failed, falling back to template goals:', aiError);
      }
    }
    
    // If AI didn't generate suggestions, create template suggestions based on available data
    if (suggestions.length === 0) {
      // Use analysis data if available
      if (analysis && analysis.length > 0) {
        const growthAreas = analysis[0].growth_areas || [];
        
        for (const area of growthAreas.slice(0, 3)) {
          suggestions.push(
            `Improve understanding of ${area} through daily practice exercises and targeted instruction`
          );
        }
      }
      
      // Add grade-appropriate template goals
      if (student.grade_level) {
        if (['K', '1st', '2nd', '3rd'].includes(student.grade_level)) {
          suggestions.push(
            "Increase reading fluency by reading for 20 minutes daily",
            "Develop number sense through counting games and activities",
            "Improve fine motor skills through writing and drawing exercises"
          );
        } else if (['4th', '5th', '6th'].includes(student.grade_level)) {
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
        const generalGoals = [
          "Complete assigned homework consistently and on time",
          "Actively participate in class discussions",
          "Review notes daily to reinforce learning",
          "Ask questions when concepts are unclear",
          "Set specific academic goals for each quarter"
        ];
        
        for (const goal of generalGoals) {
          if (!suggestions.includes(goal) && suggestions.length < 5) {
            suggestions.push(goal);
          }
        }
      }
    }
    
    // Limit to 5 unique suggestions
    const uniqueSuggestions = [...new Set(suggestions)].slice(0, 5);
    
    return new Response(JSON.stringify({
      student_name: `${student.first_name} ${student.last_name}`,
      grade_level: student.grade_level,
      suggestions: uniqueSuggestions,
      ai_generated: ANTHROPIC_API_KEY && (analysis?.length > 0 || responses?.length > 0)
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
