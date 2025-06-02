
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, BarChart2 } from 'lucide-react';

// Layout Components
import AppLayout from '@/components/layout/AppLayout';
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
      <AppLayout>
        <DSSection>
          <DSPageContainer>
            <Breadcrumbs />
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563eb] mx-auto"></div>
                <DSBodyText className="mt-4">Loading assessment results...</DSBodyText>
              </div>
            </div>
          </DSPageContainer>
        </DSSection>
      </AppLayout>
    );
  }

  if (!assessment) {
    return (
      <AppLayout>
        <DSSection>
          <DSPageContainer>
            <Breadcrumbs />
            <DSCard>
              <DSCardContent>
                <div className="text-center py-8">
                  <DSPageTitle className="text-xl font-semibold text-gray-900">Assessment Not Found</DSPageTitle>
                  <DSBodyText className="mt-2 text-gray-600">The requested assessment could not be found.</DSBodyText>
                  <DSButton onClick={() => navigate('/app/assessments')} className="mt-4">
                    Back to Assessments
                  </DSButton>
                </div>
              </DSCardContent>
            </DSCard>
          </DSPageContainer>
        </DSSection>
      </AppLayout>
    );
  }

  // Mock data for demonstration - would be replaced with real data processing
  const mockResults = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      score: 85,
      percentage: 85,
      status: 'completed' as const,
      itemScores: [
        { itemNumber: 1, score: 8, maxScore: 10 },
        { itemNumber: 2, score: 9, maxScore: 10 },
        { itemNumber: 3, score: 7, maxScore: 10 }
      ]
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      score: 92,
      percentage: 92,
      status: 'completed' as const,
      itemScores: [
        { itemNumber: 1, score: 9, maxScore: 10 },
        { itemNumber: 2, score: 10, maxScore: 10 },
        { itemNumber: 3, score: 8, maxScore: 10 }
      ]
    }
  ];

  const summaryData = {
    totalStudents: mockResults.length,
    averageScore: mockResults.reduce((sum, result) => sum + result.percentage, 0) / mockResults.length,
    completionRate: 100,
    needsAttention: mockResults.filter(r => r.percentage < 65).length
  };

  return (
    <AppLayout>
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
                  <DSPageTitle className="text-3xl font-bold text-gray-900 mb-1">
                    Assessment Results
                  </DSPageTitle>
                  <DSBodyText className="text-gray-600">
                    {assessment.title} | {assessment.subject} | Grade {assessment.grade_level}
                  </DSBodyText>
                </div>
                <div className="flex items-center">
                  <BarChart2 className="h-8 w-8 text-[#2563eb]" />
                </div>
              </DSFlexContainer>
            </DSCardHeader>
          </DSCard>

          {/* Summary Cards */}
          <AssessmentResultsSummary {...summaryData} />
          
          <DSSpacer size="xl" />

          {/* Results Table */}
          <AssessmentResultsTable 
            results={mockResults}
            onExport={handleExport}
          />
        </DSPageContainer>
      </DSSection>
    </AppLayout>
  );
};

export default AssessmentResults;
