
import React from 'react';
import PageShell from '@/components/ui/page-shell';
import { Upload } from 'lucide-react';

const BatchAssessment = () => (
  <PageShell 
    title="Batch Assessment" 
    description="Add assessment data for multiple students at once"
    icon={<Upload className="h-6 w-6 text-blue-600" />}
  />
);

export default BatchAssessment;
