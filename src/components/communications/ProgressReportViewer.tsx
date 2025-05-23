
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ProgressReportData } from '@/types/communications';
import { Check, AlertCircle, Download } from 'lucide-react';
import PerformanceTimelineChart from '../charts/PerformanceTimelineChart';
import GrowthTrendChart from '../charts/GrowthTrendChart';

interface ProgressReportViewerProps {
  reportData: ProgressReportData;
}

const ProgressReportViewer: React.FC<ProgressReportViewerProps> = ({ reportData }) => {
  // Sample data for performance chart
  const performanceData = reportData.recent_assessments.map(assessment => ({
    assessment_name: assessment.title,
    score: assessment.score,
    class_average: Math.round(assessment.score * 0.9 + Math.random() * 10), // Simulated class average
    date: assessment.date
  }));

  // Sample data for growth trend
  const growthTrendData = [
    { period: '2 Months Ago', actual_score: 68, predicted_score: 68, target_score: 85, growth_rate: 0 },
    { period: '1 Month Ago', actual_score: 75, predicted_score: 75, target_score: 85, growth_rate: 5 },
    { period: 'Current', actual_score: reportData.performance.average_score, predicted_score: reportData.performance.average_score, target_score: 85, growth_rate: 3 },
    { period: 'Next Month', actual_score: 0, predicted_score: Math.min(95, reportData.performance.average_score + 5), target_score: 85, growth_rate: 3 },
    { period: '2 Months Later', actual_score: 0, predicted_score: Math.min(95, reportData.performance.average_score + 8), target_score: 85, growth_rate: 2 },
  ];

  return (
    <div className="space-y-6 print:py-10">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold print:text-3xl">
            Progress Report: {reportData.student.first_name} {reportData.student.last_name}
          </h1>
          <p className="text-muted-foreground">Grade {reportData.student.grade_level} • {new Date().toLocaleDateString()}</p>
        </div>
        <Button className="print:hidden">
          <Download className="h-4 w-4 mr-2" />
          Print Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.performance.average_score}%</div>
            <p className="text-xs text-muted-foreground">Based on {reportData.performance.assessment_count} assessments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Performance Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.performance.performance_level}</div>
            <p className="text-xs text-muted-foreground">Overall academic standing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              {reportData.performance.needs_attention ? (
                <>
                  <Badge variant="destructive" className="mr-2">Needs Support</Badge>
                  <AlertCircle className="h-4 w-4 text-destructive" />
                </>
              ) : (
                <>
                  <Badge variant="default" className="mr-2 bg-green-500">On Track</Badge>
                  <Check className="h-4 w-4 text-green-500" />
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Based on recent performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Tabs */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="goals">Learning Goals</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Assessment Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-80">
                {performanceData.length > 0 ? (
                  <PerformanceTimelineChart data={performanceData} studentName={reportData.student.first_name} />
                ) : (
                  <p className="text-center text-muted-foreground py-10">No assessment data available</p>
                )}
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assessment</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.recent_assessments.length > 0 ? (
                    reportData.recent_assessments.map((assessment, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{assessment.title}</TableCell>
                        <TableCell>{assessment.subject}</TableCell>
                        <TableCell>{new Date(assessment.date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">{assessment.score}%</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">No assessment data available</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Growth Trend and Projections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <GrowthTrendChart data={growthTrendData} studentName={reportData.student.first_name} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Learning Strengths</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                {reportData.ai_insights.strengths.map((strength, index) => (
                  <li key={index} className="text-green-700">{strength}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Areas for Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                {reportData.ai_insights.growth_areas.map((area, index) => (
                  <li key={index} className="text-amber-700">{area}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-4">
          {reportData.goals.length > 0 ? (
            reportData.goals.map((goal, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-md">{goal.title}</CardTitle>
                    <Badge className={goal.status === 'active' ? 'bg-blue-500' : 'bg-green-500'}>
                      {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  {goal.description && <p className="mb-2 text-sm text-gray-600">{goal.description}</p>}
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: `${goal.progress_percentage}%` }} 
                      />
                    </div>
                    <span className="text-sm font-medium">{goal.progress_percentage}%</span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No learning goals have been set yet.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Teacher Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-3">
                {reportData.ai_insights.recommendations.map((recommendation, index) => (
                  <li key={index}>{recommendation}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressReportViewer;
