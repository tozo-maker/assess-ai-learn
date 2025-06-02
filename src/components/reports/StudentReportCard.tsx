
import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { ButtonRedesigned } from '@/components/ui/button-redesigned';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye, Settings } from 'lucide-react';
import {
  DSCard,
  DSCardContent,
  DSFlexContainer,
  DSBodyText
} from '@/components/ui/design-system';
import { StudentWithPerformance } from '@/types/student';
import PDFCustomizationDialog from './PDFCustomizationDialog';
import { PDFGenerationOptions } from '@/services/pdf-service';

interface StudentReportCardProps {
  student: StudentWithPerformance;
  isSelected: boolean;
  onSelect: (studentId: string, checked: boolean) => void;
  onGenerateReport: (studentId: string) => void;
  onGeneratePDF: (studentId: string, options?: PDFGenerationOptions) => void;
  isGeneratingReport?: boolean;
  isGeneratingPDF?: boolean;
}

const StudentReportCard: React.FC<StudentReportCardProps> = ({
  student,
  isSelected,
  onSelect,
  onGenerateReport,
  onGeneratePDF,
  isGeneratingReport = false,
  isGeneratingPDF = false
}) => {
  const [showPDFDialog, setShowPDFDialog] = useState(false);

  const performance = Array.isArray(student.performance) 
    ? student.performance[0] 
    : student.performance;

  const handlePDFGeneration = (options: PDFGenerationOptions) => {
    onGeneratePDF(student.id, options);
    setShowPDFDialog(false);
  };

  const getPerformanceBadgeVariant = () => {
    if (!performance) return 'secondary';
    
    if (performance.needs_attention) return 'destructive';
    if (performance.average_score && performance.average_score >= 85) return 'default';
    return 'secondary';
  };

  const getPerformanceText = () => {
    if (!performance) return 'No data';
    return performance.performance_level || 'Not assessed';
  };

  return (
    <>
      <DSCard>
        <DSCardContent className="p-6">
          <DSFlexContainer justify="between" align="center">
            <DSFlexContainer align="center" gap="md">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onSelect(student.id, checked as boolean)}
              />
              
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  {student.first_name} {student.last_name}
                </h3>
                <DSBodyText className="text-gray-600">
                  Grade {student.grade_level}
                </DSBodyText>
              </div>
            </DSFlexContainer>

            <DSFlexContainer align="center" gap="md">
              <div className="text-right">
                <Badge variant={getPerformanceBadgeVariant()}>
                  {getPerformanceText()}
                </Badge>
                {performance && (
                  <DSBodyText className="text-gray-600 mt-1">
                    {performance.assessment_count || 0} assessments
                  </DSBodyText>
                )}
              </div>

              <DSFlexContainer gap="sm">
                <ButtonRedesigned
                  size="sm"
                  variant="secondary"
                  onClick={() => onGenerateReport(student.id)}
                  disabled={isGeneratingReport}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  {isGeneratingReport ? 'Loading...' : 'Preview'}
                </ButtonRedesigned>
                
                <ButtonRedesigned
                  size="sm"
                  variant="secondary"
                  onClick={() => onGeneratePDF(student.id)}
                  disabled={isGeneratingPDF}
                >
                  <Download className="h-4 w-4 mr-1" />
                  {isGeneratingPDF ? 'Generating...' : 'Quick PDF'}
                </ButtonRedesigned>
                
                <ButtonRedesigned
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowPDFDialog(true)}
                  disabled={isGeneratingPDF}
                >
                  <Settings className="h-4 w-4" />
                </ButtonRedesigned>
              </DSFlexContainer>
            </DSFlexContainer>
          </DSFlexContainer>

          {performance?.needs_attention && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <DSBodyText className="text-red-700">
                ⚠️ This student may need additional support
              </DSBodyText>
            </div>
          )}
        </DSCardContent>
      </DSCard>

      <PDFCustomizationDialog
        open={showPDFDialog}
        onOpenChange={setShowPDFDialog}
        onGenerate={handlePDFGeneration}
        studentName={`${student.first_name} ${student.last_name}`}
        isGenerating={isGeneratingPDF}
      />
    </>
  );
};

export default StudentReportCard;
