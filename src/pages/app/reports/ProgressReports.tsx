
import React from 'react';
import StandardPageLayout from '@/components/layout/StandardPageLayout';
import { FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProgressReportsOverview from '@/components/reports/ProgressReportsOverview';
import ReportOptionsCard from '@/components/communications/ReportOptionsCard';
import IndividualReportsContent from '@/components/reports/IndividualReportsContent';
import ClassReportsTab from '@/components/reports/ClassReportsTab';
import RecentReports from '@/components/reports/RecentReports';
import ReportPreviewDialog from '@/components/reports/ReportPreviewDialog';
import StandardLoadingState from '@/components/common/StandardLoadingState';
import { useProgressReports } from '@/hooks/useProgressReports';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ProgressReports = () => {
  const {
    // Data
    students,
    reports,
    filteredStudents,
    gradelevels,
    studentsLoading,
    
    // State
    searchQuery,
    setSearchQuery,
    gradeFilter,
    setGradeFilter,
    selectedStudents,
    showReportDialog,
    setShowReportDialog,
    currentReportData,
    reportType,
    setReportType,
    reportOptions,
    setReportOptions,
    
    // Selection state
    isAllSelected,
    isIndeterminate,
    
    // Handlers
    handleStudentSelect,
    handleSelectAll,
    handleGenerateIndividualReport,
    handleGeneratePDF,
    handleBulkPDFGeneration,
    
    // Mutations
    generateReportMutation,
    generatePDFMutation,
    bulkPDFMutation
  } = useProgressReports();

  const actions = (
    <FileText className="h-5 w-5 text-primary" />
  );

  if (studentsLoading) {
    return (
      <StandardPageLayout 
        title="Progress Reports"
        actions={actions}
      >
        <StandardLoadingState message="Loading students and reports..." />
      </StandardPageLayout>
    );
  }

  return (
    <StandardPageLayout 
      title="Progress Reports"
      actions={actions}
      breadcrumbs={[
        { label: 'Reports', href: '/app/reports' },
        { label: 'Progress Reports' }
      ]}
    >
      <div className="space-y-8">
        {/* Overview Cards */}
        <ProgressReportsOverview 
          students={students}
          reports={reports}
          selectedCount={selectedStudents.size}
        />

        {/* Report Options Configuration */}
        <ReportOptionsCard
          reportOptions={reportOptions}
          onOptionsChange={setReportOptions}
        />

        {/* Report Generation Tabs */}
        <Tabs value={reportType} onValueChange={(value) => setReportType(value as 'individual' | 'class')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individual">Individual Reports</TabsTrigger>
            <TabsTrigger value="class">Class Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="individual" className="space-y-6">
            <IndividualReportsContent
              filteredStudents={filteredStudents}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              gradeFilter={gradeFilter}
              setGradeFilter={setGradeFilter}
              gradelevels={gradelevels}
              selectedStudents={selectedStudents}
              isAllSelected={isAllSelected}
              isIndeterminate={isIndeterminate}
              onSelectAll={handleSelectAll}
              onStudentSelect={handleStudentSelect}
              onGenerateReport={handleGenerateIndividualReport}
              onGeneratePDF={handleGeneratePDF}
              onBulkPDFGeneration={handleBulkPDFGeneration}
              isGeneratingReport={generateReportMutation.isPending}
              isGeneratingPDF={generatePDFMutation.isPending}
              isBulkGenerating={bulkPDFMutation.isPending}
            />
          </TabsContent>

          <TabsContent value="class" className="space-y-6">
            <ClassReportsTab />
          </TabsContent>
        </Tabs>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentReports reports={reports} />
          </CardContent>
        </Card>

        {/* Report Preview Dialog */}
        <ReportPreviewDialog
          open={showReportDialog}
          onOpenChange={setShowReportDialog}
          reportData={currentReportData}
        />
      </div>
    </StandardPageLayout>
  );
};

export default ProgressReports;
