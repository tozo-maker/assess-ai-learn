
import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import StudentResponseForm from '@/components/assessments/StudentResponseForm';

// Design System Components
import {
  DSPageContainer,
  DSSection,
  DSCard,
  DSCardHeader,
  DSCardContent,
  DSButton,
  DSPageTitle,
  DSBodyText
} from '@/components/ui/design-system';

const AddStudentResponses: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const preSelectedStudentId = searchParams.get('student');

  if (!id) {
    return (
      <AppLayout>
        <DSSection>
          <DSPageContainer>
            <Breadcrumbs />
            <DSCard>
              <DSCardHeader>
                <DSPageTitle className="text-xl font-semibold">Error</DSPageTitle>
                <DSBodyText className="text-gray-600">Assessment ID is missing</DSBodyText>
              </DSCardHeader>
              <DSCardContent>
                <div className="text-center p-8">
                  <DSPageTitle className="text-xl font-semibold">Error</DSPageTitle>
                  <DSBodyText className="mt-2">Assessment ID is required.</DSBodyText>
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
              <div>
                <DSButton variant="ghost" className="mb-4 pl-0" asChild>
                  <Link to={`/app/assessments/${id}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Assessment
                  </Link>
                </DSButton>
                <DSPageTitle className="text-3xl font-bold text-gray-900 mb-2">
                  Record Student Responses
                </DSPageTitle>
                <DSBodyText className="text-gray-600">
                  Enter assessment data for a student to track their performance and generate insights
                </DSBodyText>
              </div>
            </DSCardHeader>
          </DSCard>

          {/* Student Response Form */}
          <StudentResponseForm 
            assessmentId={id} 
            preSelectedStudentId={preSelectedStudentId || undefined}
          />
        </DSPageContainer>
      </DSSection>
    </AppLayout>
  );
};

export default AddStudentResponses;
