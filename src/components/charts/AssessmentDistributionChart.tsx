
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DistributionData {
  range: string;
  count: number;
  percentage: number;
}

interface AssessmentDistributionChartProps {
  data: DistributionData[];
  title: string;
}

const AssessmentDistributionChart: React.FC<AssessmentDistributionChartProps> = ({ data, title }) => {
  const maxCount = Math.max(...data.map(d => d.count));

  const getBarColor = (range: string) => {
    switch (range) {
      case '90-100%': return 'bg-green-500';
      case '80-89%': return 'bg-green-400';
      case '70-79%': return 'bg-yellow-400';
      case '60-69%': return 'bg-orange-400';
      case '<60%': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="w-20 text-sm font-medium text-right">
              {item.range}
            </div>
            <div className="flex-1 relative">
              <div className="h-8 bg-gray-200 rounded-lg overflow-hidden">
                <div 
                  className={`h-full ${getBarColor(item.range)} transition-all duration-500`}
                  style={{ width: maxCount > 0 ? `${(item.count / maxCount) * 100}%` : '0%' }}
                ></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-between px-3">
                <span className="text-sm font-medium text-white mix-blend-difference">
                  {item.count} students
                </span>
                <span className="text-sm font-medium text-white mix-blend-difference">
                  {item.percentage}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 text-sm text-gray-600">
        <p>Total students represented: {data.reduce((sum, item) => sum + item.count, 0)}</p>
      </div>
    </div>
  );
};

export default AssessmentDistributionChart;
