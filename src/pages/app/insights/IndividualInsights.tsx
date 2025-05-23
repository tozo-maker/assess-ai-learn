
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageShell from '@/components/ui/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, TrendingUp, Target, AlertCircle } from 'lucide-react';
import PerformanceTimelineChart from '@/components/charts/PerformanceTimelineChart';
import SkillMasteryRadarChart from '@/components/charts/SkillMasteryRadarChart';
import GrowthTrendChart from '@/components/charts/GrowthTrendChart';
import { studentService } from '@/services/student-service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const IndividualInsights = () => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  // Fetch students list
  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getStudents,
  });

  // Mock data for selected student
  const performanceTimelineData = [
    { assessment_name: 'Math Quiz 1', score: 78, class_average: 75, date: '2024-01-15' },
    { assessment_name: 'Math Quiz 2', score: 82, class_average: 78, date: '2024-01-29' },
    { assessment_name: 'Math Test 1', score: 85, class_average: 80, date: '2024-02-12' },
    { assessment_name: 'Math Quiz 3', score: 88, class_average: 82, date: '2024-02-26' },
    { assessment_name: 'Math Test 2', score: 92, class_average: 84, date: '2024-03-12' },
  ];

  const skillMasteryData = [
    { skill: 'Number Sense', current_level: 92, target_level: 85, class_average: 79 },
    { skill: 'Fractions', current_level: 85, target_level: 90, class_average: 68 },
    { skill: 'Geometry', current_level: 88, target_level: 85, class_average: 82 },
    { skill: 'Measurement', current_level: 90, target_level: 85, class_average: 75 },
    { skill: 'Problem Solving', current_level: 87, target_level: 90, class_average: 77 },
    { skill: 'Data Analysis', current_level: 83, target_level: 85, class_average: 73 },
  ];

  const growthTrendData = [
    { period: 'Week 1', actual_score: 78, predicted_score: 78, target_score: 85, growth_rate: 0 },
    { period: 'Week 2', actual_score: 82, predicted_score: 80, target_score: 85, growth_rate: 5.1 },
    { period: 'Week 3', actual_score: 85, predicted_score: 82, target_score: 85, growth_rate: 3.7 },
    { period: 'Week 4', actual_score: 88, predicted_score: 84, target_score: 85, growth_rate: 3.5 },
    { period: 'Week 5', actual_score: 92, predicted_score: 86, target_score: 85, growth_rate: 4.5 },
    { period: 'Week 6', actual_score: null, predicted_score: 88, target_score: 85, growth_rate: null },
    { period: 'Week 7', actual_score: null, predicted_score: 90, target_score: 85, growth_rate: null },
  ];

  const selectedStudent = students?.find(s => s.id === selectedStudentId);
  const studentName = selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : '';

  const studentMetrics = {
    currentGPA: 3.8,
    classRank: 3,
    totalStudents: 25,
    growthRate: '+12.5%',
    strengthAreas: ['Number Sense', 'Geometry', 'Measurement'],
    growthAreas: ['Fractions', 'Problem Solving'],
    needsAttention: false,
    onTrackForGoals: true
  };

  const recentInsights = [
    {
      type: 'strength',
      title: 'Excellent progress in Number Sense',
      description: 'Consistently scoring above class average with 92% mastery',
      date: '2 days ago'
    },
    {
      type: 'improvement',
      title: 'Growth in problem-solving strategies',
      description: 'Shows improved systematic approach to multi-step problems',
      date: '1 week ago'
    },
    {
      type: 'attention',
      title: 'Focus needed on fraction operations',
      description: 'Struggles with unlike denominators, recommend additional practice',
      date: '1 week ago'
    }
  ];

  const recommendations = [
    {
      priority: 'High',
      area: 'Fractions',
      action: 'Provide manipulative-based fraction instruction',
      timeline: '2-3 weeks',
      resources: ['Fraction circles', 'Visual fraction apps', 'Peer tutoring']
    },
    {
      priority: 'Medium',
      area: 'Problem Solving',
      action: 'Practice breaking down complex word problems',
      timeline: '1-2 weeks',
      resources: ['Problem-solving templates', 'Step-by-step guides']
    }
  ];

  return (
    <PageShell 
      title="Individual Student Analysis" 
      description="Deep dive into individual student learning patterns and growth"
      icon={<User className="h-6 w-6 text-blue-600" />}
    >
      <div className="space-y-6">
        {/* Student Selection */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select a student" />
            </SelectTrigger>
            <SelectContent>
              {students?.map(student => (
                <SelectItem key={student.id} value={student.id}>
                  {student.first_name} {student.last_name} - Grade {student.grade_level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedStudentId ? (
          <>
            {/* Student Overview Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Current Performance</p>
                      <p className="text-3xl font-bold text-gray-900">{studentMetrics.currentGPA}</p>
                      <p className="text-sm text-green-600 flex items-center mt-1">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        {studentMetrics.growthRate} improvement
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Class Rank</p>
                      <p className="text-3xl font-bold text-gray-900">{studentMetrics.classRank}</p>
                      <p className="text-sm text-gray-500">
                        of {studentMetrics.totalStudents} students
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center">
                      <Target className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Strength Areas</p>
                      <p className="text-lg font-bold text-gray-900">{studentMetrics.strengthAreas.length}</p>
                      <p className="text-sm text-green-600">skills mastered</p>
                    </div>
                    <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                      <User className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Goal Progress</p>
                      <p className="text-lg font-bold text-green-600">On Track</p>
                      <p className="text-sm text-gray-500">meeting targets</p>
                    </div>
                    <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                      <Target className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Analysis Tabs */}
            <Tabs defaultValue="performance" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="performance">Performance Timeline</TabsTrigger>
                <TabsTrigger value="skills">Skills Mastery</TabsTrigger>
                <TabsTrigger value="growth">Growth Trends</TabsTrigger>
                <TabsTrigger value="insights">AI Insights</TabsTrigger>
                <TabsTrigger value="recommendations">Action Plan</TabsTrigger>
              </TabsList>

              <TabsContent value="performance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Timeline</CardTitle>
                    <CardDescription>
                      {studentName}'s assessment scores compared to class average over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PerformanceTimelineChart 
                      data={performanceTimelineData} 
                      studentName={studentName}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="skills" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Skills Mastery Analysis</CardTitle>
                    <CardDescription>
                      Current skill levels compared to targets and class averages
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SkillMasteryRadarChart 
                      data={skillMasteryData} 
                      studentName={studentName}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="growth" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Growth Trajectory & Predictions</CardTitle>
                    <CardDescription>
                      Actual progress with AI-predicted trends and target goals
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <GrowthTrendChart 
                      data={growthTrendData} 
                      studentName={studentName}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="insights" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent AI Insights</CardTitle>
                    <CardDescription>
                      Latest observations and patterns identified by our AI analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentInsights.map((insight, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${
                              insight.type === 'strength' ? 'bg-green-100' :
                              insight.type === 'improvement' ? 'bg-blue-100' :
                              'bg-yellow-100'
                            }`}>
                              {insight.type === 'strength' ? (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                              ) : insight.type === 'improvement' ? (
                                <Target className="h-4 w-4 text-blue-600" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-yellow-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{insight.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                              <p className="text-xs text-gray-500 mt-2">{insight.date}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Personalized Action Plan</CardTitle>
                    <CardDescription>
                      Targeted interventions and next steps for {studentName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {recommendations.map((rec, index) => (
                        <div key={index} className="border rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <h4 className="text-lg font-semibold">{rec.area}</h4>
                              <Badge variant={rec.priority === 'High' ? 'destructive' : 'secondary'}>
                                {rec.priority} Priority
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600">
                              Timeline: {rec.timeline}
                            </div>
                          </div>
                          
                          <p className="text-gray-700 mb-4">{rec.action}</p>
                          
                          <div>
                            <h5 className="font-medium mb-2">Recommended Resources:</h5>
                            <div className="flex flex-wrap gap-2">
                              {rec.resources.map((resource, resourceIndex) => (
                                <Badge key={resourceIndex} variant="outline">
                                  {resource}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div className="mt-4 flex space-x-2">
                            <Button size="sm">Start Intervention</Button>
                            <Button size="sm" variant="outline">Schedule Review</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a Student</h3>
              <p className="text-gray-600">Choose a student from the dropdown above to view their detailed learning analysis.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageShell>
  );
};

export default IndividualInsights;
