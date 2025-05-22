
import React from 'react';
import PageShell from '@/components/ui/page-shell';
import { FileText } from 'lucide-react';

const AddAssessment = () => (
  <PageShell 
    title="Add Assessment" 
    description="Record new assessment data for analysis"
    icon={<FileText className="h-6 w-6 text-blue-600" />}
  />
);

export default AddAssessment;
