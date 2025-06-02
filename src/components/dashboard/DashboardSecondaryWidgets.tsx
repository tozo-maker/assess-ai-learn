
import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Calendar, Target, Settings } from 'lucide-react';
import {
  DSContentGrid,
  DSCard,
  DSCardHeader,
  DSCardContent,
  DSCardTitle,
  DSFlexContainer,
  DSBodyText,
  DSButton,
  DSHelpText,
  designSystem
} from '@/components/ui/design-system';

interface DashboardSecondaryWidgetsProps {
  assessments: any[];
  students: any[];
  metrics: {
    averagePerformance: string;
    studentsNeedingAttention: number;
  };
}

const DashboardSecondaryWidgets: React.FC<DashboardSecondaryWidgetsProps> = ({
  assessments,
  students,
  metrics
}) => {
  const widgets = [
    {
      title: 'Performance Overview',
      icon: <BarChart3 className={`h-5 w-5 ${designSystem.colors.info.text}`} />,
      content: (
        <div className="space-y-3">
          <div>
            <DSBodyText className="font-semibold">
              {metrics.averagePerformance !== "N/A" ? metrics.averagePerformance : "No data"}
            </DSBodyText>
            <DSHelpText>Class Average</DSHelpText>
          </div>
          <div>
            <DSBodyText className="font-semibold">
              {metrics.studentsNeedingAttention}
            </DSBodyText>
            <DSHelpText>Students Needing Support</DSHelpText>
          </div>
        </div>
      ),
      actionText: 'View Analytics',
      actionUrl: '/app/insights'
    },
    {
      title: 'Upcoming Tasks',
      icon: <Calendar className={`h-5 w-5 ${designSystem.colors.success.text}`} />,
      content: (
        <div className="space-y-3">
          <DSBodyText>
            {assessments.length > 0 ? 'Review recent assessments' : 'No pending tasks'}
          </DSBodyText>
          <DSHelpText>
            {assessments.length > 0 
              ? `${assessments.length} assessments to review`
              : 'You\'re all caught up!'
            }
          </DSHelpText>
        </div>
      ),
      actionText: 'View Calendar',
      actionUrl: '/app/assessments'
    },
    {
      title: 'Goals & Progress',
      icon: <Target className={`h-5 w-5 ${designSystem.colors.warning.text}`} />,
      content: (
        <div className="space-y-3">
          <DSBodyText>
            Track student learning objectives
          </DSBodyText>
          <DSHelpText>
            Set and monitor educational goals
          </DSHelpText>
        </div>
      ),
      actionText: 'Manage Goals',
      actionUrl: '/app/students'
    }
  ];

  return (
    <DSContentGrid cols={3}>
      {widgets.map((widget, index) => (
        <DSCard key={index} className="h-full">
          <DSCardHeader>
            <DSFlexContainer justify="between" align="center">
              <DSCardTitle className="text-lg">
                {widget.title}
              </DSCardTitle>
              <Link to={widget.actionUrl}>
                <DSButton variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </DSButton>
              </Link>
            </DSFlexContainer>
          </DSCardHeader>
          <DSCardContent>
            <DSFlexContainer direction="col" gap="md" className="h-full">
              <DSFlexContainer align="center" gap="sm">
                {widget.icon}
              </DSFlexContainer>
              <div className="flex-1">
                {widget.content}
              </div>
              <Link to={widget.actionUrl}>
                <DSButton variant="secondary" size="sm" className="w-full">
                  {widget.actionText}
                </DSButton>
              </Link>
            </DSFlexContainer>
          </DSCardContent>
        </DSCard>
      ))}
    </DSContentGrid>
  );
};

export default DashboardSecondaryWidgets;
