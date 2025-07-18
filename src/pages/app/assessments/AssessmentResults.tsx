
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, BarChart2 } from 'lucide-react';

// Navigation Components
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

// Design System Components
import {
  DSPageContainer,
  DSSection,
  DSCard,
  DSCardHeader,
  DSCardContent,
  DSCardTitle,
  DSButton,
  DSFlexContainer,
  DSSpacer,
  DSPageTitle,
  DSBodyText
} from '@/components/ui/design-system';

// Assessment Components
import AssessmentResultsSummary from '@/components/assessments/AssessmentResultsSummary';
import AssessmentResultsTable from '@/components/assessments/AssessmentResultsTable';

import { assessmentService } from '@/services/assessment-service';
import { useToast } from '@/hooks/use-toast';

const AssessmentResults: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: assessment, isLoading: isLoadingAssessment } = useQuery({
    queryKey: ['assessment', id],
    queryFn: () => assessmentService.getAssessmentById(id as string),
    enabled: !!id,
  });

  const { data: responses, isLoading: isLoadingResponses } = useQuery({
    queryKey: ['assessment-responses', id],
    queryFn: () => assessmentService.getStudentResponses(id as string),
    enabled: !!id,
  });

  const handleExport = (format: 'csv' | 'pdf') => {
    toast({
      title: "Export Started",
      description: `Exporting results as ${format.toUpperCase()}...`,
    });
    // Export logic would go here
  };

  if (isLoadingAssessment || isLoadingResponses) {
    return (
      <DSSection>
        <DSPageContainer>
          <Breadcrumbs />
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <DSBodyText className="mt-4">Loading assessment results...</DSBodyText>
            </div>
          </div>
        </DSPageContainer>
      </DSSection>
    );
  }

  if (!assessment) {
    return (
      <DSSection>
        <DSPageContainer>
          <Breadcrumbs />
          <DSCard>
            <DSCardContent>
              <div className="text-center py-8">
                <DSPageTitle className="text-xl font-semibold">Assessment Not Found</DSPageTitle>
                <DSBodyText className="mt-2">The requested assessment could not be found.</DSBodyText>
                <DSButton onClick={() => navigate('/app/assessments')} className="mt-4">
                  Back to Assessments
                </DSButton>
              </div>
            </DSCardContent>
          </DSCard>
        </DSPageContainer>
      </DSSection>
    );
  }

  console.log('Assessment ID:', id);
  console.log('Assessment data:', assessment);
  console.log('Responses data:', responses);

  // Group responses by student and calculate totals
  const studentResponsesMap = new Map();
  
  responses?.forEach((response: any) => {
    const studentId = response.student_id;
    const student = response.students;
    
    if (!studentResponsesMap.has(studentId)) {
      studentResponsesMap.set(studentId, {
        id: studentId,
        firstName: student?.first_name || 'Unknown',
        lastName: student?.last_name || 'Student',
        totalScore: 0,
        itemScores: [],
        responses: []
      });
    }
    
    const studentData = studentResponsesMap.get(studentId);
    studentData.totalScore += response.score;
    studentData.itemScores.push({
      itemNumber: response.assessment_items?.item_number || 0,
      score: response.score,
      maxScore: response.assessment_items?.max_score || 1,
      question: response.assessment_items?.question_text || ''
    });
    studentData.responses.push(response);
  });

  // Convert to results array
  const results = Array.from(studentResponsesMap.values()).map(student => ({
    id: student.id,
    firstName: student.firstName,
    lastName: student.lastName,
    score: student.totalScore,
    percentage: assessment?.max_score ? Math.round((student.totalScore / assessment.max_score) * 100) : 0,
    status: 'completed' as const,
    itemScores: student.itemScores
  }));

  const summaryData = {
    totalStudents: results.length,
    averageScore: results.length > 0 
      ? results.reduce((sum, result) => sum + result.percentage, 0) / results.length 
      : 0,
    completionRate: 100,
    needsAttention: results.filter(r => r.percentage < 65).length
  };

  return (
    <DSSection>
      <DSPageContainer>
        <Breadcrumbs />
        
        {/* Page Header - Standardized */}
        <DSCard className="mb-8">
          <DSCardHeader>
            <DSFlexContainer justify="between" align="center">
              <div>
                <DSButton 
                  variant="ghost" 
                  onClick={() => navigate(`/app/assessments/${id}`)}
                  className="mb-4 pl-0"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Assessment
                </DSButton>
                <DSPageTitle className="text-3xl font-bold mb-1">
                  Assessment Results
                </DSPageTitle>
                <DSBodyText>
                  {assessment.title} | {assessment.subject} | Grade {assessment.grade_level}
                </DSBodyText>
              </div>
              <div className="flex items-center">
                <BarChart2 className="h-8 w-8 text-primary" />
              </div>
            </DSFlexContainer>
          </DSCardHeader>
        </DSCard>

        {/* Summary Cards */}
        <AssessmentResultsSummary {...summaryData} />
        
        <DSSpacer size="xl" />

        {/* Results Table */}
        <AssessmentResultsTable 
          results={results}
          onExport={handleExport}
        />
      </DSPageContainer>
    </DSSection>
  );
};

export default AssessmentResults;
