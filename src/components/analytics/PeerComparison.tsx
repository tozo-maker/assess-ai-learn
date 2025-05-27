
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, TrendingUp, Star, Target, Download } from 'lucide-react';
import { assessmentService } from '@/services/assessment-service';

interface PeerComparisonProps {
  students: any[];
  assessments: any[];
}

const PeerComparison: React.FC<PeerComparisonProps> = ({ students, assessments }) => {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
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

  // Filter assessments by subject
  const filteredAssessments = assessments?.filter(assessment => {
    if (selectedSubject !== 'all' && assessment.subject !== selectedSubject) return false;
    return true;
  }) || [];

  const filteredResponses = allResponses?.filter(response =>
    filteredAssessments.some(assessment => assessment.id === response.assessment_id)
  ) || [];

  // Calculate peer comparison data
  const calculatePeerComparison = () => {
    if (!students.length || !filteredResponses.length || !selectedStudent) {
      return {
        selectedStudentData: null,
        classPerformance: [],
        percentileRank: 0,
        performanceMessage: '',
        growthComparison: null,
        subjectBreakdown: []
      };
    }

    // Calculate performance for all students
    const studentPerformance = students.map(student => {
      const studentResponses = filteredResponses.filter(r => r.student_id === student.id);
      const scores = studentResponses.map(response => {
        const assessment = filteredAssessments.find(a => a.id === response.assessment_id);
        return assessment ? (response.score / assessment.max_score) * 100 : 0;
      });
      
      const average = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
      
      // Calculate growth (difference between first and last assessment)
      const chronologicalScores = scores.length > 1 ? 
        studentResponses
          .map(r => {
            const assessment = filteredAssessments.find(a => a.id === r.assessment_id);
            return assessment ? {
              score: (r.score / assessment.max_score) * 100,
              date: assessment.assessment_date
            } : null;
          })
          .filter(Boolean)
          .sort((a, b) => new Date(a!.date || '').getTime() - new Date(b!.date || '').getTime()) : [];
      
      const growth = chronologicalScores.length > 1 ? 
        chronologicalScores[chronologicalScores.length - 1]!.score - chronologicalScores[0]!.score : 0;

      return {
        id: student.id,
        name: `${student.first_name} ${student.last_name}`,
        average: Math.round(average),
        assessmentCount: scores.length,
        growth: Math.round(growth),
        isSelected: student.id === selectedStudent
      };
    }).sort((a, b) => b.average - a.average);

    const selectedStudentData = studentPerformance.find(s => s.isSelected);
    
    if (!selectedStudentData) {
      return {
        selectedStudentData: null,
        classPerformance: [],
        percentileRank: 0,
        performanceMessage: '',
        growthComparison: null,
        subjectBreakdown: []
      };
    }

    // Calculate percentile rank
    const studentsAbove = studentPerformance.filter(s => s.average > selectedStudentData.average).length;
    const percentileRank = Math.round(((students.length - studentsAbove) / students.length) * 100);

    // Generate performance message
    let performanceMessage = '';
    if (percentileRank >= 90) {
      performanceMessage = 'Exceptional performance! Among the top 10% of the class.';
    } else if (percentileRank >= 75) {
      performanceMessage = 'Strong performance! Above three-quarters of classmates.';
    } else if (percentileRank >= 50) {
      performanceMessage = 'Good performance! Above average for the class.';
    } else if (percentileRank >= 25) {
      performanceMessage = 'Room for improvement. With focused effort, can reach class average.';
    } else {
      performanceMessage = 'Significant growth opportunity. Additional support recommended.';
    }

    // Growth comparison
    const classGrowthAverage = studentPerformance.reduce((sum, s) => sum + s.growth, 0) / students.length;
    const growthComparison = {
      studentGrowth: selectedStudentData.growth,
      classAverage: Math.round(classGrowthAverage),
      isAboveAverage: selectedStudentData.growth > classGrowthAverage
    };

    // Subject breakdown
    const subjects = [...new Set(filteredAssessments.map(a => a.subject))];
    const subjectBreakdown = subjects.map(subject => {
      const subjectAssessments = filteredAssessments.filter(a => a.subject === subject);
      const subjectResponses = filteredResponses.filter(r => 
        subjectAssessments.some(a => a.id === r.assessment_id)
      );

      // Student's performance in this subject
      const studentSubjectResponses = subjectResponses.filter(r => r.student_id === selectedStudent);
      const studentScores = studentSubjectResponses.map(r => {
        const assessment = subjectAssessments.find(a => a.id === r.assessment_id);
        return assessment ? (r.score / assessment.max_score) * 100 : 0;
      });
      const studentAverage = studentScores.length > 0 ? 
        studentScores.reduce((sum, score) => sum + score, 0) / studentScores.length : 0;

      // Class performance in this subject
      const allSubjectScores = subjectResponses.map(r => {
        const assessment = subjectAssessments.find(a => a.id === r.assessment_id);
        return assessment ? (r.score / assessment.max_score) * 100 : 0;
      });
      const classAverage = allSubjectScores.length > 0 ? 
        allSubjectScores.reduce((sum, score) => sum + score, 0) / allSubjectScores.length : 0;

      // Calculate percentile for this subject
      const subjectStudentPerformance = students.map(student => {
        const responses = subjectResponses.filter(r => r.student_id === student.id);
        const scores = responses.map(r => {
          const assessment = subjectAssessments.find(a => a.id === r.assessment_id);
          return assessment ? (r.score / assessment.max_score) * 100 : 0;
        });
        return scores.length > 0 ? scores.reduce((sum, s) => sum + s, 0) / scores.length : 0;
      }).sort((a, b) => b - a);

      const subjectRank = subjectStudentPerformance.filter(avg => avg > studentAverage).length;
      const subjectPercentile = Math.round(((students.length - subjectRank) / students.length) * 100);

      return {
        subject,
        studentAverage: Math.round(studentAverage),
        classAverage: Math.round(classAverage),
        percentile: subjectPercentile,
        assessmentCount: studentScores.length
      };
    });

    return {
      selectedStudentData,
      classPerformance: studentPerformance,
      percentileRank,
      performanceMessage,
      growthComparison,
      subjectBreakdown
    };
  };

  const comparison = calculatePeerComparison();

  const exportPeerData = () => {
    if (!comparison.selectedStudentData) return;

    const csvData = [
      {
        'Metric': 'Overall Percentile Rank',
        'Value': `${comparison.percentileRank}%`,
        'Class Average': 'N/A',
        'Performance': comparison.performanceMessage
      },
      {
        'Metric': 'Growth Rate',
        'Value': `${comparison.growthComparison?.studentGrowth || 0}%`,
        'Class Average': `${comparison.growthComparison?.classAverage || 0}%`,
        'Performance': comparison.growthComparison?.isAboveAverage ? 'Above Average' : 'Below Average'
      },
      ...comparison.subjectBreakdown.map(subject => ({
        'Metric': `${subject.subject} Performance`,
        'Value': `${subject.studentAverage}%`,
        'Class Average': `${subject.classAverage}%`,
        'Performance': `${subject.percentile}th percentile`
      }))
    ];

    const csvContent = "data:text/csv;charset=utf-8," + 
      Object.keys(csvData[0] || {}).join(",") + "\n" +
      csvData.map(row => Object.values(row).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `peer_comparison_${comparison.selectedStudentData.name.replace(' ', '_')}.csv`);
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
      {/* Student and Subject Selection */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-4">
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select Student" />
            </SelectTrigger>
            <SelectContent>
              {students.map(student => (
                <SelectItem key={student.id} value={student.id}>
                  {student.first_name} {student.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
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
        </div>
        
        {comparison.selectedStudentData && (
          <Button onClick={exportPeerData} variant="outline" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </Button>
        )}
      </div>

      {!selectedStudent ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Student</h3>
            <p className="text-gray-600">
              Choose a student from the dropdown above to view their anonymous peer comparison.
            </p>
          </CardContent>
        </Card>
      ) : comparison.selectedStudentData ? (
        <>
          {/* Overall Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span>Performance Summary</span>
              </CardTitle>
              <CardDescription>
                Anonymous peer comparison for {comparison.selectedStudentData.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {comparison.percentileRank}%
                  </div>
                  <p className="text-sm text-gray-600">Percentile Rank</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Performing better than {comparison.percentileRank}% of classmates
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {comparison.selectedStudentData.average}%
                  </div>
                  <p className="text-sm text-gray-600">Average Score</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Across {comparison.selectedStudentData.assessmentCount} assessments
                  </p>
                </div>
                
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-2 ${
                    comparison.growthComparison?.isAboveAverage ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    {comparison.growthComparison?.studentGrowth || 0 > 0 ? '+' : ''}{comparison.growthComparison?.studentGrowth || 0}%
                  </div>
                  <p className="text-sm text-gray-600">Growth Rate</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {comparison.growthComparison?.isAboveAverage ? 'Above' : 'Below'} class average
                  </p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-800 font-medium">{comparison.performanceMessage}</p>
              </div>
            </CardContent>
          </Card>

          {/* Subject-wise Performance */}
          {comparison.subjectBreakdown.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Subject Performance Breakdown</span>
                </CardTitle>
                <CardDescription>
                  Performance comparison by subject area
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {comparison.subjectBreakdown.map((subject, index) => (
                    <div key={subject.subject} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{subject.subject}</h4>
                        <Badge variant={subject.percentile >= 75 ? 'default' : subject.percentile >= 50 ? 'secondary' : 'outline'}>
                          {subject.percentile}th percentile
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Student Average:</span>
                          <span className="font-medium">{subject.studentAverage}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Class Average:</span>
                          <span className="font-medium">{subject.classAverage}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Assessments:</span>
                          <span className="font-medium">{subject.assessmentCount}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              subject.percentile >= 75 ? 'bg-green-500' : 
                              subject.percentile >= 50 ? 'bg-blue-500' : 
                              'bg-yellow-500'
                            }`}
                            style={{ width: `${subject.percentile}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Growth Comparison */}
          {comparison.growthComparison && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Growth Analysis</span>
                </CardTitle>
                <CardDescription>
                  Improvement over time compared to classmates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className={`text-2xl font-bold mb-2 ${
                      comparison.growthComparison.studentGrowth > 0 ? 'text-green-600' : 
                      comparison.growthComparison.studentGrowth < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {comparison.growthComparison.studentGrowth > 0 ? '+' : ''}{comparison.growthComparison.studentGrowth}%
                    </div>
                    <p className="text-sm text-gray-600">Student Growth</p>
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-2xl font-bold mb-2 ${
                      comparison.growthComparison.classAverage > 0 ? 'text-green-600' : 
                      comparison.growthComparison.classAverage < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {comparison.growthComparison.classAverage > 0 ? '+' : ''}{comparison.growthComparison.classAverage}%
                    </div>
                    <p className="text-sm text-gray-600">Class Average Growth</p>
                  </div>
                </div>
                
                <div className="mt-4 p-3 rounded-lg border">
                  <p className="text-sm text-center">
                    {comparison.growthComparison.isAboveAverage ? (
                      <span className="text-green-600 font-medium">
                        🎉 Growing faster than most classmates! Keep up the excellent progress.
                      </span>
                    ) : comparison.growthComparison.studentGrowth > 0 ? (
                      <span className="text-blue-600 font-medium">
                        📈 Making steady progress! There's room to accelerate growth.
                      </span>
                    ) : (
                      <span className="text-orange-600 font-medium">
                        💪 Focus on consistent practice to start showing positive growth.
                      </span>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Motivational Message */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Keep Growing! 🌱</h3>
                <p className="text-gray-600">
                  {comparison.percentileRank >= 75 ? 
                    "You're doing excellent work! Consider helping classmates or taking on new challenges." :
                    comparison.percentileRank >= 50 ?
                    "You're making good progress! Focus on consistent effort to reach even higher." :
                    "Every step forward counts! With dedicated practice, you can achieve significant improvement."
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">No assessment data available for the selected student.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PeerComparison;
