
import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Calendar, Target, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import {
  DSContentGrid,
  DSGridItem,
  DSFlexContainer,
  DSBodyText,
  DSButton,
  DSStatusBadge
} from '@/components/ui/design-system';
import EnhancedMetricCard from './EnhancedMetricCard';

interface DashboardSecondaryWidgetsEnhancedProps {
  assessments: any[];
  students: any[];
  metrics: {
    averagePerformance: string;
    studentsNeedingAttention: number;
  };
}

const DashboardSecondaryWidgetsEnhanced: React.FC<DashboardSecondaryWidgetsEnhancedProps> = ({
  assessments,
  students,
  metrics
}) => {
  // Calculate performance metrics
  const performanceScore = metrics.averagePerformance !== "N/A" ? 
    parseInt(metrics.averagePerformance.replace('%', '')) : 0;
  
  const upcomingTasksCount = Math.max(assessments.length, 1);
  const completedGoals = Math.floor(students.length * 0.3); // Sample calculation
  
  // Enhanced widgets data
  const enhancedWidgets = [
    {
      title: 'Class Performance',
      value: metrics.averagePerformance !== "N/A" ? metrics.averagePerformance : "No data",
      icon: <BarChart3 className="h-5 w-5" />,
      trend: {
        value: performanceScore >= 75 ? '+5% this week' : performanceScore >= 60 ? 'Stable' : 'Needs focus',
        direction: performanceScore >= 75 ? 'up' as const : 
                  performanceScore >= 60 ? 'neutral' as const : 'down' as const,
        isPositive: performanceScore >= 75
      },
      priority: performanceScore < 60 ? 'high' as const : 
                performanceScore < 75 ? 'medium' as const : 'low' as const,
      actionUrl: '/app/insights'
    },
    {
      title: 'Upcoming Tasks',
      value: upcomingTasksCount,
      icon: <Calendar className="h-5 w-5" />,
      trend: {
        value: upcomingTasksCount > 3 ? 'High priority' : upcomingTasksCount > 0 ? 'On track' : 'All caught up',
        direction: upcomingTasksCount > 3 ? 'down' as const : 'neutral' as const,
        isPositive: upcomingTasksCount <= 3
      },
      priority: upcomingTasksCount > 5 ? 'high' as const : 
                upcomingTasksCount > 2 ? 'medium' as const : 'low' as const,
      actionUrl: '/app/assessments'
    },
    {
      title: 'Active Goals',
      value: completedGoals,
      icon: <Target className="h-5 w-5" />,
      trend: {
        value: completedGoals > 0 ? `${completedGoals} in progress` : 'Set first goal',
        direction: completedGoals > 0 ? 'up' as const : 'neutral' as const,
        isPositive: completedGoals > 0
      },
      priority: completedGoals === 0 ? 'medium' as const : 'low' as const,
      actionUrl: '/app/students'
    }
  ];

  return (
    <DSContentGrid cols={3}>
      {enhancedWidgets.map((widget, index) => (
        <DSGridItem key={index} span={1}>
          <Link to={widget.actionUrl} className="block">
            <EnhancedMetricCard
              title={widget.title}
              value={widget.value}
              icon={widget.icon}
              trend={widget.trend}
              priority={widget.priority}
              className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer"
            />
          </Link>
        </DSGridItem>
      ))}
    </DSContentGrid>
  );
};

export default DashboardSecondaryWidgetsEnhanced;
