
import React from 'react';
import StandardPageLayout from '@/components/layout/StandardPageLayout';
import { HelpCircle } from 'lucide-react';
import HelpMainContent from '@/components/help/HelpMainContent';

const Help: React.FC = () => {
  const actions = (
    <HelpCircle className="h-5 w-5 text-primary" />
  );

  return (
    <StandardPageLayout 
      title="Help & Support"
      actions={actions}
    >
      <HelpMainContent />
    </StandardPageLayout>
  );
};

export default Help;
