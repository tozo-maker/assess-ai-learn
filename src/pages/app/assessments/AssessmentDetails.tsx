
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText, Edit, Users, BarChart2, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PageShell } from '@/components/ui/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
      <PageShell
        title="Loading Assessment..."
        description="Please wait"
        link="/app/assessments"
        linkText="Back to Assessments"
      >
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4">Loading assessment details...</p>
          </div>
        </div>
      </PageShell>
    );
  }

  if (!assessment) {
    return (
      <PageShell
        title="Assessment Not Found"
        description="The requested assessment could not be found"
        link="/app/assessments"
        linkText="Back to Assessments"
      >
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold">Assessment not found</h2>
          <p className="mt-2">The requested assessment could not be loaded.</p>
          <Button onClick={() => navigate('/app/assessments')} className="mt-4">Back to Assessments</Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title={assessment.title}
      description={`${assessment.subject} | Grade ${assessment.grade_level}`}
      link="/app/assessments"
      linkText="Back to Assessments"
    >
      <div className="space-y-6">
        {/* Assessment Header */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <div className="flex items-center mb-2">
                  <FileText className="mr-2 h-5 w-5 text-gray-500" />
                  <Badge variant="outline" className="mr-2">
                    {assessment.assessment_type.charAt(0).toUpperCase() + assessment.assessment_type.slice(1)}
                  </Badge>
                  <Badge variant="secondary">
                    {assessment.max_score} Points
                  </Badge>
                </div>
                <CardTitle className="text-2xl mb-1">{assessment.title}</CardTitle>
                <CardDescription>
                  {assessment.subject} | Grade {assessment.grade_level} | {assessment.assessment_date ? new Date(assessment.assessment_date).toLocaleDateString() : 'No date specified'}
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => navigate(`/app/assessments/edit/${assessment.id}`)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button onClick={() => navigate(`/app/assessments/${assessment.id}/responses`)}>
                  <Users className="mr-2 h-4 w-4" />
                  Add Responses
                </Button>
                <Button variant="secondary" onClick={() => navigate(`/app/assessments/${assessment.id}/analysis`)}>
                  <BarChart2 className="mr-2 h-4 w-4" />
                  View Analysis
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Assessment Details */}
        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="items">Assessment Items ({assessmentItems?.length || 0})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <p className="text-sm">{assessment.description}</p>
                    </div>
                  )}
                </div>
                
                {assessment.standards_covered && assessment.standards_covered.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-medium text-gray-500 mb-2">Standards Covered</h3>
                    <div className="flex flex-wrap gap-2">
                      {assessment.standards_covered.map((standard, index) => (
                        <Badge key={index} variant="outline">{standard}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="items" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                {!assessmentItems || assessmentItems.length === 0 ? (
                  <div className="text-center p-6">
                    <p>No assessment items found</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {assessmentItems.map((item, index) => (
                      <div key={item.id} className={`${index !== 0 ? 'pt-6 border-t border-gray-200' : ''}`}>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">Item #{item.item_number}</h3>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">{item.knowledge_type}</Badge>
                            <Badge variant="outline">{item.difficulty_level}</Badge>
                            <Badge>{item.max_score} pts</Badge>
                          </div>
                        </div>
                        <p className="mb-2">{item.question_text}</p>
                        {item.standard_reference && (
                          <p className="text-sm text-gray-500">Standard: {item.standard_reference}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageShell>
  );
};

export default AssessmentDetails;
