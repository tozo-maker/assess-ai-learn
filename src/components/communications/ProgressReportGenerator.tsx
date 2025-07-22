
import React, { useState } from 'react';
import StandardLoadingState from '@/components/common/StandardLoadingState';
import StudentSelectionCard from './StudentSelectionCard';
import ReportOptionsCard from './ReportOptionsCard';
import ReportGenerationActions from './ReportGenerationActions';
import { useStudents } from '@/hooks/useStudents';
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

  const { data: students, isLoading } = useStudents();

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
      // Get current user for teacher_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      let successCount = 0;
      let failCount = 0;

      // Generate report for each selected student
      for (const studentId of selectedStudents) {
        const student = students?.find(s => s.id === studentId);
        if (!student) continue;

        try {
          if (format === 'pdf') {
            console.log(`Generating PDF for student: ${studentId}`);
            
            const { data, error } = await supabase.functions.invoke('generate-progress-pdf', {
              body: { student_id: studentId }
            });

            if (error) {
              console.error(`PDF generation error for ${student.first_name}:`, error);
              failCount++;
              continue;
            }

            if (data?.pdf_url) {
              console.log('PDF generated successfully, creating download link');
              
              // Create download link
              const link = document.createElement('a');
              link.href = data.pdf_url;
              link.download = `${student.first_name}_${student.last_name}_Progress_Report.pdf`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              
              successCount++;
            } else {
              console.error('No PDF URL returned');
              failCount++;
            }
          } else if (format === 'email') {
            console.log(`Sending email for student: ${studentId}`);
            
            // Generate progress report data first
            const { data: reportData, error: reportError } = await supabase.functions.invoke('generate-progress-report', {
              body: { student_id: studentId }
            });

            if (reportError) {
              console.error(`Progress report generation error for ${student.first_name}:`, reportError);
              failCount++;
              continue;
            }

            // Create communication record with teacher_id
            const { error: commError } = await supabase
              .from('parent_communications')
              .insert({
                student_id: studentId,
                teacher_id: user.id,
                communication_type: 'progress_report',
                subject: `Progress Report for ${student.first_name} ${student.last_name}`,
                content: `Progress report generated on ${new Date().toLocaleDateString()}`,
                parent_email: student.parent_email || 'parent@example.com'
              });

            if (commError) {
              console.error(`Communication record creation error for ${student.first_name}:`, commError);
              failCount++;
            } else {
              successCount++;
            }
          }
        } catch (error) {
          console.error(`Error processing ${student.first_name}:`, error);
          failCount++;
        }
      }

      // Show results
      if (successCount > 0) {
        toast({
          title: "Reports generated successfully",
          description: `${format === 'pdf' ? 'PDF downloads' : 'Email communications'} created for ${successCount} students.${failCount > 0 ? ` ${failCount} failed.` : ''}`,
        });
      }

      if (failCount > 0 && successCount === 0) {
        toast({
          title: "Report generation failed",
          description: "There was an error generating the progress reports. Please check the console for details.",
          variant: "destructive"
        });
      }

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
