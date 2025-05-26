
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface DistributionData {
  range: string;
  count: number;
  percentage: number;
}

interface AssessmentDistributionChartProps {
  data: DistributionData[];
  title: string;
}

interface ChartConfig {
  count: {
    label: string;
    color: string;
  };
}

const AssessmentDistributionChart: React.FC<AssessmentDistributionChartProps> = ({ data, title }) => {
  const chartConfig: ChartConfig = {
    count: {
      label: 'Number of Students',
      color: '#3b82f6',
    },
  };

  const getBarColor = (range: string): string => {
    if (range.includes('90-100')) return '#10b981';
    if (range.includes('80-89')) return '#22c55e';
    if (range.includes('70-79')) return '#eab308';
    if (range.includes('60-69')) return '#f97316';
    return '#ef4444';
  };

  return (
    <ChartContainer config={chartConfig} className="h-64">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="range" />
        <YAxis />
        <ChartTooltip
          content={<ChartTooltipContent />}
          labelFormatter={(label) => `Score Range: ${label}`}
          formatter={(value, name, props) => {
            const entry = data.find(d => d.range === props?.payload?.range);
            return [`${value} students (${entry?.percentage || 0}%)`, 'Count'];
          }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getBarColor(entry.range)} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
};

export default AssessmentDistributionChart;
