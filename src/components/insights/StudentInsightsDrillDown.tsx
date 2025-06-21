
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  FileText, 
  Calendar,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import StandardLoadingState from '@/components/common/StandardLoadingState';

interface StudentInsightsDrillDownProps {
  studentId: string;
  studentName: string;
}

const StudentInsightsDrillDown: React.FC<StudentInsightsDrillDownProps> = ({
  studentId,
  studentName
}) => {
  const [expandedAnalysis, setExpandedAnalysis] = useState<string | null>(null);

  // Fetch detailed insights for the student
  const { data: analysisData, isLoading } = useQuery({
    queryKey: ['student-detailed-insights', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessment_analysis')
        .select(`
          *,
          assessments (
            id,
            title,
            subject,
            assessment_date,
            assessment_type
          )
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Fetch student goals
  const { data: goals } = useQuery({
    queryKey: ['student-goals', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return <StandardLoadingState />;
  }

  // Aggregate insights across all analyses
  const allStrengths = analysisData?.flatMap(a => a.strengths || []) || [];
  const allGrowthAreas = analysisData?.flatMap(a => a.growth_areas || []) || [];
  const allRecommendations = analysisData?.flatMap(a => a.recommendations || []) || [];

  const uniqueStrengths = [...new Set(allStrengths)];
  const uniqueGrowthAreas = [...new Set(allGrowthAreas)];
  const uniqueRecommendations = [...new Set(allRecommendations)];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="h-6 w-6" />
          Detailed Insights: {studentName}
        </h2>
        <p className="text-gray-600">
          Comprehensive analysis based on {analysisData?.length || 0} assessment(s)
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <TrendingUp className="h-5 w-5" />
                  Key Strengths ({uniqueStrengths.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {uniqueStrengths.slice(0, 5).map((strength, index) => (
                    <Badge key={index} variant="secondary" className="bg-green-50 text-green-700 border-green-200 block">
                      {strength}
                    </Badge>
                  ))}
                  {uniqueStrengths.length === 0 && (
                    <p className="text-sm text-gray-500">No strengths identified yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Growth Areas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-700">
                  <TrendingDown className="h-5 w-5" />
                  Growth Areas ({uniqueGrowthAreas.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {uniqueGrowthAreas.slice(0, 5).map((area, index) => (
                    <Badge key={index} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 block">
                      {area}
                    </Badge>
                  ))}
                  {uniqueGrowthAreas.length === 0 && (
                    <p className="text-sm text-gray-500">No growth areas identified yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Active Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Target className="h-5 w-5" />
                  Active Goals ({goals?.filter(g => g.status === 'active').length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {goals?.filter(g => g.status === 'active').slice(0, 3).map(goal => (
                    <div key={goal.id} className="p-2 bg-blue-50 rounded border">
                      <p className="text-sm font-medium">{goal.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${goal.progress_percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">{goal.progress_percentage}%</span>
                      </div>
                    </div>
                  )) || (
                    <p className="text-sm text-gray-500">No active goals set.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {uniqueRecommendations.slice(0, 6).map((recommendation, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">{recommendation}</p>
                  </div>
                ))}
                {uniqueRecommendations.length === 0 && (
                  <p className="text-sm text-gray-500 col-span-2">No recommendations available yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assessments Tab */}
        <TabsContent value="assessments" className="space-y-4">
          {analysisData?.map(analysis => (
            <Card key={analysis.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {analysis.assessments?.title || 'Assessment'}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">
                        {analysis.assessments?.subject}
                      </Badge>
                      <Badge variant="outline">
                        {analysis.assessments?.assessment_type}
                      </Badge>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {analysis.assessments?.assessment_date && 
                          new Date(analysis.assessments.assessment_date).toLocaleDateString()
                        }
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedAnalysis(
                      expandedAnalysis === analysis.id ? null : analysis.id
                    )}
                  >
                    {expandedAnalysis === analysis.id ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              
              {expandedAnalysis === analysis.id && (
                <CardContent>
                  <div className="space-y-4">
                    {analysis.overall_summary && (
                      <div>
                        <h4 className="font-medium mb-2">Summary</h4>
                        <p className="text-sm text-gray-700">{analysis.overall_summary}</p>
                      </div>
                    )}
                    
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <h4 className="font-medium mb-2 text-green-700">Strengths</h4>
                        <div className="space-y-1">
                          {analysis.strengths?.map((strength, index) => (
                            <Badge key={index} variant="secondary" className="bg-green-50 text-green-700 text-xs block">
                              {strength}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2 text-amber-700">Growth Areas</h4>
                        <div className="space-y-1">
                          {analysis.growth_areas?.map((area, index) => (
                            <Badge key={index} variant="outline" className="bg-amber-50 text-amber-700 text-xs block">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2 text-blue-700">Patterns</h4>
                        <div className="space-y-1">
                          {analysis.patterns_observed?.map((pattern, index) => (
                            <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 text-xs block">
                              {pattern}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
          
          {!analysisData?.length && (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Assessment Data</h3>
                <p className="text-gray-600">
                  Complete some assessments to see detailed analysis here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Patterns Tab */}
        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Learning Patterns Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysisData?.flatMap(a => a.patterns_observed || []).length > 0 ? (
                  <div className="grid gap-3">
                    {[...new Set(analysisData.flatMap(a => a.patterns_observed || []))].map((pattern, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <p className="text-sm">{pattern}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No learning patterns identified yet. Complete more assessments to see patterns emerge.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-4">
          <div className="grid gap-4">
            {goals?.map(goal => (
              <Card key={goal.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium">{goal.title}</h3>
                      <p className="text-sm text-gray-600">{goal.description}</p>
                    </div>
                    <Badge variant={goal.status === 'active' ? 'default' : 'secondary'}>
                      {goal.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{goal.progress_percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all" 
                          style={{ width: `${goal.progress_percentage}%` }}
                        />
                      </div>
                    </div>
                    
                    {goal.target_date && (
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(goal.target_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )) || (
              <Card>
                <CardContent className="p-8 text-center">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Learning Goals</h3>
                  <p className="text-gray-600">
                    Create learning goals based on assessment insights to track progress.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentInsightsDrillDown;
