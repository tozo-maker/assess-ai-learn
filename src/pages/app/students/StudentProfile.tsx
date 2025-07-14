
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { studentService } from '@/services/student-service';
import AppLayout from '@/components/layout/AppLayout';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import StudentInfoCard from '@/components/students/StudentInfoCard';
import StudentProfileTabs from '@/components/students/StudentProfileTabs';
import MobileOptimizedLayout from '@/components/layout/MobileOptimizedLayout';
import UniversalLoadingState from '@/components/common/UniversalLoadingState';
import { EnhancedErrorState } from '@/components/common/EnhancedErrorStates';

const StudentProfile: React.FC = () => {
  const { id: studentId } = useParams<{ id: string }>();

  const { data: student, isLoading, error, refetch } = useQuery({
    queryKey: ['student', studentId],
    queryFn: () => studentService.getStudentById(studentId),
  });

  return (
    <AppLayout>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumbs />
        
        {isLoading ? (
          <UniversalLoadingState type="dashboard" message="Loading student profile..." />
        ) : error ? (
          <EnhancedErrorState
            type="server"
            title="Failed to load student profile"
            message="There was an error loading the student's information. Please try again."
            details={error?.message}
            actions={[
              {
                label: 'Try Again',
                onClick: () => refetch(),
                icon: <RefreshCw className="h-4 w-4" />
              }
            ]}
          />
        ) : !student ? (
          <EnhancedErrorState
            type="permission"
            title="Student not found"
            message="The student you're looking for doesn't exist or you don't have permission to view them."
          />
        ) : (
          <div className="space-y-6">
            <StudentInfoCard student={student} />
            {studentId && <StudentProfileTabs studentId={studentId} />}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default StudentProfile;
