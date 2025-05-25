
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Download, Mail, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { studentService } from '@/services/student-service';
import { assessmentService } from '@/services/assessment-service';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ReportOptions {
  includeInsights: boolean;
  includeGoals: boolean;
  includeRecommendations: boolean;
  timeframe: 'last-month' | 'last-quarter' | 'all-time';
}

const ProgressReportGenerator: React.FC = () => {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [reportOptions, setReportOptions] = useState<ReportOptions>({
    includeInsights: true,
    includeGoals: true,
    includeRecommendations: true,
    timeframe: 'last-month'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getStudents,
  });

  const handleStudentSelection = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
    }
  };

  const generateProgressReport = async (format: 'pdf' | 'email') => {
    if (selectedStudents.length === 0) {
      toast({
        title: "No students selected",
        description: "Please select at least one student to generate a report.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Generate report for each selected student
      for (const studentId of selectedStudents) {
        const student = students?.find(s => s.id === studentId);
        if (!student) continue;

        // Gather student data
        const assessments = await assessmentService.getAssessments();
        const studentAssessments = [];
        const studentAnalyses = [];

        for (const assessment of assessments) {
          const responses = await assessmentService.getStudentResponses(assessment.id, studentId);
          if (responses.length > 0) {
            studentAssessments.push({
              assessment,
              responses,
              totalScore: responses.reduce((sum, r) => sum + r.score, 0),
              maxScore: assessment.max_score
            });

            const analysis = await assessmentService.getAssessmentAnalysis(assessment.id, studentId);
            if (analysis) {
              studentAnalyses.push({ assessment, analysis });
            }
          }
        }

        // Create report data
        const reportData = {
          student: {
            first_name: student.first_name,
            last_name: student.last_name,
            grade_level: student.grade_level,
            student_id: student.student_id
          },
          assessments: studentAssessments,
          analyses: studentAnalyses,
          options: reportOptions,
          generated_at: new Date().toISOString()
        };

        if (format === 'pdf') {
          // Call PDF generation function
          const { data, error } = await supabase.functions.invoke('generate-progress-pdf', {
            body: {
              student_id: studentId,
              report_data: reportData
            }
          });

          if (error) throw error;

          if (data?.pdf_url) {
            // Download PDF
            const link = document.createElement('a');
            link.href = data.pdf_url;
            link.download = `${student.first_name}_${student.last_name}_Progress_Report.pdf`;
            link.click();
          }
        } else if (format === 'email') {
          // Call email sending function
          const { data, error } = await supabase.functions.invoke('send-parent-communication', {
            body: {
              student_id: studentId,
              communication_type: 'progress_report',
              subject: `Progress Report for ${student.first_name} ${student.last_name}`,
              report_data: reportData,
              parent_email: student.parent_email || 'parent@example.com' // Would need to add this field
            }
          });

          if (error) throw error;
        }
      }

      toast({
        title: "Reports generated successfully",
        description: `${format === 'pdf' ? 'PDF downloads' : 'Emails'} have been generated for ${selectedStudents.length} students.`,
      });

    } catch (error) {
      console.error('Error generating reports:', error);
      toast({
        title: "Report generation failed",
        description: "There was an error generating the progress reports. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Generate Progress Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Student Selection */}
          <div>
            <h3 className="font-medium mb-3">Select Students</h3>
            <div className="max-h-60 overflow-y-auto border rounded-lg p-3">
              {students?.map(student => (
                <div key={student.id} className="flex items-center space-x-2 py-2">
                  <Checkbox
                    id={student.id}
                    checked={selectedStudents.includes(student.id)}
                    onCheckedChange={(checked) => 
                      handleStudentSelection(student.id, checked as boolean)
                    }
                  />
                  <label 
                    htmlFor={student.id}
                    className="flex-1 cursor-pointer"
                  >
                    {student.first_name} {student.last_name} ({student.grade_level})
                  </label>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2 mt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedStudents(students?.map(s => s.id) || [])}
              >
                Select All
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedStudents([])}
              >
                Clear Selection
              </Button>
            </div>
          </div>

          {/* Report Options */}
          <div>
            <h3 className="font-medium mb-3">Report Options</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="insights"
                  checked={reportOptions.includeInsights}
                  onCheckedChange={(checked) =>
                    setReportOptions(prev => ({ ...prev, includeInsights: checked as boolean }))
                  }
                />
                <label htmlFor="insights">Include AI Insights & Analysis</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="goals"
                  checked={reportOptions.includeGoals}
                  onCheckedChange={(checked) =>
                    setReportOptions(prev => ({ ...prev, includeGoals: checked as boolean }))
                  }
                />
                <label htmlFor="goals">Include Learning Goals Progress</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recommendations"
                  checked={reportOptions.includeRecommendations}
                  onCheckedChange={(checked) =>
                    setReportOptions(prev => ({ ...prev, includeRecommendations: checked as boolean }))
                  }
                />
                <label htmlFor="recommendations">Include Teacher Recommendations</label>
              </div>
            </div>
          </div>

          {/* Timeframe Selection */}
          <div>
            <h3 className="font-medium mb-3">Timeframe</h3>
            <Select 
              value={reportOptions.timeframe}
              onValueChange={(value: 'last-month' | 'last-quarter' | 'all-time') =>
                setReportOptions(prev => ({ ...prev, timeframe: value }))
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="last-quarter">Last Quarter</SelectItem>
                <SelectItem value="all-time">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Generation Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              onClick={() => generateProgressReport('pdf')}
              disabled={isGenerating || selectedStudents.length === 0}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate PDF Reports'}
            </Button>
            
            <Button 
              onClick={() => generateProgressReport('email')}
              disabled={isGenerating || selectedStudents.length === 0}
              variant="outline"
              className="flex-1"
            >
              <Mail className="h-4 w-4 mr-2" />
              {isGenerating ? 'Sending...' : 'Email to Parents'}
            </Button>
          </div>

          {selectedStudents.length > 0 && (
            <div className="text-sm text-gray-600 text-center">
              {selectedStudents.length} student{selectedStudents.length > 1 ? 's' : ''} selected
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressReportGenerator;
