
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageShell from '@/components/ui/page-shell';
import { FileText, Download, Users, Filter, Calendar, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import ProgressReportViewer from '@/components/communications/ProgressReportViewer';
import { studentService } from '@/services/student-service';
import { communicationsService } from '@/services/communications-service';
import { StudentWithPerformance } from '@/types/student';
import { ProgressReportData } from '@/types/communications';

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
    mutationFn: communicationsService.generateProgressReportPDF,
    onSuccess: (pdfUrl) => {
      window.open(pdfUrl, '_blank');
      toast({
        title: 'PDF Generated',
        description: 'The progress report PDF has been generated successfully.'
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

    toast({
      title: 'Generating reports',
      description: `Generating PDF reports for ${selectedStudents.size} students...`
    });

    try {
      const promises = Array.from(selectedStudents).map(studentId =>
        communicationsService.generateProgressReportPDF(studentId)
      );
      
      await Promise.all(promises);
      
      toast({
        title: 'Reports generated',
        description: `Successfully generated ${selectedStudents.size} PDF reports.`
      });
      
      setSelectedStudents(new Set());
      queryClient.invalidateQueries({ queryKey: ['progress-reports'] });
    } catch (error) {
      toast({
        title: 'Error generating reports',
        description: 'Some reports failed to generate.',
        variant: 'destructive'
      });
    }
  };

  const studentsWithAttention = students.filter(student => 
    student.performance && !Array.isArray(student.performance) && student.performance.needs_attention
  );

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
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
              <p className="text-xs text-muted-foreground">Active students</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reports Generated</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reports.length}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Need Attention</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studentsWithAttention.length}</div>
              <p className="text-xs text-muted-foreground">Students requiring support</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Selected</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedStudents.size}</div>
              <p className="text-xs text-muted-foreground">Students selected</p>
            </CardContent>
          </Card>
        </div>

        {/* Report Generation Tabs */}
        <Tabs value={reportType} onValueChange={(value) => setReportType(value as 'individual' | 'class')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individual">Individual Reports</TabsTrigger>
            <TabsTrigger value="class">Class Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="individual" className="space-y-6">
            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search students..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger className="w-48">
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by grade" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  {gradelevels.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      Grade {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedStudents.size > 0 && (
                <Button
                  onClick={handleBulkPDFGeneration}
                  disabled={generatePDFMutation.isPending}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generate PDFs ({selectedStudents.size})
                </Button>
              )}
            </div>

            {/* Bulk Selection */}
            {filteredStudents.length > 0 && (
              <div className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50">
                <Checkbox
                  checked={isAllSelected ? true : isIndeterminate ? "indeterminate" : false}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-gray-600">
                  Select all students ({filteredStudents.length})
                </span>
                {selectedStudents.size > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {selectedStudents.size} selected
                  </Badge>
                )}
              </div>
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
                  <Card key={student.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedStudents.has(student.id)}
                            onCheckedChange={(checked) => 
                              handleStudentSelect(student.id, checked as boolean)
                            }
                          />
                          <div>
                            <h3 className="font-medium">
                              {student.first_name} {student.last_name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Grade {student.grade_level}
                              {student.performance && !Array.isArray(student.performance) && (
                                <>
                                  {' • '}
                                  <span className={
                                    student.performance.needs_attention 
                                      ? 'text-red-600' 
                                      : 'text-green-600'
                                  }>
                                    {student.performance.performance_level || 'No data'}
                                  </span>
                                </>
                              )}
                            </p>
                          </div>
                          {student.performance && 
                           !Array.isArray(student.performance) && 
                           student.performance.needs_attention && (
                            <Badge variant="destructive" className="ml-2">
                              Needs Attention
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGenerateIndividualReport(student.id)}
                            disabled={generateReportMutation.isPending}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleGeneratePDF(student.id)}
                            disabled={generatePDFMutation.isPending}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            {generatePDFMutation.isPending ? 'Generating...' : 'PDF'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="class" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Class-Wide Reports</CardTitle>
                <p className="text-sm text-gray-600">
                  Generate comprehensive reports for the entire class or specific grade levels
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Button variant="outline" className="h-20 flex-col">
                      <Users className="h-6 w-6 mb-2" />
                      <span>Class Performance Summary</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <FileText className="h-6 w-6 mb-2" />
                      <span>Standards Mastery Report</span>
                    </Button>
                  </div>
                  <div className="text-center text-gray-500 py-8">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Class-wide reporting features coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reports.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No reports generated yet. Create your first progress report above.
                </p>
              ) : (
                reports.slice(0, 10).map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{report.subject}</div>
                      <div className="text-sm text-gray-600">
                        Generated on {new Date(report.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {report.pdf_url && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(report.pdf_url, '_blank')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

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
