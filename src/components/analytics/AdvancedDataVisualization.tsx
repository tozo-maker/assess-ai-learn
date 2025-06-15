import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Target,
  Users,
  Brain,
  Zap,
  Filter,
  Download,
  Maximize2,
  RefreshCw
} from 'lucide-react';

export interface AnalyticsData {
  students: Array<{
    id: string;
    name: string;
    performance: number;
    engagement: number;
    progress: number;
    riskLevel: 'low' | 'medium' | 'high';
    subjects: Record<string, number>;
    timeline: Array<{
      date: string;
      score: number;
      engagement: number;
    }>;
  }>;
  classMetrics: {
    averagePerformance: number;
    engagementRate: number;
    completionRate: number;
    riskDistribution: Record<string, number>;
    subjectPerformance: Record<string, number>;
    trends: Array<{
      date: string;
      performance: number;
      engagement: number;
      prediction?: number;
    }>;
  };
  predictions: Array<{
    studentId: string;
    predictedScore: number;
    confidence: number;
    timeframe: string;
  }>;
}

interface AdvancedDataVisualizationProps {
  data: AnalyticsData;
  className?: string;
  onStudentSelect?: (studentId: string) => void;
  onExportData?: (format: 'csv' | 'pdf' | 'json') => void;
}

const COLORS = {
  primary: '#2563eb',
  secondary: '#7c3aed',
  success: '#059669',
  warning: '#d97706',
  danger: '#dc2626',
  info: '#0891b2',
  gray: '#6b7280'
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.success,
  COLORS.warning,
  COLORS.danger,
  COLORS.info
];

