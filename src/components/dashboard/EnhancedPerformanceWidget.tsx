
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, Eye, EyeOff } from 'lucide-react';

interface PerformanceData {
  period: string;
  average: number;
}

interface EnhancedPerformanceWidgetProps {
  data: PerformanceData[];
  title: string;
  currentScore: number;
  trend: string;
  className?: string;
}

const EnhancedPerformanceWidget: React.FC<EnhancedPerformanceWidgetProps> = ({
  data,
  title,
  currentScore,
  trend,
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTrendLine, setShowTrendLine] = useState(true);

  // Calculate trend direction
  const firstScore = data[0]?.average || 0;
  const lastScore = data[data.length - 1]?.average || 0;
  const trendDirection = lastScore > firstScore ? 'up' : 'down';
  const trendPercentage = firstScore > 0 ? Math.abs(((lastScore - firstScore) / firstScore) * 100) : 0;

  const getTrendColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendBadgeColor = (direction: string) => {
    return direction === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <Card className={`transition-all duration-300 hover:shadow-lg ${isExpanded ? 'col-span-2' : ''} ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTrendLine(!showTrendLine)}
              className="h-8 w-8 p-0"
            >
              {showTrendLine ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Score Display */}
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-3xl font-bold ${getTrendColor(currentScore)}`}>
                {currentScore}%
              </div>
              <p className="text-sm text-gray-600">{trend}</p>
            </div>
            <Badge className={getTrendBadgeColor(trendDirection)}>
              {trendDirection === 'up' ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {trendPercentage.toFixed(1)}%
            </Badge>
          </div>

          {/* Chart */}
          <div className={`transition-all duration-300 ${isExpanded ? 'h-64' : 'h-32'}`}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="period" 
                  fontSize={12}
                  tick={{ fill: '#6B7280' }}
                  axisLine={false}
                />
                <YAxis 
                  fontSize={12}
                  tick={{ fill: '#6B7280' }}
                  axisLine={false}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                {showTrendLine && (
                  <Line
                    type="monotone"
                    dataKey="average"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#2563eb', strokeWidth: 2 }}
                    className="animate-fade-in"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Additional Stats in Expanded View */}
          {isExpanded && (
            <div className="grid grid-cols-3 gap-4 pt-4 border-t animate-fade-in">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600">Highest</div>
                <div className="text-lg font-semibold text-green-600">
                  {Math.max(...data.map(d => d.average))}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600">Average</div>
                <div className="text-lg font-semibold text-blue-600">
                  {Math.round(data.reduce((sum, d) => sum + d.average, 0) / data.length)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600">Lowest</div>
                <div className="text-lg font-semibold text-red-600">
                  {Math.min(...data.map(d => d.average))}%
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedPerformanceWidget;
