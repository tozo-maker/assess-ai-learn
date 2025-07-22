import React from 'react';
import {
  DSSectionHeader,
  DSBodyText,
  DSFlexContainer
} from '@/components/ui/design-system';

interface DashboardWelcomeProps {
  teacherName: string;
}

const DashboardWelcome: React.FC<DashboardWelcomeProps> = ({ teacherName }) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const firstName = teacherName?.split(' ')[0] || 'Teacher';

  return (
    <DSFlexContainer direction="col" gap="sm">
      <DSSectionHeader>
        Welcome back, {firstName}!
      </DSSectionHeader>
      <DSBodyText className="text-muted-foreground">
        {currentDate} • Here's what's happening with your students today
      </DSBodyText>
    </DSFlexContainer>
  );
};

export default DashboardWelcome;