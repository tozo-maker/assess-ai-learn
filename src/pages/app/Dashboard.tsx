
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, Brain } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-simple', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No authenticated user');
      
      // Simple parallel queries without complex services
      const [studentsResult, assessmentsResult] = await Promise.all([
        supabase
          .from('students')
          .select('*')
          .eq('teacher_id', user.id),
        supabase
          .from('assessments')
          .select('*')
          .eq('teacher_id', user.id)
      ]);

      return {
        students: studentsResult.data || [],
        assessments: assessmentsResult.data || [],
        studentsError: studentsResult.error,
        assessmentsError: assessmentsResult.error
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dashboard</h2>
        <p className="text-red-600">{(error as Error).message}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reload Page
        </button>
      </div>
    );
  }

  const students = data?.students || [];
  const assessments = data?.assessments || [];

  // Simple metrics calculation
  const totalStudents = students.length;
  const totalAssessments = assessments.length;
  const recentAssessments = assessments.filter(a => {
    const assessmentDate = new Date(a.created_at);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return assessmentDate > oneWeekAgo;
  }).length;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your students today
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-gray-600">
              {totalStudents === 0 ? 'Add your first student' : 'Students in your class'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
            <BookOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssessments}</div>
            <p className="text-xs text-gray-600">
              {recentAssessments} added this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
            <Brain className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Coming Soon</div>
            <p className="text-xs text-gray-600">
              AI analysis in development
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {totalStudents === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Welcome to LearnSpark AI
            </h3>
            <p className="text-gray-600 mb-6">
              Start by adding students to your class to see their progress and insights.
            </p>
            <a 
              href="/app/students/add" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Add Your First Student
            </a>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      {totalStudents > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentAssessments > 0 ? (
              <p className="text-gray-600">
                {recentAssessments} new assessment{recentAssessments !== 1 ? 's' : ''} added this week
              </p>
            ) : (
              <p className="text-gray-600">
                No recent assessment activity
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
