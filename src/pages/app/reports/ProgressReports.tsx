
import React from 'react';
import PageTemplate from '@/components/ui/page-template';
import { FileText } from 'lucide-react';
import {
  DSCard,
  DSCardContent,
  DSCardHeader,
  DSCardTitle,
  DSFlexContainer,
  DSSpacer
} from '@/components/ui/design-system';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProgressReportsOverview from '@/components/reports/ProgressReportsOverview';
import ReportOptionsCard from '@/components/communications/ReportOptionsCard';
import IndividualReportsContent from '@/components/reports/IndividualReportsContent';
import ClassReportsTab from '@/components/reports/ClassReportsTab';
import RecentReports from '@/components/reports/RecentReports';
import ReportPreviewDialog from '@/components/reports/ReportPreviewDialog';
import StandardLoadingState from '@/components/common/StandardLoadingState';
import { useProgressReports } from '@/hooks/useProgressReports';

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
    <DSFlexContainer gap="sm">
      <FileText className="h-5 w-5 text-[#2563eb]" />
    </DSFlexContainer>
  );

  if (studentsLoading) {
    return (
      <PageTemplate
        title="Progress Reports" 
        description="Generate comprehensive student progress reports"
        actions={actions}
      >
        <StandardLoadingState message="Loading students and reports..." />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate 
      title="Progress Reports" 
      description="Generate comprehensive student progress reports"
      actions={actions}
    >
      <DSSpacer size="lg" />
      
      {/* Overview Cards */}
      <ProgressReportsOverview 
        students={students}
        reports={reports}
        selectedCount={selectedStudents.size}
      />

      <DSSpacer size="xl" />

      {/* Report Options Configuration */}
      <ReportOptionsCard
        reportOptions={reportOptions}
        onOptionsChange={setReportOptions}
      />

      <DSSpacer size="xl" />

      {/* Report Generation Tabs */}
      <Tabs value={reportType} onValueChange={(value) => setReportType(value as 'individual' | 'class')}>
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="individual" className="text-base">Individual Reports</TabsTrigger>
          <TabsTrigger value="class" className="text-base">Class Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="individual" className="space-y-8">
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

        <TabsContent value="class" className="space-y-8">
          <ClassReportsTab />
        </TabsContent>
      </Tabs>

      <DSSpacer size="xl" />

      {/* Recent Reports */}
      <DSCard>
        <DSCardHeader>
          <DSCardTitle>Recent Reports</DSCardTitle>
        </DSCardHeader>
        <DSCardContent>
          <RecentReports reports={reports} />
        </DSCardContent>
      </DSCard>

      {/* Report Preview Dialog */}
      <ReportPreviewDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        reportData={currentReportData}
      />
    </PageTemplate>
  );
};

export default ProgressReports;
