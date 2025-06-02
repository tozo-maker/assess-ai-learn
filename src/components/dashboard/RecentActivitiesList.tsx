
import React from 'react';
import { Clock, AlertCircle, Lightbulb } from 'lucide-react';
import {
  DSCard,
  DSCardContent,
  DSCardHeader,
  DSCardTitle,
  DSFlexContainer,
  DSBodyText,
  DSHelpText,
  DSSpacer,
  designSystem
} from '@/components/ui/design-system';

interface Activity {
  type: string;
  title: string;
  description: string;
  time: string;
  urgent: boolean;
}

interface RecentActivitiesListProps {
  recentAssessments: number;
  todaysInsights: number;
  studentMetrics?: {
    studentsNeedingAttention: number;
  };
}

const RecentActivitiesList: React.FC<RecentActivitiesListProps> = ({
  recentAssessments,
  todaysInsights,
  studentMetrics
}) => {
  // Generate recent activities based on real data
  const recentActivities: Activity[] = [
    ...(recentAssessments > 0 ? [{
      type: "assessment",
      title: `${recentAssessments} new assessment${recentAssessments > 1 ? 's' : ''} this week`,
      description: "Continue monitoring student progress",
      time: "This week",
      urgent: false
    }] : []),
    ...(todaysInsights > 0 ? [{
      type: "insight",
      title: `${todaysInsights} new AI insight${todaysInsights > 1 ? 's' : ''} generated`,
      description: "Review personalized recommendations",
      time: "Today",
      urgent: false
    }] : []),
    ...(studentMetrics?.studentsNeedingAttention && studentMetrics.studentsNeedingAttention > 0 ? [{
      type: "recommendation",
      title: "Students need attention",
      description: `${studentMetrics.studentsNeedingAttention} student${studentMetrics.studentsNeedingAttention > 1 ? 's' : ''} requiring support`,
      time: "Ongoing",
      urgent: true
    }] : [])
  ];

  // If no real activities, show a helpful message
  if (recentActivities.length === 0) {
    recentActivities.push({
      type: "insight",
      title: "Welcome to LearnSpark AI!",
      description: "Start by adding students and creating assessments to see insights here",
      time: "Getting started",
      urgent: false
    });
  }

  return (
    <DSCard>
      <DSCardHeader>
        <DSCardTitle>
          <DSFlexContainer align="center" gap="sm">
            <Clock className="h-5 w-5" />
            <span>Recent Activity</span>
          </DSFlexContainer>
        </DSCardTitle>
      </DSCardHeader>
      <DSCardContent>
        <div className="space-y-4">
          {recentActivities.slice(0, 5).map((activity, index) => (
            <div key={index}>
              <DSFlexContainer 
                align="start" 
                gap="md" 
                className={`p-3 rounded-lg ${designSystem.colors.neutral.light} ${designSystem.transitions.normal}`}
              >
                <div className={`p-2 rounded-lg ${
                  activity.urgent 
                    ? `${designSystem.colors.danger.light} ${designSystem.colors.danger.text}` 
                    : `${designSystem.colors.info.light} ${designSystem.colors.info.text}`
                }`}>
                  {activity.urgent ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <Lightbulb className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1">
                  <DSBodyText className="font-medium text-gray-900 mb-1">{activity.title}</DSBodyText>
                  <DSHelpText className="mb-1">{activity.description}</DSHelpText>
                  <DSHelpText className="text-gray-400">{activity.time}</DSHelpText>
                </div>
              </DSFlexContainer>
              {index < recentActivities.length - 1 && <DSSpacer size="sm" />}
            </div>
          ))}
        </div>
      </DSCardContent>
    </DSCard>
  );
};

export default RecentActivitiesList;
