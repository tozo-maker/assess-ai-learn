
import React from 'react';
import PageShell from '@/components/ui/page-shell';
import { Lightbulb } from 'lucide-react';

const Recommendations = () => (
  <PageShell 
    title="AI Recommendations" 
    description="Personalized teaching strategies and interventions"
    icon={<Lightbulb className="h-6 w-6 text-blue-600" />}
  />
);

export default Recommendations;
