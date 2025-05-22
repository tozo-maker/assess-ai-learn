
import React from 'react';
import PageShell from '@/components/ui/page-shell';
import { FileText } from 'lucide-react';

const AssessmentDetails = () => (
  <PageShell 
    title="Math Quiz #3" 
    description="Assessment details and student performance"
    icon={<FileText className="h-6 w-6 text-blue-600" />}
  />
);

export default AssessmentDetails;
