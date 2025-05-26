
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface GrowthTrendData {
  period: string;
  actual_score: number;
  predicted_score: number;
  target_score: number;
  growth_rate: number;
}

interface GrowthTrendChartProps {
  data: GrowthTrendData[];
  studentName?: string;
}

interface ChartConfig {
  actual_score: {
    label: string;
    color: string;
  };
  predicted_score: {
    label: string;
    color: string;
  };
  target_score: {
    label: string;
    color: string;
  };
}

const GrowthTrendChart: React.FC<GrowthTrendChartProps> = ({ data, studentName }) => {
  const chartConfig: ChartConfig = {
    actual_score: {
      label: 'Actual Performance',
      color: '#2563eb',
    },
    predicted_score: {
      label: 'Predicted Trend',
      color: '#10b981',
    },
    target_score: {
      label: 'Target Goal',
      color: '#dc2626',
    },
  };

  const targetScore = data[0]?.target_score || 85;

  return (
    <ChartContainer config={chartConfig} className="h-80">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="period" />
        <YAxis domain={[0, 100]} />
        <ChartTooltip
          content={<ChartTooltipContent />}
          labelFormatter={(label) => `Period: ${label}`}
        />
        <Line
          type="monotone"
          dataKey="actual_score"
          stroke="#2563eb"
          strokeWidth={3}
          dot={{ fill: '#2563eb', strokeWidth: 2, r: 6 }}
          name="Actual Performance"
        />
        <Line
          type="monotone"
          dataKey="predicted_score"
          stroke="#10b981"
          strokeWidth={2}
          strokeDasharray="8 4"
          dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
          name="Predicted Trend"
        />
        <ReferenceLine 
          y={targetScore} 
          stroke="#dc2626" 
          strokeDasharray="5 5"
          label="Target Goal"
        />
      </LineChart>
    </ChartContainer>
  );
};

export default GrowthTrendChart;
