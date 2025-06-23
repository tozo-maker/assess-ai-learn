
import React from 'react';
import { StandardPageLayout } from '@/components/layout/StandardPageLayout';
import { Users } from 'lucide-react';
import StudentsMainContent from '@/components/students/StudentsMainContent';
import { useStudentsData } from '@/hooks/useStudentsData';
import PageLoadingState from '@/components/common/PageLoadingState';
import PageErrorState from '@/components/common/PageErrorState';

const Students: React.FC = () => {
  const {
    students,
    isLoading,
    error,
    refetch
  } = useStudentsData();

  const actions = (
    <Users className="h-5 w-5 text-primary" />
  );

  if (isLoading) {
    return (
      <StandardPageLayout 
        title="Students"
        actions={actions}
      >
        <PageLoadingState message="Loading students..." />
      </StandardPageLayout>
    );
  }

  if (error) {
    return (
      <StandardPageLayout 
        title="Students"
        actions={actions}
      >
        <PageErrorState 
          error={error}
          onRetry={refetch}
          title="Students Loading Error"
          description="Failed to load student data. Please try again."
        />
      </StandardPageLayout>
    );
  }

  return (
    <StandardPageLayout 
      title="Students"
      description="Manage your students and track their progress"
      actions={actions}
    >
      <StudentsMainContent students={students || []} />
    </StandardPageLayout>
  );
};

export default Students;
