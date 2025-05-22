
import React from 'react';
import PageShell from '@/components/ui/page-shell';
import { User } from 'lucide-react';

const ProfileSettings = () => (
  <PageShell 
    title="Profile Settings" 
    description="Manage your account and teaching preferences"
    icon={<User className="h-6 w-6 text-blue-600" />}
  />
);

export default ProfileSettings;
