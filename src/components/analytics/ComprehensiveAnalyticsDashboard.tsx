
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { StudentWithPerformance, normalizeStudentPerformance } from '@/types/student';
import { getPerformanceData } from '@/components/students/StudentPerformanceConfig';
import { 
  TrendingUp, 
  Users, 
  Target, 
  BookOpen, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  Brain
} from 'lucide-react';

const ComprehensiveAnalyticsDashboard: React.FC = () => {
  // Fetch comprehensive analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['comprehensive-analytics'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Fetch students count and performance
      const { data: students } = await supabase
        .from('students')
        .select(`
          *,
          performance:student_performance(*)
        `)
        .eq('teacher_id', user.id);

      // Fetch assessments
      const { data: assessments } = await supabase
        .from('assessments')
        .select('*')
        .eq('teacher_id', user.id);

      // Fetch goals
      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('teacher_id', user.id);

      // Fetch recent AI insights
      const { data: insights } = await supabase
        .from('assessment_analysis')
        .select(`
          *,
          assessment:assessments(title, subject)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      const normalizedStudents = (students || []).map(student => 
        normalizeStudentPerformance(student as StudentWithPerformance)
      );

      return { 
        students: normalizedStudents, 
        assessments: assessments || [], 
        goals: goals || [], 
        insights: insights || [] 
      };
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Data Available</h3>
          <p className="text-gray-600">Add some students and assessments to see analytics.</p>
        </CardContent>
      </Card>
    );
  }

  const { students, assessments, goals, insights } = analyticsData;

  // Calculate metrics using the helper function
  const studentsNeedingAttention = students.filter(s => {
    const performanceData = getPerformanceData(s);
    return performanceData.needsAttention;
  }).length;

  const studentsWithScores = students.filter(s => {
    const performanceData = getPerformanceData(s);
    return performanceData.score !== null;
  });

  const averageClassScore = studentsWithScores.length > 0 
    ? studentsWithScores.reduce((sum, s) => {
        const performanceData = getPerformanceData(s);
        return sum + (performanceData.score || 0);
      }, 0) / studentsWithScores.length
    : 0;

  const totalStudents = students.length;
  const totalAssessments = assessments.length;
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const activeGoals = goals.filter(g => g.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold">{totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Need Attention</p>
                <p className="text-2xl font-bold text-yellow-600">{studentsNeedingAttention}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Assessments</p>
                <p className="text-2xl font-bold">{totalAssessments}</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold">{averageClassScore.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Goals Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{completedGoals}</div>
              <p className="text-sm text-gray-600">Completed Goals</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{activeGoals}</div>
              <p className="text-sm text-gray-600">Active Goals</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{goals.length}</div>
              <p className="text-sm text-gray-600">Total Goals</p>
            </div>
          </div>
          
          {goals.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Recent Goals</h4>
              {goals.slice(0, 5).map((goal) => (
                <div key={goal.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{goal.title}</p>
                    <p className="text-sm text-gray-600">Progress: {goal.progress_percentage || 0}%</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={goal.progress_percentage || 0} className="w-20" />
                    <Badge variant={goal.status === 'completed' ? 'default' : 'secondary'}>
                      {goal.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Insights Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Recent AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insights.length > 0 ? (
            <div className="space-y-4">
              {insights.slice(0, 5).map((insight) => (
                <div key={insight.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{insight.assessment?.title || 'Assessment'}</h4>
                    <Badge variant="outline">{insight.assessment?.subject}</Badge>
                  </div>
                  {insight.overall_summary && (
                    <p className="text-sm text-gray-600 mb-3">{insight.overall_summary}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {insight.strengths?.slice(0, 3).map((strength, index) => (
                      <Badge key={index} variant="secondary" className="bg-green-50 text-green-700 text-xs">
                        {strength}
                      </Badge>
                    ))}
                    {insight.recommendations?.slice(0, 2).map((rec, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 text-xs">
                        {rec.substring(0, 30)}...
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    {new Date(insight.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No AI insights available yet.</p>
              <p className="text-sm text-gray-500">Complete some assessments to generate insights.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Performance Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Student Performance Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          {studentsWithScores.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {studentsWithScores.filter(s => {
                      const performanceData = getPerformanceData(s);
                      return (performanceData.score || 0) >= 85;
                    }).length}
                  </div>
                  <p className="text-sm text-gray-600">Above Average (85%+)</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {studentsWithScores.filter(s => {
                      const performanceData = getPerformanceData(s);
                      const score = performanceData.score || 0;
                      return score >= 70 && score < 85;
                    }).length}
                  </div>
                  <p className="text-sm text-gray-600">Average (70-84%)</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {studentsWithScores.filter(s => {
                      const performanceData = getPerformanceData(s);
                      return (performanceData.score || 0) < 70;
                    }).length}
                  </div>
                  <p className="text-sm text-gray-600">Below Average (&lt;70%)</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No performance data available yet.</p>
              <p className="text-sm text-gray-500">Add assessment responses to see performance distribution.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ComprehensiveAnalyticsDashboard;
