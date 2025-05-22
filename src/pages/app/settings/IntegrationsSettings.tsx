
import React from 'react';
import PageShell from '@/components/ui/page-shell';
import { Settings } from 'lucide-react';

const IntegrationsSettings = () => (
  <PageShell 
    title="Integrations" 
    description="Connect with your LMS and other educational tools"
    icon={<Settings className="h-6 w-6 text-blue-600" />}
  />
);

export default IntegrationsSettings;
