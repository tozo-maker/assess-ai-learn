
import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';

interface SkillMasteryData {
  skill: string;
  current_level: number;
  target_level: number;
  class_average: number;
}

interface SkillMasteryRadarChartProps {
  data: SkillMasteryData[];
  studentName?: string;
}

const SkillMasteryRadarChart: React.FC<SkillMasteryRadarChartProps> = ({ data, studentName }) => {
  const chartConfig: ChartConfig = {
    current_level: {
      label: `${studentName || 'Student'} Current`,
      color: '#10b981',
    },
    target_level: {
      label: 'Target Level',
      color: '#3b82f6',
    },
    class_average: {
      label: 'Class Average',
      color: '#f59e0b',
    },
  };

  return (
    <ChartContainer config={chartConfig} className="h-96">
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12 }} />
        <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
        <Radar
          name="Current Level"
          dataKey="current_level"
          stroke="#10b981"
          fill="#10b981"
          fillOpacity={0.3}
          strokeWidth={2}
        />
        <Radar
          name="Target Level"
          dataKey="target_level"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.1}
          strokeWidth={2}
          strokeDasharray="5 5"
        />
        <Radar
          name="Class Average"
          dataKey="class_average"
          stroke="#f59e0b"
          fill="none"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Legend />
      </RadarChart>
    </ChartContainer>
  );
};

export default SkillMasteryRadarChart;
