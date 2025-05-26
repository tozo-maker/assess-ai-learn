
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FileText, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Eye,
  Brain,
  Plus
} from 'lucide-react';

interface AssessmentWithScore {
  id: string;
  title: string;
  subject: string;
  assessment_date?: string;
  max_score: number;
  totalScore: number;
  responses: any[];
}

interface AssessmentsTabContentProps {
  assessments: AssessmentWithScore[];
  isLoading: boolean;
  studentId: string;
  studentName: string;
}

const AssessmentsTabContent: React.FC<AssessmentsTabContentProps> = ({
  assessments,
  isLoading,
  studentId,
  studentName
}) => {
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

  const getPerformanceIcon = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (percentage >= 60) return <Minus className="h-4 w-4 text-yellow-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const calculateStats = () => {
    if (assessments.length === 0) return { averageScore: 0, totalAssessments: 0, aboveAverage: 0 };
    
    const totalPercentage = assessments.reduce((sum, assessment) => {
      return sum + (assessment.totalScore / assessment.max_score) * 100;
    }, 0);
    
    const averageScore = Math.round(totalPercentage / assessments.length);
    const aboveAverage = assessments.filter(a => (a.totalScore / a.max_score) * 100 >= 80).length;
    
    return {
      averageScore,
      totalAssessments: assessments.length,
      aboveAverage
    };
  };

  const stats = calculateStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-4">
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
    );
  }

  if (assessments.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">No assessments completed yet</h3>
        <p className="text-gray-500 mb-6">
          {studentName} hasn't completed any assessments yet.
        </p>
        <div className="flex gap-2 justify-center">
          <Button asChild>
            <Link to="/app/assessments">
              <Plus className="mr-2 h-4 w-4" />
              Create New Assessment
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/app/students/${studentId}/assessments`}>
              View All Assessments
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-2xl font-bold">{stats.averageScore}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Assessments</p>
                <p className="text-2xl font-bold">{stats.totalAssessments}</p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Above Average</p>
                <p className="text-2xl font-bold">{stats.aboveAverage}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assessment List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Assessments
              </CardTitle>
              <CardDescription>
                Assessment performance overview for {studentName}
              </CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link to={`/app/students/${studentId}/assessments`}>
                View All Assessments
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assessments.map((assessmentData) => {
              const percentage = Math.round((assessmentData.totalScore / assessmentData.max_score) * 100);
              return (
                <div 
                  key={assessmentData.id} 
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{assessmentData.title}</h4>
                        <Badge variant="secondary">{assessmentData.subject}</Badge>
                        {getPerformanceIcon(assessmentData.totalScore, assessmentData.max_score)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {assessmentData.assessment_date 
                            ? new Date(assessmentData.assessment_date).toLocaleDateString()
                            : 'No date set'}
                        </span>
                        <span>
                          Score: {assessmentData.totalScore}/{assessmentData.max_score}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getPerformanceColor(assessmentData.totalScore, assessmentData.max_score)}`}>
                        {percentage}%
                      </div>
                      <div className={`text-sm mb-3 ${getPerformanceColor(assessmentData.totalScore, assessmentData.max_score)}`}>
                        {getPerformanceLabel(assessmentData.totalScore, assessmentData.max_score)}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/app/assessments/${assessmentData.id}/responses?student=${studentId}`}>
                            <Eye className="mr-1 h-3 w-3" />
                            Details
                          </Link>
                        </Button>
                        <Button size="sm" asChild>
                          <Link to={`/app/assessments/${assessmentData.id}/analysis?student=${studentId}`}>
                            <Brain className="mr-1 h-3 w-3" />
                            Analysis
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssessmentsTabContent;
