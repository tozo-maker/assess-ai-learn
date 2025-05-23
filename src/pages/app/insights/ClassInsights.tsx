
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageShell from '@/components/ui/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, TrendingUp, AlertCircle, BookOpen } from 'lucide-react';
import ClassPerformanceHeatmap from '@/components/charts/ClassPerformanceHeatmap';
import AssessmentDistributionChart from '@/components/charts/AssessmentDistributionChart';
import { Badge } from '@/components/ui/badge';

const ClassInsights = () => {
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('current_quarter');

  // Mock data - in real implementation, this would come from the API
  const classPerformanceData = [
    {
      skill: 'Number Sense',
      students: [
        { student_name: 'Emma S.', score: 92, mastery_level: 'Advanced' as const },
        { student_name: 'John D.', score: 78, mastery_level: 'Proficient' as const },
        { student_name: 'Sarah M.', score: 65, mastery_level: 'Basic' as const },
        { student_name: 'Alex K.', score: 88, mastery_level: 'Proficient' as const },
        { student_name: 'Maria L.', score: 94, mastery_level: 'Advanced' as const },
      ]
    },
    {
      skill: 'Fractions',
      students: [
        { student_name: 'Emma S.', score: 85, mastery_level: 'Proficient' as const },
        { student_name: 'John D.', score: 62, mastery_level: 'Basic' as const },
        { student_name: 'Sarah M.', score: 58, mastery_level: 'Below Basic' as const },
        { student_name: 'Alex K.', score: 76, mastery_level: 'Proficient' as const },
        { student_name: 'Maria L.', score: 91, mastery_level: 'Advanced' as const },
      ]
    },
    {
      skill: 'Geometry',
      students: [
        { student_name: 'Emma S.', score: 88, mastery_level: 'Proficient' as const },
        { student_name: 'John D.', score: 82, mastery_level: 'Proficient' as const },
        { student_name: 'Sarah M.', score: 71, mastery_level: 'Basic' as const },
        { student_name: 'Alex K.', score: 95, mastery_level: 'Advanced' as const },
        { student_name: 'Maria L.', score: 89, mastery_level: 'Proficient' as const },
      ]
    }
  ];

  const distributionData = [
    { range: '90-100%', count: 8, percentage: 32 },
    { range: '80-89%', count: 7, percentage: 28 },
    { range: '70-79%', count: 6, percentage: 24 },
    { range: '60-69%', count: 3, percentage: 12 },
    { range: '<60%', count: 1, percentage: 4 },
  ];

  const classMetrics = {
    totalStudents: 25,
    classAverage: 82.5,
    studentsAboveGrade: 18,
    studentsNeedingSupport: 4,
    topPerformingSkill: 'Geometry',
    strugglingSkill: 'Fractions',
    improvementTrend: '+5.2%'
  };

  const learningGaps = [
    {
      skill: 'Fraction Operations',
      studentsAffected: 8,
      severity: 'High',
      description: '32% of students struggle with adding/subtracting fractions with unlike denominators'
    },
    {
      skill: 'Word Problems',
      studentsAffected: 6,
      severity: 'Medium',
      description: '24% of students have difficulty translating word problems into mathematical expressions'
    },
    {
      skill: 'Decimal Place Value',
      studentsAffected: 4,
      severity: 'Medium',
      description: '16% of students confuse decimal place values beyond hundredths'
    }
  ];

  return (
    <PageShell 
      title="Class Analytics & Insights" 
      description="Comprehensive analysis of class-wide performance patterns and trends"
      icon={<Users className="h-6 w-6 text-blue-600" />}
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              <SelectItem value="math">Mathematics</SelectItem>
              <SelectItem value="reading">Reading</SelectItem>
              <SelectItem value="science">Science</SelectItem>
              <SelectItem value="social_studies">Social Studies</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current_quarter">Current Quarter</SelectItem>
              <SelectItem value="semester">This Semester</SelectItem>
              <SelectItem value="year">School Year</SelectItem>
              <SelectItem value="last_30_days">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Class Average</p>
                  <p className="text-3xl font-bold text-gray-900">{classMetrics.classAverage}%</p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {classMetrics.improvementTrend} from last quarter
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
                  <p className="text-sm font-medium text-gray-600">Above Grade Level</p>
                  <p className="text-3xl font-bold text-gray-900">{classMetrics.studentsAboveGrade}</p>
                  <p className="text-sm text-gray-500">
                    {Math.round((classMetrics.studentsAboveGrade / classMetrics.totalStudents) * 100)}% of class
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Need Support</p>
                  <p className="text-3xl font-bold text-red-600">{classMetrics.studentsNeedingSupport}</p>
                  <p className="text-sm text-gray-500">
                    {Math.round((classMetrics.studentsNeedingSupport / classMetrics.totalStudents) * 100)}% of class
                  </p>
                </div>
                <div className="h-12 w-12 bg-red-50 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Strongest Skill</p>
                  <p className="text-lg font-bold text-gray-900">{classMetrics.topPerformingSkill}</p>
                  <p className="text-sm text-green-600">Class excelling</p>
                </div>
                <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="heatmap" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="heatmap">Performance Heat Map</TabsTrigger>
            <TabsTrigger value="distribution">Score Distribution</TabsTrigger>
            <TabsTrigger value="gaps">Learning Gaps</TabsTrigger>
            <TabsTrigger value="trends">Trends & Patterns</TabsTrigger>
          </TabsList>

          <TabsContent value="heatmap" className="space-y-6">
            <ClassPerformanceHeatmap data={classPerformanceData} />
          </TabsContent>

          <TabsContent value="distribution" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assessment Score Distribution</CardTitle>
                <CardDescription>
                  Distribution of student scores across recent assessments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AssessmentDistributionChart 
                  data={distributionData} 
                  title="Current Quarter Scores"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gaps" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Learning Gaps Analysis</CardTitle>
                <CardDescription>
                  Identified areas where multiple students need additional support
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {learningGaps.map((gap, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{gap.skill}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant={gap.severity === 'High' ? 'destructive' : 'secondary'}>
                            {gap.severity} Priority
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {gap.studentsAffected} students affected
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700">{gap.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>
                  Class-wide performance patterns over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-gray-500">
                  Trend analysis charts will be implemented here showing class progress over multiple assessment periods.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageShell>
  );
};

export default ClassInsights;
