
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageShell from '@/components/ui/page-shell';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Users, TrendingUp, Calendar } from 'lucide-react';
import ClassComparisonView from '@/components/analytics/ClassComparisonView';
import CrossAssessmentAnalysis from '@/components/analytics/CrossAssessmentAnalysis';
import PeerComparison from '@/components/analytics/PeerComparison';
import HistoricalComparisons from '@/components/analytics/HistoricalComparisons';
import { studentService } from '@/services/student-service';
import { assessmentService } from '@/services/assessment-service';

const ComparativeAnalytics = () => {
  const [activeTab, setActiveTab] = useState('class-comparison');

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

  const isLoading = isLoadingStudents || isLoadingAssessments;

  if (isLoading) {
    return (
      <PageShell 
        title="Comparative Analytics" 
        description="Loading comparative analysis..."
        icon={<BarChart3 className="h-6 w-6 text-blue-600" />}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell 
      title="Comparative Analytics" 
      description="Compare performance across students, assessments, and time periods"
      icon={<BarChart3 className="h-6 w-6 text-blue-600" />}
    >
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="class-comparison" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Class Comparison</span>
            </TabsTrigger>
            <TabsTrigger value="cross-assessment" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Cross-Assessment</span>
            </TabsTrigger>
            <TabsTrigger value="peer-comparison" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Peer Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="historical" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Historical</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="class-comparison" className="space-y-6">
            <ClassComparisonView students={students || []} assessments={assessments || []} />
          </TabsContent>

          <TabsContent value="cross-assessment" className="space-y-6">
            <CrossAssessmentAnalysis students={students || []} assessments={assessments || []} />
          </TabsContent>

          <TabsContent value="peer-comparison" className="space-y-6">
            <PeerComparison students={students || []} assessments={assessments || []} />
          </TabsContent>

          <TabsContent value="historical" className="space-y-6">
            <HistoricalComparisons students={students || []} assessments={assessments || []} />
          </TabsContent>
        </Tabs>
      </div>
    </PageShell>
  );
};

export default ComparativeAnalytics;
