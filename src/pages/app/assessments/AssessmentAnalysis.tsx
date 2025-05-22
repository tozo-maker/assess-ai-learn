
import React from 'react';
import PageShell from '@/components/ui/page-shell';
import { Lightbulb } from 'lucide-react';

const AssessmentAnalysis = () => (
  <PageShell 
    title="AI Analysis: Math Quiz #3" 
    description="Detailed insights and learning patterns identified"
    icon={<Lightbulb className="h-6 w-6 text-blue-600" />}
  />
);

export default AssessmentAnalysis;
