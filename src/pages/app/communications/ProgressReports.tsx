
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import PageTemplate from '@/components/ui/page-template';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DSCard,
  DSCardContent,
  DSCardHeader,
  DSCardTitle,
  DSFlexContainer,
  DSBodyText,
  DSSpacer
} from '@/components/ui/design-system';
import ProgressReportGenerator from '@/components/communications/ProgressReportGenerator';
import ProgressReportsOverview from '@/components/reports/ProgressReportsOverview';
import RecentReports from '@/components/reports/RecentReports';
import StandardLoadingState from '@/components/common/StandardLoadingState';
import { studentService } from '@/services/student-service';
import { communicationsService } from '@/services/communications-service';

const ProgressReports: React.FC = () => {
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getStudents,
  });

  const { data: reports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ['communications'],
    queryFn: () => communicationsService.getCommunications().then(comms => 
      comms.filter(c => c.communication_type === 'progress_report')
    ),
  });

  const actions = (
    <DSFlexContainer gap="sm">
      <FileText className="h-5 w-5 text-[#2563eb]" />
    </DSFlexContainer>
  );

  if (studentsLoading || reportsLoading) {
    return (
      <PageTemplate
        title="Progress Reports"
        description="Generate and manage student progress reports"
        actions={actions}
      >
        <StandardLoadingState message="Loading progress reports..." />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Progress Reports"
      description="Generate and manage student progress reports"
      actions={actions}
    >
      <DSSpacer size="lg" />
      
      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="generate" className="text-base">Generate Reports</TabsTrigger>
          <TabsTrigger value="overview" className="text-base">Overview</TabsTrigger>
          <TabsTrigger value="history" className="text-base">Report History</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-8">
          <DSCard>
            <DSCardHeader>
              <DSCardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-3 text-[#2563eb]" />
                Generate New Reports
              </DSCardTitle>
            </DSCardHeader>
            <DSCardContent>
              <ProgressReportGenerator />
            </DSCardContent>
          </DSCard>
        </TabsContent>

        <TabsContent value="overview" className="space-y-8">
          <DSCard>
            <DSCardHeader>
              <DSCardTitle>Reports Overview</DSCardTitle>
            </DSCardHeader>
            <DSCardContent>
              <ProgressReportsOverview 
                students={students}
                reports={reports}
                selectedCount={0}
              />
            </DSCardContent>
          </DSCard>
        </TabsContent>

        <TabsContent value="history" className="space-y-8">
          <DSCard>
            <DSCardHeader>
              <DSCardTitle>Recent Reports</DSCardTitle>
            </DSCardHeader>
            <DSCardContent>
              <RecentReports reports={reports} />
            </DSCardContent>
          </DSCard>
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
};

export default ProgressReports;
