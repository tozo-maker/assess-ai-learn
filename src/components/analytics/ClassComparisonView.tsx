
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, TrendingDown, Users, Download } from 'lucide-react';
import ClassPerformanceHeatmap from '@/components/charts/ClassPerformanceHeatmap';
import AssessmentDistributionChart from '@/components/charts/AssessmentDistributionChart';
import { assessmentService } from '@/services/assessment-service';

interface ClassComparisonViewProps {
  students: any[];
  assessments: any[];
}

const ClassComparisonView: React.FC<ClassComparisonViewProps> = ({ students, assessments }) => {
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedAssessment, setSelectedAssessment] = useState('all');
  const [allResponses, setAllResponses] = useState<any[]>([]);

  // Fetch all student responses
  const { data: responsesData, isLoading: isLoadingResponses } = useQuery({
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

  useEffect(() => {
    if (responsesData) {
      setAllResponses(responsesData);
    }
  }, [responsesData]);

  // Filter data based on selections
  const filteredAssessments = assessments?.filter(assessment => {
    if (selectedSubject !== 'all' && assessment.subject !== selectedSubject) return false;
    if (selectedAssessment !== 'all' && assessment.id !== selectedAssessment) return false;
    return true;
  }) || [];

  const filteredResponses = allResponses?.filter(response =>
    filteredAssessments.some(assessment => assessment.id === response.assessment_id)
  ) || [];

  // Calculate performance metrics
  const calculateClassMetrics = () => {
    if (!students || !filteredResponses.length) {
      return {
        classAverage: 0,
        highPerformers: [],
        needingHelp: [],
        performanceDistribution: []
      };
    }

    // Calculate student averages
    const studentPerformance = students.map(student => {
      const studentResponses = filteredResponses.filter(r => r.student_id === student.id);
      const scores = studentResponses.map(response => {
        const assessment = filteredAssessments.find(a => a.id === response.assessment_id);
        return assessment ? (response.score / assessment.max_score) * 100 : 0;
      });
      
      const average = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
      
      return {
        ...student,
        average,
        assessmentCount: scores.length,
        trend: scores.length > 1 ? scores[scores.length - 1] - scores[0] : 0
      };
    });

    const classAverage = studentPerformance.reduce((sum, student) => sum + student.average, 0) / students.length;
    
    // Identify high performers (top 25% or above 85%)
    const highPerformers = studentPerformance
      .filter(student => student.average >= Math.max(85, classAverage + 15))
      .sort((a, b) => b.average - a.average);

    // Identify students needing help (bottom 25% or below 70%)
    const needingHelp = studentPerformance
      .filter(student => student.average <= Math.min(70, classAverage - 15))
      .sort((a, b) => a.average - b.average);

    // Performance distribution
    const ranges = [
      { range: '90-100%', min: 90, max: 100 },
      { range: '80-89%', min: 80, max: 89 },
      { range: '70-79%', min: 70, max: 79 },
      { range: '60-69%', min: 60, max: 69 },
      { range: '<60%', min: 0, max: 59 }
    ];

    const performanceDistribution = ranges.map(({ range, min, max }) => {
      const count = studentPerformance.filter(s => s.average >= min && s.average <= max).length;
      const percentage = students.length > 0 ? Math.round((count / students.length) * 100) : 0;
      return { range, count, percentage };
    });

    return {
      classAverage: Math.round(classAverage),
      highPerformers,
      needingHelp,
      performanceDistribution,
      allStudentPerformance: studentPerformance
    };
  };

  const metrics = calculateClassMetrics();

  // Generate heatmap data
  const generateHeatmapData = () => {
    if (!students || !filteredAssessments || !filteredResponses) return [];

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

  const heatmapData = generateHeatmapData();

  const exportComparisonData = () => {
    const csvData = metrics.allStudentPerformance?.map(student => ({
      'Student Name': `${student.first_name} ${student.last_name}`,
      'Average Score': `${Math.round(student.average)}%`,
      'Assessments Completed': student.assessmentCount,
      'Trend': student.trend > 0 ? 'Improving' : student.trend < 0 ? 'Declining' : 'Stable',
      'Performance Level': student.average >= 90 ? 'Advanced' : 
                          student.average >= 80 ? 'Proficient' : 
                          student.average >= 70 ? 'Basic' : 'Below Basic'
    })) || [];

    const csvContent = "data:text/csv;charset=utf-8," + 
      Object.keys(csvData[0] || {}).join(",") + "\n" +
      csvData.map(row => Object.values(row).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "class_comparison_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoadingResponses) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Export */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-4">
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
          
          <Select value={selectedAssessment} onValueChange={setSelectedAssessment}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Assessment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assessments</SelectItem>
              {filteredAssessments.map(assessment => (
                <SelectItem key={assessment.id} value={assessment.id}>{assessment.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={exportComparisonData} variant="outline" className="flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Export Data</span>
        </Button>
      </div>

      {/* Class Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Class Average</p>
                <p className="text-2xl font-bold">{metrics.classAverage}%</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Performers</p>
                <p className="text-2xl font-bold text-green-600">{metrics.highPerformers.length}</p>
                <p className="text-xs text-gray-500">Above 85%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Need Support</p>
                <p className="text-2xl font-bold text-red-600">{metrics.needingHelp.length}</p>
                <p className="text-xs text-gray-500">Below 70%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Improving</p>
                <p className="text-2xl font-bold text-blue-600">
                  {metrics.allStudentPerformance?.filter(s => s.trend > 5).length || 0}
                </p>
                <p className="text-xs text-gray-500">Upward trend</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Distribution</CardTitle>
          <CardDescription>
            How students are distributed across performance levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AssessmentDistributionChart 
            data={metrics.performanceDistribution} 
            title="Class Performance Distribution"
          />
        </CardContent>
      </Card>

      {/* High Performers */}
      {metrics.highPerformers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>High Performers</span>
            </CardTitle>
            <CardDescription>
              Students excelling in the selected criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics.highPerformers.slice(0, 6).map((student, index) => (
                <div key={student.id} className="p-4 border rounded-lg bg-green-50 border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{student.first_name} {student.last_name}</h4>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {Math.round(student.average)}%
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>{student.assessmentCount} assessments completed</p>
                    {student.trend > 0 && (
                      <p className="flex items-center text-green-600">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Improving
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Students Needing Help */}
      {metrics.needingHelp.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span>Students Needing Support</span>
            </CardTitle>
            <CardDescription>
              Students who would benefit from additional help
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics.needingHelp.slice(0, 6).map((student, index) => (
                <div key={student.id} className="p-4 border rounded-lg bg-red-50 border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{student.first_name} {student.last_name}</h4>
                    <Badge variant="destructive">
                      {Math.round(student.average)}%
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>{student.assessmentCount} assessments completed</p>
                    {student.trend < 0 && (
                      <p className="flex items-center text-red-600">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        Declining
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skill Mastery Heat Map */}
      {heatmapData.length > 0 && (
        <ClassPerformanceHeatmap data={heatmapData} />
      )}
    </div>
  );
};

export default ClassComparisonView;
