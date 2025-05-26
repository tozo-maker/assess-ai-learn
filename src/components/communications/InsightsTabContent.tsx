
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
  ChevronUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { assessmentService } from '@/services/assessment-service';

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

  // Find assessments that don't have AI analysis yet with improved filtering
  const assessmentsWithoutAnalysis = assessments.filter(assessment => {
    if (!assessment || !assessment.id) {
      console.warn('Invalid assessment found:', assessment);
      return false;
    }
    
    const hasAnalysis = insights.some(insight => {
      if (!insight.assessments) return false;
      return insight.assessments.id === assessment.id;
    });
    
    console.log(`Assessment ${assessment.id} (${assessment.title}) has analysis:`, hasAnalysis);
    return !hasAnalysis;
  });

  console.log('Insights tab - Total assessments:', assessments.length);
  console.log('Insights tab - Assessments without analysis:', assessmentsWithoutAnalysis.length);
  console.log('Insights tab - Current insights:', insights.length);

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

    console.log('Starting analysis generation for:', { studentId, assessmentIds });
    setGeneratingAnalysis(true);
    let successCount = 0;
    let failureCount = 0;
    const errors: string[] = [];

    try {
      for (const assessmentId of assessmentIds) {
        try {
          console.log(`Generating analysis for assessment ${assessmentId} and student ${studentId}`);
          const result = await assessmentService.generateAssessmentAnalysis(assessmentId, studentId);
          console.log('Analysis generation result:', result);
          successCount++;
        } catch (error) {
          console.error(`Failed to generate analysis for assessment ${assessmentId}:`, error);
          failureCount++;
          errors.push(`Assessment ${assessmentId}: ${error.message || 'Unknown error'}`);
        }
      }

      if (successCount > 0) {
        toast({
          title: "Analysis Generated",
          description: `Successfully generated AI analysis for ${successCount} assessment${successCount > 1 ? 's' : ''}${failureCount > 0 ? `. ${failureCount} failed.` : '.'}`,
        });
        
        // Refresh the insights data
        if (onInsightsUpdated) {
          setTimeout(() => {
            onInsightsUpdated();
          }, 1000); // Small delay to allow backend processing
        }
      } else {
        toast({
          title: "Analysis Failed",
          description: failureCount > 0 && errors.length > 0 
            ? `All ${failureCount} attempts failed. First error: ${errors[0]}`
            : "Failed to generate AI analysis. Please try again.",
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
    console.log('Generating analysis for all assessments:', allAssessmentIds);
    handleGenerateAnalysis(allAssessmentIds);
  };

  const handleGenerateSelected = () => {
    console.log('Generating analysis for selected assessments:', selectedAssessments);
    handleGenerateAnalysis(selectedAssessments);
  };

  const toggleAssessmentSelection = (assessmentId: string) => {
    setSelectedAssessments(prev => 
      prev.includes(assessmentId) 
        ? prev.filter(id => id !== assessmentId)
        : [...prev, assessmentId]
    );
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
        <p className="text-gray-500 mb-4">
          Insights will be generated after the student completes assessments and AI analysis is performed.
        </p>
        
        {assessmentsWithoutAnalysis.length > 0 ? (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-800 text-sm mb-3">
                Found {assessmentsWithoutAnalysis.length} assessment{assessmentsWithoutAnalysis.length > 1 ? 's' : ''} that can have AI analysis generated.
              </p>
              
              {!showAssessmentSelection ? (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    onClick={handleGenerateAll}
                    disabled={generatingAnalysis}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {generatingAnalysis ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    Generate AI Analysis for All
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
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Generate Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comprehensive Assessment Summary */}
      {aggregatedSummary && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <Brain className="h-5 w-5" />
              {aggregatedSummary.hasMultiple ? 'Comprehensive Learning Analysis' : 'Latest Assessment Summary'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-800 mb-3">{aggregatedSummary.summary}</p>
            <div className="text-sm text-blue-600">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">
                  Based on {aggregatedSummary.assessmentCount} assessment{aggregatedSummary.assessmentCount > 1 ? 's' : ''}:
                </span>
                {aggregatedSummary.hasMultiple && (
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
                <p className="text-blue-600">{aggregatedSummary.basedOn}</p>
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

      {/* Strengths */}
      {insights.some(insight => insight.strengths?.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-700 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {Array.from(new Set(
                insights.flatMap(insight => insight.strengths || [])
              )).map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-green-800">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Growth Areas */}
      {insights.some(insight => insight.growth_areas?.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-700 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Areas for Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {Array.from(new Set(
                insights.flatMap(insight => insight.growth_areas || [])
              )).map((area, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span className="text-orange-800">{area}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {insights.some(insight => insight.recommendations?.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-purple-700 flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from(new Set(
                insights.flatMap(insight => insight.recommendations || [])
              )).map((recommendation, index) => (
                <div key={index} className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <p className="text-purple-800">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assessment History */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Analysis History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div key={insight.id} className="border rounded-lg p-4">
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
