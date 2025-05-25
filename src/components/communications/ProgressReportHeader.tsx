
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface ProgressReportHeaderProps {
  student: {
    first_name: string;
    last_name: string;
    grade_level: string;
  };
}

const ProgressReportHeader: React.FC<ProgressReportHeaderProps> = ({ student }) => {
  return (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-2xl font-bold print:text-3xl">
          Progress Report: {student.first_name} {student.last_name}
        </h1>
        <p className="text-muted-foreground">Grade {student.grade_level} • {new Date().toLocaleDateString()}</p>
      </div>
      <Button className="print:hidden">
        <Download className="h-4 w-4 mr-2" />
        Print Report
      </Button>
    </div>
  );
};

export default ProgressReportHeader;
