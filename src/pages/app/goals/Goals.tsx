
import React from 'react';
import { PageShell } from '@/components/ui/page-shell';
import { Target } from 'lucide-react';

const Goals = () => {
  return (
    <PageShell
      title="Learning Goals"
      description="Set and track educational goals for students"
      icon={<Target className="h-6 w-6" />}
    />
  );
};

export default Goals;
