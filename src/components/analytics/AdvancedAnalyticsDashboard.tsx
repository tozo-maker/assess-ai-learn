import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Users, BookOpen, Target, Download, Filter, Calendar as CalendarIcon, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { advancedAnalyticsService, AnalyticsFilter, PredictiveInsight } from '@/services/advanced-analytics';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export const AdvancedAnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<any>(null);
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AnalyticsFilter>({
    dateRange: { start: '', end: '' },
    studentIds: [],
    subjectFilter: [],
    gradeLevel: []
  });
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  useEffect(() => {
    if (user?.id) {
      loadAnalyticsData();
      loadPredictiveInsights();
    }
  }, [user?.id, filters]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const data = await advancedAnalyticsService.getAdvancedMetrics(user!.id, filters);
      setMetrics(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPredictiveInsights = async () => {
    try {
      const data = await advancedAnalyticsService.generatePredictiveInsights(user!.id);
      setInsights(data);
    } catch (error) {
      console.error('Failed to load predictive insights:', error);
    }
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      const downloadUrl = await advancedAnalyticsService.exportData(user!.id, format, filters);
      window.open(downloadUrl, '_blank');
      
      toast({
        title: "Export Started",
        description: `Your ${format.toUpperCase()} export is being prepared for download.`
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const applyDateFilter = () => {
    if (dateRange.from && dateRange.to) {
      setFilters(prev => ({
        ...prev,
        dateRange: {
          start: dateRange.from!.toISOString(),
          end: dateRange.to!.toISOString()
        }
      }));
    }
  };

  const clearFilters = () => {
    setFilters({
      dateRange: { start: '', end: '' },
      studentIds: [],
      subjectFilter: [],
      gradeLevel: []
    });
    setDateRange({});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Advanced Analytics</h2>
          <p className="text-muted-foreground">Comprehensive insights and predictive analytics</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <div className="space-y-2">
                <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => handleExport('csv')}>
                  Export as CSV
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => handleExport('excel')}>
                  Export as Excel
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => handleExport('pdf')}>
                  Export as PDF
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Date Range</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd")}`
                        ) : (
                          format(dateRange.from, "MMM dd, yyyy")
                        )
                      ) : (
                        "Select date range"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={{ from: dateRange.from, to: dateRange.to }}
                      onSelect={(range) => setDateRange(range || {})}
                      numberOfMonths={2}
                      className={cn("p-3 pointer-events-auto")}
                    />
                    <div className="p-3 border-t">
                      <Button size="sm" onClick={applyDateFilter} className="w-full">
                        Apply Date Filter
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Subject</Label>
                <Select onValueChange={(value) => setFilters(prev => ({ ...prev, subjects: [value] }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="math">Math</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="social_studies">Social Studies</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Performance Level</Label>
                <Select onValueChange={(value) => setFilters(prev => ({ ...prev, performanceLevels: [value] }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="Proficient">Proficient</SelectItem>
                    <SelectItem value="Developing">Developing</SelectItem>
                    <SelectItem value="Beginning">Beginning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button size="sm" onClick={loadAnalyticsData}>Apply Filters</Button>
              <Button size="sm" variant="outline" onClick={clearFilters}>Clear All</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{metrics.overview.totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Performance</p>
                <p className="text-2xl font-bold">{metrics.overview.averagePerformance.toFixed(1)}%</p>
              </div>
              <div className="flex items-center">
                {metrics.trends.performanceTrend === 'improving' ? (
                  <TrendingUp className="h-8 w-8 text-green-500" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-500" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">At-Risk Students</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.overview.atRiskStudents}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Top Performers</p>
                <p className="text-2xl font-bold text-green-600">{metrics.overview.topPerformers}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skill Gaps */}
            <Card>
              <CardHeader>
                <CardTitle>Top Skill Gaps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.insights.skillGaps.map((skill: string, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="font-medium">{skill}</span>
                      <Badge variant="destructive">Needs Focus</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Strength Areas */}
            <Card>
              <CardHeader>
                <CardTitle>Strength Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.insights.strengthAreas.map((skill: string, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="font-medium">{skill}</span>
                      <Badge variant="default">Strong</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommended Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.insights.recommendedActions.map((action: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <Target className="h-5 w-5 text-primary mt-0.5" />
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { month: 'Jan', score: 75 },
                      { month: 'Feb', score: 78 },
                      { month: 'Mar', score: 82 },
                      { month: 'Apr', score: 79 },
                      { month: 'May', score: 85 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Skill Mastery Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Skill Mastery Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        dataKey="value"
                        data={[
                          { name: 'Advanced', value: 25 },
                          { name: 'Proficient', value: 40 },
                          { name: 'Developing', value: 25 },
                          { name: 'Beginning', value: 10 }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label
                      >
                        {[].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Predictions */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Predictions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.predictions.riskPredictions.map((prediction: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{prediction.studentName}</span>
                        <Badge variant={prediction.riskLevel === 'high' ? 'destructive' : 'secondary'}>
                          {prediction.riskLevel} risk
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {prediction.riskFactors.map((factor: string, idx: number) => (
                          <div key={idx}>• {factor}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Growth Predictions */}
            <Card>
              <CardHeader>
                <CardTitle>Growth Predictions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.predictions.growthPredictions.map((prediction: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{prediction.studentName}</span>
                        <Badge variant="default">
                          {prediction.growthPotential} potential
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {prediction.nextSteps.map((step: string, idx: number) => (
                          <div key={idx}>• {step}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          {/* AI-Generated Insights */}
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.map((insight) => (
                  <div key={insight.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{insight.type.replace('_', ' ')}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {(insight.confidence * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                    <p className="font-medium mb-2">{insight.prediction}</p>
                    <div className="space-y-1">
                      {insight.recommendations.map((rec, index) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          • {rec}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};