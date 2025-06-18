
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus } from 'lucide-react';
import { DSCard, DSPageContainer, DSPageTitle, DSBodyText, DSButton, DSFlexContainer } from '@/components/ui/design-system';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

const AssessmentsPageHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <DSCard className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500 rounded-none border-x-0 border-t-0 mb-0">
      <DSPageContainer className="py-8">
        <Breadcrumbs />
        
        <DSFlexContainer 
          direction="row" 
          justify="between" 
          align="start" 
          gap="lg" 
          className="mt-6 flex-col lg:flex-row"
        >
          <DSFlexContainer direction="row" align="start" gap="md">
            <div className="p-3 bg-blue-100 rounded-xl">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <DSPageTitle className="mb-2">
                Assessments
              </DSPageTitle>
              <DSBodyText className="max-w-2xl text-lg">
                Manage and analyze student assessments to track learning progress and identify opportunities for improvement.
              </DSBodyText>
            </div>
          </DSFlexContainer>
          
          <DSFlexContainer 
            direction="row" 
            gap="sm" 
            className="flex-col sm:flex-row"
          >
            <DSButton 
              variant="secondary" 
              onClick={() => navigate('/app/assessments/batch')}
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <FileText className="mr-2 h-4 w-4" />
              Batch Import
            </DSButton>
            <DSButton 
              variant="primary"
              onClick={() => navigate('/app/assessments/add')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Assessment
            </DSButton>
          </DSFlexContainer>
        </DSFlexContainer>
      </DSPageContainer>
    </DSCard>
  );
};

export default AssessmentsPageHeader;
