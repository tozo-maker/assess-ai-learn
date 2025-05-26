
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProgressReportData } from '@/types/communications';
import ProgressReportHeader from './ProgressReportHeader';
import ProgressReportSummary from './ProgressReportSummary';
import PerformanceTabContent from './PerformanceTabContent';
import InsightsTabContent from './InsightsTabContent';
import GoalsTabContent from './GoalsTabContent';
import RecommendationsTabContent from './RecommendationsTabContent';

interface ProgressReportViewerProps {
  reportData: ProgressReportData;
}

const ProgressReportViewer: React.FC<ProgressReportViewerProps> = ({ reportData }) => {
  // Transform ai_insights data to match InsightsTabContent expected format
  const transformedInsights = [{
    id: 'progress-report-insights',
    overall_summary: `Performance insights for ${reportData.student.first_name} ${reportData.student.last_name}`,
    strengths: reportData.ai_insights.strengths,
    growth_areas: reportData.ai_insights.growth_areas,
    recommendations: reportData.ai_insights.recommendations,
    patterns_observed: [],
    created_at: new Date().toISOString(),
    assessments: {
      id: 'progress-report-assessment',
      title: 'Progress Report Analysis',
      subject: 'Multiple Subjects',
      assessment_date: new Date().toISOString().split('T')[0]
    }
  }];

  return (
    <div className="space-y-6 print:py-10">
      {/* Header Section */}
      <ProgressReportHeader student={reportData.student} />

      {/* Summary Cards */}
      <ProgressReportSummary performance={reportData.performance} />

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
          <PerformanceTabContent 
            student={reportData.student}
            recentAssessments={reportData.recent_assessments}
            performance={reportData.performance}
          />
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <InsightsTabContent 
            insights={transformedInsights}
            isLoading={false}
            onViewAssessments={() => {}}
          />
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-4">
          <GoalsTabContent goals={reportData.goals} />
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <RecommendationsTabContent recommendations={reportData.ai_insights.recommendations} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressReportViewer;
