
import React from 'react';
import PageShell from '@/components/ui/page-shell';
import { Upload } from 'lucide-react';

const ImportStudents = () => (
  <PageShell 
    title="Import Students" 
    description="Upload a CSV file to add multiple students at once"
    icon={<Upload className="h-6 w-6 text-blue-600" />}
  />
);

export default ImportStudents;
