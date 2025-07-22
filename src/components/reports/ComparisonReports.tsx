
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter
} from 'recharts';
import { Users, TrendingUp, Award, Compare } from 'lucide-react';

interface ComparisonData {
  name: string;
  current_score: number;
  previous_score?: number;
  assessment_count: number;
  improvement: number;
  grade_level?: string;
  subject?: string;
  skills?: Record<string, number>;
}

interface ComparisonReportsProps {
  data: ComparisonData[];
  comparisonType: 'students' | 'classes' | 'periods';
  onComparisonTypeChange?: (type: 'students' | 'classes' | 'periods') => void;
  title?: string;
}

const ComparisonReports: React.FC<ComparisonReportsProps> = ({
  data,
  comparisonType,
  onComparisonTypeChange,
  title = "Performance Comparison"
}) => {
  const [sortBy, setSortBy] = useState<'current_score' | 'improvement' | 'assessment_count'>('current_score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedData = [...data].sort((a, b) => {
    const modifier = sortOrder === 'desc' ? -1 : 1;
    return (a[sortBy] - b[sortBy]) * modifier;
  });

  const getComparisonLabel = (type: string) => {
    switch (type) {
      case 'students': return 'Students';
      case 'classes': return 'Classes';
      case 'periods': return 'Time Periods';
      default: return type;
    }
  };

  const prepareRadarData = () => {
    if (!data[0]?.skills) return [];
    
    const skillNames = Object.keys(data[0].skills);
    return skillNames.map(skill => {
      const skillData: any = { skill };
      data.slice(0, 5).forEach((item, index) => {
        skillData[`item_${index}`] = item.skills?.[skill] || 0;
      });
      return skillData;
    });
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getImprovementBadge = (improvement: number) => {
    if (improvement > 5) return <Badge className="bg-green-100 text-green-700">Significant Improvement</Badge>;
    if (improvement > 0) return <Badge className="bg-blue-100 text-blue-700">Improving</Badge>;
    if (improvement === 0) return <Badge variant="secondary">Stable</Badge>;
    return <Badge variant="destructive">Needs Attention</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Compare className="h-6 w-6 mr-2" />
            {title}
          </h2>
          <p className="text-gray-600">
            Compare performance across {getComparisonLabel(comparisonType).toLowerCase()}
          </p>
        </div>
        
        <div className="flex gap-2">
          {onComparisonTypeChange && (
            <Select value={comparisonType} onValueChange={onComparisonTypeChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="students">Students</SelectItem>
                <SelectItem value="classes">Classes</SelectItem>
                <SelectItem value="periods">Time Periods</SelectItem>
              </SelectContent>
            </Select>
          )}
          
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current_score">Current Score</SelectItem>
              <SelectItem value="improvement">Improvement</SelectItem>
              <SelectItem value="assessment_count">Assessment Count</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          >
            {sortOrder === 'desc' ? '↓' : '↑'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed View</TabsTrigger>
          <TabsTrigger value="skills">Skills Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sortedData.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="current_score" fill="#3b82f6" name="Current Score" />
                      {sortedData[0]?.previous_score && (
                        <Bar dataKey="previous_score" fill="#93c5fd" name="Previous Score" />
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Improvement Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart data={sortedData}>
                      <CartesianGrid />
                      <XAxis 
                        type="number" 
                        dataKey="current_score" 
                        name="Current Score"
                        domain={[0, 100]}
                      />
                      <YAxis 
                        type="number" 
                        dataKey="improvement" 
                        name="Improvement"
                      />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                      <Scatter 
                        dataKey="assessment_count" 
                        fill="#3b82f6"
                        name="Assessments Taken"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="detailed">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Rank</th>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Current Score</th>
                      <th className="text-left p-2">Previous Score</th>
                      <th className="text-left p-2">Improvement</th>
                      <th className="text-left p-2">Assessments</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedData.map((item, index) => (
                      <tr key={item.name} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <div className="flex items-center">
                            <span className="font-bold mr-2">#{index + 1}</span>
                            {index < 3 && <Award className="h-4 w-4 text-yellow-500" />}
                          </div>
                        </td>
                        <td className="p-2 font-medium">{item.name}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded-full text-sm ${getPerformanceColor(item.current_score)}`}>
                            {item.current_score.toFixed(1)}%
                          </span>
                        </td>
                        <td className="p-2">
                          {item.previous_score ? `${item.previous_score.toFixed(1)}%` : 'N/A'}
                        </td>
                        <td className="p-2">
                          <div className="flex items-center">
                            <TrendingUp 
                              className={`h-4 w-4 mr-1 ${item.improvement > 0 ? 'text-green-500' : 'text-red-500'}`} 
                            />
                            {item.improvement > 0 ? '+' : ''}{item.improvement.toFixed(1)}%
                          </div>
                        </td>
                        <td className="p-2">{item.assessment_count}</td>
                        <td className="p-2">
                          {getImprovementBadge(item.improvement)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills">
          {data[0]?.skills ? (
            <Card>
              <CardHeader>
                <CardTitle>Skills Comparison</CardTitle>
                <p className="text-sm text-gray-600">
                  Compare performance across different skills for top performers
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={prepareRadarData()}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="skill" />
                      <PolarRadiusAxis angle={60} domain={[0, 100]} />
                      {data.slice(0, 3).map((item, index) => (
                        <Radar
                          key={item.name}
                          name={item.name}
                          dataKey={`item_${index}`}
                          stroke={['#3b82f6', '#ef4444', '#10b981'][index]}
                          fill={['#3b82f6', '#ef4444', '#10b981'][index]}
                          fillOpacity={0.1}
                        />
                      ))}
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Skills data not available for comparison</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComparisonReports;
