
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PerformanceTimelineChart from '../charts/PerformanceTimelineChart';
import GrowthTrendChart from '../charts/GrowthTrendChart';

interface PerformanceTabContentProps {
  student: {
    first_name: string;
  };
  recentAssessments: Array<{
    title: string;
    score: number;
    date: string;
    subject: string;
  }>;
  performance: {
    average_score: number;
  };
}

const PerformanceTabContent: React.FC<PerformanceTabContentProps> = ({
  student,
  recentAssessments,
  performance
}) => {
  // Sample data for performance chart
  const performanceData = recentAssessments.map(assessment => ({
    assessment_name: assessment.title,
    score: assessment.score,
    class_average: Math.round(assessment.score * 0.9 + Math.random() * 10), // Simulated class average
    date: assessment.date
  }));

  // Sample data for growth trend
  const growthTrendData = [
    { period: '2 Months Ago', actual_score: 68, predicted_score: 68, target_score: 85, growth_rate: 0 },
    { period: '1 Month Ago', actual_score: 75, predicted_score: 75, target_score: 85, growth_rate: 5 },
    { period: 'Current', actual_score: performance.average_score, predicted_score: performance.average_score, target_score: 85, growth_rate: 3 },
    { period: 'Next Month', actual_score: 0, predicted_score: Math.min(95, performance.average_score + 5), target_score: 85, growth_rate: 3 },
    { period: '2 Months Later', actual_score: 0, predicted_score: Math.min(95, performance.average_score + 8), target_score: 85, growth_rate: 2 },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Recent Assessment Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-80">
            {performanceData.length > 0 ? (
              <PerformanceTimelineChart data={performanceData} studentName={student.first_name} />
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
              {recentAssessments.length > 0 ? (
                recentAssessments.map((assessment, index) => (
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
            <GrowthTrendChart data={growthTrendData} studentName={student.first_name} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceTabContent;
