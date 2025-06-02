
import React from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, TrendingUp, Users, BookOpen } from 'lucide-react';
import {
  DSCard,
  DSCardHeader,
  DSCardContent,
  DSCardTitle,
  DSFlexContainer,
  DSBodyText,
  DSHelpText,
  DSButton,
  DSSpacer,
  designSystem
} from '@/components/ui/design-system';

interface DashboardRecentInsightsProps {
  students: any[];
  communications: any[];
}

const DashboardRecentInsights: React.FC<DashboardRecentInsightsProps> = ({
  students,
  communications
}) => {
  const insights = [
    ...(students.length > 0 ? [{
      id: '1',
      icon: <TrendingUp className={`h-4 w-4 ${designSystem.colors.success.text}`} />,
      title: 'Math Performance Improving',
      description: `${Math.min(3, students.length)} students showing growth in problem-solving skills`,
      actionText: 'View Details',
      actionUrl: '/app/insights'
    }] : []),
    ...(students.length > 5 ? [{
      id: '2',
      icon: <Users className={`h-4 w-4 ${designSystem.colors.info.text}`} />,
      title: 'Class Engagement High',
      description: 'Overall participation rates above 85% this week',
      actionText: 'See Analytics',
      actionUrl: '/app/insights'
    }] : []),
    {
      id: '3',
      icon: <BookOpen className={`h-4 w-4 ${designSystem.colors.warning.text}`} />,
      title: 'Reading Comprehension Focus',
      description: 'AI suggests targeted reading exercises for improved outcomes',
      actionText: 'View Recommendations',
      actionUrl: '/app/insights/recommendations'
    }
  ];

  return (
    <DSCard className="h-full">
      <DSCardHeader>
        <DSFlexContainer justify="between" align="center">
          <DSCardTitle>Recent Insights</DSCardTitle>
          <Link to="/app/insights">
            <DSButton variant="ghost" size="sm">
              View All
            </DSButton>
          </Link>
        </DSFlexContainer>
      </DSCardHeader>
      <DSCardContent>
        {insights.length === 0 ? (
          <div className="text-center py-12">
            <Lightbulb className={`h-12 w-12 ${designSystem.colors.neutral.text} mx-auto mb-4`} />
            <DSBodyText className={designSystem.colors.neutral.text + " mb-4"}>
              No insights available yet
            </DSBodyText>
            <DSHelpText>
              Insights will appear as you add assessments and track student progress
            </DSHelpText>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={insight.id}>
                <DSFlexContainer 
                  align="start" 
                  gap="md" 
                  className={`group ${designSystem.colors.neutral.light} -mx-2 px-2 py-2 rounded-lg ${designSystem.transitions.normal} cursor-pointer`}
                >
                  <div className="mt-1">
                    {insight.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <DSBodyText className="font-medium text-gray-900 mb-1">
                      {insight.title}
                    </DSBodyText>
                    <DSHelpText className="mb-2">
                      {insight.description}
                    </DSHelpText>
                    <Link 
                      to={insight.actionUrl}
                      className={`text-sm ${designSystem.colors.primary.text} hover:text-blue-800 font-medium`}
                    >
                      {insight.actionText}
                    </Link>
                  </div>
                </DSFlexContainer>
                {index < insights.length - 1 && <DSSpacer size="md" />}
              </div>
            ))}
          </div>
        )}
      </DSCardContent>
    </DSCard>
  );
};

export default DashboardRecentInsights;
