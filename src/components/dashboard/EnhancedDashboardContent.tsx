
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardStatsRedesigned from './DashboardStatsRedesigned';
import PerformanceSection from './PerformanceSection';
import DashboardPerformanceWidget from './DashboardPerformanceWidget';
import AIAnalysisStatusCard from './AIAnalysisStatusCard';
import PerformanceMetricsWidget from './PerformanceMetricsWidget';
import EnhancedQuickActions from './EnhancedQuickActions';
import RecentActivity from './RecentActivity';
import PerformanceHeatmapEnhanced from './PerformanceHeatmapEnhanced';
import EnhancedAlertsCenter from '../alerts/EnhancedAlertsCenter';
import {
  DSSection,
  DSContentGrid,
  DSGridItem
} from '@/components/ui/design-system';

interface EnhancedDashboardContentProps {
  data: any;
}

const EnhancedDashboardContent: React.FC<EnhancedDashboardContentProps> = ({ data }) => {
  const navigate = useNavigate();
  const dashboardData = data?.data || data;
  
  // Enhanced mock data for alerts center
  const mockEnhancedAlerts = [
    {
      id: '1',
      type: 'critical' as const,
      title: 'Math Performance Critical Drop',
      message: 'John Smith showing 25% drop in recent math assessments over past week',
      details: 'Student has struggled with algebra concepts in last 3 assessments. Recommendation: Schedule one-on-one tutoring session and review foundational concepts.',
      studentName: 'John Smith',
      timestamp: new Date(),
      dismissible: true,
      expandable: true,
      actionRequired: true,
      metadata: { subject: 'Mathematics', dropPercentage: 25, assessmentCount: 3 }
    },
    {
      id: '2', 
      type: 'high' as const,
      title: 'Reading Goal Overdue',
      message: 'Sarah Johnson has missed reading comprehension goal deadline',
      details: 'Goal was set for 3 weeks ago. Student is at 65% completion. Suggest extending deadline and providing additional reading materials.',
      studentName: 'Sarah Johnson',
      timestamp: new Date(Date.now() - 86400000 * 3),
      dismissible: true,
      expandable: true,
      actionRequired: true,
      metadata: { goalType: 'Reading Comprehension', completionPercentage: 65 }
    },
    {
      id: '3',
      type: 'medium' as const,
      title: 'Class Average Below Target',
      message: 'Science class average dropped to 78% this week',
      details: 'Weekly quiz results show decline from previous 85% average. Consider reviewing recent topics and providing additional practice materials.',
      timestamp: new Date(Date.now() - 86400000),
      dismissible: true,
      expandable: true,
      actionRequired: false,
      metadata: { subject: 'Science', currentAverage: 78, previousAverage: 85 }
    }
  ];

  const mockActivities = [
    {
      id: '1',
      type: 'assessment' as const,
      title: 'Math Quiz Completed',
      description: 'Class average: 85%',
      timestamp: new Date(),
      student: { id: '1', name: 'John Smith' }
    },
    {
      id: '2',
      type: 'goal' as const,
      title: 'Reading Goal Created',
      description: 'New comprehension target set',
      timestamp: new Date(Date.now() - 3600000),
      student: { id: '2', name: 'Sarah Johnson' }
    }
  ];

  const mockHeatmapData = [
    {
      studentId: '1',
      studentName: 'John Smith',
      skills: {
        'Math': { score: 78, assessmentCount: 5, lastAssessed: new Date(), trend: 'down' as const },
        'Reading': { score: 85, assessmentCount: 3, lastAssessed: new Date(), trend: 'up' as const },
        'Science': { score: 92, assessmentCount: 4, lastAssessed: new Date(), trend: 'stable' as const },
        'Writing': { score: 88, assessmentCount: 2, lastAssessed: new Date(), trend: 'up' as const }
      }
    },
    {
      studentId: '2',
      studentName: 'Sarah Johnson', 
      skills: {
        'Math': { score: 88, assessmentCount: 4, lastAssessed: new Date(), trend: 'up' as const },
        'Reading': { score: 76, assessmentCount: 6, lastAssessed: new Date(), trend: 'down' as const },
        'Science': { score: 89, assessmentCount: 3, lastAssessed: new Date(), trend: 'stable' as const },
        'Writing': { score: 91, assessmentCount: 4, lastAssessed: new Date(), trend: 'up' as const }
      }
    },
    {
      studentId: '3',
      studentName: 'Mike Davis',
      skills: {
        'Math': { score: 94, assessmentCount: 5, lastAssessed: new Date(), trend: 'up' as const },
        'Reading': { score: 82, assessmentCount: 4, lastAssessed: new Date(), trend: 'stable' as const },
        'Science': { score: 87, assessmentCount: 3, lastAssessed: new Date(), trend: 'up' as const },
        'Writing': { score: 79, assessmentCount: 3, lastAssessed: new Date(), trend: 'down' as const }
      }
    }
  ];

  const handleQuickAction = (actionId: string, data?: any) => {
    console.log('Quick action:', actionId, data);
    
    switch (actionId) {
      case 'add-student':
        navigate('/app/students/add');
        break;
      case 'create-assessment':
        navigate('/app/assessments/add');
        break;
      case 'view-insights':
        navigate('/app/insights/class');
        break;
      case 'set-goals':
        navigate('/app/students');
        break;
      case 'progress-report':
        navigate('/app/reports');
        break;
      case 'curriculum-guide':
        navigate('/app/curriculum');
        break;
      case 'parent-communication':
        navigate('/app/communication');
        break;
      case 'view-student':
        if (data?.studentId) {
          navigate(`/app/students/${data.studentId}`);
        }
        break;
      case 'view-all-students':
        navigate('/app/students');
        break;
      default:
        console.log(`Action ${actionId} not implemented yet`);
    }
  };

  const handleDismissAlert = (alertId: string) => {
    console.log('Dismissing alert:', alertId);
    // In real implementation, this would update the alert status
  };

  const handleBulkDismissAlerts = (alertIds: string[]) => {
    console.log('Bulk dismissing alerts:', alertIds);
    // In real implementation, this would update multiple alert statuses
  };

  const handleTakeAction = (alertId: string, action: string) => {
    console.log('Taking action on alert:', alertId, action);
    const alert = mockEnhancedAlerts.find(a => a.id === alertId);
    if (alert?.studentName) {
      // Navigate to student page for direct action
      navigate('/app/students');
    }
  };

  const handleActivityClick = (activity: any) => {
    console.log('Activity clicked:', activity);
    // Navigate to relevant page based on activity type
  };

  const handleHeatmapCellClick = (studentId: string, skill: string) => {
    console.log('Heatmap cell clicked:', studentId, skill);
    navigate(`/app/students/${studentId}`);
  };

  const handleRefreshAlerts = () => {
    console.log('Refreshing alerts...');
    // In real implementation, this would refetch alert data
  };

  return (
    <div className="space-y-6">
      {/* Main Statistics */}
      <DashboardStatsRedesigned
        totalStudents={dashboardData?.metrics?.totalStudents || 0}
        totalAssessments={dashboardData?.metrics?.totalAssessments || 0}
        aiInsights={dashboardData?.metrics?.aiInsights || 0}
        recentAssessments={dashboardData?.metrics?.recentAssessments || 0}
        newStudentsThisMonth={dashboardData?.metrics?.newStudentsThisMonth || 0}
        todaysInsights={dashboardData?.metrics?.todaysInsights || 0}
        studentMetrics={dashboardData?.metrics?.studentMetrics}
      />

      {/* Enhanced Alerts Center and Quick Actions */}
      <DSContentGrid cols={2}>
        <DSGridItem span={1}>
          <EnhancedAlertsCenter
            alerts={mockEnhancedAlerts}
            onDismissAlert={handleDismissAlert}
            onBulkDismiss={handleBulkDismissAlerts}
            onTakeAction={handleTakeAction}
            onRefresh={handleRefreshAlerts}
          />
        </DSGridItem>
        <DSGridItem span={1}>
          <EnhancedQuickActions />
        </DSGridItem>
      </DSContentGrid>

      {/* Performance Overview */}
      <PerformanceSection
        assessments={dashboardData?.assessments || []}
        studentMetrics={dashboardData?.metrics?.studentMetrics}
      />

      {/* Enhanced Performance Heatmap - Full Width */}
      <PerformanceHeatmapEnhanced
        data={mockHeatmapData}
        skillCategories={['Math', 'Reading', 'Science', 'Writing']}
        timeRange="month"
        onTimeRangeChange={(range) => console.log('Time range changed:', range)}
        onCellClick={handleHeatmapCellClick}
      />

      {/* Recent Activity and System Status */}
      <DSContentGrid cols={2}>
        <DSGridItem span={1}>
          <RecentActivity
            activities={mockActivities}
            maxItems={5}
            onActivityClick={handleActivityClick}
          />
        </DSGridItem>
        <DSGridItem span={1}>
          <div className="space-y-4">
            <DashboardPerformanceWidget />
            <PerformanceMetricsWidget />
            <AIAnalysisStatusCard />
          </div>
        </DSGridItem>
      </DSContentGrid>
    </div>
  );
};

export default EnhancedDashboardContent;
