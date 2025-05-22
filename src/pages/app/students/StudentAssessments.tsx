
import React from 'react';
import PageShell from '@/components/ui/page-shell';
import { FileText } from 'lucide-react';

const StudentAssessments = () => (
  <PageShell 
    title="Emma's Assessments" 
    description="Assessment history and performance tracking"
    icon={<FileText className="h-6 w-6 text-blue-600" />}
  />
);

export default StudentAssessments;
