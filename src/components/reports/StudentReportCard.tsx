
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Download } from 'lucide-react';
import { StudentWithPerformance } from '@/types/student';

interface StudentReportCardProps {
  student: StudentWithPerformance;
  isSelected: boolean;
  onSelect: (studentId: string, checked: boolean) => void;
  onGenerateReport: (studentId: string) => void;
  onGeneratePDF: (studentId: string) => void;
  isGeneratingReport: boolean;
  isGeneratingPDF: boolean;
}

const StudentReportCard: React.FC<StudentReportCardProps> = ({
  student,
  isSelected,
  onSelect,
  onGenerateReport,
  onGeneratePDF,
  isGeneratingReport,
  isGeneratingPDF
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onSelect(student.id, checked as boolean)}
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
              onClick={() => onGenerateReport(student.id)}
              disabled={isGeneratingReport}
            >
              <FileText className="h-4 w-4 mr-1" />
              Preview
            </Button>
            <Button
              size="sm"
              onClick={() => onGeneratePDF(student.id)}
              disabled={isGeneratingPDF}
            >
              <Download className="h-4 w-4 mr-1" />
              {isGeneratingPDF ? 'Generating...' : 'PDF'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentReportCard;
