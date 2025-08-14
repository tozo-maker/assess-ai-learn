
import React from 'react';
import AssessmentsErrorBoundary from '@/components/assessments/AssessmentsErrorBoundary';
import AssessmentsOverviewMetrics from '@/components/assessments/AssessmentsOverviewMetrics';
import { useAssessments } from '@/hooks/queries/useOptimizedQueries';
import { useSEO } from '@/hooks/useSEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Calendar, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Assessments: React.FC = () => {
  const { data: assessments = [], isLoading, error } = useAssessments();
  
  useSEO({
    title: 'Assessment Management - LearnSpark AI',
    description: 'Create, manage, and analyze assessments with AI-powered insights. Track student performance and generate actionable recommendations.',
    canonicalPath: '/app/assessments'
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    throw error; // Let error boundary handle it
  }

  return (
    <AssessmentsErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold">Assessments</h1>
            <span className="text-gray-500">({assessments.length})</span>
          </div>
          <div className="flex gap-2">
            <Link to="/app/assessments/batch">
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Batch Assessment
              </Button>
            </Link>
            <Link to="/app/assessments/add">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Assessment
              </Button>
            </Link>
          </div>
        </div>

        {/* Metrics Overview */}
        <AssessmentsOverviewMetrics />

        {/* Assessments List */}
        {assessments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first assessment to start tracking student performance and generating AI insights.
              </p>
              <Link to="/app/assessments/add">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Assessment
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {assessments.map((assessment) => (
              <Link key={assessment.id} to={`/app/assessments/${assessment.id}`}>
                <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="truncate">{assessment.title}</span>
                      <Badge variant={assessment.is_draft ? "secondary" : "default"}>
                        {assessment.is_draft ? "Draft" : "Active"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Subject:</span>
                        <span className="font-medium">{assessment.subject}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Grade Level:</span>
                        <span className="font-medium">{assessment.grade_level}</span>
                      </div>
                      {assessment.max_score && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Max Score:</span>
                          <span className="font-medium">{assessment.max_score} points</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {assessment.assessment_date 
                            ? new Date(assessment.assessment_date).toLocaleDateString()
                            : new Date(assessment.created_at).toLocaleDateString()
                          }
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AssessmentsErrorBoundary>
  );
};

export default Assessments;
