
import React from 'react';
import PageShell from '@/components/ui/page-shell';
import { Mail } from 'lucide-react';

const ParentReports = () => (
  <PageShell 
    title="Parent Communication" 
    description="Share insights and progress with parents"
    icon={<Mail className="h-6 w-6 text-blue-600" />}
  />
);

export default ParentReports;
