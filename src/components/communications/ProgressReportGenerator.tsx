
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import StandardLoadingState from '@/components/common/StandardLoadingState';
import StudentSelectionCard from './StudentSelectionCard';
import ReportOptionsCard from './ReportOptionsCard';
import ReportGenerationActions from './ReportGenerationActions';
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

  const handleSelectAll = () => {
    setSelectedStudents(students?.map(s => s.id) || []);
  };

  const handleClearSelection = () => {
    setSelectedStudents([]);
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
      <StudentSelectionCard
        students={students || []}
        selectedStudents={selectedStudents}
        onStudentSelection={handleStudentSelection}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
      />

      <ReportOptionsCard
        reportOptions={reportOptions}
        onOptionsChange={setReportOptions}
      />

      <ReportGenerationActions
        selectedCount={selectedStudents.length}
        isGenerating={isGenerating}
        onGeneratePDF={() => generateProgressReport('pdf')}
        onEmailToParents={() => generateProgressReport('email')}
      />
    </div>
  );
};

export default ProgressReportGenerator;
