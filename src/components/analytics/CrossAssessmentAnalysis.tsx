
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, BarChart3, Download } from 'lucide-react';
import { assessmentService } from '@/services/assessment-service';

interface CrossAssessmentAnalysisProps {
  students: any[];
  assessments: any[];
}

const CrossAssessmentAnalysis: React.FC<CrossAssessmentAnalysisProps> = ({ students, assessments }) => {
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [timeRange, setTimeRange] = useState('last_3_months');
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

  // Filter assessments by time range and subject
  const filteredAssessments = assessments?.filter(assessment => {
    if (selectedSubject !== 'all' && assessment.subject !== selectedSubject) return false;
    
    if (timeRange !== 'all_time' && assessment.assessment_date) {
      const assessmentDate = new Date(assessment.assessment_date);
      const now = new Date();
      
      switch (timeRange) {
        case 'last_month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return assessmentDate >= monthAgo;
        case 'last_3_months':
          const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          return assessmentDate >= threeMonthsAgo;
        case 'current_semester':
          const semesterStart = new Date(now.getFullYear(), now.getMonth() >= 6 ? 6 : 0, 1);
          return assessmentDate >= semesterStart;
        default:
          return true;
      }
    }
    
    return true;
  }) || [];

  // Calculate cross-assessment metrics
  const calculateCrossAssessmentMetrics = () => {
    if (!filteredAssessments.length || !allResponses.length) {
      return {
        assessmentComparison: [],
        trendingTopics: [],
        improvementAnalysis: [],
        consistentStruggles: []
      };
    }

    // Assessment comparison
    const assessmentComparison = filteredAssessments.map(assessment => {
      const assessmentResponses = allResponses.filter(r => r.assessment_id === assessment.id);
      const scores = assessmentResponses.map(r => (r.score / assessment.max_score) * 100);
      
      const average = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
      const participationRate = students.length > 0 ? (scores.length / students.length) * 100 : 0;
      
      return {
        ...assessment,
        average: Math.round(average),
        participationRate: Math.round(participationRate),
        studentCount: scores.length,
        highScores: scores.filter(s => s >= 90).length,
        lowScores: scores.filter(s => s < 70).length
      };
    }).sort((a, b) => new Date(b.assessment_date || '').getTime() - new Date(a.assessment_date || '').getTime());

    // Trending topics (subjects with improving performance)
    const subjectPerformance = new Map();
    filteredAssessments.forEach(assessment => {
      const responses = allResponses.filter(r => r.assessment_id === assessment.id);
      const average = responses.length > 0 ? 
        responses.reduce((sum, r) => sum + (r.score / assessment.max_score) * 100, 0) / responses.length : 0;
      
      if (!subjectPerformance.has(assessment.subject)) {
        subjectPerformance.set(assessment.subject, []);
      }
      subjectPerformance.get(assessment.subject).push({
        date: assessment.assessment_date,
        average
      });
    });

    const trendingTopics = Array.from(subjectPerformance.entries()).map(([subject, data]) => {
      const sortedData = data.sort((a, b) => new Date(a.date || '').getTime() - new Date(b.date || '').getTime());
      const trend = sortedData.length > 1 ? 
        sortedData[sortedData.length - 1].average - sortedData[0].average : 0;
      
      return {
        subject,
        trend: Math.round(trend),
        currentAverage: Math.round(sortedData[sortedData.length - 1]?.average || 0),
        assessmentCount: sortedData.length
      };
    }).sort((a, b) => b.trend - a.trend);

    // Improvement analysis - students showing consistent improvement
    const studentImprovements = students.map(student => {
      const studentAssessments = filteredAssessments
        .map(assessment => {
          const response = allResponses.find(r => r.assessment_id === assessment.id && r.student_id === student.id);
          return response ? {
            date: assessment.assessment_date,
            score: (response.score / assessment.max_score) * 100
          } : null;
        })
        .filter(Boolean)
        .sort((a, b) => new Date(a!.date || '').getTime() - new Date(b!.date || '').getTime());

      if (studentAssessments.length < 2) return null;

      const trend = studentAssessments[studentAssessments.length - 1]!.score - studentAssessments[0]!.score;
      const average = studentAssessments.reduce((sum, a) => sum + a!.score, 0) / studentAssessments.length;

      return {
        ...student,
        trend: Math.round(trend),
        average: Math.round(average),
        assessmentCount: studentAssessments.length
      };
    }).filter(Boolean).sort((a, b) => b!.trend - a!.trend);

    // Consistent struggles - topics with consistently low performance
    const strugglingTopics = trendingTopics
      .filter(topic => topic.currentAverage < 75 && topic.trend <= 0)
      .sort((a, b) => a.currentAverage - b.currentAverage);

    return {
      assessmentComparison,
      trendingTopics: trendingTopics.slice(0, 5),
      improvementAnalysis: studentImprovements.slice(0, 10),
      consistentStruggles: strugglingTopics.slice(0, 5)
    };
  };

  const metrics = calculateCrossAssessmentMetrics();

  const exportCrossAssessmentData = () => {
    const csvData = metrics.assessmentComparison.map(assessment => ({
      'Assessment': assessment.title,
      'Subject': assessment.subject,
      'Date': assessment.assessment_date || 'N/A',
      'Average Score': `${assessment.average}%`,
      'Participation Rate': `${assessment.participationRate}%`,
      'High Scores (90%+)': assessment.highScores,
      'Low Scores (<70%)': assessment.lowScores
    }));

    const csvContent = "data:text/csv;charset=utf-8," + 
      Object.keys(csvData[0] || {}).join(",") + "\n" +
      csvData.map(row => Object.values(row).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "cross_assessment_analysis.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoadingResponses) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 gap-4">
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
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="last_3_months">Last 3 Months</SelectItem>
              <SelectItem value="current_semester">Current Semester</SelectItem>
              <SelectItem value="all_time">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={exportCrossAssessmentData} variant="outline" className="flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Export Analysis</span>
        </Button>
      </div>

      {/* Assessment Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Assessment Performance Comparison</span>
          </CardTitle>
          <CardDescription>
            Compare performance across different assessments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-2 font-medium">Assessment</th>
                  <th className="p-2 font-medium">Subject</th>
                  <th className="p-2 font-medium">Date</th>
                  <th className="p-2 font-medium">Average</th>
                  <th className="p-2 font-medium">Participation</th>
                  <th className="p-2 font-medium">High Scores</th>
                  <th className="p-2 font-medium">Low Scores</th>
                </tr>
              </thead>
              <tbody>
                {metrics.assessmentComparison.map((assessment, index) => (
                  <tr key={assessment.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{assessment.title}</td>
                    <td className="p-2">{assessment.subject}</td>
                    <td className="p-2">{assessment.assessment_date ? new Date(assessment.assessment_date).toLocaleDateString() : 'N/A'}</td>
                    <td className="p-2">
                      <Badge variant={assessment.average >= 80 ? 'default' : assessment.average >= 70 ? 'secondary' : 'destructive'}>
                        {assessment.average}%
                      </Badge>
                    </td>
                    <td className="p-2">{assessment.participationRate}%</td>
                    <td className="p-2 text-green-600">{assessment.highScores}</td>
                    <td className="p-2 text-red-600">{assessment.lowScores}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Trending Topics */}
      {metrics.trendingTopics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>Trending Topics</span>
            </CardTitle>
            <CardDescription>
              Subjects showing improvement or decline over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics.trendingTopics.map((topic, index) => (
                <div key={topic.subject} className={`p-4 border rounded-lg ${
                  topic.trend > 0 ? 'bg-green-50 border-green-200' : 
                  topic.trend < 0 ? 'bg-red-50 border-red-200' : 
                  'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{topic.subject}</h4>
                    <div className="flex items-center space-x-1">
                      {topic.trend > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : topic.trend < 0 ? (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      ) : null}
                      <span className={`text-sm font-medium ${
                        topic.trend > 0 ? 'text-green-600' : 
                        topic.trend < 0 ? 'text-red-600' : 
                        'text-gray-600'
                      }`}>
                        {topic.trend > 0 ? '+' : ''}{topic.trend}%
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Current Average: {topic.currentAverage}%</p>
                    <p>{topic.assessmentCount} assessments</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student Improvement Analysis */}
      {metrics.improvementAnalysis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Student Improvement Analysis</CardTitle>
            <CardDescription>
              Students showing consistent improvement across assessments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.improvementAnalysis.slice(0, 10).map((student, index) => (
                <div key={student!.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div>
                    <h4 className="font-medium">{student!.first_name} {student!.last_name}</h4>
                    <p className="text-sm text-gray-600">
                      Average: {student!.average}% • {student!.assessmentCount} assessments
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {student!.trend > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <Badge variant={student!.trend > 0 ? 'default' : 'destructive'}>
                      {student!.trend > 0 ? '+' : ''}{student!.trend}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Consistent Struggles */}
      {metrics.consistentStruggles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <span>Areas of Consistent Struggle</span>
            </CardTitle>
            <CardDescription>
              Topics that consistently show low performance across assessments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metrics.consistentStruggles.map((topic, index) => (
                <div key={topic.subject} className="p-4 border rounded-lg bg-red-50 border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{topic.subject}</h4>
                    <Badge variant="destructive">
                      {topic.currentAverage}%
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Trend: {topic.trend}% over {topic.assessmentCount} assessments</p>
                    <p className="text-red-600 mt-1">Needs focused intervention</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CrossAssessmentAnalysis;
