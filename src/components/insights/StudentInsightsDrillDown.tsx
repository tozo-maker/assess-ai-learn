
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Target, 
  BookOpen,
  Clock,
  Award,
  AlertTriangle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface StudentInsight {
  id: string;
  student_id: string;
  student_name: string;
  assessment_count: number;
  average_score: number;
  performance_trend: 'improving' | 'declining' | 'stable';
  strengths: string[];
  growth_areas: string[];
  recent_scores: Array<{
    date: string;
    score: number;
    assessment_title: string;
  }>;
  skill_mastery: Array<{
    skill_name: string;
    mastery_level: string;
    progress_percentage: number;
  }>;
  goals: Array<{
    title: string;
    status: string;
    progress: number;
  }>;
}

interface StudentInsightsDrillDownProps {
  insight: StudentInsight;
  onClose: () => void;
  onCreateGoal?: (studentId: string, goalData: any) => void;
}

const StudentInsightsDrillDown: React.FC<StudentInsightsDrillDownProps> = ({
  insight,
  onClose,
  onCreateGoal
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'declining':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getMasteryColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'advanced':
        return 'bg-green-100 text-green-800';
      case 'proficient':
        return 'bg-blue-100 text-blue-800';
      case 'developing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{insight.student_name} - Detailed Insights</h2>
            <p className="text-gray-600">Comprehensive performance analysis</p>
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Performance Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {insight.average_score}%
                      </div>
                      <div className="text-sm text-gray-600">Average Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800">
                        {insight.assessment_count}
                      </div>
                      <div className="text-sm text-gray-600">Assessments</div>
                    </div>
                    <div className="text-center">
                      <Badge className={`${getTrendColor(insight.performance_trend)} flex items-center gap-1 justify-center`}>
                        {getTrendIcon(insight.performance_trend)}
                        {insight.performance_trend}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Strengths and Growth Areas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <Award className="h-5 w-5" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {insight.strengths.map((strength, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm">{strength}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-600">
                      <AlertTriangle className="h-5 w-5" />
                      Growth Areas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {insight.growth_areas.map((area, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span className="text-sm">{area}</span>
                        </div>
                      ))}
                    </div>
                    {onCreateGoal && (
                      <Button 
                        size="sm" 
                        className="mt-3"
                        onClick={() => onCreateGoal(insight.student_id, { 
                          growth_areas: insight.growth_areas 
                        })}
                      >
                        <Target className="h-4 w-4 mr-2" />
                        Create Goal
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={insight.recent_scores}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#2563eb" 
                          strokeWidth={2}
                          dot={{ fill: '#2563eb' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Assessment Scores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insight.recent_scores.map((score, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{score.assessment_title}</div>
                          <div className="text-sm text-gray-600">{score.date}</div>
                        </div>
                        <Badge variant="outline" className="text-lg">
                          {score.score}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="skills" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Skill Mastery Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insight.skill_mastery.map((skill, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{skill.skill_name}</span>
                          <Badge className={getMasteryColor(skill.mastery_level)}>
                            {skill.mastery_level}
                          </Badge>
                        </div>
                        <Progress value={skill.progress_percentage} className="h-2" />
                        <div className="text-sm text-gray-600 text-right">
                          {skill.progress_percentage}% mastery
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="goals" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Learning Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insight.goals.map((goal, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{goal.title}</h4>
                          <Badge variant="outline">{goal.status}</Badge>
                        </div>
                        <Progress value={goal.progress} className="h-2" />
                        <div className="text-sm text-gray-600 mt-1">
                          {goal.progress}% complete
                        </div>
                      </div>
                    ))}
                    
                    {insight.goals.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Target className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p>No goals set yet</p>
                        {onCreateGoal && (
                          <Button 
                            className="mt-3"
                            onClick={() => onCreateGoal(insight.student_id, {})}
                          >
                            Create First Goal
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default StudentInsightsDrillDown;
