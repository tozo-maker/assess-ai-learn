
import React from 'react';
import PageShell from '@/components/ui/page-shell';
import { User } from 'lucide-react';

const IndividualInsights = () => (
  <PageShell 
    title="Individual Student Insights" 
    description="Deep analysis of individual student learning patterns"
    icon={<User className="h-6 w-6 text-blue-600" />}
  />
);

export default IndividualInsights;
