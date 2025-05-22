
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
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

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

          {/* Quick Actions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quickActions.map((action, index) => (
                    <Link key={index} to={action.href}>
                      <Button 
                        className={`w-full justify-start h-auto p-4 ${action.color}`}
                        variant="default"
                      >
                        <div className="flex items-start space-x-3">
                          {action.icon}
                          <div className="text-left">
                            <div className="font-medium">{action.title}</div>
                            <div className="text-xs opacity-90">{action.description}</div>
                          </div>
                        </div>
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Urgent Recommendations */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span>Needs Attention</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 rounded-lg">
                    <h4 className="font-medium text-red-900">3 students struggling with fractions</h4>
                    <p className="text-sm text-red-700">From recent Math Quiz #3</p>
                    <Link to="/insights/recommendations">
                      <Button size="sm" variant="outline" className="mt-2 text-red-600 border-red-200">
                        View Recommendations
                      </Button>
                    </Link>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <h4 className="font-medium text-amber-900">Reading comprehension below grade level</h4>
                    <p className="text-sm text-amber-700">2 students need intervention</p>
                    <Link to="/insights/individual">
                      <Button size="sm" variant="outline" className="mt-2 text-amber-600 border-amber-200">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
