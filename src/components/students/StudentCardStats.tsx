
import React from 'react';
import { BookOpen, Calendar, Mail, Phone } from 'lucide-react';
import { DSFlexContainer, DSBodyText, DSHelpText } from '@/components/ui/design-system';
import { PerformanceData } from './StudentPerformanceConfig';

interface StudentCardStatsProps {
  performance: PerformanceData;
  parentEmail?: string;
  parentPhone?: string;
}

const StudentCardStats: React.FC<StudentCardStatsProps> = ({
  performance,
  parentEmail,
  parentPhone
}) => {
  return (
    <DSFlexContainer justify="between" align="center" className="mb-3 pt-3 border-t border-gray-100">
      <div className="text-center">
        <DSFlexContainer justify="center" align="center" gap="xs" className="mb-1">
          <BookOpen className="h-3 w-3 text-gray-400" />
          <DSHelpText className="text-xs font-medium">Tests</DSHelpText>
        </DSFlexContainer>
        <DSBodyText className="text-sm font-bold text-gray-900">
          {performance.assessmentCount}
        </DSBodyText>
      </div>
      
      <div className="text-center">
        <DSFlexContainer justify="center" align="center" gap="xs" className="mb-1">
          <Calendar className="h-3 w-3 text-gray-400" />
          <DSHelpText className="text-xs font-medium">Last</DSHelpText>
        </DSFlexContainer>
        <DSBodyText className="text-xs font-bold text-gray-900">
          {performance.lastAssessment 
            ? new Date(performance.lastAssessment).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : 'None'
          }
        </DSBodyText>
      </div>

      {/* Contact indicators */}
      <DSFlexContainer gap="xs">
        {parentEmail && (
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="h-3 w-3 text-blue-600" />
          </div>
        )}
        {parentPhone && (
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
            <Phone className="h-3 w-3 text-green-600" />
          </div>
        )}
      </DSFlexContainer>
    </DSFlexContainer>
  );
};

export default StudentCardStats;
