
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, User, FileText, BarChart3, Plus } from 'lucide-react';

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
  DSCardDescription,
  DSButton,
  DSFlexContainer,
  DSSpacer,
  DSPageTitle,
  DSBodyText,
  DSContentGrid,
  DSGridItem
} from '@/components/ui/design-system';

import { Badge } from '@/components/ui/badge';
import { assessmentService } from '@/services/assessment-service';
import { useToast } from '@/hooks/use-toast';

const AssessmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: assessment, isLoading } = useQuery({
    queryKey: ['assessment', id],
    queryFn: () => assessmentService.getAssessmentById(id as string),
    enabled: !!id,
  });

  const handleAddResponses = () => {
    navigate(`/app/assessments/${id}/add-responses`);
  };

  const handleViewResults = () => {
    navigate(`/app/assessments/${id}/results`);
  };

  const handleViewAnalysis = () => {
    navigate(`/app/assessments/${id}/analysis`);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <DSSection>
          <DSPageContainer>
            <Breadcrumbs />
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563eb] mx-auto"></div>
                <DSBodyText className="mt-4">Loading assessment details...</DSBodyText>
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

  return (
    <AppLayout>
      <DSSection>
        <DSPageContainer>
          <Breadcrumbs />
          
          {/* Page Header - Standardized */}
          <DSCard className="mb-8">
            <DSCardHeader>
              <DSFlexContainer justify="between" align="center" className="flex-col md:flex-row gap-4">
                <div>
                  <DSButton variant="ghost" className="mb-4 pl-0" onClick={() => navigate('/app/assessments')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Assessments
                  </DSButton>
                  <DSPageTitle className="text-3xl font-bold text-gray-900 mb-2">
                    {assessment.title}
                  </DSPageTitle>
                  <DSBodyText className="text-gray-600">
                    {assessment.subject} | Grade {assessment.grade_level} | {assessment.assessment_type}
                  </DSBodyText>
                </div>
                <DSFlexContainer gap="sm" className="flex-col sm:flex-row">
                  <DSButton variant="secondary" onClick={handleViewAnalysis}>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Analysis
                  </DSButton>
                  <DSButton variant="secondary" onClick={handleViewResults}>
                    <FileText className="mr-2 h-4 w-4" />
                    View Results
                  </DSButton>
                  <DSButton variant="primary" onClick={handleAddResponses}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Student Response
                  </DSButton>
                </DSFlexContainer>
              </DSFlexContainer>
            </DSCardHeader>
          </DSCard>

          {/* Assessment Information Cards */}
          <DSContentGrid cols={2}>
            <DSGridItem span={1}>
              <DSCard>
                <DSCardHeader>
                  <DSCardTitle className="text-lg font-semibold text-gray-900">Assessment Details</DSCardTitle>
                </DSCardHeader>
                <DSCardContent>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <DSBodyText className="text-sm text-gray-600">Assessment Date</DSBodyText>
                        <DSBodyText className="font-medium text-gray-900">
                          {assessment.assessment_date 
                            ? new Date(assessment.assessment_date).toLocaleDateString()
                            : 'Not set'
                          }
                        </DSBodyText>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <DSBodyText className="text-sm text-gray-600">Max Score</DSBodyText>
                        <DSBodyText className="font-medium text-gray-900">{assessment.max_score} points</DSBodyText>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <DSBodyText className="text-sm text-gray-600">Status</DSBodyText>
                        <Badge className={assessment.is_draft ? "bg-[#f59e0b] text-white" : "bg-[#10b981] text-white"}>
                          {assessment.is_draft ? 'Draft' : 'Published'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </DSCardContent>
              </DSCard>
            </DSGridItem>

            <DSGridItem span={1}>
              <DSCard>
                <DSCardHeader>
                  <DSCardTitle className="text-lg font-semibold text-gray-900">Standards & Description</DSCardTitle>
                </DSCardHeader>
                <DSCardContent>
                  <div className="space-y-4">
                    {assessment.description && (
                      <div>
                        <DSBodyText className="text-sm text-gray-600 mb-2">Description</DSBodyText>
                        <DSBodyText className="text-gray-900">{assessment.description}</DSBodyText>
                      </div>
                    )}
                    
                    {assessment.standards_covered && assessment.standards_covered.length > 0 && (
                      <div>
                        <DSBodyText className="text-sm text-gray-600 mb-2">Standards Covered</DSBodyText>
                        <div className="flex flex-wrap gap-2">
                          {assessment.standards_covered.map((standard, index) => (
                            <Badge key={index} className="bg-[#2563eb] text-white">
                              {standard}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </DSCardContent>
              </DSCard>
            </DSGridItem>
          </DSContentGrid>

          <DSSpacer size="xl" />

          {/* Quick Actions Card */}
          <DSCard>
            <DSCardHeader>
              <DSCardTitle className="text-lg font-semibold text-gray-900">Quick Actions</DSCardTitle>
              <DSCardDescription>Manage this assessment and analyze student performance</DSCardDescription>
            </DSCardHeader>
            <DSCardContent>
              <DSContentGrid cols={3}>
                <DSButton 
                  variant="secondary" 
                  onClick={handleAddResponses}
                  className="h-24 flex-col"
                >
                  <Plus className="h-6 w-6 mb-2" />
                  <span>Add Student Responses</span>
                </DSButton>
                
                <DSButton 
                  variant="secondary" 
                  onClick={handleViewResults}
                  className="h-24 flex-col"
                >
                  <FileText className="h-6 w-6 mb-2" />
                  <span>View Results</span>
                </DSButton>
                
                <DSButton 
                  variant="secondary" 
                  onClick={handleViewAnalysis}
                  className="h-24 flex-col"
                >
                  <BarChart3 className="h-6 w-6 mb-2" />
                  <span>AI Analysis</span>
                </DSButton>
              </DSContentGrid>
            </DSCardContent>
          </DSCard>
        </DSPageContainer>
      </DSSection>
    </AppLayout>
  );
};

export default AssessmentDetails;
