
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload } from 'lucide-react';
import {
  DSCard,
  DSCardHeader,
  DSButton,
  DSFlexContainer,
  DSPageTitle,
  DSBodyText,
  DSHelpText
} from '@/components/ui/design-system';

interface StudentsPageHeaderProps {
  totalStudents: number;
  filteredCount: number;
}

const StudentsPageHeader: React.FC<StudentsPageHeaderProps> = ({
  totalStudents,
  filteredCount
}) => {
  const navigate = useNavigate();

  const handleAddStudent = () => {
    navigate('/app/students/add');
  };

  const handleBulkImport = () => {
    navigate('/app/students/import');
  };

  return (
    <DSCard className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500">
      <DSCardHeader className="p-8">
        <DSFlexContainer justify="between" align="center" className="flex-col lg:flex-row gap-6">
          <div className="text-center lg:text-left">
            <DSPageTitle className="text-4xl font-bold text-gray-900 mb-3">
              Students
            </DSPageTitle>
            <DSBodyText className="text-lg text-gray-600 max-w-2xl">
              Manage your students and track their learning progress with comprehensive insights and analytics
            </DSBodyText>
            <DSHelpText className="mt-2 text-sm">
              {totalStudents} total students • {filteredCount} currently shown
            </DSHelpText>
          </div>
          <DSFlexContainer gap="sm" className="flex-col sm:flex-row">
            <DSButton 
              variant="secondary" 
              onClick={handleBulkImport}
              className="whitespace-nowrap"
            >
              <Upload className="mr-2 h-4 w-4" />
              Import Students
            </DSButton>
            <DSButton 
              variant="primary"
              onClick={handleAddStudent}
              className="whitespace-nowrap"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </DSButton>
          </DSFlexContainer>
        </DSFlexContainer>
      </DSCardHeader>
    </DSCard>
  );
};

export default StudentsPageHeader;
