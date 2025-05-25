import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Lightbulb, TrendingUp, Target, BookOpen, AlertTriangle, Sparkles, Brain, BarChart3 } from 'lucide-react';

import { PageShell } from '@/components/ui/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { studentService } from '@/services/student-service';
import { assessmentService } from '@/services/assessment-service';

interface SubjectPerformanceData {
  total: number;
  count: number;
  scores: number[];
}

const StudentInsights: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Fetch student data
  const { data: student, isLoading: isLoadingStudent } = useQuery({
    queryKey: ['student', id],
    queryFn: () => studentService.getStudentById(id as string),
    enabled: !!id,
  });

  // Fetch all assessments for this student
  const { data: allAssessments, isLoading: isLoadingAssessments } = useQuery({
    queryKey: ['assessments'],
    queryFn: () => assessmentService.getAssessments(),
  });

  // Fetch student responses and analysis
  const { data: studentData, isLoading: isLoadingData } = useQuery({
    queryKey: ['studentInsights', id],
    queryFn: async () => {
      if (!allAssessments || !id) return { responses: [], analyses: [] };
      
      const allResponses = [];
      const allAnalyses = [];
      
      for (const assessment of allAssessments) {
        try {
          const responses = await assessmentService.getStudentResponses(assessment.id, id);
          if (responses.length > 0) {
            allResponses.push({
              assessment,
              responses,
              totalScore: responses.reduce((sum, r) => sum + r.score, 0),
              maxScore: assessment.max_score,
            });

            // Try to get analysis for this assessment
            const analysis = await assessmentService.getAssessmentAnalysis(assessment.id, id);
            if (analysis) {
              allAnalyses.push({ assessment, analysis });
            }
          }
        } catch (error) {
          console.error(`Error fetching data for assessment ${assessment.id}:`, error);
        }
      }
      
      return { responses: allResponses, analyses: allAnalyses };
    },
    enabled: !!allAssessments && !!id,
  });

  const isLoading = isLoadingStudent || isLoadingAssessments || isLoadingData;

  if (isLoading) {
    return (
      <PageShell
        title="Loading Insights..."
        description="Analyzing student performance"
        link={`/students/${id}`}
        linkText="Back to Student Profile"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </PageShell>
    );
  }

  if (!student) {
    return (
      <PageShell
        title="Student Not Found"
        description="The requested student could not be found"
        link="/students"
        linkText="Back to Students"
      >
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold">Student not found</h2>
          <p className="mt-2">The requested student could not be loaded.</p>
        </div>
      </PageShell>
    );
  }

  const completedAssessments = studentData?.responses || [];
  const analyses = studentData?.analyses || [];

  // Calculate overall metrics
  const totalAssessments = completedAssessments.length;
  const averageScore = totalAssessments > 0 
    ? Math.round((completedAssessments.reduce((sum, a) => sum + (a.totalScore / a.maxScore) * 100, 0) / totalAssessments))
    : 0;

  // Aggregate insights from all analyses
  const allStrengths = analyses.flatMap(a => a.analysis.strengths || []);
  const allGrowthAreas = analyses.flatMap(a => a.analysis.growth_areas || []);
  const allRecommendations = analyses.flatMap(a => a.analysis.recommendations || []);
  const allPatterns = analyses.flatMap(a => a.analysis.patterns_observed || []);

  // Get unique insights
  const uniqueStrengths = [...new Set(allStrengths)];
  const uniqueGrowthAreas = [...new Set(allGrowthAreas)];
  const uniqueRecommendations = [...new Set(allRecommendations)];
  const uniquePatterns = [...new Set(allPatterns)];

  // Performance by subject with proper typing
  const subjectPerformance = completedAssessments.reduce((acc, assessment) => {
    const subject = assessment.assessment.subject;
    const percentage = (assessment.totalScore / assessment.maxScore) * 100;
    
    if (!acc[subject]) {
      acc[subject] = { total: 0, count: 0, scores: [] };
    }
    
    acc[subject].total += percentage;
    acc[subject].count += 1;
    acc[subject].scores.push(percentage);
    
    return acc;
  }, {} as Record<string, SubjectPerformanceData>);

  const subjectAverages = Object.entries(subjectPerformance).map(([subject, data]) => {
    const typedData = data as SubjectPerformanceData;
    return {
      subject,
      average: Math.round(typedData.total / typedData.count),
      assessmentCount: typedData.count,
      trend: typedData.scores.length > 1 
        ? typedData.scores[typedData.scores.length - 1] - typedData.scores[0] 
        : 0
    };
  });

  return (
    <PageShell
      title={`${student.first_name} ${student.last_name}'s AI Insights`}
      description="Personalized learning analysis and recommendations"
      link={`/students/${id}`}
      linkText="Back to Student Profile"
    >
      <div className="space-y-6">
        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Performance</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageScore}%</div>
              <p className="text-xs text-muted-foreground">Average across {totalAssessments} assessments</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subjects Assessed</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subjectAverages.length}</div>
              <p className="text-xs text-muted-foreground">Different subject areas</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Analysis Reports</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyses.length}</div>
              <p className="text-xs text-muted-foreground">AI-generated insights</p>
            </CardContent>
          </Card>
        </div>

        {totalAssessments === 0 ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No assessment data available yet. Complete some assessments to see AI-generated insights.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subject Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Subject Performance
                </CardTitle>
                <CardDescription>
                  Average performance by subject area
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {subjectAverages.map((subject) => (
                  <div key={subject.subject} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{subject.subject}</span>
                      <span className="text-muted-foreground">
                        {subject.average}% ({subject.assessmentCount} assessments)
                      </span>
                    </div>
                    <Progress value={subject.average} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-green-600" />
                  Key Strengths
                </CardTitle>
                <CardDescription>
                  Areas where {student.first_name} excels
                </CardDescription>
              </CardHeader>
              <CardContent>
                {uniqueStrengths.length > 0 ? (
                  <div className="space-y-2">
                    {uniqueStrengths.slice(0, 5).map((strength, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                          {strength}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Complete more assessments to identify strengths.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Growth Areas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-amber-600" />
                  Growth Opportunities
                </CardTitle>
                <CardDescription>
                  Areas for improvement and focus
                </CardDescription>
              </CardHeader>
              <CardContent>
                {uniqueGrowthAreas.length > 0 ? (
                  <div className="space-y-2">
                    {uniqueGrowthAreas.slice(0, 5).map((area, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          {area}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Complete more assessments to identify growth areas.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-blue-600" />
                  AI Recommendations
                </CardTitle>
                <CardDescription>
                  Personalized learning suggestions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {uniqueRecommendations.length > 0 ? (
                  <div className="space-y-3">
                    {uniqueRecommendations.slice(0, 4).map((recommendation, index) => (
                      <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Complete more assessments to receive personalized recommendations.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Learning Patterns */}
        {uniquePatterns.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Learning Patterns Observed
              </CardTitle>
              <CardDescription>
                Insights from assessment performance analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {uniquePatterns.slice(0, 6).map((pattern, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-gray-50">
                    <p className="text-sm">{pattern}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageShell>
  );
};

export default StudentInsights;
