
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, FileText, Users, AlertTriangle } from 'lucide-react';
import {
  DSCard,
  DSCardHeader,
  DSCardContent,
  DSCardTitle,
  DSFlexContainer,
  DSBodyText,
  DSHelpText,
  DSSpacer
} from '@/components/ui/design-system';

interface DashboardActivityFeedProps {
  recentAssessments: number;
  totalStudents: number;
  studentsNeedingAttention: number;
}

const DashboardActivityFeed: React.FC<DashboardActivityFeedProps> = ({
  recentAssessments,
  totalStudents,
  studentsNeedingAttention
}) => {
  const activities = [
    ...(recentAssessments > 0 ? [{
      id: '1',
      icon: <FileText className="h-4 w-4 text-blue-500" />,
      title: `${recentAssessments} new assessments completed`,
      description: 'Students have completed recent assessments',
      time: '2 hours ago',
      actionText: 'Review Results',
      actionUrl: '/app/assessments'
    }] : []),
    ...(studentsNeedingAttention > 0 ? [{
      id: '2',
      icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
      title: `${studentsNeedingAttention} students need attention`,
      description: 'Students requiring additional support identified',
      time: '1 day ago',
      actionText: 'View Students',
      actionUrl: '/app/students'
    }] : []),
    {
      id: '3',
      icon: <Users className="h-4 w-4 text-green-500" />,
      title: 'Class roster updated',
      description: `Managing ${totalStudents} students in your classes`,
      time: '3 days ago',
      actionText: 'Manage Students',
      actionUrl: '/app/students'
    }
  ];

  // Show empty state if no activities
  if (activities.length === 0) {
    return (
      <DSCard className="h-full">
        <DSCardHeader>
          <DSCardTitle>Recent Activity</DSCardTitle>
        </DSCardHeader>
        <DSCardContent className="text-center py-12">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <DSBodyText className="text-gray-600 mb-4">
            No recent activity to display
          </DSBodyText>
          <DSBodyText className="text-sm text-gray-500">
            Activity will appear here as you and your students use the platform
          </DSBodyText>
        </DSCardContent>
      </DSCard>
    );
  }

  return (
    <DSCard className="h-full">
      <DSCardHeader>
        <DSCardTitle>Recent Activity</DSCardTitle>
      </DSCardHeader>
      <DSCardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={activity.id}>
              <DSFlexContainer align="start" gap="md" className="group hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg transition-colors cursor-pointer">
                <div className="mt-1">
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <DSBodyText className="font-medium text-gray-900 mb-1">
                    {activity.title}
                  </DSBodyText>
                  <DSHelpText className="mb-2">
                    {activity.description}
                  </DSHelpText>
                  <DSFlexContainer justify="between" align="center">
                    <DSHelpText className="text-gray-400">
                      {activity.time}
                    </DSHelpText>
                    <Link 
                      to={activity.actionUrl}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {activity.actionText}
                    </Link>
                  </DSFlexContainer>
                </div>
              </DSFlexContainer>
              {index < activities.length - 1 && <DSSpacer size="md" />}
            </div>
          ))}
        </div>
      </DSCardContent>
    </DSCard>
  );
};

export default DashboardActivityFeed;
