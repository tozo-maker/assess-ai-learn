
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import { PageShell } from '@/components/ui/page-shell';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProgressReportGenerator from '@/components/communications/ProgressReportGenerator';
import ProgressReportsOverview from '@/components/reports/ProgressReportsOverview';
import RecentReports from '@/components/reports/RecentReports';
import { studentService } from '@/services/student-service';
import { communicationsService } from '@/services/communications-service';

const ProgressReports: React.FC = () => {
  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getStudents,
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['communications'],
    queryFn: () => communicationsService.getCommunications().then(comms => 
      comms.filter(c => c.communication_type === 'progress_report')
    ),
  });

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
          <ProgressReportsOverview 
            students={students}
            reports={reports}
            selectedCount={0}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <RecentReports reports={reports} />
        </TabsContent>
      </Tabs>
    </PageShell>
  );
};

export default ProgressReports;
