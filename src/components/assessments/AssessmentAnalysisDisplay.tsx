
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, Brain, ChevronRight, Lightbulb, TrendingUp } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

import { assessmentService } from '@/services/assessment-service';
import { studentService } from '@/services/student-service';
import { Student } from '@/types/student';
import { Assessment, AssessmentAnalysis, AssessmentItem, StudentResponse } from '@/types/assessment';

interface AssessmentAnalysisDisplayProps {
  assessmentId: string;
  studentId: string;
}

const AssessmentAnalysisDisplay: React.FC<AssessmentAnalysisDisplayProps> = ({
  assessmentId,
  studentId,
}) => {
  // Fetch student data
  const { data: student, isLoading: isLoadingStudent } = useQuery({
    queryKey: ['student', studentId],
    queryFn: () => studentService.getStudentById(studentId),
    enabled: !!studentId,
  });

  // Fetch assessment data
  const { data: assessment, isLoading: isLoadingAssessment } = useQuery({
    queryKey: ['assessment', assessmentId],
    queryFn: () => assessmentService.getAssessmentById(assessmentId),
    enabled: !!assessmentId,
  });

  // Fetch assessment items
  const { data: assessmentItems, isLoading: isLoadingItems } = useQuery({
    queryKey: ['assessmentItems', assessmentId],
    queryFn: () => assessmentService.getAssessmentItems(assessmentId),
    enabled: !!assessmentId,
  });

  // Fetch student responses
  const { data: studentResponses, isLoading: isLoadingResponses } = useQuery({
    queryKey: ['studentResponses', assessmentId, studentId],
    queryFn: () => assessmentService.getStudentResponses(assessmentId, studentId),
    enabled: !!assessmentId && !!studentId,
  });

  // Fetch AI analysis
  const { 
    data: analysis, 
    isLoading: isLoadingAnalysis, 
    isError: isAnalysisError,
    refetch: refetchAnalysis,
  } = useQuery({
    queryKey: ['assessmentAnalysis', assessmentId, studentId],
    queryFn: () => assessmentService.getAssessmentAnalysis(assessmentId, studentId),
    enabled: !!assessmentId && !!studentId,
  });

  // Calculate performance metrics
  const getPerformanceMetrics = () => {
    if (!assessmentItems || !studentResponses) return null;

    let totalScore = 0;
    let totalPossible = 0;
    let conceptualErrors = 0;
    let proceduralErrors = 0;
    let factualErrors = 0;

    assessmentItems.forEach(item => {
      totalPossible += Number(item.max_score);
      
      const response = studentResponses.find(r => r.assessment_item_id === item.id);
      if (response) {
        totalScore += Number(response.score);
        
        if (response.error_type === 'conceptual') conceptualErrors++;
        if (response.error_type === 'procedural') proceduralErrors++;
        if (response.error_type === 'factual') factualErrors++;
      }
    });

    const percentageScore = (totalScore / totalPossible) * 100;
    
    return {
      totalScore,
      totalPossible,
      percentageScore,
      errorBreakdown: {
        conceptual: conceptualErrors,
        procedural: proceduralErrors,
        factual: factualErrors,
      },
    };
  };

  const metrics = getPerformanceMetrics();

  const isLoading = isLoadingStudent || isLoadingAssessment || isLoadingItems || isLoadingResponses || isLoadingAnalysis;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading analysis data...</p>
        </div>
      </div>
    );
  }

  if (!student || !assessment || !assessmentItems || !studentResponses) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold">Data not found</h2>
        <p className="mt-2">The requested assessment analysis data could not be loaded.</p>
      </div>
    );
  }

  const handleGenerateAnalysis = async () => {
    try {
      await assessmentService.triggerAnalysis(assessmentId, studentId);
      setTimeout(() => refetchAnalysis(), 2000);
    } catch (error) {
      console.error("Error triggering analysis:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">Assessment Analysis</CardTitle>
              <CardDescription className="mt-1">
                {assessment.title} | {assessment.subject} | Grade {assessment.grade_level}
              </CardDescription>
            </div>
            {metrics && (
              <div className="text-right">
                <div className="flex items-center">
                  <Badge className={metrics.percentageScore >= 70 ? "bg-green-500" : (metrics.percentageScore >= 50 ? "bg-yellow-500" : "bg-red-500")}>
                    {metrics.percentageScore.toFixed(1)}%
                  </Badge>
                  <span className="ml-2 font-medium">
                    {metrics.totalScore}/{metrics.totalPossible} points
                  </span>
                </div>
                <CardDescription className="mt-1">
                  Assessment Date: {assessment.assessment_date ? new Date(assessment.assessment_date).toLocaleDateString() : 'Not specified'}
                </CardDescription>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Student Info and Analysis Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Student Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-lg">
                {student.first_name.charAt(0)}{student.last_name.charAt(0)}
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-lg">{student.first_name} {student.last_name}</h3>
                <p className="text-sm text-gray-500">Grade: {student.grade_level}</p>
              </div>
            </div>

            <Separator className="my-4" />
            
            <div className="space-y-3">
              {student.learning_goals && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Learning Goals</h4>
                  <p className="text-sm mt-1">{student.learning_goals}</p>
                </div>
              )}
              
              {student.special_considerations && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Special Considerations</h4>
                  <p className="text-sm mt-1">{student.special_considerations}</p>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Actions</h4>
                <div className="mt-2 space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <Link to={`/app/students/${student.id}`}>
                      <ChevronRight className="h-4 w-4 mr-2" />
                      View Student Profile
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <Link to={`/app/students/${student.id}/assessments`}>
                      <ChevronRight className="h-4 w-4 mr-2" />
                      View All Assessments
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center">
                <Brain className="mr-2 h-5 w-5" />
                AI Analysis Insights
              </CardTitle>
              {isAnalysisError && (
                <Button onClick={handleGenerateAnalysis} size="sm">
                  Generate Analysis
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!analysis && !isAnalysisError && (
              <div className="text-center p-6">
                <div className="animate-pulse flex flex-col items-center">
                  <Brain className="h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-gray-500">Generating AI analysis...</p>
                  <p className="mt-2 text-xs text-gray-400">This may take a minute.</p>
                </div>
              </div>
            )}

            {isAnalysisError && (
              <div className="text-center p-6">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                <h3 className="mt-4 font-semibold">Analysis Not Available</h3>
                <p className="mt-2 text-sm text-gray-500">
                  AI analysis has not been generated for this assessment yet.
                </p>
                <Button onClick={handleGenerateAnalysis} className="mt-4">
                  Generate Analysis
                </Button>
              </div>
            )}

            {analysis && (
              <Tabs defaultValue="overview">
                <TabsList className="mb-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="strengths">Strengths</TabsTrigger>
                  <TabsTrigger value="growth">Growth Areas</TabsTrigger>
                  <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  {analysis.overall_summary && (
                    <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                      <p className="text-sm">{analysis.overall_summary}</p>
                    </div>
                  )}
                  
                  <h4 className="font-medium">Key Patterns Observed</h4>
                  <ul className="space-y-2">
                    {analysis.patterns_observed.map((pattern, index) => (
                      <li key={index} className="flex items-start">
                        <TrendingUp className="h-5 w-5 mr-2 text-blue-500 shrink-0 mt-0.5" />
                        <span>{pattern}</span>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
                
                <TabsContent value="strengths" className="space-y-4">
                  <ul className="space-y-3">
                    {analysis.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start bg-green-50 p-3 rounded-md border border-green-100">
                        <CheckCircle className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
                
                <TabsContent value="growth" className="space-y-4">
                  <ul className="space-y-3">
                    {analysis.growth_areas.map((area, index) => (
                      <li key={index} className="flex items-start bg-amber-50 p-3 rounded-md border border-amber-100">
                        <AlertCircle className="h-5 w-5 mr-2 text-amber-500 shrink-0 mt-0.5" />
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
                
                <TabsContent value="recommendations" className="space-y-4">
                  <ul className="space-y-3">
                    {analysis.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start bg-blue-50 p-3 rounded-md border border-blue-100">
                        <Lightbulb className="h-5 w-5 mr-2 text-blue-500 shrink-0 mt-0.5" />
                        <span>{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performance Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Score Overview */}
            {metrics && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-md">
                  <h4 className="text-sm font-medium text-gray-500">Overall Score</h4>
                  <div className="mt-2">
                    <Progress value={metrics.percentageScore} className="h-2" />
                    <div className="mt-1 flex justify-between text-sm">
                      <span className="font-medium">
                        {metrics.percentageScore.toFixed(1)}%
                      </span>
                      <span className="text-gray-500">
                        {metrics.totalScore}/{metrics.totalPossible} pts
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-md">
                  <h4 className="text-sm font-medium text-gray-500">Error Types</h4>
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Conceptual:</span>
                      <span className="font-medium">{metrics.errorBreakdown.conceptual}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Procedural:</span>
                      <span className="font-medium">{metrics.errorBreakdown.procedural}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Factual:</span>
                      <span className="font-medium">{metrics.errorBreakdown.factual}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-md">
                  <h4 className="text-sm font-medium text-gray-500">Assessment Details</h4>
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Type:</span>
                      <span className="font-medium">
                        {assessment.assessment_type.charAt(0).toUpperCase() + assessment.assessment_type.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Items:</span>
                      <span className="font-medium">{assessmentItems.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Date:</span>
                      <span className="font-medium">
                        {assessment.assessment_date 
                          ? new Date(assessment.assessment_date).toLocaleDateString() 
                          : 'Not specified'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Item-by-item breakdown */}
            <h4 className="font-medium">Item-by-Item Breakdown</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 py-2 border text-left text-sm font-medium">Item #</th>
                    <th className="px-3 py-2 border text-left text-sm font-medium">Question</th>
                    <th className="px-3 py-2 border text-left text-sm font-medium">Type</th>
                    <th className="px-3 py-2 border text-left text-sm font-medium">Difficulty</th>
                    <th className="px-3 py-2 border text-left text-sm font-medium">Score</th>
                    <th className="px-3 py-2 border text-left text-sm font-medium">Error Type</th>
                    <th className="px-3 py-2 border text-left text-sm font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {assessmentItems.map((item) => {
                    const response = studentResponses.find(r => r.assessment_item_id === item.id);
                    
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 border text-sm">{item.item_number}</td>
                        <td className="px-3 py-2 border text-sm">{item.question_text}</td>
                        <td className="px-3 py-2 border text-sm">{item.knowledge_type}</td>
                        <td className="px-3 py-2 border text-sm">{item.difficulty_level}</td>
                        <td className="px-3 py-2 border text-sm">
                          <span className={`font-medium ${
                            response && Number(response.score) >= Number(item.max_score) * 0.7
                              ? 'text-green-600'
                              : response && Number(response.score) >= Number(item.max_score) * 0.4
                              ? 'text-amber-600'
                              : 'text-red-600'
                          }`}>
                            {response ? response.score : 'N/A'}/{item.max_score}
                          </span>
                        </td>
                        <td className="px-3 py-2 border text-sm">
                          {response?.error_type === 'none' ? '-' : response?.error_type || 'N/A'}
                        </td>
                        <td className="px-3 py-2 border text-sm">
                          {response?.teacher_notes || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssessmentAnalysisDisplay;
