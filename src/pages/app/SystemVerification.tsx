
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import VerificationRunner from '@/components/verification/VerificationRunner';

const SystemVerification = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Verification</h1>
          <p className="text-muted-foreground">
            Comprehensive testing suite for build, deployment, workflows, performance, and email systems
          </p>
        </div>
        
        <VerificationRunner />
      </div>
    </AppLayout>
  );
};

export default SystemVerification;
