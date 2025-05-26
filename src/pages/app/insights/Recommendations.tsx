
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageShell } from '@/components/ui/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Users, BookOpen, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Recommendations = () => {
  const { data: analysisData, isLoading } = useQuery({
    queryKey: ['assessment-analysis-recommendations'],
    queryFn: async () => {
      console.log('Fetching assessment analysis for recommendations...');
      
      const { data, error } = await supabase
        .from('assessment_analysis')
        .select(`
          *,
          students!inner(first_name, last_name, grade_level),
          assessments!inner(title, subject)
        `);

      if (error) {
        console.error('Error fetching analysis data:', error);
        throw error;
      }

      console.log('Fetched analysis data:', data?.length || 0, 'records');
      return data;
    }
  });

  if (isLoading) {
    return (
      <PageShell
        title="AI Recommendations"
        description="Personalized teaching strategies and interventions"
        icon={<Lightbulb className="h-6 w-6 text-blue-600" />}
      >
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4">Loading recommendations...</p>
          </div>
        </div>
      </PageShell>
    );
  }

  if (!analysisData || analysisData.length === 0) {
    return (
      <PageShell
        title="AI Recommendations"
        description="Personalized teaching strategies and interventions"
        icon={<Lightbulb className="h-6 w-6 text-blue-600" />}
      >
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Lightbulb className="h-6 w-6 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium">No recommendations available</h3>
            <p className="text-sm text-gray-500 mt-1">
              Recommendations will be generated after students complete assessments and AI analysis is performed.
            </p>
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  // Group recommendations by student
  const studentRecommendations = analysisData.reduce((acc, analysis) => {
    const studentKey = `${analysis.students.first_name} ${analysis.students.last_name}`;
    if (!acc[studentKey]) {
      acc[studentKey] = {
        student: analysis.students,
        recommendations: [],
        subjects: new Set()
      };
    }
    
    analysis.recommendations.forEach(rec => {
      acc[studentKey].recommendations.push({
        recommendation: rec,
        subject: analysis.assessments.subject,
        assessment: analysis.assessments.title
      });
    });
    
    acc[studentKey].subjects.add(analysis.assessments.subject);
    return acc;
  }, {});

  // Collect all unique recommendations for general insights
  const allRecommendations = analysisData.flatMap(analysis => 
    analysis.recommendations.map(rec => ({
      text: rec,
      subject: analysis.assessments.subject,
      count: 1
    }))
  );

  // Count frequency of similar recommendations
  const recommendationCounts = allRecommendations.reduce((acc, rec) => {
    const key = rec.text.toLowerCase();
    if (!acc[key]) {
      acc[key] = {
        text: rec.text,
        subjects: new Set(),
        count: 0
      };
    }
    acc[key].subjects.add(rec.subject);
    acc[key].count += 1;
    return acc;
  }, {});

  const topRecommendations = Object.values(recommendationCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return (
    <PageShell
      title="AI Recommendations"
      description="Personalized teaching strategies and interventions"
      icon={<Lightbulb className="h-6 w-6 text-blue-600" />}
    >
      <div className="space-y-8">
        {/* Top Recommendations Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Most Common Recommendations
            </CardTitle>
            <CardDescription>
              Frequently suggested interventions across your students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topRecommendations.map((rec, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-medium">{rec.text}</p>
                    <Badge variant="secondary">{rec.count} students</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Array.from(rec.subjects).map((subject, subIndex) => (
                      <Badge key={subIndex} variant="outline" className="text-xs">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Individual Student Recommendations */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Individual Student Recommendations
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(studentRecommendations).map(([studentName, data]) => (
              <Card key={studentName}>
                <CardHeader>
                  <CardTitle className="text-lg">{studentName}</CardTitle>
                  <CardDescription>
                    Grade {data.student.grade_level} | {Array.from(data.subjects).join(', ')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.recommendations.slice(0, 5).map((rec, index) => (
                      <div key={index} className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-900">{rec.recommendation}</p>
                        <div className="flex items-center mt-2 space-x-2">
                          <BookOpen className="h-3 w-3 text-blue-600" />
                          <span className="text-xs text-blue-600">{rec.subject}</span>
                        </div>
                      </div>
                    ))}
                    
                    {data.recommendations.length > 5 && (
                      <p className="text-sm text-gray-500 text-center">
                        +{data.recommendations.length - 5} more recommendations
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default Recommendations;
