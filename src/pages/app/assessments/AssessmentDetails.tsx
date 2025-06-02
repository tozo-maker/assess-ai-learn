
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText, Edit, Users, BarChart2, ArrowLeft } from 'lucide-react';

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
  DSContentGrid,
  DSSpacer,
  DSPageTitle,
  DSBodyText
} from '@/components/ui/design-system';

// Original Components
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { assessmentService } from '@/services/assessment-service';

const AssessmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  console.log('AssessmentDetails: Assessment ID from params:', id);

  const { data: assessment, isLoading } = useQuery({
    queryKey: ['assessment', id],
    queryFn: () => {
      console.log('AssessmentDetails: Fetching assessment with ID:', id);
      return assessmentService.getAssessmentById(id as string);
    },
    enabled: !!id,
  });

  const { data: assessmentItems, isLoading: isLoadingItems } = useQuery({
    queryKey: ['assessmentItems', id],
    queryFn: () => assessmentService.getAssessmentItems(id as string),
    enabled: !!id,
  });

  if (isLoading || isLoadingItems) {
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
                  <DSPageTitle className="text-xl font-semibold">Assessment not found</DSPageTitle>
                  <DSBodyText className="mt-2">The requested assessment could not be loaded.</DSBodyText>
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
          
          <div className="space-y-8">
            {/* Assessment Header - Standardized */}
            <DSCard>
              <DSCardHeader>
                <DSFlexContainer justify="between" align="center" className="flex-col md:flex-row gap-4">
                  <div>
                    <DSButton 
                      variant="ghost" 
                      onClick={() => navigate('/app/assessments')}
                      className="mb-4 pl-0"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Assessments
                    </DSButton>
                    <DSFlexContainer align="center" className="mb-2">
                      <FileText className="mr-2 h-5 w-5 text-gray-500" />
                      <Badge variant="outline" className="mr-2">
                        {assessment.assessment_type.charAt(0).toUpperCase() + assessment.assessment_type.slice(1)}
                      </Badge>
                      <Badge variant="secondary">
                        {assessment.max_score} Points
                      </Badge>
                    </DSFlexContainer>
                    <DSPageTitle className="text-3xl font-bold text-gray-900 mb-1">{assessment.title}</DSPageTitle>
                    <DSCardDescription>
                      {assessment.subject} | Grade {assessment.grade_level} | {assessment.assessment_date ? new Date(assessment.assessment_date).toLocaleDateString() : 'No date specified'}
                    </DSCardDescription>
                  </div>
                  <DSFlexContainer direction="col" gap="sm" className="sm:flex-row">
                    <DSButton variant="secondary" onClick={() => navigate(`/app/assessments/edit/${assessment.id}`)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DSButton>
                    <DSButton onClick={() => navigate(`/app/assessments/${assessment.id}/responses`)}>
                      <Users className="mr-2 h-4 w-4" />
                      Add Responses
                    </DSButton>
                    <DSButton variant="primary" onClick={() => navigate(`/app/assessments/${assessment.id}/results`)}>
                      <BarChart2 className="mr-2 h-4 w-4" />
                      View Results
                    </DSButton>
                  </DSFlexContainer>
                </DSFlexContainer>
              </DSCardHeader>
            </DSCard>

            {/* Assessment Details - Standardized Tabs */}
            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="items">Assessment Items ({assessmentItems?.length || 0})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="mt-4">
                <DSCard>
                  <DSCardContent>
                    <DSContentGrid cols={2}>
                      <div>
                        <h3 className="font-medium text-gray-500 mb-2">Assessment Information</h3>
                        <div className="grid grid-cols-3 gap-y-2">
                          <span className="text-sm font-medium">Title:</span>
                          <span className="text-sm col-span-2">{assessment.title}</span>
                          
                          <span className="text-sm font-medium">Subject:</span>
                          <span className="text-sm col-span-2">{assessment.subject}</span>
                          
                          <span className="text-sm font-medium">Grade Level:</span>
                          <span className="text-sm col-span-2">{assessment.grade_level}</span>
                          
                          <span className="text-sm font-medium">Type:</span>
                          <span className="text-sm col-span-2">{assessment.assessment_type}</span>
                          
                          <span className="text-sm font-medium">Date:</span>
                          <span className="text-sm col-span-2">
                            {assessment.assessment_date ? new Date(assessment.assessment_date).toLocaleDateString() : 'Not specified'}
                          </span>
                          
                          <span className="text-sm font-medium">Max Score:</span>
                          <span className="text-sm col-span-2">{assessment.max_score}</span>
                          
                          <span className="text-sm font-medium">Created:</span>
                          <span className="text-sm col-span-2">{new Date(assessment.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                      
                      {assessment.description && (
                        <div>
                          <h3 className="font-medium text-gray-500 mb-2">Description</h3>
                          <DSBodyText className="text-sm">{assessment.description}</DSBodyText>
                        </div>
                      )}
                    </DSContentGrid>
                    
                    {assessment.standards_covered && assessment.standards_covered.length > 0 && (
                      <div className="mt-6">
                        <h3 className="font-medium text-gray-500 mb-2">Standards Covered</h3>
                        <DSFlexContainer gap="sm" className="flex-wrap">
                          {assessment.standards_covered.map((standard, index) => (
                            <Badge key={index} variant="outline">{standard}</Badge>
                          ))}
                        </DSFlexContainer>
                      </div>
                    )}
                  </DSCardContent>
                </DSCard>
              </TabsContent>
              
              <TabsContent value="items" className="mt-4">
                <DSCard>
                  <DSCardContent>
                    {!assessmentItems || assessmentItems.length === 0 ? (
                      <div className="text-center p-6">
                        <DSBodyText>No assessment items found</DSBodyText>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {assessmentItems.map((item, index) => (
                          <div key={item.id} className={`${index !== 0 ? 'pt-6 border-t border-gray-200' : ''}`}>
                            <DSFlexContainer justify="between" align="start" className="mb-2">
                              <h3 className="font-medium">Item #{item.item_number}</h3>
                              <DSFlexContainer gap="sm">
                                <Badge variant="secondary">{item.knowledge_type}</Badge>
                                <Badge variant="outline">{item.difficulty_level}</Badge>
                                <Badge>{item.max_score} pts</Badge>
                              </DSFlexContainer>
                            </DSFlexContainer>
                            <DSBodyText className="mb-2">{item.question_text}</DSBodyText>
                            {item.standard_reference && (
                              <DSBodyText className="text-sm text-gray-500">Standard: {item.standard_reference}</DSBodyText>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </DSCardContent>
                </DSCard>
              </TabsContent>
            </Tabs>
          </div>
        </DSPageContainer>
      </DSSection>
    </AppLayout>
  );
};

export default AssessmentDetails;
