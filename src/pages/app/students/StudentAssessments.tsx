
import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText, BarChart2, ChevronLeft } from 'lucide-react';

import { PageShell } from '@/components/ui/page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { studentService } from '@/services/student-service';
import { assessmentService } from '@/services/assessment-service';

const StudentAssessments: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch student data
  const { data: student, isLoading: isLoadingStudent } = useQuery({
    queryKey: ['student', id],
    queryFn: () => studentService.getStudentById(id as string),
    enabled: !!id,
  });

  // For a real implementation, we would need an API to fetch assessments by student ID
  // This is a placeholder that would need to be implemented
  const { data: assessments, isLoading: isLoadingAssessments } = useQuery({
    queryKey: ['studentAssessments', id],
    queryFn: async () => {
      // This would need a proper implementation in the assessment service
      // For now, let's return an empty array
      return [];
    },
    enabled: !!id,
  });

  if (isLoadingStudent || isLoadingAssessments) {
    return (
      <PageShell
        title="Loading..."
        description="Please wait"
        link={`/app/students/${id}`}
        linkText="Back to Student Profile"
      >
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4">Loading student assessments...</p>
          </div>
        </div>
      </PageShell>
    );
  }

  if (!student) {
    return (
      <PageShell
        title="Student Not Found"
        description="The requested student could not be found"
        link="/app/students"
        linkText="Back to Students"
      >
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold">Student not found</h2>
          <p className="mt-2">The requested student could not be loaded.</p>
          <Button onClick={() => navigate('/app/students')} className="mt-4">Back to Students</Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title={`${student.first_name} ${student.last_name}'s Assessments`}
      description={`Grade ${student.grade_level}`}
      link={`/app/students/${id}`}
      linkText="Back to Student Profile"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Button variant="ghost" className="pl-0" asChild>
              <Link to={`/app/students/${id}`}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back to Student Profile
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Assessment History</CardTitle>
            <CardDescription>
              View all assessments completed by {student.first_name} {student.last_name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center py-6">
              This feature is still under development. Student assessment history will be displayed here.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
};

export default StudentAssessments;
