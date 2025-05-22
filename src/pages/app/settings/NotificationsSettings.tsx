
import React from 'react';
import PageShell from '@/components/ui/page-shell';
import { CheckCircle } from 'lucide-react';

const NotificationsSettings = () => (
  <PageShell 
    title="Notification Preferences" 
    description="Configure how and when you receive alerts"
    icon={<CheckCircle className="h-6 w-6 text-blue-600" />}
  />
);

export default NotificationsSettings;
