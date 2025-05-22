
import React from 'react';
import PageShell from '@/components/ui/page-shell';
import { Lightbulb } from 'lucide-react';

const StudentInsights = () => (
  <PageShell 
    title="Emma's AI Insights" 
    description="Personalized learning analysis and recommendations"
    icon={<Lightbulb className="h-6 w-6 text-blue-600" />}
  />
);

export default StudentInsights;
