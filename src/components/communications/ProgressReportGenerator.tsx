
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Download, Mail, Users, Calendar } from 'lucide-react';
import {
  DSButton,
  DSCard,
  DSCardContent,
  DSCardHeader,
  DSCardTitle,
  DSFlexContainer,
  DSBodyText,
  DSSpacer
} from '@/components/ui/design-system';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import StandardLoadingState from '@/components/common/StandardLoadingState';
import { studentService } from '@/services/student-service';
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

  const { data: students, isLoading } = useQuery({
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

        const reportData = {
          student: {
            first_name: student.first_name,
            last_name: student.last_name,
            grade_level: student.grade_level,
            student_id: student.student_id
          },
          options: reportOptions,
          generated_at: new Date().toISOString()
        };

        if (format === 'pdf') {
          const { data, error } = await supabase.functions.invoke('generate-progress-pdf', {
            body: {
              student_id: studentId,
              report_data: reportData
            }
          });

          if (error) throw error;

          if (data?.pdf_url) {
            const link = document.createElement('a');
            link.href = data.pdf_url;
            link.download = `${student.first_name}_${student.last_name}_Progress_Report.pdf`;
            link.click();
          }
        } else if (format === 'email') {
          const { data, error } = await supabase.functions.invoke('send-parent-communication', {
            body: {
              student_id: studentId,
              communication_type: 'progress_report',
              subject: `Progress Report for ${student.first_name} ${student.last_name}`,
              report_data: reportData,
              parent_email: student.parent_email || 'parent@example.com'
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

  if (isLoading) {
    return <StandardLoadingState message="Loading students..." />;
  }

  return (
    <div className="space-y-8">
      {/* Student Selection */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Select Students</h3>
        <DSCard>
          <DSCardContent className="p-4">
            <div className="max-h-60 overflow-y-auto space-y-3">
              {students?.map(student => (
                <DSFlexContainer key={student.id} align="center" gap="sm" className="py-2">
                  <Checkbox
                    id={student.id}
                    checked={selectedStudents.includes(student.id)}
                    onCheckedChange={(checked) => 
                      handleStudentSelection(student.id, checked as boolean)
                    }
                  />
                  <label 
                    htmlFor={student.id}
                    className="flex-1 cursor-pointer text-base text-gray-700"
                  >
                    {student.first_name} {student.last_name} ({student.grade_level})
                  </label>
                </DSFlexContainer>
              ))}
            </div>
            
            <DSSpacer size="md" />
            
            <DSFlexContainer gap="sm">
              <DSButton 
                variant="secondary" 
                size="sm"
                onClick={() => setSelectedStudents(students?.map(s => s.id) || [])}
              >
                Select All
              </DSButton>
              <DSButton 
                variant="secondary" 
                size="sm"
                onClick={() => setSelectedStudents([])}
              >
                Clear Selection
              </DSButton>
            </DSFlexContainer>
          </DSCardContent>
        </DSCard>
      </div>

      {/* Report Options */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Report Options</h3>
        <DSCard>
          <DSCardContent className="p-4 space-y-4">
            <DSFlexContainer direction="col" gap="md">
              <DSFlexContainer align="center" gap="sm">
                <Checkbox
                  id="insights"
                  checked={reportOptions.includeInsights}
                  onCheckedChange={(checked) =>
                    setReportOptions(prev => ({ ...prev, includeInsights: checked as boolean }))
                  }
                />
                <label htmlFor="insights" className="text-base text-gray-700">Include AI Insights & Analysis</label>
              </DSFlexContainer>
              
              <DSFlexContainer align="center" gap="sm">
                <Checkbox
                  id="goals"
                  checked={reportOptions.includeGoals}
                  onCheckedChange={(checked) =>
                    setReportOptions(prev => ({ ...prev, includeGoals: checked as boolean }))
                  }
                />
                <label htmlFor="goals" className="text-base text-gray-700">Include Learning Goals Progress</label>
              </DSFlexContainer>
              
              <DSFlexContainer align="center" gap="sm">
                <Checkbox
                  id="recommendations"
                  checked={reportOptions.includeRecommendations}
                  onCheckedChange={(checked) =>
                    setReportOptions(prev => ({ ...prev, includeRecommendations: checked as boolean }))
                  }
                />
                <label htmlFor="recommendations" className="text-base text-gray-700">Include Teacher Recommendations</label>
              </DSFlexContainer>
            </DSFlexContainer>
          </DSCardContent>
        </DSCard>
      </div>

      {/* Timeframe Selection */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Timeframe</h3>
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
      <DSCard>
        <DSCardContent className="p-6">
          <DSFlexContainer gap="md" className="flex-col sm:flex-row">
            <DSButton 
              onClick={() => generateProgressReport('pdf')}
              disabled={isGenerating || selectedStudents.length === 0}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate PDF Reports'}
            </DSButton>
            
            <DSButton 
              onClick={() => generateProgressReport('email')}
              disabled={isGenerating || selectedStudents.length === 0}
              variant="secondary"
              className="flex-1"
            >
              <Mail className="h-4 w-4 mr-2" />
              {isGenerating ? 'Sending...' : 'Email to Parents'}
            </DSButton>
          </DSFlexContainer>

          {selectedStudents.length > 0 && (
            <>
              <DSSpacer size="sm" />
              <DSBodyText className="text-center text-gray-600">
                {selectedStudents.length} student{selectedStudents.length > 1 ? 's' : ''} selected
              </DSBodyText>
            </>
          )}
        </DSCardContent>
      </DSCard>
    </div>
  );
};

export default ProgressReportGenerator;
