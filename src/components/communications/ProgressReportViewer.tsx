
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ProgressReportData } from '@/types/communications';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';

interface ProgressReportViewerProps {
  reportData: ProgressReportData;
}

const ProgressReportViewer: React.FC<ProgressReportViewerProps> = ({ reportData }) => {
  const { student, performance, recent_assessments, goals, ai_insights } = reportData;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center border-b pb-6">
        <h1 className="text-3xl font-bold">Progress Report</h1>
        <h2 className="text-xl text-gray-600 mt-2">
          {student.first_name} {student.last_name}
        </h2>
        <p className="text-gray-500">Grade {student.grade_level}</p>
        <p className="text-sm text-gray-400 mt-2">
          Generated on {new Date().toLocaleDateString()}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Overall Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {performance.average_score}%
              </div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {performance.assessment_count}
              </div>
              <div className="text-sm text-gray-600">Assessments</div>
            </div>
            <div className="text-center">
              <Badge 
                className={`text-sm ${
                  performance.performance_level === 'Above Average' 
                    ? 'bg-green-100 text-green-800'
                    : performance.performance_level === 'Below Average'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {performance.performance_level}
              </Badge>
              <div className="text-sm text-gray-600 mt-1">Performance Level</div>
            </div>
            <div className="text-center">
              {performance.needs_attention ? (
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
              ) : (
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
              )}
              <div className="text-sm text-gray-600 mt-1">
                {performance.needs_attention ? 'Needs Attention' : 'On Track'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Assessment Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recent_assessments.map((assessment, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{assessment.title}</div>
                  <div className="text-sm text-gray-600">
                    {assessment.subject} • {new Date(assessment.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{assessment.score}%</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Learning Goals Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {goals.map((goal) => (
              <div key={goal.id}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{goal.title}</span>
                  <span className="text-sm text-gray-600">{goal.progress_percentage}%</span>
                </div>
                <Progress value={goal.progress_percentage} className="h-2" />
              </div>
            ))}
            {goals.length === 0 && (
              <p className="text-gray-500 text-center py-4">No active learning goals</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-700">Strengths</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {ai_insights.strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-orange-700">Growth Areas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {ai_insights.growth_areas.map((area, index) => (
                <li key={index} className="flex items-start">
                  <TrendingUp className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{area}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-blue-700">Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {ai_insights.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start">
                  <AlertCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgressReportViewer;
