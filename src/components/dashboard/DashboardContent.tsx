
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { enhancedDashboardMetricsService } from '@/services/enhanced-dashboard-metrics';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';
import { DashboardData } from '@/types/comprehensive';
import EnhancedErrorBoundary from '@/components/dashboard/EnhancedErrorBoundary';

interface DashboardContentProps {
  data: DashboardData;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ data }) => {
  const { user } = useAuth();

  // Fetch enhanced metrics
  const { data: enhancedMetrics } = useQuery({
    queryKey: ['enhanced-dashboard-metrics', user?.id],
    queryFn: () => enhancedDashboardMetricsService.calculateEnhancedMetrics(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const getPerformanceTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining': return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
      default: return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <EnhancedErrorBoundary componentName="DashboardContent">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {data.teacher.firstName}!
          </h1>
          <p className="text-gray-600">
            Here's your class overview and recent insights.
          </p>
        </div>

        {/* Enhanced Overview Metrics */}
        {enhancedMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Students</p>
                    <p className="text-3xl font-bold">{enhancedMetrics.overview.totalStudents}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="mt-2 flex items-center gap-2">
                  {getPerformanceTrendIcon(enhancedMetrics.overview.performanceTrend)}
                  <span className="text-sm text-gray-600 capitalize">
                    {enhancedMetrics.overview.performanceTrend}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Assessments</p>
                    <p className="text-3xl font-bold">{enhancedMetrics.overview.totalAssessments}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {enhancedMetrics.overview.completedAssessments} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Average Score</p>
                    <p className="text-3xl font-bold">{enhancedMetrics.overview.averageScore}%</p>
                  </div>
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
                <div className="mt-2 flex items-center gap-2">
                  {getPerformanceTrendIcon(enhancedMetrics.overview.performanceTrend)}
                  <span className="text-sm text-gray-600">
                    Class performance
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">AI Analyses</p>
                    <p className="text-3xl font-bold">{enhancedMetrics.overview.totalAnalyses}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-indigo-600" />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Generated insights
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Performance Distribution */}
        {enhancedMetrics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {enhancedMetrics.performance.performanceDistribution.map((level, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{level.level}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${level.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          {level.count} ({Math.round(level.percentage)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {enhancedMetrics.insights.topStrengths.slice(0, 3).map((strength, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="text-sm text-green-800">{strength.strength}</span>
                      <Badge variant="secondary">{strength.frequency} students</Badge>
                    </div>
                  ))}
                  {enhancedMetrics.insights.commonGrowthAreas.slice(0, 2).map((area, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-amber-50 rounded">
                      <span className="text-sm text-amber-800">{area.area}</span>
                      <Badge variant="outline">{area.frequency} students</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Smart Alerts */}
        {enhancedMetrics && enhancedMetrics.alerts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Smart Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {enhancedMetrics.alerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{alert.title}</h4>
                        <Badge variant={getSeverityColor(alert.severity) as any}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{alert.description}</p>
                      {alert.studentCount && (
                        <p className="text-xs text-gray-500 mt-1">
                          Affects {alert.studentCount} students
                        </p>
                      )}
                    </div>
                    <Link to={alert.actionUrl}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {enhancedMetrics && enhancedMetrics.recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>AI Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {enhancedMetrics.recommendations.map((rec, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{rec.title}</h4>
                      <Badge variant={getSeverityColor(rec.priority) as any}>
                        {rec.priority} priority
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                    <div className="space-y-1">
                      {rec.actionItems.map((action, actionIndex) => (
                        <div key={actionIndex} className="flex items-center gap-2 text-sm">
                          <div className="w-1 h-1 bg-blue-600 rounded-full" />
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/app/assessments/add" className="block">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                  <BookOpen className="h-6 w-6" />
                  Create Assessment
                </Button>
              </Link>
              <Link to="/app/students/add" className="block">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                  <Users className="h-6 w-6" />
                  Add Student
                </Button>
              </Link>
              <Link to="/app/insights/class" className="block">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                  <TrendingUp className="h-6 w-6" />
                  View Insights
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </EnhancedErrorBoundary>
  );
};

export default DashboardContent;
