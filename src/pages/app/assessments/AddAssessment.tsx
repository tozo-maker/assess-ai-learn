
import React from 'react';
import AssessmentWizard from '@/components/assessments/AssessmentWizard';
import AppLayout from '@/components/layout/AppLayout';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

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

const AddAssessment: React.FC = () => {
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
                  <Link to="/app/assessments">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Assessments
                  </Link>
                </DSButton>
                <DSPageTitle className="text-3xl font-bold text-gray-900 mb-2">
                  Create Assessment
                </DSPageTitle>
                <DSBodyText className="text-gray-600">
                  Create a new assessment for your students with detailed questions and scoring rubrics
                </DSBodyText>
              </div>
            </DSCardHeader>
          </DSCard>

          {/* Assessment Wizard */}
          <AssessmentWizard />
        </DSPageContainer>
      </DSSection>
    </AppLayout>
  );
};

export default AddAssessment;
