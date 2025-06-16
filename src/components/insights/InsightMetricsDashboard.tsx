
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Calendar,
  BarChart3
} from 'lucide-react';

interface InsightMetric {
  id: string;
  overall_summary?: string;
  strengths: string[];
  growth_areas: string[];
  recommendations: string[];
  created_at: string;
  assessments?: {
    id: string;
    title: string;
    subject: string;
  };
}

interface InsightMetricsDashboardProps {
  insights: InsightMetric[];
  assessmentsWithoutAnalysis: number;
}

const InsightMetricsDashboard: React.FC<InsightMetricsDashboardProps> = ({
  insights,
  assessmentsWithoutAnalysis
}) => {
  const totalInsights = insights.length;
  const totalStrengths = new Set(insights.flatMap(i => i.strengths || [])).size;
  const totalGrowthAreas = new Set(insights.flatMap(i => i.growth_areas || [])).size;
  const totalRecommendations = new Set(insights.flatMap(i => i.recommendations || [])).size;
  const lastAnalysisDate = insights.length > 0 
    ? new Date(insights[0].created_at).toLocaleDateString()
    : 'None';

  const completionRate = assessmentsWithoutAnalysis === 0 && totalInsights > 0 
    ? 100 
    : totalInsights > 0 
    ? Math.round((totalInsights / (totalInsights + assessmentsWithoutAnalysis)) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Analysis Progress</p>
              <p className="text-2xl font-bold text-blue-900">{completionRate}%</p>
              <p className="text-xs text-blue-600">{totalInsights} of {totalInsights + assessmentsWithoutAnalysis} assessments</p>
            </div>
            <div className="p-2 bg-blue-200 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-700" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Strengths Found</p>
              <p className="text-2xl font-bold text-green-900">{totalStrengths}</p>
              <p className="text-xs text-green-600">unique strengths</p>
            </div>
            <div className="p-2 bg-green-200 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-700" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Growth Areas</p>
              <p className="text-2xl font-bold text-orange-900">{totalGrowthAreas}</p>
              <p className="text-xs text-orange-600">areas identified</p>
            </div>
            <div className="p-2 bg-orange-200 rounded-lg">
              <Target className="h-5 w-5 text-orange-700" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Recommendations</p>
              <p className="text-2xl font-bold text-purple-900">{totalRecommendations}</p>
              <p className="text-xs text-purple-600">actionable items</p>
            </div>
            <div className="p-2 bg-purple-200 rounded-lg">
              <Brain className="h-5 w-5 text-purple-700" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InsightMetricsDashboard;
