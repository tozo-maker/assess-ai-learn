
import React from 'react';
import { PageShell } from '@/components/ui/page-shell';
import { BookOpen } from 'lucide-react';

const Skills = () => {
  return (
    <PageShell
      title="Skills Management"
      description="Manage and track student skills and competencies"
      icon={<BookOpen className="h-6 w-6" />}
    />
  );
};

export default Skills;
