
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Edit, MessageSquare, Target } from 'lucide-react';

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

import StudentProfileTabs from '@/components/students/StudentProfileTabs';
import { studentService } from '@/services/student-service';

const StudentProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: student, isLoading } = useQuery({
    queryKey: ['student', id],
    queryFn: () => studentService.getStudentById(id as string),
    enabled: !!id,
  });

  // Mock data for required props - in a real app, these would come from actual queries
  const performanceData = {
    averageScore: student?.performance && !Array.isArray(student.performance) ? student.performance.average_score || 0 : 0,
    assessmentsCompleted: student?.performance && !Array.isArray(student.performance) ? student.performance.assessment_count || 0 : 0,
    needsAttention: student?.performance && !Array.isArray(student.performance) ? student.performance.needs_attention || false : false,
  };

  const handleEditClick = () => {
    // Navigate to edit student page
    navigate(`/app/students/${id}/edit`);
  };

  const handleDelete = () => {
    // Handle student deletion
    console.log('Delete student:', id);
  };

  const handleViewAssessments = () => {
    // Navigate to student assessments
    navigate(`/app/students/${id}/assessments`);
  };

  const handleRefreshInsights = () => {
    // Refresh insights data
    console.log('Refresh insights for student:', id);
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
                <DSBodyText className="mt-4">Loading student profile...</DSBodyText>
              </div>
            </div>
          </DSPageContainer>
        </DSSection>
      </AppLayout>
    );
  }

  if (!student) {
    return (
      <AppLayout>
        <DSSection>
          <DSPageContainer>
            <Breadcrumbs />
            <DSCard>
              <DSCardContent>
                <div className="text-center py-8">
                  <DSPageTitle className="text-xl font-semibold text-gray-900">Student Not Found</DSPageTitle>
                  <DSBodyText className="mt-2 text-gray-600">The requested student could not be found.</DSBodyText>
                  <DSButton onClick={() => navigate('/app/students')} className="mt-4">
                    Back to Students
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
                  <DSButton variant="ghost" className="mb-4 pl-0" onClick={() => navigate('/app/students')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Students
                  </DSButton>
                  <DSPageTitle className="text-3xl font-bold text-gray-900 mb-2">
                    {student.first_name} {student.last_name}
                  </DSPageTitle>
                  <DSBodyText className="text-gray-600">
                    Grade {student.grade_level} Student Profile
                  </DSBodyText>
                </div>
                <DSFlexContainer gap="sm" className="flex-col sm:flex-row">
                  <DSButton variant="secondary">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contact Parent
                  </DSButton>
                  <DSButton variant="secondary">
                    <Target className="mr-2 h-4 w-4" />
                    Set Goals
                  </DSButton>
                  <DSButton variant="primary">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </DSButton>
                </DSFlexContainer>
              </DSFlexContainer>
            </DSCardHeader>
          </DSCard>

          <DSSpacer size="lg" />

          {/* Student Profile Tabs */}
          <StudentProfileTabs 
            student={student}
            studentId={id || ''}
            performanceData={performanceData}
            studentAssessmentsData={{ assessments: [], insights: [] }}
            assessmentsLoading={false}
            studentGoals={[]}
            goalsLoading={false}
            onEditClick={handleEditClick}
            onDelete={handleDelete}
            onViewAssessments={handleViewAssessments}
            onRefreshInsights={handleRefreshInsights}
          />
        </DSPageContainer>
      </DSSection>
    </AppLayout>
  );
};

export default StudentProfile;
