
import React from 'react';
import PageShell from '@/components/ui/page-shell';
import { Users } from 'lucide-react';

const ClassInsights = () => (
  <PageShell 
    title="Class Insights" 
    description="Analyze patterns and trends across your entire class"
    icon={<Users className="h-6 w-6 text-blue-600" />}
  />
);

export default ClassInsights;
