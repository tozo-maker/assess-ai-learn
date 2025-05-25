
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText } from 'lucide-react';
import { StudentWithPerformance } from '@/types/student';
import { ParentCommunication } from '@/types/communications';

interface ProgressReportsOverviewProps {
  students: StudentWithPerformance[];
  reports: ParentCommunication[];
  selectedCount: number;
}

const ProgressReportsOverview: React.FC<ProgressReportsOverviewProps> = ({
  students,
  reports,
  selectedCount
}) => {
  const studentsWithAttention = students.filter(student => 
    student.performance && !Array.isArray(student.performance) && student.performance.needs_attention
  );

  return (
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
          <div className="text-2xl font-bold">{selectedCount}</div>
          <p className="text-xs text-muted-foreground">Students selected</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressReportsOverview;
