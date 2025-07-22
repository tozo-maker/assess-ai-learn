
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Users } from 'lucide-react';

interface TrendData {
  date: string;
  average_score: number;
  assessment_count: number;
  student_count: number;
  subject?: string;
}

interface TrendAnalysisChartProps {
  data: TrendData[];
  title?: string;
  subtitle?: string;
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
  onTimeRangeChange?: (range: 'week' | 'month' | 'quarter' | 'year') => void;
}

const TrendAnalysisChart: React.FC<TrendAnalysisChartProps> = ({
  data,
  title = "Performance Trends",
  subtitle = "Track student performance over time",
  timeRange = 'month',
  onTimeRangeChange
}) => {
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');
  const [metric, setMetric] = useState<'average_score' | 'assessment_count' | 'student_count'>('average_score');

  const formatData = () => {
    return data.map(item => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }));
  };

  const calculateTrend = () => {
    if (data.length < 2) return { direction: 'stable', percentage: 0 };
    
    const recent = data.slice(-3);
    const earlier = data.slice(-6, -3);
    
    if (recent.length === 0 || earlier.length === 0) return { direction: 'stable', percentage: 0 };
    
    const recentAvg = recent.reduce((sum, item) => sum + item[metric], 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, item) => sum + item[metric], 0) / earlier.length;
    
    const percentage = ((recentAvg - earlierAvg) / earlierAvg) * 100;
    const direction = percentage > 2 ? 'up' : percentage < -2 ? 'down' : 'stable';
    
    return { direction, percentage: Math.abs(percentage) };
  };

  const trend = calculateTrend();
  const chartData = formatData();

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area 
              type="monotone" 
              dataKey={metric} 
              stroke="#3b82f6" 
              fillOpacity={1} 
              fill="url(#colorMetric)" 
            />
          </AreaChart>
        );
      
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey={metric} fill="#3b82f6" />
          </BarChart>
        );
      
      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey={metric} 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
            />
          </LineChart>
        );
    }
  };

  const getMetricLabel = (metricKey: string) => {
    switch (metricKey) {
      case 'average_score': return 'Average Score';
      case 'assessment_count': return 'Assessment Count';
      case 'student_count': return 'Student Count';
      default: return metricKey;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              {title}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant={trend.direction === 'up' ? 'default' : trend.direction === 'down' ? 'destructive' : 'secondary'}
              className="flex items-center gap-1"
            >
              {trend.direction === 'up' && <TrendingUp className="h-3 w-3" />}
              {trend.direction === 'down' && <TrendingDown className="h-3 w-3" />}
              {trend.direction === 'stable' ? 'Stable' : `${trend.percentage.toFixed(1)}%`}
            </Badge>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Select value={metric} onValueChange={(value: any) => setMetric(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="average_score">Average Score</SelectItem>
              <SelectItem value="assessment_count">Assessment Count</SelectItem>
              <SelectItem value="student_count">Student Count</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line</SelectItem>
              <SelectItem value="area">Area</SelectItem>
              <SelectItem value="bar">Bar</SelectItem>
            </SelectContent>
          </Select>
          
          {onTimeRangeChange && (
            <Select value={timeRange} onValueChange={onTimeRangeChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="quarter">Quarter</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {chartData.length > 0 ? chartData[chartData.length - 1]?.average_score?.toFixed(1) || 'N/A' : 'N/A'}
            </p>
            <p className="text-sm text-gray-600">Latest Score</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {chartData.reduce((sum, item) => sum + (item.assessment_count || 0), 0)}
            </p>
            <p className="text-sm text-gray-600">Total Assessments</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {Math.max(...chartData.map(item => item.student_count || 0))}
            </p>
            <p className="text-sm text-gray-600">Students Tracked</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendAnalysisChart;
