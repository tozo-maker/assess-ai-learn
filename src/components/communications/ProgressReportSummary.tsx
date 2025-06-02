
import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import {
  DSCard,
  DSCardContent,
  DSCardHeader,
  DSCardTitle,
  DSBodyText,
  DSFlexContainer
} from '@/components/ui/design-system';
import { Badge } from '@/components/ui/badge';

interface ProgressReportSummaryProps {
  performance: {
    average_score: number;
    assessment_count: number;
    performance_level: string;
    needs_attention: boolean;
  };
}

const ProgressReportSummary: React.FC<ProgressReportSummaryProps> = ({ performance }) => {
  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
      <DSCard>
        <DSCardHeader className="pb-4">
          <DSCardTitle className="text-lg">Average Score</DSCardTitle>
        </DSCardHeader>
        <DSCardContent>
          <div className="text-3xl font-bold text-gray-900 mb-2">{performance.average_score}%</div>
          <DSBodyText className="text-gray-600">
            Based on {performance.assessment_count} assessments
          </DSBodyText>
        </DSCardContent>
      </DSCard>

      <DSCard>
        <DSCardHeader className="pb-4">
          <DSCardTitle className="text-lg">Performance Level</DSCardTitle>
        </DSCardHeader>
        <DSCardContent>
          <div className="text-3xl font-bold text-gray-900 mb-2">{performance.performance_level}</div>
          <DSBodyText className="text-gray-600">Overall academic standing</DSBodyText>
        </DSCardContent>
      </DSCard>

      <DSCard>
        <DSCardHeader className="pb-4">
          <DSCardTitle className="text-lg">Status</DSCardTitle>
        </DSCardHeader>
        <DSCardContent>
          <DSFlexContainer align="center" gap="sm" className="mb-2">
            {performance.needs_attention ? (
              <>
                <Badge variant="destructive">Needs Support</Badge>
                <AlertCircle className="h-4 w-4 text-[#ef4444]" />
              </>
            ) : (
              <>
                <Badge className="bg-[#10b981] hover:bg-[#059669]">On Track</Badge>
                <Check className="h-4 w-4 text-[#10b981]" />
              </>
            )}
          </DSFlexContainer>
          <DSBodyText className="text-gray-600">Based on recent performance</DSBodyText>
        </DSCardContent>
      </DSCard>
    </div>
  );
};

export default ProgressReportSummary;
