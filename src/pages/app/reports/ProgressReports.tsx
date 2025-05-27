
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageShell from '@/components/ui/page-shell';
import { FileText, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import ProgressReportViewer from '@/components/communications/ProgressReportViewer';
import ProgressReportsOverview from '@/components/reports/ProgressReportsOverview';
import ProgressReportsFilters from '@/components/reports/ProgressReportsFilters';
import BulkSelection from '@/components/reports/BulkSelection';
import StudentReportCard from '@/components/reports/StudentReportCard';
import RecentReports from '@/components/reports/RecentReports';
import ClassReportsTab from '@/components/reports/ClassReportsTab';
import { studentService } from '@/services/student-service';
import { communicationsService } from '@/services/communications-service';
import { StudentWithPerformance } from '@/types/student';
import { ProgressReportData } from '@/types/communications';
import { PDFGenerationOptions } from '@/services/pdf-service';

const ProgressReports = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [currentReportData, setCurrentReportData] = useState<ProgressReportData | null>(null);
  const [reportType, setReportType] = useState<'individual' | 'class'>('individual');

  // Fetch students
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getStudents
  });

  // Fetch generated reports
  const { data: reports = [] } = useQuery({
    queryKey: ['progress-reports'],
    queryFn: () => communicationsService.getCommunications().then(comms => 
      comms.filter(c => c.communication_type === 'progress_report')
    )
  });

  // Generate individual report mutation
  const generateReportMutation = useMutation({
    mutationFn: communicationsService.generateProgressReport,
    onSuccess: (data) => {
      setCurrentReportData(data);
      setShowReportDialog(true);
    },
    onError: (error) => {
      toast({
        title: 'Error generating report',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Generate PDF mutation
  const generatePDFMutation = useMutation({
    mutationFn: ({ studentId, options }: { studentId: string; options?: PDFGenerationOptions }) => 
      communicationsService.generateProgressReportPDF(studentId, options),
    onSuccess: (pdfUrl) => {
      // Auto-download the PDF
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `progress_report_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'PDF Generated',
        description: 'The progress report PDF has been generated and downloaded successfully.'
      });
      queryClient.invalidateQueries({ queryKey: ['progress-reports'] });
    },
    onError: (error) => {
      toast({
        title: 'Error generating PDF',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Bulk PDF generation mutation
  const bulkPDFMutation = useMutation({
    mutationFn: ({ studentIds, options }: { studentIds: string[]; options?: PDFGenerationOptions }) =>
      communicationsService.generateBulkProgressReports(studentIds, options),
    onSuccess: (results) => {
      const { success, failed } = results;
      toast({
        title: 'Bulk Generation Complete',
        description: `Successfully generated ${success.length} reports. ${failed.length > 0 ? `${failed.length} failed.` : ''}`
      });
      setSelectedStudents(new Set());
      queryClient.invalidateQueries({ queryKey: ['progress-reports'] });
    },
    onError: (error) => {
      toast({
        title: 'Error generating bulk reports',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Filter students based on search and grade
  const filteredStudents = students.filter(student => {
    const matchesSearch = searchQuery === '' || 
      `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesGrade = gradeFilter === 'all' || student.grade_level === gradeFilter;
    
    return matchesSearch && matchesGrade;
  });

  // Get unique grade levels
  const gradelevels = [...new Set(students.map(s => s.grade_level))].sort();

  const handleStudentSelect = (studentId: string, checked: boolean) => {
    const newSelected = new Set(selectedStudents);
    if (checked) {
      newSelected.add(studentId);
    } else {
      newSelected.delete(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(new Set(filteredStudents.map(s => s.id)));
    } else {
      setSelectedStudents(new Set());
    }
  };

  const handleGenerateIndividualReport = (studentId: string) => {
    generateReportMutation.mutate(studentId);
  };

  const handleGeneratePDF = (studentId: string, options?: PDFGenerationOptions) => {
    generatePDFMutation.mutate({ studentId, options });
  };

  const handleBulkPDFGeneration = async () => {
    if (selectedStudents.size === 0) {
      toast({
        title: 'No students selected',
        description: 'Please select students to generate reports for.',
        variant: 'destructive'
      });
      return;
    }

    bulkPDFMutation.mutate({ 
      studentIds: Array.from(selectedStudents)
    });
  };

  const isAllSelected = filteredStudents.length > 0 && 
    filteredStudents.every(student => selectedStudents.has(student.id));
  const isIndeterminate = selectedStudents.size > 0 && !isAllSelected;

  return (
    <PageShell 
      title="Progress Reports" 
      description="Generate comprehensive student progress reports"
      icon={<FileText className="h-6 w-6 text-blue-600" />}
    >
      <div className="space-y-6">
        {/* Overview Cards */}
        <ProgressReportsOverview 
          students={students}
          reports={reports}
          selectedCount={selectedStudents.size}
        />

        {/* Report Generation Tabs */}
        <Tabs value={reportType} onValueChange={(value) => setReportType(value as 'individual' | 'class')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individual">Individual Reports</TabsTrigger>
            <TabsTrigger value="class">Class Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="individual" className="space-y-6">
            {/* Filters and Search */}
            <ProgressReportsFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              gradeFilter={gradeFilter}
              setGradeFilter={setGradeFilter}
              gradelevels={gradelevels}
              selectedCount={selectedStudents.size}
              onBulkPDFGeneration={handleBulkPDFGeneration}
              isGeneratingPDF={bulkPDFMutation.isPending}
            />

            {/* Bulk Selection */}
            {filteredStudents.length > 0 && (
              <BulkSelection
                isAllSelected={isAllSelected}
                isIndeterminate={isIndeterminate}
                onSelectAll={handleSelectAll}
                totalStudents={filteredStudents.length}
                selectedCount={selectedStudents.size}
              />
            )}

            {/* Student List */}
            <div className="grid gap-4">
              {studentsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2">Loading students...</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No students found</h3>
                    <p className="text-gray-500">
                      {searchQuery || gradeFilter !== 'all' ? 'Try adjusting your filters.' : 'Add students to generate reports.'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredStudents.map((student) => (
                  <StudentReportCard
                    key={student.id}
                    student={student}
                    isSelected={selectedStudents.has(student.id)}
                    onSelect={handleStudentSelect}
                    onGenerateReport={handleGenerateIndividualReport}
                    onGeneratePDF={handleGeneratePDF}
                    isGeneratingReport={generateReportMutation.isPending}
                    isGeneratingPDF={generatePDFMutation.isPending}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="class" className="space-y-6">
            <ClassReportsTab />
          </TabsContent>
        </Tabs>

        {/* Recent Reports */}
        <RecentReports reports={reports} />

        {/* Report Preview Dialog */}
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Progress Report Preview</DialogTitle>
            </DialogHeader>
            {currentReportData && (
              <ProgressReportViewer reportData={currentReportData} />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PageShell>
  );
};

export default ProgressReports;
