import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { getCorsHeaders } from '../_shared/cors.ts';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { student_id } = await req.json();
    
    if (!student_id) {
      return new Response(
        JSON.stringify({ error: 'Student ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        JSON.stringify({ error: 'Student not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Fetch assessment analysis
    const { data: analysis } = await supabase
      .from('assessment_analysis')
      .select('*')
      .eq('student_id', student_id)
      .order('created_at', { ascending: false })
      .limit(3);
    
    // Fetch recent responses
    const { data: responses } = await supabase
      .from('student_responses')
      .select('*, assessments!inner(title, subject), assessment_items!inner(knowledge_type, difficulty_level)')
      .eq('student_id', student_id)
      .order('created_at', { ascending: false })
      .limit(20);

    let suggestions: string[] = [];
    
    // Generate AI-powered suggestions if we have data and API key
    if (ANTHROPIC_API_KEY && (analysis?.length || responses?.length)) {
      try {
        const prompt = `
          Generate 5 specific, measurable learning goals for this student:

          STUDENT: ${student.first_name} ${student.last_name}, Grade: ${student.grade_level}
          Goals: ${student.learning_goals || 'Not specified'}
          Considerations: ${student.special_considerations || 'None'}

          ${analysis?.length ? `Recent Analysis: ${analysis.map(a => `Strengths: ${a.strengths?.join(', ')}, Growth Areas: ${a.growth_areas?.join(', ')}`).join('\n')}` : ''}

          Format as JSON array of strings: ["Goal 1", "Goal 2", ...]
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
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
          })
        });

        const anthropicData = await anthropicResponse.json();

        if (anthropicResponse.ok && anthropicData.content?.[0]) {
          try {
            const responseText = anthropicData.content[0].text;
            const jsonMatch = responseText.match(/\[[\s\S]*\]/);
            const aiSuggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);
            if (Array.isArray(aiSuggestions) && aiSuggestions.length > 0) {
              suggestions = aiSuggestions;
            }
          } catch (parseError) {
            console.log('Failed to parse AI suggestions');
          }
        }
      } catch (aiError) {
        console.log('AI goal generation failed:', aiError);
      }
    }
    
    // Fallback suggestions
    if (suggestions.length === 0) {
      if (analysis?.length && analysis[0].growth_areas) {
        for (const area of analysis[0].growth_areas.slice(0, 3)) {
          suggestions.push(`Improve understanding of ${area} through targeted practice`);
        }
      }
      
      // Grade-appropriate defaults
      const gradeLevel = student.grade_level || '';
      if (['K', '1st', '2nd', '3rd'].includes(gradeLevel)) {
        suggestions.push(
          "Increase reading fluency through daily guided reading practice",
          "Develop number sense through hands-on mathematical activities"
        );
      } else if (['4th', '5th', '6th'].includes(gradeLevel)) {
        suggestions.push(
          "Strengthen reading comprehension through weekly text analysis",
          "Master mathematical problem-solving with multi-step word problems"
        );
      } else {
        suggestions.push(
          "Enhance critical thinking through analytical essay writing",
          "Develop advanced study skills for academic success"
        );
      }
      
      while (suggestions.length < 5) {
        const generalGoals = [
          "Complete assignments consistently with quality work",
          "Participate actively in classroom discussions",
          "Develop self-reflection skills for continuous improvement"
        ];
        for (const goal of generalGoals) {
          if (!suggestions.includes(goal) && suggestions.length < 5) {
            suggestions.push(goal);
          }
        }
      }
    }
    
    return new Response(JSON.stringify({
      student_name: `${student.first_name} ${student.last_name}`,
      grade_level: student.grade_level,
      suggestions: [...new Set(suggestions)].slice(0, 5),
      ai_generated: !!(ANTHROPIC_API_KEY && (analysis?.length || responses?.length))
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
