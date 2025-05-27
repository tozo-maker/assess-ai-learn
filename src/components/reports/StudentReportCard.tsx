
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Download, Eye, Settings } from 'lucide-react';
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
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onSelect(student.id, checked as boolean)}
              />
              
              <div className="flex-1">
                <h3 className="font-medium">
                  {student.first_name} {student.last_name}
                </h3>
                <p className="text-sm text-gray-600">
                  Grade {student.grade_level}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <Badge variant={getPerformanceBadgeVariant()}>
                  {getPerformanceText()}
                </Badge>
                {performance && (
                  <p className="text-sm text-gray-600 mt-1">
                    {performance.assessment_count || 0} assessments
                  </p>
                )}
              </div>

              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onGenerateReport(student.id)}
                  disabled={isGeneratingReport}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  {isGeneratingReport ? 'Loading...' : 'Preview'}
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onGeneratePDF(student.id)}
                  disabled={isGeneratingPDF}
                >
                  <Download className="h-4 w-4 mr-1" />
                  {isGeneratingPDF ? 'Generating...' : 'Quick PDF'}
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowPDFDialog(true)}
                  disabled={isGeneratingPDF}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {performance?.needs_attention && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">
                ⚠️ This student may need additional support
              </p>
            </div>
          )}
        </CardContent>
      </Card>

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
