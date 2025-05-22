
import React from 'react';
import PageShell from '@/components/ui/page-shell';
import { FileText } from 'lucide-react';

const SubjectsSettings = () => (
  <PageShell 
    title="Subjects & Skills" 
    description="Customize your subjects and skill categories"
    icon={<FileText className="h-6 w-6 text-blue-600" />}
  />
);

export default SubjectsSettings;
