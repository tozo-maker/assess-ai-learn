
import React from 'react';
import PageShell from '@/components/ui/page-shell';
import { User } from 'lucide-react';

const StudentProfile = () => (
  <PageShell 
    title="Emma Thompson" 
    description="5th Grade Student Profile and Analytics"
    icon={<User className="h-6 w-6 text-blue-600" />}
  />
);

export default StudentProfile;
