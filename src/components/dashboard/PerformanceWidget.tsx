
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

interface PerformanceData {
  period: string;
  average: number;
}

interface PerformanceWidgetProps {
  data: PerformanceData[];
  title: string;
  currentScore: number;
  trend: string;
}

const PerformanceWidget: React.FC<PerformanceWidgetProps> = ({ data, title, currentScore, trend }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="text-2xl font-bold text-gray-900">
          {currentScore}%
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Line
                type="monotone"
                dataKey="average"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-2 border rounded shadow">
                        <p className="text-sm">{`${label}: ${payload[0].value}%`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className={`text-sm mt-2 ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
          {trend} from last period
        </p>
      </CardContent>
    </Card>
  );
};

export default PerformanceWidget;
