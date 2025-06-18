
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload } from 'lucide-react';
import { 
  DSCard, 
  DSCardHeader, 
  DSButton, 
  DSFlexContainer 
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
    <DSCard className="mb-8">
      <DSCardHeader className="p-6">
        <DSFlexContainer justify="between" align="center" className="flex-col md:flex-row gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Assessments
            </h1>
            <p className="text-gray-600">
              Manage and analyze student assessments to track learning progress and identify opportunities for improvement.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              {totalAssessments} total assessments • {filteredCount} currently shown
            </p>
          </div>
          
          <DSFlexContainer gap="sm" className="flex-col sm:flex-row">
            <DSButton 
              variant="secondary" 
              onClick={handleBulkImport}
              className="whitespace-nowrap"
            >
              <Upload className="mr-2 h-4 w-4" />
              Batch Import
            </DSButton>
            <DSButton 
              variant="primary"
              onClick={handleAddAssessment}
              className="whitespace-nowrap"
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
