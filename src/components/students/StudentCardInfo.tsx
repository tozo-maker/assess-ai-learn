
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { DSSubsectionHeader, DSHelpText, DSFlexContainer } from '@/components/ui/design-system';
import { PerformanceConfig } from './StudentPerformanceConfig';

interface StudentCardInfoProps {
  firstName: string;
  lastName: string;
  gradeLevel: string;
  studentId?: string;
  config: PerformanceConfig;
  score?: number;
}

const StudentCardInfo: React.FC<StudentCardInfoProps> = ({
  firstName,
  lastName,
  gradeLevel,
  studentId,
  config,
  score
}) => {
  return (
    <div className="mb-3">
      <DSSubsectionHeader className="text-lg font-bold text-gray-900 mb-1 leading-tight truncate">
        {firstName} {lastName}
      </DSSubsectionHeader>
      
      <DSFlexContainer align="center" gap="md" className="mb-2">
        <Badge className={`text-xs ${config.textColor} ${config.bgColor} border-transparent font-semibold`}>
          Grade {gradeLevel}
        </Badge>
        
        {studentId && (
          <DSHelpText className="text-xs">ID: {studentId}</DSHelpText>
        )}
      </DSFlexContainer>

      {/* Performance Status - Compact */}
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${config.bgColor} border ${config.borderColor.replace('border-l-', 'border-')}`}>
        <div className={`text-sm font-bold ${config.textColor}`}>
          {config.status}
        </div>
        {score && (
          <div className="text-lg font-black text-gray-900">
            {Math.round(score)}%
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCardInfo;
