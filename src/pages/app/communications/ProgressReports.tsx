
import React from 'react';
import { FileText } from 'lucide-react';
import { PageShell } from '@/components/ui/page-shell';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProgressReportGenerator from '@/components/communications/ProgressReportGenerator';
import ProgressReportsOverview from '@/components/reports/ProgressReportsOverview';
import RecentReports from '@/components/reports/RecentReports';

const ProgressReports: React.FC = () => {
  return (
    <PageShell
      title="Progress Reports"
      description="Generate and manage student progress reports"
      icon={<FileText className="h-6 w-6 text-blue-600" />}
    >
      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">Generate Reports</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Report History</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <ProgressReportGenerator />
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <ProgressReportsOverview />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <RecentReports />
        </TabsContent>
      </Tabs>
    </PageShell>
  );
};

export default ProgressReports;
