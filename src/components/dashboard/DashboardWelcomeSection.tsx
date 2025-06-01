
import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Users, BarChart3 } from 'lucide-react';
import {
  DSFlexContainer,
  DSButton,
  DSBodyText,
  DSSectionHeader
} from '@/components/ui/design-system';

interface DashboardWelcomeSectionProps {
  teacher: {
    name: string;
    firstName: string;
  };
}

const DashboardWelcomeSection: React.FC<DashboardWelcomeSectionProps> = ({ teacher }) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const quickActions = [
    {
      label: 'Add Student',
      href: '/app/students/add',
      icon: <Plus className="h-4 w-4" />
    },
    {
      label: 'Create Assessment',
      href: '/app/assessments/add',
      icon: <FileText className="h-4 w-4" />
    },
    {
      label: 'View All Students',
      href: '/app/students',
      icon: <Users className="h-4 w-4" />
    },
    {
      label: 'View Reports',
      href: '/app/reports',
      icon: <BarChart3 className="h-4 w-4" />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <DSSectionHeader className="text-gray-800 mb-2">
          Welcome back, {teacher.firstName}! 👋
        </DSSectionHeader>
        <DSBodyText className="text-gray-600">
          {currentDate} • Here's what's happening with your students today
        </DSBodyText>
      </div>

      {/* Quick Actions */}
      <DSFlexContainer 
        direction="row" 
        gap="sm" 
        className="flex-wrap"
      >
        {quickActions.map((action, index) => (
          <Link key={index} to={action.href}>
            <DSButton variant="primary" size="md" className="gap-2">
              {action.icon}
              {action.label}
            </DSButton>
          </Link>
        ))}
      </DSFlexContainer>
    </div>
  );
};

export default DashboardWelcomeSection;
