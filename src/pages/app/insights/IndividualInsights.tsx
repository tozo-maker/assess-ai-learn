
import React, { useState } from 'react';
import { StandardPageLayout } from '@/components/layout/StandardPageLayout';
import { User } from 'lucide-react';
import { StudentSelector } from '@/components/insights/StudentSelector';
import { IndividualInsightsDashboard } from '@/components/insights/IndividualInsightsDashboard';
import { useStudentsData } from '@/hooks/useStudentsData';

const IndividualInsights: React.FC = () => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const { students } = useStudentsData();

  const selectedStudent = students?.find(s => s.id === selectedStudentId);

  const actions = (
    <div className="flex items-center gap-4">
      <StudentSelector 
        onStudentSelect={setSelectedStudentId}
        selectedStudentId={selectedStudentId}
      />
      <User className="h-5 w-5 text-primary" />
    </div>
  );

  return (
    <StandardPageLayout 
      title="Individual Insights"
      description="Analyze individual student performance and learning patterns"
      actions={actions}
      breadcrumbs={[
        { label: 'Insights', href: '/app/insights' },
        { label: 'Individual Insights' }
      ]}
    >
      {selectedStudent ? (
        <IndividualInsightsDashboard 
          studentId={selectedStudent.id}
          studentName={`${selectedStudent.first_name} ${selectedStudent.last_name}`}
        />
      ) : (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Select a Student</h3>
            <p className="text-muted-foreground">
              Choose a student from the dropdown above to view their detailed insights and analytics.
            </p>
          </div>
        </div>
      )}
    </StandardPageLayout>
  );
};

export default IndividualInsights;
