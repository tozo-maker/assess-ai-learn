
import React from 'react';
import PageShell from '@/components/ui/page-shell';
import { CheckCircle } from 'lucide-react';

const StudentGoals = () => (
  <PageShell 
    title="Emma's Learning Goals" 
    description="Track progress toward personalized learning objectives"
    icon={<CheckCircle className="h-6 w-6 text-blue-600" />}
  />
);

export default StudentGoals;
