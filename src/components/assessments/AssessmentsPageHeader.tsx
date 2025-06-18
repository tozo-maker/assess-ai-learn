
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload, FileText } from 'lucide-react';
import { 
  DSCard, 
  DSCardHeader, 
  DSButton, 
  DSFlexContainer, 
  DSPageTitle, 
  DSBodyText, 
  DSHelpText 
} from '@/components/ui/design-system';

interface AssessmentsPageHeaderProps {
  totalAssessments: number;
  filteredCount: number;
}

const AssessmentsPageHeader: React.FC<AssessmentsPageHeaderProps> = ({
  totalAssessments,
  filteredCount
}) => {
  const navigate = useNavigate();

  const handleAddAssessment = () => {
    navigate('/app/assessments/add');
  };

  const handleBulkImport = () => {
    navigate('/app/assessments/batch');
  };

  return (
    <DSCard className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500">
      <DSCardHeader className="p-8">
        <DSFlexContainer 
          direction="col" 
          gap="lg" 
          className="lg:flex-row lg:justify-between lg:items-center"
        >
          <DSFlexContainer align="start" gap="md" className="text-center lg:text-left">
            <div className="p-3 bg-blue-100 rounded-xl">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <DSPageTitle className="mb-3">
                Assessments
              </DSPageTitle>
              <DSBodyText className="max-w-2xl mb-2">
                Manage and analyze student assessments to track learning progress and identify opportunities for improvement.
              </DSBodyText>
              <DSHelpText>
                {totalAssessments} total assessments • {filteredCount} currently shown
              </DSHelpText>
            </div>
          </DSFlexContainer>
          
          <DSFlexContainer direction="col" gap="sm" className="sm:flex-row">
            <DSButton 
              variant="secondary" 
              onClick={handleBulkImport}
            >
              <Upload className="mr-2 h-4 w-4" />
              Batch Import
            </DSButton>
            <DSButton 
              variant="primary"
              onClick={handleAddAssessment}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Assessment
            </DSButton>
          </DSFlexContainer>
        </DSFlexContainer>
      </DSCardHeader>
    </DSCard>
  );
};

export default AssessmentsPageHeader;
