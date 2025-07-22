
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardStatsRedesigned from './DashboardStatsRedesigned';
import PerformanceSection from './PerformanceSection';
import DashboardPerformanceWidget from './DashboardPerformanceWidget';
import AIAnalysisStatusCard from './AIAnalysisStatusCard';
import PerformanceMetricsWidget from './PerformanceMetricsWidget';
import QuickActions from './QuickActions';
import RecentActivity from './RecentActivity';
import AlertsCenter from './AlertsCenter';
import PerformanceHeatmap from './PerformanceHeatmap';
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
  
  // Mock data for new components - in real implementation, this would come from dashboardData
  const mockAlerts = [
    {
      id: '1',
      type: 'performance_drop' as const,
      severity: 'high' as const,
      student_id: '1',
      student_name: 'John Smith',
      title: 'Math Performance Declining',
      description: 'Student showing 15% drop in recent assessments',
      created_at: new Date().toISOString(),
      is_dismissed: false,
      action_required: true
    },
    {
      id: '2', 
      type: 'goal_overdue' as const,
      severity: 'medium' as const,
      student_id: '2',
      student_name: 'Sarah Johnson',
      title: 'Reading Goal Overdue',
      description: 'Goal deadline passed 3 days ago',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      is_dismissed: false,
      action_required: true
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
        'Science': { score: 92, assessmentCount: 4, lastAssessed: new Date(), trend: 'stable' as const }
      }
    },
    {
      studentId: '2',
      studentName: 'Sarah Johnson', 
      skills: {
        'Math': { score: 88, assessmentCount: 4, lastAssessed: new Date(), trend: 'up' as const },
        'Reading': { score: 76, assessmentCount: 6, lastAssessed: new Date(), trend: 'down' as const },
        'Science': { score: 89, assessmentCount: 3, lastAssessed: new Date(), trend: 'stable' as const }
      }
    }
  ];

  const mockRecentStudents = [
    { id: '1', name: 'John Smith' },
    { id: '2', name: 'Sarah Johnson' },
    { id: '3', name: 'Mike Davis' }
  ];

  const handleQuickAction = (actionId: string, data?: any) => {
    console.log('Quick action:', actionId, data);
    
    switch (actionId) {
      case 'add-assessment':
        navigate('/app/assessments/add');
        break;
      case 'view-class':
        navigate('/app/students');
        break;
      case 'create-goal':
        navigate('/app/goals');
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

  const handleTakeAction = (alert: any) => {
    console.log('Taking action on alert:', alert);
    // In real implementation, this would handle alert-specific actions
  };

  const handleActivityClick = (activity: any) => {
    console.log('Activity clicked:', activity);
    // Navigate to relevant page based on activity type
  };

  const handleHeatmapCellClick = (studentId: string, skill: string) => {
    console.log('Heatmap cell clicked:', studentId, skill);
    navigate(`/app/students/${studentId}`);
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

      {/* Alerts and Quick Actions */}
      <DSContentGrid cols={2}>
        <DSGridItem span={1}>
          <AlertsCenter
            alerts={mockAlerts}
            onDismissAlert={handleDismissAlert}
            onTakeAction={handleTakeAction}
          />
        </DSGridItem>
        <DSGridItem span={1}>
          <QuickActions
            recentStudents={mockRecentStudents}
            onAction={handleQuickAction}
          />
        </DSGridItem>
      </DSContentGrid>

      {/* Performance Overview */}
      <PerformanceSection
        assessments={dashboardData?.assessments || []}
        studentMetrics={dashboardData?.metrics?.studentMetrics}
      />

      {/* Performance Heatmap - Full Width */}
      <PerformanceHeatmap
        data={mockHeatmapData}
        skillCategories={['Math', 'Reading', 'Science']}
        timeRange="month"
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
