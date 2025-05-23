
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface PerformanceTimelineData {
  assessment_name: string;
  score: number;
  class_average: number;
  date: string;
}

interface PerformanceTimelineChartProps {
  data: PerformanceTimelineData[];
  studentName?: string;
}

const PerformanceTimelineChart: React.FC<PerformanceTimelineChartProps> = ({ data, studentName }) => {
  const chartConfig = {
    score: {
      label: `${studentName || 'Student'} Score`,
      color: '#2563eb',
    },
    class_average: {
      label: 'Class Average',
      color: '#dc2626',
    },
  };

  return (
    <ChartContainer config={chartConfig} className="h-80">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="assessment_name" angle={-45} textAnchor="end" height={80} />
        <YAxis domain={[0, 100]} />
        <ChartTooltip
          content={<ChartTooltipContent />}
          labelFormatter={(label) => `Assessment: ${label}`}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#2563eb"
          strokeWidth={3}
          dot={{ fill: '#2563eb', strokeWidth: 2, r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="class_average"
          stroke="#dc2626"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
        />
      </LineChart>
    </ChartContainer>
  );
};

export default PerformanceTimelineChart;
