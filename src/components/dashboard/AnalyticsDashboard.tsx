import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  BookOpen, 
  Target, 
  Clock,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { analyticsService } from '@/services/analytics-service';
import { useAuth } from '@/contexts/AuthContext';

interface AnalyticsData {
  totalStudents: number;
  totalAssessments: number;
  averageScore: number;
  completionRate: number;
  trends: {
    date: string;
    averageScore: number;
  }[];
  performanceDistribution: {
    name: string;
    value: number;
  }[];
  subjectPerformance: {
    subject: string;
    averageScore: number;
  }[];
  recentActivity: {
    title: string;
    description: string;
    type: string;
    date: string;
  }[];
}

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<string>('30d');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [user, timeRange]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const data = await analyticsService.getTeacherAnalytics(user?.id || '', timeRange);
      setAnalyticsData(data);
    } catch (error) {
      toast({
        title: "Failed to load analytics",
        description: "Could not retrieve analytics data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      await analyticsService.exportAnalyticsReport(user?.id || '', timeRange);
      toast({
        title: "Report Exported",
        description: "Your analytics report has been exported successfully."
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not export analytics report. Please try again.",
        variant: "destructive"
      });
    }
  };

  const renderTrendIcon = (trend: any) => {
    if (trend > 0) return <ArrowUp className="h-4 w-4 text-green-600" />;
    if (trend < 0) return <ArrowDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No analytics data available</p>
        <Button onClick={fetchAnalyticsData} className="mt-4">
          Refresh Data
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
          <p className="text-gray-600">Comprehensive insights into student performance and learning trends</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border rounded p-2"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
          <Button onClick={handleExportReport}>Export Report</Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <h3 className="text-2xl font-bold">{analyticsData.totalStudents}</h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Total Assessments</p>
                <h3 className="text-2xl font-bold">{analyticsData.totalAssessments}</h3>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <h3 className="text-2xl font-bold">{analyticsData.averageScore}%</h3>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <h3 className="text-2xl font-bold">{analyticsData.completionRate}%</h3>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.performanceDistribution.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-sm text-gray-600">{item.value} students</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full" 
                    style={{ 
                      width: `${(item.value / analyticsData.totalStudents) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subject Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analyticsData.subjectPerformance.map((subject, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-medium">{subject.subject}</h4>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xl font-bold">{subject.averageScore}%</span>
                  <Badge variant={subject.averageScore >= 80 ? 'default' : 'secondary'}>
                    {subject.averageScore >= 80 ? 'Good' : 'Needs Attention'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 pb-4 border-b last:border-0">
                <div className={`p-2 rounded-full ${
                  activity.type === 'assessment' ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  {activity.type === 'assessment' ? (
                    <BookOpen className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Users className="h-4 w-4 text-green-600" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium">{activity.title}</h4>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
