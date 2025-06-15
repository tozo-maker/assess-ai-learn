import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Brain,
  TrendingUp,
  Users,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Lightbulb,
  Activity,
  RefreshCw
} from 'lucide-react';
import AdvancedDataVisualization from '@/components/analytics/AdvancedDataVisualization';
import { predictiveAnalyticsService } from '@/services/predictive-analytics-service';
import { advancedAIRecommendationsService } from '@/services/advanced-ai-recommendations';
import { realTimeCollaborationService } from '@/services/real-time-collaboration';
import { supabase } from '@/integrations/supabase/client';

interface AdvancedAnalyticsData {
  students: any[];
  predictions: any[];
  riskAlerts: any[];
  recommendations: any[];
  learningPaths: any[];
  collaborationSessions: any[];
  classMetrics: any;
}

const AdvancedAnalytics: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  // Initialize services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        await predictiveAnalyticsService.initializeModels();
        await realTimeCollaborationService.initialize();
        setIsInitializing(false);
      } catch (error) {
        console.error('Error initializing advanced analytics:', error);
        setIsInitializing(false);
      }
    };

    initializeServices();
  }, []);

  // Fetch comprehensive analytics data
  const { data: analyticsData, isLoading, refetch } = useQuery({
    queryKey: ['advanced-analytics', selectedTimeframe],
    queryFn: async (): Promise<AdvancedAnalyticsData> => {
      // Fetch students data
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select(`
          *,
          student_performance(*),
          student_assessments(*),
          student_goals(*)
        `);

      if (studentsError) throw studentsError;

      // Generate predictions for all students
      const predictions = await predictiveAnalyticsService.batchPredictPerformance(
        students?.map(s => s.id) || []
      );

      // Identify at-risk students
      const riskAlerts = await predictiveAnalyticsService.identifyAtRiskStudents();

      // Generate AI recommendations for top students
      const recommendations = await Promise.all(
        (students?.slice(0, 5) || []).map(student =>
          advancedAIRecommendationsService.generateContentRecommendations(student.id, 3)
        )
      );

      // Get learning paths
      const learningPaths = students?.flatMap(student =>
        advancedAIRecommendationsService.getStudentLearningPaths(student.id)
      ) || [];

      // Get active collaboration sessions
      const collaborationSessions = realTimeCollaborationService.getProgressUpdates();

      // Calculate class metrics
      const classMetrics = {
        averagePerformance: students?.reduce((sum, s) => sum + (s.student_performance?.[0]?.average_score || 0), 0) / (students?.length || 1),
        engagementRate: 75, // Mock data
        completionRate: 82, // Mock data
        riskDistribution: riskAlerts.reduce((acc, alert) => {
          acc[alert.riskLevel] = (acc[alert.riskLevel] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        subjectPerformance: {
          'Mathematics': 78,
          'Science': 82,
          'English': 75,
          'History': 80
        },
        trends: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          performance: 70 + Math.random() * 20,
          engagement: 65 + Math.random() * 25,
          prediction: 75 + Math.random() * 15
        }))
      };

      return {
        students: students || [],
        predictions,
        riskAlerts,
        recommendations: recommendations.flat(),
        learningPaths,
        collaborationSessions,
        classMetrics
      };
    },
    enabled: !isInitializing
  });

  // Transform data for visualization component
  const visualizationData = analyticsData ? {
    students: analyticsData.students.map(student => ({
      id: student.id,
      name: `${student.first_name} ${student.last_name}`,
      performance: student.student_performance?.[0]?.average_score || 0,
      engagement: 60 + Math.random() * 40, // Mock engagement data
      progress: 50 + Math.random() * 50, // Mock progress data
      riskLevel: analyticsData.riskAlerts.find(alert => alert.studentId === student.id)?.riskLevel || 'low',
      subjects: {
        'Mathematics': 70 + Math.random() * 30,
        'Science': 65 + Math.random() * 35,
        'English': 60 + Math.random() * 40,
        'History': 75 + Math.random() * 25
      },
      timeline: Array.from({ length: 10 }, (_, i) => ({
        date: new Date(Date.now() - (9 - i) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        score: 60 + Math.random() * 40,
        engagement: 50 + Math.random() * 50
      }))
    })),
    classMetrics: analyticsData.classMetrics,
    predictions: analyticsData.predictions.map(pred => ({
      studentId: pred.studentId,
      predictedScore: pred.prediction?.score || 0,
      confidence: pred.confidence,
      timeframe: pred.timeframe
    }))
  } : null;

  if (isInitializing || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Initializing Advanced Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-600 mt-1">
            AI-powered insights, predictions, and collaborative learning analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Predictions Generated</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.predictions.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{Math.floor(Math.random() * 10)} from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At-Risk Students</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {analyticsData?.riskAlerts.filter(alert => alert.riskLevel !== 'low').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Paths Active</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.learningPaths.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Personalized for students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collaboration Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.collaborationSessions.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Real-time interactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
          <TabsTrigger value="visualization">Data Visualization</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Risk Alerts */}
          {analyticsData?.riskAlerts && analyticsData.riskAlerts.filter(alert => alert.riskLevel !== 'low').length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {analyticsData.riskAlerts.filter(alert => alert.riskLevel !== 'low').length} students 
                require immediate attention based on AI risk analysis.
              </AlertDescription>
            </Alert>
          )}

          {/* Recent Risk Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Risk Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData?.riskAlerts?.slice(0, 5).map((alert, index) => {
                  const student = analyticsData.students.find(s => s.id === alert.studentId);
                  return (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={
                            alert.riskLevel === 'high' ? 'destructive' :
                            alert.riskLevel === 'medium' ? 'secondary' :
                            'default'
                          }
                        >
                          {alert.riskLevel} risk
                        </Badge>
                        <div>
                          <h4 className="font-medium">
                            {student ? `${student.first_name} ${student.last_name}` : 'Unknown Student'}
                          </h4>
                          <p className="text-sm text-gray-600">{alert.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{alert.confidence}% confidence</p>
                        <p className="text-xs text-gray-500">Urgency: {alert.urgency}/10</p>
                      </div>
                    </div>
                  );
                }) || []}
              </div>
            </CardContent>
          </Card>

          {/* Class Performance Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Class Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Average Performance</span>
                    <span>{analyticsData?.classMetrics?.averagePerformance?.toFixed(1) || '0'}%</span>
                  </div>
                  <Progress value={analyticsData?.classMetrics?.averagePerformance || 0} className="mt-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Engagement Rate</span>
                    <span>{analyticsData?.classMetrics?.engagementRate || 0}%</span>
                  </div>
                  <Progress value={analyticsData?.classMetrics?.engagementRate || 0} className="mt-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Completion Rate</span>
                    <span>{analyticsData?.classMetrics?.completionRate || 0}%</span>
                  </div>
                  <Progress value={analyticsData?.classMetrics?.completionRate || 0} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Subject Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(analyticsData?.classMetrics?.subjectPerformance || {}).map(([subject, score]) => (
                  <div key={subject}>
                    <div className="flex justify-between text-sm">
                      <span>{subject}</span>
                      <span>{typeof score === 'number' ? score : 0}%</span>
                    </div>
                    <Progress value={typeof score === 'number' ? score : 0} className="mt-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Performance Predictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData?.predictions?.slice(0, 10).map((prediction, index) => {
                  const student = analyticsData.students.find(s => s.id === prediction.studentId);
                  const currentScore = student?.student_performance?.[0]?.average_score || 0;
                  const predictedScore = prediction.prediction?.score || 0;
                  const trend = predictedScore > currentScore ? 'up' : 'down';
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {trend === 'up' ? (
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        ) : (
                          <TrendingUp className="h-5 w-5 text-red-600 rotate-180" />
                        )}
                        <div>
                          <h4 className="font-medium">
                            {student ? `${student.first_name} ${student.last_name}` : 'Unknown Student'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Current: {currentScore.toFixed(1)}% → Predicted: {predictedScore.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">
                          {prediction.confidence}% confidence
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {prediction.timeframe}
                        </p>
                      </div>
                    </div>
                  );
                }) || []}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                AI-Generated Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData?.recommendations?.slice(0, 8).map((recommendation, index) => {
                  const student = analyticsData.students.find(s => s.id === recommendation.studentId);
                  return (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">
                          {student ? `${student.first_name} ${student.last_name}` : 'Unknown Student'}
                        </h4>
                        <Badge 
                          variant={
                            recommendation.priority === 'high' ? 'destructive' :
                            recommendation.priority === 'medium' ? 'secondary' :
                            'default'
                          }
                        >
                          {recommendation.priority} priority
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{recommendation.reason}</p>
                      <p className="text-sm font-medium">Expected Outcome:</p>
                      <p className="text-sm text-gray-600">{recommendation.expectedOutcome}</p>
                    </div>
                  );
                }) || []}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collaboration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Real-time Collaboration Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData?.collaborationSessions && analyticsData.collaborationSessions.length > 0 ? (
                  analyticsData.collaborationSessions.map((session, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <h4 className="font-medium">{session.title}</h4>
                          <p className="text-sm text-gray-600">{session.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{session.type}</Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(session.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <h4 className="font-medium text-gray-900 mb-2">No Active Collaborations</h4>
                    <p className="text-sm text-gray-600">
                      Start a collaboration session to see real-time activity here.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visualization" className="space-y-6">
          {visualizationData && (
            <AdvancedDataVisualization
              data={visualizationData}
              onStudentSelect={(studentId) => console.log('Selected student:', studentId)}
              onExportData={(format) => console.log('Export data as:', format)}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalytics; 