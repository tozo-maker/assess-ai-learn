
import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText, Plus, ChevronLeft, Calendar, BookOpen, TrendingUp, AlertCircle } from 'lucide-react';

import { PageShell } from '@/components/ui/page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import { studentService } from '@/services/student-service';
import { assessmentService } from '@/services/assessment-service';

const StudentAssessments: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch student data
  const { data: student, isLoading: isLoadingStudent } = useQuery({
    queryKey: ['student', id],
    queryFn: () => studentService.getStudentById(id as string),
    enabled: !!id,
  });

  // Fetch all assessments to show available ones
  const { data: allAssessments, isLoading: isLoadingAssessments } = useQuery({
    queryKey: ['assessments'],
    queryFn: () => assessmentService.getAssessments(),
  });

  // Fetch student responses to see which assessments they've completed
  const { data: studentResponses, isLoading: isLoadingResponses } = useQuery({
    queryKey: ['studentResponses', id],
    queryFn: async () => {
      if (!allAssessments || !id) return [];
      
      const allResponses = [];
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
          }
        } catch (error) {
          console.error(`Error fetching responses for assessment ${assessment.id}:`, error);
        }
      }
      return allResponses;
    },
    enabled: !!allAssessments && !!id,
  });

  if (isLoadingStudent || isLoadingAssessments) {
    return (
      <PageShell
        title="Loading..."
        description="Please wait"
        link={`/students/${id}`}
        linkText="Back to Student Profile"
      >
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
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
          <Button onClick={() => navigate('/students')} className="mt-4">Back to Students</Button>
        </div>
      </PageShell>
    );
  }

  const completedAssessments = studentResponses || [];
  const availableAssessments = (allAssessments || []).filter(
    assessment => !completedAssessments.some(completed => completed.assessment.id === assessment.id)
  );

  const getPerformanceColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceLabel = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'Above Average';
    if (percentage >= 60) return 'Average';
    return 'Below Average';
  };

  return (
    <PageShell
      title={`${student.first_name} ${student.last_name}'s Assessments`}
      description={`Grade ${student.grade_level}`}
      link={`/students/${id}`}
      linkText="Back to Student Profile"
    >
      <div className="space-y-6">
        {/* Header with back button and actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Button variant="ghost" className="self-start" asChild>
            <Link to={`/students/${id}`}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Student Profile
            </Link>
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/assessments">
                <Plus className="mr-2 h-4 w-4" />
                Create New Assessment
              </Link>
            </Button>
            {availableAssessments.length > 0 && (
              <Button asChild>
                <Link to={`/assessments/batch?student=${id}`}>
                  <FileText className="mr-2 h-4 w-4" />
                  Add Assessment Data
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed Assessments</p>
                  <p className="text-2xl font-bold">{completedAssessments.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold">
                    {completedAssessments.length > 0
                      ? Math.round(
                          (completedAssessments.reduce((sum, a) => sum + (a.totalScore / a.maxScore) * 100, 0) /
                            completedAssessments.length)
                        ) + '%'
                      : 'N/A'}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Available Assessments</p>
                  <p className="text-2xl font-bold">{availableAssessments.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Completed Assessments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Completed Assessments
            </CardTitle>
            <CardDescription>
              Assessment history for {student.first_name} {student.last_name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingResponses ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            ) : completedAssessments.length > 0 ? (
              <div className="space-y-4">
                {completedAssessments.map((completed) => {
                  const percentage = (completed.totalScore / completed.maxScore) * 100;
                  return (
                    <div key={completed.assessment.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium">{completed.assessment.title}</h3>
                            <Badge variant="secondary">{completed.assessment.subject}</Badge>
                            <Badge variant="outline">{completed.assessment.assessment_type}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {completed.assessment.assessment_date 
                                ? new Date(completed.assessment.assessment_date).toLocaleDateString()
                                : 'No date set'}
                            </span>
                            <span>Grade {completed.assessment.grade_level}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${getPerformanceColor(completed.totalScore, completed.maxScore)}`}>
                            {completed.totalScore}/{completed.maxScore}
                          </div>
                          <div className={`text-sm ${getPerformanceColor(completed.totalScore, completed.maxScore)}`}>
                            {Math.round(percentage)}% - {getPerformanceLabel(completed.totalScore, completed.maxScore)}
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            asChild
                          >
                            <Link to={`/assessments/${completed.assessment.id}/analysis?student=${id}`}>
                              View Analysis
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No assessments completed yet</h3>
                <p className="text-gray-500 mb-4">
                  {student.first_name} hasn't completed any assessments yet.
                </p>
                {availableAssessments.length > 0 ? (
                  <Button asChild>
                    <Link to={`/assessments/batch?student=${id}`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Assessment Data
                    </Link>
                  </Button>
                ) : (
                  <Button asChild>
                    <Link to="/assessments">
                      <Plus className="mr-2 h-4 w-4" />
                      Create New Assessment
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Assessments */}
        {availableAssessments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Available Assessments
              </CardTitle>
              <CardDescription>
                Assessments that {student.first_name} can complete
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availableAssessments.map((assessment) => (
                  <div key={assessment.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">{assessment.title}</h3>
                          <Badge variant="secondary">{assessment.subject}</Badge>
                          <Badge variant="outline">{assessment.assessment_type}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {assessment.assessment_date 
                              ? new Date(assessment.assessment_date).toLocaleDateString()
                              : 'No date set'}
                          </span>
                          <span>Grade {assessment.grade_level}</span>
                          <span>Max Score: {assessment.max_score}</span>
                        </div>
                        {assessment.description && (
                          <p className="text-sm text-gray-600 mt-2">{assessment.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/assessments/${assessment.id}`}>
                            View Details
                          </Link>
                        </Button>
                        <Button size="sm" asChild>
                          <Link to={`/assessments/${assessment.id}/responses?student=${id}`}>
                            Add Data
                          </Link>
                        </Button>
                      </div>
                    </div>
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

export default StudentAssessments;
