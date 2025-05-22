
import React from 'react';
import PageShell from '@/components/ui/page-shell';
import { Upload } from 'lucide-react';

const ExportReports = () => (
  <PageShell 
    title="Export Data" 
    description="Export your data in various formats"
    icon={<Upload className="h-6 w-6 text-blue-600" />}
  />
);

export default ExportReports;
