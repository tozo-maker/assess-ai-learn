
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DSCard,
  DSCardContent,
  DSFlexContainer
} from '@/components/ui/design-system';

interface ReportOptions {
  includeInsights: boolean;
  includeGoals: boolean;
  includeRecommendations: boolean;
  timeframe: 'last-month' | 'last-quarter' | 'all-time';
}

interface ReportOptionsCardProps {
  reportOptions: ReportOptions;
  onOptionsChange: (options: ReportOptions) => void;
}

const ReportOptionsCard: React.FC<ReportOptionsCardProps> = ({
  reportOptions,
  onOptionsChange
}) => {
  const updateOptions = (key: keyof ReportOptions, value: boolean | string) => {
    onOptionsChange({
      ...reportOptions,
      [key]: value
    });
  };

  return (
    <div className="space-y-6">
      {/* Report Content Options */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Report Options</h3>
        <DSCard>
          <DSCardContent className="p-4 space-y-4">
            <DSFlexContainer direction="col" gap="md">
              <DSFlexContainer align="center" gap="sm">
                <Checkbox
                  id="insights"
                  checked={reportOptions.includeInsights}
                  onCheckedChange={(checked) =>
                    updateOptions('includeInsights', checked as boolean)
                  }
                />
                <label htmlFor="insights" className="text-base text-gray-700">Include AI Insights & Analysis</label>
              </DSFlexContainer>
              
              <DSFlexContainer align="center" gap="sm">
                <Checkbox
                  id="goals"
                  checked={reportOptions.includeGoals}
                  onCheckedChange={(checked) =>
                    updateOptions('includeGoals', checked as boolean)
                  }
                />
                <label htmlFor="goals" className="text-base text-gray-700">Include Learning Goals Progress</label>
              </DSFlexContainer>
              
              <DSFlexContainer align="center" gap="sm">
                <Checkbox
                  id="recommendations"
                  checked={reportOptions.includeRecommendations}
                  onCheckedChange={(checked) =>
                    updateOptions('includeRecommendations', checked as boolean)
                  }
                />
                <label htmlFor="recommendations" className="text-base text-gray-700">Include Teacher Recommendations</label>
              </DSFlexContainer>
            </DSFlexContainer>
          </DSCardContent>
        </DSCard>
      </div>

      {/* Timeframe Selection */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Timeframe</h3>
        <Select 
          value={reportOptions.timeframe}
          onValueChange={(value: 'last-month' | 'last-quarter' | 'all-time') =>
            updateOptions('timeframe', value)
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last-month">Last Month</SelectItem>
            <SelectItem value="last-quarter">Last Quarter</SelectItem>
            <SelectItem value="all-time">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ReportOptionsCard;
