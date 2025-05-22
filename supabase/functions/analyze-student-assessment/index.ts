
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.41.1";
import { Configuration, OpenAIApi } from "https://esm.sh/openai@4.28.4";

interface RequestBody {
  assessment_id: string;
  student_id: string;
}

serve(async (req) => {
  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization") ?? "" },
        },
      }
    );

    // Get the JSON body from the request
    const body = await req.json() as RequestBody;
    const { assessment_id, student_id } = body;

    if (!assessment_id || !student_id) {
      return new Response(
        JSON.stringify({ error: "assessment_id and student_id are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fetch assessment, assessment items, and student responses data
    const { data: assessment, error: assessmentError } = await supabaseClient
      .from("assessments")
      .select("*")
      .eq("id", assessment_id)
      .single();

    if (assessmentError) {
      throw assessmentError;
    }

    const { data: assessmentItems, error: itemsError } = await supabaseClient
      .from("assessment_items")
      .select("*")
      .eq("assessment_id", assessment_id)
      .order("item_number", { ascending: true });

    if (itemsError) {
      throw itemsError;
    }

    const { data: student, error: studentError } = await supabaseClient
      .from("students")
      .select("*")
      .eq("id", student_id)
      .single();

    if (studentError) {
      throw studentError;
    }

    const { data: responses, error: responsesError } = await supabaseClient
      .from("student_responses")
      .select("*, assessment_items(*)")
      .eq("assessment_id", assessment_id)
      .eq("student_id", student_id);

    if (responsesError) {
      throw responsesError;
    }

    // Check if we already have an analysis for this assessment and student
    const { data: existingAnalysis } = await supabaseClient
      .from("assessment_analysis")
      .select("*")
      .eq("assessment_id", assessment_id)
      .eq("student_id", student_id)
      .maybeSingle();

    // Calculate student performance metrics
    const totalScore = responses.reduce((sum, r) => sum + Number(r.score), 0);
    const maxPossibleScore = assessmentItems.reduce((sum, item) => sum + Number(item.max_score), 0);
    const percentScore = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
    
    // Prepare data for OpenAI
    const responseDetails = responses.map(r => {
      const item = assessmentItems.find(item => item.id === r.assessment_item_id);
      return {
        question_number: item?.item_number,
        question_text: item?.question_text,
        knowledge_type: item?.knowledge_type,
        difficulty: item?.difficulty_level,
        max_score: item?.max_score,
        student_score: r.score,
        error_type: r.error_type,
        teacher_notes: r.teacher_notes,
      };
    });

    // Initialize OpenAI
    const configuration = new Configuration({
      apiKey: Deno.env.get("OPENAI_API_KEY"),
    });
    const openai = new OpenAIApi(configuration);

    // Create educational context-aware prompt
    const prompt = `
    You are an expert educational analyst specializing in identifying learning patterns and providing actionable insights for teachers.

    Analyze the following assessment data for ${student.first_name} ${student.last_name}, a student in grade ${student.grade_level}:

    ASSESSMENT INFORMATION:
    - Title: ${assessment.title}
    - Subject: ${assessment.subject}
    - Type: ${assessment.assessment_type}
    - Score: ${totalScore}/${maxPossibleScore} (${percentScore.toFixed(1)}%)

    STUDENT RESPONSES:
    ${JSON.stringify(responseDetails, null, 2)}

    Based on the patterns in this assessment data, provide the following analysis:
    1. STRENGTHS: Identify 2-4 specific strengths demonstrated by the student in this assessment.
    2. GROWTH AREAS: Identify 2-4 specific areas where the student needs improvement.
    3. PATTERNS: Identify any patterns in the student's performance (e.g., struggles with specific knowledge types, difficulty levels, or concepts).
    4. RECOMMENDATIONS: Provide 3-5 specific, actionable teaching strategies that could help address the identified growth areas.
    5. SUMMARY: A brief paragraph summarizing the student's overall performance and key takeaways.

    Provide your response in JSON format with the following structure:
    {
      "strengths": ["strength1", "strength2", ...],
      "growth_areas": ["area1", "area2", ...],
      "patterns_observed": ["pattern1", "pattern2", ...],
      "recommendations": ["recommendation1", "recommendation2", ...],
      "overall_summary": "summary paragraph"
    }
    `;

    // Call OpenAI API
    const completion = await openai.createChatCompletion({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: "You are an expert educational analyst providing insights based on student assessment data." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const analysisText = completion.data.choices[0].message?.content || "";
    let analysis: any = {};

    try {
      // Extract JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI response as JSON");
      }
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);
      analysis = {
        strengths: ["Analysis processing error"],
        growth_areas: ["Analysis processing error"],
        patterns_observed: ["Analysis processing error"],
        recommendations: ["Please try again"],
        overall_summary: "There was an error processing the analysis."
      };
    }

    // Save or update the analysis in the database
    const analysisData = {
      assessment_id,
      student_id,
      strengths: analysis.strengths || [],
      growth_areas: analysis.growth_areas || [],
      patterns_observed: analysis.patterns_observed || [],
      recommendations: analysis.recommendations || [],
      overall_summary: analysis.overall_summary || "",
      analysis_json: analysis
    };

    let result;
    if (existingAnalysis) {
      const { data, error } = await supabaseClient
        .from("assessment_analysis")
        .update(analysisData)
        .eq("id", existingAnalysis.id)
        .select()
        .single();
        
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabaseClient
        .from("assessment_analysis")
        .insert(analysisData)
        .select()
        .single();
        
      if (error) throw error;
      result = data;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Analysis completed successfully", 
        analysis: result 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
