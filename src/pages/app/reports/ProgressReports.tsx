
import React from 'react';
import PageShell from '@/components/ui/page-shell';
import { FileText } from 'lucide-react';

const ProgressReports = () => (
  <PageShell 
    title="Progress Reports" 
    description="Generate comprehensive student progress reports"
    icon={<FileText className="h-6 w-6 text-blue-600" />}
  />
);

export default ProgressReports;
