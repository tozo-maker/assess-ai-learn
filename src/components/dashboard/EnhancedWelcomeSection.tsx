
import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Users, BarChart3, Calendar } from 'lucide-react';
import {
  DSFlexContainer,
  DSButton,
  DSBodyText,
  DSSectionHeader,
  DSCard,
  DSCardContent,
  DSContentGrid,
  DSGridItem
} from '@/components/ui/design-system';

interface EnhancedWelcomeSectionProps {
  teacher: {
    full_name?: string;
    firstName?: string;
  };
  metrics?: {
    totalStudents: number;
    recentAssessments: number;
  };
}

const EnhancedWelcomeSection: React.FC<EnhancedWelcomeSectionProps> = ({ 
  teacher, 
  metrics 
}) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Extract first name from full_name or use firstName
  const firstName = teacher?.firstName || teacher?.full_name?.split(' ')[0] || 'Teacher';

  const quickActions = [
    {
      label: 'Add Student',
      href: '/app/students/add',
      icon: <Plus className="h-4 w-4" />,
      variant: 'primary' as const,
      description: 'Add a new student to your class'
    },
    {
      label: 'Create Assessment',
      href: '/app/assessments/add',
      icon: <FileText className="h-4 w-4" />,
      variant: 'primary' as const,
      description: 'Record new assessment results'
    },
    {
      label: 'View Students',
      href: '/app/students',
      icon: <Users className="h-4 w-4" />,
      variant: 'secondary' as const,
      description: `Manage ${metrics?.totalStudents || 0} students`
    },
    {
      label: 'View Reports',
      href: '/app/reports',
      icon: <BarChart3 className="h-4 w-4" />,
      variant: 'secondary' as const,
      description: 'Generate progress reports'
    }
  ];

  return (
    <DSCard className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <DSCardContent className="p-8">
        <DSFlexContainer direction="col" gap="lg">
          {/* Welcome Header */}
          <div>
            <DSSectionHeader className="text-gray-800 mb-2">
              Welcome back, {firstName}! 👋
            </DSSectionHeader>
            <DSFlexContainer align="center" gap="sm" className="text-gray-600">
              <Calendar className="h-4 w-4" />
              <DSBodyText>
                {currentDate}
              </DSBodyText>
              {metrics && (
                <>
                  <span className="text-gray-400">•</span>
                  <DSBodyText>
                    {metrics.totalStudents} students • {metrics.recentAssessments} recent assessments
                  </DSBodyText>
                </>
              )}
            </DSFlexContainer>
          </div>

          {/* Quick Actions Grid */}
          <div>
            <DSBodyText className="text-gray-700 font-medium mb-4">
              Quick Actions
            </DSBodyText>
            <DSContentGrid cols={4}>
              {quickActions.map((action, index) => (
                <DSGridItem key={index} span={1}>
                  <Link to={action.href} className="block">
                    <DSCard className="h-full hover:shadow-md transition-all duration-200 border-gray-200 hover:border-blue-300">
                      <DSCardContent className="p-4 text-center">
                        <div className="mb-3 flex justify-center">
                          <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                            {action.icon}
                          </div>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1 text-sm">
                          {action.label}
                        </h4>
                        <DSBodyText className="text-xs text-gray-500">
                          {action.description}
                        </DSBodyText>
                      </DSCardContent>
                    </DSCard>
                  </Link>
                </DSGridItem>
              ))}
            </DSContentGrid>
          </div>
        </DSFlexContainer>
      </DSCardContent>
    </DSCard>
  );
};

export default EnhancedWelcomeSection;
