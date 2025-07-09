
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, FileText, Users, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import {
  DSCard,
  DSCardHeader,
  DSCardContent,
  DSCardTitle,
  DSFlexContainer,
  DSBodyText,
  DSHelpText,
  DSSpacer,
  DSStatusBadge
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
      icon: <FileText className="h-4 w-4" />,
      title: `${recentAssessments} new assessments completed`,
      description: 'Students have completed recent assessments',
      time: '2 hours ago',
      actionText: 'Review Results',
      actionUrl: '/app/assessments',
      priority: 'medium' as const,
      status: 'active' as const
    }] : []),
    ...(studentsNeedingAttention > 0 ? [{
      id: '2',
      icon: <AlertTriangle className="h-4 w-4" />,
      title: `${studentsNeedingAttention} students need attention`,
      description: 'Students requiring additional support identified',
      time: '1 day ago',
      actionText: 'View Students',
      actionUrl: '/app/students',
      priority: 'high' as const,
      status: 'urgent' as const
    }] : []),
    {
      id: '3',
      icon: <Users className="h-4 w-4" />,
      title: 'Class roster updated',
      description: `Managing ${totalStudents} students in your classes`,
      time: '3 days ago',
      actionText: 'Manage Students',
      actionUrl: '/app/students',
      priority: 'low' as const,
      status: 'completed' as const
    },
    {
      id: '4',
      icon: <TrendingUp className="h-4 w-4" />,
      title: 'Performance insights generated',
      description: 'AI has identified learning patterns and opportunities',
      time: '1 week ago',
      actionText: 'View Insights',
      actionUrl: '/app/insights',
      priority: 'low' as const,
      status: 'active' as const
    }
  ];

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          border: 'border-l-4 border-l-red-500',
          bg: 'bg-red-50',
          badge: 'danger' as const
        };
      case 'medium':
        return {
          border: 'border-l-4 border-l-amber-500',
          bg: 'bg-amber-50',
          badge: 'warning' as const
        };
      default:
        return {
          border: 'border-l-4 border-l-blue-500',
          bg: 'bg-blue-50',
          badge: 'info' as const
        };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  // Show empty state if no activities
  if (activities.length === 0) {
    return (
      <DSCard className="h-full border-l-4 border-l-gray-300 bg-gray-50">
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
        <DSFlexContainer justify="between" align="center">
          <DSCardTitle>Recent Activity</DSCardTitle>
          <DSStatusBadge variant="info" size="sm">
            {activities.length} Updates
          </DSStatusBadge>
        </DSFlexContainer>
      </DSCardHeader>
      <DSCardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const priorityStyles = getPriorityStyles(activity.priority);
            return (
              <div key={activity.id}>
                <div className={`p-4 rounded-lg ${priorityStyles.border} ${priorityStyles.bg} hover:shadow-md transition-all duration-200`}>
                  <DSFlexContainer align="start" gap="md">
                    <div className="mt-1">
                      {getStatusIcon(activity.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <DSFlexContainer justify="between" align="start" className="mb-2">
                        <DSBodyText className="font-semibold text-gray-900">
                          {activity.title}
                        </DSBodyText>
                        <DSStatusBadge variant={priorityStyles.badge} size="sm">
                          {activity.priority}
                        </DSStatusBadge>
                      </DSFlexContainer>
                      <DSHelpText className="mb-3">
                        {activity.description}
                      </DSHelpText>
                      <DSFlexContainer justify="between" align="center">
                        <DSHelpText className="text-gray-400">
                          {activity.time}
                        </DSHelpText>
                        <Link 
                          to={activity.actionUrl}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline"
                        >
                          {activity.actionText}
                        </Link>
                      </DSFlexContainer>
                    </div>
                  </DSFlexContainer>
                </div>
                {index < activities.length - 1 && <DSSpacer size="sm" />}
              </div>
            );
          })}
        </div>
      </DSCardContent>
    </DSCard>
  );
};

export default DashboardActivityFeed;
