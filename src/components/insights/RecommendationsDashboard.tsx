import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, TrendingUp, Users, BookOpen, Target, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const RecommendationsDashboard: React.FC = () => {
  // Fetch recent assessment analyses for recommendations
  const { data: analysesData, isLoading } = useQuery({
    queryKey: ['recommendations-data'],
    queryFn: async () => {
      // Get recent analyses with recommendations
      const { data: analyses, error: analysesError } = await supabase
        .from('assessment_analysis')
        .select(`
          *,
          student:students(first_name, last_name, grade_level),
          assessment:assessments(title, subject)
        `)
        .not('recommendations', 'eq', '{}')
        .order('created_at', { ascending: false })
        .limit(20);

      if (analysesError) throw analysesError;

      // Get student skills that need attention
      const { data: skillsNeedingAttention, error: skillsError } = await supabase
        .from('student_skills')
        .select(`
          *,
          student:students(first_name, last_name, grade_level),
          skill:skills(name, subject, grade_level)
        `)
        .eq('current_mastery_level', 'Beginning')
        .order('last_assessed_at', { ascending: false })
        .limit(15);

      if (skillsError) throw skillsError;

      return { analyses, skillsNeedingAttention };
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const { analyses = [], skillsNeedingAttention = [] } = analysesData || {};

  // Aggregate recommendations by category
  const recommendationCategories = analyses.reduce((acc, analysis) => {
    analysis.recommendations.forEach((rec: string) => {
      // Simple categorization based on keywords
      let category = 'General';
      if (rec.toLowerCase().includes('practice') || rec.toLowerCase().includes('drill')) {
        category = 'Practice & Reinforcement';
      } else if (rec.toLowerCase().includes('support') || rec.toLowerCase().includes('help')) {
        category = 'Additional Support';
      } else if (rec.toLowerCase().includes('challenge') || rec.toLowerCase().includes('advance')) {
        category = 'Enrichment';
      } else if (rec.toLowerCase().includes('review') || rec.toLowerCase().includes('revisit')) {
        category = 'Review & Remediation';
      }

      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({
        recommendation: rec,
        student: analysis.student,
        assessment: analysis.assessment,
        created_at: analysis.created_at
      });
    });
    return acc;
  }, {} as Record<string, any[]>);

  // Priority recommendations (most recent and critical)
  const priorityRecommendations = analyses
    .filter(a => a.growth_areas.length > 0)
    .slice(0, 5)
    .map(analysis => ({
      student: analysis.student,
      assessment: analysis.assessment,
      growthAreas: analysis.growth_areas,
      recommendations: analysis.recommendations.slice(0, 2),
      created_at: analysis.created_at
    }));

  // Skills-based recommendations
  const skillsRecommendations = skillsNeedingAttention
    .slice(0, 8)
    .map(skill => ({
      student: skill.student,
      skill: skill.skill,
      recommendation: `Focus on ${skill.skill.name} fundamentals for ${skill.student.first_name}. Consider additional practice materials and one-on-one support.`,
      priority: 'High'
    }));

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Recommendations</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyses.reduce((sum, a) => sum + a.recommendations.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              from {analyses.length} recent analyses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students Need Support</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {new Set(skillsNeedingAttention.map(s => s.student_id)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              requiring immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skills to Focus</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(skillsNeedingAttention.map(s => s.skill_id)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              skills need reinforcement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Priority Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Priority Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {priorityRecommendations.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg bg-primary/5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium">
                      {item.student.first_name} {item.student.last_name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {item.assessment.subject} • Grade {item.student.grade_level}
                    </p>
                  </div>
                  <Badge variant="default" className="text-xs">
                    Priority
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Growth Areas:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.growthAreas.slice(0, 3).map((area, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Recommendations:</span>
                    <ul className="text-sm mt-1 space-y-1">
                      {item.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <ArrowRight className="h-3 w-3 mt-0.5 text-primary flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skills-Based Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-warning" />
            Skills Requiring Immediate Attention
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {skillsRecommendations.map((item, index) => (
              <div key={index} className="p-3 border rounded-lg bg-warning/5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">
                        {item.student.first_name} {item.student.last_name}
                      </h4>
                      <Badge variant="destructive" className="text-xs">
                        {item.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {item.skill.name} • {item.skill.subject} • Grade {item.skill.grade_level}
                    </p>
                    <p className="text-sm">{item.recommendation}</p>
                  </div>
                  <Button variant="outline" size="sm" className="ml-2">
                    Action Plan
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendation Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(recommendationCategories).map(([category, recs]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-lg">{category}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {recs.length} recommendation{recs.length !== 1 ? 's' : ''}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recs.slice(0, 4).map((rec, index) => (
                  <div key={index} className="p-2 bg-muted rounded text-sm">
                    <p className="mb-1">{rec.recommendation}</p>
                    <p className="text-xs text-muted-foreground">
                      For {rec.student.first_name} {rec.student.last_name} • {rec.assessment.subject}
                    </p>
                  </div>
                ))}
                {recs.length > 4 && (
                  <p className="text-xs text-center text-muted-foreground">
                    +{recs.length - 4} more recommendations
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};