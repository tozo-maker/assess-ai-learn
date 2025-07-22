
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { studentService } from '@/services/student-service';
import { communicationsService } from '@/services/communications-service';
import { ProgressReportData } from '@/types/communications';

interface ReportOptions {
  includeInsights: boolean;
  includeGoals: boolean;
  includeRecommendations: boolean;
  timeframe: 'last-month' | 'last-quarter' | 'all-time';
}

export const useProgressReports = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [currentReportData, setCurrentReportData] = useState<ProgressReportData | null>(null);
  const [reportType, setReportType] = useState<'individual' | 'class'>('individual');
  const [reportOptions, setReportOptions] = useState<ReportOptions>({
    includeInsights: true,
    includeGoals: true,
    includeRecommendations: true,
    timeframe: 'last-month'
  });

  // Fetch students
  const { data: students = [], isLoading: studentsLoading } = useStudents();

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
    mutationFn: (studentId: string) => 
      communicationsService.generateProgressReportPDF(studentId),
    onSuccess: (pdfUrl) => {
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
    mutationFn: (studentIds: string[]) =>
      communicationsService.generateBulkProgressReports(studentIds),
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

  const handleGeneratePDF = (studentId: string) => {
    generatePDFMutation.mutate(studentId);
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

    bulkPDFMutation.mutate(Array.from(selectedStudents));
  };

  const isAllSelected = filteredStudents.length > 0 && 
    filteredStudents.every(student => selectedStudents.has(student.id));
  const isIndeterminate = selectedStudents.size > 0 && !isAllSelected;

  return {
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
  };
};
