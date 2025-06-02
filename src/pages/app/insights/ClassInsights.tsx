
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, TrendingUp, AlertCircle, BookOpen, ArrowUp, ArrowDown } from 'lucide-react';

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
import ClassPerformanceHeatmap from '@/components/charts/ClassPerformanceHeatmap';
import AssessmentDistributionChart from '@/components/charts/AssessmentDistributionChart';
import { Badge } from '@/components/ui/badge';
import { studentService } from '@/services/student-service';
import { assessmentService } from '@/services/assessment-service';

const ClassInsights = () => {
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('current_quarter');

  // Fetch students data
  const { data: students, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentService.getStudents(),
  });

  // Fetch assessments data
  const { data: assessments, isLoading: isLoadingAssessments } = useQuery({
    queryKey: ['assessments'],
    queryFn: () => assessmentService.getAssessments(),
  });

  // Fetch all student responses
  const { data: allResponses, isLoading: isLoadingResponses } = useQuery({
    queryKey: ['allStudentResponses', assessments],
    queryFn: async () => {
      if (!assessments || assessments.length === 0) return [];
      
      const responsesPromises = assessments.map(assessment =>
        assessmentService.getStudentResponses(assessment.id)
      );
      
      const responsesArrays = await Promise.all(responsesPromises);
      return responsesArrays.flat();
    },
    enabled: !!assessments && assessments.length > 0,
  });

  // Fetch assessment analyses
  const { data: allAnalyses, isLoading: isLoadingAnalyses } = useQuery({
    queryKey: ['allAnalyses', assessments, students],
    queryFn: async () => {
      if (!assessments || !students || assessments.length === 0 || students.length === 0) return [];
      
      const analysesPromises = [];
      for (const assessment of assessments) {
        for (const student of students) {
          analysesPromises.push(
            assessmentService.getAssessmentAnalysis(assessment.id, student.id)
          );
        }
      }
      
      const analyses = await Promise.all(analysesPromises);
      return analyses.filter(analysis => analysis !== null);
    },
    enabled: !!assessments && !!students && assessments.length > 0 && students.length > 0,
  });

  const isLoading = isLoadingStudents || isLoadingAssessments || isLoadingResponses || isLoadingAnalyses;

  // Filter data based on selected filters
  const filteredAssessments = assessments?.filter(assessment => {
    if (selectedSubject !== 'all' && assessment.subject !== selectedSubject) return false;
    
    if (selectedPeriod !== 'current_quarter' && assessment.assessment_date) {
      const assessmentDate = new Date(assessment.assessment_date);
      const now = new Date();
      
      switch (selectedPeriod) {
        case 'last_30_days':
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return assessmentDate >= thirtyDaysAgo;
        case 'semester':
          const semesterStart = new Date(now.getFullYear(), now.getMonth() >= 6 ? 6 : 0, 1);
          return assessmentDate >= semesterStart;
        case 'year':
          const yearStart = new Date(now.getFullYear(), 0, 1);
          return assessmentDate >= yearStart;
        default:
          return true;
      }
    }
    
    return true;
  }) || [];

  // Filter responses based on filtered assessments
  const filteredResponses = allResponses?.filter(response =>
    filteredAssessments.some(assessment => assessment.id === response.assessment_id)
  ) || [];

  // Calculate class metrics from real data
  const calculateClassMetrics = () => {
    if (!students || !filteredAssessments || !filteredResponses) {
      return {
        totalStudents: 0,
        classAverage: 0,
        studentsAboveGrade: 0,
        studentsNeedingSupport: 0,
        topPerformingSkill: 'N/A',
        strugglingSkill: 'N/A',
        improvementTrend: 0
      };
    }

    const totalStudents = students.length;
    
    // Calculate average score from responses
    const scores = filteredResponses.map(response => {
      const assessment = filteredAssessments.find(a => a.id === response.assessment_id);
      return assessment ? (response.score / assessment.max_score) * 100 : 0;
    });
    
    const classAverage = scores.length > 0 ? 
      Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length * 100) / 100 : 0;

    // Count students above grade level (assuming 80% is grade level)
    const studentScores = new Map();
    filteredResponses.forEach(response => {
      const assessment = filteredAssessments.find(a => a.id === response.assessment_id);
      if (assessment) {
        const percentage = (response.score / assessment.max_score) * 100;
        if (!studentScores.has(response.student_id)) {
          studentScores.set(response.student_id, []);
        }
        studentScores.get(response.student_id).push(percentage);
      }
    });

    const studentsAboveGrade = Array.from(studentScores.values())
      .filter(scores => scores.reduce((sum, score) => sum + score, 0) / scores.length >= 80).length;

    const studentsNeedingSupport = Array.from(studentScores.values())
      .filter(scores => scores.reduce((sum, score) => sum + score, 0) / scores.length < 70).length;

    // Get top performing and struggling subjects
    const subjectPerformance = new Map();
    filteredResponses.forEach(response => {
      const assessment = filteredAssessments.find(a => a.id === response.assessment_id);
      if (assessment) {
        const percentage = (response.score / assessment.max_score) * 100;
        if (!subjectPerformance.has(assessment.subject)) {
          subjectPerformance.set(assessment.subject, []);
        }
        subjectPerformance.get(assessment.subject).push(percentage);
      }
    });

    const subjectAverages = Array.from(subjectPerformance.entries()).map(([subject, scores]) => ({
      subject,
      average: scores.reduce((sum, score) => sum + score, 0) / scores.length
    }));

    const topPerformingSkill = subjectAverages.length > 0 ? 
      subjectAverages.reduce((max, current) => current.average > max.average ? current : max).subject : 'N/A';
    
    const strugglingSkill = subjectAverages.length > 0 ? 
      subjectAverages.reduce((min, current) => current.average < min.average ? current : min).subject : 'N/A';

    return {
      totalStudents,
      classAverage,
      studentsAboveGrade,
      studentsNeedingSupport,
      topPerformingSkill,
      strugglingSkill,
      improvementTrend: 5.2 // Mock trend data
    };
  };

  const classMetrics = calculateClassMetrics();

  // Generate performance heatmap data
  const generateHeatmapData = () => {
    if (!students || !filteredAssessments || !filteredResponses) return [];

    // Group by subject to create skills
    const subjects = [...new Set(filteredAssessments.map(a => a.subject))];
    
    return subjects.map(subject => {
      const subjectAssessments = filteredAssessments.filter(a => a.subject === subject);
      const subjectResponses = filteredResponses.filter(r => 
        subjectAssessments.some(a => a.id === r.assessment_id)
      );

      const studentData = students.map(student => {
        const studentResponses = subjectResponses.filter(r => r.student_id === student.id);
        const scores = studentResponses.map(response => {
          const assessment = subjectAssessments.find(a => a.id === response.assessment_id);
          return assessment ? (response.score / assessment.max_score) * 100 : 0;
        });
        
        const avgScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
        
        let masteryLevel: 'Advanced' | 'Proficient' | 'Basic' | 'Below Basic';
        if (avgScore >= 90) masteryLevel = 'Advanced';
        else if (avgScore >= 80) masteryLevel = 'Proficient';
        else if (avgScore >= 70) masteryLevel = 'Basic';
        else masteryLevel = 'Below Basic';

        return {
          student_name: `${student.first_name} ${student.last_name.charAt(0)}.`,
          score: Math.round(avgScore),
          mastery_level: masteryLevel
        };
      });

      return {
        skill: subject,
        students: studentData
      };
    });
  };

  // Generate distribution data
  const generateDistributionData = () => {
    if (!filteredResponses || !filteredAssessments) return [];

    const scores = filteredResponses.map(response => {
      const assessment = filteredAssessments.find(a => a.id === response.assessment_id);
      return assessment ? (response.score / assessment.max_score) * 100 : 0;
    });

    const ranges = [
      { range: '90-100%', min: 90, max: 100 },
      { range: '80-89%', min: 80, max: 89 },
      { range: '70-79%', min: 70, max: 79 },
      { range: '60-69%', min: 60, max: 69 },
      { range: '<60%', min: 0, max: 59 }
    ];

    return ranges.map(({ range, min, max }) => {
      const count = scores.filter(score => score >= min && score <= max).length;
      const percentage = scores.length > 0 ? Math.round((count / scores.length) * 100) : 0;
      return { range, count, percentage };
    });
  };

  // Generate learning gaps from analyses
  const generateLearningGaps = () => {
    if (!allAnalyses || allAnalyses.length === 0) return [];

    const allGrowthAreas = allAnalyses.flatMap(analysis => analysis.growth_areas || []);
    const growthAreaCounts = new Map();
    
    allGrowthAreas.forEach(area => {
      growthAreaCounts.set(area, (growthAreaCounts.get(area) || 0) + 1);
    });

    return Array.from(growthAreaCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([skill, count]) => ({
        skill,
        studentsAffected: count,
        severity: count > 5 ? 'High' : count > 2 ? 'Medium' : 'Low',
        description: `${count} student${count > 1 ? 's' : ''} need${count === 1 ? 's' : ''} support with ${skill.toLowerCase()}`
      }));
  };

  const classPerformanceData = generateHeatmapData();
  const distributionData = generateDistributionData();
  const learningGaps = generateLearningGaps();

  // Show loading state
  if (isLoading) {
    return (
      <AppLayout>
        <DSSection>
          <DSPageContainer>
            <Breadcrumbs />
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563eb] mx-auto"></div>
                <DSBodyText className="mt-2 text-gray-600">Loading analytics...</DSBodyText>
              </div>
            </div>
          </DSPageContainer>
        </DSSection>
      </AppLayout>
    );
  }

  // Show empty state if no data
  if (!students || students.length === 0 || !assessments || assessments.length === 0) {
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
                      Class Analytics & Insights
                    </DSPageTitle>
                    <DSBodyText className="text-gray-600">
                      Comprehensive analysis of class-wide performance patterns and trends
                    </DSBodyText>
                  </div>
                </DSFlexContainer>
              </DSCardHeader>
            </DSCard>

            <DSCard>
              <DSCardContent className="p-8 text-center">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <DSCardTitle className="text-lg font-semibold text-gray-900 mb-2">No Data Available</DSCardTitle>
                <DSBodyText className="text-gray-600 mb-6">
                  To view class insights, you need to add students and assessments first.
                </DSBodyText>
                <DSFlexContainer justify="center" gap="md">
                  <DSButton onClick={() => window.location.href = '/app/students/add'}>
                    Add Students
                  </DSButton>
                  <DSButton variant="secondary" onClick={() => window.location.href = '/app/assessments/add'}>
                    Add Assessment
                  </DSButton>
                </DSFlexContainer>
              </DSCardContent>
            </DSCard>
          </DSPageContainer>
        </DSSection>
      </AppLayout>
    );
  }

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
                    Class Analytics & Insights
                  </DSPageTitle>
                  <DSBodyText className="text-gray-600">
                    Comprehensive analysis of class-wide performance patterns and trends
                  </DSBodyText>
                </div>
              </DSFlexContainer>
            </DSCardHeader>
          </DSCard>

          {/* Filters */}
          <DSCard className="mb-6">
            <DSCardContent className="p-6">
              <DSFlexContainer gap="md" className="flex-col sm:flex-row">
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {[...new Set(assessments?.map(a => a.subject) || [])].map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
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
              </DSFlexContainer>
            </DSCardContent>
          </DSCard>

          {/* Metric Dashboard - Top row: 4 metric cards with consistent styling */}
          <DSContentGrid cols={4} className="mb-8">
            <DSGridItem span={1}>
              <DSCard className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <DSCardContent className="p-6">
                  <DSFlexContainer justify="between" align="center">
                    <div>
                      <DSBodyText className="text-sm text-gray-500 mb-1">Class Average</DSBodyText>
                      <div className="text-2xl font-bold text-gray-900 mb-2">{classMetrics.classAverage}%</div>
                      <DSFlexContainer align="center" gap="xs">
                        <ArrowUp className="h-4 w-4 text-[#10b981]" />
                        <DSBodyText className="text-sm text-[#10b981]">
                          +{classMetrics.improvementTrend}% from last quarter
                        </DSBodyText>
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
              <DSCard className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <DSCardContent className="p-6">
                  <DSFlexContainer justify="between" align="center">
                    <div>
                      <DSBodyText className="text-sm text-gray-500 mb-1">Above Grade Level</DSBodyText>
                      <div className="text-2xl font-bold text-gray-900 mb-2">{classMetrics.studentsAboveGrade}</div>
                      <DSBodyText className="text-sm text-gray-600">
                        {Math.round((classMetrics.studentsAboveGrade / classMetrics.totalStudents) * 100) || 0}% of class
                      </DSBodyText>
                    </div>
                    <div className="w-12 h-12 bg-[#10b981] bg-opacity-10 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-[#10b981]" />
                    </div>
                  </DSFlexContainer>
                </DSCardContent>
              </DSCard>
            </DSGridItem>

            <DSGridItem span={1}>
              <DSCard className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
                <DSCardContent className="p-6">
                  <DSFlexContainer justify="between" align="center">
                    <div>
                      <DSBodyText className="text-sm text-gray-500 mb-1">Need Support</DSBodyText>
                      <div className="text-2xl font-bold text-[#ef4444] mb-2">{classMetrics.studentsNeedingSupport}</div>
                      <DSBodyText className="text-sm text-gray-600">
                        {Math.round((classMetrics.studentsNeedingSupport / classMetrics.totalStudents) * 100) || 0}% of class
                      </DSBodyText>
                    </div>
                    <div className="w-12 h-12 bg-[#ef4444] bg-opacity-10 rounded-lg flex items-center justify-center">
                      <AlertCircle className="h-6 w-6 text-[#ef4444]" />
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
                      <DSBodyText className="text-sm text-gray-500 mb-1">Strongest Subject</DSBodyText>
                      <div className="text-lg font-bold text-gray-900 mb-2">{classMetrics.topPerformingSkill}</div>
                      <DSBodyText className="text-sm text-[#10b981]">Class excelling</DSBodyText>
                    </div>
                    <div className="w-12 h-12 bg-purple-600 bg-opacity-10 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-purple-600" />
                    </div>
                  </DSFlexContainer>
                </DSCardContent>
              </DSCard>
            </DSGridItem>
          </DSContentGrid>

          <DSSpacer size="lg" />

          {/* Main Content Tabs - Visualizations using card components */}
          <Tabs defaultValue="heatmap" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="heatmap">Performance Heat Map</TabsTrigger>
              <TabsTrigger value="distribution">Score Distribution</TabsTrigger>
              <TabsTrigger value="gaps">Learning Gaps</TabsTrigger>
              <TabsTrigger value="trends">Trends & Patterns</TabsTrigger>
            </TabsList>

            <TabsContent value="heatmap" className="space-y-6">
              {classPerformanceData.length > 0 ? (
                <DSCard>
                  <DSCardHeader>
                    <DSCardTitle className="text-lg font-semibold text-gray-900">Class Performance Heatmap</DSCardTitle>
                    <DSCardDescription className="text-sm text-gray-600">
                      Visual representation of student performance across subjects
                    </DSCardDescription>
                  </DSCardHeader>
                  <DSCardContent>
                    <ClassPerformanceHeatmap data={classPerformanceData} />
                  </DSCardContent>
                </DSCard>
              ) : (
                <DSCard>
                  <DSCardContent className="p-8 text-center">
                    <DSBodyText className="text-gray-500">No assessment data available for the selected filters.</DSBodyText>
                  </DSCardContent>
                </DSCard>
              )}
            </TabsContent>

            <TabsContent value="distribution" className="space-y-6">
              <DSCard>
                <DSCardHeader>
                  <DSCardTitle className="text-lg font-semibold text-gray-900">Assessment Score Distribution</DSCardTitle>
                  <DSCardDescription className="text-sm text-gray-600">
                    Distribution of student scores across recent assessments
                  </DSCardDescription>
                </DSCardHeader>
                <DSCardContent>
                  {distributionData.some(d => d.count > 0) ? (
                    <AssessmentDistributionChart 
                      data={distributionData} 
                      title="Current Quarter Scores"
                    />
                  ) : (
                    <DSBodyText className="text-center py-8 text-gray-500">
                      No score data available for the selected period.
                    </DSBodyText>
                  )}
                </DSCardContent>
              </DSCard>
            </TabsContent>

            <TabsContent value="gaps" className="space-y-6">
              <DSCard>
                <DSCardHeader>
                  <DSCardTitle className="text-lg font-semibold text-gray-900">Learning Gaps Analysis</DSCardTitle>
                  <DSCardDescription className="text-sm text-gray-600">
                    Identified areas where multiple students need additional support
                  </DSCardDescription>
                </DSCardHeader>
                <DSCardContent>
                  {learningGaps.length > 0 ? (
                    <div className="space-y-4">
                      {learningGaps.map((gap, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <DSFlexContainer justify="between" align="center" className="mb-2">
                            <DSCardTitle className="text-base font-semibold text-gray-900">{gap.skill}</DSCardTitle>
                            <DSFlexContainer align="center" gap="sm">
                              <Badge variant={gap.severity === 'High' ? 'destructive' : 'secondary'}>
                                {gap.severity} Priority
                              </Badge>
                              <DSBodyText className="text-sm text-gray-600">
                                {gap.studentsAffected} students affected
                              </DSBodyText>
                            </DSFlexContainer>
                          </DSFlexContainer>
                          <DSBodyText className="text-gray-700">{gap.description}</DSBodyText>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <DSBodyText className="text-center py-8 text-gray-500">
                      No learning gaps identified yet. Complete more AI analyses to see patterns.
                    </DSBodyText>
                  )}
                </DSCardContent>
              </DSCard>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <DSCard>
                <DSCardHeader>
                  <DSCardTitle className="text-lg font-semibold text-gray-900">Performance Trends</DSCardTitle>
                  <DSCardDescription className="text-sm text-gray-600">
                    Class-wide performance patterns over time
                  </DSCardDescription>
                </DSCardHeader>
                <DSCardContent>
                  <DSBodyText className="text-center py-8 text-gray-500">
                    Trend analysis charts will be implemented here showing class progress over multiple assessment periods.
                  </DSBodyText>
                </DSCardContent>
              </DSCard>
            </TabsContent>
          </Tabs>
        </DSPageContainer>
      </DSSection>
    </AppLayout>
  );
};

export default ClassInsights;
