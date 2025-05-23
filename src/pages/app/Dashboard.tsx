
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  FileText, 
  Lightbulb, 
  Plus,
  TrendingUp,
  Clock,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PerformanceWidget from '@/components/dashboard/PerformanceWidget';
import AlertsWidget from '@/components/dashboard/AlertsWidget';

const Dashboard = () => {
  const stats = [
    {
      title: "Total Students",
      value: "24",
      icon: <Users className="h-6 w-6 text-blue-600" />,
      trend: "+2 this month"
    },
    {
      title: "Assessments",
      value: "47",
      icon: <FileText className="h-6 w-6 text-green-600" />,
      trend: "+5 this week"
    },
    {
      title: "AI Insights Generated",
      value: "132",
      icon: <Lightbulb className="h-6 w-6 text-purple-600" />,
      trend: "+12 today"
    },
    {
      title: "Avg. Class Performance",
      value: "84%",
      icon: <TrendingUp className="h-6 w-6 text-orange-600" />,
      trend: "+3% improvement"
    }
  ];

  const performanceData = [
    { period: 'Week 1', average: 78 },
    { period: 'Week 2', average: 82 },
    { period: 'Week 3', average: 79 },
    { period: 'Week 4', average: 84 },
    { period: 'Week 5', average: 87 },
  ];

  const alerts = [
    {
      id: '1',
      type: 'performance' as const,
      title: 'Students struggling with fractions',
      description: 'Multiple students scoring below 60% on fraction assessments',
      studentCount: 6,
      severity: 'high' as const,
      actionUrl: '/insights/skills'
    },
    {
      id: '2',
      type: 'performance' as const,
      title: 'Reading comprehension decline',
      description: 'Class average dropped 8% in recent assessments',
      studentCount: 12,
      severity: 'medium' as const,
      actionUrl: '/insights/class'
    },
    {
      id: '3',
      type: 'attendance' as const,
      title: 'Assessment participation low',
      description: 'Some students missing multiple assessment opportunities',
      studentCount: 3,
      severity: 'medium' as const,
      actionUrl: '/students'
    }
  ];

  const recentActivities = [
    {
      type: "assessment",
      title: "Math Quiz #3 analyzed",
      description: "Found 3 students struggling with fractions",
      time: "2 hours ago",
      urgent: true
    },
    {
      type: "insight",
      title: "Weekly reading comprehension insights ready",
      description: "Class average improved by 12%",
      time: "5 hours ago",
      urgent: false
    },
    {
      type: "recommendation",
      title: "Personalized recommendations for Emma S.",
      description: "Suggested additional practice in multiplication",
      time: "1 day ago",
      urgent: false
    }
  ];

  const quickActions = [
    {
      title: "Add Assessment",
      description: "Upload or enter new assessment data",
      href: "/assessments/add",
      icon: <FileText className="h-5 w-5" />,
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      title: "Add Student",
      description: "Register a new student to your class",
      href: "/students/add",
      icon: <Users className="h-5 w-5" />,
      color: "bg-green-600 hover:bg-green-700"
    },
    {
      title: "View Insights",
      description: "See latest AI analysis and recommendations",
      href: "/insights/class",
      icon: <Lightbulb className="h-5 w-5" />,
      color: "bg-purple-600 hover:bg-purple-700"
    },
    {
      title: "Class Analytics",
      description: "Comprehensive class performance analysis",
      href: "/insights/class",
      icon: <BarChart3 className="h-5 w-5" />,
      color: "bg-orange-600 hover:bg-orange-700"
    }
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, Ms. Johnson! 👋</h1>
          <p className="text-gray-600 mt-2">Here's what's happening with your students today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    <p className="text-sm text-green-600 mt-1">{stat.trend}</p>
                  </div>
                  <div className="h-12 w-12 bg-gray-50 rounded-lg flex items-center justify-center">
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Performance Widgets Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          <PerformanceWidget
            data={performanceData}
            title="Math Performance Trend"
            currentScore={87}
            trend="+9% this month"
          />
          <PerformanceWidget
            data={performanceData.map(d => ({ ...d, average: d.average - 5 }))}
            title="Reading Performance"
            currentScore={82}
            trend="+5% this month"
          />
          <PerformanceWidget
            data={performanceData.map(d => ({ ...d, average: d.average + 3 }))}
            title="Science Performance"
            currentScore={90}
            trend="+12% this month"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
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
          </div>

          {/* Quick Actions and Alerts */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action, index) => (
                    <Link key={index} to={action.href}>
                      <Button 
                        className={`w-full h-auto p-3 ${action.color}`}
                        variant="default"
                        size="sm"
                      >
                        <div className="flex flex-col items-center space-y-1">
                          {action.icon}
                          <span className="text-xs font-medium">{action.title}</span>
                        </div>
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Priority Alerts */}
            <AlertsWidget alerts={alerts} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
