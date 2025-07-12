import React from 'react';
import { StandardPageLayout } from '@/components/layout/StandardPageLayout';
import { Mail } from 'lucide-react';
import { EmailCenter as EmailCenterComponent } from '@/components/communications/EmailCenter';

const EmailCenter: React.FC = () => {
  const actions = (
    <Mail className="h-5 w-5 text-primary" />
  );

  return (
    <StandardPageLayout 
      title="Email Center"
      description="Send emails to parents and manage communications"
      actions={actions}
      breadcrumbs={[
        { label: 'Communications', href: '/app/communications' },
        { label: 'Email Center' }
      ]}
    >
      <EmailCenterComponent />
    </StandardPageLayout>
  );
};

export default EmailCenter;