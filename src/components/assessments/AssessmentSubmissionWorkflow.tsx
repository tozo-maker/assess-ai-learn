
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Clock, Users, BarChart3, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { studentResponseService } from '@/services/student-response-service';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  grade_level: string;
}

interface AssessmentSubmissionWorkflowProps {
  assessmentId: string;
  assessmentTitle: string;
  students: Student[];
  onComplete: () => void;
}

const AssessmentSubmissionWorkflow: React.FC<AssessmentSubmissionWorkflowProps> = ({
  assessmentId,
  assessmentTitle,
  students,
  onComplete
}) => {
  const [submissionStatus, setSubmissionStatus] = useState<Record<string, 'pending' | 'submitting' | 'completed' | 'error'>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmitForStudent = async (studentId: string) => {
    setSubmissionStatus(prev => ({ ...prev, [studentId]: 'submitting' }));

    try {
      await studentResponseService.submitAssessmentForAnalysis(assessmentId, studentId);
      
      setSubmissionStatus(prev => ({ ...prev, [studentId]: 'completed' }));
      
      toast({
        title: "Analysis Generated",
        description: `AI analysis completed for ${students.find(s => s.id === studentId)?.first_name}`,
      });
    } catch (error) {
      console.error('Submission error:', error);
      setSubmissionStatus(prev => ({ ...prev, [studentId]: 'error' }));
      
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to generate analysis",
      });
    }
  };

  const handleBulkAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      const promises = students.map(student => 
        studentResponseService.submitAssessmentForAnalysis(assessmentId, student.id)
      );
      
      await Promise.all(promises);
      
      // Update all statuses to completed
      const completedStatus = students.reduce((acc, student) => {
        acc[student.id] = 'completed';
        return acc;
      }, {} as Record<string, 'completed'>);
      
      setSubmissionStatus(completedStatus);
      
      toast({
        title: "Bulk Analysis Complete",
        description: `AI analysis generated for all ${students.length} students`,
      });
      
      onComplete();
    } catch (error) {
      console.error('Bulk analysis error:', error);
      toast({
        variant: "destructive",
        title: "Bulk Analysis Failed",
        description: "Some analyses may have failed. Please check individual results.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const completedCount = Object.values(submissionStatus).filter(status => status === 'completed').length;
  const allCompleted = completedCount === students.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Assessment Analysis Workflow
          </CardTitle>
          <p className="text-sm text-gray-600">
            Generate AI-powered insights for "{assessmentTitle}"
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{students.length} students</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">{completedCount} analyzed</span>
              </div>
            </div>
            
            <Button
              onClick={handleBulkAnalysis}
              disabled={isAnalyzing || allCompleted}
              className="flex items-center gap-2"
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <BarChart3 className="h-4 w-4" />
              )}
              {allCompleted ? 'All Complete' : 'Analyze All'}
            </Button>
          </div>

          {allCompleted && (
            <Alert className="mb-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                All student assessments have been analyzed! You can now view insights and recommendations.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {students.map(student => {
              const status = submissionStatus[student.id] || 'pending';
              
              return (
                <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">
                        {student.first_name} {student.last_name}
                      </p>
                      <p className="text-sm text-gray-600">Grade {student.grade_level}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={
                        status === 'completed' ? 'default' :
                        status === 'submitting' ? 'secondary' :
                        status === 'error' ? 'destructive' : 'outline'
                      }
                    >
                      {status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {status === 'submitting' && <Clock className="h-3 w-3 mr-1" />}
                      {status === 'completed' ? 'Analyzed' :
                       status === 'submitting' ? 'Analyzing...' :
                       status === 'error' ? 'Failed' : 'Pending'}
                    </Badge>
                    
                    {status !== 'completed' && status !== 'submitting' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSubmitForStudent(student.id)}
                        disabled={status === 'submitting'}
                      >
                        Analyze
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {allCompleted && (
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/app/assessments')}>
            Back to Assessments
          </Button>
          <Button onClick={() => navigate(`/app/assessments/${assessmentId}/insights`)}>
            View Insights & Analysis
          </Button>
        </div>
      )}
    </div>
  );
};

export default AssessmentSubmissionWorkflow;
