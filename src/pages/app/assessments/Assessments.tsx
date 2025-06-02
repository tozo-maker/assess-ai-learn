
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus } from 'lucide-react';

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
  DSBodyText
} from '@/components/ui/design-system';

import AssessmentList from '@/components/assessments/AssessmentList';

const Assessments: React.FC = () => {
  const navigate = useNavigate();

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
                  <DSPageTitle className="text-3xl font-bold text-gray-900 mb-2">
                    Assessments
                  </DSPageTitle>
                  <DSBodyText className="text-gray-600">
                    Manage and analyze student assessments to track learning progress
                  </DSBodyText>
                </div>
                <DSFlexContainer gap="sm" className="flex-col sm:flex-row">
                  <DSButton 
                    variant="secondary" 
                    onClick={() => navigate('/app/assessments/batch')}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Batch Import
                  </DSButton>
                  <DSButton 
                    variant="primary"
                    onClick={() => navigate('/app/assessments/add')}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New Assessment
                  </DSButton>
                </DSFlexContainer>
              </DSFlexContainer>
            </DSCardHeader>
          </DSCard>

          {/* Assessment List */}
          <AssessmentList />
        </DSPageContainer>
      </DSSection>
    </AppLayout>
  );
};

export default Assessments;
