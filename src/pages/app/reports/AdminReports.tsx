
import React from 'react';
import PageShell from '@/components/ui/page-shell';
import { Settings } from 'lucide-react';

const AdminReports = () => (
  <PageShell 
    title="Administrative Reports" 
    description="Generate reports for school administration"
    icon={<Settings className="h-6 w-6 text-blue-600" />}
  />
);

export default AdminReports;
