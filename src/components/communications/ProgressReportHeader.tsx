
import React from 'react';
import { Download } from 'lucide-react';
import {
  DSButton,
  DSFlexContainer,
  DSPageTitle,
  DSBodyText
} from '@/components/ui/design-system';

interface ProgressReportHeaderProps {
  student: {
    first_name: string;
    last_name: string;
    grade_level: string;
  };
}

const ProgressReportHeader: React.FC<ProgressReportHeaderProps> = ({ student }) => {
  return (
    <DSFlexContainer justify="between" align="start" className="flex-col md:flex-row gap-4">
      <div>
        <DSPageTitle className="text-2xl print:text-3xl mb-2">
          Progress Report: {student.first_name} {student.last_name}
        </DSPageTitle>
        <DSBodyText className="text-gray-600">
          Grade {student.grade_level} • {new Date().toLocaleDateString()}
        </DSBodyText>
      </div>
      <DSButton variant="secondary" className="print:hidden">
        <Download className="h-4 w-4 mr-2" />
        Print Report
      </DSButton>
    </DSFlexContainer>
  );
};

export default ProgressReportHeader;
