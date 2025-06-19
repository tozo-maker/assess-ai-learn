
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { studentService } from '@/services/student-service';
import AppLayout from '@/components/layout/AppLayout';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import StudentInfoCard from '@/components/students/StudentInfoCard';
import StudentProfileTabs from '@/components/students/StudentProfileTabs';
import MobileOptimizedLayout from '@/components/layout/MobileOptimizedLayout';
import UniversalLoadingState from '@/components/common/UniversalLoadingState';
import EnhancedErrorState from '@/components/common/EnhancedErrorState';

const StudentProfile: React.FC = () => {
  const { id: studentId } = useParams<{ id: string }>();

  const { data: student, isLoading, error, refetch } = useQuery({
    queryKey: ['student', studentId],
    queryFn: () => studentService.getStudentById(studentId),
  });

  return (
    <AppLayout>
      <MobileOptimizedLayout>
        <Breadcrumbs />
        
        {isLoading ? (
          <UniversalLoadingState type="dashboard" message="Loading student profile..." />
        ) : error ? (
          <EnhancedErrorState
            error={error}
            title="Failed to load student profile"
            description="There was an error loading the student's information. Please try again."
            onRetry={refetch}
          />
        ) : !student ? (
          <EnhancedErrorState
            title="Student not found"
            description="The student you're looking for doesn't exist or you don't have permission to view them."
            showNavigationOptions={true}
          />
        ) : (
          <div className="space-y-6">
            <StudentInfoCard student={student} />
            <StudentProfileTabs studentId={studentId} />
          </div>
        )}
      </MobileOptimizedLayout>
    </AppLayout>
  );
};

export default StudentProfile;
