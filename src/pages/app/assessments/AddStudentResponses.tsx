
import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { PageShell } from '@/components/ui/page-shell';
import StudentResponseForm from '@/components/assessments/StudentResponseForm';

const AddStudentResponses: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const preSelectedStudentId = searchParams.get('student');

  if (!id) {
    return (
      <PageShell
        title="Error"
        description="Assessment ID is missing"
        link="/app/assessments"
        linkText="Back to Assessments"
      >
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold">Error</h2>
          <p className="mt-2">Assessment ID is required.</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Record Student Responses"
      description="Enter assessment data for a student"
      link={`/app/assessments/${id}`}
      linkText="Back to Assessment"
    >
      <StudentResponseForm 
        assessmentId={id} 
        preSelectedStudentId={preSelectedStudentId || undefined}
      />
    </PageShell>
  );
};

export default AddStudentResponses;
