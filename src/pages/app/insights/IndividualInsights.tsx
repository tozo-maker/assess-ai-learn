
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, TrendingUp, Target, AlertCircle, Calendar, BookOpen, ArrowUp } from 'lucide-react';

// Layout Components
import AppLayout from '@/components/layout/AppLayout';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

// Design System Components
import {
  DSPageContainer,
  DSSection,
  DSCard,
  DSCardHeader,
  DSCardContent,
  DSCardTitle,
  DSCardDescription,
  DSButton,
  DSFlexContainer,
  DSContentGrid,
  DSGridItem,
  DSSpacer,
  DSPageTitle,
  DSBodyText
} from '@/components/ui/design-system';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PerformanceTimelineChart from '@/components/charts/PerformanceTimelineChart';
import SkillMasteryRadarChart from '@/components/charts/SkillMasteryRadarChart';
import GrowthTrendChart from '@/components/charts/GrowthTrendChart';
import { studentService } from '@/services/student-service';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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
    <AppLayout>
      <DSSection>
        <DSPageContainer>
          <Breadcrumbs />
          
          {/* Page Header */}
          <DSCard className="mb-8">
            <DSCardHeader>
              <DSFlexContainer justify="between" align="center" className="flex-col md:flex-row gap-4">
                <div>
                  <DSPageTitle className="text-3xl font-bold text-gray-900 mb-2">
                    Individual Student Analysis
                  </DSPageTitle>
                  <DSBodyText className="text-gray-600">
                    Deep dive into individual student learning patterns and growth
                  </DSBodyText>
                </div>
              </DSFlexContainer>
            </DSCardHeader>
          </DSCard>

          {/* Student Selector - Searchable dropdown with consistent styling */}
          <DSCard className="mb-6">
            <DSCardContent className="p-6">
              <DSFlexContainer gap="md" className="flex-col sm:flex-row">
                <div className="flex-1">
                  <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                    <SelectTrigger className="w-full sm:w-64">
                      <SelectValue placeholder="Select a student to analyze" />
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
                
                {/* Selected student card with avatar */}
                {selectedStudent && (
                  <DSCard className="bg-blue-50 border-blue-200">
                    <DSCardContent className="p-4">
                      <DSFlexContainer align="center" gap="md">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-[#2563eb] text-white">
                            {selectedStudent.first_name.charAt(0)}{selectedStudent.last_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <DSCardTitle className="text-base font-semibold text-gray-900">
                            {selectedStudent.first_name} {selectedStudent.last_name}
                          </DSCardTitle>
                          <DSBodyText className="text-sm text-gray-600">
                            Grade {selectedStudent.grade_level} • Class Rank: {studentMetrics.classRank}
                          </DSBodyText>
                        </div>
                      </DSFlexContainer>
                    </DSCardContent>
                  </DSCard>
                )}
              </DSFlexContainer>
            </DSCardContent>
          </DSCard>

          {selectedStudentId ? (
            <>
              {/* Student Overview Metrics - Quick stats inline */}
              <DSContentGrid cols={4} className="mb-8">
                <DSGridItem span={1}>
                  <DSCard className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <DSCardContent className="p-6">
                      <DSFlexContainer justify="between" align="center">
                        <div>
                          <DSBodyText className="text-sm text-gray-500 mb-1">Current Performance</DSBodyText>
                          <div className="text-2xl font-bold text-gray-900 mb-2">{studentMetrics.currentGPA}</div>
                          <DSFlexContainer align="center" gap="xs">
                            <ArrowUp className="h-4 w-4 text-[#10b981]" />
                            <DSBodyText className="text-sm text-[#10b981]">{studentMetrics.growthRate} improvement</DSBodyText>
                          </DSFlexContainer>
                        </div>
                        <div className="w-12 h-12 bg-[#2563eb] bg-opacity-10 rounded-lg flex items-center justify-center">
                          <TrendingUp className="h-6 w-6 text-[#2563eb]" />
                        </div>
                      </DSFlexContainer>
                    </DSCardContent>
                  </DSCard>
                </DSGridItem>

                <DSGridItem span={1}>
                  <DSCard className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <DSCardContent className="p-6">
                      <DSFlexContainer justify="between" align="center">
                        <div>
                          <DSBodyText className="text-sm text-gray-500 mb-1">Class Rank</DSBodyText>
                          <div className="text-2xl font-bold text-gray-900 mb-2">{studentMetrics.classRank}</div>
                          <DSBodyText className="text-sm text-gray-600">
                            of {studentMetrics.totalStudents} students
                          </DSBodyText>
                        </div>
                        <div className="w-12 h-12 bg-purple-600 bg-opacity-10 rounded-lg flex items-center justify-center">
                          <Target className="h-6 w-6 text-purple-600" />
                        </div>
                      </DSFlexContainer>
                    </DSCardContent>
                  </DSCard>
                </DSGridItem>

                <DSGridItem span={1}>
                  <DSCard className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <DSCardContent className="p-6">
                      <DSFlexContainer justify="between" align="center">
                        <div>
                          <DSBodyText className="text-sm text-gray-500 mb-1">Strength Areas</DSBodyText>
                          <div className="text-2xl font-bold text-gray-900 mb-2">{studentMetrics.strengthAreas.length}</div>
                          <DSBodyText className="text-sm text-[#10b981]">skills mastered</DSBodyText>
                        </div>
                        <div className="w-12 h-12 bg-[#10b981] bg-opacity-10 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-[#10b981]" />
                        </div>
                      </DSFlexContainer>
                    </DSCardContent>
                  </DSCard>
                </DSGridItem>

                <DSGridItem span={1}>
                  <DSCard className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
                    <DSCardContent className="p-6">
                      <DSFlexContainer justify="between" align="center">
                        <div>
                          <DSBodyText className="text-sm text-gray-500 mb-1">Goal Progress</DSBodyText>
                          <div className="text-lg font-bold text-[#10b981] mb-2">On Track</div>
                          <DSBodyText className="text-sm text-gray-600">meeting targets</DSBodyText>
                        </div>
                        <div className="w-12 h-12 bg-[#f59e0b] bg-opacity-10 rounded-lg flex items-center justify-center">
                          <Target className="h-6 w-6 text-[#f59e0b]" />
                        </div>
                      </DSFlexContainer>
                    </DSCardContent>
                  </DSCard>
                </DSGridItem>
              </DSContentGrid>

              <DSSpacer size="lg" />

              {/* Main Analysis Tabs - Progress Visualizations */}
              <Tabs defaultValue="performance" className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="performance">Performance Timeline</TabsTrigger>
                  <TabsTrigger value="skills">Skills Mastery</TabsTrigger>
                  <TabsTrigger value="growth">Growth Trends</TabsTrigger>
                  <TabsTrigger value="insights">AI Insights</TabsTrigger>
                  <TabsTrigger value="recommendations">Action Plan</TabsTrigger>
                </TabsList>

                <TabsContent value="performance" className="space-y-6">
                  <DSCard>
                    <DSCardHeader>
                      <DSCardTitle className="text-lg font-semibold text-gray-900">Performance Timeline</DSCardTitle>
                      <DSCardDescription className="text-sm text-gray-600">
                        {studentName}'s assessment scores compared to class average over time
                      </DSCardDescription>
                    </DSCardHeader>
                    <DSCardContent>
                      {/* Timeline with primary color markers */}
                      <PerformanceTimelineChart 
                        data={performanceTimelineData} 
                        studentName={studentName}
                      />
                    </DSCardContent>
                  </DSCard>
                </TabsContent>

                <TabsContent value="skills" className="space-y-6">
                  <DSCard>
                    <DSCardHeader>
                      <DSCardTitle className="text-lg font-semibold text-gray-900">Skills Mastery Analysis</DSCardTitle>
                      <DSCardDescription className="text-sm text-gray-600">
                        Current skill levels compared to targets and class averages
                      </DSCardDescription>
                    </DSCardHeader>
                    <DSCardContent>
                      {/* Skill radar using color palette */}
                      <SkillMasteryRadarChart 
                        data={skillMasteryData} 
                        studentName={studentName}
                      />
                    </DSCardContent>
                  </DSCard>
                </TabsContent>

                <TabsContent value="growth" className="space-y-6">
                  <DSCard>
                    <DSCardHeader>
                      <DSCardTitle className="text-lg font-semibold text-gray-900">Growth Trajectory & Predictions</DSCardTitle>
                      <DSCardDescription className="text-sm text-gray-600">
                        Actual progress with AI-predicted trends and target goals
                      </DSCardDescription>
                    </DSCardHeader>
                    <DSCardContent>
                      {/* Progress bars with semantic colors */}
                      <GrowthTrendChart 
                        data={growthTrendData} 
                        studentName={studentName}
                      />
                    </DSCardContent>
                  </DSCard>
                </TabsContent>

                <TabsContent value="insights" className="space-y-6">
                  <DSCard>
                    <DSCardHeader>
                      <DSCardTitle className="text-lg font-semibold text-gray-900">Recent AI Insights</DSCardTitle>
                      <DSCardDescription className="text-sm text-gray-600">
                        Latest observations and patterns identified by our AI analysis
                      </DSCardDescription>
                    </DSCardHeader>
                    <DSCardContent>
                      <div className="space-y-4">
                        {recentInsights.map((insight, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <DSFlexContainer align="start" gap="md">
                              <div className={`p-2 rounded-lg ${
                                insight.type === 'strength' ? 'bg-green-100' :
                                insight.type === 'improvement' ? 'bg-blue-100' :
                                'bg-yellow-100'
                              }`}>
                                {insight.type === 'strength' ? (
                                  <TrendingUp className="h-4 w-4 text-[#10b981]" />
                                ) : insight.type === 'improvement' ? (
                                  <Target className="h-4 w-4 text-[#2563eb]" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 text-[#f59e0b]" />
                                )}
                              </div>
                              <div className="flex-1">
                                <DSCardTitle className="text-base font-medium text-gray-900 mb-1">{insight.title}</DSCardTitle>
                                <DSBodyText className="text-sm text-gray-600 mb-2">{insight.description}</DSBodyText>
                                <DSFlexContainer align="center" gap="xs">
                                  <Calendar className="h-3 w-3 text-gray-400" />
                                  <DSBodyText className="text-xs text-gray-500">{insight.date}</DSBodyText>
                                </DSFlexContainer>
                              </div>
                            </DSFlexContainer>
                          </div>
                        ))}
                      </div>
                    </DSCardContent>
                  </DSCard>
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-6">
                  <DSCard>
                    <DSCardHeader>
                      <DSCardTitle className="text-lg font-semibold text-gray-900">Personalized Action Plan</DSCardTitle>
                      <DSCardDescription className="text-sm text-gray-600">
                        Targeted interventions and next steps for {studentName}
                      </DSCardDescription>
                    </DSCardHeader>
                    <DSCardContent>
                      <div className="space-y-6">
                        {recommendations.map((rec, index) => (
                          <div key={index} className="border rounded-lg p-6">
                            <DSFlexContainer justify="between" align="center" className="mb-4">
                              <DSFlexContainer align="center" gap="md">
                                <DSCardTitle className="text-lg font-semibold text-gray-900">{rec.area}</DSCardTitle>
                                <Badge variant={rec.priority === 'High' ? 'destructive' : 'secondary'}>
                                  {rec.priority} Priority
                                </Badge>
                              </DSFlexContainer>
                              <div className="text-sm text-gray-600">
                                Timeline: {rec.timeline}
                              </div>
                            </DSFlexContainer>
                            
                            <DSBodyText className="text-gray-700 mb-4">{rec.action}</DSBodyText>
                            
                            <div>
                              <DSCardTitle className="text-sm font-medium text-gray-900 mb-2">Recommended Resources:</DSCardTitle>
                              <DSFlexContainer gap="sm" className="flex-wrap">
                                {rec.resources.map((resource, resourceIndex) => (
                                  <Badge key={resourceIndex} variant="outline">
                                    {resource}
                                  </Badge>
                                ))}
                              </DSFlexContainer>
                            </div>
                            
                            <DSFlexContainer gap="sm" className="mt-4">
                              <DSButton size="sm">Start Intervention</DSButton>
                              <DSButton size="sm" variant="secondary">Schedule Review</DSButton>
                            </DSFlexContainer>
                          </div>
                        ))}
                      </div>
                    </DSCardContent>
                  </DSCard>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <DSCard>
              <DSCardContent className="p-8 text-center">
                <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <DSCardTitle className="text-lg font-semibold text-gray-900 mb-2">Select a Student</DSCardTitle>
                <DSBodyText className="text-gray-600">
                  Choose a student from the dropdown above to view their detailed learning analysis.
                </DSBodyText>
              </DSCardContent>
            </DSCard>
          )}
        </DSPageContainer>
      </DSSection>
    </AppLayout>
  );
};

export default IndividualInsights;
