
import React from 'react';
import PageShell from '@/components/ui/page-shell';
import { CheckCircle } from 'lucide-react';

const SkillsInsights = () => (
  <PageShell 
    title="Skills Mastery Analysis" 
    description="Track skill development across all students"
    icon={<CheckCircle className="h-6 w-6 text-blue-600" />}
  />
);

export default SkillsInsights;
