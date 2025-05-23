
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageShell from '@/components/ui/page-shell';
import { Upload, Download, FileText, Database, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { studentService } from '@/services/student-service';
import { exportsService } from '@/services/exports-service';
import { ExportRequestData } from '@/types/exports';

const ExportReports = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [exportConfig, setExportConfig] = useState({
    export_type: '',
    export_format: 'csv',
    selected_students: [],
    grade_level: '',
    subject: ''
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getStudents
  });

  const { data: exports = [] } = useQuery({
    queryKey: ['exports'],
    queryFn: exportsService.getExports
  });

  const requestExportMutation = useMutation({
    mutationFn: exportsService.requestExport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exports'] });
      setExportConfig({
        export_type: '',
        export_format: 'csv',
        selected_students: [],
        grade_level: '',
        subject: ''
      });
      toast({
        title: 'Export requested',
        description: 'Your export is being processed. You\'ll be notified when it\'s ready.'
      });
    },
    onError: (error) => {
      toast({
        title: 'Export failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const downloadExportMutation = useMutation({
    mutationFn: exportsService.downloadExport,
    onSuccess: (fileUrl) => {
      window.open(fileUrl, '_blank');
    }
  });

  const handleRequestExport = () => {
    if (!exportConfig.export_type) {
      toast({
        title: 'Export type required',
        description: 'Please select what you want to export.',
        variant: 'destructive'
      });
      return;
    }

    const exportData: ExportRequestData = {
      export_type: exportConfig.export_type as any,
      export_format: exportConfig.export_format as any,
      filters: {
        ...(exportConfig.selected_students.length > 0 && { 
          student_ids: exportConfig.selected_students 
        }),
        ...(exportConfig.grade_level && { grade_level: exportConfig.grade_level }),
        ...(exportConfig.subject && { subject: exportConfig.subject })
      }
    };

    requestExportMutation.mutate(exportData);
  };

  const handleStudentSelection = (studentId: string, checked: boolean) => {
    setExportConfig(prev => ({
      ...prev,
      selected_students: checked
        ? [...prev.selected_students, studentId]
        : prev.selected_students.filter(id => id !== studentId)
    }));
  };

  const selectAllStudents = () => {
    setExportConfig(prev => ({
      ...prev,
      selected_students: students.map(s => s.id)
    }));
  };

  const clearStudentSelection = () => {
    setExportConfig(prev => ({
      ...prev,
      selected_students: []
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const uniqueGradeLevels = [...new Set(students.map(s => s.grade_level))];
  const uniqueSubjects = ['math', 'reading', 'science', 'social', 'writing']; // This could come from assessments

  return (
    <PageShell 
      title="Export Data" 
      description="Export your data in various formats"
      icon={<Upload className="h-6 w-6 text-blue-600" />}
    >
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Exports</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{exports.length}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {exports.filter(e => e.status === 'completed').length}
              </div>
              <p className="text-xs text-muted-foreground">Ready for download</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {exports.filter(e => e.status === 'processing').length}
              </div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create New Export</CardTitle>
            <p className="text-sm text-gray-600">
              Export your student data, assessment results, and reports
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Export Type</label>
                  <Select 
                    value={exportConfig.export_type} 
                    onValueChange={(value) => setExportConfig({...exportConfig, export_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="What do you want to export?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student_data">Student Information</SelectItem>
                      <SelectItem value="assessment_results">Assessment Results</SelectItem>
                      <SelectItem value="progress_reports">Progress Reports</SelectItem>
                      <SelectItem value="class_summary">Class Summary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Format</label>
                  <Select 
                    value={exportConfig.export_format} 
                    onValueChange={(value) => setExportConfig({...exportConfig, export_format: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                      <SelectItem value="pdf">PDF (Report)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Grade Level (Optional)</label>
                  <Select 
                    value={exportConfig.grade_level} 
                    onValueChange={(value) => setExportConfig({...exportConfig, grade_level: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by grade level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Grades</SelectItem>
                      {uniqueGradeLevels.map(grade => (
                        <SelectItem key={grade} value={grade}>Grade {grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Subject (Optional)</label>
                  <Select 
                    value={exportConfig.subject} 
                    onValueChange={(value) => setExportConfig({...exportConfig, subject: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Subjects</SelectItem>
                      {uniqueSubjects.map(subject => (
                        <SelectItem key={subject} value={subject}>
                          {subject.charAt(0).toUpperCase() + subject.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium">Students (Optional)</label>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={selectAllStudents}>
                      Select All
                    </Button>
                    <Button size="sm" variant="outline" onClick={clearStudentSelection}>
                      Clear
                    </Button>
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto border rounded-lg p-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {students.map((student) => (
                      <div key={student.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={student.id}
                          checked={exportConfig.selected_students.includes(student.id)}
                          onCheckedChange={(checked) => handleStudentSelection(student.id, checked)}
                        />
                        <label htmlFor={student.id} className="text-sm">
                          {student.first_name} {student.last_name} - Grade {student.grade_level}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Leave empty to include all students matching other filters
                </p>
              </div>

              <Button 
                onClick={handleRequestExport}
                disabled={requestExportMutation.isPending}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {requestExportMutation.isPending ? 'Requesting Export...' : 'Request Export'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Export History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exports.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No exports yet. Create your first export above.
                </p>
              ) : (
                exports.map((exportItem) => (
                  <div key={exportItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(exportItem.status)}
                      <div>
                        <div className="font-medium">
                          {exportItem.export_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                        <div className="text-sm text-gray-600">
                          {exportItem.export_format.toUpperCase()} • {new Date(exportItem.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={
                          exportItem.status === 'completed' ? 'default' :
                          exportItem.status === 'failed' ? 'destructive' : 'secondary'
                        }
                      >
                        {exportItem.status}
                      </Badge>
                      {exportItem.status === 'completed' && (
                        <Button
                          size="sm"
                          onClick={() => downloadExportMutation.mutate(exportItem.id)}
                          disabled={downloadExportMutation.isPending}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
};

export default ExportReports;
