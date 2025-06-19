
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/components/layout/AppLayout';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import MobileOptimizedLayout from '@/components/layout/MobileOptimizedLayout';
import ProgressReportGenerator from '@/components/reports/ProgressReportGenerator';
import ComprehensiveAnalyticsDashboard from '@/components/analytics/ComprehensiveAnalyticsDashboard';
import { BarChart3, FileText, TrendingUp, Users } from 'lucide-react';

const Reports: React.FC = () => {
  return (
    <AppLayout>
      <MobileOptimizedLayout>
        <Breadcrumbs />
        
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-gray-600 mt-2">
              Generate progress reports and view comprehensive analytics
            </p>
          </div>

          <Tabs defaultValue="analytics" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Progress Reports
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Performance Insights
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analytics">
              <ComprehensiveAnalyticsDashboard />
            </TabsContent>

            <TabsContent value="reports">
              <ProgressReportGenerator />
            </TabsContent>

            <TabsContent value="insights">
              <div className="grid gap-6">
                <div className="text-center py-12">
                  <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Performance Insights Coming Soon</h3>
                  <p className="text-gray-600">
                    Advanced performance insights and trends will be available here.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </MobileOptimizedLayout>
    </AppLayout>
  );
};

export default Reports;