const AdvancedDataVisualization: React.FC<AdvancedDataVisualizationProps> = ({
  data,
  className = '',
  onStudentSelect,
  onExportData
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');
  const [showPredictions, setShowPredictions] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // Memoized calculations for performance
  const processedData = useMemo(() => {
    const { students, classMetrics } = data;

    // Performance distribution
    const performanceDistribution = students.reduce((acc, student) => {
      const range = Math.floor(student.performance / 10) * 10;
      const key = `${range}-${range + 9}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Risk analysis
    const riskAnalysis = students.reduce((acc, student) => {
      acc[student.riskLevel] = (acc[student.riskLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Subject comparison
    const subjectComparison = Object.keys(students[0]?.subjects || {}).map(subject => ({
      subject,
      average: students.reduce((sum, s) => sum + (s.subjects[subject] || 0), 0) / students.length,
      students: students.map(s => ({ name: s.name, score: s.subjects[subject] || 0 }))
    }));

    // Engagement vs Performance correlation
    const correlationData = students.map(student => ({
      name: student.name,
      performance: student.performance,
      engagement: student.engagement,
      progress: student.progress,
      riskLevel: student.riskLevel
    }));

    return {
      performanceDistribution: Object.entries(performanceDistribution).map(([range, count]) => ({
        range,
        count
      })),
      riskAnalysis: Object.entries(riskAnalysis).map(([level, count]) => ({
        level,
        count,
        percentage: (count / students.length) * 100
      })),
      subjectComparison,
      correlationData
    };
  }, [data]);

  // Performance trend chart with predictions
  const PerformanceTrendChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={data.classMetrics.trends}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="date" 
          stroke="#6b7280"
          fontSize={12}
        />
        <YAxis stroke="#6b7280" fontSize={12} />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Legend />
        
        {chartType === 'area' && (
          <>
            <Area
              type="monotone"
              dataKey="performance"
              stackId="1"
              stroke={COLORS.primary}
              fill={COLORS.primary}
              fillOpacity={0.6}
              name="Performance"
            />
            <Area
              type="monotone"
              dataKey="engagement"
              stackId="1"
              stroke={COLORS.secondary}
              fill={COLORS.secondary}
              fillOpacity={0.6}
              name="Engagement"
            />
          </>
        )}
        
        {chartType === 'line' && (
          <>
            <Line
              type="monotone"
              dataKey="performance"
              stroke={COLORS.primary}
              strokeWidth={3}
              dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
              name="Performance"
            />
            <Line
              type="monotone"
              dataKey="engagement"
              stroke={COLORS.secondary}
              strokeWidth={3}
              dot={{ fill: COLORS.secondary, strokeWidth: 2, r: 4 }}
              name="Engagement"
            />
          </>
        )}
        
        {chartType === 'bar' && (
          <>
            <Bar dataKey="performance" fill={COLORS.primary} name="Performance" />
            <Bar dataKey="engagement" fill={COLORS.secondary} name="Engagement" />
          </>
        )}
        
        {showPredictions && (
          <Line
            type="monotone"
            dataKey="prediction"
            stroke={COLORS.warning}
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: COLORS.warning, strokeWidth: 2, r: 3 }}
            name="Predicted"
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );

  // Student performance comparison
  const StudentComparisonChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data.students.slice(0, 10)}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="name" 
          stroke="#6b7280"
          fontSize={12}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis stroke="#6b7280" fontSize={12} />
        <Tooltip />
        <Legend />
        <Bar dataKey="performance" fill={COLORS.primary} name="Performance" />
        <Bar dataKey="engagement" fill={COLORS.secondary} name="Engagement" />
        <Bar dataKey="progress" fill={COLORS.success} name="Progress" />
      </BarChart>
    </ResponsiveContainer>
  );

  // Risk distribution pie chart
  const RiskDistributionChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={processedData.riskAnalysis}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ level, percentage }) => `${level}: ${percentage.toFixed(1)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="count"
        >
          {processedData.riskAnalysis.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={
                entry.level === 'low' ? COLORS.success :
                entry.level === 'medium' ? COLORS.warning :
                COLORS.danger
              } 
            />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );

  // Subject performance radar chart
  const SubjectRadarChart = () => {
    const radarData = processedData.subjectComparison.map(subject => ({
      subject: subject.subject,
      score: subject.average,
      fullMark: 100
    }));

    return (
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={radarData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={90} domain={[0, 100]} />
          <Radar
            name="Average Score"
            dataKey="score"
            stroke={COLORS.primary}
            fill={COLORS.primary}
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    );
  };

  // Engagement vs Performance scatter plot
  const CorrelationChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart data={processedData.correlationData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          type="number" 
          dataKey="engagement" 
          name="Engagement"
          stroke="#6b7280"
          fontSize={12}
        />
        <YAxis 
          type="number" 
          dataKey="performance" 
          name="Performance"
          stroke="#6b7280"
          fontSize={12}
        />
        <Tooltip 
          cursor={{ strokeDasharray: '3 3' }}
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                  <p className="font-medium">{data.name}</p>
                  <p className="text-sm text-gray-600">
                    Performance: {data.performance}%
                  </p>
                  <p className="text-sm text-gray-600">
                    Engagement: {data.engagement}%
                  </p>
                  <Badge 
                    variant={
                      data.riskLevel === 'low' ? 'default' :
                      data.riskLevel === 'medium' ? 'secondary' :
                      'destructive'
                    }
                  >
                    {data.riskLevel} risk
                  </Badge>
                </div>
              );
            }
            return null;
          }}
        />
        <Scatter 
          dataKey="performance" 
          fill={COLORS.primary}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Advanced Learning Analytics
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExportData?.('csv')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Timeframe:</label>
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 days</SelectItem>
                  <SelectItem value="30d">30 days</SelectItem>
                  <SelectItem value="90d">90 days</SelectItem>
                  <SelectItem value="1y">1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Chart Type:</label>
              <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line</SelectItem>
                  <SelectItem value="bar">Bar</SelectItem>
                  <SelectItem value="area">Area</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={showPredictions ? "default" : "outline"}
                size="sm"
                onClick={() => setShowPredictions(!showPredictions)}
              >
                <Brain className="h-4 w-4 mr-2" />
                Predictions
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Class Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PerformanceTrendChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Risk Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RiskDistributionChart />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Subject Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SubjectRadarChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Student Performance Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StudentComparisonChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={processedData.performanceDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="range" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" fill={COLORS.primary} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Engagement vs Performance Correlation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CorrelationChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Performance Predictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.predictions.map((prediction, index) => {
                  const student = data.students.find(s => s.id === prediction.studentId);
                  return (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{student?.name}</h4>
                        <p className="text-sm text-gray-600">
                          Current: {student?.performance}% → Predicted: {prediction.predictedScore}%
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">
                          {prediction.confidence}% confidence
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {prediction.timeframe}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Subject-wise Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {processedData.subjectComparison.map((subject, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{subject.subject}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-primary mb-2">
                        {subject.average.toFixed(1)}%
                      </div>
                      <div className="space-y-1">
                        {subject.students.slice(0, 3).map((student, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{student.name}</span>
                            <span className="font-medium">{student.score}%</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedDataVisualization; 