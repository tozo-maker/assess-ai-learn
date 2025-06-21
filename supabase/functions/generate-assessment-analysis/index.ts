
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AssessmentAnalysisRequest {
  assessmentId: string;
  studentId: string;
  responses: Array<{
    itemId: string;
    score: number;
    maxScore: number;
    errorType?: string;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { assessmentId, studentId, responses }: AssessmentAnalysisRequest = await req.json();

    console.log('Generating analysis for:', { assessmentId, studentId, responseCount: responses.length });

    // Get assessment and student details
    const [assessmentResult, studentResult] = await Promise.all([
      supabase
        .from('assessments')
        .select(`
          *,
          assessment_items (*)
        `)
        .eq('id', assessmentId)
        .single(),
      
      supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single()
    ]);

    if (assessmentResult.error) throw assessmentResult.error;
    if (studentResult.error) throw studentResult.error;

    const assessment = assessmentResult.data;
    const student = studentResult.data;

    // Calculate performance metrics
    const totalScore = responses.reduce((sum, r) => sum + r.score, 0);
    const maxPossibleScore = responses.reduce((sum, r) => sum + r.maxScore, 0);
    const percentageScore = Math.round((totalScore / maxPossibleScore) * 100);

    // Analyze error patterns
    const errorTypes = responses
      .filter(r => r.errorType)
      .reduce((acc, r) => {
        acc[r.errorType!] = (acc[r.errorType!] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    // Generate analysis based on performance and errors
    const analysis = generateDetailedAnalysis({
      assessment,
      student,
      responses,
      totalScore,
      maxPossibleScore,
      percentageScore,
      errorTypes
    });

    console.log('Analysis generated successfully');

    return new Response(
      JSON.stringify(analysis),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Analysis generation error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate analysis',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

function generateDetailedAnalysis(data: any) {
  const { assessment, student, responses, totalScore, maxPossibleScore, percentageScore, errorTypes } = data;

  // Determine performance level
  let performanceLevel = 'Needs Improvement';
  if (percentageScore >= 90) performanceLevel = 'Excellent';
  else if (percentageScore >= 80) performanceLevel = 'Good';
  else if (percentageScore >= 70) performanceLevel = 'Satisfactory';

  // Identify strengths
  const strengths = [];
  const highScoreItems = responses.filter(r => (r.score / r.maxScore) >= 0.8);
  
  if (highScoreItems.length > 0) {
    strengths.push(`Strong performance on ${highScoreItems.length} out of ${responses.length} items`);
  }
  
  if (percentageScore >= 80) {
    strengths.push('Demonstrates solid understanding of core concepts');
  }

  if (Object.keys(errorTypes).length === 0) {
    strengths.push('Accurate responses with minimal errors');
  }

  // Identify growth areas
  const growth_areas = [];
  const lowScoreItems = responses.filter(r => (r.score / r.maxScore) < 0.6);
  
  if (lowScoreItems.length > 0) {
    growth_areas.push(`Needs improvement on ${lowScoreItems.length} challenging items`);
  }

  if (errorTypes.conceptual > 0) {
    growth_areas.push('Focus on strengthening conceptual understanding');
  }

  if (errorTypes.procedural > 0) {
    growth_areas.push('Practice step-by-step problem-solving procedures');
  }

  if (errorTypes.computational > 0) {
    growth_areas.push('Review computational accuracy and attention to detail');
  }

  // Pattern observations
  const patterns_observed = [];
  
  if (errorTypes.conceptual > errorTypes.procedural) {
    patterns_observed.push('Conceptual errors are more frequent than procedural ones');
  }

  const itemsByDifficulty = responses.reduce((acc, r) => {
    const item = assessment.assessment_items.find(item => item.id === r.itemId);
    if (item) {
      acc[item.difficulty_level] = acc[item.difficulty_level] || [];
      acc[item.difficulty_level].push(r);
    }
    return acc;
  }, {});

  if (itemsByDifficulty.easy && itemsByDifficulty.hard) {
    const easyAvg = itemsByDifficulty.easy.reduce((sum, r) => sum + (r.score / r.maxScore), 0) / itemsByDifficulty.easy.length;
    const hardAvg = itemsByDifficulty.hard.reduce((sum, r) => sum + (r.score / r.maxScore), 0) / itemsByDifficulty.hard.length;
    
    if (easyAvg - hardAvg > 0.3) {
      patterns_observed.push('Performance decreases significantly with item difficulty');
    }
  }

  // Generate recommendations
  const recommendations = [];
  
  if (percentageScore < 70) {
    recommendations.push('Schedule additional practice sessions to reinforce key concepts');
    recommendations.push('Consider peer tutoring or small group instruction');
  }

  if (errorTypes.conceptual > 0) {
    recommendations.push('Use visual aids and concrete examples to strengthen conceptual understanding');
  }

  if (errorTypes.procedural > 0) {
    recommendations.push('Practice step-by-step problem solving with guided instruction');
  }

  if (lowScoreItems.length > 2) {
    recommendations.push('Focus remediation on the most challenging topics identified');
  }

  recommendations.push('Provide specific feedback on each area for improvement');
  recommendations.push('Set achievable short-term goals for the next assessment');

  // Overall summary
  const overall_summary = `${student.first_name} scored ${totalScore}/${maxPossibleScore} (${percentageScore}%) on ${assessment.title}. ` +
    `Performance level: ${performanceLevel}. ` +
    (strengths.length > 0 ? `Key strengths include ${strengths[0].toLowerCase()}. ` : '') +
    (growth_areas.length > 0 ? `Primary growth areas: ${growth_areas[0].toLowerCase()}. ` : '') +
    'Targeted instruction and practice will support continued improvement.';

  return {
    strengths: strengths.length > 0 ? strengths : ['Completed the assessment'],
    growth_areas: growth_areas.length > 0 ? growth_areas : ['Continue building on current knowledge'],
    patterns_observed: patterns_observed.length > 0 ? patterns_observed : ['Standard performance pattern observed'],
    recommendations: recommendations,
    overall_summary,
    performance_metrics: {
      total_score: totalScore,
      max_score: maxPossibleScore,
      percentage: percentageScore,
      performance_level: performanceLevel,
      error_breakdown: errorTypes
    }
  };
}
