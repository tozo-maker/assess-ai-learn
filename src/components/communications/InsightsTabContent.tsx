import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  AlertCircle, 
  CheckCircle2,
  Calendar,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  Plus,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { assessmentService } from '@/services/assessment-service';
import InsightMetricsDashboard from '@/components/insights/InsightMetricsDashboard';
import InteractiveInsightCard from '@/components/insights/InteractiveInsightCard';
import InsightFilters from '@/components/insights/InsightFilters';

interface Assessment {
  id: string;
  title: string;
  subject: string;
  assessment_date?: string;
}

interface StudentInsight {
  id: string;
  overall_summary?: string;
  strengths: string[];
  growth_areas: string[];
  recommendations: string[];
  patterns_observed: string[];
  created_at: string;
  assessments?: Assessment;
}

interface InsightsTabContentProps {
  insights: StudentInsight[];
  isLoading: boolean;
  onViewAssessments: () => void;
  studentId?: string;
  assessments?: Assessment[];
  onInsightsUpdated?: () => void;
}

const InsightsTabContent: React.FC<InsightsTabContentProps> = ({ 
  insights, 
  isLoading, 
  onViewAssessments,
  studentId,
  assessments = [],
  onInsightsUpdated
}) => {
  const { toast } = useToast();
  const [generatingAnalysis, setGeneratingAnalysis] = useState(false);
  const [selectedAssessments, setSelectedAssessments] = useState<string[]>([]);
  const [showAssessmentSelection, setShowAssessmentSelection] = useState(false);
  const [showAllSummaries, setShowAllSummaries] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'subject' | 'type'>('date');

  // Find assessments that don't have AI analysis yet
  const assessmentsWithoutAnalysis = assessments.filter(assessment => {
    if (!assessment || !assessment.id) {
      console.warn('Invalid assessment found:', assessment);
      return false;
    }
    
    const hasAnalysis = insights.some(insight => {
      if (!insight.assessments) return false;
      return insight.assessments.id === assessment.id;
    });
    
    return !hasAnalysis;
  });

  // Get unique subjects for filtering
  const availableSubjects = [...new Set(insights.map(insight => insight.assessments?.subject).filter(Boolean))];

  // Filter and sort insights
  const filteredInsights = insights.filter(insight => {
    const matchesSearch = !searchTerm || 
      insight.overall_summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insight.strengths.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
      insight.growth_areas.some(g => g.toLowerCase().includes(searchTerm.toLowerCase())) ||
      insight.recommendations.some(r => r.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSubject = selectedSubjects.length === 0 || 
      (insight.assessments && selectedSubjects.includes(insight.assessments.subject));
    
    return matchesSearch && matchesSubject;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'subject':
        return (a.assessments?.subject || '').localeCompare(b.assessments?.subject || '');
      case 'type':
        return a.assessments?.title.localeCompare(b.assessments?.title || '') || 0;
      default:
        return 0;
    }
  });

  // Aggregate insights for display
  const aggregatedInsights = {
    strengths: [...new Set(filteredInsights.flatMap(insight => insight.strengths || []))],
    growthAreas: [...new Set(filteredInsights.flatMap(insight => insight.growth_areas || []))],
    recommendations: [...new Set(filteredInsights.flatMap(insight => insight.recommendations || []))],
  };

  // Create aggregated summary data
  const getAggregatedSummary = () => {
    if (insights.length === 0) return null;

    const assessmentTitles = insights
      .filter(insight => insight.assessments)
      .map(insight => `${insight.assessments!.title} (${insight.assessments!.subject})`)
      .join(', ');

    const latestSummary = insights[0]?.overall_summary;
    const assessmentCount = insights.length;

    return {
      summary: latestSummary,
      basedOn: assessmentTitles,
      assessmentCount,
      hasMultiple: assessmentCount > 1
    };
  };

  const aggregatedSummary = getAggregatedSummary();

  const handleGenerateAnalysis = async (assessmentIds: string[]) => {
    if (!studentId || assessmentIds.length === 0) {
      console.error('Missing studentId or assessmentIds:', { studentId, assessmentIds });
      toast({
        title: "Error",
        description: "Missing student ID or no assessments selected.",
        variant: "destructive",
      });
      return;
    }

    setGeneratingAnalysis(true);
    let successCount = 0;
    let failureCount = 0;

    try {
      for (const assessmentId of assessmentIds) {
        try {
          await assessmentService.generateAssessmentAnalysis(assessmentId, studentId);
          successCount++;
        } catch (error) {
          console.error(`Failed to generate analysis for assessment ${assessmentId}:`, error);
          failureCount++;
        }
      }

      if (successCount > 0) {
        toast({
          title: "Analysis Generated",
          description: `Successfully generated AI analysis for ${successCount} assessment${successCount > 1 ? 's' : ''}${failureCount > 0 ? `. ${failureCount} failed.` : '.'}`,
        });
        
        if (onInsightsUpdated) {
          setTimeout(() => {
            onInsightsUpdated();
          }, 1000);
        }
      } else {
        toast({
          title: "Analysis Failed",
          description: "Failed to generate AI analysis. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error in analysis generation process:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while generating analysis.",
        variant: "destructive",
      });
    } finally {
      setGeneratingAnalysis(false);
      setSelectedAssessments([]);
      setShowAssessmentSelection(false);
    }
  };

  const handleGenerateAll = () => {
    const allAssessmentIds = assessmentsWithoutAnalysis.map(a => a.id).filter(Boolean);
    handleGenerateAnalysis(allAssessmentIds);
  };

  const handleGenerateSelected = () => {
    handleGenerateAnalysis(selectedAssessments);
  };

  const toggleAssessmentSelection = (assessmentId: string) => {
    setSelectedAssessments(prev => 
      prev.includes(assessmentId) 
        ? prev.filter(id => id !== assessmentId)
        : [...prev, assessmentId]
    );
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedSubjects([]);
    setSortBy('date');
  };

  const handleSubjectToggle = (subject: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const handleMarkAsAddressed = (item: string) => {
    toast({
      title: "Marked as Addressed",
      description: "This recommendation has been marked as addressed.",
    });
  };

  const handleCreateGoal = (item: string) => {
    toast({
      title: "Goal Creation",
      description: "Redirecting to create a goal based on this insight...",
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Loading insights...</p>
      </div>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <div className="text-center py-12">
        <Brain className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium mb-2">No insights available</h3>
        <p className="text-gray-500 mb-6">
          Generate AI insights from assessment data to get personalized learning recommendations.
        </p>
        
        {assessmentsWithoutAnalysis.length > 0 ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4 max-w-md mx-auto">
            <p className="text-blue-800 text-sm mb-4">
              Found {assessmentsWithoutAnalysis.length} assessment{assessmentsWithoutAnalysis.length > 1 ? 's' : ''} ready for AI analysis.
            </p>
            
            {!showAssessmentSelection ? (
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handleGenerateAll}
                  disabled={generatingAnalysis}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {generatingAnalysis ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Generate AI Insights for All
                </Button>
                
                {assessmentsWithoutAnalysis.length > 1 && (
                  <Button 
                    variant="outline"
                    onClick={() => setShowAssessmentSelection(true)}
                    disabled={generatingAnalysis}
                  >
                    Choose Specific Assessments
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-left">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Select assessments for AI analysis:</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {assessmentsWithoutAnalysis.map((assessment) => (
                      <div key={assessment.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={assessment.id}
                          checked={selectedAssessments.includes(assessment.id)}
                          onCheckedChange={() => toggleAssessmentSelection(assessment.id)}
                        />
                        <label htmlFor={assessment.id} className="text-sm text-blue-800 cursor-pointer">
                          {assessment.title} ({assessment.subject})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleGenerateSelected}
                    disabled={generatingAnalysis || selectedAssessments.length === 0}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {generatingAnalysis ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    Generate Selected ({selectedAssessments.length})
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => setShowAssessmentSelection(false)}
                    disabled={generatingAnalysis}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={onViewAssessments}>
            View Assessments
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Insights Metrics Dashboard */}
      <InsightMetricsDashboard 
        insights={insights}
        assessmentsWithoutAnalysis={assessmentsWithoutAnalysis.length}
      />

      {/* Generate More Analysis Button */}
      {assessmentsWithoutAnalysis.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Generate More Insights</p>
                <p className="text-sm text-blue-700">
                  {assessmentsWithoutAnalysis.length} more assessment{assessmentsWithoutAnalysis.length > 1 ? 's' : ''} can have AI analysis generated
                </p>
              </div>
              <Button 
                onClick={handleGenerateAll}
                disabled={generatingAnalysis}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {generatingAnalysis ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Generate Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comprehensive Summary */}
      {insights.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <Brain className="h-5 w-5" />
              {insights.length > 1 ? 'Comprehensive Learning Analysis' : 'Latest Assessment Summary'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-800 mb-3">{insights[0]?.overall_summary}</p>
            <div className="text-sm text-blue-600">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">
                  Based on {insights.length} assessment{insights.length > 1 ? 's' : ''}:
                </span>
                {insights.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllSummaries(!showAllSummaries)}
                    className="h-6 px-2 text-blue-600 hover:text-blue-700"
                  >
                    {showAllSummaries ? (
                      <>Hide Details <ChevronUp className="h-3 w-3 ml-1" /></>
                    ) : (
                      <>Show Details <ChevronDown className="h-3 w-3 ml-1" /></>
                    )}
                  </Button>
                )}
              </div>
              
              {!showAllSummaries ? (
                <p className="text-blue-600">
                  {insights.map(insight => `${insight.assessments?.title} (${insight.assessments?.subject})`).join(', ')}
                </p>
              ) : (
                <div className="space-y-2">
                  {insights.map((insight, index) => (
                    <div key={insight.id} className="p-2 bg-blue-100 rounded border-l-2 border-blue-400">
                      <div className="font-medium text-blue-800">
                        {insight.assessments?.title} ({insight.assessments?.subject})
                      </div>
                      {insight.overall_summary && (
                        <p className="text-sm text-blue-700 mt-1">{insight.overall_summary}</p>
                      )}
                      <div className="text-xs text-blue-600 mt-1">
                        {new Date(insight.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Learning Insights</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {(searchTerm || selectedSubjects.length > 0 || sortBy !== 'date') && (
            <Badge variant="secondary" className="ml-2">
              Active
            </Badge>
          )}
        </Button>
      </div>

      {showFilters && (
        <InsightFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedSubjects={selectedSubjects}
          onSubjectToggle={handleSubjectToggle}
          availableSubjects={availableSubjects}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onClearFilters={handleClearFilters}
        />
      )}

      {/* Interactive Insight Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <InteractiveInsightCard
          title="Strengths"
          items={aggregatedInsights.strengths}
          type="strength"
          onCreateGoal={handleCreateGoal}
        />
        
        <InteractiveInsightCard
          title="Growth Areas"
          items={aggregatedInsights.growthAreas}
          type="growth"
          onCreateGoal={handleCreateGoal}
        />
        
        <InteractiveInsightCard
          title="Recommendations"
          items={aggregatedInsights.recommendations}
          type="recommendation"
          onMarkAsAddressed={handleMarkAsAddressed}
          onCreateGoal={handleCreateGoal}
        />
      </div>

      {/* Assessment History */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Analysis History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredInsights.map((insight, index) => (
              <div key={insight.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{insight.assessments?.title}</h4>
                  <span className="text-sm text-gray-500">
                    {new Date(insight.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Subject: {insight.assessments?.subject}
                </div>
                {insight.patterns_observed?.length > 0 && (
                  <div className="text-sm">
                    <strong>Patterns:</strong> {insight.patterns_observed.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InsightsTabContent;
