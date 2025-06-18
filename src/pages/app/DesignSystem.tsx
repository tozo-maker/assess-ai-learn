
import React from 'react';
import { PageShell } from '@/components/ui/page-shell';
import { Palette } from 'lucide-react';

const DesignSystem = () => {
  return (
    <PageShell
      title="Design System"
      description="Component library and design guidelines"
      icon={<Palette className="h-6 w-6" />}
    />
  );
};

export default DesignSystem;
