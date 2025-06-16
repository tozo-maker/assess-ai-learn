
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, AlertCircle, Lightbulb } from 'lucide-react';

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.slice(0, 5).map((activity, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
              <div className={`p-2 rounded-lg ${activity.urgent ? 'bg-red-100' : 'bg-blue-100'}`}>
                {activity.urgent ? (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                ) : (
                  <Lightbulb className="h-4 w-4 text-blue-600" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{activity.title}</h4>
                <p className="text-sm text-gray-600">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivitiesList;
